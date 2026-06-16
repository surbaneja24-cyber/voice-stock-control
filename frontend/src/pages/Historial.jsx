import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect } from "react";
import { useHistoryStore } from "../store/historyStore";

export default function Historial() {
  const movimientos = useHistoryStore(
    (state) => state.movimientos
  );

  const setMovimientos = useHistoryStore(
    (state) => state.setMovimientos
  );

  useEffect(() => {
    fetch(
      "https://congenial-broccoli-4jpjxpqj5jpg3jwqv-5001.app.github.dev/api/history"
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos recibidos:", data);
        setMovimientos(data);
      })
      .catch((err) => console.error(err));
  }, [setMovimientos]);

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(movimientos);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "History");

    XLSX.writeFile(wb, "stock-history.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [["Date/Time", "User", "Action", "Product", "Quantity", "Method"]],
      body: movimientos.map((m) => [
        m.dateTime,
        m.user,
        m.action,
        m.product,
        m.quantity,
        m.method,
      ]),
    });

    doc.save("stock-history.pdf");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Historial de movimientos de inventario
          </h1>

          <p className="text-slate-500">
            Revisar las transacciones de inventario y exportar informes.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={exportPDF}
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold
            hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]
            transition-all duration-300"
          >
            Exportar PDF
          </button>

          <button
            onClick={exportExcel}
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold
            hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]
            transition-all duration-300"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-5 text-left">Fecha y hora</th>
              <th className="p-5 text-left">Usuario</th>
              <th className="p-5 text-left">Acción</th>
              <th className="p-5 text-left">Producto</th>
              <th className="p-5 text-left">Cantidad</th>
              <th className="p-5 text-left">Método</th>
            </tr>
          </thead>

          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-10 text-zinc-500"
                >
                  Aún no se han registrado movimientos.
                </td>
              </tr>
            ) : (
              movimientos.map((m, i) => (
                <tr
                  key={i}
                  className="border-t border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="p-5">{m.dateTime}</td>
                  <td className="p-5">{m.user}</td>

                  <td className="p-5">
                    <span className="px-3 py-1 rounded-full text-sm bg-slate-100 text-slate-700">
                      {m.action}
                    </span>
                  </td>

                  <td className="p-5">{m.product}</td>
                  <td className="p-5">{m.quantity}</td>
                  <td className="p-5">{m.method}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}