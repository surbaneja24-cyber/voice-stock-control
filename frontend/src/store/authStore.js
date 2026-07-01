import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      // 1. ESTADO INICIAL
      usuario: null,          // Aquí guardaremos el perfil { id, nombre, email, rol }
      estaAutenticado: false, // Semáforo para saber si dejamos pasar al usuario

      // 2. ACCIONES (Funciones para modificar el estado)
      login: (datosUsuario) => set({ 
        usuario: datosUsuario, 
        estaAutenticado: true 
      }),
      
      logout: () => set({ 
        usuario: null, 
        estaAutenticado: false 
      }),
    }),
    {
      name: 'voxstock-auth', // Nombre bajo el que se guardará en el navegador
    }
  )
);