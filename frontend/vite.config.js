import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // OBLIGATORIO PARA CODESPACES: Escucha en todas las interfaces (0.0.0.0)
    strictPort: true, // Evita que Vite cambie de puerto si el 5173 está ocupado
    // Configuración para que el WebSocket de HMR funcione en el túnel HTTPS de GitHub
    hmr: {
      clientPort: 443 
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})