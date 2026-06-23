import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // <-- NUEVO: Escudo de concurrencia
  
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Saneamiento: Limpiamos espacios invisibles que causan errores fantasma
    const emailSanitizado = formData.email.trim();
    
    if (!emailSanitizado || !formData.password) {
      setError("Por favor, completa todos los campos requeridos.");
      return;
    }

    setError("");
    setLoading(true); // Bloqueamos el botón y la UI

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailSanitizado,
          password: formData.password
        }),
      });

      // 2. Manejo de errores controlados desde FastAPI
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Credenciales inválidas. Verifica tu correo y contraseña.");
      }
      
      const data = await res.json();
      
      loginAction(data.usuario);
      navigate("/terminal");
      
    } catch (err) {
      // 3. Manejo de fallos críticos de hardware/red
      if (err.message === "Failed to fetch") {
        setError("Error crítico: El servidor de VoxStock es inalcanzable. Verifica tu conexión.");
      } else {
        setError(err.message);
      }
    } finally {
      // Liberamos el botón siempre, incluso si falla
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900 text-white p-4">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl transition-all"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Acceso <span className="text-blue-500">VoxStock</span></h2>
          <p className="text-sm text-slate-400 mt-2">Introduce tus credenciales operativas</p>
        </div>
        
        {error && (
          <div className="mb-6 rounded-lg border border-red-900/50 bg-red-500/10 p-3 text-red-400 text-sm font-medium animate-pulse text-center">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="email" className="sr-only">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="Correo electrónico"
            className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3.5 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
            required
          />
        </div>

        <div className="mb-8">
          <label htmlFor="password" className="sr-only">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-xl border border-slate-600 bg-slate-700 p-3.5 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className={`flex w-full items-center justify-center rounded-xl p-3.5 font-bold tracking-wide transition-all ${
            loading 
              ? "bg-blue-600/50 text-slate-300 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <>
              <svg className="mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Autenticando...
            </>
          ) : (
            "Entrar al Almacén"
          )}
        </button>
        
        <p className="mt-6 text-center text-sm text-slate-400">
          ¿Nuevo operario?{" "}
          <Link 
            to="/register" 
            className={`font-semibold text-blue-400 transition-colors ${loading ? "pointer-events-none opacity-50" : "hover:text-blue-300 hover:underline"}`}
          >
            Regístrate aquí
          </Link>
        </p>
      </form>
    </div>
  );
}