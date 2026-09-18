/* =====================================================================
   SIGNATURE INTERACTION 7 — India Scale
   One person -> a growing connected network, scroll-driven.
===================================================================== */
(function () {
  'use strict';
  const section = document.getElementById('scale');
  const canvas = document.getElementById('scaleCanvas');
  const counter = document.getElementById('scaleCounter');
  if (!section || !canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.JAGRITI.reducedMotion;

  const STEPS = [1, 10, 100, 1000, 10000, 100000, 1000000];
  const MAX_DOTS = 500;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w, h;
  let dots = [];
  let progress = 0;
  let running = false;

  function resize() {
    w = section.clientWidth;
    h = section.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function seed() {
    dots = [];
    for (let i = 0; i < MAX_DOTS; i++) {
      dots.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.pow(Math.random(), 0.45),
        speed: 0.05 + Math.random() * 0.1,
        born: i === 0 ? 0 : Math.random(),
        size: 0.8 + Math.random() * 1.4,
      });
    }
  }
  seed();

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const p = total > 0 ? -rect.top / total : 0;
    progress = Math.min(1, Math.max(0, p));

    const stepIndex = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
    if (counter) counter.textContent = STEPS[stepIndex].toLocaleString('en-IN');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const maxR = Math.min(w, h) * 0.46;
    const active = dots.filter((d) => d.born <= progress);

    ctx.lineWidth = 1;
    for (let i = 0; i < active.length; i++) {
      const a = active[i];
      const ax = cx + Math.cos(a.angle) * a.radius * maxR;
      const ay = cy + Math.sin(a.angle) * a.radius * maxR;
      if (i % 4 === 0) {
        for (let j = i + 1; j < Math.min(active.length, i + 5); j++) {
          const b = active[j];
          const bx = cx + Math.cos(b.angle) * b.radius * maxR;
          const by = cy + Math.sin(b.angle) * b.radius * maxR;
          const d = Math.hypot(ax - bx, ay - by);
          if (d < 90) {
            ctx.strokeStyle = `rgba(110,147,255,${(1 - d / 90) * 0.18})`;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }
    }

    active.forEach((d, i) => {
      const ax = cx + Math.cos(d.angle) * d.radius * maxR;
      const ay = cy + Math.sin(d.angle) * d.radius * maxR;
      ctx.beginPath();
      ctx.arc(ax, ay, i === 0 ? 4 : d.size, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#A78BFA' : 'rgba(110,147,255,0.75)';
      ctx.fill();
    });

    if (running && !reduced) requestAnimationFrame(draw);
  }

  window.JAGRITI.onView(section, (visible) => {
    running = visible;
    if (visible) requestAnimationFrame(draw);
  }, { threshold: 0.05 });

  if (reduced) draw();
})();
