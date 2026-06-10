// src/pages/GestionStock/GestionStockPage.jsx
import { Package, Mic, Bell, ScanLine, ArrowRight } from "lucide-react";

// ─── Datos ───────────────────────────────────────────────────────────────────

const STATS = [
  { num: "+2.400", label: "empresas activas" },
  { num: "98%", label: "precisión de inventario" },
  { num: "3x", label: "más rápido que Excel" },
];

const FEATURES = [
  {
    icon: Mic,
    title: "Control por voz",
    desc: 'Di "añadir 50 unidades de producto X" y listo. Sin teclear nada.',
  },
  {
    icon: Bell,
    title: "Alertas automáticas",
    desc: "Recibe avisos cuando el stock baje del mínimo que tú configures.",
  },
  {
    icon: ScanLine,
    title: "Escaneo por cámara",
    desc: "Usa la cámara para registrar entradas y salidas al instante.",
  },
];

const PRODUCTOS = [
  { nombre: "Auriculares BT Pro", stock: 142, minimo: 20, estado: "ok" },
  { nombre: "Cable USB-C 2m", stock: 18, minimo: 25, estado: "warn" },
  { nombre: "Funda iPhone 15", stock: 3, minimo: 30, estado: "danger" },
  { nombre: "Teclado mecánico", stock: 67, minimo: 10, estado: "ok" },
];

// ─── Badge de estado ──────────────────────────────────────────────────────────

const ESTADO_STYLES = {
  ok: {
    dot: "bg-green-500",
    badge: "bg-green-500/10 text-green-400",
    label: "En stock",
  },
  warn: {
    dot: "bg-amber-400",
    badge: "bg-amber-500/10 text-amber-400",
    label: "Stock bajo",
  },
  danger: {
    dot: "bg-red-500",
    badge: "bg-red-500/10   text-red-400",
    label: "Crítico",
  },
};

// ─── Sección Hero ─────────────────────────────────────────────────────────────

const HeroSection = () => (
  <section className="text-center px-6 pt-20 pb-14 border-b border-white/5">
    <span className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
      <Package size={13} />
      Gestión de Stock
    </span>

   <h1 
  className="text-4xl font-semibold tracking-tight leading-tight mb-4 max-w-2xl mx-auto"
  style={{ color: '#ffffff' }}
>
  Control total de tu{" "}
  <span style={{ color: '#818cf8' }}>inventario</span>
  <br />
  en tiempo real
</h1>

    <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed mb-8">
      Gestiona productos, movimientos y alertas de stock desde un único lugar.
      Con comandos de voz o con un clic.
    </p>

    <div className="flex items-center justify-center gap-3">
      <button className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium rounded-xl transition-colors">
        Empieza gratis
      </button>
      <button className="flex items-center gap-1.5 px-5 py-2.5 border border-white/10 text-zinc-300 hover:text-white text-sm rounded-xl transition-colors group">
        Ver demo en vivo
        <ArrowRight
          size={13}
          className="group-hover:translate-x-0.5 transition-transform"
        />
      </button>
    </div>
  </section>
);

// ─── Sección Stats ────────────────────────────────────────────────────────────

const StatsSection = () => (
  <section className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
    {STATS.map(({ num, label }) => (
      <div key={label} className="py-8 text-center">
        <p className="text-2xl font-semibold text-white mb-1">{num}</p>
        <p className="text-xs text-zinc-300">{label}</p>
      </div>
    ))}
  </section>
);

// ─── Sección Features ─────────────────────────────────────────────────────────

const FeaturesSection = () => (
  <section className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
    {FEATURES.map(({ icon: Icon, title, desc }) => (
      <div key={title} className="p-8">
        <span className="w-9 h-9 flex items-center justify-center rounded-[10px] bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <Icon size={17} className="text-indigo-400" />
        </span>
        <h3 className="text-sm font-medium text-white mb-2">{title}</h3>
        <p className="text-xs text-zinc-300 leading-relaxed">{desc}</p>
      </div>
    ))}
  </section>
);

// ─── Sección Dashboard Preview ────────────────────────────────────────────────

const DashboardPreview = () => (
  <section className="px-8 py-10">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
      Vista previa del panel
    </p>

    <div className="rounded-xl border border-white/8 overflow-hidden">
      {/* Cabecera tabla */}
      <div className="grid grid-cols-4 px-5 py-3 bg-white/[0.02] border-b border-white/6">
        {["Producto", "Stock", "Mínimo", "Estado"].map((h) => (
          <span
            key={h}
            className="text-[11px] font-medium text-zinc-300 uppercase tracking-wider"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Filas */}
      {PRODUCTOS.map(({ nombre, stock, minimo, estado }) => {
        const s = ESTADO_STYLES[estado];
        return (
          <div
            key={nombre}
            className="grid grid-cols-4 px-5 py-4 border-b border-white/4 last:border-0 items-center hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`}
              />
              <span className="text-sm text-white">{nombre}</span>
            </div>
            <span className="text-sm text-zinc-300">{stock} uds</span>
            <span className="text-sm text-zinc-300">{minimo} uds</span>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit ${s.badge}`}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </div>
  </section>
);

// ─── Página principal ─────────────────────────────────────────────────────────

const GestionStockPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0c10]">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <DashboardPreview />
    </div>
  );
};

export default GestionStockPage;
