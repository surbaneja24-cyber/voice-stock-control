import { useState } from "react";
import { motion } from "framer-motion";
import { useThemeStore } from "../store/themeStore";
import { useLanguageStore } from "../store/languageStore";
import { translations } from "../utils/translations";
import { getApiBaseUrl } from "../utils/apiBaseUrl";
import { FiAward, FiSend, FiCheckCircle, FiLayers } from "react-icons/fi";
import Navbar from "../components/Navbar";

const VOLUMEN_KEYS = ["0-50", "51-200", "201-500", "500+"];

export default function Pilot() {
    const { darkMode } = useThemeStore();
    const { language } = useLanguageStore();
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        nombre: "",
        empresa: "",
        email: "",
        volumen: VOLUMEN_KEYS[0],
        sitio_web: "", // honeypot: campo invisible, si un bot lo rellena se descarta la petición
    });

    // Obtener traducción activa o fallback en español
    const t = translations[language]?.pilot || translations["es"].pilot;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${getApiBaseUrl()}/api/leads`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                if (Array.isArray(data.detail)) {
                    throw new Error(data.detail[0]?.msg || t.errors.generic);
                }
                // Igual que Login.jsx/Register.jsx: confiamos en el mensaje que
                // manda el backend en vez de adivinarlo por status code (un 400
                // no siempre significa "email duplicado", solo hoy da la
                // casualidad de que es el único caso que lo devuelve).
                throw new Error(data.detail || t.errors.generic);
            }

            setSubmitted(true);
        } catch (err) {
            if (err.message === "Failed to fetch") {
                setError(t.errors.unreachable);
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={`min-h-screen w-full font-sans antialiased pb-24 transition-colors duration-300 ${
            darkMode ? 'bg-slate-900 text-slate-50' : 'bg-slate-50 text-slate-900'
        }`}>
            <Navbar />

            <div className="max-w-5xl mx-auto px-6 pt-32 flex flex-col gap-12">

                {/* CABECERA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-bold text-sm border border-blue-500/20 mb-6">
                        <FiAward size={16} /> {t.badge}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        {t.title}
                    </h1>
                    <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {t.subtitle}
                    </p>
                </motion.div>

                {/* CONTENIDO PRINCIPAL */}
                <div className="grid md:grid-cols-2 gap-8 items-start mt-4">

                    {/* TARJETA DE BENEFICIOS */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`rounded-2xl border p-8 transition-colors duration-300 ${
                            darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                        }`}
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-blue-500">
                            <FiLayers size={24} />
                            {t.cardTitle}
                        </h2>

                        <ul className="space-y-4">
                            {[t.benefit1, t.benefit2, t.benefit3].map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm leading-relaxed">
                                    <FiCheckCircle size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* FORMULARIO DE REGISTRO */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`rounded-2xl border p-8 transition-colors duration-300 ${
                            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm'
                        }`}
                    >
                        <h2 className="text-xl font-bold mb-6">{t.formTitle}</h2>

                        {submitted ? (
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 gap-2"
                            >
                                <FiCheckCircle size={36} />
                                <p className="font-semibold text-sm">{t.successMsg}</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold tracking-wide uppercase opacity-70">{t.labelName}</label>
                                    <input
                                        required
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder={t.namePlaceholder}
                                        minLength={2}
                                        maxLength={100}
                                        className={`px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors disabled:opacity-60 ${
                                            darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500 placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder-slate-400'
                                        }`}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold tracking-wide uppercase opacity-70">{t.labelCompany}</label>
                                    <input
                                        required
                                        type="text"
                                        name="empresa"
                                        value={formData.empresa}
                                        onChange={handleChange}
                                        disabled={loading}
                                        minLength={2}
                                        maxLength={100}
                                        className={`px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors disabled:opacity-60 ${
                                            darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                                        }`}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold tracking-wide uppercase opacity-70">{t.labelEmail}</label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors disabled:opacity-60 ${
                                            darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                                        }`}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold tracking-wide uppercase opacity-70">{t.labelVolumen}</label>
                                    <select
                                        required
                                        name="volumen"
                                        value={formData.volumen}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className={`px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors disabled:opacity-60 ${
                                            darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                                        }`}
                                    >
                                        {VOLUMEN_KEYS.map((key) => (
                                            <option key={key} value={key}>{t.volumenOptions[key]}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Honeypot anti-spam: oculto para humanos, los bots que autorellenan
                                    formularios suelen completarlo igual. No usar display:none (algunos
                                    lectores de bots lo detectan), se posiciona fuera de pantalla. */}
                                <input
                                    type="text"
                                    name="sitio_web"
                                    value={formData.sitio_web}
                                    onChange={handleChange}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    aria-hidden="true"
                                    style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/10"
                                >
                                    <FiSend size={16} /> {loading ? t.btnLoading : t.btnSubmit}
                                </button>
                            </form>
                        )}
                    </motion.div>

                </div>

            </div>
        </main>
    );
}
