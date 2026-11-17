# Estrategia GEO / AI SEO — ClicId.com.ec

**Proyecto:** sitio estático de Clic ID (distribuidor de firmas electrónicas certificadas ANF AC en Ecuador).
**Objetivo:** que ChatGPT, Perplexity, Google AI Overviews / AI Mode, Copilot y Claude entiendan, citen y recomienden el sitio ante consultas como «dónde compro firma electrónica en Ecuador», «cuánto cuesta la firma electrónica ANF AC» o «qué firma electrónica sirve para el SRI».
**Investigación:** 2026-11-16. **Estado del repo auditado:** 2026-11-16, 22:20 (hora de Ecuador).
**Alcance:** investigación, auditoría, decisiones y checklist. Los entregables están en la sección 12.

> **Aviso de concurrencia:** durante esta auditoría el sitio fue rediseñado en paralelo (styles.css v5, precios en HTML del servidor, JSON-LD ampliado, sección `#respuesta-rapida`, tabla `.rate`). Este documento refleja el estado observado a las 22:20 del 16/11/2026. Si el rediseño continúa, verificar de nuevo antes de aplicar el checklist.

---

## 1. Resumen ejecutivo

La investigación 2025–2026 coincide en un punto: **los buscadores generativos no citan archivos declarativos, citan páginas**. Los factores que mueven la aguja, en orden:

1. **Acceso de los rastreadores de IA al HTML real** (robots.txt, WAF/CDN y, sobre todo, que el contenido esté en el HTML y no inyectado por JavaScript).
2. **Contenido en formato citable**: respuesta directa al inicio, tablas comparativas, cifras con fuente, definiciones de entidades, preguntas y respuestas literales.
3. **Datos estructurados honestos** que confirmen entidad, servicio, ofertas y FAQ.
4. **Señales de entidad consistentes** (nombre, teléfono, correo, horario, `sameAs`) para que el modelo sepa a quién está recomendando.
5. **Archivos para agentes** (`llms.txt`, `llms-full.txt`, `ai.txt`): higiene de bajo costo y utilidad real para agentes de navegación, **pero no son un factor de ranking ni garantizan citación**.

**Buena noticia:** el rediseño ya resolvió el problema estructural más grave del sitio anterior (los precios solo existían en JavaScript). Hoy hay 16 tarjetas de plan y una tabla `.rate` de 16 filas en el HTML del servidor, una respuesta answer-first en `#respuesta-rapida` y un JSON-LD con Organization, Service, HowTo, FAQPage y BreadcrumbList.

**Lo que falta es lo que este documento prioriza:** corregir el dominio canónico de staging, arreglar assets y enlaces roticos (og-image, política de privacidad), completar el marcado (16 ofertas con IVA, 15 FAQ, `sameAs`), abrir explícitamente los rastreadores de IA en `robots.txt` y publicar los tres archivos para agentes.

---

## 2. Auditoría del sitio (estado al 16/11/2026 22:20)

### 2.1 Ya resuelto por el rediseño

| Elemento | Estado |
|---|---|
| Precios en el HTML del servidor | ✅ 16 tarjetas `.plan` + tabla `.rate` de 16 filas (antes solo en `app.js`) |
| Respuesta answer-first | ✅ sección `#respuesta-rapida` con `.qa__answer` de 63 palabras |
| Tabla comparativa citable | ✅ `.rate` con Perfil, Vigencia, Precio final, Precio normal, Costo por año, Ahorro |
| JSON-LD | ✅ @graph con Organization/ProfessionalService, WebSite, WebPage, Service, HowTo, FAQPage, BreadcrumbList; **sin `aggregateRating`** |
| FAQ accesible sin JS | ✅ `<details>/<summary>` nativos |
| `speakable` | ✅ `.hero__sub`, `.qa__answer` |
| Hreflang, geo.region, robots meta | ✅ presentes |

### 2.2 Hallazgos abiertos (ordenados por impacto)

