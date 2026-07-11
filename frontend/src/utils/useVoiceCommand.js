import { useState, useEffect, useCallback } from 'react';

const useVoiceCommand = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // 1. Defensa contra Renderizado en Servidor (SSR)
    if (typeof window === 'undefined') {
      setError('La voz no está disponible en este entorno.');
      return;
    }

    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

    // 2. Defensa contra navegadores no compatibles
    if (!SpeechRecognitionCtor) {
      setError('Tu navegador o dispositivo bloquea el reconocimiento de voz nativo. Utiliza Google Chrome o Edge.');
      return;
    }

    const recog = new SpeechRecognitionCtor();
    recog.continuous = false;
    recog.lang = 'es-ES'; 
    recog.interimResults = false; 

    // 3. Sincronización Real del Hardware con la UI
    recog.onstart = () => {
      setIsListening(true);
    };

    recog.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
    };

    recog.onerror = (event) => {
      // 4. Traductor de Errores para el Operario
      let mensaje = "Error desconocido del micrófono.";
      if (event.error === 'not-allowed') mensaje = "Permiso denegado. Habilita el micrófono en tu navegador.";
      if (event.error === 'network') mensaje = "Fallo de red en el servicio de voz.";
      if (event.error === 'no-speech') mensaje = "No se detectó voz. Acércate al micrófono.";
      if (event.error === 'aborted') mensaje = "La grabación fue interrumpida.";
      
      setError(mensaje);
      setIsListening(false);
    };

    recog.onend = () => {
      setIsListening(false);
    };

    setRecognition(recog);
  }, []);

  const startListening = useCallback(() => {
    if (!recognition) {
      setError('El reconocimiento de voz no está disponible en este navegador.');
      return;
    }

    setError(null);
    setTranscript('');

    try {
      recognition.start();
      // NOTA: No forzamos setIsListening(true) aquí. 
      // Esperamos a que onstart confirme que el hardware arrancó.
    } catch (e) {
      console.warn('El reconocimiento ya estaba en curso.');
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      // Mantenemos esto por seguridad en caso de que onend falle silenciosamente (típico en iOS)
      setIsListening(false);
    }
  }, [recognition]);

  return { transcript, isListening, error, startListening, stopListening };
};

export default useVoiceCommand;
