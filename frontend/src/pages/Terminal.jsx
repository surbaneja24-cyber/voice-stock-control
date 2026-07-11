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
    <div className={`h-[100dvh] w-full flex flex-col items-center pt-16 pb-4 px-4 overflow-hidden ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      
      {/* REFACTOR: MODAL SECTORES (Bottom Sheet en móvil, Modal centrado en PC) */}
      {mostrarModalSectores && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
          <div className={`w-full max-w-4xl p-6 sm:p-8 rounded-t-3xl sm:rounded-2xl shadow-2xl relative animate-in slide-in-from-bottom sm:zoom-in duration-300 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] sm:pb-8 ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <div className="text-center mb-6 sm:mb-8">
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Entorno de Trabajo</h2>
              <p className={`text-sm sm:text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bienvenido, {usuario?.nombre || "Operario"}. Selecciona tu área.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-h-[50vh] overflow-y-auto custom-scrollbar p-1">
              {sectores.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => handleSelectSector(sector.id)}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                    sectorActivo === sector.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : darkMode ? 'border-slate-800 bg-slate-800/50 text-slate-300' : 'border-slate-100 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xl sm:text-2xl font-mono font-bold mb-1 sm:mb-2">{sector.icono}</span>
                  <span className="text-xs sm:text-base font-semibold">{sector.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REFACTOR: MODAL CATALOGO (Bottom Sheet en móvil, mitigación de teclado iOS) */}
      {mostrarModalCatalogo && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
          <div className={`w-full max-w-2xl max-h-[90dvh] flex flex-col p-5 sm:p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl relative animate-in slide-in-from-bottom sm:zoom-in duration-300 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:pb-6 ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <button onClick={() => setMostrarModalCatalogo(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors z-10">
              <X size={20} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
            </button>
            
            <div className="mb-4 pr-8">
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}><BookOpen className="text-blue-500" size={24}/> Tu Inventario ({sectorActual?.nombre})</h2>
            </div>

            <form onSubmit={handleApproveProducto} className={`mb-4 flex gap-2 p-2 sm:p-3 rounded-xl border flex-shrink-0 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <input                
                type="text" 
                placeholder="Nuevo producto..." 
                value={nuevoItemNombre}
                onChange={(e) => setNuevoItemNombre(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                required
              />
              <input 
                type="number" 
                placeholder="Stock" 
                value={nuevoItemStock}
                onChange={(e) => setNuevoItemStock(e.target.value)}                
                className={`w-20 sm:w-24 px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center">
                <Plus size={20} />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar min-h-[40vh]">
              {listaProductos.length === 0 ? (
                <p className={`text-center py-8 text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No hay productos en esta categoría.</p>
              ) : (
                listaProductos.map((prod) => (
                  <div key={prod.id} className={`flex justify-between items-center p-3 rounded-xl border ${
                    prod.sector === 'universal' ? (darkMode ? 'bg-purple-900/10 border-purple-800/50' : 'bg-purple-50 border-purple-100') : (darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200')
                  }`}>
                    <span className={`font-medium flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm sm:text-base ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      {prod.nombre} 
                      {prod.sector === 'universal' && <span className="text-[9px] w-fit uppercase tracking-wider text-purple-500 font-bold border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded-full">Global</span>}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3 ml-2 flex-shrink-0">
                      <span className={`text-xs sm:text-sm font-mono px-2 py-1 rounded-md ${darkMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Stock: {prod.stock}</span>
                      
                      {/* REFACTOR: Botón de borrado siempre visible y con mayor área táctil */}
                      <button 
                        onClick={() => handleEliminarProducto(prod.id)}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-slate-500 hover:bg-red-900/30 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-500'}`}
                        title="Borrar producto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* REFACTOR: MODAL INSTRUCCIONES (Bottom Sheet en móvil) */}
      {mostrarModalAyuda && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
          <div className={`w-full max-w-md p-5 sm:p-6 rounded-t-3xl sm:rounded-2xl shadow-2xl relative animate-in slide-in-from-bottom sm:zoom-in duration-300 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:pb-6 ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <button onClick={() => setMostrarModalAyuda(false)} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors z-10">
              <X size={20} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
            </button>
            
            <div className="mb-5 pr-8">
              <h2 className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Info className="text-blue-500" size={24}/> ¿Cómo usar VoxStock?
              </h2>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              <div className={`p-3 sm:p-4 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className={`font-bold text-sm sm:text-base mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>1. Modo Voz (Por Defecto)</h3>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Mantén presionado el botón del micrófono azul. Dicta tu orden de forma natural y suelta para enviar.</p>
              </div>

              <div className={`p-3 sm:p-4 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className={`font-bold text-sm sm:text-base mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>2. Modo Texto (Ruido/iOS)</h3>
                <p className={`text-xs sm:text-sm mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Si el micrófono falla, pulsa el icono del teclado a la derecha para escribir la orden manualmente.</p>
                <div className={`mt-2 p-2 rounded-lg text-xs font-mono italic border ${darkMode ? 'bg-slate-950/50 border-blue-900/30 text-blue-400' : 'bg-blue-50/50 border-blue-100 text-blue-700'}`}>
                  Ej: "Suma 5 unidades al pallet rojo"
                </div>
              </div>

              <div className={`p-3 sm:p-4 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className={`font-bold text-sm sm:text-base mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>3. El Motor IA</h3>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>El sistema detecta automáticamente la intención (Suma/Resta), la cantidad numérica y asocia el producto a tu catálogo mediante Fuzzy Matching.</p>
              </div>
            </div>
            
            <button onClick={() => setMostrarModalAyuda(false)} className="w-full mt-5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold py-3 sm:py-3.5 px-4 rounded-xl transition-all">
              Entendido, a trabajar
            </button>
          </div>
        </div>
      )}

      {/* --- EL RESTO DE LA INTERFAZ PRINCIPAL SE MANTIENE INTACTA --- */}
      {/* CABECERA FIJA */}
      <div className="flex-shrink-0 flex flex-col items-center text-center gap-1.5 w-full max-w-2xl mb-2 sm:mb-4">
          <span className={`px-3 py-1 rounded-full border text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest ${darkMode ? 'bg-blue-900/30 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
            Modo Operario: {sectorActual?.nombre.toUpperCase()}
          </span>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-none mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Terminal Principal</h1>
      </div>

      {/* ÁREA CENTRAL FLUIDA */}
      <div className="flex-1 w-full max-w-2xl flex flex-col justify-center gap-4 overflow-y-auto custom-scrollbar px-1 min-h-0">
        <div className={`w-full p-4 sm:p-5 rounded-2xl border shadow-lg transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h3 className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-1 sm:mb-1.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Última Orden Procesada</h3>
            <p className={`text-sm sm:text-base italic font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>"{respuestaIA.transcripcion}"</p>
          </div>
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'animate-bounce bg-yellow-500' : 'animate-pulse'} ${respuestaIA.estado === 'error' ? 'bg-red-500' : respuestaIA.estado === 'completado' ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
            <h3 className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Estado de Resolución</h3>
          </div>
          <div className={`p-3 sm:p-4 rounded-xl min-h-[70px] sm:min-h-[80px] flex items-center justify-center transition-colors duration-300 ${respuestaIA.estado === 'error' ? (darkMode ? 'bg-red-950/40 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-700 border border-red-100') : respuestaIA.estado === 'completado' ? (darkMode ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-100') : (darkMode ? 'text-slate-400 bg-slate-800/30' : 'text-slate-600 bg-slate-100')}`}>
            <p className="text-sm sm:text-base leading-relaxed font-semibold whitespace-pre-wrap text-center">
              {isProcessing ? "Estableciendo conexión con el servidor..." : (respuestaIA.mensaje || "Esperando instrucciones...")}
            </p>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTROL INFERIOR */}
      <div className="flex-shrink-0 w-full max-w-2xl flex flex-col items-center gap-3 sm:gap-4 mt-2 pb-[env(safe-area-inset-bottom)]">
        
        {/* ZONA DE INPUT */}
        <div className="w-full flex justify-center relative px-2">
          {modoTexto ? (
            <form onSubmit={handleSubmitTexto} className="w-full flex gap-2 sm:gap-3">
              <input 
                type="text" 
                value={textoManual}
                onChange={(e) => setTextoManual(e.target.value)}
                placeholder="Ej: Sumar 5 al pallet..."
                className={`flex-1 px-4 py-3 sm:py-4 rounded-xl text-sm sm:text-base border shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isProcessing}
                autoFocus
              />
              <button type="submit" disabled={isProcessing || !textoManual.trim()} className={`p-3 sm:p-4 rounded-xl text-white shadow-md transition-colors flex items-center justify-center ${isProcessing || !textoManual.trim() ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 active:scale-95'}`}>
                <Send size={24} />
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center relative">
              {micError && <p className="text-red-500 text-[10px] sm:text-xs font-bold mb-1 absolute -top-5 sm:-top-6 whitespace-nowrap bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">{micError}</p>}
              {isListening && <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse -z-10 w-32 h-32 sm:w-48 sm:h-48 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>}
              <button
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${isProcessing ? 'opacity-50 cursor-not-allowed bg-slate-300 border-slate-400' : isListening ? 'scale-95 bg-blue-600 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)]' : darkMode ? 'bg-slate-800 border-slate-700 shadow-xl hover:border-slate-600' : 'bg-white border-slate-200 shadow-xl hover:border-slate-300'}`}
                onMouseDown={isProcessing ? null : startListening} 
                onMouseUp={stopListening} 
                onMouseLeave={stopListening} 
                onTouchStart={isProcessing ? null : startListening} 
                onTouchEnd={stopListening}
                disabled={isProcessing}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Mic size={32} strokeWidth={1.5} color={isListening ? "white" : (darkMode ? "#94a3b8" : "#64748b")} className={`transition-all ${isListening ? 'animate-bounce' : ''}`} />
              </button>
              <span className={`font-bold tracking-wider text-[9px] sm:text-[10px] uppercase mt-1.5 sm:mt-2 ${isListening ? 'text-blue-500' : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>{isListening ? "Escuchando..." : isProcessing ? "Procesando" : "Mantener pulsado"}</span>
            </div>
          )}

          <button 
            onClick={() => setModoTexto(!modoTexto)}
            className={`absolute right-2 sm:right-0 top-[40%] -translate-y-1/2 p-2.5 sm:p-3 rounded-full border shadow-sm transition-colors active:scale-90 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-500 hover:text-slate-900'}`}
            title={modoTexto ? "Cambiar a voz" : "Cambiar a texto manual"}
          >
            {modoTexto ? <Mic size={18} className="sm:w-5 sm:h-5"/> : <Keyboard size={18} className="sm:w-5 sm:h-5"/>}
          </button>
        </div>

        {/* DOCK INFERIOR */}
        <div className="w-full grid grid-cols-3 gap-2 px-1">
            {dockItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center py-2.5 sm:py-3 px-1 rounded-xl border transition-all active:scale-95 ${item.colorClass}`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {item.icon}
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-center mt-1 leading-none">
                  {item.label}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}