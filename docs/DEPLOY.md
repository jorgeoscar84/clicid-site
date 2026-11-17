# DEPLOY — Clic ID (sitio estático) → Dokploy

Documento operativo de despliegue. Escrito y **verificado** el 2026-11-16.
Sitio 100 % estático (HTML/CSS/JS, sin build step); se sirve con nginx dentro de un
contenedor Docker y Dokploy lo publica por Traefik con HTTPS.

---

## 1. Resumen de la ruta de despliegue

```
repo original (samanthachimborazokolganov-gif/clic-ID)  [NO se toca / no se pushea]
        │  (copia del working tree, rama main)
        ▼
GitHub público  jorgeoscar84/clicid-site  (rama main)
        │  sourceType: git (custom git, clon público por HTTPS)
        ▼
Dokploy  https://dokploy.nexuss.top   (MCP: `dokploy` — NO usar `maia`)
        │  buildType: dockerfile  →  nginx:1.27-alpine + nginx.conf
        ▼
Traefik + Let's Encrypt  →  https://<dominio>/   (puerto interno 80)
```

| Dato | Valor |
|---|---|
| Repo de despliegue | `jorgeoscar84/clicid-site` (**público**) |
| URL HTTPS clone | `https://github.com/jorgeoscar84/clicid-site.git` |
| Rama | `main` |
| Remote local | `deploy` → `https://github.com/jorgeoscar84/clicid-site.git` |
| Imagen base | `nginx:1.27-alpine` (fijada) |
| Puerto interno del contenedor | **80** |
| Healthcheck | `GET /healthz` → `200` con cuerpo `ok` (cada 30 s) |
| Variables de entorno / secretos | **ninguna** (sitio estático) |
| Volúmenes persistentes | **ninguno** (contenido viene del repo en cada build) |

El `origin` sigue apuntando al repo original y **no se le hace push**. Todo push de
despliegue va a `deploy`.

---

## 2. Repo de despliegue: comandos exactos

Ya está creado y configurado en el workspace:

```powershell
cd C:\Users\BLUR-Agencia\Documents\deepseek-harness\ClicID
git remote -v          # origin = repo original, deploy = jorgeoscar84/clicid-site
```

### Push inicial (ya ejecutado; referencia)

```powershell
git push deploy main
```

### Push de cada cambio de contenido (uso normal)

```powershell
cd C:\Users\BLUR-Agencia\Documents\deepseek-harness\ClicID

# IMPORTANTE: añade solo los archivos del sitio, nunca `git add -A`
# (en el workspace hay scratch/logs sin trackear: serve.log, serve.err.log, _extract.txt…)
git add index.html politica-de-privacidad.html styles.css robots.txt sitemap.xml
git add app.js llms.txt llms-full.txt ai.txt   # si existen tras el cambio
git add assets

git commit -m "content: <resumen del cambio>"
git push deploy main
```

Después del push, en Dokploy: **Deploy** de la aplicación (o `application-deploy`),
o esperar al webhook si se configura auto-deploy (ver §3.7).

### Verificación de que el repo es público y clona sin credenciales

```powershell
gh repo view jorgeoscar84/clicid-site --json name,visibility,url
# {"name":"clicid-site","url":"https://github.com/jorgeoscar84/clicid-site","visibility":"PUBLIC"}

git -c credential.helper= -c core.askPass= ls-remote https://github.com/jorgeoscar84/clicid-site.git
# devuelve refs/heads/main sin pedir usuario/contraseña
```

---

## 3. Parámetros Dokploy (instancia `dokploy`, https://dokploy.nexuss.top)

> Las llamadas MCP de mutación las ejecuta el Lead. Instancia correcta: **`dokploy`**.
> La instancia `maia` es otra y no se usa.

### 3.1 Proyecto / environment

- Buscar existente con `project-all`; si no hay uno adecuado:
  `project-create { name: "Clic ID", description: "Sitio clicid.com.ec" }`.
- Anotar el `environmentId` del environment por defecto (con `project-one`).

### 3.2 Crear la aplicación

```jsonc
// application-create
{
  "name": "clicid-site",
  "appName": "clicid-site",
  "environmentId": "<environmentId del proyecto>",
  "sourceType": "git",            // "git" = Custom Git (clon HTTPS público, sin credenciales)
  "serverId": null,               // desplegar en el propio host Dokploy
  "description": "Sitio estático Clic ID - firmas electrónicas ANF AC Ecuador"
}
```

