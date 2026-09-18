/* =====================================================================
   Technology Architecture — expandable layer stack
===================================================================== */
(function () {
  'use strict';
  const stack = document.getElementById('archStack');
  if (!stack) return;
  const layers = Array.from(stack.querySelectorAll('.arch-layer'));

  function openLayer(target) {
    layers.forEach((l) => l.setAttribute('aria-expanded', String(l === target)));
  }

  layers.forEach((layer) => {
    layer.addEventListener('click', () => {
      const isOpen = layer.getAttribute('aria-expanded') === 'true';
      openLayer(isOpen ? null : layer);
    });
  });

  window.JAGRITI.onView(stack, (visible) => {
    if (visible) openLayer(layers[0]);
  }, { threshold: 0.4 });
})();
