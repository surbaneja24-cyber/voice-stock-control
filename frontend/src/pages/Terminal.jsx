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
    transcripcion: "Pulsa el microfono para hablar...",
    mensaje: "Esperando comando de voz...",
    estado: "idle" 
  });

  // NUEVOS ESTADOS PARA MÓVIL Y BLOQUEO DE RÁFAGAS
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

  // VIGILANTE DE TRANSCRIPCIÓN (Voz)
  useEffect(() => {
    if (transcript && !isProcessing) {
      procesarComandoIA(transcript);
    }
  }, [transcript]);

  // MANEJADOR DE TEXTO MANUAL (Alternativa iOS)
  const handleSubmitTexto = (e) => {
    e.preventDefault();
    if (textoManual.trim() && !isProcessing) {
      procesarComandoIA(textoManual);
      setTextoManual("");
    }
  };

  const procesarComandoIA = async (textoComando) => {
    if (isProcessing) return; // Evita peticiones duplicadas
    setIsProcessing(true);

    setRespuestaIA({ 
      transcripcion: textoComando, 
      mensaje: "Procesando intención con IA...", 
      estado: "idle" 
    });

    try {
      const respuesta = await fetch(`${baseApiUrl}/api/procesar-comando`, { 
        method: "POST", 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comando: textoComando,
          sector: sectorActivo
        }) 
      });
      
      const datos = await respuesta.json();

      if (respuesta.ok) {
        setRespuestaIA({ 
          transcripcion: textoComando, 
          mensaje: datos.mensaje, 
          estado: datos.estado 
        });

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
        setRespuestaIA({ 
          transcripcion: textoComando, 
          mensaje: "Fallo del motor: " + (datos.detail || datos.error), 
          estado: "error"        
        });
      }
    } catch (error) {
      console.error("[CRITICO] Fallo de red:", error);
      setRespuestaIA({ transcripcion: "Fallo de red.", mensaje: "Error Critico: Servidor inalcanzable.", estado: "error" });
    } finally {
      setIsProcessing(false); // Libera el bloqueo
    }
  };

  // ... (El resto de handlers se mantienen igual)
  const handleApproveProducto = async (e) => { /* Igual que tu código */
    e.preventDefault();
    if (!nuevoItemNombre.trim()) return;
    const payload = { nombre: nuevoItemNombre, stock: parseInt(nuevoItemStock) || 0, sector: sectorActivo };
    try {
      const res = await fetch(`${baseApiUrl}/api/catalogo/item`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (res.ok) { setNuevoItemNombre(""); setNuevoItemStock(""); fetchCatalogo(); } else { const err = await res.json(); alert(err.detail); }
    } catch (error) { console.error("Error al añadir:", error); }
  };

  const handleEliminarProducto = async (productoId) => { /* Igual que tu código */
    if (!confirm("¿Estás seguro de eliminar este artículo de tu inventario?")) return;
    try {
      const res = await fetch(`${baseApiUrl}/api/catalogo/item/${productoId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchCatalogo();
    } catch (error) { console.error("Error al eliminar:", error); }
  };

  const handleSelectSector = (sectorId) => { /* Igual que tu código */
    setSectorActivo(sectorId);
    setMostrarModalSectores(false);
    localStorage.setItem(`voxstock_sector_${usuario?.id}`, sectorId);
    localStorage.setItem(`voxstock_onboarding_${usuario?.id}`, "done");
  };

  const ejecutarCerrarSesion = () => { /* Igual que tu código */
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
    /* CAMBIO CLAVE 1: h-[100dvh] y overflow-hidden bloquean el scroll a nivel de página */
    <div className={`h-[100dvh] w-full flex flex-col items-center pt-16 pb-4 px-4 overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* ... (MODALES SECTORES, CATALOGO, AYUDA SE MANTIENEN IGUAL QUE EN TU CÓDIGO) ... */}
      {/* (Omitidos aquí por brevedad, asume que copias tus modales exactos aquí) */}
      
      {/* CABECERA FIJA */}
      <div className="flex-shrink-0 flex flex-col items-center text-center gap-1.5 w-full max-w-2xl mb-4">
          <span className={`px-3 py-1 rounded-full border text-[10px] md:text-xs font-bold uppercase tracking-widest ${darkMode ? 'bg-blue-900/30 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
            Modo Operario: {sectorActual?.nombre.toUpperCase()}
          </span>
          <h1 className={`text-2xl md:text-4xl font-extrabold tracking-tight leading-none mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Terminal Principal</h1>
      </div>

      {/* ÁREA CENTRAL FLUIDA (La única que hace scroll si es necesario) */}
      <div className="flex-1 w-full max-w-2xl flex flex-col gap-4 overflow-y-auto custom-scrollbar px-1">
        
        <div className={`w-full p-4 rounded-2xl border shadow-lg transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="mb-3 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Orden Recibida</h3>
            <p className={`text-sm italic ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>"{respuestaIA.transcripcion}"</p>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'animate-bounce bg-yellow-500' : 'animate-pulse'} ${respuestaIA.estado === 'error' ? 'bg-red-500' : respuestaIA.estado === 'completado' ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>Estado del Sistema</h3>
          </div>
          <div className={`p-3 rounded-xl min-h-[80px] flex items-center ${respuestaIA.estado === 'error' ? (darkMode ? 'bg-red-950/30 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-700 border border-red-100') : respuestaIA.estado === 'completado' ? (darkMode ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-100') : (darkMode ? 'text-slate-400 bg-slate-800/30' : 'text-slate-500 bg-slate-100')}`}>
            <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap w-full text-center">{isProcessing ? "Comunicando con la base de datos..." : (respuestaIA.mensaje || "Esperando instrucciones...")}</p>
          </div>
        </div>

      </div>

      {/* ÁREA DE CONTROL INFERIOR (MICRÓFONO/TECLADO FIJO EN LA BASE) */}
      <div className="flex-shrink-0 w-full max-w-2xl flex flex-col items-center gap-4 mt-2 pb-safe">
        
        {/* ZONA DE INPUT (Micrófono o Texto) */}
        <div className="w-full flex justify-center relative">
          
          {modoTexto ? (
            <form onSubmit={handleSubmitTexto} className="w-full max-w-md flex gap-2">
              <input 
                type="text" 
                value={textoManual}
                onChange={(e) => setTextoManual(e.target.value)}
                placeholder="Ej: Sumar 5 de material..."
                className={`flex-1 px-4 py-3 rounded-xl text-base border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isProcessing}
                autoFocus
              />
              <button type="submit" disabled={isProcessing || !textoManual.trim()} className={`p-3 rounded-xl text-white transition-colors ${isProcessing || !textoManual.trim() ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}>
                <Send size={24} />
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center relative">
              {micError && <p className="text-red-500 text-xs font-bold mb-2 absolute -top-6 whitespace-nowrap">{micError}</p>}
              {isListening && <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse -z-10 w-48 h-48 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>}
              <button
                className={`w-24 h-24 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${isProcessing ? 'opacity-50 cursor-not-allowed bg-slate-300 border-slate-400' : isListening ? 'scale-95 bg-blue-600 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)]' : darkMode ? 'bg-slate-900 border-slate-700 shadow-xl hover:border-slate-600' : 'bg-white border-slate-200 shadow-xl hover:border-slate-300'}`}
                onMouseDown={isProcessing ? null : startListening} 
                onMouseUp={stopListening} 
                onMouseLeave={stopListening} 
                onTouchStart={isProcessing ? null : startListening} 
                onTouchEnd={stopListening}
                disabled={isProcessing}
              >
                <Mic size={32} strokeWidth={1.5} color={isListening ? "white" : (darkMode ? "#94a3b8" : "#64748b")} className={`transition-all ${isListening ? 'animate-bounce' : ''}`} />
              </button>
              <span className={`font-bold tracking-wider text-[10px] uppercase mt-2 ${isListening ? 'text-blue-500' : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>{isListening ? "Escuchando..." : isProcessing ? "Procesando" : "Mantener pulsado"}</span>
            </div>
          )}

          {/* BOTÓN TOGGLE TEXTO/VOZ */}
          <button 
            onClick={() => setModoTexto(!modoTexto)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 p-2.5 rounded-full border shadow-sm transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-900'}`}
            title={modoTexto ? "Cambiar a voz" : "Cambiar a texto manual"}
          >
            {modoTexto ? <Mic size={20} /> : <Keyboard size={20} />}
          </button>
        </div>

        {/* DOCK INFERIOR DE BOTONES */}
        <div className="w-full grid grid-cols-3 gap-2">
            {dockItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all active:scale-95 ${item.colorClass}`}
              >
                {item.icon}
                <span className="text-[9px] font-bold uppercase tracking-wider text-center mt-1">
                  {item.label}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}