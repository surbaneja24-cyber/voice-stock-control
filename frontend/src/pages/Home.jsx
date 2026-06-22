import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import { useThemeStore } from "../store/themeStore"; 

export default function Home() {
  const { darkMode } = useThemeStore();

  return (
    <main className={`flex flex-col min-h-screen w-full font-sans antialiased transition-colors duration-300 ${
      darkMode ? 'bg-slate-900 text-slate-50' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* El botón de cambio de tema debe estar programado dentro del Navbar */}
      <Navbar isDarkMode={darkMode} />
      
      {/* Contenido principal */}
      <div className="flex-grow flex items-center justify-center">
        <Hero isDarkMode={darkMode} />
      </div>

    </main>
  );
}