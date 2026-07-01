import { motion } from "framer-motion";
import { Server, Cpu, LayoutTemplate, GitBranch, Globe, Code2, GraduationCap } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import { useLanguageStore } from "../store/languageStore";
import { translations } from "../utils/translations";
import Navbar from "../components/Navbar";

export default function Equipo() {
  const { darkMode } = useThemeStore();
  const { language } = useLanguageStore();

  // Consumir traducciones dinámicas de equipo
  const t = translations[language]?.equipo || translations["es"].equipo;

  // Mapeo fijo de iconos correlativos al orden de los miembros en la traducción
  const staticIcons = [
    { icon: <Server size={28} />, colorKey: "emerald" },
    { icon: <Cpu size={28} />, colorKey: "blue" },
    { icon: <LayoutTemplate size={28} />, colorKey: "amber" }
  ];

  // Diccionarios con strings de clases literales para evitar la interpolación rota de Tailwind
  const badgeStyles = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-500"
  };

  const textStyles = {
    emerald: "text-emerald-500",
    blue: "text-blue-500",
    amber: "text-amber-500"
  };

  const mentors = ["Horacio Rodríguez", "Angel Ponte", "Alejandro De Yavorsky"];

  return (
    <main className={`min-h-screen w-full font-sans antialiased pb-24 transition-colors duration-300 ${
      darkMode ? 'bg-slate-900 text-slate-50' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 flex flex-col gap-16">

        {/* ENCABEZADO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-bold text-sm border border-blue-500/20 mb-6">
            <Code2 size={16} /> {t.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            {t.title}
          </h1>
          <p className={`text-lg md:text-xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {t.subtitle}
          </p>
        </motion.div>

        {/* CORE TEAM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.members.map((member, index) => {
            const layout = staticIcons[index] || staticIcons[0];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className={`p-8 rounded-3xl border relative overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                  darkMode 
                    ? 'bg-slate-800/40 border-slate-700 hover:border-slate-500' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="mb-6 flex justify-between items-start">
                  <div className={`p-4 rounded-2xl border flex items-center justify-center ${badgeStyles[layout.colorKey]}`}>
                    {layout.icon}
                  </div>
                  <div className="flex gap-2">
                    <button className={`p-2 rounded-full border transition-colors ${
                      darkMode ? 'border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-slate-200' : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                    }`}>
                      <GitBranch size={18} />
                    </button>
                    <button className={`p-2 rounded-full border transition-colors ${
                      darkMode ? 'border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-slate-200' : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                    }`}>
                      <Globe size={18} />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                <p className={`text-sm font-semibold uppercase tracking-wider mb-4 ${textStyles[layout.colorKey]}`}>
                  {member.role}
                </p>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {member.focus}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* SECCIÓN ACADEMIA & MENTORES */}
        <motion.div
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.6 }}
          className={`mt-8 p-10 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-8 ${
            darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="text-blue-500" size={28} />
              <h3 className="text-2xl font-bold">{t.advisorsTitle}</h3>
            </div>
            <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t.advisorsDesc}
            </p>
            <div className="flex flex-wrap gap-3">
              {mentors.map((mentor, idx) => (
                <span key={idx} className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                }`}>
                  {mentor}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0 text-center md:text-right hidden md:block opacity-20">
            <Code2 size={120} />
          </div>
        </motion.div>

      </div>
    </main>
  );
}