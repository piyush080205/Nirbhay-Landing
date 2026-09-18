/* =====================================================================
   SIGNATURE INTERACTION 1 — Hero Signal Field
   One point -> many points -> a connected network.
   Cursor influences signals; scroll grows the network.
===================================================================== */
(function () {
  'use strict';
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('hero');
  const reduced = window.JAGRITI.reducedMotion;

  let w, h, dpr;
  let points = [];
  const MAX_POINTS = 90;
  let growth = 0; // 0..1, how many points are "born"
  let mouse = { x: null, y: null, active: false };
  let running = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    points = [];
    const cx = w / 2, cy = h * 0.46;
    for (let i = 0; i < MAX_POINTS; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.5) * Math.min(w, h) * 0.42;
      points.push({
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        born: i === 0 ? 0 : 0.04 + Math.random() * 0.94,
        r: 1.1 + Math.random() * 1.6,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }

  resize();
  seed();
  window.addEventListener('resize', () => { resize(); });

  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  hero.addEventListener('pointerleave', () => { mouse.active = false; });

  // Scroll grows the network (0 at top of hero, 1 once scrolled a bit)
  function onScroll() {
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / (rect.height * 0.6)));
    growth = Math.max(growth, Math.min(1, 0.15 + progress));
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Grow in gradually on load regardless of scroll, as the "one -> many" reveal
  let loadGrowth = 0;
  const growDuration = reduced ? 0 : 2600;
  const growStart = performance.now() + 400;

  window.JAGRITI.onView(hero, (visible) => { running = visible; if (visible) requestAnimationFrame(frame); });

  function frame(now) {
    if (!running) return;

    if (!reduced) {
      const t = Math.min(1, Math.max(0, (now - growStart) / growDuration));
      loadGrowth = 1 - Math.pow(1 - t, 3);
    } else {
      loadGrowth = 1;
    }
    const effectiveGrowth = Math.max(loadGrowth, growth);

    ctx.clearRect(0, 0, w, h);

    const active = points.filter((p) => p.born <= effectiveGrowth);

    // update positions
    if (!reduced) {
      active.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (mouse.active) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130 && dist > 0.01) {
            const f = (130 - dist) / 130 * 0.55;
            p.vx += (dx / dist) * f * 0.03;
            p.vy += (dy / dist) * f * 0.03;
          }
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        const cx = w / 2, cy = h * 0.46, maxR = Math.min(w, h) * 0.46;
        const ddx = p.x - cx, ddy = p.y - cy;
        const d = Math.hypot(ddx, ddy);
        if (d > maxR) { p.vx -= (ddx / d) * 0.01; p.vy -= (ddy / d) * 0.01; }
      });
    }

    // connections
    ctx.lineWidth = 1;
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const a = active[i], b = active[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const maxD = 120;
        if (d < maxD) {
          const alpha = (1 - d / maxD) * 0.22;
          ctx.strokeStyle = `rgba(110,147,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // points
    active.forEach((p, idx) => {
      const pulse = reduced ? 0 : Math.sin(p.pulse) * 0.4 + 0.6;
      const isSeed = idx === 0;
      const rr = isSeed ? p.r + 1.6 : p.r;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rr, 0, Math.PI * 2);
      ctx.fillStyle = isSeed
        ? `rgba(167,139,250,${0.85})`
        : `rgba(110,147,255,${0.5 + pulse * 0.4})`;
      ctx.fill();
      if (isSeed) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, rr + 6 + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(167,139,250,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
