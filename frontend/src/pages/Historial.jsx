import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect } from "react";
import { useHistoryStore } from "../store/historyStore";
import { useThemeStore } from "../store/themeStore";

export default function Historial() {
  const storeMovimientos = useHistoryStore((state) => state.movimientos);
  const setMovimientos = useHistoryStore((state) => state.setMovimientos);
  const darkMode = useThemeStore((state) => state.darkMode);

  // 🛡️ EL ESCUDO PROTECTOR
  const movimientos = Array.isArray(storeMovimientos) ? storeMovimientos : [];

  useEffect(() => {
    fetch("/api/history")
      .then((res) => res.json())
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
      });
  }, [setMovimientos]);

  const exportExcel = () => {
    // Limpiamos el JSON antes de enviarlo a Excel para que no muestre campos ocultos
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
      // Eliminada la columna "Action"
      head: [["Date/Time", "User", "Product", "Quantity", "Method"]],
      // Excluimos m.action del mapeo
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
            Revisar las transacciones de inventario y exportar informes.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={exportPDF}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
              darkMode ? 'bg-slate-800 text-white border border-slate-700 hover:bg-slate-700' : 'bg-white text-black hover:shadow-lg border border-slate-200'
            }`}
          >
            Exportar PDF
          </button>
          <button
            onClick={exportExcel}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 ${
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
              {/* Columna de Acción eliminada aquí */}
              <th className="p-5 text-left font-semibold">Producto</th>
              <th className="p-5 text-left font-semibold">Cantidad</th>
              <th className="p-5 text-left font-semibold">Método</th>
            </tr>
          </thead>

          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                {/* colSpan ajustado de 6 a 5 para no romper la geometría */}
                <td colSpan="5" className={`text-center p-10 ${darkMode ? 'text-slate-500' : 'text-zinc-500'}`}>
                  Aún no se han registrado movimientos.
                </td>
              </tr>
            ) : (
              movimientos.map((m, i) => (
                <tr key={i} className={`border-t transition-colors ${
                  darkMode ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'
                }`}>
                  <td className="p-5 text-slate-400">{m.dateTime || "N/A"}</td>
                  <td className="p-5 font-medium">{m.user || "Sistema"}</td>
                  {/* Celda de m.action eliminada aquí */}
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