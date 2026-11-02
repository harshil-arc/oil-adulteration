import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import fs from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Auto-create .env from .env.example if it does not exist
const envPath = resolve(__dirname, '.env')
if (!fs.existsSync(envPath)) {
  const examplePath = resolve(__dirname, '.env.example')
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath)
    console.log('[Vite config] Auto-created .env from .env.example')
  }
}

export default defineConfig({
  envDir: __dirname,
  resolve: {
    alias: {
      react: resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'html2canvas', 'jspdf']
  },
  plugins: [
    react(),
    {
      name: 'esp32-local-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/esp/read')) {
            const parsedUrl = new URL(req.url, 'http://localhost');
            const rawIp = parsedUrl.searchParams.get('ip') || '192.168.43.100';
            const cleanIp = rawIp.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            try {
              const fetchRes = await fetch(`http://${cleanIp}/data`, { signal: AbortSignal.timeout(3000) });
              const data = await fetchRes.text();
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.end(data);
            } catch (e) {
              try {
                const fetchRes2 = await fetch(`http://${cleanIp}/sensor`, { signal: AbortSignal.timeout(3000) });
                const data2 = await fetchRes2.text();
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(data2);
              } catch (err2) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify({ error: 'Failed to reach ESP32', message: err2.message }));
              }
            }
            return;
          }
          if (req.url && req.url.startsWith('/api/esp/result')) {
            const parsedUrl = new URL(req.url, 'http://localhost');
            const rawIp = parsedUrl.searchParams.get('ip') || '192.168.43.100';
            const cleanIp = rawIp.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const postRes = await fetch(`http://${cleanIp}/result`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain' },
                  body: body,
                  signal: AbortSignal.timeout(3000)
                });
                const respText = await postRes.text();
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(respText || '{"status":"ok"}');
              } catch (e) {
                res.statusCode = 502;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify({ error: 'Failed to post to ESP32', message: e.message }));
              }
            });
            return;
          }
          next();
        });
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'SpectraTrust – Oil Adulteration Detector',
        short_name: 'SpectraTrust',
        description: 'Laboratory-grade oil adulteration detection powered by ESP32 sensors and AI analysis.',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#d4af37',
        background_color: '#0a0a0a',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Increase maximum file size limit to 6 MB for PWA precaching to prevent build failures
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Cache all JS, CSS, HTML, and image assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],
        // Runtime caching for API calls and external resources
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cache Supabase API calls with network-first strategy
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 10
            }
          },
          {
            // Cache external images (e.g. Google avatar, SVG icons)
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|webp|gif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'external-images-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-icons': ['lucide-react'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
