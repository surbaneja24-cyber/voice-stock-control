import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { getApiBaseUrl } from "../utils/apiBaseUrl";

// Orden de presentación fijo para los planes conocidos; cualquier plan nuevo
// que aparezca en la base de datos se añade al final sin romper el orden.
const ORDEN_PLANES = ["lite", "pro", "industrial"];

export default function Admin() {
  const darkMode = useThemeStore((state) => state.darkMode);
  const usuario = useAuthStore((state) => state.usuario);
  const authenticatedFetch = useAuthStore((state) => state.authenticatedFetch);
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [cargandoLeads, setCargandoLeads] = useState(true);
  const [errorLeads, setErrorLeads] = useState(false);

  const [stats, setStats] = useState(null);
  const [cargandoStats, setCargandoStats] = useState(true);
  const [errorStats, setErrorStats] = useState(false);

  useEffect(() => {
    if (!usuario?.id) {
      navigate("/login");
      return;
    }
    if (usuario.rol !== "admin") {
      navigate("/dashboard");
      return;
    }

    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flags para los fetches que arrancan justo debajo
    setCargandoLeads(true);
    setCargandoStats(true);

    const baseApiUrl = getApiBaseUrl();

    authenticatedFetch(`${baseApiUrl}/api/admin/leads`)
      .then((res) => {
        if (!res.ok) throw new Error("Fallo en la red");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setLeads(Array.isArray(data) ? data : []);
          setErrorLeads(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("[ERROR] Fallo al cargar leads:", err);
          setLeads([]);
          setErrorLeads(true);
        }
      })
      .finally(() => {
        if (isMounted) setCargandoLeads(false);
      });

    authenticatedFetch(`${baseApiUrl}/api/admin/stats`)
      .then((res) => {
        if (!res.ok) throw new Error("Fallo en la red");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setStats(data);
          setErrorStats(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("[ERROR] Fallo al cargar estadísticas:", err);
          setStats(null);
          setErrorStats(true);
        }
      })
      .finally(() => {
        if (isMounted) setCargandoStats(false);
      });

    return () => { isMounted = false; };
  }, [usuario?.id, usuario?.rol, navigate, authenticatedFetch]);

  const cardClass = `p-6 rounded-xl border transition-all duration-300 ${
    darkMode ? "bg-[#111827] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
  }`;

  const kpis = [
    { label: "Usuarios registrados", value: stats?.total_usuarios },
    { label: "Usuarios activos (7 días)", value: stats?.usuarios_activos_7d },
    { label: "Leads del piloto", value: stats?.total_leads_piloto },
  ];

  const planesOrdenados = stats?.usuarios_por_plan
    ? Object.keys(stats.usuarios_por_plan).sort((a, b) => {
        const posA = ORDEN_PLANES.indexOf(a);
        const posB = ORDEN_PLANES.indexOf(b);
        if (posA === -1 && posB === -1) return a.localeCompare(b);
        if (posA === -1) return 1;
        if (posB === -1) return -1;
        return posA - posB;
      })
    : [];

  return (
    <div className={`min-h-screen px-8 py-10 ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Panel de administración</h1>
        <p className={darkMode ? "text-slate-400" : "text-slate-500"}>
          Visión general de usuarios y solicitudes del programa piloto.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={cardClass}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              {kpi.label}
            </p>
            <h2 className="text-3xl font-mono font-bold mt-2 tracking-normal">
              {cargandoStats ? "-" : errorStats ? "—" : (kpi.value ?? 0)}
            </h2>
          </div>
        ))}
      </div>

      {!errorStats && planesOrdenados.length > 0 && (
        <div className={`${cardClass} mb-10 flex flex-wrap items-center gap-x-8 gap-y-3`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            Distribución por plan
          </p>
          {planesOrdenados.map((plan) => (
            <div key={plan} className="flex items-baseline gap-2">
              <span className="text-xl font-mono font-bold">{stats.usuarios_por_plan[plan]}</span>
              <span className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                {plan}
              </span>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Leads del programa piloto</h2>
      <div className={`rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <table className="w-full text-sm md:text-base">
          <thead className={`border-b ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
            <tr>
              <th className="p-5 text-left font-semibold">Fecha</th>
              <th className="p-5 text-left font-semibold">Nombre</th>
              <th className="p-5 text-left font-semibold">Empresa</th>
              <th className="p-5 text-left font-semibold">Email</th>
              <th className="p-5 text-left font-semibold">Volumen</th>
            </tr>
          </thead>

          <tbody>
            {cargandoLeads ? (
              <tr>
                <td colSpan="5" className={`text-center p-10 font-bold animate-pulse ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                  Cargando leads...
                </td>
              </tr>
            ) : errorLeads ? (
              <tr>
                <td colSpan="5" className={`text-center p-10 ${darkMode ? "text-red-400" : "text-red-500"}`}>
                  No se pudieron cargar los leads. Inténtalo de nuevo.
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan="5" className={`text-center p-10 ${darkMode ? "text-slate-500" : "text-zinc-500"}`}>
                  Todavía no hay solicitudes registradas.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className={`border-t transition-colors ${
                  darkMode ? "border-slate-800 hover:bg-slate-800/50" : "border-slate-100 hover:bg-slate-50"
                }`}>
                  <td className="p-5 text-slate-400">{lead.fecha_registro ? new Date(lead.fecha_registro).toLocaleString() : "N/A"}</td>
                  <td className="p-5 font-medium">{lead.nombre}</td>
                  <td className="p-5">{lead.empresa}</td>
                  <td className="p-5">{lead.email}</td>
                  <td className="p-5 text-slate-400">{lead.volumen}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
