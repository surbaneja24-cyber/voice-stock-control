import { useState, useRef } from "react";
import { Mic } from "lucide-react";
import { useHistoryStore } from "../store/historyStore";

function VoiceAI() {
  const [grabando, setGrabando] = useState(false);
  const [textoModal, setTextoModal] = useState("Waiting for voice input...");

  const mediaRecorderRef = useRef(null);
  const fragmentosDeAudio = useRef([]);

  // Zustand
  const addCommand = useHistoryStore((state) => state.addCommand);

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      fragmentosDeAudio.current = [];

      mediaRecorder.ondataavailable = (evento) => {
        if (evento.data.size > 0) {
          fragmentosDeAudio.current.push(evento.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(fragmentosDeAudio.current, {
          type: "audio/webm",
        });

        setTextoModal("Procesando audio con IA...");

        const formData = new FormData();
        formData.append("audio", audioBlob, "orden_operario.webm");

        try {
          const respuesta = await fetch("/api/transcribir", {
            method: "POST",
            body: formData,
          });

          const datos = await respuesta.json();

          if (respuesta.ok) {
            setTextoModal(datos.texto);

            // Guardar en el historial
            addCommand({
              id: Date.now(),
              texto: datos.texto,
              fecha: new Date().toLocaleString(),
            });
          } else {
            setTextoModal("Error de la IA: " + datos.error);
          }
        } catch (error) {
          console.error(error);
          setTextoModal(
            "Error: Verifica que api_voz.py esté encendido."
          );
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setGrabando(true);
    } catch (error) {
      console.error(error);
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
    <div className="app">
      <div className="header">
        <span className="badge">Beta 1.0</span>
        <h1>VoxStock</h1>
        <p>Intelligent inventory management through voice commands</p>
      </div>

      <div className="voice-container">
        <button
          className={`mic-button ${grabando ? "grabando" : ""}`}
          onMouseDown={iniciarGrabacion}
          onMouseUp={detenerGrabacion}
          onMouseLeave={detenerGrabacion}
          onTouchStart={iniciarGrabacion}
          onTouchEnd={detenerGrabacion}
        >
          <Mic size={70} strokeWidth={1.5} />
        </button>

        <span className="status">
          {grabando
            ? "Escuchando... (Suelta para enviar)"
            : "Mantén presionado para hablar"}
        </span>
      </div>

      <div className="result-card">
        <h3>Recognized Command</h3>
        <p>{textoModal}</p>
      </div>
    </div>
  );
}

export default VoiceAI;