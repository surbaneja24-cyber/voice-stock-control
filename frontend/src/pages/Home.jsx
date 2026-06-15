import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import DashboardPreview from "../components/DashboardPreview";
import Footer from "../components/Footer";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden font-sans">
            {/* Glow de fondo adaptado al tema claro (Tonos azules corporativos) */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-300/15 blur-[120px] rounded-full pointer-events-none"></div>

            {/* Contenedor relativo para asegurar que el contenido quede por encima del glow */}
            <div className="relative z-10 flex flex-col flex-1">
                <Navbar />
                <Hero />
                <DashboardPreview />
                <Features />
                <Footer />
            </div>
        </div>
    );
}