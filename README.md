<div align="center">
  <img src="server/public/logo/hipertracker.png" width="96" alt="HiperTracker" />
  <h1>HiperTracker</h1>
  <p><strong>v0.1.10</strong> · Webapp PWA de gestión de listas de la compra multiusuario</p>
</div>

---

HiperTracker es una aplicación para gestionar listas de la compra desde el móvil (instalable como PWA) y, en el futuro, desde una app nativa que consumirá la misma API REST. Toda la interfaz está en español.

## ✨ Características

- **Perfiles tipo Netflix** con avatar, color y PIN opcional (4–6 dígitos, hasheado con bcrypt).
- **Listas personales y compartidas** entre los perfiles del dispositivo.
- **Productos** con icono (emoji, librería de iconos vectoriales o inicial), tiendas asociadas, notas y estado de comprado.
- **Selector de iconos** con tres pestañas (emojis con buscador, iconos temáticos y “sin icono”) y **sugerencias automáticas de emoji** al escribir el nombre (en español o inglés).
- **37 tiendas** cargadas automáticamente desde los logos del sistema.
- **Búsqueda, filtros por tienda y por estado**, reordenación con drag & drop.
- **Vista de gestión** con edición en línea y acciones en lote.
- **Modo claro/oscuro** + color de acento configurable (guardados por perfil).
- **Exportar / importar** listas en CSV y JSON.
- **API REST v1 documentada** con OpenAPI 3.0 (Swagger UI en `/api/docs`) y autenticación JWT.
- **PWA**: instalable (manifest + iconos). El service worker se autodesregistra para no interferir con el Basic Auth de un *reverse proxy*.

## 🧱 Stack

| Capa | Tecnología |
|---|---|
| Backend | Node.js · Express · Drizzle ORM · SQLite (`better-sqlite3`) · JWT · Swagger |
| Frontend | React · Vite · React Router · Zustand · Tailwind CSS · dnd-kit · lucide-react |
| Empaquetado | Dockerfile multi-stage · docker-compose |

Monorepo con `/server` (API + servidor estático) y `/client` (SPA). En producción, un único proceso Node sirve el frontend compilado, la API y los assets.

## 📁 Estructura

```
hipertracker/
├── server/                # Backend Express + API REST
│   ├── src/
│   │   ├── routes/        # auth, profiles, lists, items, stores
│   │   ├── db/            # esquema Drizzle + inicialización SQLite
│   │   ├── lib/           # stores (lee logos), jwt, serializers, acceso
│   │   └── app.js, index.js, openapi.js
│   └── public/
│       ├── logo/          # logo de la app
│       └── logos/         # logos de tiendas (supermercados/ y otras/)
├── client/                # Frontend React + Vite (PWA)
│   └── src/{pages,components,store,data,lib,api}
├── Dockerfile             # build multi-stage
└── docker-compose.yml
```

## 🚀 Desarrollo

Requisitos: Node.js 20+.

```bash
# Instalar dependencias de ambos paquetes
npm run install:all

# Terminal 1 — API en http://localhost:5794
npm run dev:server

# Terminal 2 — frontend con HMR en http://localhost:5173 (proxy a la API)
npm run dev:client
```

Abre <http://localhost:5173>. En el primer arranque crea tu perfil (será administrador).

## 📦 Producción (sin Docker)

```bash
npm run install:all
npm run build          # compila el cliente a client/dist
npm start              # sirve todo desde http://localhost:5794
```

## 🐳 Docker

Compilando localmente:

```bash
docker compose up --build
# App en http://localhost:5794  ·  API docs en http://localhost:5794/api/docs
```

### Desde Docker Hub (imagen `linux/amd64`)

