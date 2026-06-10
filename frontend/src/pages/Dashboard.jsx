import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Mic, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

function Dashboard() {
  // ==========================================
  // SESIÓN DE USUARIO
  // ==========================================

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ==========================================
  // MOTOR DE VOZ
  // ==========================================

  const [grabando, setGrabando] = useState(false);
  const [estadoIA, setEstadoIA] = useState("ready");
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
            setEstadoIA("ready");
          } else {
            setTextoModal(
              "Error de la IA: " + datos.error
            );
            setEstadoIA("error");
          }
        } catch (error) {
          console.error(
            "Error de conexión:",
            error
          );

          setTextoModal(
            "Error: Verifica que api_voz.py esté encendido."
          );
          setEstadoIA("error");
        }

        stream
          .getTracks()
          .forEach((track) => track.stop());
      };

      mediaRecorder.start();

      setGrabando(true);
      setEstadoIA("listening");
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
      setEstadoIA("processing");
    }
  };

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <div className="app">
      <div className="top-bar">
        <span className="badge">
          🚀 Beta 1.0
        </span>

        <button
          className="flag-btn"
          onClick={() => i18n.changeLanguage("en")}
        >
          <img
            src="https://flagcdn.com/w40/us.png"
            alt="English"
          />
        </button>

        <button
          className="flag-btn"
          onClick={() => i18n.changeLanguage("es")}
        >
          <img
            src="https://flagcdn.com/w40/es.png"
            alt="Español"
          />
        </button>

        <button
          className="flag-btn"
          onClick={() => i18n.changeLanguage("fr")}
        >
          <img
            src="https://flagcdn.com/w40/fr.png"
            alt="Français"
          />
        </button>

        <button
          className="flag-btn"
          onClick={() => i18n.changeLanguage("de")}
        >
          <img
            src="https://flagcdn.com/w40/de.png"
            alt="Deutsch"
          />
        </button>
      </div>

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
            {t("exit")}
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

              <h2>{t("gettingStarted")}</h2>

              <p className="modal-subtitle">
                {t("instructionsSubtitle")}
              </p>

              <div className="instruction-item">
                🎙️ {t("step1")}
              </div>

              <div className="instruction-item">
                👆 {t("step2")}
              </div>

              <div className="instruction-item">
                🗣️ {t("step3")}
              </div>

              <div className="instruction-item">
                🚀 {t("step4")}
              </div>

              <div className="instruction-item">
                📦 {t("step5")}
              </div>
            </div>
          </div>
        )}
      </div>

      <p>{t("inventory")}</p>

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
            ? t("listening")
            : t("holdSpeak")}
        </span>
        <div className={`ai-status ${estadoIA}`}>
          {estadoIA === "ready" &&
            `🟢 ${t("ready")}`}

          {estadoIA === "listening" &&
            `🎙️ ${t("listeningStatus")}`}

          {estadoIA === "processing" &&
            `⚡ ${t("processing")}`}

          {estadoIA === "error" &&
            `❌ ${t("connectionError")}`}
        </div>
      </div>

      <div className="result-card">
        <h3>{t("recognizedCommand")}</h3>
        <p>{textoModal}</p>
      </div>
    </div>
  );
}

export default Dashboard;