### 3.3 Fuente Git (Custom Git)

```jsonc
// application-saveGitProvider
{
  "applicationId": "<applicationId>",
  "customGitUrl": "https://github.com/jorgeoscar84/clicid-site.git",
  "customGitBranch": "main",
  "customGitBuildPath": "/",
  "customGitSSHKeyId": null,
  "watchPaths": null,
  "enableSubmodules": false
}
```

### 3.4 Build type

```jsonc
// application-saveBuildType
{
  "applicationId": "<applicationId>",
  "buildType": "dockerfile",
  "dockerfile": "Dockerfile",
  "dockerContextPath": "/",
  "dockerBuildStage": null,        // single-stage
  "publishDirectory": null,
  "isStaticSpa": null,
  "herokuVersion": null,
  "railpackVersion": null
}
```

### 3.5 Puerto interno

El contenedor escucha en **80** (`EXPOSE 80`, `listen 80`). En Dokploy, el puerto
de la aplicación/dominio debe ser **`80`**. No configurar otro puerto.

### 3.6 Dominio (Traefik + Let's Encrypt)

**Opción A — dominio de prueba generado por Dokploy (rápido).**
`domain-generateDomain { "appName": "clicid-site" }` es **solo lectura** y devuelve un
host del formato `<appName>-<sufijo6>-<IP-con-guiones>.sslip.io`. Ejecución real de
verificación:

```json
// domain-generateDomain § respuesta: "clicid-site-a51210-157-180-30-98.sslip.io"
// → PATRÓN: clicid-site-<random6>-157-180-30-98.sslip.io  (IP 157.180.30.98 = host Dokploy)
```

Cada llamada puede devolver un sufijo distinto; usar el host devuelto en la misma
sesión. Luego:

```jsonc
// domain-create
{
  "applicationId": "<applicationId>",
  "host": "clicid-site-xxxxxx-157-180-30-98.sslip.io",
  "port": 80,
  "https": true,
  "certificateType": "letsencrypt",
  "domainType": "application",
  "serviceName": "<appName devuelto por application-create>",
  "path": null,
  "stripPath": false,
  "internalPath": null,
  "customCertResolver": null,
  "customEntrypoint": null,
  "middlewares": null,
  "forwardAuthEnabled": false
}
```

**Opción B — dominio propio `clicid.com.ec` (producción).**
1. DNS: registro **A** `clicid.com.ec` → `157.180.30.98` (y `www` si se quiere).
   Verificar con `nslookup clicid.com.ec` antes de esperar el certificado.
2. `domain-create` con `host: "clicid.com.ec"`, `port: 80`, `https: true`,
   `certificateType: "letsencrypt"`, `domainType: "application"`,
   `serviceName: "<appName>"`.
3. El archivo `CNAME` del repo es un remanente de GitHub Pages: **no se sirve**
   (`.dockerignore` lo excluye) y no afecta a Dokploy.

### 3.7 Deploy y estado

```jsonc
// application-deploy → { applicationId }
// application-one     → deployments[0].status: "running" | "done" | "error"
// deployment-all      → historial
// application-readLogs → logs del contenedor (tail/since) si falla
```

Auto-deploy (opcional): Dokploy usa `application-refreshToken` para el webhook de
Custom Git; sin webhook, cada push requiere pulsar **Deploy** (o `application-deploy`).

---

## 4. Build y prueba local reproducibles

```powershell
cd C:\Users\BLUR-Agencia\Documents\deepseek-harness\ClicID

# 1) Config nginx válida (contenedor sin arrancar)
docker run --rm --entrypoint nginx clicid-site:local -t

# 2) Build
docker build -t clicid-site:local .

# 3) Run en 8099
docker run -d --name clicid-smoke -p 8099:80 clicid-site:local
docker inspect --format '{{.State.Health.Status}}' clicid-smoke    # "healthy"

# 4) Smoke test (ver §5)

# 5) Limpieza
docker stop clicid-smoke; docker rm clicid-smoke
```

### Smoke test local (resultados reales verificados el 2026-11-16)

