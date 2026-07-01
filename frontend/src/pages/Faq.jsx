import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircleQuestion, Terminal, CreditCard, ShieldAlert } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import { useLanguageStore } from "../store/languageStore";
import { translations } from "../utils/translations";
import Navbar from "../components/Navbar";

const AccordionItem = ({ q, a, isOpen, onClick, darkMode }) => {
  return (
    <div className={`border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'} last:border-none`}>
      <button
        onClick={onClick}
        className="w-full py-5 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={`font-semibold text-lg transition-colors duration-200 ${
          isOpen ? 'text-blue-500' : darkMode ? 'group-hover:text-slate-300' : 'group-hover:text-slate-600'
        }`}>{q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="text-blue-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className={`pb-6 text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Faq() {
  const { darkMode } = useThemeStore();
  const { language } = useLanguageStore();
  const [openIndex, setOpenIndex] = useState(null);

  // Obtener traducción activa o fallback en español
  const t = translations[language]?.faq || translations["es"].faq;

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Mapeo ordenado de iconos según la posición fija de las categorías
  const categoryIcons = [
    <MessageCircleQuestion size={20} key="general" />,
    <Terminal size={20} key="technical" />,
    <CreditCard size={20} key="billing" />
  ];

  // IMPORTANTE: El contador global se reinicia en cada ejecución del renderizado
  let globalQuestionIndex = 0;

  return (
    <main className={`min-h-screen w-full font-sans antialiased pb-24 transition-colors duration-300 ${
      darkMode ? 'bg-slate-900 text-slate-50' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-32 flex flex-col gap-12">
        
        {/* ENCABEZADO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm border border-amber-500/20 mb-6">
            <ShieldAlert size={16} /> {t.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            {t.title}
          </h1>
          <p className={`text-lg md:text-xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {t.subtitle}
          </p>
        </motion.div>

        {/* CONTENEDOR DE CATEGORÍAS */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-10"
        >
          {t.categories.map((category, catIndex) => (
            <div key={catIndex} className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-500 border-b pb-2 border-blue-500/20">
                {categoryIcons[catIndex] || <MessageCircleQuestion size={20} />}
                {category.title}
              </h2>
              
              <div className={`rounded-2xl border px-6 transition-colors duration-300 ${
                darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                {category.questions.map((item, itemIdx) => {
                  const currentIndex = globalQuestionIndex++;
                  return (
                    <AccordionItem
                      key={`${catIndex}-${itemIdx}`}
                      q={item.q}
                      a={item.a}
                      isOpen={openIndex === currentIndex}
                      onClick={() => toggleAccordion(currentIndex)}
                      darkMode={darkMode}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </main>
  );
}