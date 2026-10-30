# Notas para quien mantenga este sitio (IA o persona)

Lee esto antes de tocar nada. `README.md` describe el sitio; aquí van las trampas que no se ven
leyendo el código y las decisiones del dueño que **no se deben reproponer**.

## Reglas del dueño (decididas; no reabrir el debate)

- **El copy y las animaciones se conservan tal cual.** En la optimización de rendimiento (oct-2026) su
  instrucción fue «conservar todo, solo optimizar recursos». No reescribir textos, no acortar secciones,
  no quitar el carrusel de las tarjetas ni las animaciones `opacity:0 → visible`.
- **No nombrar proveedores ni tecnologías en las páginas legales.** Preguntado por añadir Microsoft
  Clarity a la política de privacidad, respondió que los derechos reservados ya cubren ese detalle y
  que no quiere revelar el stack. La protección se hace con atributos técnicos (`data-clarity-mask`),
  no con disclosure.
- **`logo-lgv.png` / `logo-lgv.svg` no se borran.** Suenan a basura (1,13 MB sin referenciar) pero son
  su original en alta resolución. Si hace falta limpieza, proponer moverlos fuera del repo, no eliminarlos.
- **Commit y push los hace él**, salvo que en ese turno pida expresamente que los hagas tú.
- Los demás sitios suyo (p. ej. servitecbaq.com) son repos independientes: nopropagues cambios en cadena.

## Trampas del código

1. **`.logo__image` está definido dos veces** en `styles.css` (≈línea 306 y ≈1908). Gana la segunda,
   que le pone caja blanca, `height: 100px` y `padding`. Cambiar la altura en la de 306 no se ve.
   Para el logo, editar el bloque «LOGO SVG CON FONDO BLANCO» (≈1908-1980).
2. **El contenido con reveal depende de JavaScript.** `.section__header`, `.service-card`,
   `.value-card`, `.about__*`, `.contact__info` y `.contact__form` nacen con `opacity: 0` y solo
   aparecen porque el `IntersectionObserver` de `index.html:656-666` les añade `.visible`. **Si creas
   una clase nueva con `opacity:0`, añade su selector a la lista de `querySelectorAll` (665)**, si no
   ese bloque queda invisible para siempre (también para Googlebot). Con `prefers-reduced-motion` está
   cubierto (`styles.css:1527` fuerza `opacity:1`), así que el fallo solo se manifiesta con JS roto.
3. **El LCP es un `background-image`, no un `<img>`.** Son `img/hero-m.webp` (≤900px) y `img/hero-d.webp`
   (≥901px). Hay que mantener sincronizadas tres piezas: los dos `preload as="image"` del `<head>`
   (23-24), la regla base `.hero{background:...}` y el `@media (min-width: 901px)` de `styles.css:1982`.
   Romper cualquiera tira Performance de 100 a ~85.
4. **Font Awesome no está por CDN: es un subconjunto propio.** `styles.css:15-51` declara las familias
   `LGV Icons Solid` / `LGV Icons Brands`, mapea `.fas`/`.fab` y define el `content:` de ~30 glifos.
   Poner `<i class="fas fa-icono-nuevo">` sin completar el procedimiento de abajo sale como un hueco.
5. **Las cuatro páginas copian el `<head>` a mano.** No hay includes ni plantillas: el título, los OG,
   el snippet de Clarity o el favicon hay que replicarlos en `index.html`, `politica-privacidad.html`,
   `aviso-legal.html` y `terminos-condiciones.html`.
6. **Los datos de contacto están en 4 sitios**: JSON-LD del `<head>`, bloque de contacto, lista del
   footer y el mensaje de error de `js/form.js`. Haz grep del teléfono o del correo antes de dar por
   bueno un cambio en uno solo.
7. **No volver a externalizar nada.** Reintroducir `fonts.googleapis.com`, `use.fontawesome.com` o
   `images.unsplash.com` vuelve a meter CSS bloqueante y peticiones de terceros; eso fue exactamente lo
   que se quitó (253 KB de iconos y 22 imágenes externas).
8. **No bloquear `/js/`, ni `/webfonts/`, ni `styles.css` en `robots.txt`.** Estaban bloqueados en el
   `robot.txt` original (archivo mal nombrado, ya corregido) y Googlebot necesita CSS y fuentes para
   renderizar.
9. **El sitemap no lista anclas.** `#nosotros`, `#servicios` y `#contacto` se quitaron: son la misma URL
   y no son entradas indexables por separado. No reañadirlas.
10. **`data-clarity-mask="true"` es obligatorio en cualquier campo nuevo** del formulario (u otro
    formulario futuro) que pueda llevar datos personales. Sin él, Clarity graba lo que se teclea.
