import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header"; // Nota: si el archivo se llama Header.jsx, puedes poner solo la carpeta o el archivo
import Footer from "../components/Footer";

const Layouts = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      {/* Outlet es donde se renderizarán tus páginas (Home, Login, etc.) */}
      <main className="flex-grow pt-16 pb-16">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default Layouts; // Sin los signos de < > y sin las etiquetas