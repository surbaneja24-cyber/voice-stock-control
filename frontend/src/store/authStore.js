import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getApiBaseUrl } from '../utils/apiBaseUrl';

const BASE_API_URL = getApiBaseUrl();

export const useAuthStore = create(
  persist(
    (set) => ({
      usuario: null,
      estaAutenticado: false,

      login: (datosUsuario) => set({ 
        usuario: datosUsuario, 
        estaAutenticado: true 
      }),
      
      logout: async () => {
        try {
          await fetch(`${BASE_API_URL}/api/logout`, { 
            method: 'POST',
            credentials: 'include' 
          });
        } catch (error) {
          console.error("[CRITICAL] Fallo de red al cerrar sesión remota:", error);
        } finally {
          set({ usuario: null, estaAutenticado: false });
          localStorage.removeItem('voxstock-auth');
        }
      },

      authenticatedFetch: async (url, options = {}) => {
        const config = {
          ...options,
          credentials: 'include',
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
          }
        };

        const response = await fetch(url, config);

        if (response.status === 401) {
          set({ usuario: null, estaAutenticado: false });
          throw new Error("Sesión caducada por el servidor");
        }

        return response;
      }
    }),
    {
      name: 'voxstock-auth',
    }
  )
);