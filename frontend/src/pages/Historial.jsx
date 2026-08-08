import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHistoryStore } from "../store/historyStore";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore";
import { getApiBaseUrl } from "../utils/apiBaseUrl";

// Mitigación de CSV/Formula Injection (OWASP): si un nombre de producto/usuario
// empieza por un carácter que Excel/LibreOffice interpretan como inicio de fórmula,
// se antepone un apóstrofo para forzar que la celda se trate como texto plano.
const sanitizarCeldaExcel = (valor) => {
  if (typeof valor !== "string") return valor;
  return /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
};

export default function Historial() {
  const storeMovimientos = useHistoryStore((state) => state.movimientos);
  const setMovimientos = useHistoryStore((state) => state.setMovimientos);
  
  const darkMode = useThemeStore((state) => state.darkMode);
  const usuario = useAuthStore((state) => state.usuario); 
  
  // INYECCIÓN DE SEGURIDAD
  const authenticatedFetch = useAuthStore((state) => state.authenticatedFetch);
  const navigate = useNavigate();
  
  const [cargando, setCargando] = useState(true);

  const movimientos = Array.isArray(storeMovimientos) ? storeMovimientos : [];

  useEffect(() => {
    // Solo validamos la memoria del perfil, la validez del token la dictará el servidor
    if (!usuario?.id) {
      navigate("/login");
      return;
    }

    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading flag para el fetch que arranca justo debajo, patrón estándar de React
    setCargando(true);

    const baseApiUrl = getApiBaseUrl();

    // REFACTOR: Uso exclusivo de authenticatedFetch. Se eliminan interceptores 401 redundantes.
    authenticatedFetch(`${baseApiUrl}/api/history`)
      .then((res) => {
        if (!res.ok) throw new Error("Fallo en la red");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setMovimientos(data);
          } else {
            console.warn("[WARNING] Respuesta inválida del historial:", data);
            setMovimientos([]);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("[ERROR] Fallo al cargar historial:", err);
          setMovimientos([]);
        }
      })
      .finally(() => {
        if (isMounted) setCargando(false);
      });
      
    return () => { isMounted = false; };
  }, [setMovimientos, usuario?.id, navigate, authenticatedFetch]); 

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    const fechaCorte = new Date().toLocaleString();
    const metadatos = [
      ["MyStock - SISTEMA DE CONTROL DE INVENTARIO"],
      [`Operador responsable: ${usuario?.nombre || 'Operario'}`],
      [`Fecha y hora de corte: ${fechaCorte}`],
      [`Total de transacciones: ${movimientos.length}`],
      []
    ];

    const datosLimpios = movimientos.map(({ dateTime, user, product, quantity, method }) => ({
      "Fecha y Hora": dateTime ? new Date(dateTime).toLocaleString() : 'N/A',
      "Usuario": sanitizarCeldaExcel(user),
      "Producto": sanitizarCeldaExcel(product),
      "Cantidad": quantity,
      "Método": sanitizarCeldaExcel(method)
    }));

    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, metadatos, { origin: "A1" });
    XLSX.utils.sheet_add_json(ws, datosLimpios, { origin: "A6" });

    ws['!cols'] = [
      { wch: 22 }, 
      { wch: 15 }, 
      { wch: 25 }, 
      { wch: 10 }, 
      { wch: 12 }  
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Auditoria");
    XLSX.writeFile(wb, `MyStock_Auditoria_${new Date().getTime()}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const fechaCorte = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text("MyStock", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text("Reporte de Auditoría de Inventario", 14, 30);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Operador: ${usuario?.nombre || 'Operario'}`, 14, 40);
    doc.text(`Fecha de corte: ${fechaCorte}`, 14, 45);
    doc.text(`Transacciones registradas: ${movimientos.length}`, 14, 50);

    autoTable(doc, {
      startY: 55,
      head: [["Fecha y Hora", "Usuario", "Producto", "Cant.", "Método"]],
      body: movimientos.map((m) => [
        m.dateTime ? new Date(m.dateTime).toLocaleString() : 'N/A', 
        m.user, 
        m.product, 
        m.quantity, 
        m.method
      ]),
      headStyles: { 
        fillColor: [37, 99, 235], 
        textColor: 255, 
        fontStyle: 'bold' 
      },
      alternateRowStyles: { 
        fillColor: [248, 250, 252]
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 3 
      },
      didDrawPage: function (data) {
        const str = "Página " + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save(`MyStock_Auditoria_${new Date().getTime()}.pdf`);
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
                  <td className="p-5 text-slate-400">{m.dateTime ? new Date(m.dateTime).toLocaleString() : "N/A"}</td>
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