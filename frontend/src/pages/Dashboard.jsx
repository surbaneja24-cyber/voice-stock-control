import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHistoryStore } from "../store/historyStore";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore"; 
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend
} from "recharts";

export default function Dashboard() {
  const storeMovimientos = useHistoryStore((state) => state.movimientos);
  const setMovimientos = useHistoryStore((state) => state.setMovimientos);
  
  const darkMode = useThemeStore((state) => state.darkMode); 
  const usuario = useAuthStore((state) => state.usuario); 
  const logoutAction = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);

  const movimientos = Array.isArray(storeMovimientos) ? storeMovimientos : [];

  const totalMovimientos = movimientos.length;
  const totalEntradas = movimientos.filter((m) => m.action === "suma").length;
  const totalSalidas = movimientos.filter((m) => m.action === "resta").length;
  
  const operacionesRegistradas = totalEntradas + totalSalidas; 
  
  // Memoizamos y ordenamos los datos para garantizar un gráfico cronológico
  const trendData = useMemo(() => {
    return [...movimientos]
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(-20)
      .map((mov) => {
        let horaFormateada = "00:00";
        if (mov.dateTime) {
          const fechaObj = new Date(mov.dateTime);
          if (!isNaN(fechaObj.getTime())) {
            horaFormateada = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          }
        }
        
        return {
          etiqueta: horaFormateada,
          cantidad: Number(mov.quantity || 0),
          tipo: mov.action
        };
      });
  }, [movimientos]);
  
  const categoryData = [
    { name: "Entradas", value: totalEntradas },
    { name: "Salidas", value: totalSalidas },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!usuario?.id || !token) {
      navigate("/login");
      return;
    }

    let isMounted = true; 
    setCargando(true);

    const baseApiUrl = import.meta.env.VITE_BACKEND_URL 
      || (window.location.hostname === "localhost" 
          ? "http://localhost:5001" 
          : `${window.location.protocol}//${window.location.hostname.replace("-5173", "-5001")}`);

    fetch(`${baseApiUrl}/api/history`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (res.status === 401) {
          logoutAction();
          localStorage.removeItem("token");
          navigate("/login");
          throw new Error("Sesión expirada");
        }
        if (!res.ok) throw new Error("Error de red");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setMovimientos(data);
          } else {
            console.warn("[WARNING] Formato inválido:", data);
            setMovimientos([]); 
          }
        }
      })
      .catch((err) => {
        if (isMounted) console.error("[ERROR] Fallo de conexión:", err);
      })
      .finally(() => {
        if (isMounted) setCargando(false);
      });

    return () => { isMounted = false; };
  }, [setMovimientos, usuario?.id, navigate, logoutAction]);

  const COLORS = darkMode ? ["#10b981", "#ef4444"] : ["#059669", "#dc2626"];

  const cardClass = `p-6 rounded-2xl border shadow-sm transition-all duration-300 ${
    darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
  }`;

  return (
    <div className="min-h-screen p-4 sm:p-8 transparent">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Analitica de Inventario
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Resumen de actividad para {usuario?.nombre || "Operario"}
          </p>
        </div>
        {cargando && (
          <span className="flex h-3 w-3 relative mb-2 sm:mb-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          { label: "Movimientos totales", value: totalMovimientos },
          { label: "Entradas procesadas", value: totalEntradas },
          { label: "Salidas procesadas", value: totalSalidas },
          { label: "Transacciones IA", value: operacionesRegistradas }
        ].map((kpi, idx) => (
          <div key={idx} className={cardClass}>
            <p className={darkMode ? "text-slate-400" : "text-zinc-600"}>{kpi.label}</p>
            <h2 className="text-3xl font-bold mt-2">
              {cargando && movimientos.length === 0 ? "-" : kpi.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8">
        <div className={cardClass}>
          <h2 className="text-xl font-semibold mb-6">Volumen por transaccion (Ultimos 20)</h2>
          {/* Se añade un div contenedor para aislar el width absoluto del ResponsiveContainer */}
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {movimientos.length > 0 ? (
                <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#e2e8f0"} />
                  <XAxis dataKey="etiqueta" stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} tickMargin={10} />
                  <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} tickFormatter={(value) => `${value}`} width={40} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1e293b' : '#fff', 
                      borderRadius: '8px', 
                      border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                      color: darkMode ? '#f8fafc' : '#0f172a'
                    }} 
                    itemStyle={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
                    labelStyle={{ color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="cantidad" name="Unidades" stroke={darkMode ? "#60a5fa" : "#2563eb"} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              ) : (
                <div className={`flex h-full items-center justify-center ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  {cargando ? "Cargando datos..." : "No hay datos suficientes para graficar."}
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardClass}>
          <h2 className="text-xl font-semibold mb-6">Proporcion de Flujo</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {movimientos.length > 0 ? (
                <PieChart>
                  <Pie 
                    data={categoryData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={100} 
                    dataKey="value" 
                    nameKey="name" 
                    paddingAngle={5}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1e293b' : '#fff', 
                      borderRadius: '8px', 
                      border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                      color: darkMode ? '#f8fafc' : '#0f172a'
                    }}
                    itemStyle={{ color: darkMode ? '#f8fafc' : '#0f172a' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: darkMode ? '#f8fafc' : '#0f172a' }}/>
                </PieChart>
              ) : (
                 <div className={`flex h-full items-center justify-center ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                   {cargando ? "Cargando proporciones..." : "No hay transacciones registradas."}
                 </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-xl font-semibold mb-6">Actividad reciente en tiempo real</h2>
        <div className="space-y-4">
          {cargando && movimientos.length === 0 ? (
             <p className={`animate-pulse ${darkMode ? "text-slate-500" : "text-slate-400"}`}>Sincronizando con el servidor...</p>
          ) : movimientos.length === 0 ? (
            <p className={darkMode ? "text-slate-400" : "text-zinc-600"}>Base de datos sin registros.</p>
          ) : (
            // Nos aseguramos de clonar el array antes de hacer reverse() para no mutar el estado original de Zustand accidentalmente
            [...movimientos].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).slice(-5).reverse().map((item, index) => (
              <div key={index} className={`flex justify-between items-center pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'} last:border-0`}>
                <div>
                  <p className="font-semibold text-base">{item.product}</p>
                  <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {item.user} • {item.dateTime ? new Date(item.dateTime).toLocaleString() : 'N/A'} • Motor: {item.method}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wide flex items-center gap-2 flex-shrink-0 ml-2 ${
                  item.action === 'suma' 
                    ? (darkMode ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
                    : (darkMode ? 'bg-red-950/40 text-red-400' : 'bg-red-50 text-red-700')
                }`}>
                  <span>{item.action === 'suma' ? '+' : '-'}{item.quantity}</span>
                  <span className="uppercase text-[10px] opacity-80">{item.unit || 'unidad'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}