```powershell
$B = "http://127.0.0.1:8099"
curl.exe -s -o NUL -w "%{http_code}`n" "$B/"                          # 200
curl.exe -s -o NUL -w "%{http_code}`n" "$B/politica-de-privacidad.html" # 200
curl.exe -s -o NUL -w "%{http_code}`n" "$B/healthz"                    # 200
curl.exe -s "$B/healthz"                                               # ok
curl.exe -s -o NUL -w "%{http_code}`n" "$B/no-existe.html"             # 404
curl.exe -s "$B/" | Select-String "Clic ID"                            # coincidencias (>0)
curl.exe -s -D - -o NUL -H "Accept-Encoding: gzip" "$B/" | Select-String "Content-Encoding"
curl.exe -s -D - -o NUL "$B/assets/logo.png" | Select-String "Cache-Control"
```

Evidencia real (contenedor `clicid-smoke`, imagen `clicid-site:local`):

| Request | Resultado observado |
|---|---|
| `GET /` | **200**, `text/html; charset=utf-8`, cuerpo con «Clic ID», `Cache-Control: no-cache` |
| `GET /politica-de-privacidad.html` | **200** |
| `GET /healthz` | **200**, cuerpo `ok`, `Content-Type: text/plain; charset=utf-8`, `Cache-Control: no-store` |
| `GET /no-existe.html` | **404** (con headers de seguridad) |
| `GET /politica-de-privacidad` (sin `.html`) | **200** (fallback `try_files … $uri.html`) |
| `GET /assets/logo.png` | **200**, `image/png`, `Cache-Control: public, max-age=31536000, immutable` |
| `GET /` con `Accept-Encoding: gzip` | `Content-Encoding: gzip`, `Vary: Accept-Encoding` |
| `GET /styles.css` y `/app.js` con gzip | `Content-Encoding: gzip` |
| `GET /robots.txt` | **200**, `text/plain; charset=utf-8`, `Cache-Control: no-cache` (193 B: no se comprime por `gzip_min_length 256`) |
| `GET /sitemap.xml` | **200**, `text/xml; charset=utf-8`, `Cache-Control: no-cache`, gzip |
| `GET /llms.txt`, `/llms-full.txt`, `/ai.txt` | **200**, `text/plain; charset=utf-8`, `Cache-Control: no-cache` |
| `GET /` (HTTP plano) | **sin** `Strict-Transport-Security` (correcto: no HSTS por HTTP) |
| `GET /` con `X-Forwarded-Proto: https` | `Strict-Transport-Security: max-age=31536000; includeSubDomains` |
| `GET /` header `Server` | `nginx` (sin versión, `server_tokens off`) |
| `GET /` headers | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN` |
| `docker inspect` health | `healthy` |
| Imagen | 77.1 MB, raíz web solo con archivos del sitio (sin `.git`, `docs`, `Dockerfile`, `nginx.conf`, `CNAME`) |

---

## 5. Verificación externa esperada (post-deploy en Dokploy)

Sustituir `<dominio>` por el host creado (§3.6).

```powershell
curl.exe -s -o NUL -w "%{http_code}`n" "https://<dominio>/"                        # 200
curl.exe -s "https://<dominio>/" | Select-String "Clic ID"                          # >0
curl.exe -s -o NUL -w "%{http_code}`n" "https://<dominio>/healthz"                 # 200
curl.exe -s "https://<dominio>/healthz"                                             # ok
curl.exe -s -o NUL -w "%{http_code}`n" "https://<dominio>/politica-de-privacidad.html" # 200
curl.exe -s -o NUL -w "%{http_code}`n" "https://<dominio>/no-existe.html"          # 404
curl.exe -s -D - -o NUL "https://<dominio>/assets/logo.png" | Select-String "Cache-Control|Content-Type"
# Cache-Control: public, max-age=31536000, immutable ; Content-Type: image/png
curl.exe -s -D - -o NUL -H "Accept-Encoding: gzip" "https://<dominio>/" | Select-String "Content-Encoding"
# Content-Encoding: gzip
curl.exe -s -D - -o NUL "https://<dominio>/" | Select-String "Strict-Transport-Security"
# max-age=31536000; includeSubDomains  (Traefik envía X-Forwarded-Proto: https)
```

Además: certificado TLS válido emitido por Let's Encrypt (sin aviso del navegador) y
`Server: nginx` sin número de versión. Si `https://` falla justo tras crear el dominio,
esperar la emisión del certificado y revisar DNS/logs de Traefik.

