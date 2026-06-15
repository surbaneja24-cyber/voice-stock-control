import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
// Las comentamos temporalmente hasta que crees los archivos
// import Features from "../components/Features";
// import DashboardPreview from "../components/DashboardPreview";
// import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Componentes que SÍ existen */}
      <Navbar />
      <Hero />
      
      {/* Componentes en construcción */}
      {/* <Features /> */}
      {/* <DashboardPreview /> */}
      {/* <Footer /> */}
    </div>
  );
}