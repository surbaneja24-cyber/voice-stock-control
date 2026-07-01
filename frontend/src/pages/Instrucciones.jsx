import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  AlertTriangle, 
  Mic, 
  CheckCircle, 
  Terminal, 
  ShieldAlert, 
  Volume2, 
  RotateCcw,
  HelpCircle,
  ArrowLeft
} from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import Navbar from "../components/Navbar";
import { useLanguageStore } from "../store/languageStore";
import { translations } from "../utils/translations";

export default function Instrucciones() {
  const { darkMode } = useThemeStore();
  const navigate = useNavigate();
  const { language } = useLanguageStore();
  
  const t = translations[language]?.manual || translations['es'].manual;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.215, 0.610, 0.355, 1] }
    }
  };

  // Mapeo de iconos para asignarlos dinámicamente según la posición de la tarjeta
  const icons = [
    <Mic size={18} />,
    <Volume2 size={18} />,
    <AlertTriangle size={18} />,
    <HelpCircle size={18} />
  ];

  return (
    <main className={`min-h-screen w-full font-sans antialiased pb-24 transition-colors duration-300 ${
      darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-6 pt-32 flex flex-col gap-12"
      >
        {/* BOTÓN REGRESAR */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/')}
          className={`inline-flex items-center gap-2 self-start text-sm font-medium transition-colors ${
            darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
          }`}
        >
          <ArrowLeft size={16} />
          {translations[language]?.login?.back || "Volver al Inicio"}
        </motion.button>

        {/* ENCABEZADO PRINCIPAL */}
        <motion.section variants={itemVariants} className="border-b pb-8 border-zinc-700/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
              {translations[language]?.navbar?.piloto || "Fase BETA Experimental"}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{t.title}</h1>
          <p className={`text-lg md:text-xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{t.subtitle}</p>
        </motion.section>

        {/* SECCIÓN 1: ADVERTENCIA CRÍTICA */}
        <motion.section variants={itemVariants} className={`p-6 rounded-2xl border flex flex-col md:flex-row gap-5 items-start ${
          darkMode ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-500 mb-2">Descargo de Responsabilidad Importante</h2>
            <p className={`text-base leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
              VoxStock se encuentra actualmente en desarrollo activo. El reconocimiento de voz neuronal y la lógica de inteligencia artificial pueden presentar fallos aleatorios. <strong>No utilice este sistema como su único método de auditoría</strong>.
            </p>
          </div>
        </motion.section>

        {/* SECCIÓN 2: ESTRUCTURA DE COMANDOS */}
        <motion.section variants={itemVariants} className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold tracking-tight inline-flex items-center gap-2">
            <Terminal size={22} className="text-blue-500" />
            Estructura Rígida de Comandos
          </h2>
          <div className={`p-6 rounded-2xl border text-center font-mono text-lg md:text-xl tracking-wide font-bold shadow-sm ${
            darkMode ? 'bg-slate-950 border-slate-800 text-blue-400' : 'bg-slate-100 border-slate-200 text-blue-600'
          }`}>
            [ ACCIÓN ] + [ CANTIDAD ] + [ NOMBRE DEL PRODUCTO ]
          </div>
        </motion.section>

        {/* SECCIÓN 3: TABLA DE EJEMPLOS */}
        <motion.section variants={itemVariants} className="flex flex-col gap-4">
          <h3 className="text-xl font-bold">Ejemplos de Transmisión Correcta</h3>
          <div className={`border rounded-2xl overflow-hidden shadow-sm ${
            darkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-white'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={darkMode ? 'bg-slate-950 border-b border-slate-800' : 'bg-slate-100 border-b border-slate-200'}>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">Objetivo Logístico</th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">Lo que debes decir</th>
                    <th className="p-4 font-bold text-sm uppercase tracking-wider">Resultado Esperado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700/20">
                  <tr>
                    <td className="p-4 font-medium">Registrar Entrada (Suma)</td>
                    <td className="p-4 italic text-blue-500">"Añade 50 unidades de Leche entera"</td>
                    <td className="p-4 text-emerald-500 font-semibold">+50 Stock</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* 🌟 SECCIÓN 4 OPTIMIZADA: BUCLE REUTILIZABLE (.map) */}
        <motion.section variants={itemVariants} className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold tracking-tight inline-flex items-center gap-2">
            <CheckCircle size={22} className="text-emerald-500" />
            {t.rulesTitle}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.rules?.map((rule, index) => (
              <RuleCard 
                key={index}
                title={rule.title}
                desc={rule.desc}
                icon={icons[index]}
                darkMode={darkMode}
              />
            ))}
          </div>
        </motion.section>

        {/* SECCIÓN 5: PROTOCOLO ANTE ERRORES */}
        <motion.section variants={itemVariants} className="flex flex-col gap-4 border-t pt-8 border-zinc-700/30">
          <h2 className="text-2xl font-bold tracking-tight inline-flex items-center gap-2">
            <RotateCcw size={22} className="text-amber-500" />
            Protocolo de Contingencia
          </h2>
          <ol className={`list-decimal list-inside flex flex-col gap-2 ml-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <li>Detenga los dictados por voz inmediatamente.</li>
            <li>Vaya al módulo del Catálogo Personalizado y use el teclado.</li>
          </ol>
        </motion.section>

      </motion.div>
    </main>
  );
}

// 🌟 COMPONENTE REUTILIZABLE (RULE CARD)
function RuleCard({ title, desc, icon, darkMode }) {
  return (
    <div className={`p-5 rounded-xl border transition-all duration-200 ${
      darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-2 font-bold mb-2 text-emerald-500">
        {icon}
        {title}
      </div>
      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {desc}
      </p>
    </div>
  );
}