import { useState, useEffect, useCallback } from 'react';
import { Mic, X, BookOpen, LogOut, Trash2, Plus, Info, Keyboard, Send } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { useHistoryStore } from "../store/historyStore";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore"; 
import useVoiceCommand from "../utils/useVoiceCommand";

export default function Terminal() {
  const navigate = useNavigate();
  
  const addMovimiento = useHistoryStore((state) => state.addMovimiento);
  const darkMode = useThemeStore((state) => state.darkMode);
  const usuario = useAuthStore((state) => state.usuario); 
  const logoutAction = useAuthStore((state) => state.logout); 

  const token = localStorage.getItem("token");
  const baseApiUrl = import.meta.env.VITE_BACKEND_URL 
    || (window.location.hostname === "localhost" 
        ? "http://localhost:5001" 
        : `${window.location.protocol}//${window.location.hostname.replace("-5173", "-5001")}`);

  const getInitialSector = () => localStorage.getItem(`voxstock_sector_${usuario?.id}`) || "universal";
  const getInitialOnboarding = () => !localStorage.getItem(`voxstock_onboarding_${usuario?.id}`);

  const [sectorActivo, setSectorActivo] = useState(getInitialSector());
  const [mostrarModalSectores, setMostrarModalSectores] = useState(getInitialOnboarding());
  
  const [mostrarModalCatalogo, setMostrarModalCatalogo] = useState(false);
  const [mostrarModalAyuda, setMostrarModalAyuda] = useState(false); 
  const [listaProductos, setListaProductos] = useState([]);
  
  const [nuevoItemNombre, setNuevoItemNombre] = useState("");
  const [nuevoItemStock, setNuevoItemStock] = useState("");

  const [respuestaIA, setRespuestaIA] = useState({
    transcripcion: "Pulsa el microfono para hablar o escribe...",
    mensaje: "Esperando comando...",
    estado: "idle" 
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [modoTexto, setModoTexto] = useState(false);
  const [textoManual, setTextoManual] = useState("");

  const { transcript, isListening, error: micError, startListening, stopListening } = useVoiceCommand();

  const sectores = [
    { id: "alimentacion", nombre: "Alimentacion", icono: "[AL]" },
    { id: "ferreteria", nombre: "Ferreteria", icono: "[FE]" },
    { id: "farmacia", nombre: "Farmacia", icono: "[FA]" },
    { id: "construccion", nombre: "Construccion", icono: "[CO]" },
    { id: "textil", nombre: "Textil", icono: "[TX]" },
    { id: "electronica", nombre: "Electronica", icono: "[EL]" },
    { id: "oficina", nombre: "Oficina", icono: "[OF]" },
    { id: "logistica", nombre: "Logistica", icono: "[LO]" },
    { id: "automocion", nombre: "Automocion", icono: "[AU]" },
    { id: "jardineria", nombre: "Jardineria", icono: "[JA]" },
    { id: "universal", nombre: "Catalogo Completo", icono: "[UN]" }
  ];

  useEffect(() => {
    if (!usuario || !token) {
      navigate("/login");
    }
  }, [usuario, token, navigate]);

  const fetchCatalogo = useCallback(async () => {
    if (!usuario?.id || !token) return;
    try {
      const res = await fetch(`${baseApiUrl}/api/catalogo?sector=${sectorActivo}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.status === 401) {
        ejecutarCerrarSesion();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setListaProductos(data);
      }
    } catch (error) {
      console.error("[ERROR] No se pudo cargar el catalogo:", error);
    }
  }, [sectorActivo, usuario?.id, token, baseApiUrl]);

  useEffect(() => {
    if (!mostrarModalSectores) {
      fetchCatalogo();
    }
  }, [fetchCatalogo, mostrarModalSectores]);

  useEffect(() => {
    if (transcript && !isProcessing) {
      procesarComandoIA(transcript);
    }
  }, [transcript]);

  const handleSubmitTexto = (e) => {
    e.preventDefault();
    if (textoManual.trim() && !isProcessing) {
      procesarComandoIA(textoManual);
      setTextoManual("");
    }
  };

  const procesarComandoIA = async (textoComando) => {
    if (isProcessing) return; 
    setIsProcessing(true);

    setRespuestaIA({ transcripcion: textoComando, mensaje: "Procesando intención con IA...", estado: "idle" });

    try {
      const respuesta = await fetch(`${baseApiUrl}/api/procesar-comando`, { 
        method: "POST", 
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ comando: textoComando, sector: sectorActivo }) 
      });
      
      const datos = await respuesta.json();

      if (respuesta.ok) {
        setRespuestaIA({ transcripcion: textoComando, mensaje: datos.mensaje, estado: datos.estado });
        if (datos.estado === "completado") {
          addMovimiento({
            dateTime: new Date().toISOString(),
            user: usuario?.nombre || "Operario Anónimo", 
            action: datos.accion,
            product: datos.producto,
            quantity: datos.cantidad,
            unit: datos.unidad,
            method: modoTexto ? "Texto" : "Voz",
          });
          fetchCatalogo();
        }
      } else {
        setRespuestaIA({ transcripcion: textoComando, mensaje: "Fallo del motor: " + (datos.detail || datos.error), estado: "error" });
      }
    } catch (error) {
      setRespuestaIA({ transcripcion: "Fallo de red.", mensaje: "Error Critico: Servidor inalcanzable.", estado: "error" });
    } finally {
      setIsProcessing(false); 
    }
  };

  const handleApproveProducto = async (e) => { 
    e.preventDefault();
    if (!nuevoItemNombre.trim()) return;
    const payload = { nombre: nuevoItemNombre, stock: parseInt(nuevoItemStock) || 0, sector: sectorActivo };
    try {
      const res = await fetch(`${baseApiUrl}/api/catalogo/item`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(payload) 
      });
      if (res.ok) { setNuevoItemNombre(""); setNuevoItemStock(""); fetchCatalogo(); } 
      else { const err = await res.json(); alert(err.detail); }
    } catch (error) { console.error("Error al añadir:", error); }
  };

  const handleEliminarProducto = async (productoId) => { 
    if (!confirm("¿Estás seguro de eliminar este artículo de tu inventario?")) return;
    try {
      const res = await fetch(`${baseApiUrl}/api/catalogo/item/${productoId}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (res.ok) fetchCatalogo();
    } catch (error) { console.error("Error al eliminar:", error); }
  };

  const handleSelectSector = (sectorId) => { 
    setSectorActivo(sectorId);
    setMostrarModalSectores(false);
    localStorage.setItem(`voxstock_sector_${usuario?.id}`, sectorId);
    localStorage.setItem(`voxstock_onboarding_${usuario?.id}`, "done");
  };

  const ejecutarCerrarSesion = () => { 
    logoutAction();
    localStorage.removeItem("token"); 
    navigate('/');
  };

  const sectorActual = sectores.find(s => s.id === sectorActivo);

  const dockItems = [
    { label: 'Ver Catalogo', icon: <BookOpen size={20} />, onClick: () => setMostrarModalCatalogo(true), colorClass: darkMode ? 'text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/30 bg-emerald-900/10' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-emerald-50/50' },
    { label: `Sector: ${sectorActual?.nombre}`, icon: <span className="text-lg leading-none font-mono font-bold">{sectorActual?.icono}</span>, onClick: () => setMostrarModalSectores(true), colorClass: darkMode ? 'text-blue-400 border-blue-900/50 hover:bg-blue-900/30 bg-blue-900/10' : 'text-blue-600 border-blue-200 hover:bg-blue-50 bg-blue-50/50' },
    { label: 'Cerrar Sesión', icon: <LogOut size={20} />, onClick: ejecutarCerrarSesion, colorClass: darkMode ? 'text-red-400 border-red-900/50 hover:bg-red-900/30 bg-red-900/10' : 'text-red-600 border-red-200 hover:bg-red-50 bg-red-50/50' }
  ];

  return (
    <div className={`h-[100dvh] w-full flex flex-col items-center pt-8 sm:pt-12 pb-4 px-4 overflow-hidden ${darkMode ? 'bg-[#0B1120]' : 'bg-slate-50'}`}>
      
      {/* --- MODALES OMITIDOS PARA BREVEDAD (Conserva los tuyos exactos aquí) --- */}
      {/* ... (Pega aquí tus bloques de mostrarModalSectores, mostrarModalCatalogo y mostrarModalAyuda) ... */}

      {/* CABECERA */}
      <div className="flex-shrink-0 flex flex-col items-center text-center gap-2 w-full max-w-3xl mb-4 sm:mb-8">
          <span className={`px-4 py-1.5 rounded-full border text-[10px] sm:text-xs font-bold uppercase tracking-widest ${darkMode ? 'bg-blue-900/30 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
            Modo Operario: {sectorActual?.nombre.toUpperCase()}
          </span>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-none mt-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Terminal Principal</h1>
      </div>

      {/* ÁREA CENTRAL (Fluida, sin alturas mínimas rígidas) */}
      <div className="flex-1 w-full max-w-3xl flex flex-col justify-center gap-4 px-2 sm:px-0 min-h-0 mb-4 sm:mb-6">
        <div className={`w-full p-5 sm:p-8 rounded-3xl border shadow-xl flex flex-col justify-center transition-colors ${darkMode ? 'bg-[#151C2C] border-slate-800/50' : 'bg-white border-slate-200'}`}>
          <div className="mb-3 sm:mb-5 pb-3 sm:pb-5 border-b border-dashed border-slate-400/30 dark:border-slate-700">
            <h3 className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Última Orden Procesada</h3>
            <p className={`text-base sm:text-xl italic font-medium ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>"{respuestaIA.transcripcion}"</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isProcessing ? 'animate-bounce bg-yellow-500' : 'animate-pulse'} ${respuestaIA.estado === 'error' ? 'bg-red-500' : respuestaIA.estado === 'completado' ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
            <h3 className={`text-[10px] sm:text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Estado de Resolución</h3>
          </div>
          <div className={`p-4 sm:p-6 rounded-2xl flex items-center justify-center transition-colors duration-300 border ${respuestaIA.estado === 'error' ? (darkMode ? 'bg-red-950/20 text-red-400 border-red-900/30' : 'bg-red-50 text-red-700 border-red-100') : respuestaIA.estado === 'completado' ? (darkMode ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' : 'bg-emerald-50 text-emerald-700 border-emerald-100') : (darkMode ? 'text-slate-400 bg-[#0B1120]/50 border-transparent' : 'text-slate-600 bg-slate-50 border-transparent')}`}>
            <p className="text-sm sm:text-lg leading-relaxed font-semibold whitespace-pre-wrap text-center">
              {isProcessing ? "Estableciendo conexión con el servidor..." : (respuestaIA.mensaje || "Esperando instrucciones...")}
            </p>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTROL INFERIOR */}
      <div className="flex-shrink-0 w-full max-w-3xl flex flex-col items-center gap-4 sm:gap-6 pb-[env(safe-area-inset-bottom)]">
        
        {/* ZONA DE INPUT (Flexbox Limpio y Secuencial) */}
        <div className="w-full px-2">
          {modoTexto ? (
            <div className="w-full flex animate-in fade-in slide-in-from-bottom-2 duration-300">
              <form onSubmit={handleSubmitTexto} className="w-full flex gap-2 sm:gap-3">
                
                {/* Botón de volver a micrófono a la izquierda */}
                <button 
                  type="button"
                  onClick={() => setModoTexto(false)}
                  className={`p-3 sm:p-4 rounded-2xl border shadow-sm transition-colors flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-900'}`}
                  title="Volver a reconocimiento de voz"
                >
                  <Mic size={22} className="sm:w-6 sm:h-6"/>
                </button>
                
                <input 
                  type="text" 
                  value={textoManual}
                  onChange={(e) => setTextoManual(e.target.value)}
                  placeholder="Ej: Sumar 5 al pallet..."
                  className={`flex-1 px-4 py-3 sm:py-4 rounded-2xl text-sm sm:text-base border shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-[#151C2C] border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isProcessing}
                  autoFocus
                />
                
                <button type="submit" disabled={isProcessing || !textoManual.trim()} className={`p-3 sm:p-4 rounded-2xl text-white shadow-md transition-all flex items-center justify-center flex-shrink-0 w-[56px] sm:w-[64px] ${isProcessing || !textoManual.trim() ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'}`}>
                  <Send size={22} className="sm:w-6 sm:h-6" />
                </button>
              </form>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center relative animate-in fade-in zoom-in-95 duration-300">
              {micError && <p className="text-red-400 text-[10px] sm:text-xs font-bold mb-2 absolute -top-8 bg-red-950/80 px-3 py-1 rounded-full border border-red-900/50 z-20">{micError}</p>}
              
              <div className="flex items-center justify-center w-full relative">
                <div className="relative flex justify-center items-center">
                  {isListening && <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl animate-pulse -z-10 w-32 h-32 sm:w-48 sm:h-48"></div>}
                  <button
                    className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${isProcessing ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700' : isListening ? 'scale-95 bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.5)]' : darkMode ? 'bg-[#151C2C] border-slate-700 shadow-xl hover:border-slate-500' : 'bg-white border-slate-200 shadow-xl hover:border-slate-400'}`}
                    onMouseDown={isProcessing ? null : startListening} 
                    onMouseUp={stopListening} 
                    onMouseLeave={stopListening} 
                    onTouchStart={isProcessing ? null : startListening} 
                    onTouchEnd={stopListening}
                    disabled={isProcessing}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <Mic size={40} strokeWidth={1.5} color={isListening ? "white" : (darkMode ? "#94a3b8" : "#64748b")} className={`transition-all ${isListening ? 'animate-bounce' : ''}`} />
                  </button>
                </div>

                {/* Teclado anclado de forma segura a la derecha */}
                <button 
                  onClick={() => setModoTexto(true)}
                  className={`absolute right-4 sm:right-8 p-3 sm:p-4 rounded-full border shadow-sm transition-colors active:scale-90 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-900'}`}
                  title="Cambiar a texto manual"
                >
                  <Keyboard size={20} className="sm:w-6 sm:h-6"/>
                </button>
              </div>
              
              <span className={`font-bold tracking-widest text-[9px] sm:text-[10px] uppercase mt-3 sm:mt-4 ${isListening ? 'text-blue-500' : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>
                {isListening ? "Escuchando orden..." : isProcessing ? "Procesando en servidor" : "Mantener pulsado para hablar"}
              </span>
            </div>
          )}
        </div>

        {/* DOCK INFERIOR (Recuperado y proporcionado) */}
        <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 px-2 sm:px-0">
            {dockItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center py-3 sm:py-4 px-2 rounded-2xl border transition-all active:scale-95 shadow-md ${item.colorClass}`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="mb-1 sm:mb-2 scale-100 sm:scale-110">
                  {item.icon}
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-center leading-none">
                  {item.label}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}