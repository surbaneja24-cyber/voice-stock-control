// src/components/Header/ActionButtons.jsx
import { Link } from "react-router-dom";

const ActionButtons = () => {
  return (
    <div className="flex items-center gap-2">

      {/* Inicia sesión — ghost */}
      <Link
        to="/login"
        className="px-3.5 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
      >
        Inicia sesión
      </Link>

      {/* Separador */}
      <div className="w-px h-4 bg-white/10 mx-1" aria-hidden="true" />

      {/* Reserva demo — outline */}
      <Link
        to="/demo"
        className="px-3.5 py-1.5 text-sm text-zinc-200 border border-white/15 rounded-lg hover:bg-white/7 hover:border-white/25 transition-all"
      >
        Reserva demo
      </Link>

      {/* Prueba gratis — filled */}
      <Link
        to="/registro"
        className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-400 rounded-lg transition-colors"
      >
        Prueba gratis
      </Link>

    </div>
  );
};

export default ActionButtons;