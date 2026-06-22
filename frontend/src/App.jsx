import { useState } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import { useThemeStore } from "./store/themeStore";

import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Terminal from "./pages/Terminal";
import Historial from "./pages/Historial";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function ToolLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const darkMode = useThemeStore((state) => state.darkMode);

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className={`flex-1 transition-all duration-300 ease-in-out h-screen overflow-y-auto ${
        sidebarOpen ? 'md:ml-64' : 'md:ml-20'
      } ml-0 p-6`}> 
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ToolLayout />}>
        {/* CORRECCIÓN: El path debe ser /terminal para coincidir con Navbar y Dock */}
        <Route path="/terminal" element={<Terminal />} />
        <Route path="/history" element={<Historial />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* RUTA DE RESPALDO: Previene la pantalla blanca si se introduce una URL errónea */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}