Sin compilar, tirando de la imagen publicada [`drakonis96/hipertracker`](https://hub.docker.com/r/drakonis96/hipertracker):

```bash
docker compose -f docker-compose.hub.yml up -d
```

La imagen `amd64` se publica automáticamente con el workflow `.github/workflows/docker-publish.yml` al crear un tag `vX.Y.Z` (o ejecutándolo a mano desde *Actions → Run workflow*). Requiere añadir en el repo los secretos `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN` (Settings → Secrets and variables → Actions).

La base de datos SQLite se guarda en el volumen `./data` para sobrevivir a reinicios.

## ⚙️ Variables de entorno

| Variable | Por defecto | Descripción |
|---|---|---|
| `PORT` | `5794` | Puerto del servidor |
| `DB_PATH` | `./data/hipertracker.db` | Ruta del fichero SQLite |
| `JWT_SECRET` | `change_me_in_production` | **Cámbialo en producción** |
| `ALLOWED_ORIGINS` | `*` | Orígenes CORS permitidos (separados por comas) |
| `ACCESS_TOKEN_TTL` | `12h` | Caducidad del access token |
| `REFRESH_TOKEN_TTL` | `30d` | Caducidad del refresh token |
| `APP_AUTH_USER` | — | Usuario del **login propio de la app** (opcional) |
| `APP_AUTH_PASSWORD` | — | Contraseña del login propio de la app (opcional) |

### 🔒 Login propio de la app (alternativa al Basic Auth del proxy)

Si defines `APP_AUTH_USER` **y** `APP_AUTH_PASSWORD`, toda la API queda protegida por una **pantalla de login** propia (token firmado en la cabecera `X-App-Auth`, comparación *timing-safe*, nada se almacena en el servidor). Así **no necesitas el Basic Auth del reverse proxy** (que con una PWA causa diálogos repetidos del navegador). Solo el "cascarón" estático (sin datos) es público; todos los datos requieren el login. En la **app nativa**, actívalo en *Conectar → "Login de la app"*.

## 🔌 API REST

Documentación interactiva en **`/api/docs`** (esquema en `/api/openapi.json`). Base: `/api/v1`.

```
POST   /auth/login                       # perfil (+ PIN) → JWT
POST   /auth/refresh
GET    /profiles                         # público (pantalla de selección)
POST   /profiles · PATCH/DELETE /profiles/:id
GET/POST /lists · PATCH/DELETE /lists/:id
GET    /lists/:id/export?format=csv|json
GET/POST   /lists/:listId/items
PATCH/DELETE /lists/:listId/items/:id
PATCH  /lists/:listId/items/:id/check
PATCH  /lists/:listId/items/reorder
GET    /stores
```

## 🏪 Tiendas

Las tiendas se generan leyendo `server/public/logos/{supermercados,otras}/`. El ID de cada tienda es el nombre del archivo sin extensión. Para personalizarlas en Docker, monta tu carpeta sobre `/app/server/public/logos`. También puedes crear **tiendas personalizadas** (sin logo, con inicial y color) desde Ajustes; estas se guardan en la base de datos.

## 📱 App nativa (iOS · iPadOS · macOS)

En `/ios` hay una app **SwiftUI multiplataforma** que consume la misma API REST y permite gestionar todo (perfiles, listas, productos, tiendas, copia de seguridad).

- **Conexión segura:** introduces la URL de tu servidor y, si está detrás de un *reverse proxy* con **Basic Auth**, el usuario y la contraseña. El JWT viaja en la cabecera `X-Auth-Token` (para no colisionar con el `Authorization: Basic` del proxy) y **las credenciales y los tokens se guardan en el Keychain**. Usa HTTPS en producción para que todo viaje cifrado.
- **Liquid Glass** en dispositivos compatibles (iOS/iPadOS/macOS 26+), con degradación elegante en versiones anteriores.
- **Logos reales** de las tiendas (SVG y PNG) descargados con autenticación.

### Compilar

Requiere Xcode 16+ y [XcodeGen](https://github.com/yonaskolb/XcodeGen) (`brew install xcodegen`).

```bash
cd ios
xcodegen generate
open HiperTracker.xcodeproj   # o compila desde la línea de comandos
```

> En el **simulador de iOS 26** los emojis pueden verse como "?" por un bug de Apple en esa runtime; en dispositivos reales y en iOS 18.x se muestran correctamente.

### Instalar con AltStore

La app se distribuye como **IPA sin firmar** vía [AltStore](https://altstore.io) (que la firma con tu cuenta al instalar):

1. Instala AltStore en tu dispositivo.
2. En AltStore → *Sources* → **+**, añade la fuente:
   ```
   https://raw.githubusercontent.com/Drakonis96/hipertracker/main/altstore/source.json
   ```
3. Busca **HiperTracker** e instálala.

En **macOS** descarga el `.dmg` de la [última release](https://github.com/Drakonis96/hipertracker/releases). Al no estar notarizada, ábrela con clic derecho → *Abrir* la primera vez.

---

Hecho con ❤️ para la compra de cada semana.
