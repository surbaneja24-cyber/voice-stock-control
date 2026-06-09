import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Mic, Info } from "lucide-react";

function Dashboard() {
  // ==========================================
  // SESIÓN DE USUARIO
  // ==========================================

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ==========================================
  // MOTOR DE VOZ
  // ==========================================

  const [grabando, setGrabando] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const [textoModal, setTextoModal] = useState(
    "Waiting for voice input..."
  );

  const mediaRecorderRef = useRef(null);
  const fragmentosDeAudio = useRef([]);

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
        const audioBlob = new Blob(
          fragmentosDeAudio.current,
          {
            type: "audio/webm",
          }
        );

        setTextoModal("Procesando audio con IA...");

        const formData = new FormData();

        formData.append(
          "audio",
          audioBlob,
          "orden_operario.webm"
        );

        try {
          const respuesta = await fetch(
            "/api/transcribir",
            {
              method: "POST",
              body: formData,
            }
          );

          const datos = await respuesta.json();

          if (respuesta.ok) {
            setTextoModal(datos.texto);
          } else {
            setTextoModal(
              "Error de la IA: " + datos.error
            );
          }
        } catch (error) {
          console.error(
            "Error de conexión:",
            error
          );

          setTextoModal(
            "Error: Verifica que api_voz.py esté encendido."
          );
        }

        stream
          .getTracks()
          .forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setGrabando(true);
    } catch (error) {
      console.error(
        "Detalle del error:",
        error
      );

      alert(
        "Error: No se pudo acceder al micrófono."
      );
    }
  };

  const detenerGrabacion = () => {
    if (mediaRecorderRef.current && grabando) {
      mediaRecorderRef.current.stop();
      setGrabando(false);
    }
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="app">
      <span className="badge">
        🚀 Beta 1.0
      </span>

      <h1 className="logo-title">
        Vox<span>Stock</span>
      </h1>

      <div className="user-row">
        <span className="user-badge">
          👤 {user?.email}
        </span>

        <div className="top-actions">
          <button
            className="info-btn"
            onClick={() => setShowInstructions(true)}
            title="Instructions"
          >
            <Info size={18} />
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Exit
          </button>
        </div>

        {showInstructions && (
          <div className="modal-overlay">
            <div className="modal">
              <button
                className="close-btn"
                onClick={() => setShowInstructions(false)}
              >
                ✕
              </button>

              <h2>Getting Started</h2>

              <p className="modal-subtitle">
                Welcome to VoxStock. Follow these quick steps to start using voice commands.
              </p>

              <div className="instruction-item">
                🎙️ Allow microphone access when your browser requests permission.
              </div>

              <div className="instruction-item">
                👆 Press and hold the microphone button while speaking.
              </div>

              <div className="instruction-item">
                🗣️ Speak naturally and clearly for better recognition.
              </div>

              <div className="instruction-item">
                🚀 Release the button to send your command to the AI.
              </div>

              <div className="instruction-item">
                📦 Your recognized command will appear instantly below.
              </div>
            </div>
          </div>
        )}
      </div>

      <p>
        Intelligent inventory management through voice commands
      </p>

      <div className="voice-container">
        <button
          className={`mic-button ${grabando ? "grabando" : ""
            }`}
          onMouseDown={iniciarGrabacion}
          onMouseUp={detenerGrabacion}
          onMouseLeave={detenerGrabacion}
          onTouchStart={iniciarGrabacion}
          onTouchEnd={detenerGrabacion}
        >
          <Mic
            size={70}
            strokeWidth={1.5}
            color={
              grabando
                ? "white"
                : "currentColor"
            }
          />
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

export default Dashboard;