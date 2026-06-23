import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";

export default function Register() {
  const [formData, setFormData] = useState({ nombre: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const darkMode = useThemeStore((state) => state.darkMode);

  // --- LÓGICA DEL MEDIDOR DE CONTRASEÑA ---
  const evaluatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, text: "Muy débil", color: "bg-slate-300 dark:bg-slate-700" };

    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1; // Contiene mayúscula
    if (/[0-9]/.test(password)) score += 1; // Contiene número
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Contiene carácter especial

    if (score <= 2) return { score, text: "Débil", color: "bg-red-500", width: "w-1/3" };
    if (score === 3 || score === 4) return { score, text: "Media", color: "bg-yellow-500", width: "w-2/3" };
    return { score, text: "Segura", color: "bg-emerald-500", width: "w-full" };
  };

  const passStrength = evaluatePasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Saneamiento de datos
    const nombreSanitizado = formData.nombre.trim();
    const emailSanitizado = formData.email.trim();

    // Validaciones estrictas
    if (!nombreSanitizado || !emailSanitizado || !formData.password) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreSanitizado,
          email: emailSanitizado,
          password: formData.password
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Error en el proceso de registro.");
      }
      
      navigate("/login");
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError("Error crítico: Servidor inalcanzable. Verifica tu conexión.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className={`flex h-screen items-center justify-center p-4 transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <form 
        onSubmit={handleSubmit} 
        className={`w-full max-w-md rounded-2xl border p-8 shadow-2xl transition-all duration-300 ${
          darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Registrar Operario</h2>
          <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Crea una credencial nueva para el acceso al WMS.
          </p>
        </div>
        
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm font-medium animate-pulse text-center">
            ⚠️ {error}
          </div>
        )}
        
        <div className="space-y-5">
          <div>
            <label htmlFor="nombre" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Nombre Completo</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej. Juan Pérez"
              className={`w-full rounded-xl border p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-500' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
              }`}
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Correo Corporativo</label>
            <input
              id="email"
              type="email"
              placeholder="operario@voxstock.com"
              className={`w-full rounded-xl border p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-500' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
              }`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Contraseña de Acceso</label>
            <input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              className={`w-full rounded-xl border p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-500' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
              }`}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
            />
            
            {/* MEDIDOR DE SEGURIDAD VISUAL */}
            {formData.password.length > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-1">
                  <span className={darkMode ? "text-slate-400" : "text-slate-500"}>Fuerza de la contraseña</span>
                  <span className={`transition-colors ${
                    passStrength.text === "Débil" ? "text-red-500" : 
                    passStrength.text === "Media" ? "text-yellow-500" : "text-emerald-500"
                  }`}>
                    {passStrength.text}
                  </span>
                </div>
                <div className={`h-1.5 w-full rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ease-out ${passStrength.color} ${passStrength.width}`}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repite la contraseña"
              className={`w-full rounded-xl border p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-500' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'
              }`}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={loading}
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full mt-8 rounded-xl p-3.5 font-bold tracking-wide shadow-lg transition-all text-white flex items-center justify-center ${
            loading 
              ? 'bg-blue-800/50 cursor-not-allowed opacity-70' 
              : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-600/20 active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <>
              <svg className="mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando cuenta...
            </>
          ) : "Confirmar Registro"}
        </button>
        
        <p className="mt-6 text-center text-sm text-slate-400">
          ¿El operario ya tiene cuenta?{" "}
          <Link 
            to="/login" 
            className={`font-semibold text-blue-500 transition-colors ${loading ? "pointer-events-none opacity-50" : "hover:text-blue-400 hover:underline"}`}
          >
            Iniciar sesión aquí
          </Link>
        </p>
      </form>
    </div>
  );
}