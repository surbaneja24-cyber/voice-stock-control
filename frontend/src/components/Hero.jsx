// 1. Importamos el motor de navegación
import { useNavigate } from "react-router-dom";

// 2. Eliminamos el prop 'setMostrarHome'
function Hero() {
  // 3. Inicializamos la función de ruteo
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">

      <span className="px-4 py-2 border border-zinc-700 rounded-full text-sm text-zinc-400">
        AI Powered Inventory Management
      </span>

      <h1 className="mt-8 text-5xl md:text-7xl font-bold leading-tight">
        Control Your Stock
        <br />
        Using Your Voice
      </h1>

      <p className="mt-6 text-zinc-400 text-xl max-w-3xl">
        Manage inventory faster than ever with artificial intelligence,
        voice recognition and real-time stock tracking.
      </p>

      <div className="flex gap-4 mt-10">
        <button
          // 4. Cambiamos la acción para que navegue directamente a la terminal
          onClick={() => navigate('/voice')}
          className="px-8 py-4 bg-white text-black rounded-xl font-semibold hover:scale-105 transition"
        >
          Explore Features
        </button>

        <button className="px-8 py-4 border border-zinc-700 rounded-xl hover:border-white transition">
          Watch Demo
        </button>
      </div>

    </section>
  );
}

export default Hero;