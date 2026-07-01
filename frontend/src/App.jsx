import { useState } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { useThemeStore } from "./store/themeStore";
import { useAuthStore } from "./store/authStore";

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Terminal from "./pages/Terminal";
import Historial from "./pages/Historial";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register"; 
import Profile from "./pages/Profile/Profile";
import Instrucciones from './pages/Instrucciones';
import Settings from "./pages/Settings/Settings";
import Pricing from './pages/Pricing';
import Piloto from './pages/Piloto';
import Faq from './pages/Faq';
import Equipo from './pages/Equipo'


// COMPONENTE DE PROTECCIÓN
function ProtectedLayout() {
  const estaAutenticado = useAuthStore((state) => state.estaAutenticado);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const darkMode = useThemeStore((state) => state.darkMode);

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
        <div className="header">
        <span className="badge">Beta 1.0</span> {/* <--- Esto es nuevo */}
        <h1>VoxStock</h1>
        <p>Intelligent inventory management through voice commands</p>
      </div>

      <div className="voice-container">
        <button 
          className={`mic-button ${grabando ? 'grabando' : ''}`}
          onMouseDown={iniciarGrabacion}
          onMouseUp={detenerGrabacion}
          onMouseLeave={detenerGrabacion}
          onTouchStart={iniciarGrabacion}
          onTouchEnd={detenerGrabacion}
        >
          {/* El icono cambia de color si está grabando para dar feedback visual */}
          <Mic size={70} strokeWidth={1.5} color={grabando ? "white" : "currentColor"} />
        </button>

        <span className="status">
          {grabando ? "Escuchando... (Suelta para enviar)" : "Mantén presionado para hablar"}
        </span>
      </div>

      <div className="result-card">
        <h3>Recognized Command</h3>
        <p>{textoModal}</p>
      </div>
    </div>
  );
}

// ESTA ES LA LÍNEA QUE BORRASTE POR ERROR:
export default function App() {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS (No requieren sesión) */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/como-funciona" element={<Instrucciones />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pricing" element={<Pricing />} /> 
      <Route path="/piloto" element={<Piloto />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/equipo" element={<Equipo />} />

      {/* RUTAS PROTEGIDAS (Requieren sesión) */}
      <Route element={<ProtectedLayout />}>
        <Route path="/terminal" element={<Terminal />} />
        <Route path="/history" element={<Historial />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}