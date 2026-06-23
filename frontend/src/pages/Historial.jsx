import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { useHistoryStore } from "../store/historyStore";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore"; // <-- NUEVO: Importación del usuario
import { useTranslation } from "react-i18next";

export default function Historial() {
  const storeMovimientos = useHistoryStore((state) => state.movimientos);
  const setMovimientos = useHistoryStore((state) => state.setMovimientos);
  
  const darkMode = useThemeStore((state) => state.darkMode);
  const usuario = useAuthStore((state) => state.usuario); // <-- Obtenemos la identidad real
  
  const [cargando, setCargando] = useState(true);

  // 🛡️ EL ESCUDO PROTECTOR
  const movimientos = Array.isArray(storeMovimientos) ? storeMovimientos : [];

  useEffect(() => {
    // Si no hay usuario (ej. refresco duro de F5 resolviéndose), no dispares el fetch todavía
    if (!usuario?.id) return;

    setCargando(true);
    // NUEVO: Añadimos el usuario_id a la petición para pasar la seguridad de FastAPI
    fetch(`/api/history?usuario_id=${usuario.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Fallo en la autenticación o red");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setMovimientos(data);
        } else {
          console.warn("Respuesta inválida del servidor:", data);
          setMovimientos([]);
        }
      })
      .catch((err) => {
        console.error("Error conectando al backend:", err);
        setMovimientos([]);
      })
      .finally(() => {
        setCargando(false);
      });
  }, [setMovimientos, usuario?.id]); // <-- Re-ejecuta si el usuario cambia

  const exportExcel = () => {
    const datosLimpios = movimientos.map(({ dateTime, user, product, quantity, method }) => ({
      "Fecha y Hora": dateTime,
      "Usuario": user,
      "Producto": product,
      "Cantidad": quantity,
      "Método": method
    }));
    
    const ws = XLSX.utils.json_to_sheet(datosLimpios);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    XLSX.writeFile(wb, "stock-history.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Date/Time", "User", "Product", "Quantity", "Method"]],
      body: movimientos.map((m) => [m.dateTime, m.user, m.product, m.quantity, m.method]),
    });
    doc.save("stock-history.pdf");
  };

  return (
    <div className={`min-h-screen px-8 py-10 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">Historial de movimientos</h1>
          <p className={darkMode ? "text-slate-400" : "text-slate-500"}>
            Tus transacciones de inventario, {usuario?.nombre || "Operario"}.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={exportPDF}
            disabled={cargando || movimientos.length === 0}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              cargando || movimientos.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            } ${
              darkMode ? 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700' : 'bg-white text-black hover:shadow-lg border border-slate-200'
            }`}
          >
            Exportar PDF
          </button>
          <button
            onClick={exportExcel}
            disabled={cargando || movimientos.length === 0}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              cargando || movimientos.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
            } ${
              darkMode ? 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700' : 'bg-white text-black hover:shadow-lg border border-slate-200'
            }`}
          >
            Exportar Excel
          </button>
        </div>
      </div>

      <div className={`rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <table className="w-full text-sm md:text-base">
          <thead className={`border-b ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <tr>
              <th className="p-5 text-left font-semibold">Fecha y hora</th>
              <th className="p-5 text-left font-semibold">Usuario</th>
              <th className="p-5 text-left font-semibold">Producto</th>
              <th className="p-5 text-left font-semibold">Cantidad</th>
              <th className="p-5 text-left font-semibold">Método</th>
            </tr>
          </thead>

          <tbody>
            {cargando ? (
              <tr>
                <td colSpan="5" className={`text-center p-10 font-bold animate-pulse ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  Cargando tus movimientos...
                </td>
              </tr>
            ) : movimientos.length === 0 ? (
              <tr>
                <td colSpan="5" className={`text-center p-10 ${darkMode ? 'text-slate-500' : 'text-zinc-500'}`}>
                  Aún no has registrado movimientos.
                </td>
              </tr>
            ) : (
              movimientos.map((m, i) => (
                <tr key={i} className={`border-t transition-colors ${
                  darkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'
                }`}>
                  <td className="p-5 text-slate-400">{m.dateTime || "N/A"}</td>
                  <td className="p-5 font-medium">{m.user || "Sistema"}</td>
                  <td className="p-5 font-bold">{m.product || "-"}</td>
                  <td className="p-5">{m.quantity ?? 0}</td>
                  <td className="p-5 text-slate-400">{m.method || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}