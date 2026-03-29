// ============================================================
// INTERNAMENTE HABLANDO — main.js
// ============================================================

// Año dinámico en el footer
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Nav glassmorphism — clase .scrolled al hacer scroll
(function initNavScroll() {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  function update() { nav.classList.toggle('scrolled', window.scrollY > 50); }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

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

// Dropdown nav — toggle en móvil
(function initDropdown() {
  document.querySelectorAll('.nav__item--dropdown').forEach(function (item) {
    var trigger = item.querySelector('.nav__dropdown-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function (e) {
      // Solo actúa como toggle en móvil (hover se encarga en desktop)
      if (window.innerWidth > 768) return;
      var isOpen = item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen);
      e.stopPropagation();
    });
  });
  // Cerrar al hacer clic fuera
  document.addEventListener('click', function () {
    document.querySelectorAll('.nav__item--dropdown.is-open').forEach(function (item) {
      item.classList.remove('is-open');
      var trigger = item.querySelector('.nav__dropdown-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  });
})();

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
  var EXIT_START = 0.90;
  var EXIT_END   = 1.10;

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
    var rawProgress = scrolled / scrollable;
    var progress    = clamp01(rawProgress);

    // Vídeo — clamped (no puede ir más allá del final del clip)
    if (duration) video.currentTime = progress * duration;

    // Textos — sin clamp, puede superar 1.0 para que la salida termine
    animateTexts(rawProgress);
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

// ============================================================
// IMÁGENES DE ARTÍCULOS
// Vincula automáticamente la imagen correcta a cada tarjeta
// extrayendo el slug del enlace más cercano al placeholder.
// Escalable: añadir un artículo nuevo en cualquier página
// no requiere tocar este archivo.
// ============================================================
(function initArticleImages() {

  // Ruta base hacia assets/img/blog/articles/ relativa a esta página.
  // Usa el href del CSS como ancla: siempre apunta a 'css/styles.css' desde la raíz,
  // lo que funciona tanto en file:// local como en servidor, independientemente
  // de la profundidad de carpetas o la ruta del sistema operativo.
  var cssLink = document.querySelector('link[href*="css/styles.css"]');
  if (!cssLink) return;
  var ROOT    = cssLink.getAttribute('href').replace('css/styles.css', '');
  var IMG_BASE = ROOT + 'assets/img/blog/articles/';

  // Extrae el slug del href (acepta rutas relativas con o sin carpeta)
  function slugFromHref(href) {
    if (!href || !href.endsWith('.html')) return null;
    return href.split('/').pop().replace('.html', '');
  }

  // Reemplaza un placeholder por un <img>
  function replacePlaceholder(placeholder, slug, cssClass) {
    var img    = document.createElement('img');
    img.src    = IMG_BASE + slug + '.jpg';
    img.alt    = '';          // decorativa: el título y texto ya describen el artículo
    img.loading = 'lazy';
    if (cssClass) img.className = cssClass;
    placeholder.replaceWith(img);
  }

  // Encuentra el enlace al artículo más cercano a un elemento
  function findLink(el) {
    return el.closest('a[href]')
        || (function () {
          var c = el.closest('.post-card, article, .featured__inner, .relacionados__lista');
          return c ? c.querySelector('a[href$=".html"]') : null;
        })();
  }

  // 1 · post-card__img-placeholder  →  post-card__img  (blog/index.html)
  document.querySelectorAll('.post-card__img-placeholder').forEach(function (el) {
    var link = findLink(el);
    var slug = slugFromHref(link && link.getAttribute('href'));
    if (slug) replacePlaceholder(el, slug, 'post-card__img');
  });

  // 2 · img-placeholder  →  <img>  (home: featured + post-mini)
  document.querySelectorAll('.img-placeholder').forEach(function (el) {
    var link = findLink(el);
    var slug = slugFromHref(link && link.getAttribute('href'));
    if (slug) replacePlaceholder(el, slug, null);
  });

  // 3 · rel-card__img-placeholder  →  rel-card__img  (artículos relacionados)
  document.querySelectorAll('.rel-card__img-placeholder').forEach(function (el) {
    var card = el.closest('a.rel-card[href]');
    var slug = slugFromHref(card && card.getAttribute('href'));
    if (slug) replacePlaceholder(el, slug, 'rel-card__img');
  });

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

// ============================================================
// SWEEP — transición entre hero y contenido
// ============================================================

(function initSweep() {
  var sweepSection = document.getElementById('sweepSection');
  if (!sweepSection) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var heroSection  = document.getElementById('heroSection');
  if (!heroSection) return;

  var rafScheduled = false;

  function checkTrigger() {
    rafScheduled = false;
    var heroBottom = heroSection.getBoundingClientRect().bottom;
    var crossed    = heroBottom <= window.innerHeight * 0.8;
    sweepSection.classList.toggle('is-visible', crossed);
  }

  function onScroll() {
    if (!rafScheduled) { rafScheduled = true; requestAnimationFrame(checkTrigger); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  checkTrigger();
})();
