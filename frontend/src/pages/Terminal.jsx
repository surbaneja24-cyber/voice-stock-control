import { useState, useRef } from 'react';
import { Mic } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from '../components/Sidebar';
import { useHistoryStore } from "../store/historyStore";

export default function Terminal() {
  const [grabando, setGrabando] = useState(false);
  const [textoModal, setTextoModal] = useState("Esperando comando de voz...");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mediaRecorderRef = useRef(null);
  const fragmentosDeAudio = useRef([]);
  const navigate = useNavigate(); // <-- El nuevo motor de navegación
  const addMovimiento = useHistoryStore(
    (state) => state.addMovimiento
  );

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
        setTextoModal("Procesando audio con IA...");

        const formData = new FormData();
        formData.append("audio", audioBlob, "orden_operario.webm");

        try {
          const respuesta = await fetch(
            "https://congenial-palm-tree-pj5jx57j5vrqh7v64-5001.app.github.dev/api/transcribir",
            {
              method: "POST",
              body: formData
            }
          );
          const datos = await respuesta.json();

          if (respuesta.ok) {
            setTextoModal(datos.texto);

            addMovimiento({
              dateTime: new Date().toLocaleString(),
              user: "Operario",
              action: datos.accion,
              product: datos.producto,
              quantity: datos.cantidad,
              method: "Voice",
            });

          } else {
            setTextoModal("Error de la IA: " + datos.error);
          }

        } catch (error) {
          console.error("Error de conexión:", error);
          setTextoModal("Error Crítico: El motor FastAPI en el puerto 5001 no responde.");
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setGrabando(true);

    } catch (error) {
      console.error("Detalle del error:", error);
      alert("Error: No se pudo acceder al micrófono.");
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current && grabando) {
      mediaRecorderRef.current.stop();
      setGrabando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex overflow-hidden font-sans">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className={`flex-1 transition-all duration-300 ease-in-out h-screen overflow-y-auto ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'} ml-0`}>
        <div className="min-h-full flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100 relative">

          <div className="absolute top-8 right-8">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 transition-colors text-sm font-semibold text-slate-600 shadow-sm"
            >
              Cerrar Terminal
            </button>
          </div>

          <div className="flex flex-col items-center gap-10 w-full max-w-4xl mt-16 md:mt-0">
            <div className="flex flex-col items-center text-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-1">
                Modo Operario
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
                Terminal de Entrada
              </h1>
              <p className="text-slate-500 text-lg max-w-lg">
                Mantén presionado el botón central para dictar movimientos de stock mediante voz.
              </p>
            </div>

            <div className="flex flex-col items-center gap-8 relative">
              {grabando && (
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl animate-pulse -z-10 w-72 h-72 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              )}

              <button
                className={`w-44 h-44 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${grabando
                  ? 'scale-95 bg-blue-600 border-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.4)]'
                  : 'bg-white border-slate-200 shadow-xl hover:scale-105 hover:border-slate-300 hover:shadow-2xl'
                  }`}
                onMouseDown={iniciarGrabacion}
                onMouseUp={detenerGrabacion}
                onMouseLeave={detenerGrabacion}
                onTouchStart={iniciarGrabacion}
                onTouchEnd={detenerGrabacion}
              >
                <Mic size={55} strokeWidth={1.5} color={grabando ? "white" : "#64748b"} className={`transition-all ${grabando ? 'animate-bounce' : ''}`} />
              </button>

              <span className={`font-bold tracking-wider text-sm uppercase ${grabando ? 'text-blue-600' : 'text-slate-400'}`}>
                {grabando ? "Escuchando..." : "Esperando orden"}
              </span>
            </div>

            <div className="w-full max-w-2xl mt-2 p-8 rounded-2xl bg-white border border-slate-200 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Respuesta del Sistema</h3>
              </div>
              <p className="text-lg text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{textoModal}</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}