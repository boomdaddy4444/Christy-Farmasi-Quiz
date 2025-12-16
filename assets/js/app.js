/* Christine Delgado Farmasi Training
   Static training app (GitHub Pages friendly)
   - Data driven via /assets/data/catalog.json and /assets/data/quizzes.json
   - Progress saved in localStorage
*/
const STORE_KEY = "cdfarmasi_training_v1";

function $(sel, root=document){ return root.querySelector(sel); }
function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function loadStore(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : { scores:{}, attempts:{}, lastSeen:{} };
  }catch(e){
    return { scores:{}, attempts:{}, lastSeen:{} };
  }
}
function saveStore(store){
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}
function resetProgress(){
  localStorage.removeItem(STORE_KEY);
  location.href = "index.html";
}

function icon(name){
  // simple inline svg icons
  const icons = {
    check:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    x:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    bolt:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 2L3 14h7l-1 8 12-14h-7l1-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    book:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 0 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
    chart:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M7 14v4M12 10v8M17 6v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
  };
  return icons[name] || "";
}

async function loadData(){
  // GitHub Pages-friendly data loader
  // If files are missing (404) or JSON is invalid, we show a clear on-screen error.
  try{
    const [catalogRes, quizRes] = await Promise.all([
      fetch("assets/data/catalog.json", {cache:"no-store"}),
      fetch("assets/data/quizzes.json", {cache:"no-store"})
    ]);
    if(!catalogRes.ok) throw new Error(`catalog.json failed: ${catalogRes.status} ${catalogRes.statusText}`);
    if(!quizRes.ok) throw new Error(`quizzes.json failed: ${quizRes.status} ${quizRes.statusText}`);
    const [catalog, quizzes] = await Promise.all([catalogRes.json(), quizRes.json()]);
    if(!catalog?.categories?.length) throw new Error("catalog.json loaded but contains no categories.");
    return {catalog, quizzes};
  }catch(err){
    // Render a friendly error block if the page has a main container.
    const mount = document.querySelector("#categoryGrid") || document.querySelector("main") || document.body;
    const html = `
      <div class="card" style="margin-top:16px">
        <h2 style="margin:0 0 8px 0">Data failed to load</h2>
        <p style="margin:0 0 8px 0">This site loads categories, products, and quizzes from:</p>
        <ul style="margin:0 0 8px 18px">
          <li><code>assets/data/catalog.json</code></li>
          <li><code>assets/data/quizzes.json</code></li>
        </ul>
        <p style="margin:0 0 8px 0">Fix: confirm those files exist in your GitHub repo at the exact path (case-sensitive), then hard refresh.</p>
        <p style="margin:0;color:var(--muted)">Technical details: <code>${escapeHtml(String(err?.message || err))}</code></p>
      </div>
    `;
    if(mount && !document.querySelector("#dataLoadError")){
      const wrap=document.createElement("div");
      wrap.id="dataLoadError";
      wrap.innerHTML=html;
      mount.parentElement ? mount.parentElement.prepend(wrap) : document.body.prepend(wrap);
    }
    throw err;
  }
}

