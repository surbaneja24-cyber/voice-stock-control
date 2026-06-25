import { motion } from "framer-motion";
import { Server, Cpu, LayoutTemplate, GitBranch, Globe, Code2, GraduationCap } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import Navbar from "../components/Navbar";

export default function Equipo() {
    const { darkMode } = useThemeStore();

    const team = [
        {
            name: "Marc Dominguez",
            role: "Backend & Database Architect",
            focus: "Modelado de datos, concurrencia en FastAPI y orquestación general del motor.",
            icon: <Server className="text-emerald-500" size={28} />,
            color: "emerald"
        },
        {
            name: "Santiago Urbaneja",
            role: "Voice API & Auth Integrator",
            focus: "Implementación del modelo neuronal Whisper, seguridad JWT y lógica de inferencia.",
            icon: <Cpu className="text-blue-500" size={28} />,
            color: "blue"
        },
        {
            name: "Gabriel Mendez",
            role: "Frontend & QA Engineer",
            focus: "Experiencia de usuario (React), flujos de estado y pruebas de integración (Testing).",
            icon: <LayoutTemplate className="text-amber-500" size={28} />,
            color: "amber"
        }
    ];

    const mentors = ["Horacio Rodríguez", "Angel Ponte", "Alejandro De Yavorsky"];

    return (
        <main className={`min-h-screen w-full font-sans antialiased pb-24 transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-50' : 'bg-slate-50 text-slate-900'
            }`}>
            <Navbar />

            <div className="max-w-6xl mx-auto px-6 pt-32 flex flex-col gap-16">

                {/* ENCABEZADO */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-bold text-sm border border-blue-500/20 mb-6">
                        <Code2 size={16} /> Equipo de VoxStock
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                        El motor detrás de la voz.
                    </h1>
                    <p className={`text-lg md:text-xl ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        VoxStock no es magia; es infraestructura pura. Conoce a los ingenieros responsables de traducir ondas sonoras en persistencia de datos.
                    </p>
                </motion.div>

                {/* CORE TEAM GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {team.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15 }}
                            className={`p-8 rounded-3xl border relative overflow-hidden transition-all hover:-translate-y-2 ${darkMode ? 'bg-slate-800/40 border-slate-700 hover:border-slate-500' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                                }`}
                        >
                            <div className="mb-6 flex justify-between items-start">
                                <div className={`p-4 rounded-2xl bg-${member.color}-500/10 border border-${member.color}-500/20 inline-block`}>
                                    {member.icon}
                                </div>
                                <div className="flex gap-2">
                                    <button className={`p-2 rounded-full...`}>
                                        <GitBranch size={18} />
                                    </button>
                                    <button className={`p-2 rounded-full...`}>
                                        <Globe size={18} />
                                    </button>

                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                            <p className={`text-sm font-semibold uppercase tracking-wider mb-4 text-${member.color}-500`}>
                                {member.role}
                            </p>
                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                {member.focus}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* SECCIÓN ACADEMIA & MENTORES */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                    className={`mt-8 p-10 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-8 ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-100 border-slate-200'
                        }`}
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <GraduationCap className="text-blue-500" size={28} />
                            <h3 className="text-2xl font-bold">Orígenes & Technical Advisors</h3>
                        </div>
                        <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            La arquitectura fundamental de VoxStock fue incubada dentro del ecosistema tecnológico de <strong>4Geeks Academy</strong>.
                            Este proyecto no sería posible sin la auditoría de código, dirección arquitectónica y revisión crítica de nuestra junta de asesores.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {mentors.map((mentor, idx) => (
                                <span key={idx} className={`px-4 py-2 rounded-lg text-sm font-semibold border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700'
                                    }`}>
                                    {mentor}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="shrink-0 text-center md:text-right hidden md:block opacity-20">
                        {/* Logo decorativo sutil de 4Geeks (Placeholder iconográfico) */}
                        <Code2 size={120} />
                    </div>
                </motion.div>

            </div>
        </main >
    );
}