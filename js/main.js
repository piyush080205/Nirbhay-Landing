/* =====================================================================
   CORE — nav behaviour, reveal-on-scroll, mobile menu, reduced motion
===================================================================== */
(function () {
  'use strict';

  window.JAGRITI = window.JAGRITI || {};
  window.JAGRITI.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- split text into words for kinetic reveal ---------- */
  document.querySelectorAll('[data-split]').forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = '';
    text.split(' ').forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word + (i < text.split(' ').length - 1 ? ' ' : '');
      span.style.transitionDelay = (i * 0.05) + 's';
      el.appendChild(span);
    });
  });

  /* ---------- scroll reveal ---------- */
  const revealTargets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- nav scroll + theme state ---------- */
  const nav = document.getElementById('nav');
  const darkZones = Array.from(document.querySelectorAll('.dark-zone, .hero, .moment'));

  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 40);

    const navRect = nav.getBoundingClientRect();
    const probeY = navRect.bottom;
    let onDark = false;
    for (const zone of darkZones) {
      const r = zone.getBoundingClientRect();
      if (r.top <= probeY && r.bottom >= probeY) { onDark = true; break; }
    }
    nav.classList.toggle('nav-on-dark', onDark);
  }
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav);

  /* ---------- mobile nav ---------- */
  const burger = document.getElementById('navBurger');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');

  function closeMobileNav() {
    burger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMobileNav();
    } else {
      burger.setAttribute('aria-expanded', 'true');
      mobileNav.classList.add('open');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  });

  mobileNavClose.addEventListener('click', closeMobileNav);
  mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMobileNav));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileNav();
  });

  /* ---------- number counters ---------- */
  const counters = document.querySelectorAll('.stat-num[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        cio.unobserve(entry.target);
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        if (window.JAGRITI.reducedMotion) {
          el.textContent = prefix + target.toLocaleString('en-IN') + suffix;
          return;
        }
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(eased * target).toLocaleString('en-IN') + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
  }

  /* ---------- shared: run fn only when element is in view ---------- */
  window.JAGRITI.onView = function (el, fn, opts) {
    if (!el || !('IntersectionObserver' in window)) { fn(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => fn(entry.isIntersecting));
    }, Object.assign({ threshold: 0.2 }, opts));
    io.observe(el);
    return io;
  };
})();
