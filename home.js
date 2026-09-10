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
    const bgMode = canvas.dataset.anim === "globe" ? "globe" : "grid";
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

    /* --- alternate background: slow rotating globe (Sidequest) --- */
    const GLOBE_LOOP = 48;
    let LAND = null;
    function drawGlobe(t) {
      ctx.clearRect(0, 0, W, H);
      const horizon = H * 0.46, vpx = W * 0.5;
      const [r, g, b] = ACCENT, [wr, wg, wb] = WARM;
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
      const off = (t / GLOBE_LOOP) % 1;
      const RX = W * 1.02, RY = W * 0.68, FLAT = 0.30;
      const centerLon = 360 * off - 60;
      const lats = 40;
      for (let k = 0; k < lats; k++) {
        const p = (k + off) / lats, phi = p * Math.PI;
        const y = horizon - RY * Math.cos(phi);
        const rx = RX * Math.sin(phi), ry = rx * FLAT;
        if (rx < 0.5) continue;
        const depth = Math.sin(phi);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.30 * depth})`;
        ctx.beginPath(); ctx.ellipse(vpx, y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
      }
      const lons = 28, rot = (centerLon * Math.PI) / 180;
      for (let i = 0; i < lons; i++) {
        const theta = (i / lons) * Math.PI + rot;
        const rx = Math.abs(RX * Math.cos(theta));
        if (rx < 0.5) continue;
        ctx.strokeStyle = `rgba(${r},${g},${b},0.13)`;
        ctx.beginPath(); ctx.ellipse(vpx, horizon, rx, RY, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.strokeStyle = `rgba(${r},${g},${b},0.22)`;
      ctx.beginPath(); ctx.ellipse(vpx, horizon, RX, RY, 0, 0, Math.PI * 2); ctx.stroke();
      drawContinents(vpx, horizon, RX, RY, centerLon, [r, g, b]);
    }
    function drawContinents(cx, cy, RX, RY, centerLon, col) {
      if (!LAND) LAND = landmasses();
      const D = Math.PI / 180, lon0 = centerLon * D;
      ctx.save();
      ctx.lineWidth = 3; ctx.lineJoin = "round";
      ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},0.68)`;
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},0.10)`;
      for (const poly of LAND) {
        ctx.beginPath();
        let drawing = false, visible = 0;
        for (const pt of poly) {
          const la = pt[1] * D, dl = pt[0] * D - lon0;
          const z = Math.cos(la) * Math.cos(dl);
          if (z <= 0.02) { drawing = false; continue; }
          const sx = cx + RX * Math.cos(la) * Math.sin(dl);
          const sy = cy - RY * Math.sin(la);
          if (drawing) ctx.lineTo(sx, sy); else { ctx.moveTo(sx, sy); drawing = true; }
          visible++;
        }
        if (visible > 2) ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    function frame(now) {
      const t = (now - start) / 1000;
      if (bgMode === "globe") drawGlobe(t); else drawGrid(t);
      drawSpots(t);
      raf = requestAnimationFrame(frame);
    }

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    resize();
    if (prefersReduced) { if (bgMode === "globe") drawGlobe(6); else drawGrid(2.1); drawSpots(2.1); }
    else {
      raf = requestAnimationFrame(frame);
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = null; }
        else if (!raf) { start = performance.now(); raf = requestAnimationFrame(frame); }
      });
    }

    // coarse landmass outlines (lon,lat), orthographically projected onto the globe
    function landmasses() {
      return [
        [[-9,43],[-9,39],[-7,37],[-2,36],[0,39],[3,42],[4,43],[7,43],[9,44],[10,44],[12,41],[15,40],[16,38],[18,40],[13,45],[13,46],[16,43],[19,42],[20,40],[23,38],[24,41],[27,41],[28,41],[26,44],[28,44],[30,45],[34,45],[38,45],[39,47],[38,50],[40,55],[36,58],[30,60],[28,60],[24,60],[22,59],[19,60],[17,61],[21,63],[25,65],[22,66],[24,68],[28,70],[22,70],[18,70],[15,68],[13,66],[11,64],[10,63],[7,63],[5,61],[6,58],[8,58],[11,57],[13,56],[10,54],[7,54],[4,52],[4,51],[2,51],[0,49],[-2,48],[-4,48],[-2,47],[-1,46],[-1,44],[-2,43],[-5,44],[-8,44],[-9,43]],
        [[-5,50],[-3,51],[0,51],[1,53],[0,54],[-1,55],[-2,56],[-3,58],[-5,58],[-5,56],[-4,55],[-3,54],[-4,53],[-5,51],[-5,50]],
        [[-10,52],[-8,52],[-6,52],[-6,54],[-7,55],[-10,54],[-10,52]],
        [[-17,15],[-17,18],[-16,20],[-14,22],[-13,23],[-11,24],[-10,26],[-9,29],[-6,30],[-4,31],[-2,32],[0,33],[3,34],[6,37],[10,34],[11,33],[15,32],[19,31],[20,32],[23,32],[25,31],[27,31],[30,31],[32,31],[33,29],[34,28],[35,26],[35,24],[36,22],[37,20],[38,18],[39,15],[40,14],[42,12],[43,11],[45,11],[47,12],[49,11],[51,12],[51,10],[51,9],[49,7],[48,5],[45,3],[43,2],[42,0],[41,-1],[40,-3],[40,-6],[39,-8],[40,-10],[40,-12],[38,-14],[36,-16],[35,-18],[35,-21],[33,-23],[32,-26],[31,-28],[30,-30],[28,-32],[27,-33],[25,-34],[22,-34],[20,-34],[18,-33],[17,-30],[15,-27],[14,-25],[13,-22],[12,-18],[12,-16],[11,-13],[13,-10],[12,-6],[9,-6],[9,-3],[9,-1],[9,2],[9,4],[6,4],[3,6],[0,5],[-2,5],[-4,5],[-6,4],[-8,4],[-9,5],[-11,6],[-12,7],[-13,8],[-14,9],[-15,11],[-16,12],[-17,13],[-17,15]],
        [[44,-12],[48,-13],[50,-16],[49,-20],[47,-24],[45,-25],[43,-22],[43,-18],[44,-15],[44,-12]],
        [[30,45],[28,41],[27,40],[26,38],[29,37],[31,37],[33,36],[35,36],[36,36],[36,35],[35,34],[35,33],[35,32],[34,31],[34,30],[34,29],[33,28],[34,28],[35,28],[36,26],[37,25],[38,23],[39,21],[40,20],[41,19],[42,17],[43,15],[43,13],[45,13],[46,14],[48,14],[49,14],[51,15],[52,16],[54,17],[55,17],[56,18],[57,19],[58,21],[59,22],[58,24],[57,25],[56,25],[55,25],[54,25],[52,25],[51,25],[50,26],[50,27],[49,28],[48,29],[49,30],[50,30],[52,29],[53,28],[55,26],[57,25],[59,25],[61,25],[62,25],[64,25],[65,25],[67,25],[68,24],[69,22],[70,21],[71,20],[72,19],[73,17],[73,15],[75,12],[76,9],[77,8],[79,9],[80,10],[80,13],[80,16],[81,16],[83,18],[85,20],[87,21],[88,21],[89,22],[90,22],[92,21],[93,18],[94,17],[95,16],[96,15],[97,13],[98,11],[99,10],[100,8],[101,6],[103,2],[104,1],[103,4],[103,5],[104,8],[104,10],[106,10],[107,11],[109,11],[109,13],[108,15],[108,17],[108,18],[109,20],[110,21],[112,21],[113,22],[115,22],[117,23],[119,24],[120,25],[120,28],[121,30],[122,32],[122,34],[122,37],[123,38],[124,39],[126,40],[128,42],[129,43],[131,44],[132,45],[134,47],[135,48],[137,50],[138,51],[139,52],[140,53],[141,55],[142,56],[143,59],[145,59],[147,59],[150,59],[152,59],[155,60],[157,60],[160,61],[162,61],[165,63],[167,64],[170,65],[172,66],[175,66],[177,66],[180,66],[180,71],[175,70],[170,70],[165,70],[160,70],[155,71],[150,72],[145,73],[140,73],[135,74],[130,74],[125,74],[120,74],[115,75],[110,75],[105,76],[100,76],[95,76],[90,75],[85,74],[80,73],[77,73],[75,72],[72,72],[70,72],[67,72],[65,71],[62,71],[60,70],[57,70],[55,69],[52,69],[50,68],[47,68],[45,67],[42,67],[40,66],[38,66],[36,66],[34,66],[33,66],[32,65],[31,63],[30,61],[30,60],[30,56],[30,52],[30,48],[30,45]],
        [[30,46],[33,46],[36,45],[38,46],[40,44],[41,43],[42,42],[44,41],[46,39],[48,38],[49,37],[47,38],[45,40],[43,41],[41,41],[39,41],[36,42],[33,42],[31,41],[29,43],[30,46]],
        [[47,45],[49,45],[51,44],[53,42],[54,40],[53,38],[51,37],[49,38],[48,40],[47,42],[47,45]],
        [[32,35],[34,35],[35,35],[34,34],[33,34],[32,35]],
        [[23.5,35.6],[26.3,35.3],[26.0,34.9],[23.6,35.2],[23.5,35.6]],
        [[130,32],[132,34],[135,34],[137,35],[139,35],[141,38],[141,41],[141,43],[143,44],[145,44],[144,42],[142,40],[140,38],[138,37],[136,36],[133,34],[131,31],[130,32]],
        [[95,5],[99,3],[102,0],[105,-3],[106,-6],[103,-5],[100,-2],[97,2],[95,5]],
        [[105,-6],[110,-7],[114,-8],[112,-8],[108,-7],[105,-6]],
        [[109,2],[113,3],[117,4],[119,1],[117,-3],[114,-4],[110,-2],[109,2]],
        [[131,-1],[136,-2],[141,-3],[146,-6],[150,-9],[147,-9],[143,-8],[139,-8],[135,-5],[131,-1]],
        [[-168,66],[-166,62],[-163,60],[-160,59],[-155,58],[-152,59],[-149,60],[-146,60],[-142,60],[-138,58],[-135,57],[-131,53],[-128,51],[-125,48],[-124,45],[-124,42],[-123,39],[-122,37],[-120,35],[-118,34],[-117,33],[-115,32],[-114,31],[-114,28],[-112,27],[-110,24],[-110,23],[-108,24],[-106,23],[-106,21],[-105,20],[-103,19],[-102,18],[-99,17],[-97,16],[-95,16],[-94,16],[-92,15],[-91,14],[-90,14],[-89,15],[-88,16],[-88,18],[-87,20],[-87,21],[-88,21],[-90,21],[-90,20],[-91,19],[-92,19],[-95,19],[-96,20],[-97,23],[-97,25],[-97,26],[-95,28],[-94,29],[-92,29],[-90,29],[-89,30],[-88,30],[-86,30],[-84,30],[-83,29],[-83,27],[-81,25],[-80,26],[-81,28],[-81,29],[-81,31],[-81,32],[-79,33],[-78,34],[-76,35],[-76,37],[-75,38],[-74,39],[-74,40],[-72,41],[-71,42],[-70,43],[-67,44],[-66,45],[-64,46],[-62,46],[-60,47],[-58,48],[-56,51],[-57,53],[-58,54],[-61,57],[-64,60],[-67,61],[-70,62],[-74,62],[-78,63],[-79,65],[-80,68],[-83,69],[-86,70],[-90,70],[-95,70],[-99,70],[-103,69],[-107,69],[-110,68],[-114,69],[-118,70],[-122,70],[-125,70],[-129,70],[-133,69],[-137,69],[-141,70],[-145,70],[-150,71],[-154,71],[-157,71],[-160,70],[-163,68],[-166,67],[-168,66]],
        [[-92,15],[-91,16],[-90,17],[-89,18],[-88,18],[-88,17],[-88,16],[-89,15],[-89,14],[-88,14],[-87,13],[-86,13],[-85,13],[-84,13],[-83,13],[-83,12],[-83,11],[-83,10],[-82,9],[-81,9],[-80,9],[-79,9],[-78,9],[-77,8],[-78,7],[-79,8],[-80,8],[-81,8],[-83,8],[-84,9],[-85,10],[-85,11],[-86,12],[-87,13],[-88,13],[-89,13],[-90,14],[-91,14],[-92,15]],
        [[-85,22],[-82,23],[-79,23],[-77,21],[-75,20],[-77,20],[-79,22],[-82,22],[-85,22]],
        [[-74,19],[-72,20],[-70,19],[-68,19],[-69,18],[-71,18],[-72,18],[-74,19]],
        [[-78.4,18.5],[-76.2,18.2],[-76.3,17.7],[-78.3,17.9],[-78.4,18.5]],
        [[-67.3,18.5],[-65.6,18.4],[-65.6,17.9],[-67.2,17.9],[-67.3,18.5]],
        [[-77,8],[-76,9],[-75,10],[-74,11],[-72,11],[-71,12],[-68,11],[-66,11],[-64,10],[-62,10],[-61,9],[-60,8],[-58,6],[-56,5],[-54,5],[-52,4],[-51,4],[-50,2],[-50,0],[-49,0],[-48,-1],[-46,-2],[-44,-3],[-42,-3],[-40,-3],[-38,-4],[-37,-5],[-35,-6],[-35,-8],[-37,-10],[-38,-12],[-39,-13],[-39,-15],[-40,-17],[-41,-20],[-42,-22],[-42,-23],[-44,-23],[-45,-24],[-47,-25],[-48,-25],[-49,-27],[-50,-29],[-51,-31],[-53,-34],[-55,-34],[-57,-35],[-57,-37],[-58,-38],[-60,-39],[-62,-40],[-63,-41],[-64,-43],[-65,-44],[-65,-45],[-66,-47],[-67,-49],[-68,-51],[-68,-52],[-69,-53],[-70,-54],[-72,-54],[-74,-53],[-75,-52],[-74,-50],[-74,-48],[-73,-46],[-73,-45],[-73,-43],[-73,-41],[-73,-39],[-73,-37],[-72,-35],[-72,-33],[-71,-32],[-71,-30],[-70,-28],[-70,-26],[-70,-25],[-70,-23],[-70,-21],[-70,-19],[-71,-18],[-71,-17],[-73,-16],[-75,-14],[-76,-13],[-77,-12],[-78,-10],[-79,-8],[-80,-7],[-81,-6],[-81,-5],[-81,-4],[-80,-3],[-80,-2],[-80,-1],[-80,0],[-79,1],[-79,2],[-78,3],[-78,4],[-77,5],[-77,6],[-77,7],[-77,8]],
        [[114,-22],[114,-20],[117,-20],[119,-20],[122,-18],[124,-16],[126,-14],[128,-15],[130,-12],[132,-11],[133,-12],[135,-12],[136,-12],[136,-14],[137,-16],[139,-17],[140,-17],[141,-16],[141,-14],[142,-11],[143,-12],[144,-14],[145,-15],[146,-18],[147,-19],[149,-21],[151,-24],[153,-25],[153,-27],[153,-29],[151,-32],[150,-35],[150,-37],[148,-38],[145,-38],[143,-39],[140,-38],[138,-35],[137,-35],[136,-33],[135,-35],[134,-32],[132,-32],[129,-32],[126,-32],[123,-34],[120,-34],[118,-35],[115,-34],[115,-32],[114,-28],[113,-26],[114,-22]],
        [[173,-35],[175,-37],[177,-38],[178,-38],[176,-41],[174,-41],[173,-39],[173,-35]],
        [[167,-46],[169,-47],[171,-45],[174,-41],[172,-41],[170,-43],[167,-46]],
        [[-45,60],[-42,61],[-38,65],[-34,66],[-30,68],[-25,69],[-22,70],[-21,71],[-20,73],[-20,76],[-22,78],[-26,80],[-30,82],[-36,83],[-45,83],[-52,83],[-58,82],[-61,79],[-62,76],[-60,73],[-57,70],[-55,68],[-52,65],[-50,63],[-48,61],[-45,60]],
        [[-24,65],[-21,66],[-17,66],[-14,65],[-17,64],[-21,64],[-24,65]],
      ];
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
      if (!(tSec >= 0) || !KNOTS.length) return;
      const p = ((tSec / LOOP) % 1 + 1) % 1, bf = p * T.BREATHS;
      const bi = Math.floor(bf) % T.BREATHS, bp = bf - Math.floor(bf);
      const co = KNOTS[bi];
      if (!co) return;
      const spin = TAU * T.SPINS * p, env = tBreathEnv(bp), phase = T.SHIMMER * Math.sin(bp * TAU);
      tDraw(tCurve(co, spin, env, phase));
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

  /* ============================================================
     External preview links (Shotgun / SoundCloud / Instagram) open
     as a pop-out window so the Tight Knit site stays put in the main
     window. Main nav + footer are intentionally excluded.
     ============================================================ */
  const POPUP_HOSTS = /^https?:\/\/([a-z0-9-]+\.)*(shotgun\.live|soundcloud\.com|instagram\.com)(\/|$)/i;
  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest("a[href]");
    if (!a || a.closest(".site-header") || a.closest(".site-footer")) return;
    const href = a.getAttribute("href") || "";
    if (!POPUP_HOSTS.test(href)) return;
    const w = 480, h = Math.min(760, (screen.availHeight || 900) - 80);
    const left = Math.max(0, ((screen.availWidth || 1280) - w) / 2);
    const top = Math.max(0, ((screen.availHeight || 900) - h) / 2);
    // no "noopener" in the feature string — that makes window.open return null and
    // the sizing get ignored; open, then sever opener manually for safety.
    const win = window.open(href, "tkpreview", `popup=yes,width=${w},height=${h},left=${left},top=${top}`);
    if (win) {
      e.preventDefault();                 // popup opened — cancel the anchor's own navigation
      try { win.opener = null; win.focus(); } catch (_) {}
    }
    // if the popup was blocked (win is null), do nothing: the anchor's target="_blank" runs
  });

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