11. **`inter-latin.woff2` (48 KB) no se usa en todos los equipos.** Los tokens de fuente son
    `--font-heading: 'Playfair Display', …` (siempre Playfair) pero
    `--font-body` / `--font-ui` ponen delante `-apple-system, BlinkMacSystemFont, 'SF Pro …',
    'Helvetica Neue'` y `Inter` al final: en macOS/iOS gana la fuente del sistema e Inter se descarga
    sin llegar a pintarse; en Windows y Android sí se usa. Así quedó publicado tras la optimización y
    no es un bug que se corrija solo: mover `Inter` al principio de la pila cambiaría la tipografía del
    sitio en todos los Apple. Si se quiere ahorrar esos 48 KB, la discusión es preload condicional
    versus aceptar el render distinto por plataforma, y va con David.

## Procedimientos

### Añadir un icono

1. Busca su codepoint en la documentación de Font Awesome 6.4.0 y decide si es `fa-solid` o `fa-brands`
   (cada uno carga un `.woff2` distinto).
2. Añade la regla en `styles.css:20-49` con su codepoint real, p. ej.
   `.fa-users::before{content:"\f0c0"}` (mira los ya mapeados para el formato).
3. Regenera el subconjunto para incluir el codepoint nuevo. **Si el glifo no está en el `.woff2`, la
   regla CSS no lo hace aparecer.** En la máquina de David no hay ImageMagick ni sharp; se hizo así:
   `npm i subset-font`, y sobre el `fa-solid-900.woff2` original de Font Awesome pasar los codepoints
   ya usados más el nuevo. Recortar Google Fonts se hace igual (`latin` para Inter y Playfair).
4. Verifica en un navegador que el icono se ve, y que `webfonts/*.woff2` no se infló (los actuales:
   solid 3,1 KB, brands 1,1 KB).

### Añadir o sustituir una imagen

- WebP, con `width`/`height` reales en el `<img>` (son los que garantizan `CLS 0`), `loading="lazy"` y
  `decoding="async"` en todo lo que no sea el pliegue.
- Peso objetivo: fotos de tarjeta ≤ 45 KB, imágenes de pliegue ≤ 60 KB.
- `img/servicios/*.webp` conservan el nombre original de Unsplash (números de 13 dígitos). Es feo pero
  trazable: no renombrar sin actualizar los `<img>`.
- Si la imagen es la nueva portada para compartir, actualiza `img/og-lgv.jpg` (1200×630) y, si cambió el
  recuadre, `og:image:alt`.

### Añadir una página

Copia el `<head>` completo de `politica-privacidad.html`, ajusta `canonical` + `og:url` + `og:title` +
`og:description` + `og:type` (`website` para la home, `article` para el resto), deja los 3 preloads de
fuentes y el snippet de Clarity, y añade la URL a `sitemap.xml`. Las legales usan
`<body class="legal-page">` con `.legal-content` / `.legal-header` / `.legal-body` (CSS en
`styles.css:1704+`).

### Medir antes de tocar y después

```bash
npx lighthouse https://lgvlegalconsultores.com/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile --output=html --output-path=./lh.html
```

- La **API de PageSpeed sin clave responde 429** (cuota 0). Se mide con Lighthouse local.
- `--preset=performance` no existe; las opciones son `perf`, `experimental`, `desktop`.
- **Calienta la caché antes de fiarte del número**: GitHub Pages libre sirve `max-age=600`, así que cada
  10 minutos el borde está frío y da ~85 con LCP 3,9 s pidiendo los mismos archivos. Pide la URL un par
  de veces, comprueba `X-Cache: HIT` en los assets, y vuelve a medir. Los valores de referencia reales:
  **P100 / A100 / BP77 / SEO100, LCP 1,77 s, FCP 1,01 s, 451 KB, 27 peticiones.**
- El **BP77 es normal**: viene de la cookie de terceros que Clarity sincroniza con `c.bing.com`. No es
  una regresión y no se arregla tocando el sitio (salir de Clarity sí lo subiría).

## Checklist de entrega

- [ ] Lighthouse: Performance ≥ 95 sin calentar / 100 en caliente, Accessibilidad 100, SEO 100.
- [ ] `git diff --stat`: ningún archivo nuevo que no vaya a servirse (scripts auxiliares van en `Temp`,
      no en el repo).
- [ ] Ninguna clave, token o dato personal nuevo en el repo. La `access_key` de Web3Forms es pública por
      diseño; aun así, no duplicarla en docs.
- [ ] Si tocaste el `<head>`: replicado en las 4 páginas y coherente el `canonical`.
- [ ] Si añadiste un campo: lleva `data-clarity-mask="true"`.
- [ ] Si añadiste una sección con reveal: su selector está en el `querySelectorAll` de `index.html:665`.
- [ ] Enlaces internos siguen apuntando a secciones que existen (`grep -o 'href="#[^"]*"' index.html`).
