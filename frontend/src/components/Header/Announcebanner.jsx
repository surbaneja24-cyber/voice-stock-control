// src/components/Header/AnnounceBanner.jsx
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const AnnounceBanner = () => {
  return (
    <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-6 py-2 flex items-center justify-center gap-3">

      {/* Badge */}
      <span className="text-[10px] font-semibold tracking-wider text-indigo-300 bg-indigo-500/25 px-2 py-0.5 rounded-full">
        NUEVO
      </span>

      {/* Texto */}
      <span className="text-xs text-zinc-400">
        Comandos de voz con{" "}
        <span className="text-indigo-300 font-medium">IA en tiempo real</span>{" "}
        ya disponibles
      </span>

      {/* Link */}
      <Link
        to="/novedades"
        className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors group"
      >
        Ver novedades
        <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
      </Link>

    </div>
  );
};

export default AnnounceBanner;