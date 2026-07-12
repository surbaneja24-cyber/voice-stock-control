import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useHistoryStore } from "../store/historyStore";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore"; 
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid
} from "recharts";

export default function Dashboard() {
  const storeMovimientos = useHistoryStore((state) => state.movimientos);
  const setMovimientos = useHistoryStore((state) => state.setMovimientos);
  
  const darkMode = useThemeStore((state) => state.darkMode); 
  const usuario = useAuthStore((state) => state.usuario); 
  const logoutAction = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [cargando, setCargando] = useState(true);
  const [rangoTiempo, setRangoTiempo] = useState("1d");

  const movimientos = Array.isArray(storeMovimientos) ? storeMovimientos : [];

  const totalMovimientos = movimientos.length;
  const totalEntradas = movimientos.filter((m) => m.action === "suma").length;
  const totalSalidas = movimientos.filter((m) => m.action === "resta").length;
  const operacionesRegistradas = totalEntradas + totalSalidas; 
  
  // REFACTOR MASIVO: Motor de agrupación de datos (Data Binning)
  const trendData = useMemo(() => {
    const ahora = new Date().getTime();

    // 1. Filtrar transacciones fuera de rango
    const movimientosFiltrados = [...movimientos].filter((mov) => {
      if (!mov.dateTime) return false;
      const tiempoMov = new Date(mov.dateTime).getTime();
      if (rangoTiempo === "1d") return ahora - tiempoMov <= 24 * 60 * 60 * 1000;
      if (rangoTiempo === "1w") return ahora - tiempoMov <= 7 * 24 * 60 * 60 * 1000;
      if (rangoTiempo === "1m") return ahora - tiempoMov <= 30 * 24 * 60 * 60 * 1000;
      return true; // "Max"
    });

    // 2. Agrupación matemática según el tiempo seleccionado
    const agrupados = {};

    movimientosFiltrados.forEach((mov) => {
      const fechaObj = new Date(mov.dateTime);
      if (isNaN(fechaObj.getTime())) return;

      let claveEtiqueta = "";

      if (rangoTiempo === "1d") {
        // Agrupar por horas exactas (ej: "14:00")
        claveEtiqueta = `${fechaObj.getHours().toString().padStart(2, '0')}:00`;
      } else if (rangoTiempo === "1w" || rangoTiempo === "1m") {
        // Agrupar por días (ej: "12/05")
        claveEtiqueta = `${fechaObj.getDate().toString().padStart(2, '0')}/${(fechaObj.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        // Agrupar por meses (ej: "05/2026")
        claveEtiqueta = `${(fechaObj.getMonth() + 1).toString().padStart(2, '0')}/${fechaObj.getFullYear()}`;
      }

      // Si el bloque de tiempo no existe, lo creamos
      if (!agrupados[claveEtiqueta]) {
        agrupados[claveEtiqueta] = { 
          etiqueta: claveEtiqueta, 
          Entradas: 0, 
          Salidas: 0, 
          timestamp: fechaObj.getTime() // Referencia oculta para ordenar cronológicamente
        };
      }

      // Sumar al bloque correspondiente
      if (mov.action === "suma") agrupados[claveEtiqueta].Entradas += Number(mov.quantity || 0);
      if (mov.action === "resta") agrupados[claveEtiqueta].Salidas += Number(mov.quantity || 0);
    });

    // 3. Devolver array ordenado de más antiguo a más nuevo
    return Object.values(agrupados).sort((a, b) => a.timestamp - b.timestamp);
  }, [movimientos, rangoTiempo]);
  
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

  const cardClass = `p-6 rounded-xl border transition-all duration-300 ${
    darkMode ? 'bg-[#111827] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
  }`;

  const renderCustomLegend = (items) => {
    return (
      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest font-sans">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className={darkMode ? "text-slate-400" : "text-slate-600"}>{item.name}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen p-4 sm:p-8 font-sans ${darkMode ? 'bg-[#070B14]' : 'bg-slate-50'}`}>
      
      <div className="flex justify-between items-end mb-8 pb-4 border-b border-slate-200 dark:border-slate-800/60">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight uppercase ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Control Analítico de Inventario
          </h1>
          <p className={`mt-1 text-xs font-semibold tracking-wide uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Terminal de supervisión — Operario ID: <span className={darkMode ? 'text-blue-400' : 'text-blue-600 font-bold'}>{usuario?.nombre || "N/A"}</span>
          </p>
        </div>
        {cargando && (
          <span className="flex h-3 w-3 relative mb-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {[
          { label: "Movimientos totales", value: totalMovimientos },
          { label: "Entradas procesadas", value: totalEntradas },
          { label: "Salidas procesadas", value: totalSalidas },
          { label: "Transacciones IA", value: operacionesRegistradas }
        ].map((kpi, idx) => (
          <div key={idx} className={cardClass}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{kpi.label}</p>
            <h2 className="text-3xl font-mono font-bold mt-2 tracking-normal">
              {cargando && movimientos.length === 0 ? "-" : kpi.value}
            </h2>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-6 mb-8">
        
        <div className={cardClass}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Volumen por transacción</h2>
              {renderCustomLegend([
                { name: "Entradas", color: darkMode ? "#10b981" : "#059669" },
                { name: "Salidas", color: darkMode ? "#ef4444" : "#dc2626" }
              ])}
            </div>
            
            <div className={`flex p-1 rounded-lg border ${darkMode ? 'bg-[#1f2937] border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
              {['1d', '1w', '1m', 'Max'].map((rango) => (
                <button
                  key={rango}
                  onClick={() => setRangoTiempo(rango)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider ${
                    rangoTiempo === rango 
                      ? (darkMode ? 'bg-slate-600 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm') 
                      : (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
                  }`}
                >
                  {rango}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              {trendData.length > 0 ? (
                <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={darkMode ? "#10b981" : "#059669"} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={darkMode ? "#10b981" : "#059669"} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSalidas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={darkMode ? "#ef4444" : "#dc2626"} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={darkMode ? "#ef4444" : "#dc2626"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={darkMode ? "#1f2937" : "#e2e8f0"} />
                  {/* REFACTOR: minTickGap=20 previene colisiones forzando márgenes matemáticos */}
                  <XAxis dataKey="etiqueta" stroke={darkMode ? "#4b5563" : "#94a3b8"} fontSize={10} fontFamily="monospace" tickMargin={12} tickLine={false} axisLine={false} padding={{ left: 0, right: 0 }} minTickGap={20} />
                  <YAxis stroke={darkMode ? "#4b5563" : "#94a3b8"} fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', borderRadius: '6px', border: darkMode ? '1px solid #374151' : '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '12px' }} 
                    itemStyle={{ paddingVertical: '2px' }}
                    labelStyle={{ color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '6px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="Entradas" stroke={darkMode ? "#10b981" : "#059669"} strokeWidth={2} fillOpacity={1} fill="url(#colorEntradas)" isAnimationActive={true} animationDuration={400} animationEasing="ease-out" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="Salidas" stroke={darkMode ? "#ef4444" : "#dc2626"} strokeWidth={2} fillOpacity={1} fill="url(#colorSalidas)" isAnimationActive={true} animationDuration={400} animationEasing="ease-out" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </AreaChart>
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-500">
                  {cargando ? "Sincronizando flujo..." : "Sin actividad en este rango."}
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Proporción de flujo</h2>
            {renderCustomLegend([
              { name: "Entradas", color: darkMode ? "#10b981" : "#059669" },
              { name: "Salidas", color: darkMode ? "#ef4444" : "#dc2626" }
            ])}
          </div>
          <div className="relative w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              {movimientos.length > 0 ? (
                <PieChart>
                  <Pie 
                    data={categoryData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={85} 
                    outerRadius={105} 
                    dataKey="value" 
                    nameKey="name" 
                    paddingAngle={4}
                    cornerRadius={4}
                    stroke="none"
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-out"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: darkMode ? '#1f2937' : '#fff', borderRadius: '6px', border: darkMode ? '1px solid #374151' : '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '12px' }}
                  />
                </PieChart>
              ) : (
                 <div className="flex h-full items-center justify-center text-xs font-bold uppercase tracking-widest text-slate-500">
                   {cargando ? "Calculando proporciones..." : "Sin registros de actividad."}
                 </div>
              )}
            </ResponsiveContainer>
            
            {movimientos.length > 0 && !cargando && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-mono font-bold tracking-tight leading-none">
                  {operacionesRegistradas}
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                  Órdenes OK
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6">Registro de transacciones recientes</h2>
        <div className="space-y-3">
          {cargando && movimientos.length === 0 ? (
             <p className="text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">Consultando registro maestro...</p>
          ) : movimientos.length === 0 ? (
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Auditoría vacía. Servidor a la espera de comandos.</p>
          ) : (
            [...movimientos].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()).slice(-6).reverse().map((item, index) => (
              <div key={index} className={`flex justify-between items-center pb-3 border-b ${darkMode ? 'border-slate-800/60' : 'border-slate-100'} last:border-0 last:pb-0`}>
                <div>
                  <p className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-200">{item.product}</p>
                  <p className="text-[11px] mt-1 font-mono text-slate-500">
                    ID: {item.user} • {item.dateTime ? new Date(item.dateTime).toLocaleString() : 'N/A'} • SYS: {item.method.toUpperCase()}
                  </p>
                </div>
                <div className={`px-3 py-1.5 rounded text-xs font-mono font-bold tracking-wide flex items-center gap-1.5 flex-shrink-0 ml-2 ${
                  item.action === 'suma' 
                    ? (darkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                    : (darkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-200')
                }`}>
                  <span>{item.action === 'suma' ? '+' : '-'}{item.quantity}</span>
                  <span className="opacity-60 text-[10px]">{item.unit || 'UD'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}