import { useState, useEffect, useCallback } from 'react';

const useVoiceCommand = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setError('La voz no está disponible en este entorno.');
      return;
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setError('Tu navegador bloquea el reconocimiento de voz nativo. Utiliza Google Chrome.');
      return;
    }

    const recog = new SpeechRecognitionCtor();
    recog.continuous = false;
    recog.lang = 'es-ES'; 
    recog.interimResults = false; 

    recog.onstart = () => {
      setIsListening(true);
    };

    recog.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
    };

    recog.onerror = (event) => {
      // INYECCIÓN DE DEPURACIÓN: Ver el error nativo en consola
      console.error("[SpeechRecognition Error Nativo]:", event.error);
      
      let mensaje = "Error desconocido del micrófono.";
      
      // Diccionario completo de errores de la W3C
      switch (event.error) {
        case 'not-allowed':
          mensaje = "Permiso denegado. Habilita el micrófono en tu navegador.";
          break;
        case 'audio-capture':
          mensaje = "No se detectó hardware de micrófono en este equipo o entorno.";
          break;
        case 'service-not-allowed':
          mensaje = "El navegador denegó el uso del servicio de voz.";
          break;
        case 'network':
          mensaje = "Fallo de red en el servicio de voz de Google/Apple.";
          break;
        case 'no-speech':
          mensaje = "No se detectó voz. Acércate al micrófono.";
          break;
        case 'aborted':
          mensaje = "La grabación fue interrumpida de forma inesperada.";
          break;
        case 'language-not-supported':
          mensaje = "El idioma configurado no está soportado en este dispositivo.";
          break;
        default:
          mensaje = `Error del micrófono: ${event.error}`;
      }
      
      setError(mensaje);
      setIsListening(false);
    };

    recog.onend = () => {
      setIsListening(false);
    };

    setRecognition(recog);

    // FUNCIÓN DE LIMPIEZA (Memory Leak Fix)
    return () => {
      recog.onstart = null;
      recog.onresult = null;
      recog.onerror = null;
      recog.onend = null;
      try {
        recog.abort();
      } catch (e) {
        // Ignorar error al abortar si ya estaba detenido
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) {
      setError('El reconocimiento de voz no está disponible.');
      return;
    }

    setError(null);
    setTranscript('');

    try {
      recognition.start();
    } catch (e) {
      console.warn('El reconocimiento ya estaba en curso.');
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        console.warn('Error al detener el reconocimiento.');
      }
      setIsListening(false);
    }
  }, [recognition]);

  return { transcript, isListening, error, startListening, stopListening };
};

export default useVoiceCommand;