| # | Hallazgo | Impacto | Acción |
|---|---|---|---|
| 1 | **Canonical, hreflang, `og:url`, `twitter:url` y todos los `@id` del JSON-LD apuntan a `https://clicid-ec.157.180.30.98.sslip.io/`** (host de staging de Dokploy) | **Crítico**: consolida autoridad en un dominio que no es la marca; Google puede indexar el host de staging | Sustituir por `https://clicid.com.ec/` antes de publicar (bloque 1 de `docs/geo-head-block.html`) |
| 2 | **`/assets/og-image.png` no existe** y se referencia en `og:image`, `twitter:image` y `image` del JSON-LD | **Alto**: tarjetas sociales rotas, imagen de entidad inválida | Crear `assets/og-image.png` 1200×630 o apuntar a un asset existente |
| 3 | **`politica-de-privacidad.html` fue eliminado del worktree** pero sigue enlazado en el pie y en `sitemap.xml` | **Alto**: 404 en un enlace de confianza y en el sitemap; señal negativa de calidad | Restaurar o recrear la página; si cambia de URL, actualizar enlaces + sitemap + `llms.txt` |
| 4 | **`robots.txt` no menciona ningún rastreador de IA** | **Alto**: no impide nada (el `*` ya permite), pero no documenta intención ni protege ante cambios futuros | Añadir bloque de directivas (sección 7) |
| 5 | **JSON-LD: `Service.offers.offerCount` = "15"** cuando hay 16 planes; el `OfferCatalog` de Organization solo lista 7 ofertas y sin `valueAddedTaxIncluded` | **Medio-alto**: datos estructurados incompletos/incoherentes con la página | Sustituir por el @graph de `docs/geo-head-block.html` (16 ofertas con IVA) |
| 6 | **FAQPage declara 6 preguntas**; la página visible tiene 7 y, tras integrar el FAQ extendido, tendrá 15 | **Medio**: marcado incompleto y desincronizado | Integrar bloque E y publicar el FAQPage de 15 |
| 7 | **Sin `sameAs`, sin `contactPoint`, sin `knowsAbout`, sin `brand`** en Organization | **Medio**: entidad débil para desambiguación | Añadido en `docs/geo-head-block.html`; los perfiles reales los aporta el cliente |
| 8 | **Sin enlaces `rel="describedby"` / `rel="alternate"`** al `llms.txt` ni `llms-full.txt` | **Medio**: los agentes no descubren los archivos | Añadir 2 líneas al `<head>` |
| 9 | **`llms.txt`, `llms-full.txt` y `ai.txt` ya creados pero aún sin publicar** (y sin copia en `/.well-known/ai.txt`) | **Medio** | Publicar y verificar `Content-Type: text/plain; charset=utf-8` |
| 10 | `sitemap.xml` con `lastmod` 2026-11-08 | Bajo | Actualizar a la fecha de publicación |
| 11 | Porcentaje «−35%» idéntico en las 16 filas de la tabla `.rate` | Bajo | Calcular por fila o dejar solo el ahorro en USD (que sí es exacto) |
| 12 | Testimonios sin fecha ni verificación | Medio | No usarlos en marcado; no convertirlos en `aggregateRating` |

---

## 3. Investigación: estado del arte 2025–2026

### 3.1 La verdad incómoda sobre `llms.txt`

