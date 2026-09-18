/* =====================================================================
   SIGNATURE INTERACTION 2 — Signal Layer -> Intelligence Engine
   Six signal types each draw their own micro-visualization, then the
   Intelligence Engine section shows inputs flowing through a pipeline.
===================================================================== */
(function () {
  'use strict';
  const reduced = window.JAGRITI.reducedMotion;

  /* ---------------- Signal board ---------------- */
  const board = document.getElementById('signalBoard');
  if (board) {
    const cells = board.querySelectorAll('.signal-cell');
    let active = false;
    let t = 0;

    const drawers = {
      motion: (ctx, w, h, time) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 2) {
          const y = h / 2 + Math.sin(x * 0.09 + time) * (h * 0.22) * Math.sin(time * 0.4 + x * 0.01);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      },
      location: (ctx, w, h, time) => {
        const cx = w / 2, cy = h / 2;
        for (let i = 0; i < 3; i++) {
          const p = ((time * 0.4 + i / 3) % 1);
          ctx.beginPath();
          ctx.arc(cx, cy, p * (h * 0.55), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(67,56,202,${1 - p})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#4338CA';
        ctx.fill();
      },
      time: (ctx, w, h, time) => {
        const cx = w / 2, cy = h / 2, r = h * 0.36;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(8,11,20,0.15)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        const angle = time * 1.4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(angle) * r * 0.85, cy + Math.sin(angle) * r * 0.85);
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      },
      connectivity: (ctx, w, h, time) => {
        const cols = 5;
        for (let i = 0; i < cols; i++) {
          const x = (w / (cols - 1)) * i;
          const phase = (time * 0.9 + i * 0.3) % (Math.PI * 2);
          const pulse = (Math.sin(phase) + 1) / 2;
          ctx.beginPath();
          ctx.arc(x, h / 2, 2 + pulse * 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(37,99,235,${0.3 + pulse * 0.6})`;
          ctx.fill();
        }
      },
      route: (ctx, w, h, time) => {
        ctx.beginPath();
        ctx.moveTo(6, h - 10);
        ctx.bezierCurveTo(w * 0.3, h - 10, w * 0.4, 12, w - 6, 12);
        ctx.strokeStyle = 'rgba(8,11,20,0.14)';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        const p = (time * 0.25) % 1;
        const x = 6 + (w - 12) * p;
        const y = (h - 10) - (h - 22) * p;
        ctx.beginPath();
        ctx.arc(x, y, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = '#2563EB';
        ctx.fill();
      },
      context: (ctx, w, h, time) => {
        const cx = w / 2, cy = h / 2;
        const pts = 3;
        for (let i = 0; i < pts; i++) {
          const a = time * 0.6 + (i / pts) * Math.PI * 2;
          const x = cx + Math.cos(a) * (w * 0.32);
          const y = cy + Math.sin(a) * (h * 0.32);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = 'rgba(67,56,202,0.35)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#4338CA';
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = '#2563EB';
        ctx.fill();
      },
    };

    const canvases = [];
    cells.forEach((cell) => {
      const type = cell.dataset.signal;
      const canvas = cell.querySelector('canvas');
      const ctx = canvas.getContext('2d');
      canvases.push({ type, canvas, ctx });
    });

    function draw() {
      t += 0.02;
      canvases.forEach(({ type, canvas, ctx }) => {
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        (drawers[type] || (() => {}))(ctx, w, h, t);
      });
      if (active && !reduced) requestAnimationFrame(draw);
    }

    if (reduced) {
      draw();
    } else {
      window.JAGRITI.onView(board, (visible) => {
        active = visible;
        if (visible) requestAnimationFrame(draw);
      }, { threshold: 0.1 });
    }
  }

  /* ---------------- Intelligence engine diagram ---------------- */
  const diagram = document.getElementById('engineDiagram');
  if (!diagram) return;
  const svg = diagram.querySelector('.engine-svg');
  const pathsGroup = diagram.querySelector('.engine-paths');
  const inputs = diagram.querySelectorAll('.engine-inputs .engine-node');
  const stages = diagram.querySelectorAll('.engine-stage');
  const output = diagram.querySelector('.engine-node-output');

  function layoutPaths() {
    pathsGroup.innerHTML = '';
    if (!svg.clientWidth) return;
    const w = 400, h = 320;
    const startY = [40, 127, 213, 300];
    startY.forEach((y) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', `M40,${y} C160,${y} 160,160 200,160`);
      pathsGroup.appendChild(p);
    });
    const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p2.setAttribute('d', 'M200,160 C300,160 300,160 360,160');
    pathsGroup.appendChild(p2);
  }
  layoutPaths();
  window.addEventListener('resize', layoutPaths);

  let sequenceRunning = false;
  function runSequence() {
    if (sequenceRunning) return;
    sequenceRunning = true;
    const order = [
      () => inputs.forEach((n) => n.classList.add('is-active')),
      () => stages[0].classList.add('is-active'),
      () => stages[1].classList.add('is-active'),
      () => stages[2].classList.add('is-active'),
      () => stages[3].classList.add('is-active'),
      () => output.classList.add('is-active'),
    ];
    const step = reduced ? 0 : 380;
    order.forEach((fn, i) => setTimeout(fn, i * step));
  }

  window.JAGRITI.onView(diagram, (visible) => { if (visible) runSequence(); }, { threshold: 0.4 });
})();
