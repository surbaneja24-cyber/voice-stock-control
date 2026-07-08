import { useState, useEffect, useCallback } from 'react';
import { Mic, X, BookOpen, LogOut, Trash2, Plus, Info } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { useHistoryStore } from "../store/historyStore";
import { useThemeStore } from "../store/themeStore";
import { useAuthStore } from "../store/authStore"; 
import useVoiceCommand from "../utils/useVoiceCommand"; // <-- IMPORTACIÓN DEL HOOK

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

  // INTEGRACIÓN DEL HOOK DE VOZ
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

  // VIGILANTE DE TRANSCRIPCIÓN: Cuando el hook escupe texto, lo enviamos al backend
  useEffect(() => {
    if (transcript) {
      procesarComandoIA(transcript);
    }
  }, [transcript]);

  // NUEVA FUNCIÓN: Envía texto JSON, ya no envía audio
  const procesarComandoIA = async (textoComando) => {
    setRespuestaIA({ 
      transcripcion: textoComando, 
      mensaje: "Procesando intención con IA...", 
      estado: "idle" 
    });

    try {
      // Nota: Cambié el endpoint de /transcribir a /procesar-comando 
      // porque el backend ahora recibe texto, no audio.
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
            method: "Voice",
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
    }
  };

  const handleApproveProducto = async (e) => {
    e.preventDefault();
    if (!nuevoItemNombre.trim()) return;

    const payload = {
      nombre: nuevoItemNombre,      
      stock: parseInt(nuevoItemStock) || 0,
      sector: sectorActivo
    };

    try {
      const res = await fetch(`${baseApiUrl}/api/catalogo/item`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setNuevoItemNombre("");
        setNuevoItemStock("");
        fetchCatalogo(); 
      } else {
        const err = await res.json();
        alert(err.detail);
      }
    } catch (error) {
      console.error("Error al añadir:", error);
    }
  };

  const handleEliminarProducto = async (productoId) => {
    if (!confirm("¿Estás seguro de eliminar este artículo de tu inventario?")) return;
    try {
      const res = await fetch(`${baseApiUrl}/api/catalogo/item/${productoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) fetchCatalogo();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
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
    { 
      label: 'Ver Catalogo', 
      icon: <BookOpen size={20} />, 
      onClick: () => setMostrarModalCatalogo(true),
      colorClass: darkMode ? 'text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/30 bg-emerald-900/10' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-emerald-50/50'
    },
    { 
      label: `Sector: ${sectorActual?.nombre}`, 
      icon: <span className="text-lg leading-none font-mono font-bold">{sectorActual?.icono}</span>, 
      onClick: () => setMostrarModalSectores(true), 
      colorClass: darkMode ? 'text-blue-400 border-blue-900/50 hover:bg-blue-900/30 bg-blue-900/10' : 'text-blue-600 border-blue-200 hover:bg-blue-50 bg-blue-50/50'
    },
    { 
      label: 'Cerrar Sesión', 
      icon: <LogOut size={20} />, 
      onClick: ejecutarCerrarSesion, 
      colorClass: darkMode ? 'text-red-400 border-red-900/50 hover:bg-red-900/30 bg-red-900/10' : 'text-red-600 border-red-200 hover:bg-red-50 bg-red-50/50'
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-4 pt-20 pb-8 relative overflow-y-auto">
      
      {/* MODAL SECTORES */}
      {mostrarModalSectores && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-4xl p-8 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200 ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-extrabold tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Configurar Entorno de Trabajo</h2>
              <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bienvenido, {usuario?.nombre || "Operario"}. Selecciona tu área de hoy.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sectores.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => handleSelectSector(sector.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    sectorActivo === sector.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : darkMode ? 'border-slate-800 bg-slate-800/50 hover:border-slate-600 text-slate-300' : 'border-slate-100 bg-slate-50 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-2xl font-mono font-bold mb-2">{sector.icono}</span>
                  <span className="font-semibold">{sector.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CATALOGO */}
      {mostrarModalCatalogo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200 ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <button onClick={() => setMostrarModalCatalogo(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <X size={24} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
            </button>
            
            <div className="mb-4">
              <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}><BookOpen className="text-blue-500"/> Tu Inventario ({sectorActual?.nombre})</h2>
            </div>

            <form onSubmit={handleApproveProducto} className={`mb-4 flex gap-2 p-3 rounded-xl border ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
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
                className={`w-24 px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center">
                <Plus size={20} />
              </button>
            </form>

            <div className="overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {listaProductos.length === 0 ? (
                <p className={`text-center py-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No hay productos en esta categoría.</p>
              ) : (
                listaProductos.map((prod) => (
                  <div key={prod.id} className={`flex justify-between items-center p-3 rounded-lg border group ${
                    prod.sector === 'universal' ? (darkMode ? 'bg-purple-900/10 border-purple-800/50' : 'bg-purple-50 border-purple-100') : (darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200')
                  }`}>
                    <span className={`font-medium flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                      {prod.nombre} 
                      {prod.sector === 'universal' && <span className="text-[10px] uppercase tracking-wider text-purple-500 font-bold border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded-full">Global</span>}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-mono px-2 py-1 rounded ${darkMode ? 'bg-slate-950 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Stock: {prod.stock}</span>
                      <button 
                        onClick={() => handleEliminarProducto(prod.id)}
                        className="p-1.5 text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
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

      {/* MODAL INSTRUCCIONES DE USO */}
      {mostrarModalAyuda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200 ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <button onClick={() => setMostrarModalAyuda(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <X size={24} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
            </button>
            
            <div className="mb-6">
              <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                <Info className="text-blue-500"/> ¿Cómo usar VoxStock?
              </h2>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className={`font-bold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>1. Mantén pulsado</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Toca y mantén presionado el icono del micrófono grande en el centro de la pantalla. No lo sueltes mientras hablas.</p>
              </div>

              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className={`font-bold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>2. Dicta la orden</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Habla de forma natural. La Inteligencia Artificial entenderá el contexto.</p>
                <div className={`mt-2 p-2 rounded text-xs font-mono italic ${darkMode ? 'bg-slate-950 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                  Ej: "Entraron dos palets de material general"
                </div>
                <div className={`mt-1 p-2 rounded text-xs font-mono italic ${darkMode ? 'bg-slate-950 text-red-400' : 'bg-red-50 text-red-700'}`}>
                  Ej: "Restale 5 unidades a los tornillos"
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <h3 className={`font-bold mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>3. Suelta y espera</h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Al soltar el botón, el audio se enviará al servidor. Revisa el panel de "Resolución del Sistema" para confirmar el éxito.</p>
              </div>
            </div>
            
            <button onClick={() => setMostrarModalAyuda(false)} className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all">
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO DE LA TERMINAL COMPRIMIDO PARA MÓVIL */}
      <div className="flex flex-col items-center gap-4 md:gap-6 w-full max-w-4xl mt-0 md:mt-2">
        <div className="flex flex-col items-center text-center gap-1.5">
          <span className={`px-3 py-1 rounded-full border text-[10px] md:text-xs font-bold uppercase tracking-widest ${darkMode ? 'bg-blue-900/30 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
            Modo Operario: {sectorActual?.nombre.toUpperCase()}
          </span>
          <h1 className={`text-2xl md:text-4xl font-extrabold tracking-tight leading-none mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Terminal de Entrada</h1>
          <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Operador: {usuario?.nombre || "No identificado"}</p>
        </div>

        <div className="flex flex-col items-center gap-3 relative">
          {/* Mostramos errores de micrófono si los hay */}
          {micError && <p className="text-red-500 text-xs font-bold mb-2">{micError}</p>}
          
          {isListening && <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse -z-10 w-48 h-48 md:w-64 md:h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>}
          <button
            className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${isListening ? 'scale-95 bg-blue-600 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.4)]' : darkMode ? 'bg-slate-900 border-slate-700 shadow-xl hover:scale-105 hover:border-slate-600' : 'bg-white border-slate-200 shadow-xl hover:scale-105 hover:border-slate-300'}`}
            onMouseDown={startListening} 
            onMouseUp={stopListening} 
            onMouseLeave={stopListening} 
            onTouchStart={startListening} 
            onTouchEnd={stopListening}
          >
            <Mic size={38} strokeWidth={1.5} color={isListening ? "white" : (darkMode ? "#94a3b8" : "#64748b")} className={`transition-all ${isListening ? 'animate-bounce' : ''}`} />
          </button>
          <span className={`font-bold tracking-wider text-[10px] uppercase ${isListening ? 'text-blue-500' : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>{isListening ? "Escuchando..." : "Esperando orden"}</span>
        </div>

        <div className={`w-full max-w-2xl p-4 md:p-6 rounded-2xl border shadow-lg transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="mb-3 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h3 className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Transcripcion de Audio</h3>
            <p className={`text-sm md:text-base italic ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>"{respuestaIA.transcripcion}"</p>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${respuestaIA.estado === 'error' ? 'bg-red-500' : respuestaIA.estado === 'completado' ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
            <h3 className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>Resolucion del Sistema</h3>
          </div>
          <div className={`p-3 md:p-4 rounded-xl ${respuestaIA.estado === 'error' ? (darkMode ? 'bg-red-950/30 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-700 border border-red-100') : respuestaIA.estado === 'completado' ? (darkMode ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-100') : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
            <p className="text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">{respuestaIA.mensaje || "Esperando instrucciones por voz..."}</p>
          </div>
        </div>

        {/* PANEL DE CONTROL ESTÁTICO (Más compacto) */}
        <div className="w-full max-w-2xl mt-1 md:mt-2 flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">
            {dockItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-sm ${item.colorClass}`}
              >
                <div className="mb-1">
                  {item.icon}
                </div>
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-center leading-tight">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setMostrarModalAyuda(true)}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl border transition-all active:scale-[0.98] ${
              darkMode 
                ? 'text-slate-400 border-slate-800 hover:bg-slate-800/50 bg-slate-900/30' 
                : 'text-slate-500 border-slate-200 hover:bg-slate-50 bg-white'
            }`}
          >
            <Info size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">¿Cómo usar la terminal?</span>
          </button>
        </div>

      </div>
    </div>
  );
}