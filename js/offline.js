/* =====================================================================
   SIGNATURE INTERACTION 6 — Offline resilience transition
===================================================================== */
(function () {
  'use strict';
  const flow = document.getElementById('offlineFlow');
  if (!flow) return;
  const statusWrap = flow.querySelector('.offline-status');
  const statusText = document.getElementById('offlineStatusText');
  const nodes = Array.from(flow.querySelectorAll('.offline-node'));

  let running = false;
  function play() {
    if (running) return;
    running = true;
    nodes.forEach((n) => n.classList.remove('active', 'done'));
    statusWrap.classList.remove('restored');
    statusText.textContent = 'NETWORK OFFLINE';

    const step = window.JAGRITI.reducedMotion ? 0 : 650;
    nodes.forEach((n, i) => {
      setTimeout(() => {
        nodes.forEach((m, j) => { if (j < i) { m.classList.remove('active'); m.classList.add('done'); } });
        n.classList.add('active');
        if (n.dataset.step === 'restored') {
          statusWrap.classList.add('restored');
          statusText.textContent = 'NETWORK RESTORED';
        }
      }, i * step);
    });
    setTimeout(() => {
      nodes.forEach((n) => { n.classList.remove('active'); n.classList.add('done'); });
      running = false;
    }, nodes.length * step + 500);
  }

  window.JAGRITI.onView(flow, (visible) => { if (visible) setTimeout(play, 300); }, { threshold: 0.5 });
})();
