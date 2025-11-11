import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ Konfigurasi lengkap: hot reload, port, dan auto refresh
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    open: true, // otomatis buka browser
    watch: {
      usePolling: true,
      interval: 100, // refresh cepat
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Assistenku-Core',
        short_name: 'Assistenku',
        theme_color: '#2196f3',
        background_color: '#e3f2fd',
        display: 'standalone',
        icons: [
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
