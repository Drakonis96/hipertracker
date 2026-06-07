import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:5794';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      devOptions: { enabled: false },
      manifest: {
        name: 'HiperTracker',
        short_name: 'HiperTracker',
        description: 'Gestión de listas de la compra',
        lang: 'es',
        dir: 'ltr',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /^\/logos/, /^\/logo/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/logos/') || url.pathname.startsWith('/logo/'),
            handler: 'CacheFirst',
            options: { cacheName: 'hipertracker-logos', expiration: { maxEntries: 80 } },
          },
          {
            urlPattern: ({ url }) => url.pathname === '/api/v1/stores',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'hipertracker-stores' },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': API_TARGET,
      '/logos': API_TARGET,
      '/logo': API_TARGET,
    },
  },
});
