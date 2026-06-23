import {
  FiGrid,
  FiMic,
  FiClock,
  FiSettings,
  FiMenu,
  FiChevronLeft,
} from "react-icons/fi";
import { NavLink, Link } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import { useTranslation } from "react-i18next";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { darkMode } = useThemeStore();
  const { t, i18n } = useTranslation();
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const currentLanguage = i18n.resolvedLanguage || i18n.language;

  const baseLinkClass = `flex items-center ${isOpen ? "gap-3 px-4" : "justify-center px-0 w-12"
    } py-3 rounded-lg transition-all duration-300`;

  const inactiveClass = darkMode
    ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900";

  const activeClass = darkMode
    ? "bg-blue-900/50 border border-blue-800 text-blue-400 font-semibold"
    : "bg-blue-50 border border-blue-100 text-blue-700 font-semibold";

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col justify-between transition-all duration-300 z-[100] shadow-[4px_0_24px_rgba(0,0,0,0.05)] ${isOpen ? "w-64" : "w-20 -translate-x-full md:translate-x-0"
        } ${darkMode
          ? "bg-slate-950 border-r border-slate-800"
          : "bg-white border-r border-slate-200"
        }`}
    >
      <div>
        <div
          className={`h-20 flex items-center transition-all duration-300 ${isOpen ? "justify-between px-6" : "justify-center"
            } ${darkMode
              ? "border-b border-slate-800"
              : "border-b border-slate-100"
            }`}
        >
          {isOpen && (
            <span
              className={`font-extrabold tracking-wider text-2xl whitespace-nowrap overflow-hidden ${darkMode ? "text-white" : "text-slate-900"
                }`}
            >
              VOX<span className="text-blue-500">STOCK</span>
            </span>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${darkMode
              ? "text-slate-400 hover:text-blue-400 hover:bg-slate-800"
              : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              }`}
          >
            {isOpen ? (
              <FiChevronLeft size={24} />
            ) : (
              <FiMenu size={24} />
            )}
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-2 flex flex-col items-center md:items-stretch">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <FiGrid size={22} className="shrink-0" />
            {isOpen && (
              <span className="tracking-wide whitespace-nowrap">
                {t("dashboard")}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/terminal"
            className={({ isActive }) =>
              `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <FiMic size={22} className="shrink-0" />
            {isOpen && (
              <span className="tracking-wide whitespace-nowrap">
                {t("voiceTerminal")}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `${baseLinkClass} ${isActive ? activeClass : inactiveClass}`
            }
          >
            <FiClock size={22} className="shrink-0" />
            {isOpen && (
              <span className="tracking-wide whitespace-nowrap">
                {t("history")}
              </span>
            )}
          </NavLink>

          <Link
            to="/settings"
            className={`${baseLinkClass} ${inactiveClass}`}
          >
            <FiSettings size={22} className="shrink-0" />
            {isOpen && (
              <span className="tracking-wide whitespace-nowrap">
                {t("settings")}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <div
        className={`p-4 border-t mb-2 flex justify-center md:justify-start ${darkMode ? "border-slate-800" : "border-slate-100"
          }`}
      >
        <Link
          to="/profile"
          className={`flex items-center ${isOpen
            ? "gap-3 px-4 w-full"
            : "justify-center p-0 w-12"
            } py-3 border rounded-xl cursor-pointer transition-all overflow-hidden ${darkMode
              ? "bg-slate-900 border-slate-700 hover:bg-slate-800"
              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
            }`}
        >
          <div className="w-10 h-10 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
            {profile?.fullName
              ? profile.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
              : "SU"}
          </div>

          {isOpen && (
            <div className="flex flex-col min-w-0">
              <span
                className={`text-sm font-bold leading-tight truncate ${darkMode ? "text-white" : "text-slate-900"
                  }`}
              >
                {profile?.fullName || "Santiago U."}
              </span>

              <span className="text-[11px] text-slate-500 font-medium tracking-wide uppercase mt-0.5 truncate">
                Operaciones
              </span>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;