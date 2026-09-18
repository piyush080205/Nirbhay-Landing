/* =====================================================================
   Safety Infrastructure — city-scale canvas (people, routes, campuses)
===================================================================== */
(function () {
  'use strict';
  const canvas = document.getElementById('cityCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.JAGRITI.reducedMotion;
  const W = canvas.width, H = canvas.height;

  const blocks = [];
  const cols = 10, rows = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      blocks.push({ x: (c + 0.5) * (W / cols), y: (r + 0.5) * (H / rows) });
    }
  }

  const people = [];
  for (let i = 0; i < 70; i++) {
    people.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      hub: Math.random() < 0.12,
    });
  }

  let t = 0;
  let running = false;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(110,147,255,0.08)';
    ctx.lineWidth = 1;
    blocks.forEach((b) => {
      ctx.strokeRect(b.x - W / cols / 2 + 6, b.y - H / rows / 2 + 6, W / cols - 12, H / rows - 12);
    });

    if (!reduced) {
      people.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
    }

    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const a = people[i], b = people[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 70) {
          ctx.strokeStyle = `rgba(110,147,255,${(1 - d / 70) * 0.15})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    people.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.hub ? 4 : 2, 0, Math.PI * 2);
      ctx.fillStyle = p.hub ? '#A78BFA' : 'rgba(110,147,255,0.7)';
      ctx.fill();
      if (p.hub) {
        const pulse = (Math.sin(t + p.x) + 1) / 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8 + pulse * 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(167,139,250,${0.3 - pulse * 0.2})`;
        ctx.stroke();
      }
    });

    t += 0.02;
    if (running && !reduced) requestAnimationFrame(draw);
  }

  window.JAGRITI.onView(canvas, (visible) => {
    running = visible;
    if (visible) requestAnimationFrame(draw);
  }, { threshold: 0.15 });

  if (reduced) draw();
})();
