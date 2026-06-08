import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import { config } from './config.js';
import { openapiSpec } from './openapi.js';
import { authRouter } from './routes/auth.js';
import { profilesRouter } from './routes/profiles.js';
import { listsRouter } from './routes/lists.js';
import { itemsRouter } from './routes/items.js';
import { storesRouter } from './routes/stores.js';
import { dataRouter } from './routes/data.js';
import { gateRouter } from './routes/gate.js';
import { requireGate, gateEnabled, hasValidGate } from './middleware/gate.js';
import { apiLimiter, loginLimiter } from './middleware/rateLimit.js';
import { gatePageHtml } from './lib/gatePage.js';
import { notFoundHandler, errorHandler } from './middleware/errors.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  // CORS configurable para la futura app móvil.
  const corsOptions =
    config.allowedOrigins.includes('*')
      ? { origin: true }
      : { origin: config.allowedOrigins };
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '2mb' }));

  // Cabeceras de seguridad básicas (no rompen la app; sin CSP estricto).
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  // Healthcheck (público, no limitado: útil para monitores).
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'HiperTracker', version: '0.1.8' });
  });

  // Documentación OpenAPI / Swagger UI
  app.get('/api/openapi.json', (req, res) => res.json(openapiSpec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'HiperTracker API',
  }));

  // API v1 — el montaje de items va antes que /lists para que coincida primero.
  const v1 = express.Router();
  // Tope generoso por IP (defensa frente a abuso); no afecta al uso normal.
  v1.use(apiLimiter);
  // El "portero" (login de la app) va primero y es público; el resto de la API
  // queda protegido por requireGate cuando está activado.
  v1.use('/gate', gateRouter);
  v1.use(requireGate);
  v1.use('/auth', authRouter);
  v1.use('/profiles', profilesRouter);
  v1.use('/lists/:listId/items', itemsRouter);
  v1.use('/lists', listsRouter);
  v1.use('/stores', storesRouter);
  v1.use('/data', dataRouter);
  app.use('/api/v1', v1);

  // Portero del cascarón estático: si el login de la app está activado y el
  // navegador no tiene sesión, no se sirve NADA del frontend (ni el HTML); en su
  // lugar se devuelve la página de login. La app nativa (cabecera X-App-Auth) y
  // el navegador ya autenticado (cookie httpOnly) pasan sin problema.
  app.use((req, res, next) => {
    if (!gateEnabled() || req.path.startsWith('/api')) return next();
    if (hasValidGate(req)) return next();
    const accept = req.headers.accept || '';
    if (req.method === 'GET' && accept.includes('text/html')) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).type('html').send(gatePageHtml);
    }
    return res.status(401).type('text/plain').send('Acceso restringido');
  });

  // Assets estáticos: logos de tiendas y logo de la app (/logos/..., /logo/...).
  app.use(express.static(config.paths.publicDir, { index: false }));

  // Frontend compilado (producción).
  const indexHtml = path.join(config.paths.clientDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    app.use(
      express.static(config.paths.clientDist, {
        index: false,
        setHeaders: (res, filePath) => {
          const base = path.basename(filePath);
          // El service worker, su registrador, el HTML y el manifest NUNCA deben
          // cachearse de forma persistente (ni en el navegador ni en un CDN como
          // Cloudflare): si no, se sirve un SW obsoleto y reaparece el problema.
          if (
            base === 'sw.js' ||
            base === 'registerSW.js' ||
            filePath.endsWith('.html') ||
            filePath.endsWith('.webmanifest')
          ) {
            res.setHeader('Cache-Control', 'no-cache');
          } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            // Assets con hash en el nombre: inmutables.
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      }),
    );
    // SPA fallback para rutas del cliente (no API). El HTML no se cachea.
    app.get(/^\/(?!api\/).*/, (req, res, next) => {
      if (req.method !== 'GET') return next();
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexHtml);
    });
  }

  // 404 para rutas de API y manejo de errores.
  app.use('/api', notFoundHandler);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
