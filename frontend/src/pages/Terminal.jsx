import { useState, useRef, useEffect } from 'react';
import { Mic, X, BookOpen, LogOut } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { useHistoryStore } from "../store/historyStore";
import { useThemeStore } from "../store/themeStore";
import Dock from "../components/Dock";

export default function Terminal() {
  const [grabando, setGrabando] = useState(false);
  const [mostrarModalSectores, setMostrarModalSectores] = useState(true);
  const [mostrarModalCatalogo, setMostrarModalCatalogo] = useState(false);
  const [listaProductos, setListaProductos] = useState([]);
  const [sectorActivo, setSectorActivo] = useState("universal");
  const [respuestaIA, setRespuestaIA] = useState({
    transcripcion: "Pulsa el microfono para hablar...",
    mensaje: "Esperando comando de voz...",
    estado: "idle" 
  });

  const mediaRecorderRef = useRef(null);
  const fragmentosDeAudio = useRef([]);
  const navigate = useNavigate();
  const addMovimiento = useHistoryStore((state) => state.addMovimiento);
  const darkMode = useThemeStore((state) => state.darkMode);

  // Emojis eliminados. Sustituidos por codigos de area logisticos.
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
    const fetchCatalogo = async () => {
      try {
        const res = await fetch(`/api/catalogo?sector=${sectorActivo}`);
        if (res.ok) {
          const data = await res.json();
          setListaProductos(data);
        }
      } catch (error) {
        console.error("[ERROR] No se pudo cargar el catalogo:", error);
      }
    };
    if (!mostrarModalSectores) {
      fetchCatalogo();
    }
  }, [sectorActivo, mostrarModalSectores]);

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      fragmentosDeAudio.current = [];

      mediaRecorder.ondataavailable = (evento) => {
        if (evento.data.size > 0) fragmentosDeAudio.current.push(evento.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(fragmentosDeAudio.current, { type: 'audio/webm' });
        setRespuestaIA(prev => ({...prev, mensaje: "Procesando audio con IA...", estado: "idle"}));

        const formData = new FormData();
        formData.append("audio", audioBlob, "orden_operario.webm");
        formData.append("sector", sectorActivo); 

        try {
          const respuesta = await fetch("/api/transcribir", { method: "POST", body: formData });
          const datos = await respuesta.json();

          if (respuesta.ok) {
            setRespuestaIA({ transcripcion: datos.transcripcion || "Audio procesado", mensaje: datos.mensaje, estado: datos.estado });

            if (datos.estado === "completado") {
              addMovimiento({
                dateTime: new Date().toLocaleString(),
                user: `Operario (${sectorActivo})`,
                action: datos.accion,
                product: datos.producto,
                quantity: datos.cantidad,
                unit: datos.unidad,
                method: "Voice",
              });
              const resCatalogo = await fetch(`/api/catalogo?sector=${sectorActivo}`);
              if (resCatalogo.ok) setListaProductos(await resCatalogo.json());
            }
          } else {
            setRespuestaIA({ transcripcion: "Error en la transmision.", mensaje: "Fallo del motor: " + (datos.detail || datos.error), estado: "error" });
          }
        } catch (error) {
          // CORRECCION APLICADA: Uso explicito de la variable error.
          console.error("[CRITICO] Fallo de red detectado:", error);
          setRespuestaIA({ transcripcion: "Fallo de red.", mensaje: "Error Critico: Servidor inalcanzable.", estado: "error" });
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setGrabando(true);
    } catch (error) {
      // CORRECCION APLICADA: Uso explicito de la variable error.
      console.error("[CRITICO] Error de acceso a hardware de microfono:", error);
      alert("Error: No se pudo acceder al microfono. Verifica los permisos del navegador.");
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current && grabando) {
      mediaRecorderRef.current.stop();
      setGrabando(false);
    }
  };

  const sectorActual = sectores.find(s => s.id === sectorActivo);

  const dockItems = [
    { 
      label: 'Ver Catalogo', 
      icon: <BookOpen size={22} />, 
      onClick: () => setMostrarModalCatalogo(true),
      colorClass: darkMode ? 'text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/30 bg-emerald-900/10' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-emerald-50/50'
    },
    { 
      label: `Sector: ${sectorActual?.nombre}`, 
      icon: <span className="text-xl leading-none font-mono font-bold">{sectorActual?.icono}</span>, 
      onClick: () => setMostrarModalSectores(true),
      colorClass: darkMode ? 'text-blue-400 border-blue-900/50 hover:bg-blue-900/30 bg-blue-900/10' : 'text-blue-600 border-blue-200 hover:bg-blue-50 bg-blue-50/50'
    },
    { 
      label: 'Cerrar Terminal', 
      icon: <LogOut size={22} />, 
      onClick: () => navigate('/'),
      colorClass: darkMode ? 'text-red-400 border-red-900/50 hover:bg-red-900/30 bg-red-900/10' : 'text-red-600 border-red-200 hover:bg-red-50 bg-red-50/50'
    }
  ];

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 pb-32 relative">
      
      <Dock items={dockItems} darkMode={darkMode} />

      {mostrarModalSectores && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-4xl p-8 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200 ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-extrabold tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Configurar Entorno de Trabajo</h2>
              <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Selecciona la industria en la que estas operando hoy.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sectores.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => { setSectorActivo(sector.id); setMostrarModalSectores(false); }}
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

      {mostrarModalCatalogo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-2xl max-h-[80vh] flex flex-col p-8 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in duration-200 ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <button onClick={() => setMostrarModalCatalogo(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <X size={24} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
            </button>
            <div className="mb-6">
              <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}><BookOpen className="text-blue-500"/> Articulos Disponibles</h2>
              <p className={`mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Estos son los productos registrados en tu sector ({sectorActual?.nombre}).</p>
            </div>
            <div className="overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {listaProductos.map((prod, idx) => (
                <div key={idx} className={`flex justify-between items-center p-3 rounded-lg border ${
                  prod.sector === 'universal' ? (darkMode ? 'bg-purple-900/10 border-purple-800/50' : 'bg-purple-50 border-purple-100') : (darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200')
                }`}>
                  <span className={`font-medium flex items-center gap-2 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {prod.nombre} 
                    {prod.sector === 'universal' && <span className="text-[10px] uppercase tracking-wider text-purple-500 font-bold border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded-full">Universal</span>}
                  </span>
                  <span className={`text-sm font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Stock: {prod.stock}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-10 w-full max-w-4xl mt-10 md:mt-0">
        <div className="flex flex-col items-center text-center gap-3">
          <span className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-1 ${darkMode ? 'bg-blue-900/30 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
            Modo Operario: {sectorActual?.nombre.toUpperCase()}
          </span>
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Terminal de Entrada</h1>
          <p className={`text-lg max-w-lg ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manten presionado el boton central para dictar movimientos de stock.</p>
        </div>

        <div className="flex flex-col items-center gap-8 relative">
          {grabando && <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse -z-10 w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>}
          <button
            className={`w-44 h-44 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${grabando ? 'scale-95 bg-blue-600 border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.4)]' : darkMode ? 'bg-slate-900 border-slate-700 shadow-xl hover:scale-105 hover:border-slate-600' : 'bg-white border-slate-200 shadow-xl hover:scale-105 hover:border-slate-300'}`}
            onMouseDown={iniciarGrabacion} onMouseUp={detenerGrabacion} onMouseLeave={detenerGrabacion} onTouchStart={iniciarGrabacion} onTouchEnd={detenerGrabacion}
          >
            <Mic size={55} strokeWidth={1.5} color={grabando ? "white" : (darkMode ? "#94a3b8" : "#64748b")} className={`transition-all ${grabando ? 'animate-bounce' : ''}`} />
          </button>
          <span className={`font-bold tracking-wider text-sm uppercase ${grabando ? 'text-blue-500' : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>{grabando ? "Escuchando..." : "Esperando orden"}</span>
        </div>

        <div className={`w-full max-w-2xl mt-2 p-8 rounded-2xl border shadow-lg transition-colors ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="mb-6 pb-6 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Transcripcion de Audio</h3>
            <p className={`text-lg italic ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>"{respuestaIA.transcripcion}"</p>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${respuestaIA.estado === 'error' ? 'bg-red-500' : respuestaIA.estado === 'completado' ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>Resolucion del Sistema</h3>
          </div>
          <div className={`p-4 rounded-xl ${respuestaIA.estado === 'error' ? (darkMode ? 'bg-red-950/30 text-red-400 border border-red-900/50' : 'bg-red-50 text-red-700 border border-red-100') : respuestaIA.estado === 'completado' ? (darkMode ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-100') : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
            <p className="text-lg leading-relaxed font-medium whitespace-pre-wrap">{respuestaIA.mensaje || "Esperando instrucciones por voz..."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}