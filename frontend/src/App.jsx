import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Terminal from "./pages/Terminal";
import Historial from "./pages/Historial";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/voice" element={<Terminal />} />
        <Route path="/history" element={<Historial />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}