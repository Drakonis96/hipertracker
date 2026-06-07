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
  app.use(express.json({ limit: '1mb' }));

  // Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'HiperTracker', version: '0.1.0' });
  });

  // Documentación OpenAPI / Swagger UI
  app.get('/api/openapi.json', (req, res) => res.json(openapiSpec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'HiperTracker API',
  }));

  // API v1 — el montaje de items va antes que /lists para que coincida primero.
  const v1 = express.Router();
  v1.use('/auth', authRouter);
  v1.use('/profiles', profilesRouter);
  v1.use('/lists/:listId/items', itemsRouter);
  v1.use('/lists', listsRouter);
  v1.use('/stores', storesRouter);
  v1.use('/data', dataRouter);
  app.use('/api/v1', v1);

  // Assets estáticos: logos de tiendas y logo de la app (/logos/..., /logo/...).
  app.use(express.static(config.paths.publicDir, { index: false }));

  // Frontend compilado (producción).
  const indexHtml = path.join(config.paths.clientDist, 'index.html');
  if (fs.existsSync(indexHtml)) {
    app.use(express.static(config.paths.clientDist, { index: false }));
    // SPA fallback para rutas del cliente (no API).
    app.get(/^\/(?!api\/).*/, (req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile(indexHtml);
    });
  }

  // 404 para rutas de API y manejo de errores.
  app.use('/api', notFoundHandler);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
