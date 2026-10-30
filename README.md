# LGV Legal Consultores — sitio web

Sitio estático de **LEGAL CONSULTORES S.A.S** (LGV Legal Consultores), firma de abogados y asesoría contable en Colombia.

- Producción: https://lgvlegalconsultores.com/
- Repositorio: https://github.com/servitecbaq/lgvconsultores (rama `main`)
- Hosting: **GitHub Pages** sirviendo la raíz del repo. El dominio viene de [`CNAME`](CNAME).
- Idioma: español (`lang="es"`, `og:locale es_CO`)

Si vas a modificar el sitio —y más aún si eres una IA—, lee primero [`AGENTS.md`](AGENTS.md): están las
trampas del CSS duplicado, el procedimiento para añadir iconos o páginas, y las decisiones del dueño
que no conviene reabrir.

## Sin build

No hay `package.json`, ni dependencias, ni paso de compilación. **Publicar = hacer push a `main`**;
GitHub Pages despliega solo (tarda ~1 minuto). Para ver cambios locales basta abrir `index.html`,
o mejor servir la carpeta (`python -m http.server`, `npx serve`) para que las rutas relativas y las
fuentes se comporten como en producción.

## Estructura

```
index.html                  landing de una sola página (hero, nosotros, servicios, valores,
                            encuesta, contacto, footer) — 35,6 KB
politica-privacidad.html    ┐
aviso-legal.html            ├ páginas legales, comparten <head> y maquetación .legal-*
terminos-condiciones.html   ┘
styles.css                  todo el CSS, un solo archivo, sin preprocesador — 50,9 KB
js/form.js                  envío del formulario de contacto (fetch → Web3Forms)
img/                        logo, hero (2 variantes), about, og-lgv.jpg y 16 fotos de servicios
webfonts/                   Inter, Playfair Display y 2 subconjuntos de Font Awesome (.woff2)
robots.txt                  `Allow: /`, sitemap y crawl-delay para Ahrefs/Semrush
sitemap.xml                 4 URLs reales (sin anclas)
favicon.svg / logo-lgv.svg / logo-lgv.png   ver "Assets sin referenciar"
```

## Secciones de `index.html`

| Sección | ID | Línea aprox. |
|---|---|---|
| Header + nav | `#header` | 106 |
| Hero (LCP) | `#inicio` | 132 |
| Nosotros | `#nosotros` | 173 |
| Áreas de práctica (6 tarjetas con carrusel) | `#servicios` | 226 |
| Valores (+ encuesta) | `#valores` | 348 / 393 |
| Contacto (info + formulario) | `#contacto` | 410 |
| Footer | — | 527 |

## Cómo cambiar lo más común

- **Teléfono, correo, horarios**: están duplicados en 4 sitios — el JSON-LD del `<head>`
  (líneas 52-78), el bloque de contacto (427-455), la lista del footer (565-569) y el fallback de
  error de `js/form.js` (avisa por WhatsApp). Cámbialos en todos o la ficha enriquecida y la página
  se contradicen. El `wa.me/573148695606` del botón flotante (595) también lleva el número.
- **Añadir un área de práctica**: duplica un `<article class="service-card">`, enlaza sus imágenes en
  `img/servicios/` con `width`/`height`/`loading="lazy"`, añade el `<option>` correspondiente en el
  `<select id="asunto">`, y añade el tema al `knowsAbout` del JSON-LD.
- **Servicios / enlaces del footer**: listas planas en 542-548 y 553-559; apuntan todas a `#servicios`.
- **Una página nueva**: copia el `<head>` de `politica-privacidad.html` (styles + 3 preloads de fuente
  + bloque OG + script de Clarity), ajusta `canonical`/`og:url`/`og:title` y regístrala en `sitemap.xml`.

## Integraciones (todas del lado cliente, sin backend propio)

