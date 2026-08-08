import { LayoutDashboard, Mic, Clock, Settings, Menu, ChevronLeft, X, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom"; 
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore } from "../store/languageStore"; 
import { translations } from "../utils/translations";

const Sidebar = ({ isOpen = false, setIsOpen = () => {} }) => {
  const location = useLocation();
  const rutaActual = location.pathname;

  const darkMode = useThemeStore((state) => state?.darkMode || false);
  const usuario = useAuthStore((state) => state?.usuario || null); 
  const language = useLanguageStore((state) => state?.language || "es");
  
  const t = translations?.[language]?.sidebar || {};

  // Clases compartidas
  const baseLinkClass = `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300`;
  const inactiveClass = darkMode ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900";
  const activeClass = darkMode ? "bg-blue-900/50 border border-blue-800 text-blue-400 font-semibold" : "bg-blue-50 border border-blue-100 text-blue-700 font-semibold";

  const getIniciales = () => {
    try {
      if (!usuario?.nombre) return "OP";
      return String(usuario.nombre).trim().split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    } catch {
      return "OP";
    }
  };

  const handleMobileNav = () => setIsOpen(false);

  return (
    <>
      {/* =========================================
          VERSIÓN MÓVIL: TOP BAR + DRAWER DESLIZABLE
          ========================================= */}
      
      {/* 1. Barra Superior Fija (Solo Móvil) */}
      <div className={`md:hidden fixed top-0 left-0 w-full h-16 z-[90] flex items-center justify-between px-4 border-b transition-colors duration-300 ${darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"}`}>
        <button onClick={() => setIsOpen(true)} className={`p-2 -ml-2 rounded-lg ${darkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"}`}>
          <Menu size={26} />
        </button>
        {/* LOGO INTERACTIVO MÓVIL (TOP BAR) - Ya apuntaba bien a "/" */}
        <Link to="/" className={`font-extrabold tracking-wider text-xl hover:opacity-80 transition-opacity focus:outline-none ${darkMode ? "text-white" : "text-slate-900"}`}>
          MY<span className="text-blue-500">STOCK</span>
        </Link>
        <div className="w-8" /> 
      </div>

      {/* 2. Cortina Oscura y Menú Deslizable (Drawer) - Z-[9999] */}
      <div className={`md:hidden fixed inset-0 z-[9999] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        
        <aside className={`absolute top-0 left-0 w-[80%] max-w-[320px] h-full flex flex-col justify-between shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "bg-slate-950 border-r border-slate-800" : "bg-white border-r border-slate-200"}`}>
          <div>
            <div className={`h-16 flex items-center justify-between px-6 border-b ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
              {/* LOGO INTERACTIVO MÓVIL (DRAWER) - CORREGIDO de "/d" a "/" */}
              <Link to="/" onClick={handleMobileNav} className={`font-extrabold tracking-wider text-2xl hover:opacity-80 transition-opacity focus:outline-none ${darkMode ? "text-white" : "text-slate-900"}`}>
                MY<span className="text-blue-500">STOCK</span>
              </Link>
              <button onClick={() => setIsOpen(false)} className={`p-2 rounded-lg ${darkMode ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}>
                <X size={24} />
              </button>
            </div>

            <nav className="p-4 space-y-2 mt-2 flex flex-col">
              <Link to="/dashboard" onClick={handleMobileNav} className={`${baseLinkClass} ${rutaActual === "/dashboard" ? activeClass : inactiveClass}`}>
                <LayoutDashboard size={24} className="shrink-0" />
                <span className="tracking-wide text-lg">{t.dashboard || "Panel de Control"}</span>
              </Link>
              <Link to="/terminal" onClick={handleMobileNav} className={`${baseLinkClass} ${rutaActual === "/terminal" ? activeClass : inactiveClass}`}>
                <Mic size={24} className="shrink-0" />
                <span className="tracking-wide text-lg">{t.voiceTerminal || "Terminal de Voz"}</span>
              </Link>
              <Link to="/history" onClick={handleMobileNav} className={`${baseLinkClass} ${rutaActual === "/history" ? activeClass : inactiveClass}`}>
                <Clock size={24} className="shrink-0" />
                <span className="tracking-wide text-lg">{t.history || "Historial"}</span>
              </Link>
              <Link to="/settings" onClick={handleMobileNav} className={`${baseLinkClass} ${rutaActual === "/settings" ? activeClass : inactiveClass}`}>
                <Settings size={24} className="shrink-0" />
                <span className="tracking-wide text-lg">{t.settings || "Ajustes"}</span>
              </Link>
              {usuario?.rol === "admin" && (
                <Link to="/admin" onClick={handleMobileNav} className={`${baseLinkClass} ${rutaActual === "/admin" ? activeClass : inactiveClass}`}>
                  <ShieldCheck size={24} className="shrink-0" />
                  <span className="tracking-wide text-lg">{t.admin || "Panel Admin"}</span>
                </Link>
              )}
            </nav>
          </div>

          <div className={`p-4 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
            <Link to="/profile" onClick={handleMobileNav} className={`flex items-center gap-3 px-4 py-3 border rounded-xl transition-all ${darkMode ? "bg-slate-900 border-slate-700 hover:bg-slate-800" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}>
              <div className="w-12 h-12 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-md overflow-hidden">
                {usuario?.avatarUrl ? <img src={usuario.avatarUrl} alt="Avatar Operario" className="w-full h-full object-cover" /> : getIniciales()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`font-bold leading-tight truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{usuario?.nombre || "Operario"}</span>
                <span className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-0.5 truncate">{usuario?.rol || "Operaciones"}</span>
              </div>
            </Link>
          </div>
        </aside>
      </div>

      {/* =========================================
          VERSIÓN ESCRITORIO: SIDEBAR RETRÁCTIL
          ========================================= */}
      <aside className={`hidden md:flex fixed left-0 top-0 h-screen flex-col justify-between transition-all duration-300 z-[9999] shadow-[4px_0_24px_rgba(0,0,0,0.05)] ${isOpen ? "w-64" : "w-20"} ${darkMode ? "bg-slate-950 border-r border-slate-800" : "bg-white border-r border-slate-200"}`}>
        <div>
          <div className={`h-20 flex items-center transition-all duration-300 ${isOpen ? "justify-between px-6" : "justify-center"} ${darkMode ? "border-b border-slate-800" : "border-b border-slate-100"}`}>
            {isOpen && (
              <>
                {/* LOGO INTERACTIVO ESCRITORIO - CORREGIDO de "/dashboard" a "/" */}
                <Link to="/" className={`font-extrabold tracking-wider text-2xl whitespace-nowrap overflow-hidden hover:opacity-80 transition-opacity focus:outline-none ${darkMode ? "text-white" : "text-slate-900"}`}>
                  MY<span className="text-blue-500">STOCK</span>
                </Link>
              </>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2 rounded-lg transition-colors cursor-pointer ${darkMode ? "text-slate-400 hover:text-blue-400 hover:bg-slate-800" : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"}`}>
              {isOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className="p-4 space-y-2 mt-2 flex flex-col items-stretch">
            <Link to="/dashboard" className={`flex items-center ${isOpen ? "gap-3 px-4" : "justify-center px-0 w-12"} py-3 rounded-lg transition-all duration-300 ${rutaActual === "/dashboard" ? activeClass : inactiveClass}`}>
              <LayoutDashboard size={22} className="shrink-0" />
              {isOpen && <span className="tracking-wide whitespace-nowrap">{t.dashboard || "Panel"}</span>}
            </Link>

            <Link to="/terminal" className={`flex items-center ${isOpen ? "gap-3 px-4" : "justify-center px-0 w-12"} py-3 rounded-lg transition-all duration-300 ${rutaActual === "/terminal" ? activeClass : inactiveClass}`}>
              <Mic size={22} className="shrink-0" />
              {isOpen && <span className="tracking-wide whitespace-nowrap">{t.voiceTerminal || "Terminal Voz"}</span>}
            </Link>

            <Link to="/history" className={`flex items-center ${isOpen ? "gap-3 px-4" : "justify-center px-0 w-12"} py-3 rounded-lg transition-all duration-300 ${rutaActual === "/history" ? activeClass : inactiveClass}`}>
              <Clock size={22} className="shrink-0" />
              {isOpen && <span className="tracking-wide whitespace-nowrap">{t.history || "Historial"}</span>}
            </Link>

            <Link to="/settings" className={`flex items-center ${isOpen ? "gap-3 px-4" : "justify-center px-0 w-12"} py-3 rounded-lg transition-all duration-300 ${rutaActual === "/settings" ? activeClass : inactiveClass}`}>
              <Settings size={22} className="shrink-0" />
              {isOpen && <span className="tracking-wide whitespace-nowrap">{t.settings || "Ajustes"}</span>}
            </Link>

            {usuario?.rol === "admin" && (
              <Link to="/admin" className={`flex items-center ${isOpen ? "gap-3 px-4" : "justify-center px-0 w-12"} py-3 rounded-lg transition-all duration-300 ${rutaActual === "/admin" ? activeClass : inactiveClass}`}>
                <ShieldCheck size={22} className="shrink-0" />
                {isOpen && <span className="tracking-wide whitespace-nowrap">{t.admin || "Panel Admin"}</span>}
              </Link>
            )}
          </nav>
        </div>

        <div className={`p-4 border-t mb-2 flex justify-start ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
          <Link to="/profile" className={`flex items-center ${isOpen ? "gap-3 px-4 w-full" : "justify-center p-0 w-12"} py-3 border rounded-xl cursor-pointer transition-all overflow-hidden ${darkMode ? "bg-slate-900 border-slate-700 hover:bg-slate-800" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}>
            <div className="w-10 h-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
              {usuario?.avatarUrl ? <img src={usuario.avatarUrl} alt="Avatar Operario" className="w-full h-full object-cover" /> : getIniciales()}
            </div>
            {isOpen && (
              <div className="flex flex-col min-w-0">
                <span className={`text-sm font-bold leading-tight truncate ${darkMode ? "text-white" : "text-slate-900"}`}>{usuario?.nombre || "Operario"}</span>
                <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase mt-0.5 truncate">{usuario?.rol || "Operaciones"}</span>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;