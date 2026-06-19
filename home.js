/* TIGHT KNIT & FRIENDS // 001 · landing page
   Ports the flyer's animated background — cyber perspective grid +
   BPM-synced dual spotlights + CRT noise — onto a responsive canvas. */

(function () {
  "use strict";

  const ACCENT = [232, 64, 44]; // club / red   (#E8402C)
  const WARM = [255, 122, 61];  // lounge / warm (#FF7A3D)
  const BPM = 144;

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- background animation ---------- */
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

    // Spotlight tiers, expressed as fractions so they scale to any canvas.
    const tiers = [
      { dx: 0.18, fy: 0.30, py: 0.74, ht: 7,  hb: 46,  hr: 13, amax: 0.10, off: 0.34 },
      { dx: 0.30, fy: 0.20, py: 0.92, ht: 11, hb: 80,  hr: 20, amax: 0.14, off: 0.17 },
      { dx: 0.44, fy: 0.05, py: 1.14, ht: 16, hb: 130, hr: 30, amax: 0.20, off: 0.0 },
    ];

    function drawGrid(t) {
      ctx.clearRect(0, 0, W, H);
      const horizon = H * 0.4;
      const vpx = W * 0.5;
      const [r, g, b] = ACCENT;
      const [wr, wg, wb] = WARM;

      // accent glow at the horizon (club)
      let glow = ctx.createRadialGradient(vpx, horizon, 0, vpx, horizon, W * 0.62);
      glow.addColorStop(0, `rgba(${r},${g},${b},0.16)`);
      glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // warm sunset band low on the horizon (dusk blend)
      let sun = ctx.createRadialGradient(vpx, horizon + H * 0.04, 0, vpx, horizon + H * 0.04, W * 0.78);
      sun.addColorStop(0, "rgba(255,178,92,0.18)");
      sun.addColorStop(0.5, `rgba(${wr},${wg},${wb},0.10)`);
      sun.addColorStop(1, `rgba(${wr},${wg},${wb},0)`);
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, W, H);

      ctx.lineWidth = 1;
      const rows = 22;
      const off = (t * 0.1) % 1;
      for (let k = 0; k < rows; k++) {
        const p = (k + off) / rows;
        const yFloor = horizon + (H - horizon) * (p * p);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.3 * p})`;
        ctx.beginPath(); ctx.moveTo(0, yFloor); ctx.lineTo(W, yFloor); ctx.stroke();
        const yCeil = horizon - horizon * (p * p);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.18 * p})`;
        ctx.beginPath(); ctx.moveTo(0, yCeil); ctx.lineTo(W, yCeil); ctx.stroke();
      }
      // converging columns
      const cols = 16;
      for (let i = -cols; i <= cols; i++) {
        const xb = vpx + i * (W / cols) * 1.25;
        ctx.strokeStyle = `rgba(${r},${g},${b},0.12)`;
        ctx.beginPath(); ctx.moveTo(vpx, horizon); ctx.lineTo(xb, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(vpx, horizon); ctx.lineTo(xb, 0); ctx.stroke();
      }
    }

    function drawSpots(t) {
      const cx = W / 2;
      const bps = BPM / 60;
      const s = Math.max(0.45, W / 1080); // size scale relative to flyer width

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (const tier of tiers) {
        const ph = t * bps + tier.off;
        const frac = ph - Math.floor(ph);
        const env = Math.exp(-frac * 3.2);
        const aTop = 0.046 + env * tier.amax;

        for (const side of [-1, 1]) {
          const col = side < 0 ? ACCENT : WARM; // left = club, right = lounge
          const sx = cx + side * tier.dx * W;
          const bx = sx + (sx - cx) * 0.06;
          const fy = tier.fy * H;
          const py = tier.py * H;
          const ht = tier.ht * s, hb = tier.hb * s, hr = tier.hr * s;

          const grad = ctx.createLinearGradient(sx, fy, bx, py);
          grad.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},${aTop})`);
          grad.addColorStop(0.6, `rgba(${col[0]},${col[1]},${col[2]},${aTop * 0.36})`);
          grad.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(sx - ht, fy);
          ctx.lineTo(sx + ht, fy);
          ctx.lineTo(bx + hb, py);
          ctx.lineTo(bx - hb, py);
          ctx.closePath();
          ctx.fill();

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
          ctx.save();
          ctx.translate(bx, py); ctx.scale(1, 0.28);
          ctx.beginPath(); ctx.arc(0, 0, poolR, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
    }

    function frame(now) {
      const t = (now - start) / 1000;
      drawGrid(t);
      drawSpots(t);
      raf = requestAnimationFrame(frame);
    }

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    resize();
    if (prefersReduced) {
      // single static frame, no animation loop
      drawGrid(2.1);
      drawSpots(2.1);
    } else {
      raf = requestAnimationFrame(frame);
      // pause when the tab is hidden to save cycles
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
        else if (!raf) { start = performance.now() - 0; raf = requestAnimationFrame(frame); }
      });
    }
  }

  /* ---------- scroll reveal ---------- */
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

  /* ---------- footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