`llms.txt` es una propuesta de Jeremy Howard (AnswerDotAI), publicada en septiembre de 2024 y actualizada a **v2 en agosto de 2026**: un Markdown en `/llms.txt` con `H1`, blockquote de resumen, secciones libres y listas de enlaces `[nombre](url)`, idealmente a versiones `.md` de las páginas, declaradas con `rel="alternate" type="text/markdown"` y un `rel="describedby"` hacia el `llms.txt` ([llmstxt.org](https://llmstxt.org/)).

Los datos de adopción real son contundentes:

- **Ahrefs**: de 137.210 dominios analizados, el **97 % de los `llms.txt` no recibió ni una petición** en mayo de 2026 ([ahrefs.com/blog/llmstxt-study](https://ahrefs.com/blog/llmstxt-study/)).
- **Otterly**: 84 peticiones a `llms.txt` sobre 62.100 visitas de bots de IA en 90 días (~0,1 %) ([otterly.ai](https://otterly.ai/blog/the-llms-txt-experiment/)).
- **Limy**: 408 peticiones directas a `llms.txt` en más de 500 millones de visitas de bots de IA ([limy.ai](https://limy.ai/blog/llms-txt-in-2026-the-full-guide)).
- **SE Ranking** (~300.000 dominios): sin relación entre tener el archivo y ser citado ([searchenginejournal.com](https://www.searchenginejournal.com/llms-txt-shows-no-clear-effect-on-ai-citations-based-on-300k-domains/561542/)).
- **Google**: Gary Illyes dijo en julio de 2025 que no lo soporta; la guía oficial de optimización para IA (mayo 2026) lo lista entre las tácticas que **no** se necesitan para AI Overviews / AI Mode, y en junio de 2026 Google añadió que no hacen falta archivos legibles por máquina ni Markdown para aparecer en Search ([guía de optimización para IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).
- **Matiz:** Chrome Lighthouse tiene una auditoría experimental de *agentic browsing* que **sí comprueba `llms.txt`** ([developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt](https://developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt)). Google Search lo ignora; los agentes de navegador pueden buscarlo.

Síntesis independiente: [Optimizely Field Notes, «Does llms.txt work?» (oct. 2026)](https://www.optimizely.com/field-notes/articles/does-llms-txt-work).

**Decisión:** publicar `llms.txt` y `llms-full.txt` (costo casi nulo, útil para agentes de navegación y de código, listo si se adopta), **sin presentarlo como la palanca principal**. La palanca principal es el HTML citable, que el rediseño ya mejoró.

### 3.2 Rastreadores de IA: quién es quién

Cada proveedor separa **entrenamiento**, **búsqueda** y **acciones de usuario**. Permitir la búsqueda es lo que genera citación.

| Proveedor | User-agent | Para qué sirve | Efecto de bloquearlo |
|---|---|---|---|
| OpenAI | `GPTBot` | Entrenamiento de modelos fundacionales | Excluye el contenido del entrenamiento |
| OpenAI | `OAI-SearchBot` | **Aparecer en ChatGPT Search** | El sitio deja de mostrarse en respuestas de búsqueda de ChatGPT |
| OpenAI | `ChatGPT-User` | Acciones iniciadas por el usuario | Se impide la visita bajo demanda |
| OpenAI | `OAI-AdsBot` | Validación de anuncios en ChatGPT | Solo visita páginas enviadas como anuncio |
| Anthropic | `ClaudeBot` | Entrenamiento | Excluye del entrenamiento |
| Anthropic | `Claude-SearchBot` | **Indexación para búsqueda de Claude** | Reduce visibilidad en resultados de Claude |
| Anthropic | `Claude-User` | Recuperación a pedido del usuario | Reduce visibilidad en búsquedas dirigidas |
| Perplexity | `PerplexityBot`, `Perplexity-User` | Indexación y recuperación | Menor probabilidad de ser citado |
| Google | `Googlebot` | Rastreo e indexación | Sin indexación no hay AI Overviews ni AI Mode |
| Google | `Google-Extended` | **No es un rastreador**: token de robots.txt que controla el uso del contenido para entrenamiento de Gemini y fundamentación generativa | No impide aparecer en AI Overviews |
| Apple / Bing | `Applebot`, `Applebot-Extended`, `Bingbot` | Búsqueda de Apple, funciones de IA de Apple y Bing/Copilot | Menor presencia en Siri/Spotlight y Copilot |

Fuentes primarias: [OpenAI Crawlers](https://developers.openai.com/api/docs/bots) (IPs publicadas: [searchbot.json](https://openai.com/searchbot.json), [gptbot.json](https://openai.com/gptbot.json), [chatgpt-user.json](https://openai.com/chatgpt-user.json)); [Anthropic — crawling y bloqueo](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) (IPs: [claude.com/crawling/bots.json](https://claude.com/crawling/bots.json); desde el 30/10/2026 reconoce la señal de preferencia de entrenamiento del grupo AIPREF del IETF); [Perplexity Crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers); [lista de rastreadores de Google](https://developers.google.com/crawling/docs/crawlers-fetchers/overview-google-crawlers).

### 3.3 `ai.txt`: qué es y qué no es

No hay estándar aprobado. Tres esfuerzos relevantes:

1. **Borrador IETF `draft-car-ai-txt-wellknown-00`** (junio 2026, Kayla Cardillo): propone `/.well-known/ai.txt` y `/.well-known/ai.json` con pares clave-valor (`Spec-Version`, `Site-Name`, `Training`, `Scraping`, `Indexing`, `Caching`, `Attribution`, bloques por agente con `Rate-Limit`). Complementa robots.txt, que solo bloquea rastreo y no matiza «puedes rastrear pero no entrenar» ([datatracker.ietf.org/doc/draft-car-ai-txt-wellknown](https://datatracker.ietf.org/doc/draft-car-ai-txt-wellknown/), [github.com/kaylacar/ai-txt](https://github.com/kaylacar/ai-txt)).
2. **`ai.txt` de Spawning (2023)**: uso original del nombre, orientado a opt-out de minería de textos y datos.
3. **Cloudflare Content Signals Policy** (2025): extensión de robots.txt con señales `search`, `ai-input`, `ai-train`, desplegada en millones de dominios ([contentsignals.org](https://contentsignals.org/), [blog.cloudflare.com/content-signals-policy](https://blog.cloudflare.com/content-signals-policy/)). El grupo **AIPREF** del IETF trabaja en el vocabulario formal ([vocab](https://datatracker.ietf.org/doc/draft-ietf-aipref-vocab/), [attach](https://datatracker.ietf.org/doc/draft-ietf-aipref-attach/)).

**Decisión:** publicar `/ai.txt` con el formato del borrador y una copia en `/.well-known/ai.txt`, declarando uso **permitido** para indexación, recuperación, caché y entrenamiento, con **atribución requerida**. Para un negocio pequeño que quiere ser recomendado, restringir el entrenamiento es contraproducente: reduce la probabilidad de que el modelo recuerde la marca.

### 3.4 Qué sí funciona: GEO como optimización de contenido

Referencia académica: **GEO: Generative Engine Optimization** (Aggarwal et al., KDD 2024): mejoras de visibilidad de **hasta 40 %** con técnicas de contenido, con eficacia variable por dominio ([arxiv.org/abs/2311.09735](https://arxiv.org/abs/2311.09735)). Tácticas con respaldo:

- **Answer-first**: respuesta directa en 40–60 palabras y desarrollo después.
- **Chunking semántico**: un H2/H3 por pregunta, párrafos de 2–4 frases, listas y tablas; cada bloque debe responder por sí solo.
- **Tablas comparativas**: el formato más citado para precios y planes ([neilpatel.com — frecuencia de citación por tipo de contenido](https://neilpatel.com/marketing-stats/ai-citation-frequency-by-content-type/), [blog.searchless.ai — datos de citación 2026](https://blog.searchless.ai/posts/what-content-gets-cited-by-ai-llm-citation-data-2026/)).
- **Estadísticas con fuente**: los datos numéricos atribuidos se citan; los no atribuidos se descartan.
- **Definiciones de entidad**: glosario explícito de SRI, Quipux, SATJE, SERCOP, SENAE, ANF AC, .p12.
- **Preguntas conversacionales literales**, no lenguaje de folleto.
- **Consistencia NAP + `sameAs`**: mismo nombre, teléfono, correo y horario en todo el sitio y perfiles externos.

Referencias de Google: [guía de optimización para IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [funciones de IA y tu sitio](https://developers.google.com/search/docs/appearance/ai-features), [nuevo recurso de mayo 2026](https://developers.google.com/search/blog/2026/05/a-new-resource-for-optimizing).

### 3.5 Schema.org útil para citación (y su límite)

Los datos estructurados **no son un factor de ranking**; desambiguan entidades y confirman hechos. Tipos con retorno para este caso: `Organization`/`ProfessionalService`, `Service`, `OfferCatalog` + `Offer` (con `valueAddedTaxIncluded: true`), `FAQPage`, `HowTo`, `BreadcrumbList`, `WebSite`, `WebPage` y `speakable` ([schema.org/speakable](https://schema.org/speakable)). Guías: [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization), [Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), [Speakable](https://developers.google.com/search/docs/appearance/structured-data/speakable), [políticas de datos estructurados](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

**Sobre `SearchAction`:** el sitio no tiene buscador interno y Google retiró el *sitelinks search box* en octubre de 2024 ([blog 2024/10/sitelinks-search-box](https://developers.google.com/search/blog/2024/10/sitelinks-search-box)). Declarar un endpoint inexistente sería un dato falso: se omite y queda el fragmento comentado en `docs/geo-head-block.html`.

### 3.6 Qué NO hacer

- **Cloaking** (contenido distinto para bots y personas): prohibido por las [políticas de spam de Google](https://developers.google.com/search/docs/essentials/spam-policies).
- **Datos estructurados falsos**: `aggregateRating`/`review` sin reseñas visibles y reales ([Search Engine Land](https://searchengineland.com/google-says-dont-include-fake-or-undisclosed-incentivized-reviews-in-review-snippet-structured-data-483456), [guía de review snippet](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)).
- **Spam de keywords** y meta `keywords` (ignorado por Google desde hace más de una década).
- **Superlativos no verificables** («el más barato del Ecuador», «miles de clientes») sin fuente.
- **Contenido duplicado en masa** por ciudad o institución (puertas de entrada de baja calidad).
- **Archivos para agentes desactualizados**: un `llms.txt` con precios viejos es peor que no tenerlo.
- **Bloquear a los buscadores de IA** cuando el objetivo es ser recomendado.

### 3.7 Herramientas y validadores

| Herramienta | Uso | URL |
|---|---|---|
| Rich Results Test | Validar rich results del JSON-LD | https://search.google.com/test/rich-results |
| Schema Markup Validator | Validación estricta de schema.org | https://validator.schema.org/ |
| Search Console | Indexación y, desde junio 2026, informes de rendimiento en búsqueda generativa | https://search.google.com/search-console · [blog 2026/06](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) |
| Lighthouse (agentic browsing) | Auditoría experimental, incluido `llms.txt` | https://developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt |
| Validador de `llms.txt` | Verificar estructura | https://apify.com/aicrawlready/llms-txt-validator-generator |
| Directorio `llmstxt.site` | Ejemplos comparados | https://llmstxt.site/ |
| IndexNow | Notificar cambios a Bing/Yandex | https://www.indexnow.org/documentation |
| Bing Webmaster Tools | Indexación en Bing/Copilot | https://www.bing.com/webmasters |
| Verificación de IPs de bots | Confirmar bots reales | https://openai.com/searchbot.json · https://claude.com/crawling/bots.json |

---

## 4. Decisiones tomadas

| Decisión | Motivo |
|---|---|
| Publicar `llms.txt` + `llms-full.txt` **y** priorizar el HTML citable | La evidencia dice que los bots casi no leen el archivo, pero el costo es nulo y ayuda a agentes de navegación |
| `llms-full.txt` con las 16 tarifas y las respuestas completas | Fuente única de verdad y cobertura para agentes que no renderizan la página |
| `ai.txt` con `Training: allow` y `Attribution: required` | Restringir entrenamiento reduce la familiaridad del modelo con la marca |
| Mantener el @graph con `Service` + `OfferCatalog` (16 ofertas con IVA) en lugar de `Product` | El producto es un servicio con tarifario; `OfferCatalog` publica precios exactos |
| **Sin `aggregateRating`** | No hay reseñas visibles ni fuente verificable |
| **Sin `SearchAction`** | No existe buscador interno y el sitelinks search box está retirado |
| FAQPage con 15 preguntas (7 visibles + 8 nuevas conversacionales) | Cubre las formas reales de preguntar a un asistente |
| No publicar cifras de clientes, certificaciones ISO, dirección ni reseñas | No existen en el repo; inventarlas destruiría la credibilidad de la fuente |
| **Ninguna clase CSS nueva** para los bloques C, D y E | El rediseño v5 ya trae `.benefits/.benefit`, `.qa__facts/.qa__fact` y `.faq__item` |

---

## 5. Checklist priorizado

### P0 — Antes de publicar en producción

- [ ] **Sustituir el dominio de staging por `https://clicid.com.ec/`** en canonical, ambos hreflang, `og:url` y todos los `@id`/`url` del JSON-LD.
- [ ] **Crear `assets/og-image.png`** (1200×630) o corregir `og:image`, `og:image:width/height`, `twitter:image` e `image` del JSON-LD.
- [ ] **Restaurar `politica-de-privacidad.html`** (hoy eliminado, con enlaces vivos en el pie y en `sitemap.xml`).
- [ ] **Integrar los bloques C, D y E** de `docs/geo-content-blocks.html`.
- [ ] **Sustituir el JSON-LD** actual por el de `docs/geo-head-block.html` (un solo bloque en el documento).
- [ ] **Añadir a `robots.txt`** el bloque de directivas de IA (sección 7).
- [ ] **Publicar** `llms.txt`, `llms-full.txt`, `ai.txt` y la copia `.well-known/ai.txt` como `text/plain; charset=utf-8`.
- [ ] **Añadir al `<head>`** `rel="describedby"` → `llms.txt` y `rel="alternate" type="text/plain"` → `llms-full.txt`.
- [ ] **Actualizar `sitemap.xml`** (`lastmod`) y verificar que las 2 URLs responden 200.

### P1 — Primera semana

- [ ] Enviar sitemap a Search Console y a Bing Webmaster; activar IndexNow.
- [ ] Auditar con Lighthouse (agentic browsing) y con Rich Results Test.
- [ ] Corregir el «−35%» fijo de la tabla `.rate` (calcular por fila o retirar la columna).
- [ ] Crear perfiles reales (Google Business Profile, Facebook, Instagram, LinkedIn) y añadirlos a `sameAs`.
- [ ] Publicar dirección física real (si existe) y añadir `address` al nodo Organization.
- [ ] Revisar en los logs del hosting que `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `GPTBot` y `Googlebot` entran sin bloqueo.

### P2 — Madurez

- [ ] Páginas propias por intención (SRI, Quipux/SATJE, SERCOP, SENAE, persona natural con RUC, precio por año) con contenido único y su propio `Service`/`FAQPage`.
- [ ] Versiones `.md` de las páginas (`index.html.md`) si se quiere seguir `llms.txt` v2 al pie de la letra.
- [ ] Revisión trimestral de precios en los tres lugares (`index.html`, tabla `.rate`, `llms-full.txt`): deben coincidir siempre.
- [ ] Monitorización mensual de citación (sección 9).

---

## 6. Orden exacto de integración

1. Corregir dominio y assets en el `<head>` (sección 1 de `docs/geo-head-block.html`).
2. Insertar bloque C (datos verificables) entre `#beneficios` y `#testimonios`.
3. Insertar bloque D (glosario) después de C.
4. Insertar bloque E (8 FAQ) al final de `<div class="faq">` de `#faq`.
5. Sustituir el JSON-LD actual por el de `docs/geo-head-block.html`.
6. Publicar `llms.txt`, `llms-full.txt`, `ai.txt` y `/.well-known/ai.txt`.
7. Añadir las directivas de IA a `robots.txt`.
8. Actualizar `sitemap.xml`.
9. Validar (sección 10) y comprobar con `curl` que los precios están en el HTML crudo.

---

## 7. Bloque de directivas para `robots.txt` (copiar tal cual)

```txt
# =====================================================================
# Buscadores generativos y agentes de IA — PERMITIDOS
# Objetivo: aparecer y ser citado en ChatGPT, Perplexity, Google AI
# Overviews / AI Mode, Copilot y Claude. No bloquear ninguno de estos.
# =====================================================================

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-AdsBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: CCBot
Allow: /

# Recursos para agentes de IA (servir como text/plain; charset=utf-8)
# /llms.txt
# /llms-full.txt
# /ai.txt
# /.well-known/ai.txt
```

> `User-agent: * / Allow: /` ya permite todo: este bloque documenta la intención y protege ante cambios futuros. **No** convertir ningún `Allow:` en `Disallow:`. Si en el futuro se quiere restringir el entrenamiento, hacerlo a nivel de ruta y **nunca** bloqueando `OAI-SearchBot` ni `Claude-SearchBot` (eso eliminaría la citación).

**Sobre `sitemap.xml`:** no añadir `llms.txt` al sitemap (no es una página indexable); solo actualizar `lastmod`.

---

## 8. CSS

**No se necesita CSS nuevo.** Los bloques C, D y E reutilizan clases existentes del rediseño v5:

- C: `section`, `wrap`, `section-head`, `eyebrow`, `eyebrow--brand`, `h2`, `benefits`, `benefit`, `link-arrow`.
- D: `section`, `section--paper2`, `wrap`, `section-head`, `h2`, `qa__facts`, `qa__fact` (con `<dl>/<dt>/<dd>`).
- E: `faq__item`, `faq__a` (`<details>/<summary>` nativos, sin JavaScript).

Si el glosario (D) se ve demasiado largo en una sola columna, la mejora es una regla de dos columnas sobre `.qa__facts` dentro de `#glosario`; queda a criterio del diseño, no es necesario para GEO.

---

## 9. Plan de medición

**Mensual, manual, con captura y fecha** en ChatGPT (con búsqueda), Perplexity, Copilot, Claude (con búsqueda) y Google AI Mode:

1. «¿Dónde compro una firma electrónica certificada en Ecuador?»
2. «¿Cuánto cuesta la firma electrónica ANF AC en Ecuador?»
3. «¿Qué firma electrónica sirve para el SRI?»
4. «¿Cuál es la firma electrónica más barata de Ecuador?»
5. «¿Qué necesito para sacar la firma electrónica con RUC?»
6. «¿La firma electrónica de Clic ID sirve para SERCOP y el SRI?»

Registrar: mención de marca, citación con enlace, posición, y exactitud de precios y plazos. Complementar con Search Console (consultas con marca, informe de búsqueda generativa desde junio 2026) y con los logs del hosting.

**KPIs de referencia:** citación con enlace en ≥ 2 de 5 motores para las 6 consultas núcleo en un trimestre; 100 % de exactitud en precios citados; alguna petición mensual a los tres archivos de agentes.

---

## 10. Validación técnica

```bash
# 1. JSON-LD válido
node -e "const fs=require('fs');const h=fs.readFileSync('docs/geo-head-block.html','utf8');const m=h.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/);JSON.parse(m[1]);console.log('JSON-LD OK')"

# 2. Precios presentes en el HTML crudo (no inyectados por JS)
curl -s https://clicid.com.ec/ | grep -c '18.20'   # > 0
curl -s https://clicid.com.ec/ | grep -c '63.12'   # > 0

# 3. Archivos de agentes servidos como texto plano
for f in llms.txt llms-full.txt ai.txt .well-known/ai.txt; do
  printf '%s: ' "$f"; curl -sI "https://clicid.com.ec/$f" | grep -i content-type
done

# 4. robots.txt accesible y sin bloqueos de IA
curl -s https://clicid.com.ec/robots.txt

# 5. La página de privacidad responde 200
curl -sI https://clicid.com.ec/politica-de-privacidad.html | head -1

# 6. og:image existe
curl -sI https://clicid.com.ec/assets/og-image.png | head -1
```

Además: [Rich Results Test](https://search.google.com/test/rich-results), [Schema Markup Validator](https://validator.schema.org/), [Lighthouse agentic browsing](https://developer.chrome.com/docs/lighthouse/agentic-browsing/llms-txt) y [validador de llms.txt](https://apify.com/aicrawlready/llms-txt-validator-generator).

---

## 11. Datos pendientes del cliente (no inventar)

1. **Perfiles sociales reales** (Google Business Profile, Facebook, Instagram, LinkedIn) para `sameAs`.
2. **Dirección física** comercial, para `LocalBusiness.address` y NAP completo.
3. **RUC y razón social** de la empresa.
4. **Reseñas verificables** (Google Business Profile u otro) que justifiquen algún día un `aggregateRating`.
5. **URL del perfil de ANF AC** donde conste Clic ID como distribuidor.

---

## 12. Archivos entregados

| Archivo | Contenido |
|---|---|
| `llms.txt` | Índice para agentes (formato llmstxt.org v2) |
| `llms-full.txt` | Contenido factual completo: 16 tarifas, requisitos, proceso, compatibilidad, FAQ completas, fuentes y límites |
| `ai.txt` | Política de uso por agentes de IA según el borrador IETF `draft-car-ai-txt-wellknown` |
| `docs/GEO-STRATEGY.md` | Este documento |
| `docs/geo-head-block.html` | Correcciones de `<head>` + JSON-LD `@graph` completo (16 ofertas, 15 FAQ, producción) |
| `docs/geo-content-blocks.html` | Bloques A y B (verificación, ya implementados) + C, D y E listos para insertar |
