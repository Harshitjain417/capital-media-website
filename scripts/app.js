/* =========================================================
   Capital Media: cinematic edition
   Each scene reads its own scroll progress inside one rAF loop.
   ========================================================= */
(() => {
  const SITE = window.SITE || {};
  const CASES = window.CASES || [];
  const SERVICES = window.SERVICES || [];
  const EXPERIENCE = window.EXPERIENCE || [];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (n) => (n >= 1000 ? n.toLocaleString("en-US") : String(n));
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };
  // progress of a tall sticky section: 0 when its top hits the viewport top, 1 when its bottom does
  const progress = (el, vh) => { const r = el.getBoundingClientRect(); return clamp(-r.top / (r.height - vh)); };

  /* ---------------- content ---------------- */
  function fill() {
    $$(".js-email").forEach((a) => (a.href = `mailto:${SITE.email}`));
    $$(".js-email-text").forEach((e) => (e.textContent = SITE.email));
    $$(".js-booking").forEach((a) => (a.href = SITE.bookingUrl || `mailto:${SITE.email}`));
    $("#year").textContent = new Date().getFullYear();
    $("#socials").innerHTML = Object.entries(SITE.socials || {}).filter(([, v]) => v)
      .map(([k, v]) => `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(k)}</a>`).join("");
    $("#wallNames").innerHTML = EXPERIENCE.map((b) => `<li><b>${esc(b.name)}</b><small>${esc(b.type)}</small></li>`).join("");
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

  function initClocks() {
    const t = (tz) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz }).format(new Date());
    const tick = () => { $("#cNY").textContent = t("America/New_York"); $("#cSF").textContent = t("America/Los_Angeles"); $("#cIN").textContent = t("Asia/Kolkata"); };
    tick(); setInterval(tick, 15000);
  }

  /* ---------------- 3. light: services reel ---------------- */
  const light = { idx: -1 };
  function initLight() {
    light.section = $("#light");
    light.reel = $("#lightReel");
    light.desc = $("#lightDesc");
    light.lamp = $(".light__lamp");
    light.reel.innerHTML = SERVICES.map((s) => `<span class="light__item">${esc(s.name)}</span>`).join("");
    light.items = $$(".light__item", light.reel);
  }
  function updateLight(vh) {
    const p = progress(light.section, vh);
    const n = light.items.length;
    if (!n) return;
    const f = clamp(p * 1.1 - 0.05) * (n - 1);
    const itemH = light.items[0].offsetHeight;
    const focus = vh * 0.45 - vh * 0.5; // the beam's brightest point, relative to the reel's anchor
    light.reel.style.transform = `translate3d(0, ${focus - (f + 0.5) * itemH}px, 0)`;
    const idx = Math.round(f);
    if (idx !== light.idx) {
      light.idx = idx;
      light.items.forEach((it, i) => it.classList.toggle("lit", i === idx));
      light.desc.classList.add("swap");
      setTimeout(() => { light.desc.textContent = SERVICES[idx].desc; light.desc.classList.remove("swap"); }, 200);
    }
    const near = 1 - Math.min(1, Math.abs(f - idx) * 2);
    light.lamp.style.setProperty("--glow", (0.06 + near * 0.16).toFixed(3));
  }

  /* ---------------- 4. window zoom ---------------- */
  const win = {};
  function initWindow() {
    win.section = $("#window"); win.img = $("#windowImg"); win.pin = $(".window__pin");
    const place = () => {
      // where the window glass (46% x, 45% y of the photo) lands inside a cover-fitted background
      const W = win.pin.clientWidth, H = win.pin.clientHeight, iw = 736, ih = 981;
      const s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
      const ox = (W - dw) * 0.5 + dw * 0.465, oy = (H - dh) * 0.45 + dh * 0.45;
      win.img.style.transformOrigin = `${ox}px ${oy}px`;
    };
    place(); addEventListener("resize", place);
  }
  function updateWindow(vh) {
    const p = progress(win.section, vh);
    const z = clamp(p / 0.85);
    win.img.style.setProperty("--wz", (1 + Math.pow(z, 2.6) * 7).toFixed(3));
    const tIn = clamp((p - 0.08) / 0.2), tOut = 1 - clamp((p - 0.5) / 0.18);
    win.pin.style.setProperty("--wt", Math.min(tIn, tOut).toFixed(3));
    win.pin.style.setProperty("--wsky", clamp((p - 0.72) / 0.25).toFixed(3));
  }

  /* ---------------- 2. fog ---------------- */
  const fog = {};
  function initFog() {
    fog.section = $("#fog"); fog.img = $("#fogImg"); fog.layer = $("#fogLayer");
    fog.lines = $$(".fog__line").map((el) => ({ el, at: +el.dataset.at }));
  }
  function updateFog(vh) {
    const p = progress(fog.section, vh);
    fog.img.style.setProperty("--fz", (1.15 - p * 0.15).toFixed(3));
    fog.layer.style.setProperty("--fog", (1 - clamp(p / 0.8) * 0.9).toFixed(3));
    fog.lines.forEach((l, i) => {
      const next = fog.lines[i + 1];
      const on = p >= l.at && (!next || p < next.at);
      l.el.classList.toggle("on", on);
      l.el.classList.toggle("gone", !on && p >= l.at);
    });
  }

  /* ---------------- case art (until real videos are added) ---------------- */
  const arts = new Set();
  function makeArt(canvas, color, seed) {
    const ctx = canvas.getContext("2d"), R = rng(seed * 97 + 13);
    const pts = []; let v = 20;
    for (let i = 0; i < 48; i++) { v += (R() - 0.32) * 9; v = Math.max(4, v); pts.push(v); }
    const bars = Array.from({ length: 20 }, () => 0.2 + R() * 0.8);
    const art = { canvas, visible: false, t: 0 };
    art.draw = (dt) => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      art.t += dt * 0.001; const t = art.t;
      ctx.fillStyle = "#0d0f12"; ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * .7, h * .25, 0, w * .7, h * .25, Math.max(w, h) * .8);
      g.addColorStop(0, hexA(color, .28)); g.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const bw = w / bars.length;
      bars.forEach((b, i) => { const bh = h * .3 * b * (.75 + .25 * Math.sin(t * 1.3 + i * .6)); ctx.fillStyle = hexA(color, .1 + .12 * b); ctx.fillRect(i * bw + bw * .22, h - bh, bw * .56, bh); });
      const prog = clamp(((t * .22) % 1.3)), max = Math.max(...pts), n = pts.length;
      const X = (i) => (i / (n - 1)) * w, Y = (val) => h * .84 - (val / max) * h * .55, upto = Math.max(2, Math.floor(prog * n));
      ctx.beginPath(); for (let i = 0; i < upto; i++) i ? ctx.lineTo(X(i), Y(pts[i])) : ctx.moveTo(X(i), Y(pts[i]));
      ctx.strokeStyle = color; ctx.lineWidth = 2.4; ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.stroke(); ctx.shadowBlur = 0;
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
    Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, preload: "metadata", src });
    v.addEventListener("loadeddata", () => { box.classList.add("has-video"); v.play().catch(() => {}); }, { once: true });
    v.addEventListener("error", () => v.remove(), { once: true });
    box.appendChild(v);
  }

  /* ---------------- 5. case cards ---------------- */
  let panels = [];
  function initCases() {
    $("#cases").innerHTML = CASES.map((c, i) => `
      <article class="ccard" style="--c:${c.color}">
        <div class="ccard__info">
          <span class="ccard__sector">${esc(c.client)} · ${esc(c.sector)}</span>
          <h3 class="ccard__title">${esc(c.title)}</h3>
          <div class="ccard__metric"><b>${esc(c.headline)}</b><span>${esc(c.headlineLabel)}</span></div>
          <button class="pill pill--dark ccard__open" data-case="${i}">Read the case study <b>›</b></button>
        </div>
        <div class="ccard__panel" data-case="${i}" role="button" tabindex="0" aria-label="Open case study: ${esc(c.title)}">
          <div class="ccard__ui"><span><i></i><i></i><i></i></span><span>${esc(c.tags[0])}</span></div>
          <canvas></canvas>
          <span class="ccard__play" aria-hidden="true"></span>
        </div>
      </article>`).join("");
    panels = $$(".ccard__panel");
    panels.forEach((p, i) => { makeArt($("canvas", p), CASES[i].color, i + 1); attachVideo(p, CASES[i].video); });
    $$("[data-case]").forEach((el) => {
      el.addEventListener("click", () => openCase(+el.dataset.case));
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCase(+el.dataset.case); } });
    });
  }
  function updateCases(vh) {
    panels.forEach((p) => {
      const r = p.getBoundingClientRect();
      const tilt = clamp((r.top - vh * 0.18) / (vh * 0.6));
      p.style.setProperty("--tilt", tilt.toFixed(3));
    });
  }

  /* ---------------- case panel ---------------- */
  const cp = { idx: 0 };
  function countUp(el, to, suf, dur = 1500) {
    const dec = String(to).includes(".") ? 1 : 0, s = performance.now();
    (function step(now) {
      const t = clamp((now - s) / dur), e = 1 - Math.pow(1 - t, 4);
      el.textContent = (dec ? (to * e).toFixed(1) : fmt(Math.round(to * e))) + suf;
      if (t < 1) requestAnimationFrame(step);
    })(s);
  }
  function setInset(r) {
    const s = cp.el.style;
    if (!r) { s.setProperty("--ct", "100%"); s.setProperty("--cr", "0px"); s.setProperty("--cb", "0px"); s.setProperty("--cl", "0px"); return; }
    s.setProperty("--ct", `${r.top}px`); s.setProperty("--cl", `${r.left}px`);
    s.setProperty("--cr", `${innerWidth - r.right}px`); s.setProperty("--cb", `${innerHeight - r.bottom}px`);
  }
  function renderCase(i) {
    const c = CASES[i], n = CASES[(i + 1) % CASES.length];
    cp.idx = i;
    cp.el.style.setProperty("--c", c.color);
    $("#cpIdx").textContent = `${pad(i + 1)} / ${pad(CASES.length)}`;
    cp.body.innerHTML = `
      <header class="cp-hero">
        <p class="kicker">${esc(c.client)} · ${esc(c.sector)}</p>
        <h2 class="cp-title">${esc(c.title)}</h2>
        <div class="cp-big"><b>${esc(c.headline)}</b><span>${esc(c.headlineLabel)}</span></div>
      </header>
      <div class="cp-media"><canvas></canvas></div>
      <section class="cp-sec"><h3>The brief</h3><p>${esc(c.brief)}</p></section>
      <section class="cp-sec"><h3>The idea</h3><p>${esc(c.insight)}</p></section>
      <section class="cp-sec"><h3>What we made</h3><div class="cp-made">${c.execution.map((x) => `<div><b>${esc(x.k)}</b><span>${esc(x.v)}</span></div>`).join("")}</div></section>
      <section class="cp-sec cp-results"><h3>Results</h3><div class="cp-res">${c.results.map((r) => `<div><b data-to="${r.n}" data-suf="${esc(r.suf)}">0</b><span>${esc(r.label)}</span></div>`).join("")}</div></section>
      <section class="cp-sec"><h3>In their words</h3><div><p class="cp-quote">“${esc(c.quote)}”</p><small>${esc(c.quoteBy)}</small></div></section>
      <button class="cp-next" style="--nc:${n.color}"><span class="kicker">Next case · ${esc(n.sector)}</span><strong>${esc(n.title)} →</strong></button>`;
    makeArt($(".cp-media canvas", cp.body), c.color, i + 11);
    attachVideo($(".cp-media", cp.body), c.video);
    $(".cp-next", cp.body).addEventListener("click", () => goCase(i + 1));
    const res = $(".cp-results", cp.body);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      $$("[data-to]", res).forEach((b) => countUp(b, +b.dataset.to, b.dataset.suf));
    }, { root: cp.scroll, threshold: 0.3 });
    io.observe(res);
    cp.scroll.scrollTop = 0;
  }
  function openCase(i) {
    renderCase(i);
    cp.el.classList.remove("is-anim");
    setInset(panels[i] ? panels[i].getBoundingClientRect() : null);
    cp.el.classList.add("is-open");
    cp.el.setAttribute("aria-hidden", "false");
    void cp.el.offsetWidth;
    cp.el.classList.add("is-anim");
    ["--ct", "--cr", "--cb", "--cl"].forEach((k) => cp.el.style.setProperty(k, "0px"));
    document.body.classList.add("lock");
  }
  function closeCase() {
    if (!cp.el.classList.contains("is-open")) return;
    const p = panels[cp.idx], r = p && p.getBoundingClientRect();
    setInset(r && r.bottom > 0 && r.top < innerHeight ? r : null);
    document.body.classList.remove("lock");
    setTimeout(() => { cp.el.classList.remove("is-open", "is-anim"); cp.el.setAttribute("aria-hidden", "true"); cp.body.innerHTML = ""; }, 900);
  }
  function goCase(i) {
    i = (i + CASES.length) % CASES.length;
    cp.body.classList.add("fade");
    setTimeout(() => { renderCase(i); cp.body.classList.remove("fade"); }, 400);
  }
  function initPanel() {
    cp.el = $("#cpanel"); cp.body = $("#cpBody"); cp.scroll = $("#cpScroll");
    $("#cpClose").addEventListener("click", closeCase);
    $("#cpNext").addEventListener("click", () => goCase(cp.idx + 1));
    addEventListener("keydown", (e) => {
      if (!cp.el.classList.contains("is-open")) return;
      if (e.key === "Escape") closeCase();
      if (e.key === "ArrowRight") goCase(cp.idx + 1);
      if (e.key === "ArrowLeft") goCase(cp.idx - 1);
    });
  }

  /* ---------------- 6. steps ---------------- */
  const steps = { idx: -1 };
  function initSteps() { steps.items = $$("#stepList li"); steps.img = $(".steps__img"); steps.now = $("#stepNow"); }
  function updateSteps(vh) {
    let idx = 0;
    steps.items.forEach((li, i) => { if (li.getBoundingClientRect().top < vh * 0.6) idx = i; });
    if (idx === steps.idx) return;
    steps.idx = idx;
    steps.items.forEach((li, i) => li.classList.toggle("on", i === idx));
    steps.now.textContent = pad(idx + 1);
    steps.img.style.setProperty("--sz", (1.16 - idx * 0.04).toFixed(3));
  }

  /* ---------------- anchors ---------------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const t = id === "#top" ? null : id.length > 1 && $(id);
      if (t === false) return;
      e.preventDefault();
      scrollTo({ top: t ? t.getBoundingClientRect().top + scrollY : 0, behavior: reduce ? "auto" : "smooth" });
    }));
  }

  /* ---------------- master loop ---------------- */
  function loop() {
    const vh = innerHeight, y = scrollY;
    $("#nav").classList.toggle("is-pill", y > vh * 0.55);
    const hp = clamp(y / vh);
    const hero = $("#hero");
    hero.style.setProperty("--hy", hp.toFixed(3));
    $("#heroImg").style.setProperty("--hz", (1.12 - hp * 0.1).toFixed(3));
    updateFog(vh);
    updateLight(vh);
    updateWindow(vh);
    updateCases(vh);
    updateSteps(vh);
    requestAnimationFrame(loop);
  }

  fill();
  initRotator();
  initClocks();
  initFog();
  initLight();
  initWindow();
  initCases();
  initPanel();
  initSteps();
  initAnchors();
  runArts();
  loop();
  requestAnimationFrame(() => document.body.classList.add("is-ready"));
})();
