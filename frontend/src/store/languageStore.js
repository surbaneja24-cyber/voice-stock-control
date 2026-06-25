import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'es', // Idioma por defecto
      toggleLanguage: () => set((state) => ({ 
        language: state.language === 'es' ? 'en' : 'es' 
      })),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'voxstock-language', // Se guarda en el LocalStorage del navegador
    }
  )
);