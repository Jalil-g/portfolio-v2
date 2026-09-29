import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The lazily loaded 3D scene (three.js + drei) is one ~1.1 MB chunk by design.
    chunkSizeWarningLimit: 1200,
  },
})
