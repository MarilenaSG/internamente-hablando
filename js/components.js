// ============================================================
// INTERNAMENTE HABLANDO — components.js
// Sistema de componentes reutilizables (JS vanilla, sin build)
//
// NOTA: Requiere servidor HTTP (VS Code Live Server, Python http.server, etc.)
// No funciona con file:// en Chrome por restricciones CORS.
// Firefox permite file:// con configuración adicional.
// ============================================================

// Determinar BASE desde la URL de este propio script — funciona sin importar
// desde qué profundidad se carga la página o si hay subcarpeta en el servidor.
const _s = document.currentScript || document.querySelector('script[src*="components.js"]');
const BASE = _s ? _s.src.replace(/js\/components\.js.*$/, '') : './';

// ── Cargar e inyectar un componente ──────────────────────────
async function loadComponent(selector, file) {
  const el = document.querySelector(selector);
  if (!el) return;

  try {
    const res = await fetch(`${BASE}components/${file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let html = await res.text();

    // Reemplazar placeholder {{BASE}} con la ruta base calculada
    html = html.split('{{BASE}}').join(BASE);

    el.outerHTML = html;
  } catch (err) {
    console.warn(`[IH Components] No se pudo cargar "${file}":`, err.message);
  }
}

// ── Marcar enlace activo según la URL actual ──────────────────
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav__links a').forEach(link => {
    link.classList.remove('activo');
    const href = link.getAttribute('href');
    if (!href) return;
    // Convertir href absoluto a pathname para comparar
    try {
      const linkPath = new URL(href, window.location.href).pathname;
      // Evitar que '/' marque todo como activo
      if (linkPath !== '/' && linkPath !== '/index.html' && path.includes(linkPath)) {
        link.classList.add('activo');
      }
    } catch (_) {}
  });
}

// ── Cargar main.js dinámicamente (scripts inyectados via innerHTML no ejecutan) ─
function loadMainScript() {
  return new Promise(resolve => {
    // Evitar carga doble si ya está en el DOM
    if (document.querySelector(`script[src*="main.js"]`)) { resolve(); return; }
    const script = document.createElement('script');
    script.src = `${BASE}js/main.js`;
    script.onload = resolve;
    script.onerror = resolve; // no bloquear si falla
    document.body.appendChild(script);
  });
}

// ── Orquestador principal ─────────────────────────────────────
async function initComponents() {
  await Promise.all([
    loadComponent('[data-component="navbar"]',         'navbar.html'),
    loadComponent('[data-component="footer"]',         'footer.html'),
    loadComponent('[data-component="newsletter-cta"]', 'newsletter-cta.html'),
  ]);

  setActiveNav();

  // Cargar main.js DESPUÉS de inyectar los componentes para que encuentre el DOM
  await loadMainScript();
}

document.addEventListener('DOMContentLoaded', initComponents);
