import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { useHistoryStore } from "../store/historyStore";

export default function History() {
  const [movimientos, setMovimientos] = useState([]);

  // Comandos de voz guardados con Zustand
  const commands = useHistoryStore((state) => state.commands);

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
  }, []);

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
    <div className="min-h-screen bg-black text-white px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Stock Movement History
          </h1>

          <p className="text-zinc-400">
            Review inventory transactions and export reports.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={exportPDF}
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold
            hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]
            transition-all duration-300"
          >
            Export PDF
          </button>

          <button
            onClick={exportExcel}
            className="px-6 py-3 rounded-xl bg-white text-black font-semibold
            hover:scale-105 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)]
            transition-all duration-300"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* HISTORIAL DE VOZ */}

      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">
          Voice Commands
        </h2>

        {commands.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl p-6 text-zinc-500">
            No voice commands recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {commands.map((cmd) => (
              <div
                key={cmd.id}
                className="bg-zinc-900 border border-white/10 rounded-xl p-4"
              >
                <p className="text-white">{cmd.texto}</p>

                <p className="text-zinc-500 text-sm mt-2">
                  {cmd.fecha}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABLA DE MOVIMIENTOS */}

      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-5 text-left">Date / Time</th>
              <th className="p-5 text-left">User</th>
              <th className="p-5 text-left">Action</th>
              <th className="p-5 text-left">Product</th>
              <th className="p-5 text-left">Quantity</th>
              <th className="p-5 text-left">Method</th>
            </tr>
          </thead>

          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-10 text-zinc-500"
                >
                  No stock movements recorded yet.
                </td>
              </tr>
            ) : (
              movimientos.map((m, i) => (
                <tr
                  key={i}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  <td className="p-5">{m.dateTime}</td>

                  <td className="p-5">{m.user}</td>

                  <td className="p-5">
                    <span className="px-3 py-1 rounded-full text-sm bg-white/10">
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