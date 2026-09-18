/* =====================================================================
   SIGNATURE INTERACTION 3 — The Moment
   A pinned cinematic sequence: normal -> change -> notice -> context -> response
===================================================================== */
(function () {
  'use strict';
  const section = document.getElementById('moment');
  if (!section) return;
  const sticky = section.querySelector('.moment-sticky');
  const spacer = section.querySelector('.moment-spacer');
  const scenes = Array.from(section.querySelectorAll('.moment-scene'));
  const progressDots = Array.from(section.querySelectorAll('.moment-progress span'));
  const reduced = window.JAGRITI.reducedMotion;

  let currentScene = -1;

  function setScene(i) {
    if (i === currentScene) return;
    currentScene = i;
    scenes.forEach((s, idx) => s.classList.toggle('active', idx === i));
    progressDots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  function onScroll() {
    const rect = section.getBoundingClientRect();
    const scrollable = spacer.offsetHeight;
    const raw = -rect.top;
    let progress = scrollable > 0 ? raw / scrollable : 0;
    progress = Math.min(1, Math.max(0, progress));
    const idx = Math.min(scenes.length - 1, Math.floor(progress * scenes.length));
    setScene(idx);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  setScene(0);

  /* --- calm waveform for scene 0 --- */
  const waveWrap = document.getElementById('momentWave');
  if (waveWrap) {
    const canvas = waveWrap.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = waveWrap.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    function draw() {
      const w = waveWrap.clientWidth, h = waveWrap.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 3) {
        const y = h / 2 + Math.sin(x * 0.045 + t) * (h * 0.14);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(110,147,255,0.85)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      t += 0.05;
      if (!reduced) requestAnimationFrame(draw);
    }
    draw();
  }
})();
