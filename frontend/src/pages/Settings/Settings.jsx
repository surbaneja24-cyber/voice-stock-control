import { useThemeStore } from "../../store/themeStore";
import { useLanguageStore } from "../../store/languageStore";
import { translations } from "../../utils/translations";
import { FiMoon, FiGlobe, FiMic, FiBell, FiInfo } from "react-icons/fi";

export default function Settings() {
    const { darkMode, toggleTheme } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();

    // Obtener las traducciones de la sección settings o fallback a español
    const t = translations[language]?.settings || translations["es"].settings;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className={`text-3xl font-bold tracking-tight ${
                    darkMode ? "text-white" : "text-slate-900"
                }`}>
                    {t.title}
                </h1>

                <p className={`mt-2 text-sm ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                }`}>
                    {t.subtitle}
                </p>
            </div>

            <div className="grid gap-6">

                {/* Appearance */}
                <div className={`rounded-2xl border p-6 transition-colors duration-300 ${
                    darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                }`}>
                    <div className="flex items-center gap-3 mb-4 text-blue-500">
                        <FiMoon size={22} />
                        <h2 className={`text-xl font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                            {t.appearance}
                        </h2>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className={darkMode ? "text-slate-300" : "text-slate-600"}>{t.darkMode}</span>

                        <button
                            onClick={toggleTheme}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
                                darkMode
                                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                            }`}
                        >
                            {darkMode ? t.enabled : t.disabled}
                        </button>
                    </div>
                </div>

                {/* Language */}
                <div className={`rounded-2xl border p-6 transition-colors duration-300 ${
                    darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                }`}>
                    <div className="flex items-center gap-3 mb-4 text-blue-500">
                        <FiGlobe size={22} />
                        <h2 className={`text-xl font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                            {t.language}
                        </h2>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className={darkMode ? "text-slate-300" : "text-slate-600"}>{t.language}</span>

                        <select
                            value={language}
                            onChange={(e) => {
                                setLanguage(e.target.value);
                                localStorage.setItem("language", e.target.value);
                            }}
                            className={`px-3 py-2 rounded-lg border outline-none font-medium cursor-pointer transition-colors ${
                                darkMode
                                    ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500"
                                    : "bg-white border-slate-200 text-slate-900 focus:border-blue-500 shadow-sm"
                            }`}
                        >
                            <option value="es">🇪🇸 Español</option>
                            <option value="en">🇬🇧 English</option>
                            <option value="zh">🇨🇳 中文 (Chinese)</option>
                        </select>
                    </div>
                </div>

                {/* Voice Terminal */}
                <div className={`rounded-2xl border p-6 transition-colors duration-300 ${
                    darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                }`}>
                    <div className="flex items-center gap-3 mb-4 text-blue-500">
                        <FiMic size={22} />
                        <h2 className={`text-xl font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                            {t.voiceTerminal}
                        </h2>
                    </div>

                    <div className={`space-y-3 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                        <div className="flex justify-between border-b border-dashed border-slate-700/20 pb-2">
                            <span>{t.recLanguage}</span>
                            <span className="font-semibold text-blue-500">
                                {language === "es" ? "Español" : language === "zh" ? "中文" : "Spanish"}
                            </span>
                        </div>

                        <div className="flex justify-between border-b border-dashed border-slate-700/20 pb-2">
                            <span>{t.confSound}</span>
                            <span className="text-emerald-500 font-semibold">{t.enabled}</span>
                        </div>

                        <div className="flex justify-between pb-1">
                            <span>{t.autoExec}</span>
                            <span className="text-rose-500 font-semibold">{t.disabled}</span>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className={`rounded-2xl border p-6 transition-colors duration-300 ${
                    darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                }`}>
                    <div className="flex items-center gap-3 mb-4 text-blue-500">
                        <FiBell size={22} />
                        <h2 className={`text-xl font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                            {t.notifications}
                        </h2>
                    </div>

                    <div className={`space-y-3 text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                        <div className="flex justify-between border-b border-dashed border-slate-700/20 pb-2">
                            <span>{t.lowStock}</span>
                            <span className="text-emerald-500 font-semibold">{t.enabled}</span>
                        </div>

                        <div className="flex justify-between pb-1">
                            <span>{t.desktopNotif}</span>
                            <span className="text-rose-500 font-semibold">{t.disabled}</span>
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className={`rounded-2xl border p-6 transition-colors duration-300 ${
                    darkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"
                }`}>
                    <div className="flex items-center gap-3 mb-4 text-blue-500">
                        <FiInfo size={22} />
                        <h2 className={`text-xl font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                            {t.about}
                        </h2>
                    </div>

                    <div className={`space-y-2 text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                        <p><span className="font-semibold">{t.version}:</span> 1.0.0</p>
                        <p>{t.desc}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}