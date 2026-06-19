import {
  FiGrid,
  FiMic,
  FiClock,
  FiSettings,
  FiMenu,
  FiChevronLeft,
  FiMoon,
  FiSun,
  FiGlobe,
} from "react-icons/fi";

import { Link } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import { useTranslation } from "react-i18next";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const darkMode = useThemeStore((state) => state.darkMode);

  const toggleTheme = useThemeStore(
    (state) => state.toggleTheme
  );

  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || i18n.language;

  const toggleLanguage = () => {
    i18n.changeLanguage(
      currentLanguage === "es" ? "en" : "es"
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-[100] shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isOpen
        ? "w-64"
        : "w-20 -translate-x-full md:translate-x-0"
        }`}
    >
      {/* Sección Superior: Logo y Menú */}
      <div>
        <div
          className={`h-20 flex items-center border-b border-slate-100 transition-all duration-300 ${isOpen
            ? "justify-between px-6"
            : "justify-center"
            }`}
        >
          {isOpen && (
            <span className="text-slate-900 font-extrabold tracking-wider text-2xl whitespace-nowrap overflow-hidden">
              VOX<span className="text-blue-600">STOCK</span>
            </span>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          >
            {isOpen ? (
              <FiChevronLeft size={24} />
            ) : (
              <FiMenu size={24} />
            )}
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-2 flex flex-col items-center md:items-stretch">
          <Link
            to="/dashboard"
            className={`flex items-center ${isOpen
              ? "gap-3 px-4"
              : "justify-center px-0 w-12"
              } py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg transition-all duration-300`}
          >
            <FiGrid size={22} className="shrink-0" />
            {isOpen && (
              <span className="font-medium tracking-wide whitespace-nowrap">
                {t("dashboard")}
              </span>
            )}
          </Link>

          <a
            title="Terminal Voz"
            href="#"
            className={`flex items-center ${isOpen
              ? "gap-3 px-4"
              : "justify-center px-0 w-12"
              } py-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg transition-all`}
          >
            <FiMic size={22} className="shrink-0" />
            {isOpen && (
              <span className="font-semibold tracking-wide whitespace-nowrap">
                {t("voiceTerminal")}
              </span>
            )}
          </a>

          <Link
            to="/history"
            className={`flex items-center ${isOpen
              ? "gap-3 px-4"
              : "justify-center px-0 w-12"
              } py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg transition-all duration-300`}
          >
            <FiClock size={22} className="shrink-0" />
            {isOpen && (
              <span className="font-medium">
                {t("history")}
              </span>
            )}
          </Link>

          <button
            onClick={toggleTheme}
            className={`flex items-center ${isOpen
              ? "gap-3 px-4"
              : "justify-center px-0 w-12"
              } py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg transition-all duration-300`}
          >
            {darkMode ? (
              <FiSun size={22} className="shrink-0" />
            ) : (
              <FiMoon size={22} className="shrink-0" />
            )}

            {isOpen && (
              <span className="font-medium tracking-wide whitespace-nowrap">
                {darkMode
                  ? t("lightMode")
                  : t("darkMode")}
              </span>
            )}
          </button>

          {/* BOTÓN DE IDIOMA */}
          <button
            onClick={toggleLanguage}
            className={`flex items-center ${isOpen
              ? "gap-3 px-4"
              : "justify-center px-0 w-12"
              } py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg transition-all duration-300`}
          >
            <FiGlobe size={22} className="shrink-0" />

            {isOpen && (
              <span className="font-medium tracking-wide whitespace-nowrap">
                {i18n.resolvedLanguage === "es"
                  ? "English"
                  : "Español"}
              </span>
            )}
          </button>

          <a
            title="Ajustes"
            href="#"
            className={`flex items-center ${isOpen
              ? "gap-3 px-4"
              : "justify-center px-0 w-12"
              } py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg transition-all duration-300`}
          >
            <FiSettings size={22} className="shrink-0" />
            {isOpen && (
              <span className="font-medium tracking-wide whitespace-nowrap">
                {t("settings")}
              </span>
            )}
          </a>
        </nav>
      </div>

      {/* Perfil */}
      <div className="p-4 border-t border-slate-100 mb-2 flex justify-center md:justify-start">
        <div
          className={`flex items-center ${isOpen
            ? "gap-3 px-4 w-full"
            : "justify-center p-0 w-12"
            } py-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer transition-all overflow-hidden`}
        >
          <div className="w-10 h-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
            SU
          </div>

          {isOpen && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-900 leading-tight truncate">
                Santiago U.
              </span>

              <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase mt-0.5 truncate">
                Operaciones
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;