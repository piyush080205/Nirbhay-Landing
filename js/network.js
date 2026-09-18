/* =====================================================================
   SIGNATURE INTERACTION 4 — Safety Network graph
   Person -> Device -> Location -> Contacts -> Support -> Response
===================================================================== */
(function () {
  'use strict';
  const graph = document.getElementById('networkGraph');
  if (!graph) return;
  const nodes = Array.from(graph.querySelectorAll('.network-node'));
  const linesGroup = graph.querySelector('.network-lines');
  const svg = graph.querySelector('svg');

  function layoutLines() {
    linesGroup.innerHTML = '';
    const rect = graph.querySelector('.network-nodes').getBoundingClientRect();
    if (!rect.width) return;
    const positions = nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return {
        x: ((r.left + r.width / 2 - rect.left) / rect.width) * 900,
        y: ((r.top + r.height / 2 - rect.top) / rect.height) * 220,
      };
    });
    for (let i = 0; i < positions.length - 1; i++) {
      const a = positions[i], b = positions[i + 1];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
      line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
      line.dataset.index = i;
      linesGroup.appendChild(line);
    }
  }

  layoutLines();
  window.addEventListener('resize', layoutLines);

  let cascadeRunning = false;
  function cascade() {
    if (cascadeRunning) return;
    cascadeRunning = true;
    nodes.forEach((n) => n.classList.remove('active'));
    linesGroup.querySelectorAll('line').forEach((l) => l.classList.remove('active'));
    const step = window.JAGRITI.reducedMotion ? 0 : 260;
    nodes.forEach((n, i) => {
      setTimeout(() => {
        n.classList.add('active');
        const line = linesGroup.querySelector(`line[data-index="${i - 1}"]`);
        if (line) line.classList.add('active');
      }, i * step);
    });
    setTimeout(() => { cascadeRunning = false; }, nodes.length * step + 600);
  }

  nodes.forEach((n) => n.addEventListener('click', cascade));
  nodes.forEach((n) => n.addEventListener('focus', cascade));

  window.JAGRITI.onView(graph, (visible) => { if (visible) setTimeout(cascade, 300); }, { threshold: 0.5 });
})();
