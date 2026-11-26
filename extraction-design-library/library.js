(() => {
  const L = window.LIBRARY;
  const STATUS = { done: "완료", partial: "완료 · 한계 있음", wip: "미완성 인계", base: "기준 자료" };
  const catName = Object.fromEntries(L.categories.map(c => [c.id, c.name]));
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const img = n => "img/" + n + ".webp";
  const state = { cat: "all", q: "" };
  try { const h = new URLSearchParams(location.hash.slice(1)); if (h.get("cat")) state.cat = h.get("cat"); } catch {}

  // stats
  const recs = L.RECORDS;
  const imgCount = recs.reduce((n, r) => n + r.images.length, 0);
  $("#lib-stats").innerHTML =
    `<div><dt>작업 기록</dt><dd>${recs.length}</dd></div>` +
    `<div><dt>전후·결과 이미지</dt><dd>${imgCount}</dd></div>` +
    `<div><dt>최근 갱신</dt><dd style="font-size:16px;padding-top:6px">${esc(L.updated)}</dd></div>`;
  $("#lib-updated").textContent = "최근 갱신 " + L.updated;

  // filters
  const filters = [{ id: "all", name: "전체" }, ...L.categories];
  const fbox = $("#lib-filters");
  fbox.innerHTML = filters.map(f => {
    const n = f.id === "all" ? recs.length : recs.filter(r => r.category === f.id).length;
    return `<button type="button" data-cat="${f.id}">${esc(f.name)}<span>${n}</span></button>`;
  }).join("");
  fbox.addEventListener("click", e => {
    const b = e.target.closest("button[data-cat]"); if (!b) return;
    state.cat = b.dataset.cat; history.replaceState(null, "", state.cat === "all" ? location.pathname + location.search : "#cat=" + state.cat); render();
  });
  $("#lib-query").addEventListener("input", e => { state.q = e.target.value.trim().toLowerCase(); render(); });

  const text = r => [r.title, r.summary, r.intent, r.tool, catName[r.category], ...(r.rounds || []).flatMap(x => [x.label, x.text]), ...(r.results || []), ...(r.limits || []), ...r.images.map(i => i.caption)].join(" ").toLowerCase();

  function recHTML(r) {
    const first = r.images[0] || (r.video && { src: r.video.poster, caption: r.video.caption });
    const thumb = first
      ? `<button type="button" class="rec-thumb" data-view="${esc(first.src)}" data-cap="${esc(first.caption)}"><img src="${img(first.src)}" alt="${esc(first.caption)}" loading="lazy"></button>`
      : `<div class="rec-thumb none">이미지 없음</div>`;
    const rounds = (r.rounds || []).length ? `<h4>지시·피드백과 수정 회차</h4><ol class="rounds">${r.rounds.map(x => `<li><b>${esc(x.label)}</b><span>${esc(x.text)}</span></li>`).join("")}</ol>` : "";
    const results = (r.results || []).length ? `<h4>결과</h4><ul class="plain">${r.results.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
    const limits = (r.limits || []).length ? `<h4>남은 한계</h4><ul class="plain limits">${r.limits.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
    const gallery = r.images.length ? `<div class="gallery">${r.images.map(i => `<figure><button type="button" data-view="${esc(i.src)}" data-cap="${esc(i.caption)}"><img src="${img(i.src)}" alt="${esc(i.caption)}" loading="lazy"></button><figcaption>${esc(i.caption)}</figcaption></figure>`).join("")}</div>` : "";
    const video = r.video ? `<video controls preload="none" playsinline poster="${img(r.video.poster)}" src="${esc(r.video.src)}"></video><p class="rec-video-cap">${esc(r.video.caption)}</p>` : "";
    const links = (r.links || []).length ? `<div class="rec-links">${r.links.map(l => `<a href="${esc(l.href)}">${esc(l.label)} →</a>`).join("")}</div>` : "";
    return `<article class="rec" id="${esc(r.id)}">
      <div class="rec-head">
        <div class="rec-date"><b>${esc(r.date)}</b>${esc(r.tool)}</div>
        <div><h3 class="rec-title">${esc(r.title)}</h3><p class="rec-sum">${esc(r.summary)}</p>
          <div class="rec-tags"><span class="tag st-${r.status}">${STATUS[r.status]}</span><span class="tag">${esc(catName[r.category])}</span>${r.images.length ? `<span class="tag">이미지 ${r.images.length}</span>` : ""}${r.video ? `<span class="tag">영상</span>` : ""}</div></div>
        ${thumb}
      </div>
      <details${state.open === r.id ? " open" : ""}><summary>기획 의도 · 수정 회차 · 결과 보기</summary>
        <div class="rec-body">
          <p class="rec-intent"><b>기획 의도</b>${esc(r.intent)}</p>
          <div class="rec-cols"><div>${rounds}</div><div>${results}${limits}</div></div>
          ${gallery}${video}${links}
        </div>
      </details>
    </article>`;
  }

  function render() {
    for (const b of fbox.querySelectorAll("button")) b.setAttribute("aria-pressed", String(b.dataset.cat === state.cat));
    const list = recs.filter(r => (state.cat === "all" || r.category === state.cat) && (!state.q || text(r).includes(state.q)));
    $("#lib-list").innerHTML = list.length ? list.map(recHTML).join("") : `<p class="lib-empty">조건에 맞는 기록이 없습니다.</p>`;
  }

  // image viewer
  const dlg = $("#lib-viewer");
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-view]");
    if (b) { dlg.querySelector("img").src = img(b.dataset.view); dlg.querySelector("img").alt = b.dataset.cap; dlg.querySelector("figcaption").textContent = b.dataset.cap; dlg.showModal(); return; }
    if (e.target.closest("[data-close]") || e.target === dlg) dlg.close();
  });

  // open a record from #id links
  const id = location.hash.slice(1);
  if (id && recs.some(r => r.id === id)) state.open = id;
  render();
  if (state.open) document.getElementById(state.open)?.scrollIntoView({ block: "start" });
})();
