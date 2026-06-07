import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:5794';

// Nota: NO usamos service worker. Detrás de un reverse proxy con Basic Auth
// (+ CDN como Cloudflare) un SW provoca diálogos repetidos de credenciales y,
// con un SW autodestructivo, bucles de recarga. La app sigue siendo instalable
// gracias al manifest (client/public/manifest.webmanifest, enlazado con
// crossorigin="use-credentials" en index.html). index.html además incluye un
// pequeño script que desregistra cualquier SW previo y limpia su caché.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': API_TARGET,
      '/logos': API_TARGET,
      '/logo': API_TARGET,
    },
  },
});
