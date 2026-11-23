/* Local editor. Values remain staged until the user explicitly saves or applies. */
'use strict';

(() => {
  const hosted = window.ExtractionHosted || null;
  const $ = id => document.getElementById(id);
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const navLabel = value => String(value ?? '').split(/(·\s*[^\s·]+)/u).map((part,index) => index % 2 ? `<span class="nav-label-unit">${escape(part)}</span>` : escape(part)).join('');
  const count = value => Number(value || 0).toLocaleString('ko-KR');
  const equal = (a, b) => typeof a === typeof b && a === b;
  const basename = path => String(path || '').split(/[\\/]/).pop();
  const displayValue = value => typeof value === 'boolean' ? (value ? 'true · 켜짐' : 'false · 꺼짐') : String(value ?? '');
  const timeLabel = value => { if (!value) return ''; const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ko-KR', {month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}); };
  const state = { catalog:null, datasets:[], rows:[], rowMap:new Map(), saved:{}, baseline:{}, edits:{}, selectedDataset:null, selectedRow:null, page:1, pageSize:50, undo:[], redo:[], busy:false, review:null, invalid:new Map(), inputSession:null, toastTimer:null };
  let confirmResolve = null;

  async function api(path, body) {
    if (hosted) return hosted.request(path, body);
    if (document.body.dataset.mode === 'hosted') throw new Error('웹 편집기를 불러오지 못했습니다. 새로고침해 주세요.');
    const options = body === undefined ? {} : { method:'POST', headers:{'Content-Type':'application/json','X-Editor-Token':state.catalog?.csrfToken || ''}, body:JSON.stringify(body) };
    const response = await fetch(path, {cache:'no-store', ...options});
    let result;
    try { result = await response.json(); } catch (_) { throw new Error(`편집기 서버 응답을 읽지 못했습니다. (${response.status})`); }
    if (!response.ok || result.ok === false) {
      const error = new Error(result.error || result.message || `요청을 처리하지 못했습니다. (${response.status})`);
      error.details = result.errors || [];
      error.status = response.status;
      throw error;
    }
    return result;
  }
  function toast(message, error=false) {
    clearTimeout(state.toastTimer);
    $('toast').textContent = message;
    $('toast').className = `toast${error ? ' error' : ''}`;
    $('toast').hidden = false;
    state.toastTimer = setTimeout(() => { $('toast').hidden = true; }, error ? 7000 : 4000);
  }
  function showNotice(message, error=false, action) {
    const notice = $('notice');
    notice.className = `notice${error ? ' error' : ''}`;
    notice.replaceChildren(document.createTextNode(message));
    if (action) { const button = document.createElement('button'); button.textContent = action.label; button.addEventListener('click', action.run); notice.appendChild(button); }
    else { const button = document.createElement('button'); button.textContent = '×'; button.setAttribute('aria-label','알림 닫기'); button.addEventListener('click',() => notice.hidden = true); notice.appendChild(button); }
    notice.hidden = false;
  }
  function errorMessage(error) {
    const extra = (error.details || []).slice(0, 4).map(entry => typeof entry === 'string' ? entry : entry.message).filter(Boolean).join(' / ');
    return error.message + (extra ? ` — ${extra}` : '');
  }
  function setBusy(value) { state.busy = value; renderStatus(); }
  function currentValue(row) { return own(state.edits,row.id) ? state.edits[row.id] : state.saved[row.id]; }
  function isDirty(row) { return !equal(currentValue(row),state.saved[row.id]); }
  function isPending(row) { return !equal(currentValue(row),state.baseline[row.id]); }
  function editable(row) { return row.editable !== false && (!hosted || state.catalog?.authenticated === true && !state.syncActive); }
  function dirtyRows() { return state.rows.filter(isDirty); }
  function pendingRows() { return state.rows.filter(isPending); }
  function requestEdits() {
    const edits = {};
    state.rows.forEach(row => { if (editable(row) && (isPending(row) || isDirty(row))) edits[row.id] = currentValue(row); });
    return edits;
  }
  function payload() { return {revision:state.catalog?.revision, edits:requestEdits()}; }
  function transferEdits() { return Object.fromEntries(state.rows.filter(row => row.editable !== false && isPending(row)).map(row => [row.id,currentValue(row)])); }
  function draftKey() { return `extraction-data-editor-draft:${state.catalog?.projectRoot || location.host}`; }
  function storeDraft() {
    try {
      if (Object.keys(state.edits).length) localStorage.setItem(draftKey(),JSON.stringify({revision:state.catalog.revision,edits:state.edits,at:new Date().toISOString()}));
      else localStorage.removeItem(draftKey());
    } catch (_) { /* Storage may be disabled; saving through the server still works. */ }
  }
  function pushEdits(values,{render=true,history=true,clearInvalid=true}={}) {
    const next = {...state.edits};
    for (const [id,value] of Object.entries(values)) {
      const row = state.rowMap.get(id);
      if (!row || !editable(row)) continue;
      if (equal(value,state.saved[id])) delete next[id]; else next[id] = value;
    }
    if (JSON.stringify(next) === JSON.stringify(state.edits)) return false;
    if (history) state.undo.push({...state.edits});
    if (state.undo.length > 100) state.undo.shift();
    state.redo = [];
    state.edits = next;
    if (clearInvalid) state.invalid.clear();
    storeDraft();
    if (render) renderAll(false); else renderStatus();
    return true;
  }
  function editFromInput(input,{commit=true}={}) {
    const row = state.rowMap.get(input.dataset.id);
    if (!row || !editable(row)) return;
    let value = input.value;
    if (row.type === 'number') {
      if (!value.trim() || !Number.isFinite(Number(value))) {
        input.classList.add('invalid'); input.setAttribute('aria-invalid','true');
        state.invalid.set(row.id,'유한한 숫자를 입력해 주세요.');
        if (commit) toast('숫자 값을 확인해 주세요. 빈 값은 저장할 수 없습니다.',true);
        renderStatus(); return;
      }
      value = Number(value);
    } else if (row.type === 'boolean') value = value === 'true';
    const wasInvalid = state.invalid.has(row.id);
    state.invalid.delete(row.id);
    input.classList.remove('invalid'); input.removeAttribute('aria-invalid');
    // Stage on input without replacing the focused control. Native number inputs
    // need their own DOM state while the user types a minus sign or decimal.
    if (!state.inputSession || state.inputSession.id !== row.id) state.inputSession = {id:row.id,history:false};
    const changed = pushEdits({[row.id]:value},{render:false,history:!state.inputSession.history,clearInvalid:false});
    if (changed) state.inputSession.history = true;
    if (commit) state.inputSession = null;
    // Keep navigation, rows, and prospective click targets mounted on blur.
    // Input events already stage the value; an unchanged blur is a UI no-op.
    if (changed || wasInvalid) { syncEditedRow(row,input); if (!changed) renderStatus(); }
  }
  function undo() {
    if (!state.undo.length || state.busy) return;
    state.redo.push({...state.edits}); state.edits = state.undo.pop(); state.invalid.clear(); storeDraft(); renderAll(false);
  }
  function redo() {
    if (!state.redo.length || state.busy) return;
    state.undo.push({...state.edits}); state.edits = state.redo.pop(); state.invalid.clear(); storeDraft(); renderAll(false);
  }
  function currentDataset() { return state.datasets.find(dataset => dataset.id === state.selectedDataset); }
  function baseRows() { return $('global-search').checked || !state.selectedDataset ? state.rows : (currentDataset()?.rows || []); }
  function filteredRows() {
    const words = $('search').value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const scope = $('scope-filter').value, source = $('source-filter').value;
    return baseRows().filter(row => {
      if (scope && String(row.scope || '') !== scope) return false;
      if (source && String(row.source || '') !== source) return false;
      if ($('changes-only').checked && !isPending(row) && !isDirty(row)) return false;
      if (!words.length) return true;
      const text = [row.entity,row.field,row.label,row.id,row.scope,row.note,row.source,row._datasetLabel,...Object.values(row._impact || {}),currentValue(row)].join(' ').toLocaleLowerCase();
      return words.every(word => text.includes(word));
    });
  }
  function populateFilters() {
    for (const [id,key,label] of [['scope-filter','scope','모든 범위'],['source-filter','source','모든 원본']]) {
      const filter = $(id), previous = filter.value;
      const values = [...new Set(baseRows().map(row => String(row[key] || '')).filter(Boolean))].sort((a,b) => a.localeCompare(b,'ko'));
      filter.innerHTML = `<option value="">${label}</option>` + values.map(value => `<option value="${escape(value)}" title="${escape(value)}">${escape(key === 'source' ? basename(value) : value)}</option>`).join('');
      if (values.includes(previous)) filter.value = previous;
    }
  }
  function renderNavigation() {
    const grouped = new Map();
    state.datasets.forEach(dataset => { const group = dataset.group || '기타 데이터'; if (!grouped.has(group)) grouped.set(group,[]); grouped.get(group).push(dataset); });
    $('dataset-nav').innerHTML = [...grouped].map(([group,datasets],index) => `<section class="dataset-group"><div class="dataset-group-label"><span class="dataset-group-name">${navLabel(group)}</span><span class="dataset-group-number">${String(index+1).padStart(2,'0')}</span></div>${datasets.map(dataset => `<button class="dataset-button ${state.selectedDataset === dataset.id ? 'selected' : ''}" data-dataset="${escape(dataset.id)}" title="${escape(dataset.description || dataset.label)}"><span class="nav-icon" aria-hidden="true">${/적|전투|보스/.test(dataset.label) ? '◇' : /경제|상점|거래/.test(dataset.label) ? '▤' : /플레이어|성장/.test(dataset.label) ? '◈' : '▧'}</span><span>${navLabel(dataset.label)}</span><span class="dataset-count">${count(dataset.rows.length)}</span></button>`).join('')}</section>`).join('');
    $('all-data').classList.toggle('selected',!state.selectedDataset);
    $('dataset-total').textContent = count(state.datasets.length);
    $('row-total').textContent = count(state.rows.length);
  }
  function renderHeading() {
    const dataset = currentDataset(), rows = dataset?.rows || state.rows;
    $('dataset-title').textContent = dataset?.label || '전체 데이터';
    $('dataset-group').textContent = dataset?.group || '프로젝트 전체';
    $('dataset-description').textContent = dataset?.description || '카테고리별 게임 수치를 한곳에서 검색하고 비교합니다.';
    $('current-count').textContent = count(rows.length);
    $('source-count').textContent = count(new Set(rows.map(row => row.source).filter(Boolean)).size);
    const sourceCount = state.catalog?.coverage?.sources;
    $('coverage-summary').innerHTML = `<span class="live-dot"></span>${typeof sourceCount === 'number' ? `${count(sourceCount)}개 원본 연결` : '실제 프로젝트 데이터'}<br><span style="color:#55718f">${count(state.rows.length)}개 값 · ${count(state.datasets.length)}개 분류</span>`;
  }
  function valueControl(row, detail=false) {
    const value = currentValue(row), label = detail ? '편집 값' : `${row.entity} ${row.field}`;
    const attrs = `data-id="${escape(row.id)}" aria-label="${escape(label)}" class="${detail ? 'detail-value' : 'value-input'}${row.type === 'boolean' ? ' boolean' : ''}${state.invalid.has(row.id) ? ' invalid' : ''}"`;
    if (row.type === 'boolean' && editable(row)) return `<select ${attrs}><option value="true" ${value === true ? 'selected' : ''}>true · 켜짐</option><option value="false" ${value === false ? 'selected' : ''}>false · 꺼짐</option></select>`;
    return `<input ${attrs} type="${row.type === 'number' ? 'number' : 'text'}" ${row.type === 'number' ? 'step="any"' : ''} value="${escape(value)}" ${editable(row) ? '' : 'readonly'} spellcheck="false">`;
  }
  function renderTable() {
    const rows = filteredRows(), pages = Math.max(1,Math.ceil(rows.length / state.pageSize));
    state.page = Math.min(state.page,pages);
    const offset = (state.page-1) * state.pageSize, visible = rows.slice(offset,offset+state.pageSize);
    $('data-rows').innerHTML = visible.map((row,index) => `<tr data-row="${escape(row.id)}" class="${state.selectedRow === row.id ? 'selected ' : ''}${isPending(row) || isDirty(row) ? 'changed' : ''}" tabindex="0" aria-label="${escape(row.entity + ' ' + (row.label || row.field))}" ${state.selectedRow === row.id ? 'aria-selected="true"' : ''}><td class="row-number">${offset+index+1}</td><td title="${escape(row.entity)}"><span class="entity-name">${escape(row._impact?.target || row.entity)}</span><span class="entity-id">${escape(row._datasetLabel)}</span></td><td title="${escape(row.label || row.field)}"><span class="field-label">${escape(row._impact?.title || row.label || row.field)}</span><span class="field-key">${escape(row.field)}</span>${row._impact ? `<span class="impact-inline" title="${escape(row._impact.summary)}">${escape(row._impact.stat)} · ${escape(row._impact.role)}</span>` : ''}</td><td>${valueControl(row)}</td><td class="unit-text">${escape(row.unit || '—')}</td><td><span class="scope-tag" title="${escape(row.scope)}">${escape(row.scope || '공통')}</span></td><td class="source-cell" title="${escape(row.source)}${row.line ? ':'+row.line : ''}">${escape(basename(row.source))}${row.line ? ':'+row.line : ''}</td><td><span class="row-status ${!editable(row) ? 'locked' : isDirty(row) ? 'dirty' : isPending(row) ? 'pending' : ''}">${!editable(row) ? '읽기 전용' : isDirty(row) ? '● 미저장' : isPending(row) ? '● 반영 대기' : '게시 기준'}</span></td></tr>`).join('');
    $('empty-state').hidden = rows.length > 0 || !state.catalog;
    $('results-label').textContent = rows.length ? `${count(offset+1)}–${count(Math.min(offset+state.pageSize,rows.length))} / ${count(rows.length)}개 항목` : '0개 항목';
    $('page-label').textContent = `${state.page} / ${pages}`;
    $('previous-page').disabled = state.page <= 1;
    $('next-page').disabled = state.page >= pages;
  }
  function selectRow(id) {
    state.selectedRow = id;
    document.querySelectorAll('tr[data-row]').forEach(row => { const selected = row.dataset.row === id; row.classList.toggle('selected',selected); row.setAttribute('aria-selected',String(selected)); });
    renderDetail();
  }
  function impactHTML(info) {
    return `<section class="impact-card${info.valueReview ? ' impact-value-review' : ''}" aria-label="이 값이 영향을 주는 대상"><div class="impact-card-heading"><strong>${escape(info.stat)}</strong><span>${escape(info.role)}</span></div><p class="impact-target">영향 대상 · ${escape(info.target)}</p><p>${escape(info.summary)}</p><p class="impact-effect">${escape(info.effect)}</p><p class="impact-caution">${escape(info.caution)}</p><details class="impact-context"><summary>${escape(info.certainty)} · 사용 맥락</summary><p>${escape(info.context || '')}</p></details></section>`;
  }
  function renderDetail() {
    const row = state.rowMap.get(state.selectedRow), area = $('detail-content');
    if (!row) { area.innerHTML = '<div class="detail-placeholder"><span>◫</span><p>목록에서 항목을 선택하면<br>값과 적용 위치를 확인할 수 있습니다.</p></div>'; return; }
    const changed = isPending(row) || isDirty(row);
    area.innerHTML = `<div class="detail-category">${escape(row._datasetLabel)} <span style="color:#536f8d">/ ${escape(row.scope || '공통')}</span></div><h3>${escape(row._impact?.title || row.entity)}</h3><div class="detail-field-key">${escape(row.field)}</div><div class="detail-section detail-value-section"><label for="detail-value">현재 값${editable(row) ? '' : ' · 읽기 전용'}</label><div class="detail-value-wrap">${valueControl(row,true)}<span>${escape(row.unit || '')}</span></div><div id="detail-comparison" class="detail-comparison" ${changed ? '' : 'hidden'}><div><span>게시 기준</span><strong id="detail-baseline">${escape(displayValue(state.baseline[row.id]))}</strong></div><div><span>웹 저장값</span><strong id="detail-saved">${escape(displayValue(state.saved[row.id]))}</strong></div><div><span>현재 편집값</span><strong id="detail-current">${escape(displayValue(currentValue(row)))}</strong></div></div><button id="detail-reset-button" class="detail-reset" data-reset-row="${escape(row.id)}" ${isDirty(row) ? '' : 'hidden'}>이 항목을 웹 저장값으로 되돌리기 ↶</button></div>${row._impact ? impactHTML(row._impact) : ''}${!editable(row) ? '<div class="detail-lock">이 항목은 현재 조회 전용입니다. 연관 설정과 구조를 함께 바꿔야 하므로 이 화면에서 수정할 수 없습니다.</div>' : ''}<div class="detail-section"><div class="detail-section-title">항목 정보</div><dl class="detail-meta"><dt>항목 키</dt><dd><code>${escape(row.field)}</code></dd><dt>값 종류</dt><dd>${row.type === 'number' ? '숫자' : row.type === 'boolean' ? '켜짐 / 꺼짐' : '문자열'}</dd><dt>적용 범위</dt><dd>${escape(row.scope || '공통')}</dd><dt>편집 상태</dt><dd id="detail-edit-status" class="${changed ? 'amber' : ''}">${isDirty(row) ? '미저장 변경' : isPending(row) ? '웹 저장됨 · Unity 반영 대기' : '게시 기준과 일치'}</dd></dl></div>${row.note ? `<div class="detail-section"><div class="detail-section-title">설명 및 주의 사항</div><p class="detail-note">${escape(row.note)}</p></div>` : ''}<div class="detail-section"><div class="detail-section-title">원본 위치</div><dl class="detail-meta"><dt>파일</dt><dd><code>${escape(row.source || '—')}</code></dd><dt>행</dt><dd>${row.line ? count(row.line) : '—'}</dd></dl></div>`;
    const input = area.querySelector('[data-id]');
    const lock = area.querySelector('.detail-lock');
    if (hosted && lock && row.editable !== false) lock.textContent = state.syncActive ? 'Unity 반영 결과를 기다리는 동안 추가 편집을 잠시 잠급니다.' : '열람 전용 게시본입니다. 값 수정은 프로젝트 PC의 로컬 편집기에서 합니다.';
    if (input) input.id = 'detail-value';
  }
  function syncEditedRow(row,sourceInput) {
    const changed = isPending(row) || isDirty(row);
    const tableRow = [...$('data-rows').children].find(element => element.dataset.row === row.id);
    if (tableRow) {
      tableRow.classList.toggle('changed',changed);
      const input = tableRow.querySelector('[data-id]');
      if (input && input !== sourceInput && input !== document.activeElement) input.value = String(currentValue(row));
      const status = tableRow.querySelector('.row-status');
      status.className = `row-status ${!editable(row) ? 'locked' : isDirty(row) ? 'dirty' : isPending(row) ? 'pending' : ''}`;
      status.textContent = !editable(row) ? '읽기 전용' : isDirty(row) ? '● 미저장' : isPending(row) ? '● 반영 대기' : '게시 기준';
    }
    if (state.selectedRow === row.id && $('detail-value')) {
      const input = $('detail-value');
      if (input !== sourceInput && input !== document.activeElement) input.value = String(currentValue(row));
      $('detail-comparison').hidden = !changed;
      $('detail-baseline').textContent = displayValue(state.baseline[row.id]);
      $('detail-saved').textContent = displayValue(state.saved[row.id]);
      $('detail-current').textContent = displayValue(currentValue(row));
      $('detail-reset-button').hidden = !isDirty(row);
      $('detail-edit-status').className = changed ? 'amber' : '';
      $('detail-edit-status').textContent = isDirty(row) ? '미저장 변경' : isPending(row) ? '웹 저장됨 · Unity 반영 대기' : '게시 기준과 일치';
    }
  }
  function renderStatus() {
    const local = dirtyRows().length, pending = pendingRows().length, ready = !!state.catalog && !state.busy && !state.syncActive, invalid = state.invalid.size;
    $('pending-count').textContent = count(pending);
    $('undo-button').disabled = !ready || !state.undo.length;
    $('redo-button').disabled = !ready || !state.redo.length;
    $('reset-button').disabled = !ready || !local;
    $('validate-button').disabled = !ready;
    $('save-button').disabled = !ready || !local || !!invalid;
    $('review-button').disabled = !ready || (!pending && !local) || !!invalid;
    $('import-button').disabled = !ready || !currentDataset();
    $('export-button').disabled = !ready || !currentDataset();
    $('reload-button').disabled = state.busy;
    $('transfer-button').disabled = !state.catalog || state.busy;
    $('transfer-export-button').hidden = !hosted;
    $('transfer-import-button').hidden = !!hosted;
    $('transfer-login-button').hidden = !hosted || state.catalog?.authenticated === true;
    const transferable = Object.keys(transferEdits()).length;
    $('transfer-export-button').disabled = !state.catalog || state.busy || !!invalid || !transferable || state.catalog.authenticated !== true;
    $('transfer-import-button').disabled = !state.catalog || state.busy;
    $('transfer-summary').textContent = hosted ? state.catalog?.authenticated ? `${count(transferable)}개 변경값 · 웹 저장이나 Unity 반영 요청 없이 CSV만 내려받습니다.` : '편집 잠금을 해제하면 변경값을 CSV로 내려받을 수 있습니다.' : '카테고리를 따로 고를 필요 없이 CSV 안의 변경값을 모아서 비교합니다. 원본 값이 달라졌다면 반영 전에 충돌을 표시합니다.';
    if (hosted) {
      const unlocked = state.catalog?.authenticated === true;
      $('auth-button').textContent = unlocked ? '편집 잠금' : '편집 잠금 해제';
      $('password-button').hidden = !unlocked;
      $('validate-button').disabled = !ready || !unlocked;
      $('import-button').disabled = !ready || !unlocked || !currentDataset();
      if (!unlocked) for (const id of ['save-button','review-button','reset-button','undo-button','redo-button']) $(id).disabled = true;
    }
    $('save-count').textContent = local ? count(local) : '';
    $('save-indicator').className = 'save-indicator' + (invalid ? ' error' : local || pending ? ' dirty' : '');
    if (state.busy) { $('save-status').textContent = '처리 중…'; $('save-caption').textContent = '작업이 끝날 때까지 기다려 주세요.'; }
    else if (invalid) { $('save-status').textContent = `입력 확인 필요 ${count(invalid)}개`; $('save-caption').textContent = '입력 중인 숫자를 완성하면 저장하거나 검토할 수 있습니다.'; }
    else if (state.catalog) {
      $('save-status').textContent = local ? `미저장 변경 ${count(local)}개` : pending ? `웹 저장됨 · Unity 반영 대기 ${count(pending)}개` : '모든 값이 게시 기준과 일치합니다';
      $('save-caption').textContent = local ? '웹에 저장하거나 변경 비교에서 Unity 반영을 요청하세요.' : state.catalog.savedAt ? `마지막 웹 저장 ${timeLabel(state.catalog.savedAt)}` : '웹 저장과 게임 반영을 구분하여 관리합니다.';
      if (hosted && !state.catalog.authenticated) {
        $('save-status').textContent = '열람 전용 게시본';
        $('save-caption').textContent = '검색·비교·CSV 내려받기만 가능합니다. 값 수정은 프로젝트 PC의 로컬 편집기에서 합니다.';
      }
    }
  }
  function renderAll(filters=true) {
    renderNavigation(); renderHeading();
    if (filters) populateFilters();
    renderTable(); renderDetail(); renderStatus();
  }
  function selectDataset(id) {
    state.selectedDataset = id; state.page = 1; state.selectedRow = null;
    $('scope-filter').value = ''; $('source-filter').value = '';
    const rows = id ? (state.datasets.find(dataset => dataset.id === id)?.rows || []) : state.rows;
    if (rows.length) state.selectedRow = rows[0].id;
    renderAll(); $('table-container').scrollTop = 0;
  }
  async function loadCatalog({restoreDraft=false}={}) {
    const result = await api('/api/catalog');
    if (!Array.isArray(result.datasets)) throw new Error('데이터 카탈로그 형식이 올바르지 않습니다.');
    state.catalog = result;
    state.datasets = result.datasets.map(dataset => ({...dataset,rows:(dataset.rows || []).map(row => ({...row,_datasetId:dataset.id,_datasetLabel:dataset.label,_impact:window.ExtractionImpactGuide?.describe(row,dataset)}))}));
    state.rows = state.datasets.flatMap(dataset => dataset.rows);
    state.rowMap = new Map(state.rows.map(row => [row.id,row]));
    state.saved = {}; state.baseline = {};
    state.rows.forEach(row => { state.saved[row.id] = own(result.values,row.id) ? result.values[row.id] : row.value; state.baseline[row.id] = own(result.appliedValues,row.id) ? result.appliedValues[row.id] : row.value; });
    state.edits = {}; state.undo = []; state.redo = []; state.invalid.clear();
    if (!state.selectedDataset || !state.datasets.some(dataset => dataset.id === state.selectedDataset)) state.selectedDataset = state.datasets.find(dataset => dataset.label === '플레이어 실제 설정')?.id || state.datasets.find(dataset => /플레이어/.test(dataset.label))?.id || state.datasets[0]?.id || null;
    if (!state.rowMap.has(state.selectedRow)) state.selectedRow = (currentDataset()?.rows || state.rows)[0]?.id || null;
    $('initial-error').hidden = true;
    $('connection').className = 'connection'; $('connection').innerHTML = '<i></i>열람 전용'; $('connection').title = "GitHub Pages 정적 게시본 · 2026-10-23 추출 자료 기준";
    $('project-path').textContent = result.projectRoot || '웹 게시본'; $('project-path').title = result.projectRoot || '';
    renderAll();
    const coverage = result.coverage || {}, sourceChanges = coverage.sourceChanges || [], conflicts = coverage.conflicts || [];
    if (sourceChanges.length || conflicts.length || coverage.orphanEdits) {
      const messages = [];
      if (sourceChanges.length) messages.push(`편집기 실행 후 원본 ${count(sourceChanges.length)}개 파일이 바뀌었습니다. '원본 다시 읽기'로 최신 원본을 읽은 뒤 변경을 검토하세요.`);
      if (conflicts.length) messages.push(`원본 충돌 ${count(conflicts.length)}개: ${conflicts.slice(0,2).map(item => item.message).join(' / ')}`);
      if (coverage.orphanEdits) messages.push(`연결할 수 없는 기존 편집 ${count(coverage.orphanEdits)}개가 있습니다.`);
      showNotice(messages.join(' '),true);
    } else if (Array.isArray(result.notes) && result.notes.length) showNotice(result.notes.join(' '));
    else $('notice').hidden = true;
    if (restoreDraft) {
      try {
        const draft = JSON.parse(localStorage.getItem(draftKey()) || 'null');
        if (draft && Object.keys(draft.edits || {}).length) {
          if (draft.revision === result.revision) showNotice(`${timeLabel(draft.at)}에 남긴 미저장 변경이 있습니다.`,false,{label:'임시 변경 복원',run:() => { pushEdits(draft.edits); $('notice').hidden = true; toast('임시 변경을 복원했습니다.'); }});
          else showNotice('이전 미저장 변경의 기준 버전이 현재 데이터와 다릅니다. 자동으로 복원하지 않았습니다. 필요한 값은 저장된 CSV와 비교해 주세요.');
        }
      } catch (_) { /* A corrupt local draft never replaces catalog values. */ }
    }
  }
  function confirmation(title,message,label='계속') {
    $('confirm-title').textContent = title; $('confirm-message').textContent = message; $('confirm-yes').textContent = label;
    $('confirm-dialog').showModal();
    return new Promise(resolve => { confirmResolve = resolve; });
  }
  function settleConfirmation(value) { $('confirm-dialog').close(); if (confirmResolve) { confirmResolve(value); confirmResolve = null; } }
  function localValidation() {
    const errors = [...state.invalid].map(([id,message]) => ({id,message}));
    state.rows.forEach(row => {
      if (!editable(row)) return;
      const value = currentValue(row);
      if (row.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) errors.push({id:row.id,message:'숫자 값이 올바르지 않습니다.'});
      if (row.type === 'boolean' && typeof value !== 'boolean') errors.push({id:row.id,message:'켜짐/꺼짐 값이 올바르지 않습니다.'});
    });
    return errors;
  }
  async function validate() {
    const errors = localValidation();
    if (errors.length) return {ok:false,errors,warnings:[],changes:[],files:[]};
    try { return await api('/api/validate',payload()); }
    catch (error) {
      if (error.details?.length) return {ok:false,errors:error.details,warnings:[],changes:[],files:[],error:error.message};
      throw error;
    }
  }
  function validationHTML(result) {
    const errors = result.errors || [], warnings = result.warnings || [];
    let html = '';
    if (result.error || errors.length) html += `<div class="validation-message">${result.error ? escape(result.error)+'<br>' : ''}${errors.map(error => escape(typeof error === 'string' ? error : `${error.id ? state.rowMap.get(error.id)?.label || error.id : ''} ${error.message || ''}`)).join('<br>')}</div>`;
    if (warnings.length) html += `<div class="validation-message warning">${warnings.map(warning => escape(typeof warning === 'string' ? warning : warning.message || JSON.stringify(warning))).join('<br>')}</div>`;
    return html;
  }
  async function reviewChanges() {
    setBusy(true);
    try {
      const result = await validate(), changes = result.changes || [];
      state.review = {edits:requestEdits(),revision:state.catalog.revision,validation:result,idempotencyKey:hosted ? crypto.randomUUID() : undefined};
      $('review-summary').innerHTML = `<span><strong>${count(changes.length)}</strong>개 값 변경</span><span><strong>${count((result.files || []).length)}</strong>개 원본 파일</span><span>CSV 미저장 <strong>${count(dirtyRows().length)}</strong>개</span>`;
      $('review-validation').innerHTML = validationHTML(result);
      $('review-changes').innerHTML = changes.length ? `<table><thead><tr><th>대상 / 항목</th><th>게시 기준</th><th></th><th>요청할 값</th></tr></thead><tbody>${changes.map(change => { const row = state.rowMap.get(change.id); return `<tr><td><span class="entity-name">${escape(change.entity || row?.entity || change.id)}</span><span class="field-key">${escape(row?.label || change.field || row?.field || '')}</span></td><td class="diff-before">${escape(displayValue(change.before))}</td><td style="color:#647b98">→</td><td class="diff-after">${escape(displayValue(change.after))}</td></tr>`; }).join('')}</tbody></table>` : '<div class="empty-state" style="padding:25px">반영할 변경 사항이 없습니다.</div>';
      $('review-files').innerHTML = (result.files || []).map(file => `<li>${escape(typeof file === 'string' ? file : file.source || file.path || JSON.stringify(file))}</li>`).join('');
      $('apply-button').disabled = result.ok === false || (result.errors || []).length > 0 || !changes.length;
      $('review-caption').textContent = result.ok === false ? '검사 오류를 해결한 후 다시 검토하세요.' : '연결 PC가 원본 검사·백업 후 적용합니다.';
      $('review-dialog').showModal();
    } catch (error) { showNotice(errorMessage(error),true); toast('변경 검토를 완료하지 못했습니다.',true); }
    finally { setBusy(false); }
  }
  async function saveCSV() {
    if (!dirtyRows().length || state.busy) return;
    const errors = localValidation(); if (errors.length) { showNotice(errors.map(error => error.message).join(' / '),true); return; }
    setBusy(true);
    try {
      await api('/api/save',payload());
      try { localStorage.removeItem(draftKey()); } catch (_) {}
      await loadCatalog(); toast('웹에 저장했습니다. Unity 반영은 변경 비교에서 요청하세요.');
    } catch (error) { showNotice(errorMessage(error),true); toast('웹에 저장하지 못했습니다.',true); }
    finally { setBusy(false); }
  }
  async function applyChanges() {
    if (!state.review || state.busy) return;
    if (hosted) {
      setBusy(true);
      try {
        const result = await api('/api/apply',{revision:state.review.revision,edits:state.review.edits,idempotencyKey:state.review.idempotencyKey});
        $('review-dialog').close(); state.review = null;
        await loadCatalog(); await refreshHostedSync();
        toast(result.queued ? 'Unity 반영을 요청했습니다. 연결 PC의 적용 결과를 기다립니다.' : '반영 요청 상태를 확인했습니다.');
      } catch(error) { $('review-validation').innerHTML = `<div class="validation-message">${escape(errorMessage(error))}</div>`; }
      finally { setBusy(false); }
      return;
    }
    $('apply-button').disabled = true; $('apply-button').textContent = '게시 기준에 반영 중…'; setBusy(true);
    try {
      const result = await api('/api/apply',{revision:state.review.revision,edits:state.review.edits});
      localStorage.removeItem(draftKey());
      $('review-dialog').close(); state.review = null;
      await loadCatalog();
      toast(`게시 기준에 반영했습니다. ${count(result.files?.length || 0)}개 파일 업데이트`);
      if (result.backupPath) showNotice(`변경 전 원본 백업: ${result.backupPath}`);
    } catch (error) {
      $('review-validation').innerHTML = `<div class="validation-message">${escape(errorMessage(error))}${error.status === 409 ? '<br>외부 변경을 확인한 뒤 원본 다시 읽기를 실행하고 최신 값으로 검토해 주세요.' : ''}</div>`;
      toast('게임 반영에 실패했습니다. 오류 내용을 확인해 주세요.',true);
    } finally { $('apply-button').textContent = 'Unity에 반영 요청'; setBusy(false); }
  }
  async function importCSV() {
    const csv = $('import-text').value;
    if (!csv.trim()) { $('import-errors').textContent = 'CSV 파일을 선택하거나 내용을 붙여넣어 주세요.'; $('import-errors').hidden = false; return; }
    $('confirm-import').disabled = true;
    try {
      const transfer = !hosted && (state.importMode === 'transfer' || /^\uFEFF?(?:"format"|format),/.test(csv));
      const result = await api(transfer ? '/api/transfer/import' : '/api/import',{revision:state.catalog.revision,...(transfer ? {} : {datasetId:state.selectedDataset}),csv});
      if (result.errors?.length) { $('import-errors').innerHTML = result.errors.map(error => escape(typeof error === 'string' ? error : error.message)).join('<br>'); $('import-errors').hidden = false; return; }
      const edits = result.edits || {}; pushEdits(edits); $('import-dialog').close();
      toast(`${count(transfer ? result.changes : Object.keys(edits).length)}개 값을 임시 변경으로 가져왔습니다.`);
      if (transfer && result.changes > 0) await reviewChanges();
      else if (transfer) toast(`이미 반영된 ${count(result.alreadyApplied)}개 항목을 확인했습니다. 게임에 새로 반영할 변경은 없습니다. 편집본이 달랐다면 웹 저장으로 정리하세요.`);
    } catch (error) { $('import-errors').textContent = errorMessage(error); $('import-errors').hidden = false; }
    finally { $('confirm-import').disabled = false; }
  }
  function openImport(mode='category') {
    state.importMode=mode; const transfer=mode==='transfer';
    $('import-text').value=''; $('import-file').value=''; $('import-errors').hidden=true;
    $('import-dialog').querySelector('h2').textContent=transfer ? '웹 변경 CSV 가져오기' : 'CSV 가져오기';
    $('import-dialog').querySelector('.dialog-intro').textContent=transfer ? '웹에서 내려받은 이동용 CSV를 선택하세요. 모든 카테고리의 변경값을 확인하고 비교 화면을 엽니다. 마지막 반영 버튼을 누르기 전에는 게임 파일이 바뀌지 않습니다.' : '현재 선택한 카테고리의 CSV를 불러옵니다. ID와 원본 정보는 유지하고 편집 가능한 값만 변경합니다. 가져온 값은 검토 전까지 임시 변경으로 남습니다.';
    $('import-dataset').textContent=transfer ? '대상: 이 프로젝트의 전체 카테고리' : `대상: ${currentDataset()?.label || ''}`;
    $('import-dialog').showModal();
  }
  async function downloadTransfer() {
    if (!hosted || state.busy || state.catalog?.authenticated !== true) return;
    if (state.invalid.size) { toast('입력 중인 값을 먼저 확인해 주세요.',true); return; }
    setBusy(true);
    try {
      const result=await api('/api/transfer/export',{revision:state.catalog.revision,edits:transferEdits()});
      if (typeof result.csv !== 'string') throw new Error('이동용 CSV를 만들지 못했습니다.');
      const url=URL.createObjectURL(new Blob([result.csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');
      link.href=url;link.download=`extraction_changes_${new Date().toISOString().replace(/[:.]/g,'-')}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      toast(`${count(result.changes)}개 변경값을 CSV로 내려받았습니다. 프로젝트 PC의 로컬 편집기에서 가져오세요.`);
    } catch(error) { toast(errorMessage(error),true); }
    finally { setBusy(false); }
  }
  async function showHistory() {
    $('history-content').textContent = '기록을 불러오는 중…'; $('history-dialog').showModal();
    try {
      const result = await api('/api/history');
      $('history-content').innerHTML = result.entries?.length ? result.entries.slice().reverse().map(entry => `<article class="history-entry"><time>${escape(timeLabel(entry.at || entry.timestamp || entry.savedAt || entry.appliedAt))}</time><strong>${escape(entry.action === 'numeric-parser-repaired' ? '숫자 읽기 보정' : entry.action === 'apply' || entry.type === 'apply' ? '게시 기준 반영' : entry.action === 'save' || entry.type === 'save' ? '웹 저장' : entry.action || entry.type || '작업')}</strong><p>${entry.changes !== undefined ? escape(typeof entry.changes === 'number' ? count(entry.changes)+'개 값 변경' : Array.isArray(entry.changes) ? count(entry.changes.length)+'개 값 변경' : entry.changes) : ''}${entry.files ? '<br>'+escape(Array.isArray(entry.files) ? entry.files.join(', ') : entry.files) : ''}${entry.backupPath ? '<br>백업: '+escape(entry.backupPath) : ''}</p></article>`).join('') : '<div class="empty-state" style="padding:30px">아직 저장 또는 반영한 기록이 없습니다.</div>';
    } catch (error) { $('history-content').textContent = errorMessage(error); }
  }

  let lastHostedJob = null, syncBusy = false;
  async function refreshHostedSync() {
    if (!hosted || hosted.readOnly || syncBusy) return;
    syncBusy = true;
    try {
      const result = await api('/api/sync'), bridge = result.bridge || {}, job = result.latestJob;
      const active = !!job && ['queued','inflight','applying'].includes(job.actualStatus || job.status);
      if (!!state.syncActive !== active) { state.syncActive=active; renderAll(false); }
      $('connection').innerHTML = `<i></i>${bridge.online ? 'Unity PC 연결됨' : 'Unity PC 오프라인'}`;
      $('connection').title = bridge.online ? '원본 프로젝트 PC가 반영 요청을 받을 수 있습니다.' : '원본 프로젝트 PC에서 연결 도구를 실행하면 요청을 처리합니다.';
      if (job) {
        const status=job.actualStatus || job.status;
        const label={queued:'Unity 반영 대기',inflight:'연결 PC에서 검사·적용 중',applying:'연결 PC에서 검사·적용 중',applied:'Unity 프로젝트 파일 반영 완료',failed:'Unity 반영 실패',conflict:'원본 충돌 · 반영 보류'}[status] || 'Unity 반영 상태';
        if (lastHostedJob?.id === job.id && lastHostedJob.status !== status && ['applied','failed','conflict'].includes(status)) {
          if (dirtyRows().length) showNotice(`${label}. 새 미저장 변경을 보존했습니다. 최신 자료를 다시 읽기 전에 필요한 값을 CSV 또는 별도 메모로 보관하세요.`);
          else await loadCatalog();
          toast(label,status !== 'applied');
        }
        lastHostedJob={id:job.id,status};
        $('connection').title += `\n${label}${job.message ? ': '+job.message : ''}`;
        if (['queued','inflight','applying'].includes(status)) {
          $('save-status').textContent=label;
          $('save-caption').textContent=status==='queued' ? '연결 PC가 요청을 받을 때까지 대기합니다. 아직 게임에 반영되지 않았습니다.' : '원본 검사와 백업을 진행합니다. 실제 적용 결과를 기다립니다.';
        } else if (['failed','conflict'].includes(status)) {
          showNotice(`${label}. ${job.message || '연결 PC의 원본 상태와 검사 결과를 확인하세요.'}`,true);
        } else if (status==='applied' && !dirtyRows().length) {
          $('save-caption').textContent='연결 PC의 프로젝트 파일에 적용됐습니다. Unity 재로딩·컴파일 및 새 게임 상태에서 확인하세요.';
        }
      }
    } catch(error) {
      $('connection').innerHTML='<i></i>Unity 연결 확인 실패'; $('connection').title=error.message;
    } finally { syncBusy=false; }
  }
  if (hosted) {
    $('auth-button').addEventListener('click',async () => {
      if (state.catalog?.authenticated) {
        if (dirtyRows().length && !(await confirmation('편집을 잠글까요?','미저장 변경을 취소하고 공개 열람 모드로 돌아갑니다.','편집 잠금'))) return;
        try { await api('/api/logout',{}); try { localStorage.removeItem(draftKey()); } catch (_) {} await loadCatalog(); toast('편집을 잠갔습니다.'); } catch(error) { toast(errorMessage(error),true); }
      } else { $('auth-password').value=''; $('auth-error').hidden=true; $('auth-dialog').showModal(); $('auth-password').focus(); }
    });
    $('auth-form').addEventListener('submit',async event => {
      event.preventDefault(); $('auth-submit').disabled=true;
      try { await api('/api/login',{password:$('auth-password').value}); $('auth-password').value=''; $('auth-dialog').close(); await loadCatalog({restoreDraft:true}); toast('편집 잠금을 해제했습니다.'); }
      catch(error) { $('auth-error').textContent=errorMessage(error); $('auth-error').hidden=false; }
      finally { $('auth-submit').disabled=false; }
    });
    $('password-button').addEventListener('click',() => { $('password-form').reset(); $('password-error').hidden=true; $('password-dialog').showModal(); });
    $('password-form').addEventListener('submit',async event => {
      event.preventDefault();
      if ($('new-password').value !== $('repeat-password').value) { $('password-error').textContent='새 비밀번호가 서로 다릅니다.'; $('password-error').hidden=false; return; }
      const button=event.target.querySelector('[type="submit"]'); button.disabled=true;
      try { await api('/api/password',{currentPassword:$('current-password').value,newPassword:$('new-password').value}); $('password-form').reset(); $('password-dialog').close(); await loadCatalog(); toast('비밀번호를 변경했습니다. 다른 로그인 세션은 만료됩니다.'); }
      catch(error) { $('password-error').textContent=errorMessage(error); $('password-error').hidden=false; }
      finally { button.disabled=false; }
    });
    if (!hosted.readOnly) setInterval(refreshHostedSync,8000);
  }

  $('dataset-nav').addEventListener('click',event => { const button = event.target.closest('[data-dataset]'); if (button && !state.busy) selectDataset(button.dataset.dataset); });
  $('all-data').addEventListener('click',() => selectDataset(null));
  $('data-rows').addEventListener('click',event => { const row = event.target.closest('[data-row]'); if (row) selectRow(row.dataset.row); });
  $('data-rows').addEventListener('keydown',event => { if (event.key === 'Enter' && event.target.tagName === 'TR') { event.preventDefault(); selectRow(event.target.dataset.row); } });
  for (const area of [$('data-rows'),$('detail-content')]) {
    area.addEventListener('focusin',event => { if (event.target.matches('[data-id]')) state.inputSession = {id:event.target.dataset.id,history:false}; });
    area.addEventListener('input',event => { if (event.target.matches('input[data-id]')) editFromInput(event.target,{commit:false}); });
    area.addEventListener('change',event => { if (event.target.matches('[data-id]')) editFromInput(event.target); });
    area.addEventListener('focusout',event => { if (event.target.matches('input[data-id]') && event.target.isConnected) editFromInput(event.target); });
    area.addEventListener('keydown',event => { if (event.key === 'Enter' && event.target.matches('input[data-id]')) event.target.blur(); });
  }
  $('detail-content').addEventListener('click',event => { const button = event.target.closest('[data-reset-row]'); if (button) pushEdits({[button.dataset.resetRow]:state.saved[button.dataset.resetRow]}); });
  $('search').addEventListener('input',() => { state.page = 1; renderTable(); });
  for (const id of ['scope-filter','source-filter','changes-only']) $(id).addEventListener('change',() => { state.page = 1; renderTable(); });
  $('global-search').addEventListener('change',() => { state.page = 1; populateFilters(); renderTable(); });
  $('clear-filters').addEventListener('click',() => { $('search').value = ''; $('scope-filter').value = ''; $('source-filter').value = ''; $('changes-only').checked = false; state.page = 1; renderTable(); });
  $('page-size').addEventListener('change',() => { state.pageSize = Number($('page-size').value); state.page = 1; renderTable(); });
  $('previous-page').addEventListener('click',() => { state.page--; renderTable(); $('table-container').scrollTop = 0; });
  $('next-page').addEventListener('click',() => { state.page++; renderTable(); $('table-container').scrollTop = 0; });
  $('undo-button').addEventListener('click',undo); $('redo-button').addEventListener('click',redo);
  $('reset-button').addEventListener('click',async () => { if (await confirmation('미저장 변경을 취소할까요?',`${count(dirtyRows().length)}개 항목을 마지막 웹 저장값으로 되돌립니다. 이 작업은 실행 취소로 복원할 수 있습니다.`,'변경 취소')) { const values = {}; dirtyRows().forEach(row => values[row.id] = state.saved[row.id]); pushEdits(values); toast('미저장 변경을 취소했습니다.'); } });
  $('reload-button').addEventListener('click',async () => {
    if (dirtyRows().length && !(await confirmation('최신 데이터를 다시 불러올까요?','현재 미저장 변경은 취소됩니다. 서버에 저장한 최신 편집본을 다시 읽습니다.','새로고침'))) return;
    setBusy(true); try { if (state.catalog && (!hosted || state.catalog.authenticated)) await api('/api/refresh',{revision:state.catalog.revision}); await loadCatalog(); storeDraft(); toast('서버의 최신 자료를 불러왔습니다.'); } catch (error) { showNotice(errorMessage(error),true); } finally { setBusy(false); }
  });
  $('save-button').addEventListener('click',saveCSV); $('review-button').addEventListener('click',reviewChanges); $('apply-button').addEventListener('click',applyChanges);
  $('validate-button').addEventListener('click',async () => { setBusy(true); try { const result = await validate(); if (result.errors?.length || result.ok === false) showNotice((result.errors || []).map(error => typeof error === 'string' ? error : error.message).join(' / ') || '검사에서 오류가 발견되었습니다.',true); else if (result.warnings?.length) showNotice(result.warnings.map(warning => typeof warning === 'string' ? warning : warning.message).join(' / ')); else { $('notice').hidden = true; toast('검사 통과 · 값 형식을 확인했습니다. 실제 원본의 적용 검사는 연결 PC에서 다시 진행합니다.'); } } catch (error) { showNotice(errorMessage(error),true); } finally { setBusy(false); } });
  $('export-button').addEventListener('click',async () => {
    if (!currentDataset()) return;
    if (dirtyRows().length) { toast('미저장 변경이 있습니다. 웹 저장 후 내보내 주세요.',true); return; }
    try {
      let blob;
      if (hosted) blob = new Blob([await hosted.exportCSV(state.selectedDataset)],{type:'text/csv;charset=utf-8'});
      else {
        const response = await fetch(`/api/export?dataset=${encodeURIComponent(state.selectedDataset)}`,{cache:'no-store'});
        if (!response.ok) { let error; try { error = (await response.json()).error; } catch (_) {} throw new Error(error || 'CSV를 내려받지 못했습니다.'); }
        blob = await response.blob();
      }
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      const label = String(currentDataset()?.label || '데이터').replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_').trim().replace(/[. ]+$/g,'') || '데이터';
      link.href = url; link.download = `${label}_${state.selectedDataset}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000); toast('CSV를 내려받았습니다.');
    } catch (error) { toast(error.message,true); }
  });
  $('import-button').addEventListener('click',() => openImport());
  $('transfer-button').addEventListener('click',() => $('transfer-dialog').showModal());
  $('transfer-export-button').addEventListener('click',downloadTransfer);
  $('transfer-import-button').addEventListener('click',() => { $('transfer-dialog').close(); openImport('transfer'); });
  $('transfer-login-button').addEventListener('click',() => { $('transfer-dialog').close(); $('auth-button').click(); });
  $('import-file').addEventListener('change',async event => { const file = event.target.files[0]; if (!file) return; try { $('import-text').value = await file.text(); $('import-errors').hidden = true; } catch (_) { $('import-errors').textContent = '파일을 읽지 못했습니다.'; $('import-errors').hidden = false; } });
  $('confirm-import').addEventListener('click',importCSV); $('history-button').addEventListener('click',showHistory);
  document.querySelectorAll('.close-dialog').forEach(button => button.addEventListener('click',() => button.closest('dialog').close()));
  $('confirm-yes').addEventListener('click',() => settleConfirmation(true)); $('confirm-no').addEventListener('click',() => settleConfirmation(false)); $('confirm-dialog').addEventListener('cancel',event => { event.preventDefault(); settleConfirmation(false); });
  document.addEventListener('keydown',event => {
    const editing = /INPUT|TEXTAREA|SELECT/.test(event.target.tagName), modal = document.querySelector('dialog[open]');
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && !modal) { event.preventDefault(); saveCSV(); }
    if (!editing && !modal && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
    if (!editing && !modal && event.key === '/') { event.preventDefault(); $('search').focus(); }
  });
  window.addEventListener('beforeunload',event => { if (dirtyRows().length || state.invalid.size) { event.preventDefault(); event.returnValue = ''; } });
  loadCatalog({restoreDraft:true}).then(() => { if (hosted) return refreshHostedSync(); }).catch(error => {
    $('connection').className = 'connection error'; $('connection').innerHTML = '<i></i>연결 실패';
    $('dataset-title').textContent = '데이터를 불러오지 못했습니다'; $('dataset-description').textContent = '네트워크 연결을 확인하고 새로고침해 주세요.';
    $('initial-error').textContent = errorMessage(error) + '\n\n웹 서버가 응답하지 않습니다. 잠시 후 새로고침해 주세요.'; $('initial-error').hidden = false;
    $('save-status').textContent = '데이터 연결 실패'; $('save-caption').textContent = '오류를 해결한 뒤 새로고침해 주세요.'; $('save-indicator').className = 'save-indicator error'; $('dataset-nav').innerHTML = '<div class="loading-small">연결을 기다리고 있습니다.</div>';
    $('results-label').textContent = '데이터 없음';
  });
})();
