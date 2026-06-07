import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerJSDoc from 'swagger-jsdoc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const openapiSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HiperTracker API',
      version: '0.1.4',
      description:
        'API REST de HiperTracker — gestión de listas de la compra multiusuario. ' +
        'Autenticación mediante JWT (Bearer). Obtén el token en POST /auth/login.',
    },
    servers: [{ url: '/api/v1', description: 'API v1' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    tags: [
      { name: 'Acceso', description: 'Login de la app (opcional, activable por env)' },
      { name: 'Auth', description: 'Autenticación' },
      { name: 'Perfiles', description: 'Gestión de perfiles' },
      { name: 'Listas', description: 'Listas de la compra' },
      { name: 'Productos', description: 'Productos de una lista' },
      { name: 'Tiendas', description: 'Tiendas disponibles' },
      { name: 'Datos', description: 'Copia de seguridad (export/import)' },
    ],
  },
  apis: [path.join(__dirname, 'routes', '*.js')],
});
