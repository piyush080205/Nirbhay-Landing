/* =====================================================================
   SIGNATURE INTERACTION 5 — Safe Routes map
===================================================================== */
(function () {
  'use strict';
  const panel = document.querySelector('.route-panel');
  if (!panel) return;
  const buttons = panel.querySelectorAll('.route-card');
  const grid = panel.querySelector('.route-grid');
  const infraGroup = panel.querySelector('.route-infra');

  /* faint background grid */
  if (grid) {
    let svgLines = '';
    for (let x = 0; x <= 600; x += 60) svgLines += `<line x1="${x}" y1="0" x2="${x}" y2="380"></line>`;
    for (let y = 0; y <= 380; y += 60) svgLines += `<line x1="0" y1="${y}" x2="600" y2="${y}"></line>`;
    grid.innerHTML = svgLines;
  }

  /* infrastructure markers along the safety-aware path */
  if (infraGroup) {
    const spots = [[160, 235], [270, 175], [380, 105], [460, 78]];
    infraGroup.innerHTML = spots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"></circle>`).join('');
  }

  function activate(routeKey) {
    buttons.forEach((btn) => {
      const isMatch = btn.dataset.route === routeKey;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-pressed', String(isMatch));
    });
    panel.classList.toggle('safe-active', routeKey === 'safe');
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => activate(btn.dataset.route));
  });

  window.JAGRITI.onView(panel, (visible) => {
    if (visible) setTimeout(() => activate('safe'), 500);
  }, { threshold: 0.5 });
})();
