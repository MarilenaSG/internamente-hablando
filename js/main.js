// ============================================================
// INTERNAMENTE HABLANDO — main.js
// Funciones nombradas para que components.js pueda llamarlas
// después de inyectar los componentes en el DOM.
// ============================================================

// ── Año dinámico en el footer ─────────────────────────────────
function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ── Nav glassmorphism — clase .scrolled al hacer scroll ───────
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  function update() { nav.classList.toggle('scrolled', window.scrollY > 50); }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ── Menú móvil (hamburguesa) ──────────────────────────────────
function initMobileMenu() {
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Cerrar al hacer clic en un enlace
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Dropdown nav — toggle en móvil ───────────────────────────
function initDropdown() {
  document.querySelectorAll('.nav__item--dropdown').forEach(function (item) {
    var trigger = item.querySelector('.nav__dropdown-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      if (window.innerWidth > 768) return;
      var isOpen = item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen);
      e.stopPropagation();
    });
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.nav__item--dropdown.is-open').forEach(function (item) {
      item.classList.remove('is-open');
      var trigger = item.querySelector('.nav__dropdown-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Inicializar todo ──────────────────────────────────────────
function initAll() {
  initYear();
  initNavScroll();
  initMobileMenu();
  initDropdown();
}

// Auto-init: si DOMContentLoaded ya disparó (carga dinámica desde components.js),
// ejecutar directamente. Si no, esperar al evento.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

// ============================================================
// HERO CON VÍDEO — scroll-scrubbing + animación de textos
// ============================================================

(function initHeroVideo() {
  var heroSection = document.getElementById('heroSection');
  if (!heroSection) return;

  var video = heroSection.querySelector('.hero__video');
  if (!video) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile      = window.matchMedia('(max-width: 768px)').matches;

  var textItems = [
    { el: heroSection.querySelector('.hero__etiqueta--video'), enterStart: 0.00, enterEnd: 0.18, scaleFrom: 0.75, yFrom: 36 },
    { el: heroSection.querySelector('.hero__titulo--video'),   enterStart: 0.08, enterEnd: 0.30, scaleFrom: 0.55, yFrom: 90 },
    { el: heroSection.querySelector('.hero__subtitulo-bloque'),enterStart: 0.18, enterEnd: 0.40, scaleFrom: 0.82, yFrom: 48 }
  ].filter(function (item) { return !!item.el; });

  var EXIT_START = 0.90;
  var EXIT_END   = 1.10;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInCubic(t)  { return t * t * t; }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function applyStyle(el, opacity, scale, y) {
    el.style.opacity   = opacity;
    el.style.transform = 'translateY(' + y + 'px) scale(' + scale + ')';
  }

  function animateTexts(progress) {
    var toCenterY = window.innerHeight * 0.35;
    textItems.forEach(function (item) {
      if (progress >= EXIT_END) { applyStyle(item.el, 0, 1.80, -toCenterY); return; }
      if (progress >= EXIT_START) {
        var tOut = easeInCubic(clamp01((progress - EXIT_START) / (EXIT_END - EXIT_START)));
        applyStyle(item.el, 1 - tOut, 1 + 0.80 * tOut, -toCenterY * tOut);
        return;
      }
      if (progress < item.enterStart) { applyStyle(item.el, 0, item.scaleFrom, item.yFrom); return; }
      if (progress < item.enterEnd) {
        var tIn = easeOutCubic(clamp01((progress - item.enterStart) / (item.enterEnd - item.enterStart)));
        applyStyle(item.el, tIn, item.scaleFrom + (1 - item.scaleFrom) * tIn, item.yFrom * (1 - tIn));
        return;
      }
      applyStyle(item.el, 1, 1, 0);
    });
  }

  if (isMobile || reducedMotion) {
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.muted = true;
    video.play().catch(function () {});
    textItems.forEach(function (item) { applyStyle(item.el, 1, 1, 0); });
    return;
  }

  var duration = 0;
  var rafScheduled = false;

  textItems.forEach(function (item) { applyStyle(item.el, 0, item.scaleFrom, item.yFrom); });

  function onMetadata() { duration = video.duration; video.pause(); scrub(); }
  video.addEventListener('loadedmetadata', onMetadata);
  if (video.readyState >= 1) onMetadata();

  function scrub() {
    rafScheduled = false;
    var rect       = heroSection.getBoundingClientRect();
    var scrollable = heroSection.offsetHeight - window.innerHeight;
    var scrolled   = Math.max(0, -rect.top);
    var rawProgress = scrolled / scrollable;
    var progress    = clamp01(rawProgress);
    if (duration) video.currentTime = progress * duration;
    animateTexts(rawProgress);
  }

  function onScroll() { if (!rafScheduled) { rafScheduled = true; requestAnimationFrame(scrub); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  scrub();
})();

// ── Reveal-blocks (IntersectionObserver) ─────────────────────
(function initRevealBlocks() {
  var blocks = Array.from(document.querySelectorAll('.reveal-block')).filter(function (el) {
    return !el.closest('#heroSection');
  });
  if (!blocks.length) return;
  if (!('IntersectionObserver' in window)) {
    blocks.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var delay = parseInt(entry.target.dataset.delay, 10) || 0;
      setTimeout(function () { entry.target.classList.add('is-visible'); }, delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  blocks.forEach(function (el) { observer.observe(el); });
})();