---

## 6. Rollback

### 6.1 Rollback de contenido (recomendado: git es la fuente de verdad)

```powershell
cd C:\Users\BLUR-Agencia\Documents\deepseek-harness\ClicID
git log --oneline -5 deploy/main        # localizar el commit bueno
git revert --no-edit <sha-del-cambio-malo>
git push deploy main
# En Dokploy: Deploy de la aplicación (application-deploy) y verificar §5
```

También válido: `git checkout <sha-bueno> -- .` + commit + push, o crear un tag de
referencia de una versión conocida:

```powershell
git tag -a deploy-YYYYMMDD -m "versión desplegada OK"; git push deploy --tags
```

### 6.2 Rollback rápido desde Dokploy

- `deployment-all { applicationId }` lista los despliegues con su `deploymentId`,
  estado y hora. Identificar el último `done` bueno.
- En la app, activar **Rollback** (`application-update { rollbackActive: true }`) y
  redesplegar: Dokploy vuelve a la imagen del despliegue anterior registrado.
- Si un deploy queda colgado: `application-cancelDeployment` (solo si está realmente
  atascado, no por lentitud).

### 6.3 Rollback local de emergencia

El contenedor es autónomo; sirve como plan B mientras se arregla Dokploy:

```powershell
docker build -t clicid-site:local .
docker run -d --name clicid-site -p 80:80 --restart unless-stopped clicid-site:local
```

### 6.4 Qué NO hacer

- No borrar la aplicación/proyecto para "arreglar" un deploy (`application-delete` /
  `project-remove` requieren confirmación explícita y destruyen historial).
- No tocar el repo original `origin` (samanthachimborazokolganov-gif/clic-ID).
- No commitear secretos (este proyecto no necesita ninguno).

---

## 7. Notas de operación y troubleshooting

| Síntoma | Causa probable / acción |
|---|---|
| 404 en `/` tras deploy | Build type no es `dockerfile` o `dockerfile`/contexto mal (`Dockerfile`, `/`); revisar logs del build. |
| 502 Bad Gateway | Contenedor caído o puerto de dominio ≠ 80; revisar `application-one`, `application-readLogs`. |
| HTTPS no emite certificado | DNS no apunta a `157.180.30.98`; verificar `nslookup` y esperar a Let's Encrypt. |
| `app.js` da 404 | El archivo no está en el repo/rama desplegada; el Dockerfile copia solo lo que existe en la raíz por extensión. |
| Cambios no aparecen | El push no llegó a `deploy`/`main` o no se lanzó Deploy; recordar que el repo de Dokploy es `clicid-site`, no el original. |
| Página sirve HTML viejo | `no-cache` fuerza revalidación, pero verificar que el build clonó el commit correcto. |

Detalles técnicos del contenedor:

- `nginx.conf` reemplaza `/etc/nginx/nginx.conf` completo (sin `conf.d`); logs a
  stdout/stderr; `server_tokens off`; gzip para html/css/js/xml/txt/json/svg.
- `try_files $uri $uri/ $uri.html =404`: URLs limpias, sin rewrite SPA.
- Caché: `/assets/` → 1 año immutable; `.html`, `llms*.txt`, `robots.txt`,
  `sitemap.xml`, `ai.txt`, CSS/JS de raíz → `no-cache`; `/healthz` → `no-store`.
- HSTS solo cuando el proxy indica HTTPS (`X-Forwarded-Proto: https`); el contenedor
  sirve HTTP plano.
- MIME: `txt`→`text/plain`, `xml`→`text/xml`, `webmanifest`→`application/manifest+json`
  (añadido; nginx base no lo trae), `webp`→`image/webp`, `avif`→`image/avif`.
- `.dockerignore` excluye `.git`, `docs`, `node_modules`, `*.md`, `CNAME`, logs y
  archivos scratch; la raíz web final solo contiene el sitio.
- Para nuevos archivos en la raíz (p. ej. `favicon.ico`, otra imagen, `security.txt`)
  basta con que usen una de las extensiones ya cubiertas por el `COPY` del Dockerfile
  (`html css js txt xml json webmanifest ico svg png jpg jpeg webp avif woff woff2`);
  si se usa otra extensión, añadirla al `COPY` y redesplegar.
