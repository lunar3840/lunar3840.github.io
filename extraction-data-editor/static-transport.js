/* Read-only static transport (GitHub Pages). There is no login, save or Unity request here. */
'use strict';
(() => {
  const CSV_NUMBER_FORMAT = "csharp-literal-v3";
  const numericFormatForRow = function numericFormatForRow(row){return row.type==='number'&&row.source?.endsWith('.cs')?CSV_NUMBER_FORMAT:'';};
  const csvHeaders = ["id","entity","field","value","type","unit","source","line","scope","note","numericFormat"];
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);
  let pending = null;
  function load() {
    if (!pending) pending = fetch('catalog.json', {cache:'no-cache'}).then(response => {
      if (!response.ok) throw new Error('데이터 파일을 불러오지 못했습니다. (' + response.status + ')');
      return response.json();
    }).catch(error => { pending = null; throw error; });
    return pending;
  }
  const readOnly = () => Object.assign(new Error('이 게시본은 열람 전용입니다. 값 수정·저장·Unity 반영은 프로젝트 PC의 로컬 편집기에서 진행합니다.'), {status:405, details:[]});
  async function request(path) {
    if (path === '/api/catalog') {
      const catalog = await load();
      return {...catalog, projectRoot:"익스트랙션 · 2026-10-23 추출 게시본", savedAt:null, authenticated:false, csrfToken:'', hosted:{authenticated:false, canApply:false, readOnly:true}, notes:["열람 전용 게시본입니다 · 2026-10-23 추출 자료 기준. 값 수정·저장·Unity 반영은 프로젝트 PC의 로컬 편집기(데이터 편집기 열기.cmd)에서 진행합니다."]};
    }
    if (path === '/api/session') return {authenticated:false, csrfToken:''};
    if (path === '/api/history') return {entries:[]};
    if (path === '/api/sync') return {connected:false, bridge:{online:false, lastSeen:null}, latestJob:null};
    throw readOnly();
  }
  async function exportCSV(datasetId) {
    const catalog = await load(), dataset = catalog.datasets.find(item => item.id === datasetId);
    if (!dataset) throw new Error('분류를 찾지 못했습니다.');
    const values = catalog.values || {}, quote = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
    const valueOf = row => own(values, row.id) ? values[row.id] : row.value;
    return '\uFEFF' + [csvHeaders.join(','), ...dataset.rows.map(row => csvHeaders.map(key => quote(key === 'value' ? valueOf(row) : key === 'numericFormat' ? numericFormatForRow(row) : row[key])).join(','))].join('\r\n') + '\r\n';
  }
  window.ExtractionHosted = Object.freeze({request, exportCSV, readOnly:true});
})();
