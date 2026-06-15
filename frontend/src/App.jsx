import { useState, useRef } from 'react';
// import './App.css';
import { Mic } from "lucide-react";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";

import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Navbar from "./components/Navbar";


function App() {
  // ==========================================
  // 1. EL MOTOR (Lógica de estado y grabación)
  // ==========================================
  const [grabando, setGrabando] = useState(false);
  const [textoModal, setTextoModal] = useState("Waiting for voice input...");

  const mediaRecorderRef = useRef(null);
  const fragmentosDeAudio = useRef([]);
  const [mostrarHome, setMostrarHome] = useState(true);


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
          const respuesta = await fetch("/api/transcribir", {
            method: "POST",
            body: formData
          });

          const datos = await respuesta.json();

          if (respuesta.ok) {
            setTextoModal(datos.texto);
          } else {
            setTextoModal("Error de la IA: " + datos.error);
          }

        } catch (error) {
          console.error("Error de conexión:", error);
          setTextoModal("Error: Verifica que api_voz.py esté encendido.");
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
  <>
    <Navbar />

    <Routes>
      <Route
        path="/"
        element={<Home setMostrarHome={setMostrarHome} />}
      />

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/history"
        element={<History />}
      />

      <Route
        path="/privacy"
        element={<Privacy />}
      />

      <Route
        path="/terms"
        element={<Terms />}
      />

      <Route
        path="/cookies"
        element={<Cookies />}
      />
    </Routes>
  </>
);
  if (mostrarHome) {
    return <Home setMostrarHome={setMostrarHome} />;
  }


  // ==========================================
  // 2. LA INTERFAZ (Tu nuevo diseño visual)
  // ==========================================
  return (
    <div className="app">
      <div className="header">
        <span className="badge">Beta 1.0</span> {/* <--- Esto es nuevo */}
        <h1>VoxStock</h1>
        <p>Intelligent inventory management through voice commands</p>
      </div>

      <div className="voice-container">
        <button
          className={`mic-button ${grabando ? 'grabando' : ''}`}
          onMouseDown={iniciarGrabacion}
          onMouseUp={detenerGrabacion}
          onMouseLeave={detenerGrabacion}
          onTouchStart={iniciarGrabacion}
          onTouchEnd={detenerGrabacion}
        >
          {/* El icono cambia de color si está grabando para dar feedback visual */}
          <Mic size={70} strokeWidth={1.5} color={grabando ? "white" : "currentColor"} />
        </button>

        <span className="status">
          {grabando ? "Escuchando... (Suelta para enviar)" : "Mantén presionado para hablar"}
        </span>
      </div>

      <div className="result-card">
        <h3>Recognized Command</h3>
        <p>{textoModal}</p>
      </div>
    </div>
  );
}

export default App;