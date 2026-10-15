import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Timestamp para forzar cache-busting en cada deploy
const buildTime = Date.now();

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  build: {
    // Agrega el timestamp al nombre del entry point para que index.html
    // siempre apunte a un nombre único e invalide cualquier caché anterior.
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-${buildTime}.js`,
        chunkFileNames: `assets/[name]-[hash]-${buildTime}.js`,
        assetFileNames: `assets/[name]-[hash][extname]`,
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor';
          }
          if (id.includes('node_modules/firebase/')) {
            return 'firebase';
          }
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'ui';
          }
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform') || id.includes('node_modules/zod')) {
            return 'forms';
          }
        },
      },
    },
  },
})
