import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Función auxiliar para detectar el idioma del celular/navegador si es la primera vez
const getDeviceLanguage = () => {
  const browserLng = navigator.language || navigator.userLanguage;
  const shortLng = browserLng?.split('-')[0]; // Extrae 'es', 'en' o 'zh'
  
  const supportedLanguages = ['es', 'en', 'zh'];
  return supportedLanguages.includes(shortLng) ? shortLng : 'es'; // 'es' como fallback global si es otro idioma
};

export const useLanguageStore = create(
  persist(
    (set) => ({
      // Si ya existía en el localStorage lo usará; si no, correrá getDeviceLanguage() automáticamente
      language: getDeviceLanguage(), 

      // CUTE CICLO DE 3 IDIOMAS: es -> en -> zh -> es
      toggleLanguage: () => set((state) => {
        let nextLang = 'en'; // Si está en 'es', pasa a 'en'
        
        if (state.language === 'en') {
          nextLang = 'zh';   // Si está en 'en', pasa a 'zh'
        } else if (state.language === 'zh') {
          nextLang = 'es';   // Si está en 'zh', vuelve a 'es'
        }
        
        return { language: nextLang };
      }),

      // Permite forzar un idioma específico directamente si se necesita en el futuro
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'voxstock-language', // Se mantiene el nombre para no romper la persistencia existente
    }
  )
);