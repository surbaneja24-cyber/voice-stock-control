import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useLanguageStore } from "../store/languageStore";
import { useThemeStore } from "../store/themeStore"; 
import { translations } from "../utils/translations";
import { getApiBaseUrl } from "../utils/apiBaseUrl";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);
  const darkMode = useThemeStore((state) => state.darkMode); 
  
  const { language } = useLanguageStore();
  const t = translations[language]?.login || translations["es"].login;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. BLOQUEO SÍNCRONO: Previene el doble envío por clics ultrarrápidos
    if (loading) return; 
    
    const emailSanitizado = formData.email.trim();
    
    if (!emailSanitizado || !formData.password) {
      setError(t.errors?.required || "Por favor, completa todos los campos requeridos.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const baseApiUrl = getApiBaseUrl();

      const res = await fetch(`${baseApiUrl}/api/login`, {
        method: "POST",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
        // 2. CORRECCIÓN: Ahora sí enviamos el email sanitizado
        body: JSON.stringify({ 
          email: emailSanitizado, 
          password: formData.password 
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        
        if (Array.isArray(data.detail)) {
          const campoFallido = data.detail[0].loc[1];
          const mensajeTecnico = data.detail[0].msg;
          throw new Error(`Error en '${campoFallido}': ${mensajeTecnico}`);
        }
        
        throw new Error(data.detail || t.errors?.generic || "Credenciales inválidas.");
      }
      
      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        throw new Error(data.detail || "Credenciales incorrectas");
      }
      
      loginAction(data.usuario);
      navigate("/terminal");
      
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setError(t.errors?.unreachable || "Error: El servidor es inalcanzable.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex min-h-screen items-center justify-center p-4 py-12 transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <form 
        onSubmit={handleSubmit} 
        className={`w-full max-w-md rounded-2xl border p-8 shadow-2xl transition-all duration-300 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">
            {language === 'es' ? 'Acceso ' : 'Access '}<span className="text-blue-500">MyStock</span>
          </h2>
          <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {t.subtitle || "Introduce tus credenciales operativas"}
          </p>
        </div>
        
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm font-medium animate-pulse text-center">
            ⚠️ {error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="email" className="sr-only">{t.emailLabel || "Correo"}</label>
          <input
            id="email"
            type="email"
            placeholder={t.emailLabel || "Correo electrónico"}
            className={`w-full rounded-xl border p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-500' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'}`}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
            required
          />
        </div>

        <div className="mb-8">
          <label htmlFor="password" className="sr-only">{t.passLabel || "Contraseña"}</label>
          <input
            id="password"
            type="password"
            placeholder={t.passLabel || "Contraseña"}
            className={`w-full rounded-xl border p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${darkMode ? 'border-slate-700 bg-slate-800 text-white placeholder-slate-500' : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400'}`}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full mt-2 rounded-xl p-3.5 font-bold tracking-wide shadow-lg transition-all text-white flex items-center justify-center ${loading ? 'bg-blue-800/50 cursor-not-allowed opacity-70' : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-600/20 active:scale-[0.98]'}`}
        >
          {loading ? (
            <>
              <svg className="mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.btnLoading || "Autenticando..."}
            </>
          ) : (
            t.btnSubmit || "Entrar al Almacén"
          )}
        </button>
        
        <p className="mt-6 text-center text-sm text-slate-400">
          {language === 'es' ? '¿Nuevo operario?' : 'New operator?'} {" "}
          <Link 
            to="/register" 
            className={`font-semibold text-blue-500 transition-colors ${loading ? "pointer-events-none opacity-50" : "hover:text-blue-400 hover:underline"}`}
          >
            {language === 'es' ? 'Regístrate aquí' : 'Register here'}
          </Link>
        </p>

        <div className={`mt-6 pt-6 border-t flex justify-center ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <Link 
            to="/" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              darkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ArrowLeft size={16} />
            {language === 'es' ? 'Volver al inicio' : 'Back to home'}
          </Link>
        </div>
      </form>
    </div>
  );
}