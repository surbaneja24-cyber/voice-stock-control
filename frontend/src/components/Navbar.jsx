import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoArrowUpRight } from 'react-icons/go';
import { Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";

export default function Navbar({ logo, logoAlt = 'VoxStock' }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useThemeStore();

  const menuItems = [
    {
      label: "Operaciones",
      colorClass: darkMode ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900",
      links: [
        { label: "Ir a Terminal IA", action: () => navigate('/terminal'), ariaLabel: "Control de Stock" },
        { label: "Dashboard Analítico", action: () => navigate('/dashboard'), ariaLabel: "Supervisión" }
      ]
    },
    {
      label: "Inventario",
      colorClass: darkMode ? "bg-slate-800/80 border-slate-700 text-slate-100" : "bg-slate-100 border-slate-200 text-slate-900",
      links: [
        { label: "Historial Completo", action: () => navigate('/history'), ariaLabel: "Historial de movimientos" }
      ]
    }
  ];

  return (
    // CONTENEDOR FIXED: Nunca desaparece al hacer scroll
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[800px] z-[999]">
      <motion.nav
        initial={false}
        animate={{ height: isOpen ? 'auto' : 60 }} // Framer Motion maneja la altura automaticamente
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className={`block rounded-2xl shadow-xl border overflow-hidden transition-colors duration-300 ${
          darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}
      >
        {/* BARRA SUPERIOR (Siempre visible - Altura estática 60px) */}
        <div className="h-[60px] flex items-center justify-between px-4 relative z-10">
          
          {/* HAMBURGUESA */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full transition-colors ${
              darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
            }`}
            aria-label="Menú principal"
          >
            <motion.div 
              animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }} 
              className="w-6 h-[2px] bg-current origin-center"
            />
            <motion.div 
              animate={{ opacity: isOpen ? 0 : 1 }} 
              className="w-6 h-[2px] bg-current"
            />
            <motion.div 
              animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }} 
              className="w-6 h-[2px] bg-current origin-center"
            />
          </button>

          {/* LOGOTIPO */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {logo ? (
               <img src={logo} alt={logoAlt} className="h-7" />
            ) : (
               <span className={`font-extrabold tracking-widest text-xl ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                 VOX<span className="text-blue-500">STOCK</span>
               </span>
            )}
          </div>

          {/* BOTONES DERECHA */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-all duration-300 ${
                darkMode 
                  ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => navigate('/terminal')}
              className="hidden md:flex px-5 items-center justify-center h-10 rounded-lg font-semibold transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
            >
              Probar IA
            </button>
          </div>
        </div>

        {/* CONTENIDO DESPLEGABLE (Animado por AnimatePresence) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="px-4 pb-4 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {menuItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-3 p-5 rounded-xl border transition-colors shadow-sm ${item.colorClass}`}
                >
                  <h3 className="font-bold tracking-wide text-lg">
                    {item.label}
                  </h3>
                  <div className="flex flex-col gap-1 mt-auto">
                    {item.links.map((lnk, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          lnk.action();
                          setIsOpen(false);
                        }}
                        className={`inline-flex items-center gap-2 text-left py-1 font-medium transition-colors ${
                          darkMode ? 'text-slate-400 hover:text-blue-400' : 'text-slate-600 hover:text-blue-600'
                        }`}
                      >
                        <GoArrowUpRight className={darkMode ? "text-blue-400" : "text-blue-600"} />
                        {lnk.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}