function setActiveNav(){
  const path = location.pathname.split("/").pop() || "index.html";
  $all("nav a").forEach(a=>{
    const href = a.getAttribute("href");
    if(!href) return;
    a.classList.toggle("active", href === path);
  });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

function renderHome({catalog, quizzes}){
  const store = loadStore();
  const catCards = catalog.categories.map(c=>{
    const score = store.scores[c.id]?.score ?? 0;
    const total = store.scores[c.id]?.total ?? 0;
    const pct = total ? Math.round((score/total)*100) : 0;
    const done = total ? (store.attempts[c.id] || 0) : 0;
    return `
      <a class="card tile" href="category.html?cat=${encodeURIComponent(c.id)}">
        <div class="kicker">Category • Pages ${escapeHtml(c.range)}</div>
        <div class="title">${escapeHtml(c.name)}</div>
        <p class="desc">${escapeHtml(c.tagline)}</p>
        <div class="hr"></div>
        <div class="badge">${icon("chart")} <span><b>${pct}%</b> score • ${done} quiz attempt(s)</span></div>
      </a>
    `;
  }).join("");
  $("#categoryGrid").innerHTML = catCards;

  $("#resetBtn").addEventListener("click", ()=>{
    if(confirm("Reset all progress and scores?")) resetProgress();
  });
}

function productCard(p){
  const acts = p.hero_actives ? `<div class="muted small"><b>Hero actives:</b> ${escapeHtml(p.hero_actives)}</div>` : "";
  const hl = (p.highlights||[]).map(x=>`<span class="pill">${escapeHtml(x)}</span>`).join(" ");
  const sku = p.sku ? `<a class="pill sku-link" href="https://www.farmasius.com/christinedelgado/product-detail/shea-butter-almond-shower-cream?pid=${encodeURIComponent(p.sku)}" target="_blank" rel="noopener">SKU ${escapeHtml(p.sku)}</a>` : (p.sku_group ? `<span class="pill">${escapeHtml(p.sku_group)}</span>`:"");
  return `
    <div class="card pad">
      <div class="quiz-top">
        <div>
          <h2 style="margin:0">${escapeHtml(p.name)}</h2>
          <div class="muted small">Size: ${escapeHtml(p.size||"—")} • Price: ${escapeHtml(p.price_usd||"—")} • Catalog p.${escapeHtml(p.source_page||"—")}</div>
        </div>
        <div style="text-align:right">
          ${sku}
        </div>
      </div>
      <div class="hr"></div>
      <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px">${hl}</div>
      <p>${escapeHtml(p.notes||"")}</p>
      ${acts}
    </div>
  `;
}

function renderCategory({catalog, quizzes}){
  const params = new URLSearchParams(location.search);
  const catId = params.get("cat");
  const cat = catalog.categories.find(c=>c.id===catId);
  if(!cat){ location.href="index.html"; return; }

  document.title = `${catalog.siteTitle} • ${cat.name}`;
  $("#catTitle").textContent = cat.name;
  $("#catMeta").textContent = `Catalog pages: ${cat.range}`;

  const subs = catalog.subcategories[catId] || [];
  $("#subcatList").innerHTML = subs.map(s=>`<span class="pill">${escapeHtml(s.name)} <span class="muted" style="margin-left:6px">p.${escapeHtml(s.pages)}</span></span>`).join(" ");

  const prods = catalog.products.filter(p=>p.category===catId);
  // filter by subcat dropdown
  const select = $("#subcatSelect");
  select.innerHTML = `<option value="">All</option>` + subs.map(s=>`<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)}</option>`).join("");
  const search = $("#searchBox");

  function repaint(){
    const q = (search.value||"").toLowerCase().trim();
    const sub = select.value;
    const list = prods.filter(p=>{
      if(sub && p.subcat !== sub) return false;
      if(!q) return true;
      const blob = `${p.name} ${p.notes||""} ${p.hero_actives||""} ${(p.highlights||[]).join(" ")}`.toLowerCase();
      return blob.includes(q);
    });
    $("#productCount").textContent = `${list.length} product(s) loaded`;
    $("#productList").innerHTML = list.map(productCard).join("");
  }
  select.addEventListener("change", repaint);
  search.addEventListener("input", repaint);
  repaint();

  const quizForCat = quizzes.quizzes.filter(q=>q.category===catId);
  $("#quizCount").textContent = `${quizForCat.length} question(s) in this category quiz`;
  $("#startQuizBtn").addEventListener("click", ()=>{
    location.href = `quiz.html?cat=${encodeURIComponent(catId)}`;
  });
}

function computeScoreForCat(quizzes, catId, answers){
  const qs = quizzes.quizzes.filter(q=>q.category===catId);
  let correct=0;
  qs.forEach((q,i)=>{
    if(answers[i] === q.correctIndex) correct++;
  });
  return {correct, total: qs.length};
}

function renderQuiz({catalog, quizzes}){
  const params = new URLSearchParams(location.search);
  const catId = params.get("cat");
  const cat = catalog.categories.find(c=>c.id===catId);
  if(!cat){ location.href="index.html"; return; }
  document.title = `${catalog.siteTitle} • ${cat.name} Quiz`;

  const qs = quizzes.quizzes.filter(q=>q.category===catId);
  if(!qs.length){
    $("#quizRoot").innerHTML = `<div class="card pad"><h2>No quiz yet</h2><p>Add questions in <kbd>assets/data/quizzes.json</kbd>.</p></div>`;
    return;
  }

  $("#quizTitle").textContent = `${cat.name} Quiz`;
  $("#quizMeta").innerHTML = `
    <span class="badge">${icon("bolt")} <span>${qs.length} questions</span></span>
    <span class="badge">${icon("book")} <span>Instant feedback + explanations</span></span>
  `;

  const store = loadStore();
  const answers = new Array(qs.length).fill(null);
  let current = 0;

  function renderOne(){
    const q = qs[current];
    const progress = Math.round(((current)/qs.length)*100);
    $("#bar").style.width = `${progress}%`;
    $("#qIndex").textContent = `Question ${current+1} of ${qs.length}`;
    $("#qSkill").textContent = q.skill === "sales" ? "Sales Technique" : "Product Knowledge";
    $("#qPrompt").textContent = q.prompt;

    const chosen = answers[current];

    const choiceHtml = q.choices.map((c,idx)=>{
      let cls = "choice";
      if(chosen !== null){
        if(idx === q.correctIndex) cls += " correct";
        if(idx === chosen && chosen !== q.correctIndex) cls += " wrong";
      }
      return `<button class="${cls}" data-idx="${idx}" ${chosen!==null ? "disabled":""}>${escapeHtml(c)}</button>`;
    }).join("");

    $("#choices").innerHTML = choiceHtml;

    // explanation
    if(chosen !== null){
      const ok = chosen === q.correctIndex;
      const pill = ok ? `<span class="pill ok">${icon("check")} Correct</span>` : `<span class="pill bad">${icon("x")} Incorrect</span>`;
      const refs = (q.productRefs||[]).map(pid=>{
        const p = catalog.products.find(x=>x.id===pid);
        if(!p) return "";
        return `<li><b>${escapeHtml(p.name)}</b> (p.${escapeHtml(p.source_page)}) — ${escapeHtml(p.price_usd||"")}</li>`;
      }).filter(Boolean).join("");
      const refBox = refs ? `<div class="hr"></div><div class="muted small"><b>Catalog references used:</b><ul style="margin:6px 0 0 18px">${refs}</ul></div>` : "";
      $("#explain").innerHTML = `
        <div class="explain">
          <h4 style="display:flex; align-items:center; gap:10px; margin:0 0 6px 0">${pill}<span>Explanation</span></h4>
          <p style="margin:0">${escapeHtml(q.explanation)}</p>
          ${refBox}
        </div>
      `;
    }else{
      $("#explain").innerHTML = "";
    }

    // buttons
    $("#prevBtn").disabled = current === 0;
    $("#nextBtn").disabled = current === qs.length-1 || answers[current] === null;
    $("#finishBtn").disabled = answers.some(a=>a===null);
  }

  $("#choices").addEventListener("click", (e)=>{
    const btn = e.target.closest("button.choice");
    if(!btn) return;
    const idx = Number(btn.dataset.idx);
    if(Number.isNaN(idx)) return;
    if(answers[current] !== null) return;
    answers[current] = idx;
    renderOne();
  });

  $("#prevBtn").addEventListener("click", ()=>{ if(current>0){ current--; renderOne(); } });
  $("#nextBtn").addEventListener("click", ()=>{ if(current<qs.length-1 && answers[current]!==null){ current++; renderOne(); } });

  $("#finishBtn").addEventListener("click", ()=>{
    const {correct,total} = computeScoreForCat(quizzes, catId, answers);
    const pct = total ? Math.round((correct/total)*100) : 0;

    // persist
    store.scores[catId] = {score: correct, total, pct, lastUpdated: new Date().toISOString()};
    store.attempts[catId] = (store.attempts[catId] || 0) + 1;
    store.lastSeen[catId] = new Date().toISOString();
    saveStore(store);

    $("#bar").style.width = "100%";
    $("#quizRoot").innerHTML = `
      <div class="card pad">
        <div class="quiz-top">
          <div>
            <h2 style="margin:0">Quiz Complete</h2>
            <p class="muted">Category: <b>${escapeHtml(cat.name)}</b></p>
          </div>
          <div style="text-align:right">
            <span class="pill ${pct>=80 ? "ok" : (pct>=60 ? "warn" : "bad")}">${pct}%</span>
          </div>
        </div>
        <div class="hr"></div>
        <p>Your score: <b>${correct}</b> / <b>${total}</b>.</p>
        <div class="btnrow">
          <a class="btn primary" href="category.html?cat=${encodeURIComponent(catId)}">${icon("book")} Review products</a>
          <a class="btn" href="quiz.html?cat=${encodeURIComponent(catId)}">${icon("bolt")} Retake quiz</a>
          <a class="btn" href="progress.html">${icon("chart")} View progress</a>
          <a class="btn" href="index.html">Home</a>
        </div>
        <div class="footer">Tip: Focus on explanations you missed — they’re written to double as talking points with customers.</div>
      </div>
    `;
  });

  renderOne();
}

function renderProgress({catalog}){
  const store = loadStore();
  const rows = catalog.categories.map(c=>{
    const s = store.scores[c.id];
    const attempts = store.attempts[c.id] || 0;
    const pct = s?.pct ?? 0;
    const tag = pct>=80 ? "ok" : (pct>=60 ? "warn" : "bad");
    const last = s?.lastUpdated ? new Date(s.lastUpdated).toLocaleString() : "—";
    return `<tr>
      <td><a href="category.html?cat=${encodeURIComponent(c.id)}"><b>${escapeHtml(c.name)}</b></a></td>
      <td>${attempts}</td>
      <td>${s ? `${s.score} / ${s.total}` : "—"}</td>
      <td><span class="pill ${tag}">${pct}%</span></td>
      <td class="muted small">${escapeHtml(last)}</td>
    </tr>`;
  }).join("");
  $("#progressBody").innerHTML = rows;

  $("#resetBtn").addEventListener("click", ()=>{
    if(confirm("Reset all progress and scores?")) resetProgress();
  });
}

function renderCatalog({catalog}){
  $("#catalogName").textContent = catalog.catalog.name;
  $("#catalogFile").textContent = catalog.catalog.filename ? catalog.catalog.filename : "No PDF file in this build";
  const embed = document.querySelector("#pdfEmbed");
  const note = document.querySelector("#pdfNote");
  if(!catalog.catalog.filename){
    if(embed) embed.style.display = "none";
    if(note) note.style.display = "block";
    return;
  }
  if(embed){
    embed.setAttribute("src", `assets/${catalog.catalog.filename}`);
    embed.style.display = "block";
  }
  if(note) note.style.display = "none";
}


async function boot(){
  setActiveNav();
  const data = await loadData();
  const page = document.body.dataset.page;

  if(page === "home") renderHome(data);
  if(page === "category") renderCategory(data);
  if(page === "quiz") renderQuiz(data);
  if(page === "progress") renderProgress(data);
  if(page === "catalog") renderCatalog(data);

  $all("[data-reset]").forEach(btn=>btn.addEventListener("click", ()=>{ if(confirm("Reset all progress?")) resetProgress(); }));
}

document.addEventListener("DOMContentLoaded", boot);