/* =====================================================================
   Autonomous Safety — motion sensor waveform (normal <-> anomaly cycle)
===================================================================== */
(function () {
  'use strict';
  const canvas = document.getElementById('sensorCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const stateEl = document.getElementById('sensorState');
  const msgEl = document.getElementById('sensorMsg');
  const reduced = window.JAGRITI.reducedMotion;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  let anomalyPhase = 0; // 0 = normal, ramps to 1 during anomaly window
  const CYCLE = 480; // frames per full cycle
  let frameCount = 0;
  let running = false;

  function draw() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    frameCount = (frameCount + 1) % CYCLE;
    const inAnomaly = frameCount > CYCLE * 0.55 && frameCount < CYCLE * 0.85;
    anomalyPhase += inAnomaly ? 0.06 : -0.06;
    anomalyPhase = Math.max(0, Math.min(1, anomalyPhase));

    if (anomalyPhase > 0.5 && stateEl.textContent !== 'Anomaly') {
      stateEl.textContent = 'Anomaly';
      stateEl.classList.add('alert');
      msgEl.textContent = 'SYSTEM · Potential emergency detected';
      msgEl.classList.add('alert');
    } else if (anomalyPhase <= 0.5 && stateEl.textContent !== 'Normal') {
      stateEl.textContent = 'Normal';
      stateEl.classList.remove('alert');
      msgEl.textContent = 'SYSTEM · Monitoring motion pattern';
      msgEl.classList.remove('alert');
    }

    ctx.beginPath();
    const mid = h / 2;
    for (let x = 0; x <= w; x += 2) {
      const baseAmp = h * 0.14;
      const anomalyAmp = h * 0.4;
      const amp = baseAmp + (anomalyAmp - baseAmp) * anomalyPhase;
      const freq = 0.09 + anomalyPhase * 0.12;
      const jag = anomalyPhase * (Math.random() - 0.5) * h * 0.12;
      const y = mid + Math.sin(x * freq + t) * amp + jag;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = anomalyPhase > 0.5 ? '#D97706' : '#2563EB';
    ctx.lineWidth = 2;
    ctx.stroke();

    t += 0.12;
    if (running) requestAnimationFrame(draw);
  }

  if (reduced) {
    draw();
  } else {
    window.JAGRITI.onView(canvas, (visible) => {
      running = visible;
      if (visible) requestAnimationFrame(draw);
    }, { threshold: 0.2 });
  }
})();
