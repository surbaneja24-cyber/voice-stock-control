import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import DashboardPreview from "../components/DashboardPreview";
import Footer from "../components/Footer";

function Home({ setMostrarHome }) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">

            {/* Glow de fondo */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 blur-[150px] rounded-full"></div>

            <Navbar />

            <Hero setMostrarHome={setMostrarHome} />

            <DashboardPreview />

            <Features />

            <Footer />

        </div>
    );
}

export default Home;