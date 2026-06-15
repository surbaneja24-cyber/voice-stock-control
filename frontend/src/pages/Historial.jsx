// ==============================================================================
// ARCHIVO: frontend/src/pages/Historial.jsx
// RESPONSABLE: Gabriel
// PROPÓSITO: Tabla de registro histórico de entradas y salidas de stock.
// ==============================================================================
import { useNavigate } from "react-router-dom";

export default function Historial() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <span className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
          Zona de Gabriel
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">
          Historial de Movimientos
        </h1>
        <p className="text-lg text-slate-500 mb-8">
          Este componente está enlazado correctamente al enrutador. Gabriel, puedes borrar este texto y empezar a diseñar tu tabla de transacciones logísticas aquí sin tocar el código de la IA.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}