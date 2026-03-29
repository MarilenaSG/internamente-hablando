# CLAUDE.md — Internamente Hablando
> Archivo de contexto permanente para Claude Code.
> Leer siempre antes de tocar cualquier archivo del proyecto.

---

## 1. Qué es este proyecto

**Internamente Hablando** es el blog personal de Marilena Sánchez sobre comunicación interna, liderazgo y equipos. Tono directo, sin teorías de manual, con humor y casos reales.

- **URL:** https://internamentehablando.com
- **Stack:** HTML estático + CSS custom + JS vanilla. Sin frameworks. Sin npm. Sin build tools.
- **Tipografías:** `Newsreader` (serif, titulares) + `Inter` (sans, cuerpo y UI). **Nunca** Playfair Display ni DM Sans.
- **Hoja de estilos global:** `css/styles.css`
- **JS global:** `js/main.js`

---

## 2. Estructura de archivos

```
internamente_hablando/
├── CLAUDE.md                  ← este archivo
├── index.html                 ← home del sitio
├── css/
│   └── styles.css             ← ÚNICA fuente de verdad de estilos
├── js/
│   └── main.js
├── assets/
│   └── img/
│       └── blog/
│           ├── blog-hero.png              ← hero del index del blog
│           └── articulos/
│               ├── mi-jefe-es-un-imbecil.jpg
│               ├── comunicacion-no-es-marketing.jpg
│               └── [slug-del-articulo].jpg
└── blog/
    ├── index.html             ← listado de artículos
    ├── articulo-plantilla.html
    ├── mi-jefe-es-un-imbecil.html
    └── [slug].html
```

**Regla de rutas relativas:**
- Desde `blog/*.html` → `../css/styles.css`, `../assets/img/blog/...`
- Desde `index.html` raíz → `css/styles.css`, `assets/img/...`

---

## 3. Design System — colores y tokens

Usar **siempre** las custom properties. Nunca valores hardcodeados.

```css
/* Colores principales */
--color-verde-dark:   #1b4a42   /* primary — teal oscuro */
--color-magenta:      #c43b73   /* secondary — magenta/rosa */
--color-accent:       #00e8c4   /* accent — turquesa brillante */
--color-surface:      #FAF9F6   /* fondo hueso */
--color-on-surface:   #1A1C1A   /* texto principal */
--color-text-muted:   #6B7280   /* metadata, fechas */
--color-text-light:   #9CA3AF   /* placeholders, secundario */
--color-border:       #E5E7EB   /* bordes sutiles */

/* Nunca usar #000000 para texto — siempre var(--color-on-surface) */
/* Nunca usar #ffffff para fondo — siempre var(--color-surface) o #fff si aplica */
```

---

## 4. Componentes existentes — reutilizar siempre

Antes de escribir CSS nuevo, verificar si ya existe una clase en `styles.css`.

### Componentes disponibles
| Clase | Uso |
|---|---|
| `.nav` / `.nav__inner` | Navegación global |
| `.hero` / `.hero__inner` | Sección hero de cualquier página |
| `.articulo` | Contenedor artículo |
| `.articulo__header` | Cabecera del artículo |
| `.articulo__cuerpo` | Cuerpo del artículo |
| `.articulo__meta-top/bottom` | Metadatos (fecha, tiempo, categoría) |
| `.post-card` | Card de artículo en el listado |
| `.post-card__img-placeholder` | Placeholder imagen en cards |
| `.tag` / `.tag--categoria` | Etiquetas de categoría |
| `.highlight` | Subrayado turquesa en titulares |
| `.highlight--magenta` | Subrayado magenta en h2 de cuerpo |
| `.blockquote` | Pull quote destacado |
| `.bloque-acento` | Bloque de consejo o insight |
| `.articulo__newsletter` | CTA newsletter al final del artículo |
| `.articulos-relacionados` | Sección de artículos relacionados |
| `.footer` / `.footer__inner` | Footer global |
| `.seccion` | Sección con padding estándar |
| `.container` | Contenedor centrado con max-width |
| `.categoria-tag` | Botones de filtro en el índice |
| `.buscador` | Buscador del índice del blog |

### Reglas de reutilización
- **Nunca duplicar clases.** Si ya existe, úsala.
- Si necesitas una variación, usa modificador BEM: `.bloque__elemento--modificador`
- No usar `style=""` inline salvo para valores dinámicos o únicos justificados
- No crear `<style>` dentro del HTML — todo va a `styles.css`
- Si añades estilos en `<style>` por urgencia, comentarlo para moverlos después

---

## 5. Firma visual — los highlights

Es la identidad del blog. Obligatorio en todas las páginas.

```html
<!-- Turquesa: H1, conceptos positivos, soluciones -->
<span class="highlight">palabra</span>

<!-- Magenta: H2 del cuerpo, problemas, tensiones -->
<span class="highlight--magenta">palabra</span>
```

**Reglas estrictas:**
- Máximo **1 highlight por titular** (h1 o h2)
- Máximo **3 highlights en todo el cuerpo** del artículo
- Nunca en artículos, preposiciones o conectores ("de", "que", "y", "el")
- Siempre en el sustantivo o verbo con mayor carga conceptual

