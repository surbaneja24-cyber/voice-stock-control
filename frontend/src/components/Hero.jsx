import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BlurText from "./BlurText";
import { useLanguageStore } from "../store/languageStore";
import { translations } from "../utils/translations";

function Hero() {
  const navigate = useNavigate();
  
  // 1. Extraemos el idioma activo desde Zustand
  const { language } = useLanguageStore();
  // 2. Apuntamos al diccionario específico del Hero
  const t = translations[language].hero;

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">

      {/* Animamos la etiqueta superior */}
      <motion.span
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="px-4 py-2 border border-zinc-700 rounded-full text-sm text-zinc-400 mb-2"
      >
        {t.badge}
      </motion.span>

      {/* Título dinámico conectado al diccionario */}
      <BlurText
        text={t.title}
        delay={100}
        animateBy="words"
        direction="top"
        className="mt-6 text-5xl md:text-7xl font-bold leading-tight justify-center"
      />

      {/* Párrafo dinámico */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        className="mt-6 text-zinc-400 text-xl max-w-3xl"
      >
        {t.subtitle}
      </motion.p>

      {/* Botones dinámicos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}
        className="flex gap-4 mt-10"
      >
        <button
          onClick={() => navigate('/login')} 
          className="px-8 py-4 bg-white text-black rounded-xl font-semibold hover:scale-105 transition"
        >
          {t.primaryBtn}
        </button>

        <button
          onClick={() => navigate('/pricing')} 
          className="px-8 py-4 border border-zinc-700 rounded-xl hover:border-white transition"
        >
          {t.secondaryBtn}
        </button>
      </motion.div>

    </section>
  );
}

export default Hero;