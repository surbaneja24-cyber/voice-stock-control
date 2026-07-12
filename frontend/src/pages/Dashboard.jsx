import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHistoryStore } from "../store/historyStore";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore"; 
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend
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
  
  // REFACTOR: División de flujo para gráfico de áreas
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
          Entradas: mov.action === "suma" ? Number(mov.quantity || 0) : 0,
          Salidas: mov.action === "resta" ? Number(mov.quantity || 0) : 0,
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

  const cardClass = `p-6 rounded-3xl border shadow-xl transition-all duration-300 ${
    darkMode ? 'bg-[#151C2C] border-slate-800/50 text-white' : 'bg-white border-slate-200 text-slate-900'
  }`;

  return (
    <div className={`min-h-screen p-4 sm:p-8 ${darkMode ? 'bg-[#0B1120]' : 'bg-slate-50'}`}>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Analitica de Inventario
          </h1>
          <p className={`mt-2 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Supervisión en tiempo real — Operario: <span className={darkMode ? 'text-blue-400' : 'text-blue-600'}>{usuario?.nombre || "N/A"}</span>
          </p>
        </div>
        {cargando && (
          <span className="flex h-4 w-4 relative mb-2 sm:mb-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
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
            <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{kpi.label}</p>
            <h2 className="text-4xl font-extrabold mt-3 tracking-tight">
              {cargando && movimientos.length === 0 ? "-" : kpi.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8">
        
        {/* GRÁFICO 1: ÁREA DE FLUJO DOBLE */}
        <div className={cardClass}>
          <h2 className="text-xl font-bold tracking-tight mb-6">Volumen por transacción</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {movimientos.length > 0 ? (
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={darkMode ? "#10b981" : "#059669"} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={darkMode ? "#10b981" : "#059669"} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSalidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={darkMode ? "#ef4444" : "#dc2626"} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={darkMode ? "#ef4444" : "#dc2626"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#1e293b" : "#e2e8f0"} />
                  <XAxis dataKey="etiqueta" stroke={darkMode ? "#64748b" : "#94a3b8"} fontSize={11} tickMargin={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={darkMode ? "#64748b" : "#94a3b8"} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}u`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                    itemStyle={{ fontWeight: 'bold' }}
                    labelStyle={{ color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '8px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: darkMode ? '#94a3b8' : '#475569' }}/>
                  <Area type="monotone" dataKey="Entradas" stroke={darkMode ? "#10b981" : "#059669"} strokeWidth={3} fillOpacity={1} fill="url(#colorEntradas)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="Salidas" stroke={darkMode ? "#ef4444" : "#dc2626"} strokeWidth={3} fillOpacity={1} fill="url(#colorSalidas)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              ) : (
                <div className={`flex h-full items-center justify-center font-medium ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
                  {cargando ? "Cargando métricas de flujo..." : "Inventario sin movimientos."}
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 2: DONUT CHART CON KPI CENTRAL */}
        <div className={cardClass}>
          <h2 className="text-xl font-bold tracking-tight mb-6">Proporción de Flujo</h2>
          <div className="relative w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {movimientos.length > 0 ? (
                <PieChart>
                  <Pie 
                    data={categoryData} 
                    cx="50%" 
                    cy="45%" 
                    innerRadius={80} 
                    outerRadius={110} 
                    dataKey="value" 
                    nameKey="name" 
                    paddingAngle={3}
                    cornerRadius={6}
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              ) : (
                 <div className={`flex h-full items-center justify-center font-medium ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
                   {cargando ? "Calculando proporciones..." : "Inventario sin movimientos."}
                 </div>
              )}
            </ResponsiveContainer>
            
            {/* Capa Absoluta para el KPI Central del Donut */}
            {movimientos.length > 0 && !cargando && (
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                <span className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {operacionesRegistradas}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Operaciones
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-xl font-bold tracking-tight mb-6">Registro de transacciones recientes</h2>
        <div className="space-y-4">
          {cargando && movimientos.length === 0 ? (
             <p className={`animate-pulse font-medium ${darkMode ? "text-slate-600" : "text-slate-400"}`}>Sincronizando con el clúster de base de datos...</p>
          ) : movimientos.length === 0 ? (
            <p className={`font-medium ${darkMode ? "text-slate-600" : "text-slate-400"}`}>Base de datos limpia. Aún no se han registrado comandos.</p>
          ) : (
            [...movimientos].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).slice(-6).reverse().map((item, index) => (
              <div key={index} className={`flex justify-between items-center pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'} last:border-0 last:pb-0`}>
                <div>
                  <p className={`font-bold text-base ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.product}</p>
                  <p className={`text-xs mt-1 font-medium ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>{item.user}</span> • {item.dateTime ? new Date(item.dateTime).toLocaleString() : 'N/A'} • Motor: <span className="uppercase">{item.method}</span>
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-black tracking-wide flex items-center gap-2 flex-shrink-0 ml-2 shadow-sm ${
                  item.action === 'suma' 
                    ? (darkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                    : (darkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-200')
                }`}>
                  <span>{item.action === 'suma' ? '+' : '-'}{item.quantity}</span>
                  <span className="uppercase text-[10px] opacity-70 font-bold">{item.unit || 'UD'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}