---

## 6. Sistema de imágenes

### Nomenclatura
```
assets/img/blog/blog-hero.png               ← hero del index del blog
assets/img/blog/articulos/[slug].jpg        ← imagen de cada artículo
```

El slug de la imagen = nombre del archivo HTML sin extensión.

### Implementación en hero con imagen oscura (sin overlay)
```html
<section class="hero" style="
  background-image: url('../assets/img/blog/blog-hero.png');
  background-size: cover;
  background-position: center right;
  min-height: calc(100vh - 64px);
">
```
- Las imágenes del proyecto son oscuras por diseño — **nunca añadir overlay**
- El texto sobre ellas va en color claro (`var(--color-surface)` o `#FAFAF7`)
- El sujeto de las imágenes suele estar a la derecha → `background-position: center right`

### Regla above the fold — OBLIGATORIA en todos los heroes

**Todo hero debe ocupar exactamente el viewport visible al cargar la página**, sin que el usuario tenga que hacer scroll para verlo completo ni que sobre espacio en blanco debajo.

```css
/* Fórmula estándar: viewport menos la altura de la nav */
.hero {
  min-height: calc(100vh - 64px); /* 64px = altura de la nav */
  display: flex;
  align-items: center; /* texto verticalmente centrado */
}

/* En móvil la nav puede ser más alta — ajustar si cambia */
@media (max-width: 640px) {
  .hero {
    min-height: calc(100vh - 56px);
  }
}
```

**Reglas:**
- Usar siempre `min-height: calc(100vh - [altura nav]px)` — nunca `min-height` con valor fijo en px
- El contenido del hero debe caber en ese espacio sin scroll — si no cabe, reducir padding o tamaño de fuente
- En móvil verificar que el texto no desborde la imagen hacia abajo
- **No usar `height` fijo** — solo `min-height` para que el contenido pueda crecer si hay texto largo
- El home ya funciona bien — tomar como referencia visual antes de tocar cualquier hero

### Formato y tamaño
| Uso | Formato | Dimensiones |
|---|---|---|
| Hero index / artículo | `.jpg` o `.png` | 1600×900px |
| Cards del listado | `.jpg` | 800×450px |

---

## 7. Responsive — reglas obligatorias

**Mobile first:** escribir estilos base para móvil, ampliar con `min-width`.

### Breakpoints del proyecto
```css
/* Móvil: base (sin media query) */
/* Tablet: */  @media (min-width: 640px)  { }
/* Desktop: */ @media (min-width: 1024px) { }
/* Wide: */    @media (min-width: 1280px) { }
```

### Checklist responsive en cada cambio
- [ ] ¿El texto es legible en 320px de ancho?
- [ ] ¿Los botones tienen mínimo 44×44px de área táctil?
- [ ] ¿Las imágenes tienen `max-width: 100%` y no desbordan?
- [ ] ¿Los gaps y paddings se reducen en móvil?
- [ ] ¿Los grids de múltiples columnas colapsan a 1 columna en móvil?
- [ ] ¿La navegación tiene menú hamburguesa funcional en móvil?
- [ ] ¿Los tamaños de fuente usan `clamp()` o valores relativos?
- [ ] Si hay hero: ¿ocupa exactamente el viewport con `calc(100vh - [nav]px)`?
- [ ] Si hay hero: ¿el texto no desborda la imagen en móvil?

### Tipografía fluida — usar clamp()
```css
/* Patrón estándar del proyecto */
font-size: clamp(var(--text-xl), 3.5vw, var(--text-2xl));

/* Nunca tamaños fijos en px para titulares */
```

---

## 8. Navegación — estructura fija

**Idéntica en todas las páginas.** No inventar variaciones.

```html
<nav class="nav" aria-label="Navegación principal">
  <div class="nav__inner">
    <a href="../index.html" class="nav__logo">Internamente Hablando</a>
    <button class="nav__toggle" id="navToggle" aria-expanded="false"
            aria-controls="navLinks" aria-label="Abrir menú">
      <span></span><span></span><span></span>
    </button>
    <ul class="nav__links" id="navLinks" role="list">
      <li><a href="../blog/index.html">Artículos</a></li>
      <li><a href="../temas/index.html">Temas</a></li>
      <li><a href="../acerca-de/index.html">Acerca de</a></li>
    </ul>
    <a href="../newsletter/index.html" class="nav__cta">Newsletter</a>
  </div>
</nav>
```
- La clase `activo` va en el enlace de la sección actual
- `main.js` añade `.scrolled` al nav al bajar 50px (glassmorphism automático)
- **Nunca** borde inferior en la nav

---

## 9. Footer — estructura fija

**Idéntico en todas las páginas.** Copiar siempre del template.

