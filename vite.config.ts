
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Disable caching during development - ultra aggressive approach
    fs: {
      strict: true,
    },
    hmr: {
      // Force full reload on changes
      protocol: 'ws',
      clientPort: 8080,
      overlay: true,
    },
    watch: {
      // Use polling for more reliable file watching
      usePolling: true,
      interval: 100,
    },
    headers: {
      // Set cache control headers for development server - now extremely strict
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'Clear-Site-Data': '"cache", "cookies", "storage"',
      'Surrogate-Control': 'no-store',
      'Vary': '*',
    },
  },
  plugins: [
    react({
      // Add forced refresh on every module update
      fastRefresh: false, // Force full page reloads
    }),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'CartCareHub',
        short_name: 'CartCareHub',
        description: 'Cart maintenance management application',
        theme_color: '#ffffff',
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
      // Force Vite PWA to update assets - now more aggressive
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        navigationPreload: true,
        disableDevLogs: false,
        runtimeCaching: [
          {
            // Skip caching all runtime requests in development
            urlPattern: /.*/,
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'force-sync',
                options: {
                  maxRetentionTime: 1,
                },
              },
            },
          }
        ],
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add build options to prevent caching
  build: {
    // Add timestamp to filenames
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`,
      },
    },
    // Add a version string to the app bundle for manual cache busting
    assetsInlineLimit: 0,
    sourcemap: true,
    // Add build metadata with timestamp
    target: 'esnext',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // you might want to disable CSS since we're testing logic only
    css: false,
  },
  optimizeDeps: {
    exclude: [],
    // Force dependencies to be re-bundled on every build
    force: true,
  },
}));
