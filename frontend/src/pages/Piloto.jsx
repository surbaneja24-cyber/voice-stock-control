import { useState } from "react";
import { motion } from "framer-motion";
import { useThemeStore } from "../store/themeStore";
import { useLanguageStore } from "../store/languageStore";
import { translations } from "../utils/translations";
import { FiAward, FiSend, FiCheckCircle, FiLayers } from "react-icons/fi";
import Navbar from "../components/Navbar";

export default function Pilot() {
    const { darkMode } = useThemeStore();
    const { language } = useLanguageStore();
    const [submitted, setSubmitted] = useState(false);

    // Obtener traducción activa o fallback en español
    const t = translations[language]?.pilot || translations["es"].pilot;

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
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
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold tracking-wide uppercase opacity-70">{t.labelCompany}</label>
                                    <input 
                                        required
                                        type="text" 
                                        className={`px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                                            darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                                        }`}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold tracking-wide uppercase opacity-70">{t.labelEmail}</label>
                                    <input 
                                        required
                                        type="email" 
                                        className={`px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                                            darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                                        }`}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold tracking-wide uppercase opacity-70">{t.labelWarehouse}</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder={t.placeholderWarehouse}
                                        className={`px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                                            darkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500 placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 placeholder-slate-400'
                                        }`}
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/10"
                                >
                                    <FiSend size={16} /> {t.btnSubmit}
                                </button>
                            </form>
                        )}
                    </motion.div>

                </div>

            </div>
        </main>
    );
}