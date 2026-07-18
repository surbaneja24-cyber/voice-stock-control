import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoArrowUpRight } from "react-icons/go";
import { Moon, Sun, Languages, LogOut, LogIn } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import { useLanguageStore } from "../store/languageStore";
import { useAuthStore } from "../store/authStore";
import { translations } from "../utils/translations";

export default function Navbar({ logo, logoAlt = "MyStock" }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const { darkMode, toggleTheme } = useThemeStore();
  const { language, toggleLanguage } = useLanguageStore();
  
  const usuario = useAuthStore((state) => state.usuario);
  const logoutAction = useAuthStore((state) => state.logout);
  
  const t = translations[language]?.navbar || translations["es"].navbar;

  const handleCerrarSesion = () => {
    // ELIMINADO: localStorage.removeItem("token"). 
    // DEBE hacerse dentro de la lógica de logoutAction() en authStore.js
    logoutAction();
    navigate("/login");
  };

  const menuItems = [
    {
      label: t.descubre,
      colorClass: darkMode
        ? "bg-slate-800 border-slate-700 text-slate-100"
        : "bg-slate-50 border-slate-200 text-slate-900",
      links: [
        { label: t.instrucciones, action: () => navigate("/como-funciona") },
        { label: t.planes, action: () => navigate("/pricing") },
        { label: t.piloto, action: () => navigate("/piloto") },
      ],
    },
    {
      label: t.soporte,
      colorClass: darkMode
        ? "bg-slate-800/80 border-slate-700 text-slate-100"
        : "bg-slate-100 border-slate-200 text-slate-900",
      links: [
        { label: t.faq, action: () => navigate("/faq") },
        { label: t.equipo, action: () => navigate("/equipo") },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[800px] z-[50]"
    >
      <motion.nav
        initial={false}
        animate={{ height: isOpen ? "auto" : 60 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className={`block rounded-2xl shadow-xl border overflow-hidden transition-colors duration-300 ${
          darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
        }`}
      >
        {/* LAYOUT CORREGIDO: 3 columnas equitativas para evitar colisiones */}
        <div className="h-[60px] flex items-center justify-between px-3 md:px-4">
          
          {/* IZQUIERDA: Menú */}
          <div className="w-1/3 flex justify-start">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-full transition-colors ${
                darkMode ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"
              }`}
              aria-label="Menú principal"
            >
              <motion.div animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }} className="w-6 h-[2px] bg-current origin-center" />
              <motion.div animate={{ opacity: isOpen ? 0 : 1 }} className="w-6 h-[2px] bg-current" />
              <motion.div animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }} className="w-6 h-[2px] bg-current origin-center" />
            </button>
          </div>

          {/* CENTRO: Logo (Sin position absolute) */}
          <div className="w-1/3 flex justify-center">
            <button
              onClick={() => {
                navigate("/");
                setIsOpen(false); 
              }}
              className="cursor-pointer transition-all duration-200 hover:opacity-80 active:scale-95 flex items-center justify-center"
              aria-label="Volver al inicio"
            >
              {logo ? (
                <img src={logo} alt={logoAlt} className="h-7" />
              ) : (
                <span className={`font-extrabold tracking-widest text-xl whitespace-nowrap ${darkMode ? "text-white" : "text-slate-900"}`}>
                  MY<span className="text-blue-500">STOCK</span>
                </span>
              )}
            </button>
          </div>

          {/* DERECHA: Controles (Idiomas, Tema y Auth en Desktop) */}
          <div className="w-1/3 flex justify-end items-center gap-1.5 md:gap-2">
            <button
              onClick={toggleLanguage}
              className={`flex items-center justify-center w-8 h-8 md:w-auto md:px-3 md:py-2 rounded-full md:rounded-lg border font-bold text-xs uppercase transition-all duration-300 ${
                darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
              title="Cambiar Idioma"
            >
              <Languages size={16} className="md:mr-1.5" />
              <span className="hidden md:inline">
                {language === "en" ? "EN" : language === "zh" ? "中文" : "ES"}
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border transition-all duration-300 ${
                darkMode ? "bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
              title="Cambiar Tema"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* BOTÓN AUTH DESKTOP: Oculto en móvil (md:flex) */}
            {usuario ? (
              <button
                onClick={handleCerrarSesion}
                className="hidden md:flex items-center justify-center gap-2 px-3 h-9 bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-lg transition-colors font-bold text-sm shadow-sm"
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className={`hidden md:flex px-4 items-center justify-center h-9 rounded-lg font-semibold text-sm transition-all duration-300 shadow-md ${
                  darkMode ? "bg-white text-black hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {t.login || "Login"}
              </button>
            )}
          </div>
        </div>

        {/* MENÚ DESPLEGABLE */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="px-4 pb-4 pt-2 flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item, idx) => (
                  <div key={idx} className={`flex flex-col gap-3 p-5 rounded-xl border transition-colors shadow-sm ${item.colorClass}`}>
                    <h3 className="font-bold tracking-wide text-lg">{item.label}</h3>
                    <div className="flex flex-col gap-1 mt-auto">
                      {item.links.map((lnk, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            lnk.action();
                            setIsOpen(false);
                          }}
                          className={`inline-flex items-center gap-2 text-left py-1 font-medium transition-colors ${
                            darkMode ? "text-slate-400 hover:text-blue-400" : "text-slate-600 hover:text-blue-600"
                          }`}
                        >
                          <GoArrowUpRight className={darkMode ? "text-blue-400" : "text-blue-600"} />
                          {lnk.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* BOTÓN AUTH MÓVIL: Soluciona el error de responsive */}
              <div className="md:hidden border-t pt-4 mt-2 border-slate-200 dark:border-slate-800">
                {usuario ? (
                  <button
                    onClick={handleCerrarSesion}
                    className="w-full flex items-center justify-center gap-2 px-4 h-12 bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white rounded-xl transition-colors font-bold text-sm shadow-sm"
                  >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-center gap-2 px-4 h-12 rounded-xl font-bold text-sm transition-colors shadow-md ${
                      darkMode ? "bg-white text-black hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <LogIn size={18} />
                    <span>{t.login || "Iniciar Sesión"}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </motion.div>
  );
}