import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Terminal from "./pages/Terminal";

// Las comentamos temporalmente hasta que se creen los archivos físicos
// import Privacy from "./pages/Privacy";
// import Terms from "./pages/Terms";
// import Cookies from "./pages/Cookies";
// import Dashboard from "./pages/Dashboard";
// import Historial from "./pages/Historial";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Routes>
        {/* Rutas Operativas (Las que sí existen) */}
        <Route path="/" element={<Home />} />
        <Route path="/voice" element={<Terminal />} />
        
        {/* Rutas en Construcción (Descomentar cuando Marc/Gabriel suban sus archivos) */}
        {/* <Route path="/privacy" element={<Privacy />} /> */}
        {/* <Route path="/terms" element={<Terms />} /> */}
        {/* <Route path="/cookies" element={<Cookies />} /> */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        {/* <Route path="/history" element={<Historial />} /> */}
      </Routes>
    </div>
  );
}