import { useThemeStore } from "../../store/themeStore";
import { useTranslation } from "react-i18next";
import { FiMoon, FiGlobe, FiMic, FiBell, FiInfo } from "react-icons/fi";

export default function Settings() {
    const { darkMode, toggleTheme } = useThemeStore();
    const { t, i18n } = useTranslation();

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-slate-900"
                    }`}>
                    Settings
                </h1>

                <p className={`mt-2 ${darkMode ? "text-slate-400" : "text-slate-500"
                    }`}>
                    Manage your VoxStock preferences.
                </p>
            </div>

            <div className="grid gap-6">

                {/* Appearance */}
                <div className={`rounded-2xl border p-6 ${darkMode
                    ? "bg-slate-900 border-slate-700"
                    : "bg-white border-slate-200"
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <FiMoon size={22} />
                        <h2 className="text-xl font-semibold">{t("appearance")}</h2>
                    </div>

                    <div className="flex items-center justify-between">
                        <span>{t("darkMode")}</span>

                        <button
                            onClick={toggleTheme}
                            className={`px-4 py-2 rounded-lg font-medium ${darkMode
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-900"
                                }`}
                        >
                            {darkMode ? "Enabled" : "Disabled"}
                        </button>
                    </div>
                </div>

                {/* Language */}
                <div className={`rounded-2xl border p-6 ${darkMode
                    ? "bg-slate-900 border-slate-700"
                    : "bg-white border-slate-200"
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <FiGlobe size={22} />
                        <h2 className="text-xl font-semibold">{t("language")}</h2>
                    </div>

                    <div className="flex items-center justify-between">
                        <span>Language</span>

                        <select
                            value={i18n.resolvedLanguage}
                            onChange={(e) => {
                                i18n.changeLanguage(e.target.value);
                                localStorage.setItem("language", e.target.value);
                            }}
                            className={`px-3 py-2 rounded-lg border ${darkMode
                                ? "bg-slate-800 border-slate-700 text-white"
                                : "bg-white border-slate-200 text-slate-900"
                                }`}
                        >
                            <option value="es">🇪🇸 Español</option>
                            <option value="en">🇬🇧 English</option>
                        </select>
                    </div>
                </div>

                {/* Voice Terminal */}
                <div className={`rounded-2xl border p-6 ${darkMode
                    ? "bg-slate-900 border-slate-700"
                    : "bg-white border-slate-200"
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <FiMic size={22} />
                        <h2 className="text-xl font-semibold">
                            Voice Terminal
                        </h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span>Recognition Language</span>
                            <span>Spanish</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Confirmation Sound</span>
                            <span>Enabled</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Auto Execute Commands</span>
                            <span>Disabled</span>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className={`rounded-2xl border p-6 ${darkMode
                    ? "bg-slate-900 border-slate-700"
                    : "bg-white border-slate-200"
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <FiBell size={22} />
                        <h2 className="text-xl font-semibold">{t("notifications")}</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span>Low Stock Alerts</span>
                            <span>Enabled</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Desktop Notifications</span>
                            <span>Disabled</span>
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className={`rounded-2xl border p-6 ${darkMode
                    ? "bg-slate-900 border-slate-700"
                    : "bg-white border-slate-200"
                    }`}>
                    <div className="flex items-center gap-3 mb-4">
                        <FiInfo size={22} />
                        <h2 className="text-xl font-semibold">{t("about")}</h2>
                    </div>

                    <div className="space-y-2">
                        <p>Version: 1.0.0</p>
                        <p>Voice-powered inventory management system.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}