```html
<footer class="footer">
  <div class="footer__inner">
    <div class="footer__marca">
      <a href="../index.html" class="footer__logo"><em>Internamente<br>Hablando</em></a>
      <p>The Intellectual Curator. Conecta conversaciones internas y realidades organizacionales.</p>
    </div>
    <nav class="footer__nav" aria-label="Explorar">
      <strong>EXPLORAR</strong>
      <a href="../blog/index.html">Artículos</a>
      <a href="../temas/index.html">Temas</a>
      <a href="../acerca-de/index.html">Acerca de</a>
    </nav>
    <nav class="footer__nav" aria-label="Conectar">
      <strong>CONECTAR</strong>
      <a href="../newsletter/index.html">Newsletter</a>
      <a href="https://linkedin.com/in/marilena" target="_blank" rel="noopener">LinkedIn</a>
    </nav>
  </div>
  <div class="footer__bottom">
    <p>© <span id="year"></span> · INTERNAMENTE HABLANDO · Marilena Sánchez</p>
  </div>
</footer>
```

---

## 10. CSS — reglas de calidad

### Al escribir CSS nuevo
- Buscar primero si ya existe una clase equivalente en `styles.css`
- Usar siempre `var(--token)` para colores, espaciados y tipografía
- No usar valores en `px` para tipografía — usar `rem` o `var(--text-*)`
- No usar `!important` salvo casos absolutamente necesarios y comentados
- No usar `border-radius` mayor de `0.25rem` en contenedores de layout
- No usar `#000000` ni `#ffffff` — usar las variables del design system

### Al terminar cada cambio
- Revisar si hay clases CSS definidas pero no usadas → eliminarlas
- Revisar si el CSS nuevo duplica algo existente → consolidar
- Revisar si los estilos añadidos en `<style>` inline deben pasar a `styles.css`
- Probar visualmente en móvil (320px) y desktop (1280px)

### Nomenclatura BEM del proyecto
```css
.bloque { }
.bloque__elemento { }
.bloque__elemento--modificador { }
.bloque--modificador { }
```

---

## 11. Accesibilidad — mínimos obligatorios

- Todos los `<img>` necesitan `alt` descriptivo (o `alt=""` si son decorativas)
- Todos los formularios necesitan `<label>` o `aria-label`
- Los botones icon-only necesitan `aria-label`
- Mantener contraste mínimo AA: texto normal ≥ 4.5:1, texto grande ≥ 3:1
- Los enlaces deben ser reconocibles sin depender solo del color
- Usar elementos semánticos: `<nav>`, `<main>`, `<article>`, `<header>`, `<footer>`, `<section>`
- No usar `<div>` donde hay un elemento semántico apropiado

---

## 12. Performance — buenas prácticas

- Las imágenes del proyecto están en `assets/img/` — no enlazar externas sin justificación
- Las Google Fonts ya tienen `preconnect` en el `<head>` — no añadir más llamadas externas
- No añadir librerías JS nuevas sin consultarlo — el proyecto es vanilla por decisión
- Si hay JS nuevo, va al final del `<body>` o con `defer`
- No bloquear el render con scripts en el `<head>`

---

## 13. Meta tags — cabecera estándar

Cada página nueva debe incluir:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[TÍTULO] — Internamente Hablando</title>
<meta name="description" content="[Extracto, máx 160 caracteres]">
<meta name="author" content="Marilena Sánchez">
<meta property="og:title" content="[TÍTULO]">
<meta property="og:description" content="[EXTRACTO]">
<meta property="og:type" content="article">
<meta property="og:url" content="https://internamentehablando.com/blog/[slug].html">
```

---

## 14. Errores frecuentes — nunca repetir

| Error | Corrección |
|---|---|
| Más de 1 highlight por titular | Solo la palabra más cargada conceptualmente |
| Highlight en "de", "que", "el"... | Solo sustantivos o verbos con peso |
| Usar Playfair Display o DM Sans | Solo Newsreader + Inter |
| Overlay oscuro sobre imagen | Las imágenes ya son oscuras, no necesitan overlay |
| `border-radius` grande en cards | Máximo `0.25rem` |
| `#000` como color de texto | Usar `var(--color-on-surface)` |
| Footer distinto al template | Copiar siempre del template, no improvisar |
| Nav sin clase `activo` | Siempre marcar la sección actual |
| Grid de múltiples columnas sin colapsar en móvil | Añadir media query de colapso |
| CSS escrito en `<style>` en el HTML | Va a `styles.css`, no inline |
| Imágenes sin `alt` | Siempre con texto alternativo o `alt=""` |
| Valores px en tipografía de titulares | Usar `clamp()` o `var(--text-*)` |

---

## 15. Checklist antes de entregar cualquier cambio

- [ ] He reutilizado clases existentes antes de crear nuevas
- [ ] He usado variables CSS en lugar de valores hardcodeados
- [ ] He eliminado CSS huérfano (definido pero no usado)
- [ ] He verificado que funciona en móvil (320px mínimo)
- [ ] He verificado que funciona en desktop (1280px)
- [ ] Los textos sobre imágenes oscuras son legibles sin overlay
- [ ] La navegación tiene la clase `activo` correcta
- [ ] El footer es idéntico al template
- [ ] Las rutas relativas son correctas según la profundidad del archivo
- [ ] Los `<img>` tienen `alt`
