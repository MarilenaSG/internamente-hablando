// ============================================================
// INTERNAMENTE HABLANDO — main.js
// ============================================================

// Año dinámico en el footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Menú móvil
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

if (navToggle && navLinks) {
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

// Marcar enlace activo según la URL
(function markActiveLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav__links a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const segment = href.replace(/^\.\.\//, '/').replace(/\/index\.html$/, '/');
    if (path.includes(segment) && segment !== 'index.html' && segment !== '/') {
      link.classList.add('activo');
    }
  });
})();

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

  // Elementos de texto en orden de aparición
  var textItems = [
    {
      el:         heroSection.querySelector('.hero__etiqueta--video'),
      enterStart: 0.00, enterEnd: 0.18,
      scaleFrom:  0.75, yFrom: 36        // entra pequeña, crece
    },
    {
      el:         heroSection.querySelector('.hero__titulo--video'),
      enterStart: 0.08, enterEnd: 0.30,
      scaleFrom:  0.55, yFrom: 90        // entrada muy dramática: nace pequeño y sube
    },
    {
      el:         heroSection.querySelector('.hero__subtitulo-bloque'),
      enterStart: 0.18, enterEnd: 0.40,
      scaleFrom:  0.82, yFrom: 48
    }
  ].filter(function (item) { return !!item.el; });

  // Fase de salida compartida
  var EXIT_START = 0.58;
  var EXIT_END   = 0.90;

  // Easings
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function easeInCubic(t)  { return t * t * t; }  // más acelerado en salida

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  // Aplica opacity + transform a un elemento sin transición CSS
  function applyStyle(el, opacity, scale, y) {
    el.style.opacity   = opacity;
    el.style.transform = 'translateY(' + y + 'px) scale(' + scale + ')';
  }

  // Anima los textos según el progreso de scroll (0→1)
  function animateTexts(progress) {
    // Distancia al centro de la pantalla: los textos están al fondo,
    // el centro está a aprox. 35% del alto del viewport hacia arriba.
    var toCenterY = window.innerHeight * 0.35;

    textItems.forEach(function (item) {

      // Fase salida — escalan en grande y suben al centro
      if (progress >= EXIT_END) {
        applyStyle(item.el, 0, 1.80, -toCenterY);
        return;
      }
      if (progress >= EXIT_START) {
        var tOut = easeInCubic(clamp01((progress - EXIT_START) / (EXIT_END - EXIT_START)));
        applyStyle(item.el,
          1 - tOut,
          1 + 0.80 * tOut,          // de scale(1) → scale(1.80)
          -toCenterY * tOut          // sube hasta el centro de pantalla
        );
        return;
      }

      // Fase entrada
      if (progress < item.enterStart) {
        applyStyle(item.el, 0, item.scaleFrom, item.yFrom);
        return;
      }
      if (progress < item.enterEnd) {
        var tIn    = easeOutCubic(clamp01((progress - item.enterStart) / (item.enterEnd - item.enterStart)));
        var scaleDelta = 1 - item.scaleFrom;
        applyStyle(item.el, tIn, item.scaleFrom + scaleDelta * tIn, item.yFrom * (1 - tIn));
        return;
      }

      // Fase estable
      applyStyle(item.el, 1, 1, 0);
    });
  }

  // ── Modo móvil o reducción de movimiento ─────────────────
  if (isMobile || reducedMotion) {
    // Vídeo en autoplay
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');
    video.muted = true;
    video.play().catch(function () {});

    // Textos visibles de inmediato
    textItems.forEach(function (item) {
      applyStyle(item.el, 1, 1, 0);
    });
    return;
  }

  // ── Desktop: scroll-scrubbing ─────────────────────────────
  var duration     = 0;
  var rafScheduled = false;

  // Estado inicial: textos ocultos en su posición de entrada
  textItems.forEach(function (item) {
    applyStyle(item.el, 0, item.scaleFrom, item.yFrom);
  });

  function onMetadata() {
    duration = video.duration;
    video.pause();
    scrub();
  }

  video.addEventListener('loadedmetadata', onMetadata);
  if (video.readyState >= 1) onMetadata();

  function scrub() {
    rafScheduled = false;

    var rect      = heroSection.getBoundingClientRect();
    var scrollable = heroSection.offsetHeight - window.innerHeight;
    var scrolled  = Math.max(0, -rect.top);
    var progress  = clamp01(scrolled / scrollable);

    // Vídeo
    if (duration) video.currentTime = progress * duration;

    // Textos
    animateTexts(progress);
  }

  function onScroll() {
    if (!rafScheduled) {
      rafScheduled = true;
      requestAnimationFrame(scrub);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Llamada inicial para posicionar textos en scroll = 0
  scrub();
})();

// ── Reveal-blocks fuera del hero (IntersectionObserver) ──────
(function initRevealBlocks() {
  // Los reveal-blocks del hero los maneja el scroll-scrubbing; skip them
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
      var el    = entry.target;
      var delay = parseInt(el.dataset.delay, 10) || 0;
      setTimeout(function () { el.classList.add('is-visible'); }, delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  blocks.forEach(function (el) { observer.observe(el); });
})();
