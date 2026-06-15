import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< Updated upstream
=======
import tailwindcss from '@tailwindcss/vite' // Por si acaso usas el nuevo plugin de Vite para Tailwind v4
>>>>>>> Stashed changes

// https://vite.dev/config/
export default defineConfig({
<<<<<<< Updated upstream
  plugins: [react()],
})
=======
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001', // <-- Apunta al puerto de tu IA
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
>>>>>>> Stashed changes
