import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Children, cloneElement, useEffect, useRef, useState } from 'react';

function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize, label, darkMode }) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center justify-center rounded-full border shadow-md transition-colors cursor-pointer ${
        className || (darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800')
      }`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
      aria-label={label}
    >
      {Children.map(children, child => cloneElement(child, { isHovered, darkMode }))}
    </motion.div>
  );
}

function DockLabel({ children, className = '', ...rest }) {
  const { isHovered, darkMode } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on('change', latest => setIsVisible(latest === 1));
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-10 left-1/2 w-fit whitespace-pre rounded-md border px-3 py-1.5 text-xs shadow-lg font-semibold z-50 pointer-events-none ${
            darkMode ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-white text-slate-800'
          }`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }) {
  return <div className={`flex items-center justify-center w-full h-full ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  darkMode,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 64,
  baseItemSize = 50
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  // ELIMINADAS: Las variables height, heightRow y maxHeight que rompían el linter.
  // El componente ahora utiliza panelHeight de forma estática garantizando el anclaje.

  return (
    <motion.div
      onMouseMove={({ pageX }) => {
        isHovered.set(1);
        mouseX.set(pageX);
      }}
      onMouseLeave={() => {
        isHovered.set(0);
        mouseX.set(Infinity);
      }}
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-end w-fit gap-4 rounded-2xl border pb-2 px-4 shadow-2xl backdrop-blur-md z-[9999] ${
        darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'
      } ${className}`}
      style={{ height: panelHeight }}
      role="toolbar"
      aria-label="Application dock"
    >
      {items.map((item, index) => (
        <DockItem
          key={index}
          onClick={item.onClick}
          className={item.colorClass} 
          mouseX={mouseX}
          spring={spring}
          distance={distance}
          magnification={magnification}
          baseItemSize={baseItemSize}
          label={item.label}
          darkMode={darkMode}
        >
          <DockIcon>{item.icon}</DockIcon>
          <DockLabel>{item.label}</DockLabel>
        </DockItem>
      ))}
    </motion.div>
  );
}