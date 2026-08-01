/* TIGHT KNIT · site script
   - animated background: cyber grid + dual spotlights (recolors per theme)
   - hero centerpiece: the deterministic "Tangle" knot (ported from the flyer)
   - scroll reveals, timeline thread draw-in, footer year
   Colors are read from CSS custom properties so one script serves every theme. */

(function () {
  "use strict";

  // read palette from <body> so a `.theme-warm` (or any body-level theme) wins
  const root = getComputedStyle(document.body || document.documentElement);
  function cssRGB(name, fb) {
    const v = root.getPropertyValue(name).trim();
    if (!v) return fb;
    const p = v.split(",").map((n) => parseInt(n.trim(), 10));
    return p.length === 3 && p.every((n) => !isNaN(n)) ? p : fb;
  }
  function cssVal(name, fb) {
    const v = root.getPropertyValue(name).trim();
    return v || fb;
  }

  const ACCENT = cssRGB("--accent-rgb", [175, 196, 255]);
  const WARM = cssRGB("--warm-rgb", [201, 214, 255]);
  const KNOT_COLOR = cssVal("--knot", "#e9efff");

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     Background: perspective grid + BPM spotlights
     ============================================================ */
  const canvas = document.getElementById("bgCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = 1, start = performance.now(), raf = null;

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const tiers = [
      { dx: 0.18, fy: 0.30, py: 0.74, ht: 7,  hb: 46,  hr: 13, amax: 0.10, off: 0.34 },
      { dx: 0.30, fy: 0.20, py: 0.92, ht: 11, hb: 80,  hr: 20, amax: 0.14, off: 0.17 },
      { dx: 0.44, fy: 0.05, py: 1.14, ht: 16, hb: 130, hr: 30, amax: 0.20, off: 0.0 },
    ];

    function drawGrid(t) {
      ctx.clearRect(0, 0, W, H);
      const horizon = H * 0.4, vpx = W * 0.5;
      const [r, g, b] = ACCENT;
      const [wr, wg, wb] = WARM;
      let glow = ctx.createRadialGradient(vpx, horizon, 0, vpx, horizon, W * 0.62);
      glow.addColorStop(0, `rgba(${r},${g},${b},0.16)`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      let sun = ctx.createRadialGradient(vpx, horizon + H * 0.04, 0, vpx, horizon + H * 0.04, W * 0.78);
      sun.addColorStop(0, `rgba(${wr},${wg},${wb},0.16)`);
      sun.addColorStop(0.5, `rgba(${wr},${wg},${wb},0.10)`);
      sun.addColorStop(1, `rgba(${wr},${wg},${wb},0)`);
      ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);
      ctx.lineWidth = 1;
      const rows = 22, off = (t * 0.1) % 1;
      for (let k = 0; k < rows; k++) {
        const p = (k + off) / rows;
        const yFloor = horizon + (H - horizon) * (p * p);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.3 * p})`;
        ctx.beginPath(); ctx.moveTo(0, yFloor); ctx.lineTo(W, yFloor); ctx.stroke();
        const yCeil = horizon - horizon * (p * p);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.18 * p})`;
        ctx.beginPath(); ctx.moveTo(0, yCeil); ctx.lineTo(W, yCeil); ctx.stroke();
      }
      const cols = 16;
      for (let i = -cols; i <= cols; i++) {
        const xb = vpx + i * (W / cols) * 1.25;
        ctx.strokeStyle = `rgba(${r},${g},${b},0.12)`;
        ctx.beginPath(); ctx.moveTo(vpx, horizon); ctx.lineTo(xb, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(vpx, horizon); ctx.lineTo(xb, 0); ctx.stroke();
      }
    }

    function drawSpots(t) {
      const cx = W / 2, bps = 120 / 60, s = Math.max(0.45, W / 1080);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const tier of tiers) {
        const ph = t * bps + tier.off, frac = ph - Math.floor(ph);
        const env = Math.exp(-frac * 3.2), aTop = 0.046 + env * tier.amax;
        for (const side of [-1, 1]) {
          const col = side < 0 ? ACCENT : WARM;
          const sx = cx + side * tier.dx * W, bx = sx + (sx - cx) * 0.06;
          const fy = tier.fy * H, py = tier.py * H;
          const ht = tier.ht * s, hb = tier.hb * s, hr = tier.hr * s;
          const grad = ctx.createLinearGradient(sx, fy, bx, py);
          grad.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${aTop})`);
          grad.addColorStop(0.6, `rgba(${col[0]},${col[1]},${col[2]},${aTop * 0.36})`);
          grad.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(sx - ht, fy); ctx.lineTo(sx + ht, fy);
          ctx.lineTo(bx + hb, py); ctx.lineTo(bx - hb, py);
          ctx.closePath(); ctx.fill();
          const hsR = hr + env * hr;
          const hs = ctx.createRadialGradient(sx, fy, 0, sx, fy, hsR);
          hs.addColorStop(0, `rgba(255,${Math.min(255, col[1] + 70 + env * 50)},${Math.min(255, col[2] + 70)},${0.23 + env * 0.5})`);
          hs.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
          ctx.fillStyle = hs;
          ctx.beginPath(); ctx.arc(sx, fy, hsR, 0, Math.PI * 2); ctx.fill();
          const poolR = hb * 1.25;
          const pool = ctx.createRadialGradient(bx, py, 0, bx, py, poolR);
          pool.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${0.035 + env * 0.09})`);
          pool.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
          ctx.fillStyle = pool;
          ctx.save(); ctx.translate(bx, py); ctx.scale(1, 0.28);
          ctx.beginPath(); ctx.arc(0, 0, poolR, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
    }

    function frame(now) {
      const t = (now - start) / 1000;
      drawGrid(t); drawSpots(t);
      raf = requestAnimationFrame(frame);
    }

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    resize();
    if (prefersReduced) { drawGrid(2.1); drawSpots(2.1); }
    else {
      raf = requestAnimationFrame(frame);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
        else if (!raf) { start = performance.now(); raf = requestAnimationFrame(frame); }
      });
    }
  }

  /* ============================================================
     The Tangle knot — deterministic, seeded, ported from the flyer
     ============================================================ */
  const knotSvg = document.getElementById("tangleSvg");
  if (knotSvg) {
    const NS = "http://www.w3.org/2000/svg";
    const LOOP = 48;              // slow, meditative morph
    const TAU = Math.PI * 2;
    const T = { C: 300, R: 165, SAFE: 175, M: 320, K: 8, GAIN: 1.6, BREATHS: 21,
      SPINS: 1, DWELL_LOW: 0.18, DWELL_HIGH: 0.18, SHIMMER: 0.6, w: 21, col: KNOT_COLOR };

    knotSvg.innerHTML = "";
    const defs = document.createElementNS(NS, "defs");
    const f = document.createElementNS(NS, "filter");
    f.setAttribute("id", "tangleGlow");
    f.setAttribute("x", "-70%"); f.setAttribute("y", "-70%");
    f.setAttribute("width", "240%"); f.setAttribute("height", "240%");
    const blur = (sd, res) => { const b = document.createElementNS(NS, "feGaussianBlur"); b.setAttribute("stdDeviation", sd); b.setAttribute("result", res); return b; };
    f.appendChild(blur(3, "b1")); f.appendChild(blur(8, "b2")); f.appendChild(blur(16, "b3"));
    const merge = document.createElementNS(NS, "feMerge");
    ["b3", "b2", "b1"].forEach((r) => { const n = document.createElementNS(NS, "feMergeNode"); n.setAttribute("in", r); merge.appendChild(n); });
    const srcN = document.createElementNS(NS, "feMergeNode"); srcN.setAttribute("in", "SourceGraphic"); merge.appendChild(srcN);
    f.appendChild(merge); defs.appendChild(f); knotSvg.appendChild(defs);
    const tBase = document.createElementNS(NS, "g"); tBase.setAttribute("filter", "url(#tangleGlow)");
    const tOver = document.createElementNS(NS, "g"); tOver.setAttribute("filter", "url(#tangleGlow)");
    knotSvg.appendChild(tBase); knotSvg.appendChild(tOver);

    const trng = ((a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; })(20260719);
    const tRand = (a, b) => a + trng() * (b - a);
    function tNewCoeffs() { const c = []; for (let k = 2; k <= T.K; k++) { const d = tRand(0.35, 1.1) * Math.pow(k, -0.62); c.push({ k, ax: tRand(-1, 1) * d, ay: tRand(-1, 1) * d, bx: tRand(-1, 1) * d, by: tRand(-1, 1) * d }); } return c; }
    function tCurve(co, spin, env, phase) {
      const pts = [], s = Math.sin(spin), cs = Math.cos(spin);
      for (let i = 0; i < T.M; i++) {
        const t = (i / T.M) * TAU; let x = Math.cos(t), y = Math.sin(t);
        for (const c of co) { const a = c.k * t + phase * c.k * 0.4; x += env * T.GAIN * (c.ax * Math.cos(a) + c.bx * Math.sin(a)); y += env * T.GAIN * (c.ay * Math.cos(a) + c.by * Math.sin(a)); }
        pts.push({ x: T.R * (x * cs - y * s), y: T.R * (x * s + y * cs), z: Math.cos(t) });
      }
      let mx = 0, my = 0; for (const p of pts) { mx += p.x; my += p.y; } mx /= T.M; my /= T.M;
      let ext = 1e-6; for (const p of pts) ext = Math.max(ext, Math.abs(p.x - mx), Math.abs(p.y - my));
      const k = T.SAFE / ext; for (const p of pts) { p.x = T.C + (p.x - mx) * k; p.y = T.C + (p.y - my) * k; } return pts;
    }
    function tSegHit(p1, p2, p3, p4) {
      const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x); if (Math.abs(d) < 1e-9) return null;
      const ua = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
      const ub = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;
      if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null; return { ua, ub };
    }
    function tCrossings(pts) {
      const out = [], n = pts.length;
      for (let i = 0; i < n; i++) { const a1 = pts[i], a2 = pts[(i + 1) % n];
        for (let j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; const b1 = pts[j], b2 = pts[(j + 1) % n]; const h = tSegHit(a1, a2, b1, b2); if (!h) continue;
          const za = a1.z + (a2.z - a1.z) * h.ua, zb = b1.z + (b2.z - b1.z) * h.ub; out.push({ over: za > zb ? i : j }); } }
      return out;
    }
    function tGuarded() { for (let i = 0; i < 40; i++) { const c = tNewCoeffs(); const n = tCrossings(tCurve(c, 0, 1, 0)).length; if (n >= 5 && n <= 16) return c; } return tNewCoeffs(); }
    const KNOTS = []; for (let i = 0; i < T.BREATHS; i++) KNOTS.push(tGuarded());
    const tPoly = (pts) => "M" + pts.map((p) => p.x.toFixed(1) + " " + p.y.toFixed(1)).join("L");
    function tWindow(pts, idx, w) { const n = pts.length, o = []; for (let k = -w; k <= w; k++) o.push(pts[(idx + k + n) % n]); return o; }
    function tStroke(g, d, col, width) { const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); p.setAttribute("fill", "none"); p.setAttribute("stroke", col); p.setAttribute("stroke-width", width); p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round"); g.appendChild(p); }
    function tStrand(g, d) { tStroke(g, d, T.col, T.w); tStroke(g, d, T.col, T.w * 0.42); }
    function tDraw(pts) { tBase.replaceChildren(); tOver.replaceChildren(); tStrand(tBase, tPoly([...pts, pts[0]])); for (const c of tCrossings(pts)) tStrand(tOver, tPoly(tWindow(pts, c.over, 6))); }
    function tBreathEnv(p) { const sm = (u) => u * u * u * (u * (u * 6 - 15) + 10), rise = (1 - T.DWELL_LOW - T.DWELL_HIGH) / 2; if (p < T.DWELL_LOW) return 0; if (p < T.DWELL_LOW + rise) return sm((p - T.DWELL_LOW) / rise); if (p < T.DWELL_LOW + rise + T.DWELL_HIGH) return 1; return 1 - sm((p - (T.DWELL_LOW + rise + T.DWELL_HIGH)) / rise); }
    function renderKnot(tSec) {
      const p = (tSec / LOOP) % 1, spin = TAU * T.SPINS * p, bf = p * T.BREATHS;
      const bi = Math.floor(bf) % T.BREATHS, bp = bf - Math.floor(bf);
      const env = tBreathEnv(bp), phase = T.SHIMMER * Math.sin(bp * TAU);
      tDraw(tCurve(KNOTS[bi], spin, env, phase));
    }

    if (prefersReduced) { renderKnot(LOOP * 0.34); }
    else {
      let kStart = performance.now(), kLast = 0, kRaf = null;
      function kloop(now) {
        kRaf = requestAnimationFrame(kloop);
        if (now - kLast < 33) return;       // throttle to ~30fps
        kLast = now;
        renderKnot((now - kStart) / 1000);
      }
      kRaf = requestAnimationFrame(kloop);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) { if (kRaf) cancelAnimationFrame(kRaf); kRaf = null; }
        else if (!kRaf) { kStart = performance.now() - kLast; kRaf = requestAnimationFrame(kloop); }
      });
    }
  }

  /* ============================================================
     Timeline thread: measure + draw-in on scroll
     ============================================================ */
  const threadSvg = document.querySelector(".thread-line");
  const threadPath = document.querySelector(".thread-line .thread-draw");
  const thread = document.querySelector(".thread");
  if (threadSvg && threadPath && thread) {
    function buildThread() {
      const box = thread.getBoundingClientRect();
      const Wt = box.width, Ht = box.height;
      const dots = Array.from(thread.querySelectorAll(".knot-dot"))
        .map((d) => { const r = d.getBoundingClientRect(); return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }; })
        .sort((a, b) => a.y - b.y);
      if (!dots.length) return;
      threadSvg.setAttribute("viewBox", `0 0 ${Wt} ${Ht}`);
      // enter from the top, weave through every dot, trail off the bottom
      const pts = [{ x: dots[0].x, y: 0 }, ...dots, { x: dots[dots.length - 1].x, y: Ht }];
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1], cur = pts[i];
        const midY = (prev.y + cur.y) / 2;
        const dir = i % 2 ? 1 : -1;
        const bulge = Math.min(150, Math.abs(cur.y - prev.y) * 0.42) * dir;
        const cx = (prev.x + cur.x) / 2 + bulge;
        d += ` Q ${cx.toFixed(1)} ${midY.toFixed(1)} ${cur.x.toFixed(1)} ${cur.y.toFixed(1)}`;
      }
      threadPath.setAttribute("d", d);
      const len = threadPath.getTotalLength();
      threadPath.style.setProperty("--len", len);   // CSS drives the draw-in via the .in class
    }
    buildThread();
    window.addEventListener("load", buildThread);
    let tTimer = null;
    window.addEventListener("resize", () => { clearTimeout(tTimer); tTimer = setTimeout(buildThread, 200); });
    if (prefersReduced || !("IntersectionObserver" in window)) {
      thread.classList.add("in");
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { thread.classList.add("in"); io.disconnect(); } });
      }, { threshold: 0.12 });
      io.observe(thread);
    }
  }

  /* ============================================================
     Scroll reveals + footer year
     ============================================================ */
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  if (reveals.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target;
            const delay = parseInt(el.dataset.delay || "0", 10);
            setTimeout(() => el.classList.add("in"), delay);
            io.unobserve(el);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* ============================================================
     Mobile nav (hamburger) toggle
     ============================================================ */
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");
  if (navToggle && siteNav) {
    const setOpen = (open) => {
      siteNav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    navToggle.addEventListener("click", (e) => { e.stopPropagation(); setOpen(!siteNav.classList.contains("open")); });
    siteNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    document.addEventListener("click", (e) => {
      if (siteNav.classList.contains("open") && !siteNav.contains(e.target) && !navToggle.contains(e.target)) setOpen(false);
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
