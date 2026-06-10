import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const TAG_STYLES = {
  TOP: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  NUEVO: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
};

// 1. Mantenemos Badge arriba del todo para que esté disponible siempre
const Badge = ({ tag }) => (
  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TAG_STYLES[tag]}`}>
    {tag}
  </span>
);

// 2. DropdownItem ahora puede ver a Badge sin errores
const DropdownItem = ({ label, to, icon: Icon, tag, onClose }) => (
  <Link
    to={to}
    role="menuitem"
    onClick={onClose}
    className="flex items-center gap-4 px-4 py-5 rounded-2xl hover:bg-white/6 transition-all group focus:outline-none"
  >
    <span className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-500/12 border border-indigo-500/25 group-hover:bg-indigo-500/20 transition-colors">
      <Icon size={20} className="text-indigo-400" />
    </span>
    <span className="text-base text-zinc-200 font-medium flex-1">
      {label}
    </span>
    {tag && <Badge tag={tag} />}
  </Link>
);

const Dropdown = ({ label, data, footer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && close();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative py-4"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={close}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
      >
        {label}
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 z-50 rounded-3xl border border-white/10 p-12 min-w-[800px] min-h-[500px] shadow-2xl flex flex-col justify-between"
            style={{ background: "#0f1117" }}
          >
            <div className="grid gap-12" style={{ gridTemplateColumns: "1fr 1px 1fr" }}>
              {data.map((seccion, i) => (
                <React.Fragment key={seccion.titulo}>
                  {i === 1 && <div style={{ background: "rgba(255,255,255,0.1)" }} />}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400/80 mb-6 px-4">
                      {seccion.titulo}
                    </p>
                    {seccion.items.map((item) => (
                      <DropdownItem key={item.to} {...item} onClose={close} />
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </div>

            {footer && (
              <div className="mt-12 pt-8 border-t border-white/10">
                {footer}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;