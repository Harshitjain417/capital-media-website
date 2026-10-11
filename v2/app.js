/* =========================================================
   Capital Media v2: interactions
   ========================================================= */
(() => {
  const SITE = window.SITE || {};
  const CASES = window.CASES || [];
  const SERVICES = window.SERVICES || [];
  const EXPERIENCE = window.EXPERIENCE || [];
  // where assets/ lives relative to this page
  const BASE = window.ASSET_BASE !== undefined ? window.ASSET_BASE : "../";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (n) => (n >= 1000 ? n.toLocaleString("en-US") : String(n));
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

  /* ---------------- content ---------------- */
  function fill() {
    $$(".js-name").forEach((e) => (e.textContent = SITE.name));
    $$(".js-email").forEach((a) => { a.href = `mailto:${SITE.email}`; a.textContent = SITE.email; });
    $$(".js-booking").forEach((a) => (a.href = SITE.bookingUrl || `mailto:${SITE.email}`));
    $("#year").textContent = new Date().getFullYear();
    $("#socials").innerHTML = Object.entries(SITE.socials || {}).filter(([, v]) => v)
      .map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(k)} ↗</a>`).join("");

    const ticks = EXPERIENCE.map((b) => `<div class="tick"><b>${esc(b.name)}</b><span>${esc(b.type)}</span></div>`).join("");
    $("#boardTrack").innerHTML = ticks + ticks;

    const word = `<span>${esc(SITE.name)}</span><span><em>✦</em> Finance <em>✦</em> SaaS <em>✦</em></span>`;
    $("#footTrack").innerHTML = word + word + word + word;
  }

  /* ---------------- cursor ---------------- */
  const mouse = { x: -100, y: -100 };
  function initCursor() {
    if (!fine) return;
    const c = $("#cursor"), label = $("#cursorLabel"), p = { x: -100, y: -100 };
    addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    (function loop() {
      p.x = lerp(p.x, mouse.x, 0.2); p.y = lerp(p.y, mouse.y, 0.2);
      c.style.transform = `translate3d(${p.x}px,${p.y}px,0)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      const lab = e.target.closest("[data-cursor]");
      c.classList.toggle("is-label", !!lab);
      c.classList.toggle("is-link", !lab && !!e.target.closest("a, button"));
      if (lab) label.textContent = lab.dataset.cursor;
    });
  }

  /* ---------------- clocks / NYSE ---------------- */
  function initClocks() {
    const t = (tz) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz }).format(new Date());
    const tick = () => {
      const ny = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
      const m = ny.getHours() * 60 + ny.getMinutes();
      const open = ny.getDay() > 0 && ny.getDay() < 6 && m >= 570 && m < 960;
      $("#nyse").classList.toggle("is-open", open);
      $("#nyseText").textContent = `NYSE ${open ? "OPEN" : "CLOSED"} · ${t("America/New_York")} ET`;
      $("#cNY").textContent = t("America/New_York");
      $("#cSF").textContent = t("America/Los_Angeles");
      $("#cIN").textContent = t("Asia/Kolkata");
    };
    tick(); setInterval(tick, 15000);
  }

  function initMenu() {
    $("#burger").addEventListener("click", () => document.body.classList.toggle("sheet-open"));
    $$("#sheet a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("sheet-open")));
  }

  function initRotator() {
    const el = $("#rot"), words = SITE.niches || ["brokerages"];
    let i = 0;
    el.textContent = words[0];
    setInterval(() => {
      el.classList.add("out");
      setTimeout(() => { i = (i + 1) % words.length; el.textContent = words[i]; el.classList.remove("out"); }, 380);
    }, 2400);
  }

  /* ---------------- portal scene (canvas behind the word) ---------------- */
  const scene = { dim: 0 };
  function initScene() {
    const cv = $("#scene"), ctx = cv.getContext("2d");
    let w, h, dpr;
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size(); addEventListener("resize", size);
    const lines = Array.from({ length: 16 }, (_, i) => ({ off: i * 0.37, amp: 0.05 + (i % 5) * 0.025, speed: 0.15 + (i % 4) * 0.06, y: 0.15 + (i / 16) * 0.8 }));
    let t = 0, visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(cv);
    (function draw() {
      requestAnimationFrame(draw);
      if (!visible) return;
      t += reduce ? 0 : 0.008;
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#0b1a3a"); g.addColorStop(0.5, "#0a1430"); g.addColorStop(1, "#050a18");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const r = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, Math.max(w, h) * 0.7);
      r.addColorStop(0, "rgba(77,141,255,.55)"); r.addColorStop(1, "rgba(77,141,255,0)");
      ctx.fillStyle = r; ctx.fillRect(0, 0, w, h);
      // flowing price ribbons
      lines.forEach((L, i) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const k = x / w;
          const y = h * (L.y - k * 0.12) + Math.sin(k * 7 + t * L.speed * 6 + L.off) * h * L.amp * 0.4 + Math.sin(k * 23 + t * 2 + i) * 6;
          x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        const a = 0.18 + (i % 3) * 0.12;
        ctx.strokeStyle = i % 4 === 0 ? `rgba(169,200,255,${a + 0.2})` : `rgba(77,141,255,${a})`;
        ctx.lineWidth = i % 4 === 0 ? 2 : 1;
        ctx.stroke();
      });
      // grid
      ctx.strokeStyle = "rgba(255,255,255,.05)"; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 80) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke(); }
      // darken once content sits on top
      if (scene.dim > 0) { ctx.fillStyle = `rgba(7,9,13,${scene.dim})`; ctx.fillRect(0, 0, w, h); }
    })();
  }

  /* ---------------- portal zoom ---------------- */
  const portal = {};
  function initPortal() {
    portal.section = $("#portal");
    portal.word = $("#word");
    portal.mask = $("#mask");
    portal.after = $("#after");
    portal.ui = $("#portalUi");
    portal.word.style.position = "relative";
    const fit = () => {
      portal.word.style.fontSize = "100px";
      const wpx = portal.word.scrollWidth;
      const fs = Math.min((innerWidth * 0.9) / wpx * 100, innerHeight * 0.55);
      portal.word.style.fontSize = fs + "px";
      const L = $("#zoomLetter");
      const ox = L.offsetLeft + L.offsetWidth * 0.5;
      const oy = portal.word.offsetHeight * 0.48;
      portal.word.style.setProperty("--ox", `${ox}px`);
      portal.word.style.setProperty("--oy", `${oy}px`);
    };
    fit();
    addEventListener("resize", fit);
    document.fonts && document.fonts.ready.then(fit);
  }
  function updatePortal(vh) {
    const r = portal.section.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - vh));
    const z = clamp(p / 0.7);
    portal.word.style.setProperty("--zoom", (1 + Math.pow(z, 3.2) * 90).toFixed(3));
    portal.mask.style.setProperty("--mask", (1 - clamp((p - 0.6) / 0.15)).toFixed(3));
    portal.mask.style.visibility = p > 0.76 ? "hidden" : "visible";
    const a = clamp((p - 0.62) / 0.2);
    portal.after.style.setProperty("--after", a.toFixed(3));
    portal.after.style.pointerEvents = a > 0.5 ? "auto" : "none";
    portal.ui.style.setProperty("--ui", (1 - clamp(p * 8)).toFixed(3));
    scene.dim = 0.62 * a;
  }

  /* ---------------- niches ---------------- */
  function initNiches() {
    $$(".nrow").forEach((row) => $(".nrow__head", row).addEventListener("click", () => {
      const open = !row.classList.contains("is-open");
      $$(".nrow").forEach((r) => { r.classList.remove("is-open"); $(".nrow__head", r).setAttribute("aria-expanded", "false"); });
      if (open) { row.classList.add("is-open"); $(".nrow__head", row).setAttribute("aria-expanded", "true"); }
    }));
  }

  /* ---------------- case art (used until a video is added) ---------------- */
  const arts = new Set();
  function makeArt(canvas, color, seed) {
    const ctx = canvas.getContext("2d"), R = rng(seed * 97 + 13);
    const pts = []; let v = 20;
    for (let i = 0; i < 48; i++) { v += (R() - 0.32) * 9; v = Math.max(4, v); pts.push(v); }
    const bars = Array.from({ length: 18 }, () => 0.2 + R() * 0.8);
    const art = { canvas, visible: false, t: 0 };
    art.draw = (dt) => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      art.t += dt * 0.001; const t = art.t;
      ctx.fillStyle = "#070a10"; ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * .75, h * .2, 0, w * .75, h * .2, Math.max(w, h) * .8);
      g.addColorStop(0, hexA(color, .25)); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(255,255,255,.05)";
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y + .5); ctx.lineTo(w, y + .5); ctx.stroke(); }
      const bw = w / bars.length;
      bars.forEach((b, i) => { const bh = h * .28 * b * (.75 + .25 * Math.sin(t * 1.4 + i * .6)); ctx.fillStyle = hexA(color, .12 + .1 * b); ctx.fillRect(i * bw + bw * .2, h - bh, bw * .6, bh); });
      const prog = clamp(((t * .25) % 1.3) / 1), max = Math.max(...pts), n = pts.length;
      const X = (i) => (i / (n - 1)) * w, Y = (val) => h * .86 - (val / max) * h * .62, upto = Math.max(2, Math.floor(prog * n));
      ctx.beginPath(); for (let i = 0; i < upto; i++) i ? ctx.lineTo(X(i), Y(pts[i])) : ctx.moveTo(X(i), Y(pts[i]));
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.shadowColor = color; ctx.shadowBlur = 16; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.lineTo(X(upto - 1), h); ctx.lineTo(0, h); ctx.closePath();
      const ag = ctx.createLinearGradient(0, h * .2, 0, h); ag.addColorStop(0, hexA(color, .25)); ag.addColorStop(1, hexA(color, 0)); ctx.fillStyle = ag; ctx.fill();
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(X(upto - 1), Y(pts[upto - 1]), 5, 0, 7); ctx.fill();
    };
    new IntersectionObserver(([e]) => (art.visible = e.isIntersecting)).observe(canvas);
    arts.add(art);
  }
  function runArts() {
    let last = performance.now();
    (function loop(now) {
      const dt = Math.min(now - last, 50); last = now;
      arts.forEach((a) => { if (!document.body.contains(a.canvas)) return arts.delete(a); if (a.visible) a.draw(dt); });
      requestAnimationFrame(loop);
    })(last);
  }
  function attachVideo(box, src) {
    if (!src) return;
    const v = document.createElement("video");
    Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, preload: "metadata", src: /^(https?:|\/)/.test(src) ? src : BASE + src });
    v.addEventListener("loadeddata", () => { box.classList.add("has-video"); v.play().catch(() => {}); }, { once: true });
    v.addEventListener("error", () => v.remove(), { once: true });
    box.appendChild(v);
  }

  /* ---------------- horizontal case gallery ---------------- */
  const hs = {};
  function initGallery() {
    hs.section = $("#work"); hs.track = $("#hsTrack");
    CASES.forEach((c, i) => {
      const el = document.createElement("article");
      el.className = "hcard"; el.style.setProperty("--c", c.color); el.dataset.cursor = "Open case";
      el.innerHTML = `
        <div class="hcard__info">
          <span class="eyebrow">${esc(c.sector)}</span>
          <h3 class="hcard__title">${esc(c.title)}</h3>
          <div class="hcard__tags">${c.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          <div class="hcard__metric"><b>${esc(c.headline)}</b><span>${esc(c.headlineLabel)}</span></div>
        </div>
        <div class="hcard__media"><canvas></canvas></div>`;
      makeArt($("canvas", el), c.color, i + 1);
      attachVideo($(".hcard__media", el), c.video);
      el.addEventListener("click", () => openCase(i));
      hs.track.appendChild(el);
    });
    const end = document.createElement("a");
    end.className = "hcard hcard--end"; end.href = "#start";
    end.innerHTML = `<div><b>Your brand<br />could be next.</b><span>Get a free sample edit →</span></div>`;
    hs.track.appendChild(end);
    $("#hsTotal").textContent = pad(CASES.length);
    const size = () => {
      hs.extra = Math.max(0, hs.track.scrollWidth - innerWidth);
      hs.section.style.height = innerHeight + hs.extra + "px";
    };
    size(); addEventListener("resize", size);
    document.fonts && document.fonts.ready.then(size);
  }
  function updateGallery() {
    const r = hs.section.getBoundingClientRect();
    const p = clamp(-r.top / (hs.extra || 1));
    hs.track.style.transform = `translate3d(${-p * hs.extra}px,0,0)`;
    $("#hsBar").style.width = p * 100 + "%";
    $("#hsCount").textContent = pad(Math.min(CASES.length, 1 + Math.floor(p * CASES.length)));
  }

  /* ---------------- case overlay ---------------- */
  const cs = { idx: 0 };
  function countUp(el, to, suf, dur = 1500) {
    const dec = String(to).includes(".") ? 1 : 0, s = performance.now();
    (function step(now) {
      const t = clamp((now - s) / dur), e = 1 - Math.pow(1 - t, 4);
      el.textContent = (dec ? (to * e).toFixed(1) : fmt(Math.round(to * e))) + suf;
      if (t < 1) requestAnimationFrame(step);
    })(s);
  }
  function renderCase(i) {
    const c = CASES[i], n = CASES[(i + 1) % CASES.length];
    cs.idx = i;
    cs.el.style.setProperty("--c", c.color);
    $("#caseIdx").textContent = `${pad(i + 1)} / ${pad(CASES.length)}`;
    cs.body.innerHTML = `
      <div class="cgrid">
        <aside class="cside">
          <span class="eyebrow">${esc(c.client)} · ${esc(c.sector)}</span>
          <h2>${esc(c.title)}</h2>
          <div class="cside__big"><b>${esc(c.headline)}</b><span>${esc(c.headlineLabel)}</span></div>
          <div class="cside__res">${c.results.map((r) => `<div><span>${esc(r.label)}</span><b data-to="${r.n}" data-suf="${esc(r.suf)}">0</b></div>`).join("")}</div>
        </aside>
        <div class="cmain">
          <div class="cmedia"><canvas></canvas></div>
          <section class="cblock"><h3>The brief</h3><p>${esc(c.brief)}</p></section>
          <section class="cblock"><h3>The insight</h3><p>${esc(c.insight)}</p></section>
          <section class="cblock"><h3>What we made</h3><div class="cmade">${c.execution.map((x) => `<div><b>${esc(x.k)}</b><span>${esc(x.v)}</span></div>`).join("")}</div></section>
          <section class="cblock"><h3>In their words</h3><p class="cquote">“${esc(c.quote)}”</p><small>${esc(c.quoteBy)}</small></section>
          <button class="cnext" style="--nc:${n.color}" data-cursor="Next case"><span class="eyebrow">Next case · ${esc(n.sector)}</span><strong>${esc(n.title)} →</strong></button>
        </div>
      </div>`;
    makeArt($(".cmedia canvas", cs.body), c.color, i + 11);
    attachVideo($(".cmedia", cs.body), c.video);
    $$("[data-to]", cs.body).forEach((b) => countUp(b, +b.dataset.to, b.dataset.suf));
    $(".cnext", cs.body).addEventListener("click", () => goCase(i + 1));
    cs.body.scrollTop = 0;
  }
  function openCase(i) {
    renderCase(i);
    cs.el.classList.remove("is-closing");
    cs.el.classList.add("is-open");
    cs.el.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock");
  }
  function closeCase() {
    if (!cs.el.classList.contains("is-open")) return;
    cs.el.classList.add("is-closing");
    document.body.classList.remove("lock");
    setTimeout(() => { cs.el.classList.remove("is-open", "is-closing"); cs.el.setAttribute("aria-hidden", "true"); cs.body.innerHTML = ""; }, 700);
  }
  function goCase(i) {
    i = (i + CASES.length) % CASES.length;
    cs.body.classList.add("fade");
    setTimeout(() => { renderCase(i); cs.body.classList.remove("fade"); }, 400);
  }
  function initCase() {
    cs.el = $("#case"); cs.body = $("#caseBody");
    $("#caseClose").addEventListener("click", closeCase);
    $("#caseNext").addEventListener("click", () => goCase(cs.idx + 1));
    addEventListener("keydown", (e) => {
      if (!cs.el.classList.contains("is-open")) return;
      if (e.key === "Escape") closeCase();
      if (e.key === "ArrowRight") goCase(cs.idx + 1);
      if (e.key === "ArrowLeft") goCase(cs.idx - 1);
    });
  }

  /* ---------------- rate card ---------------- */
  function initRates() {
    const meta = [
      ["EXPL", "5–7 days", "Finance + SaaS", "16:9 · 9:16"],
      ["LNCH", "2–3 weeks", "Launches", "16:9"],
      ["SHRT", "5 / week", "Audience growth", "9:16"],
      ["TALK", "48h / edit", "Thought leadership", "9:16 · 16:9"],
      ["UIMO", "3–5 days", "SaaS + fintech", "Any"],
      ["PERF", "72h / batch", "Paid social", "1:1 · 9:16"]
    ];
    $("#quoteRows").innerHTML = SERVICES.map((s, i) => {
      const [sym, tt, best, fmtStr] = meta[i] || ["SRVC", "On request", "Finance + SaaS", "Any"];
      const R = rng(i + 3); let y = 12, d = "M0 12";
      for (let x = 4; x <= 46; x += 4) { y = Math.max(1, Math.min(13, y - R() * 3 + 0.9)); d += ` L${x} ${y.toFixed(1)}`; }
      return `<div class="qline" tabindex="0">
        <div class="quote__row">
          <span class="q-sym"><svg class="q-spark" viewBox="0 0 46 14" aria-hidden="true"><path d="${d}" fill="none" stroke="#4d8dff" stroke-width="1.5"/></svg>${sym}</span>
          <span class="q-name">${esc(s.name)}</span>
          <span class="q-t">${tt}</span>
          <span class="q-for">${best}</span>
          <span class="q-chg">${fmtStr}</span>
        </div>
        <div class="q-desc"><p>${esc(s.desc)}</p></div>
      </div>`;
    }).join("");
  }

  /* ---------------- process timeline ---------------- */
  function updateTimeline(vh) {
    const tl = $("#tl"), r = tl.getBoundingClientRect();
    const p = clamp((vh * 0.6 - r.top) / r.height);
    $("#tlFill").style.height = p * 100 + "%";
    $$("li", tl).forEach((li) => li.classList.toggle("on", li.getBoundingClientRect().top < vh * 0.62));
  }

  /* ---------------- magnetic orb ---------------- */
  function initOrb() {
    if (!fine) return;
    const zone = $("#orbZone"), orb = $("#orb");
    zone.addEventListener("pointermove", (e) => {
      const r = zone.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.35, y = (e.clientY - r.top - r.height / 2) * 0.35;
      orb.style.transform = `translate(${x}px, ${y}px) scale(1.04)`;
    });
    zone.addEventListener("pointerleave", () => (orb.style.transform = ""));
  }

  /* ---------------- anchors ---------------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const t = id === "#top" ? null : id.length > 1 && $(id);
      if (t === false) return;
      e.preventDefault();
      scrollTo({ top: t ? t.getBoundingClientRect().top + scrollY - 10 : 0, behavior: reduce ? "auto" : "smooth" });
    }));
  }

  /* ---------------- master loop ---------------- */
  function loop() {
    const vh = innerHeight;
    $("#bar").classList.toggle("is-solid", scrollY > portal.section.offsetHeight - vh * 0.5);
    updatePortal(vh);
    updateGallery();
    updateTimeline(vh);
    requestAnimationFrame(loop);
  }

  fill();
  initCursor();
  initClocks();
  initMenu();
  initRotator();
  initScene();
  initPortal();
  initNiches();
  initGallery();
  initCase();
  initRates();
  initOrb();
  initAnchors();
  runArts();
  loop();
})();
