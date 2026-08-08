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
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className={`flex-1 transition-all duration-300 ease-in-out h-screen overflow-y-auto ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        } ml-0 p-6 pt-24 md:pt-6`}>
        <Outlet />
      </main>
    </div>
  );
}

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