| Qué | Dónde |
|---|---|
| **Formulario → correo** | [Web3Forms](https://www.web3forms.com). La `access_key` está en `index.html:467` y es pública por diseño (la valida el endpoint, no el origen). Se gestiona desde el panel de Web3Forms. |
| **Analítica / grabación** | Microsoft Clarity, proyecto `z2b3axomu8`; snippet en las 4 páginas. Los 5 campos del formulario llevan `data-clarity-mask="true"` para no grabar datos personales. |
| **Verificación Search Console** | `<meta name="google-site-verification">` en `index.html:9`. No borrar: desvincula el dominio de Search Console. |
| **Encuesta** | Google Forms, enlace duro en `index.html:402`. |

## Rendimiento

Medido con Lighthouse 13.5 móvil sobre producción: **Performance 100, Accesibilidad 100, SEO 100,
Buenas prácticas 77**, LCP 1,77 s, 451 KB, 27 peticiones.

Lo que sostiene ese número, y que hay que cuidar al tocar el sitio:

- El **LCP es el fondo del hero** (`.hero`, `img/hero-m.webp` / `img/hero-d.webp`), no un `<img>`.
  Se anuncia con dos `<link rel="preload" as="image" media="...">` en el `<head>` (23-24) y la
  variante de escritorio se aplica en `styles.css:1982` con `@media (min-width: 901px)`. Cambiar
  la ruta, el breakpoint o quitar el preload degrada el LCP de inmediato.
- **Cero recursos externos bloqueantes**: no hay Google Fonts, ni CDN, ni Font Awesome por CDN. Las
  fuentes viven en `webfonts/` y se declaran al principio de `styles.css`.
- **Iconos**: solo los ~30 glifos usados, en dos subconjuntos propios (`LGV Icons Solid` /
  `LGV Icons Brands`). Ver `AGENTS.md` para el procedimiento de añadir un icono.
- Imágenes del sitio: WebP, con `width`/`height` explícitos (`CLS 0`).
- **El 77 de Buenas prácticas no es un defecto del sitio**: lo baja Clarity por su sincronización de
  cookies de terceros con `c.bing.com`.
- **El 85 que a veces devuelve PageSpeed tampoco es regresión**: GitHub Pages libre sirve
  `Cache-Control: max-age=600`, así que cada 10 minutos el borde caduca y la siguiente visita mide en
  frío (LCP ~3,9 s). Antes de culpar a un cambio, calienta la caché y vuelve a medir.

## Assets sin referenciar

`logo-lgv.png` (1,13 MB) y `logo-lgv.svg` no los usa ninguna página: el logo servido es
`img/logo-lgv.webp` (12 KB). El PNG se conserva a propósito como original en alta resolución.
No borrarlos sin preguntar; si se quiere limpieza, moverlos fuera del control de versiones.

## Conocidos y no corregidos

- Las tres páginas legales dicen `Última actualización: [FECHA]` — placeholder sin rellenar.
- `index.html:466` conserva un comentario que dice «Reemplaza TU_ACCESS_KEY_AQUI» cuando la clave ya
  está puesta. El banner de `styles.css:55-56` («Fuentes: Apple System Fonts (SF Pro)») describe la
  versión anterior: los títulos usan Playfair Display autohospedado, y el cuerpo/UI una pila de fuente
  del sistema con Inter como fallback (en macOS/iOS gana el sistema; en Windows y Android pinta Inter).
- `styles.css` define `.logo__image` dos veces (≈306 y ≈1908). Gana la segunda. Detalle en `AGENTS.md`.
- El comentario de `robots.txt:7` menciona un `icons.css` que no existe (el CSS es `styles.css`), y el
  `Disallow: /*.json$` no afecta a nada porque el repo no tiene `.json`. Inofensivos, pero son texto viejo.
- Hay ~9 KB de CSS sin minificar y reglas que no usa ninguna página.

## Titulares

Diseño y desarrollo: [ServitecBAQ](https://servitecbaq.com) (crédito en el footer).
