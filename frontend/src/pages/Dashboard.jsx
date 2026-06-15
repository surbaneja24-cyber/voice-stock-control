// ==============================================================================
// ARCHIVO: frontend/src/pages/Dashboard.jsx
// RESPONSABLE: Marc
// PROPÓSITO: Visualización de gráficos y métricas del inventario en tiempo real.
// ==============================================================================
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <span className="px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
          Zona de Marc
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">
          Panel de Control (Dashboard)
        </h1>
        <p className="text-lg text-slate-500 mb-8">
          Este componente está enlazado correctamente al enrutador. Marc, puedes borrar todo este texto y empezar a maquetar tus gráficos y la conexión a la base de datos aquí sin miedo a romper la Terminal de Voz.
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