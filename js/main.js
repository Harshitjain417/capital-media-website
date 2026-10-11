/* =========================================================
   Capital Media: interactions
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
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const hexA = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  // deterministic random so charts look the same on every load
  const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  /* ---------------- content ---------------- */
  function fillContent() {
    $$(".js-name").forEach((el) => (el.textContent = SITE.name));
    $$(".js-email").forEach((a) => { a.href = `mailto:${SITE.email}`; if (a.classList.contains("footer__email")) a.textContent = SITE.email; });
    $$(".js-booking").forEach((a) => (a.href = SITE.bookingUrl || `mailto:${SITE.email}`));
    $("#year").textContent = new Date().getFullYear();

    const socials = $("#socials");
    Object.entries(SITE.socials || {}).forEach(([k, v]) => {
      if (!v) return;
      socials.insertAdjacentHTML("beforeend", `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(k)} ↗</a>`);
    });

    // experience wall
    $("#expGrid").innerHTML = EXPERIENCE.map((b) => `<div class="brand"><b>${esc(b.name)}</b><span>${esc(b.type)}</span></div>`).join("");
    const grid = $("#expGrid");
    grid.addEventListener("pointermove", (e) => {
      $$(".brand", grid).forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });

    // services
    $("#svcList").innerHTML = SERVICES.map((s, i) => `
      <li><div class="svc__row">
        <span class="svc__n">( ${String(i + 1).padStart(2, "0")} )</span>
        <span class="svc__name">${esc(s.name)}</span>
        <span class="svc__desc">${esc(s.desc)}</span>
        <span class="svc__arrow">→</span>
      </div></li>`).join("");
  }

  const fmt = (n) => (n >= 1000 ? n.toLocaleString("en-US") : String(n));

  /* ---------------- cursor ---------------- */
  const mouse = { x: -100, y: -100 };
  function initCursor() {
    if (!fine) return;
    const c = $("#cursor"), label = $("#cursorLabel");
    const p = { x: -100, y: -100 };
    addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    document.addEventListener("mouseleave", () => c.classList.add("is-hidden"));
    document.addEventListener("mouseenter", () => c.classList.remove("is-hidden"));
    (function loop() {
      p.x = lerp(p.x, mouse.x, 0.22); p.y = lerp(p.y, mouse.y, 0.22);
      c.style.transform = `translate3d(${p.x}px,${p.y}px,0)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      const lab = e.target.closest("[data-cursor]");
      const link = e.target.closest("a, button, .panel:not(.is-open)");
      c.classList.toggle("is-label", !!lab);
      c.classList.toggle("is-link", !lab && !!link);
      if (lab) label.textContent = lab.dataset.cursor;
    });
  }

  /* ---------------- clocks ---------------- */
  function initClocks() {
    const t = (tz) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: tz }).format(new Date());
    const tick = () => {
      $("#cNY").textContent = t("America/New_York");
      $("#cSF").textContent = t("America/Los_Angeles");
      $("#cIN").textContent = t("Asia/Kolkata");
    };
    tick(); setInterval(tick, 15000);
  }

  /* ---------------- nav / menu ---------------- */
  function initNav() {
    $("#burger").addEventListener("click", () => document.body.classList.toggle("menu-open"));
    $$("#menu a").forEach((a) => a.addEventListener("click", () => document.body.classList.remove("menu-open")));
  }

  /* ---------------- hero rotating niche ---------------- */
  function initRotator() {
    const words = SITE.niches || ["brokerages"];
    const em = $("#rot em");
    em.textContent = words[0];
    let i = 0;
    setInterval(() => {
      em.classList.add("out");
      setTimeout(() => {
        i = (i + 1) % words.length;
        em.textContent = words[i];
        em.classList.remove("out"); em.classList.add("pre");
        void em.offsetWidth;
        em.classList.remove("pre");
      }, 480);
    }, 2300);
  }

  /* ---------------- hero: live candlestick chart ---------------- */
  function initHeroChart() {
    const cv = $("#chart"), ctx = cv.getContext("2d"), hero = cv.parentElement;
    let w, h, dpr, candles = [], step = 14, offset = 0, visible = true;
    const R = rng(7);
    const local = { x: -1, y: -1 };

    const next = (prev) => {
      const o = prev, drift = 0.18, vol = 2.2;
      const c = o + (R() - 0.5 + drift * 0.3) * vol * 2;
      const hi = Math.max(o, c) + R() * vol, lo = Math.min(o, c) - R() * vol;
      return { o, c, hi, lo };
    };
    const build = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      step = w < 760 ? 10 : 14;
      const n = Math.ceil(w / step) + 4;
      candles = [];
      let v = 100;
      for (let i = 0; i < n; i++) { const k = next(v); candles.push(k); v = k.c; }
    };
    build();
    addEventListener("resize", build);
    hero.addEventListener("pointermove", (e) => { const r = hero.getBoundingClientRect(); local.x = e.clientX - r.left; local.y = e.clientY - r.top; });
    hero.addEventListener("pointerleave", () => (local.x = -1));
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(hero);

    let last = performance.now();
    const draw = (now) => {
      requestAnimationFrame(draw);
      if (!visible) return;
      const dt = Math.min(now - last, 50); last = now;
      offset += dt * 0.012;
      if (offset >= step) { offset -= step; candles.shift(); candles.push(next(candles[candles.length - 1].c)); }

      let min = Infinity, max = -Infinity;
      candles.forEach((k) => { min = Math.min(min, k.lo); max = Math.max(max, k.hi); });
      const top = h * 0.36, bot = h * 0.94;
      const Y = (v) => bot - ((v - min) / (max - min || 1)) * (bot - top);
      const X = (i) => i * step - offset;

      ctx.clearRect(0, 0, w, h);
      // horizontal guides
      ctx.strokeStyle = "rgba(241,236,226,.05)"; ctx.lineWidth = 1;
      for (let g = 0; g < 5; g++) { const y = top + ((bot - top) / 4) * g; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      // candles
      candles.forEach((k, i) => {
        const x = X(i), up = k.c >= k.o;
        ctx.strokeStyle = ctx.fillStyle = up ? "rgba(242,181,68,.28)" : "rgba(241,236,226,.12)";
        ctx.beginPath(); ctx.moveTo(x, Y(k.hi)); ctx.lineTo(x, Y(k.lo)); ctx.stroke();
        const y1 = Y(Math.max(k.o, k.c)), y2 = Y(Math.min(k.o, k.c));
        ctx.fillRect(x - step * 0.3, y1, step * 0.6, Math.max(1, y2 - y1));
      });

      // close line + area
      ctx.beginPath();
      candles.forEach((k, i) => (i ? ctx.lineTo(X(i), Y(k.c)) : ctx.moveTo(X(i), Y(k.c))));
      ctx.strokeStyle = "rgba(242,181,68,.75)"; ctx.lineWidth = 1.6; ctx.shadowColor = "rgba(242,181,68,.6)"; ctx.shadowBlur = 12;
      ctx.stroke(); ctx.shadowBlur = 0;
      ctx.lineTo(X(candles.length - 1), h); ctx.lineTo(X(0), h); ctx.closePath();
      const gr = ctx.createLinearGradient(0, top, 0, h); gr.addColorStop(0, "rgba(242,181,68,.10)"); gr.addColorStop(1, "rgba(242,181,68,0)");
      ctx.fillStyle = gr; ctx.fill();

      // crosshair
      if (local.x >= 0 && fine) {
        const i = clamp(Math.round((local.x + offset) / step), 0, candles.length - 1);
        const x = X(i), y = Y(candles[i].c);
        ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(241,236,226,.35)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "#f2b544"; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
        const val = `VIEWS ${(candles[i].c / 6).toFixed(1)}M`;
        ctx.font = "500 11px 'JetBrains Mono', monospace";
        const tw = ctx.measureText(val).width + 16;
        ctx.fillStyle = "#f2b544"; ctx.fillRect(w - tw - 8, y - 11, tw, 22);
        ctx.fillStyle = "#1d1404"; ctx.fillText(val, w - tw, y + 4);
      }
    };
    if (!reduce) requestAnimationFrame(draw);
  }

  /* ---------------- art canvases for case studies ---------------- */
  // Animated "results dashboard" visual used when no video is provided.
  const arts = new Set();
  function makeArt(canvas, color, seed) {
    const ctx = canvas.getContext("2d");
    const R = rng(seed * 97 + 13);
    const pts = []; let v = 20;
    for (let i = 0; i < 48; i++) { v += (R() - 0.32) * 9; v = Math.max(4, v); pts.push(v); }
    const bars = Array.from({ length: 18 }, () => 0.2 + R() * 0.8);
    const art = { canvas, visible: false, t: 0 };
    art.draw = (dt) => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = r.width, h = r.height;
      if (!w || !h) return;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      art.t += dt * 0.001;
      const t = art.t;
      ctx.fillStyle = "#0b0a07"; ctx.fillRect(0, 0, w, h);
      // glow
      const g = ctx.createRadialGradient(w * 0.75, h * 0.2, 0, w * 0.75, h * 0.2, Math.max(w, h) * 0.8);
      g.addColorStop(0, hexA(color, 0.22)); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // grid
      ctx.strokeStyle = "rgba(255,255,255,.05)"; ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }
      // bars
      const bw = w / bars.length;
      bars.forEach((b, i) => {
        const bh = h * 0.28 * (b * (0.75 + 0.25 * Math.sin(t * 1.4 + i * 0.6)));
        ctx.fillStyle = hexA(color, 0.12 + 0.1 * b);
        ctx.fillRect(i * bw + bw * 0.2, h - bh, bw * 0.6, bh);
      });
      // line (draws in, then loops)
      const prog = clamp(((t * 0.25) % 1.3) / 1);
      const max = Math.max(...pts), n = pts.length;
      const X = (i) => (i / (n - 1)) * w, Y = (val) => h * 0.86 - (val / max) * h * 0.62;
      const upto = Math.max(2, Math.floor(prog * n));
      ctx.beginPath();
      for (let i = 0; i < upto; i++) i ? ctx.lineTo(X(i), Y(pts[i])) : ctx.moveTo(X(i), Y(pts[i]));
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.shadowColor = color; ctx.shadowBlur = 16; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.lineTo(X(upto - 1), h); ctx.lineTo(0, h); ctx.closePath();
      const ag = ctx.createLinearGradient(0, h * 0.2, 0, h); ag.addColorStop(0, hexA(color, 0.25)); ag.addColorStop(1, hexA(color, 0));
      ctx.fillStyle = ag; ctx.fill();
      // head dot + chip
      const hx = X(upto - 1), hy = Y(pts[upto - 1]);
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(hx, hy, 5, 0, 7); ctx.fill();
      ctx.strokeStyle = hexA(color, 0.4); ctx.beginPath(); ctx.arc(hx, hy, 10 + 4 * Math.sin(t * 4), 0, 7); ctx.stroke();
      // fake "player" frame lines to hint it's a video slot
      ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fillRect(20, 20, Math.min(160, w * 0.35), 8); ctx.fillRect(20, 36, Math.min(100, w * 0.22), 8);
    };
    new IntersectionObserver(([e]) => (art.visible = e.isIntersecting)).observe(canvas);
    arts.add(art);
    return art;
  }
  function runArts() {
    let last = performance.now();
    (function loop(now) {
      const dt = Math.min(now - last, 50); last = now;
      arts.forEach((a) => { if (!document.body.contains(a.canvas)) return arts.delete(a); if (a.visible) a.draw(dt); });
      requestAnimationFrame(loop);
    })(last);
  }

  // attach a video if the file exists, keeping the art canvas as fallback
  function attachVideo(container, src) {
    if (!src) return;
    const v = document.createElement("video");
    Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: true, preload: "metadata", src });
    v.addEventListener("loadeddata", () => { container.classList.add("has-video"); v.play().catch(() => {}); }, { once: true });
    v.addEventListener("error", () => v.remove(), { once: true });
    container.appendChild(v);
  }

  /* ---------------- promise text reveal ---------------- */
  let promiseWords = [];
  function initPromise() {
    const el = $("#promiseText");
    const accent = /^(boring|confusing|legal|understood|remembered|approved)/i;
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w${accent.test(w) ? " acc" : ""}">${esc(w)}</span>`).join(" ");
    promiseWords = $$(".w", el);
  }

  /* ---------------- counters ---------------- */
  function countUp(el, to, suf, dur = 1600) {
    const dec = String(to).includes(".") ? 1 : 0;
    const s = performance.now();
    (function step(now) {
      const t = clamp((now - s) / dur), e = 1 - Math.pow(1 - t, 4);
      el.textContent = (dec ? (to * e).toFixed(1) : fmt(Math.round(to * e))) + suf;
      if (t < 1) requestAnimationFrame(step);
    })(s);
  }
  function initKpis() {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      countUp(e.target, +e.target.dataset.to, e.target.dataset.suf);
    }), { threshold: 0.6 });
    $$(".kpi b").forEach((b) => io.observe(b));
  }

  /* ---------------- niche panels ---------------- */
  function openNiche(name) {
    $$(".panel").forEach((p) => p.classList.toggle("is-open", p.dataset.niche === name));
  }
  function initNiches() {
    $$(".panel").forEach((p) => p.addEventListener("click", () => openNiche(p.dataset.niche)));
    $$("[data-open-niche]").forEach((a) => a.addEventListener("click", () => setTimeout(() => openNiche(a.dataset.openNiche), 300)));
  }

  /* ---------------- case study stack ---------------- */
  let caseEls = [];
  function initCases() {
    const stack = $("#stack");
    CASES.forEach((c, i) => {
      const el = document.createElement("article");
      el.className = "case";
      el.style.setProperty("--c", c.color);
      el.dataset.cursor = "Open case";
      el.innerHTML = `
        <div class="case__info">
          <div class="case__top"><span class="label">${esc(c.sector)}</span><span class="label">${String(i + 1).padStart(2, "0")} / ${String(CASES.length).padStart(2, "0")}</span></div>
          <h3 class="case__title">${esc(c.title)}</h3>
          <div class="case__tags">${c.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          <div class="case__metric"><b>${esc(c.headline)}</b><span>${esc(c.headlineLabel)}</span></div>
          <span class="case__open">Read the case study <i></i></span>
        </div>
        <div class="case__media"><canvas></canvas></div>
        <div class="case__dim"></div>`;
      makeArt($("canvas", el), c.color, i + 1);
      attachVideo($(".case__media", el), c.video);
      el.addEventListener("click", () => openCase(i, el));
      stack.appendChild(el);
    });
    caseEls = $$(".case", stack);
  }
  function updateStack() {
    caseEls.forEach((el, i) => {
      const nextEl = caseEls[i + 1];
      if (!nextEl) return;
      const top = parseFloat(getComputedStyle(el).top);
      const r = nextEl.getBoundingClientRect();
      const p = clamp(1 - (r.top - top) / (innerHeight * 0.8));
      el.style.transform = `scale(${1 - p * 0.07}) translateY(${-p * 24}px)`;
      $(".case__dim", el).style.opacity = (p * 0.6).toFixed(3);
    });
  }

  /* ---------------- case study overlay ---------------- */
  const cs = { el: null, scroll: null, content: null, idx: 0, origin: null, io: null };
  function setInset(rect) {
    const s = cs.el.style;
    if (!rect) { ["--t", "--r", "--b", "--l"].forEach((k) => s.setProperty(k, "50%")); return; }
    s.setProperty("--t", `${rect.top}px`); s.setProperty("--l", `${rect.left}px`);
    s.setProperty("--r", `${innerWidth - rect.right}px`); s.setProperty("--b", `${innerHeight - rect.bottom}px`);
  }
  function renderCase(i) {
    const c = CASES[i], n = CASES[(i + 1) % CASES.length];
    cs.idx = i;
    cs.el.style.setProperty("--c", c.color);
    $("#csCount").textContent = `${String(i + 1).padStart(2, "0")} / ${String(CASES.length).padStart(2, "0")}`;
    cs.content.innerHTML = `
      <header class="cs__hero">
        <p class="label"><span>●</span> ${esc(c.client)} · ${esc(c.sector)}</p>
        <h2 class="cs__title">${esc(c.title)}</h2>
        <div class="cs__headline"><b>${esc(c.headline)}</b><span>${esc(c.headlineLabel)}</span></div>
      </header>
      <div class="cs__media" data-inview><canvas></canvas><span class="cs__media-note">Campaign film · ${esc(c.tags[0])}</span></div>
      <section class="cs__sec" data-inview><h3><b>01</b>The brief</h3><p>${esc(c.brief)}</p></section>
      <section class="cs__sec" data-inview><h3><b>02</b>The insight</h3><p>${esc(c.insight)}</p></section>
      <section class="cs__sec" data-inview><h3><b>03</b>What we made</h3>
        <div class="cs__exec">${c.execution.map((x) => `<div><b>${esc(x.k)}</b><span>${esc(x.v)}</span></div>`).join("")}</div></section>
      <section class="cs__sec" data-inview><h3><b>04</b>Results</h3>
        <div class="cs__results">${c.results.map((r) => `<div><b data-to="${r.n}" data-suf="${esc(r.suf)}">0</b><span>${esc(r.label)}</span></div>`).join("")}</div></section>
      <section class="cs__sec" data-inview><h3><b>05</b>In their words</h3><div><p class="cs__quote">“${esc(c.quote)}”</p><small>${esc(c.quoteBy)}</small></div></section>
      <button class="cs__nextcase" style="--nc:${n.color}" data-cursor="Next case"><span class="label">Next case study · ${esc(n.sector)}</span><strong>${esc(n.title)}</strong></button>`;
    makeArt($(".cs__media canvas", cs.content), c.color, i + 11);
    attachVideo($(".cs__media", cs.content), c.video);
    $(".cs__nextcase", cs.content).addEventListener("click", () => goCase(i + 1));

    if (cs.io) cs.io.disconnect();
    cs.io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      cs.io.unobserve(e.target);
      $$("[data-to]", e.target).forEach((b) => countUp(b, +b.dataset.to, b.dataset.suf, 1800));
    }), { root: cs.scroll, threshold: 0.2 });
    $$("[data-inview]", cs.content).forEach((s) => cs.io.observe(s));
  }
  function openCase(i, fromEl) {
    cs.origin = fromEl;
    renderCase(i);
    cs.scroll.scrollTop = 0;
    cs.el.classList.remove("is-anim");
    setInset(fromEl.getBoundingClientRect());
    cs.el.style.setProperty("--rad", "10px");
    cs.el.classList.add("is-open");
    cs.el.setAttribute("aria-hidden", "false");
    void cs.el.offsetWidth;
    cs.el.classList.add("is-anim");
    ["--t", "--r", "--b", "--l"].forEach((k) => cs.el.style.setProperty(k, "0px"));
    cs.el.style.setProperty("--rad", "0px");
    document.body.classList.add("lock");
  }
  function closeCase() {
    if (!cs.el.classList.contains("is-open")) return;
    const target = caseEls[cs.idx];
    const r = target && target.getBoundingClientRect();
    const onScreen = r && r.bottom > 0 && r.top < innerHeight;
    setInset(onScreen ? r : null);
    cs.el.style.setProperty("--rad", "10px");
    document.body.classList.remove("lock");
    setTimeout(() => {
      cs.el.classList.remove("is-open", "is-anim");
      cs.el.setAttribute("aria-hidden", "true");
      cs.content.innerHTML = "";
    }, 900);
  }
  function goCase(i) {
    i = (i + CASES.length) % CASES.length;
    cs.content.classList.add("is-leaving");
    setTimeout(() => {
      renderCase(i);
      cs.scroll.scrollTop = 0;
      cs.content.classList.remove("is-leaving");
      cs.content.classList.add("is-entering");
      void cs.content.offsetWidth;
      cs.content.classList.remove("is-entering");
    }, 450);
  }
  function initOverlay() {
    cs.el = $("#cs"); cs.scroll = $("#csScroll"); cs.content = $("#csContent");
    $("#csClose").addEventListener("click", closeCase);
    $("#csNextTop").addEventListener("click", () => goCase(cs.idx + 1));
    addEventListener("keydown", (e) => {
      if (!cs.el.classList.contains("is-open")) return;
      if (e.key === "Escape") closeCase();
      if (e.key === "ArrowRight") goCase(cs.idx + 1);
      if (e.key === "ArrowLeft") goCase(cs.idx - 1);
    });
    const prog = $("#csProgress");
    cs.scroll.addEventListener("scroll", () => {
      const s = cs.scroll;
      prog.style.transform = `scaleX(${clamp(s.scrollTop / (s.scrollHeight - s.clientHeight || 1))})`;
    });
  }

  /* ---------------- process: scroll-drawn growth chart ---------------- */
  const proc = {};
  function initProcess() {
    const W = 600, H = 420, N = 61;
    const R = rng(42);
    const stepsY = [330, 285, 230, 160, 70]; // target heights at each step
    const pts = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const seg = t * 4, k = Math.floor(seg), f = seg - k;
      const base = k >= 4 ? stepsY[4] : lerp(stepsY[k], stepsY[k + 1], f * f * (3 - 2 * f));
      const noise = (i % 15 === 0) ? 0 : (R() - 0.5) * 26;
      pts.push([30 + t * (W - 60), base + noise]);
    }
    proc.pts = pts; proc.W = W; proc.H = H;
    proc.line = $("#procLine"); proc.area = $("#procArea");

    const gl = $("#procSvg .grid-lines");
    for (let y = 60; y < H; y += 60) gl.insertAdjacentHTML("beforeend", `<line x1="0" x2="${W}" y1="${y}" y2="${y}" />`);

    const chart = $(".process__chart");
    proc.dots = [0, 15, 30, 45, 60].map((idx, n) => {
      const dot = document.createElement("i");
      dot.className = "proc-dot"; dot.dataset.n = String(n + 1).padStart(2, "0");
      dot.style.left = `${(pts[idx][0] / W) * 100}%`;
      dot.style.top = `${(pts[idx][1] / H) * 100}%`;
      chart.appendChild(dot);
      return dot;
    });
    proc.steps = $$(".step");
    proc.section = $("#process");
    proc.val = $("#procVal"); proc.delta = $("#procDelta");
    proc.lastStep = -1;
  }
  function updateProcess() {
    const r = proc.section.getBoundingClientRect();
    // finish drawing at 90% of the section so the last step can be read
    const p = clamp(-r.top / (r.height - innerHeight) / 0.9);
    const pts = proc.pts, n = pts.length;
    const f = p * (n - 1), upto = Math.floor(f), frac = f - upto;
    const a = pts[upto], b = pts[Math.min(n - 1, upto + 1)];
    const head = [lerp(a[0], b[0], frac), lerp(a[1], b[1], frac)];
    let line = "";
    for (let i = 0; i <= upto; i++) line += `${i ? "L" : "M"}${pts[i][0]},${pts[i][1]}`;
    line += `L${head[0].toFixed(1)},${head[1].toFixed(1)}`;
    proc.line.setAttribute("d", line);
    proc.area.setAttribute("d", `M${pts[0][0]},${proc.H}L${line.slice(1)}L${head[0].toFixed(1)},${proc.H}Z`);
    const stepIdx = Math.min(4, Math.floor(p * 4 + 0.001));
    proc.dots.forEach((dot, i) => dot.classList.toggle("on", p >= i / 4 - 0.001));
    if (stepIdx !== proc.lastStep) {
      proc.steps.forEach((s, i) => s.classList.toggle("is-on", i === stepIdx));
      proc.lastStep = stepIdx;
    }
    const v = 100 + ((pts[0][1] - pts[upto][1]) / (pts[0][1] - pts[n - 1][1])) * 340;
    proc.val.textContent = v.toFixed(1);
    proc.delta.textContent = `+${(v - 100).toFixed(2)}%`;
  }

  /* ---------------- section index ---------------- */
  function initSectionIndex() {
    const label = $("#sindexText");
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const txt = e.target.dataset.index;
      if (label.textContent === txt) return;
      label.classList.add("swap");
      setTimeout(() => { label.textContent = txt; label.classList.remove("swap"); }, 200);
    }), { rootMargin: "-45% 0px -45% 0px" });
    $$("[data-index]").forEach((s) => io.observe(s));
  }

  /* ---------------- start title reveal ---------------- */
  function initStart() {
    const t = $(".start__title");
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { t.classList.add("is-in"); o.disconnect(); } }, { threshold: 0.3 }).observe(t);
  }

  /* ---------------- master scroll loop ---------------- */
  function initLoop() {
    const nav = $("#nav"), word = $("#footerWord"), sindex = $("#sindex"), footer = $(".footer");
    let lastY = scrollY;
    (function loop() {
      const y = scrollY, dy = y - lastY; lastY = y;
      const vh = innerHeight;
      nav.classList.toggle("is-solid", y > 20);
      if (!document.body.classList.contains("menu-open")) {
        if (dy > 6 && y > 400) nav.classList.add("is-up");
        else if (dy < -6) nav.classList.remove("is-up");
      }
      // promise words
      if (promiseWords.length) {
        const r = promiseWords[0].parentElement.getBoundingClientRect();
        const pr = clamp((vh * 0.8 - r.top) / (r.height + vh * 0.3));
        const k = Math.floor(pr * promiseWords.length);
        promiseWords.forEach((w, i) => w.classList.toggle("on", i < k));
      }
      updateStack();
      updateProcess();
      // footer word fill
      const fr = word.getBoundingClientRect();
      word.style.setProperty("--fill", `${clamp((vh - fr.top) / (fr.height + vh * 0.35)) * 100}%`);
      sindex.classList.toggle("is-hidden", y < vh * 0.7 || footer.getBoundingClientRect().top < vh);
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- anchors ---------------- */
  function initAnchors() {
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const t = id === "#top" ? document.body : id.length > 1 && $(id);
      if (!t) return;
      e.preventDefault();
      scrollTo({ top: t === document.body ? 0 : t.getBoundingClientRect().top + scrollY - 70, behavior: reduce ? "auto" : "smooth" });
    }));
  }

  /* ---------------- boot ---------------- */
  fillContent();
  initCursor();
  initClocks();
  initNav();
  initRotator();
  initHeroChart();
  initPromise();
  initKpis();
  initNiches();
  initCases();
  initOverlay();
  initProcess();
  initSectionIndex();
  initStart();
  initAnchors();
  runArts();
  initLoop();
  const ready = () => document.body.classList.add("is-ready");
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(ready, 120));
  setTimeout(ready, 1500);
})();
