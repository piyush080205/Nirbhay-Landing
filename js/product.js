/* =====================================================================
   Meet Jāgriti — phone mockup, tab-driven screens
===================================================================== */
(function () {
  'use strict';
  const screen = document.getElementById('phoneScreen');
  const tabs = document.getElementById('productTabs');
  if (!screen || !tabs) return;

  const content = {
    status: {
      label: 'HOME', title: 'Safety Status',
      cards: [
        '<strong><span class="pscreen-status-dot"></span>Protected</strong>Monitoring is active for this trip.',
        '<strong>Trip started</strong>18 min ago · sharing with 2 guardians',
        '<strong>Battery-aware</strong>Location checks tuned to save power',
      ],
    },
    detection: {
      label: 'DETECTION', title: 'Autonomous Detection',
      cards: [
        '<strong>Motion pattern</strong>Learning your normal walking rhythm',
        '<strong>On-device model</strong>Runs locally — no cloud needed to detect',
        '<strong>Status</strong>No anomalies in the last 20 seconds',
      ],
    },
    emergency: {
      label: 'WORKFLOW', title: 'Emergency Workflow',
      cards: [
        '<strong>Step 1</strong>Anomaly flagged and reviewed for context',
        '<strong>Step 2</strong>Guardians notified with live location',
        '<strong>Step 3</strong>Works over SMS if data is unavailable',
      ],
    },
    location: {
      label: 'LOCATION', title: 'Live Location',
      cards: [
        '<strong>Shared with</strong>Mom, Ananya',
        '<strong>Accuracy</strong>Optimized for low battery drain',
        '<strong>Last update</strong>12 seconds ago',
      ],
    },
    route: {
      label: 'ROUTES', title: 'Safe Route',
      cards: [
        '<strong>Safety-aware route</strong>19 min · near lit streets',
        '<strong>Fastest route</strong>14 min · shortest distance',
        '<strong>Note</strong>Not a guarantee of safety — a signal, not a promise',
      ],
    },
    infra: {
      label: 'NEARBY', title: 'Safety Infrastructure',
      cards: [
        '<strong>Police outpost</strong>0.4 km away',
        '<strong>24-hr store</strong>0.2 km away',
        '<strong>Well-lit stretch</strong>Ahead on current route',
      ],
    },
  };

  function render(key) {
    const data = content[key];
    if (!data) return;
    screen.innerHTML = `
      <div class="pscreen active">
        <span class="pscreen-label">${data.label}</span>
        <h4 class="pscreen-title">${data.title}</h4>
        <div class="pscreen-body">
          ${data.cards.map((c) => `<div class="pscreen-card">${c}</div>`).join('')}
        </div>
      </div>`;
  }

  render('status');

  tabs.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      render(btn.dataset.screen);
    });
  });

  /* Auto-advance gently when in view, pausing on user interaction */
  let autoTimer = null;
  let userInteracted = false;
  tabs.addEventListener('click', () => { userInteracted = true; if (autoTimer) clearInterval(autoTimer); });

  function startAuto() {
    if (window.JAGRITI.reducedMotion || userInteracted) return;
    const keys = Object.keys(content);
    let i = 0;
    autoTimer = setInterval(() => {
      i = (i + 1) % keys.length;
      const btn = tabs.querySelector(`button[data-screen="${keys[i]}"]`);
      if (btn) {
        tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', 'false'));
        btn.setAttribute('aria-selected', 'true');
        render(keys[i]);
      }
    }, 3200);
  }

  window.JAGRITI.onView(document.getElementById('product'), (visible) => {
    if (visible) startAuto();
    else if (autoTimer) clearInterval(autoTimer);
  }, { threshold: 0.4 });
})();
