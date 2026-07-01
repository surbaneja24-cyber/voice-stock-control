import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set) => ({
      darkMode: false, // Valor por defecto
      
      // Función para alternar el tema
      toggleTheme: () => set((state) => ({ 
        darkMode: !state.darkMode 
      })),
      
      // Función para forzar un tema específico (útil para el futuro)
      setTheme: (isDark) => set({ darkMode: isDark }),
    }),
    {
      name: 'voxstock-theme', // El nombre con el que se guardará en el navegador
    }
  )
);