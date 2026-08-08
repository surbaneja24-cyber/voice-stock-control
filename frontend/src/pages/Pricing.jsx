import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Building2, User, Star, ArrowRight, Loader2 } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import { useLanguageStore } from "../store/languageStore";
import { translations } from "../utils/translations";
import { getApiBaseUrl } from "../utils/apiBaseUrl";
import Navbar from "../components/Navbar";

export default function Pricing() {
  const { darkMode } = useThemeStore();
  const { language } = useLanguageStore();
  
  // Obtener traducciones correspondientes en tiempo real en cada renderizado
  const t = translations[language]?.pricing || translations["es"].pricing;

  const [backendPlans, setBackendPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFallback, setIsFallback] = useState(false);

  const iconMap = {
    user: <User className="text-slate-400" size={24} />,
    star: <Star className="text-blue-500" size={24} />,
    building: <Building2 className="text-purple-500" size={24} />
  };

  const iconTypes = ["user", "star", "building"];

  useEffect(() => {
    const backendUrl = `${getApiBaseUrl()}/api/registro`;

    fetch(backendUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Fallo al obtener la matriz de precios del servidor.");
        return res.json();
      })
      .then((data) => {
        setBackendPlans(data);
        setIsFallback(false);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Backend inalcanzable. Usando matriz de precios de respaldo.", err);
        setIsFallback(true);
        setLoading(false);
      });
  }, []); // El fetch solo se hace UNA VEZ al montar el componente

  // Construcción dinámica de la lista de planes a mostrar
  // Si el backend falló, mapeamos DIRECTAMENTE los datos de translations.js que cambian con "language"
  const displayPlans = isFallback
    ? t.plansData.map((plan, index) => ({
        ...plan,
        popular: index === 1,
        icon_type: iconTypes[index]
      }))
    : backendPlans;

  return (
    <main className={`min-h-screen w-full font-sans antialiased pb-20 transition-colors duration-300 ${
      darkMode ? 'bg-slate-900 text-slate-50' : 'bg-slate-50 text-slate-900'
    }`}>
      
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-32 flex flex-col items-center">
        
        {/* ENCABEZADO */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            {t.title}<span className="text-blue-500">Stock</span>
          </h1>
          <p className={`text-xl max-w-2xl mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {t.subtitle}
          </p>
        </div>

        {/* MANEJO DE ESTADO: CARGANDO */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p className="text-sm opacity-70">{t.loading}</p>
          </div>
        )}

        {/* MANEJO DE ESTADO: ERROR DE CONEXIÓN */}
        {error && (
          <div className="p-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-center max-w-md my-10">
            <p className="text-red-500 font-bold mb-2">{t.connError}</p>
            <p className="text-sm opacity-80">{error}</p>
          </div>
        )}

        {/* RENDERIZADO DINÁMICO DE PLANES */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {displayPlans.map((plan, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${
                  plan.popular 
                    ? (darkMode ? 'bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-500/20' : 'bg-white border-blue-500 shadow-xl')
                    : (darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200 shadow-sm')
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Zap size={14} fill="white" /> {t.recommended}
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                    darkMode ? 'bg-slate-900' : 'bg-slate-100'
                  }`}>
                    {iconMap[plan.icon_type] || <User />}
                  </div>                  
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-black">{plan.price}</span>
                    {plan.period && <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>{plan.period}</span>}
                  </div>
                  <p className={`mt-4 text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex-grow">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-medium">
                        <Check className="text-blue-500 shrink-0" size={18} />
                        <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                  plan.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                    : (darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800')
                }`}>
                  {plan.buttonText}
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <p className="mt-12 text-sm text-slate-500 text-center max-w-xl">
          {t.customNotice}
        </p>

      </div>
    </main>
  );
}