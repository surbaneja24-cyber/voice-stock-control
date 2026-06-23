import { useEffect, useState } from "react";
import { useHistoryStore } from "../store/historyStore";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore"; // <-- NUEVO: Importación del cerebro global
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

export default function Dashboard() {
  const storeMovimientos = useHistoryStore((state) => state.movimientos);
  const setMovimientos = useHistoryStore((state) => state.setMovimientos);
  
  const darkMode = useThemeStore((state) => state.darkMode); 
  const usuario = useAuthStore((state) => state.usuario); // <-- NUEVO: Identidad del usuario

  const [cargando, setCargando] = useState(true);

  const movimientos = Array.isArray(storeMovimientos) ? storeMovimientos : [];

  const totalMovimientos = movimientos.length;
  const totalEntradas = movimientos.filter((m) => m.action === "suma").length;
  const totalSalidas = movimientos.filter((m) => m.action === "resta").length;
  
  const operacionesRegistradas = totalEntradas + totalSalidas; 
  
  const trendData = movimientos.slice(-20).map((mov) => ({
    etiqueta: mov.dateTime.split(',')[1] || "00:00", 
    cantidad: Number(mov.quantity || 0),
  }));
  
  const categoryData = [
    { name: "Entradas", value: totalEntradas },
    { name: "Salidas", value: totalSalidas },
  ];

  useEffect(() => {
    // Escudo: No ejecutar si aún no sabemos quién es el usuario
    if (!usuario?.id) return;

    let isMounted = true; 
    setCargando(true);

    // NUEVO: Inyección de seguridad por usuario
    fetch(`/api/history?usuario_id=${usuario.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Acceso denegado o error de red");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setMovimientos(data);
          } else {
            console.warn("[WARNING] El servidor devolvio un formato no valido:", data);
            setMovimientos([]); 
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("[ERROR] Fallo de conexion con el backend:", err);
        }
      })
      .finally(() => {
        if (isMounted) setCargando(false);
      });

    return () => {
      isMounted = false; 
    };
  }, [setMovimientos, usuario?.id]); // <-- Se re-ejecuta si cambia el usuario

  const COLORS = darkMode ? ["#10b981", "#ef4444"] : ["#059669", "#dc2626"];

  const cardClass = `p-6 rounded-2xl border shadow-sm transition-all duration-300 ${
    darkMode 
      ? 'bg-slate-900 border-slate-800 text-white' 
      : 'bg-white border-slate-200 text-slate-900'
  }`;

  return (
    <div className="min-h-screen p-8 transparent">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Analitica de Inventario
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Resumen de actividad para {usuario?.nombre || "Operario"}
          </p>
        </div>
        {cargando && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className={cardClass}>
          <h2 className="text-xl font-semibold mb-6">Volumen por transaccion (Ultimos 20)</h2>
          <ResponsiveContainer width="100%" height={300}>
            {movimientos.length > 0 ? (
              <LineChart data={trendData}>
                <XAxis dataKey="etiqueta" stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} />
                <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="cantidad" stroke={darkMode ? "#60a5fa" : "#2563eb"} strokeWidth={3} dot={false} />
              </LineChart>
            ) : (
              <div className={`flex h-full items-center justify-center ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                {cargando ? "Cargando datos..." : "No hay datos suficientes para graficar."}
              </div>
            )}
          </ResponsiveContainer>
        </div>

        <div className={cardClass}>
          <h2 className="text-xl font-semibold mb-6">Proporcion de Flujo</h2>
          <ResponsiveContainer width="100%" height={300}>
            {movimientos.length > 0 ? (
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} dataKey="value" nameKey="name" label>
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1e293b' : '#fff', borderRadius: '8px', border: '1px solid #334155' }} />
              </PieChart>
            ) : (
               <div className={`flex h-full items-center justify-center ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                 {cargando ? "Cargando proporciones..." : "No hay transacciones registradas."}
               </div>
            )}
          </ResponsiveContainer>
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
            movimientos.slice(-5).reverse().map((item, index) => (
              <div key={index} className={`flex justify-between items-center pb-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'} last:border-0`}>
                <div>
                  <p className="font-semibold text-base">{item.product}</p>
                  <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    {item.user} • {item.dateTime} • Motor: {item.method}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wide flex items-center gap-2 ${
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