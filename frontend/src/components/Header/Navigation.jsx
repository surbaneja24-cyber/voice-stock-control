// src/components/Header/Navigation.jsx
import { Link, useLocation } from "react-router-dom";
import Dropdown from "./Dropdown";
import { Package, Mic, Bell, BarChart2, Users, Warehouse, ScanLine, Plug, Cloud, FileDown, ArrowRight } from "lucide-react";

// Datos
const DATOS_FUNCIONALIDADES = [
  {
    titulo: "Productos",
    items: [
      { label: "Gestión de Stock", to: "/inventario", icon: Package, tag: "TOP" },
      { label: "Comandos de Voz", to: "/comandos-voz", icon: Mic },
      { label: "Alertas Inteligentes", to: "/alertas", icon: Bell },
      { label: "Reportes y Analítica", to: "/reportes", icon: BarChart2 },
      { label: "Gestión de Proveedores", to: "/proveedores", icon: Users },
    ],
  },
  {
    titulo: "Otras funcionalidades",
    items: [
      { label: "Multialmacén", to: "/almacenes", icon: Warehouse },
      { label: "Escaneo por Cámara", to: "/escaneo", icon: ScanLine, tag: "NUEVO" },
      { label: "Integración API", to: "/integraciones", icon: Plug },
      { label: "Sincronización Cloud", to: "/sincronizacion", icon: Cloud },
      { label: "Exportación de Datos", to: "/exportar", icon: FileDown },
    ],
  },
];

const DATOS_EMPRESAS = [
  {
    titulo: "Por Sector",
    items: [
      { label: "Agencias", to: "/sector/agencias", icon: Mic },
      { label: "Internet y Software", to: "/sector/software", icon: Cloud },
      { label: "Servicios profesionales", to: "/sector/servicios", icon: Users },
      { label: "Distribución", to: "/sector/distribucion", icon: Package },
      { label: "Retail", to: "/sector/retail", icon: ScanLine },
      { label: "E-commerce", to: "/sector/ecommerce", icon: FileDown },
      { label: "Construcción", to: "/sector/construccion", icon: Warehouse },
      { label: "Fabricación", to: "/sector/fabricacion", icon: Plug },
      { label: "Hostelería", to: "/sector/hosteleria", icon: Bell },
    ],
  },
  {
    titulo: "Por Tipo de Negocio",
    items: [
      { label: "Start-ups", to: "/negocio/startups", icon: BarChart2 },
      { label: "Pymes", to: "/negocio/pymes", icon: Warehouse },
      { label: "Despachos", to: "/negocio/despachos", icon: Users },
      { label: "Asociaciones", to: "/negocio/asociaciones", icon: Users },
    ],
  },
];

const NAV_LINKS = [
  { label: "Autónomos", to: "/autonomos" },
  { label: "Precios",   to: "/precios"   },
];

const NavLink = ({ label, to }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors duration-200 px-4 py-2 rounded-lg ${
        isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );
};

const Navigation = () => {
  return (
    <nav className="flex items-center gap-2" aria-label="Navegación principal">
      
    <Dropdown 
  label="Funcionalidades" 
  data={DATOS_FUNCIONALIDADES} 
  footer={
    <div className="flex items-center justify-between px-2">
      <Link to="/funcionalidades" className="text-base font-semibold text-indigo-400 hover:text-indigo-300">
        Todas las funcionalidades →
      </Link>
      <span className="text-sm text-zinc-500">10 funcionalidades disponibles</span>
    </div>
  }
/>

      {/* Dropdown Empresas */}
     <Dropdown 
  label="Empresas" 
  data={DATOS_EMPRESAS} 
  footer={
    <div className="flex items-center justify-between px-2">
      <Link to="/sectores" className="text-base font-semibold text-indigo-400 hover:text-indigo-300">
        Ver todos los sectores →
      </Link>
      <span className="text-sm text-zinc-500">Explora por sector o negocio</span>
    </div>
  }
/>

      <div className="w-px h-4 bg-white/15 mx-2" aria-hidden="true" />

      {NAV_LINKS.map(({ label, to }) => (
        <NavLink key={to} label={label} to={to} />
      ))}
    </nav>
  );
};

export default Navigation;