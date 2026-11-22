import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT;

if (!rawPort) {
  throw new Error(
    'PORT environment variable is required but was not provided.',
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH;

if (!basePath) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      scope: basePath,
      manifest: {
        id: basePath, start_url: basePath, scope: basePath,
        name: 'Udaan AI — Business possibilities',
        short_name: 'Udaan',
        description: 'A practical business inspiration companion for independent Indian restaurants.',
        lang: 'en-IN', display: 'standalone',
        background_color: '#05070D', theme_color: '#05070D',
        categories: ['business', 'productivity'],
        icons: [
          { src: 'icons/udaan-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/udaan-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/udaan-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['index.html', 'offline.html', 'manifest.webmanifest', 'favicon.svg', 'assets/*.{js,css,woff,woff2}', 'icons/*.png', 'images/*.{jpg,jpeg,png,webp,svg}'],
        globIgnores: ['**/thesis/**'],
        navigateFallback: `${basePath}index.html`,
        navigateFallbackDenylist: [/^\/api(?:\/|$)/, /^\/thesis(?:\/|$)/],
        // Precache only bundled public files. No runtime caching, including APIs,
        // audio, credentials, private business data or third-party restaurant data.
        runtimeCaching: [],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
        maximumFileSizeToCacheInBytes: 2000000,
      },
      devOptions: { enabled: false },
    }),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
