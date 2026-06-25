import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Send, Building, Mail, User, ShieldCheck, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useThemeStore } from "../store/themeStore";
import Navbar from "../components/Navbar";

export default function Piloto() {
  const { darkMode } = useThemeStore();
  // CORREGIDO: "201-500" coincide con el Literal del backend. "100-500" era rechazado.
  const [formData, setFormData] = useState({ nombre: "", empresa: "", email: "", volumen: "201-500", aceptado: false });
  const [status, setStatus] = useState("idle"); 
  const [errorMessage, setErrorMessage] = useState(null); // NUEVO: Estado para manejo visual de errores

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.aceptado) return;
    
    setStatus("loading");
    setErrorMessage(null); // Resetear error previo

    try {
      // Resolución dinámica de entorno
      const backendUrl = window.location.hostname === "localhost" 
        ? "http://localhost:5001/api/leads"
        : `${window.location.protocol}//${window.location.hostname.replace("5173", "5001")}/api/leads`;

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          empresa: formData.empresa,
          email: formData.email,
          volumen: formData.volumen
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // DECODIFICADOR AVANZADO DE ERRORES (Pydantic 422 vs HTTPException 400)
        if (Array.isArray(data.detail)) {
          const validationError = data.detail[0];
          const campo = validationError.loc[validationError.loc.length - 1];
          throw new Error(`Error en el campo '${campo}': ${validationError.msg}`);
        } else {
          throw new Error(data.detail || "Error interno del servidor.");
        }
      }

      setStatus("success");
      
    } catch (error) {
      setErrorMessage(error.message);
      setStatus("idle");
    }
  };

  return (
    <main className={`min-h-screen w-full font-sans antialiased pb-20 transition-colors duration-300 ${
      darkMode ? 'bg-slate-900 text-slate-50' : 'bg-slate-50 text-slate-900'
    }`}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* COLUMNA IZQUIERDA */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 font-bold text-sm border border-blue-500/20 mb-6">
            <Rocket size={16} /> Programa Early Adopter
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Construye el futuro de la logística con nosotros.
          </h1>
          <p className={`text-lg mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Buscamos 10 empresas innovadoras para probar nuestro WMS por voz en entornos reales. A cambio, obtendrás acceso gratuito de por vida al plan Industrial.
          </p>

          <ul className="space-y-4">
            {[
              "Acceso anticipado a IA de última generación.",
              "Línea directa con nuestro equipo de ingeniería.",
              "Adaptación del modelo de voz a tu jerga interna.",
              "Soporte prioritario y despliegue asistido."
            ].map((beneficio, i) => (
              <li key={i} className="flex items-start gap-3">
                <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={20} />
                <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{beneficio}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* COLUMNA DERECHA */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
          }`}
        >
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center text-center h-full py-12">
              <CheckCircle className="text-emerald-500 mb-4" size={64} />
              <h3 className="text-2xl font-bold mb-2">¡Solicitud Recibida!</h3>
              <p className={darkMode ? 'text-slate-400' : 'text-slate-600'}>
                Nuestro equipo de ingeniería revisará tu perfil y te contactará en menos de 24 horas para iniciar el despliegue.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <h3 className="text-2xl font-bold mb-2">Solicitar Acceso BETA</h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold opacity-80">Nombre del Responsable</label>
                <div className={`flex items-center border rounded-xl px-3 transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-700 focus-within:border-blue-500' : 'bg-slate-50 border-slate-300 focus-within:border-blue-500'}`}>
                  <User size={18} className="text-slate-400 shrink-0" />
                  <input type="text" required value={formData.nombre} onChange={(e)=>setFormData({...formData, nombre: e.target.value})} className="w-full bg-transparent border-none outline-none p-3" placeholder="Ej. Carlos Mendoza" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold opacity-80">Empresa / Organización</label>
                <div className={`flex items-center border rounded-xl px-3 transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-700 focus-within:border-blue-500' : 'bg-slate-50 border-slate-300 focus-within:border-blue-500'}`}>
                  <Building size={18} className="text-slate-400 shrink-0" />
                  <input type="text" required value={formData.empresa} onChange={(e)=>setFormData({...formData, empresa: e.target.value})} className="w-full bg-transparent border-none outline-none p-3" placeholder="Logística S.A." />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold opacity-80">Correo Corporativo</label>
                <div className={`flex items-center border rounded-xl px-3 transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-700 focus-within:border-blue-500' : 'bg-slate-50 border-slate-300 focus-within:border-blue-500'}`}>
                  <Mail size={18} className="text-slate-400 shrink-0" />
                  <input type="email" required value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-transparent border-none outline-none p-3" placeholder="carlos@empresa.com" />
                </div>
              </div>

              <div className="flex items-start gap-3 mt-2 mb-2">
                <input type="checkbox" id="legal" required checked={formData.aceptado} onChange={(e)=>setFormData({...formData, aceptado: e.target.checked})} className="mt-1" />
                <label htmlFor="legal" className="text-xs opacity-70 leading-relaxed cursor-pointer">
                  Acepto ceder estos datos para ser contactado con fines técnicos y comerciales en relación al proyecto VoxStock.
                </label>
              </div>

              {/* NUEVO: MANEJO DE ERROR VISUAL (INLINE) */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-pulse">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={status === "loading" || !formData.aceptado}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> Enviar Solicitud</>}
              </button>
            </form>
          )}
        </motion.div>

      </div>
    </main>
  );
}