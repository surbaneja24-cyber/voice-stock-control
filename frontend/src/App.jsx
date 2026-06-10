import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layouts from "./Layouts/Layouts"; 
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GestionStockPage from "./pages/GestionStock/GestionStockPage";
// IMPORTANTE: Debes importar la página, no el componente del chat
import ComandosVoz from "./pages/ComandosVoz/ComandosVoz"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layouts />}>
          {/* Ruta raíz */}
          <Route index element={<Home />} />
          
          {/* Rutas internas */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventario" element={<GestionStockPage />} />
          <Route path="comandos-voz" element={<ComandosVoz />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;