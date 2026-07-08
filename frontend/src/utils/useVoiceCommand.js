import { useState, useEffect, useCallback } from 'react';

const useVoiceCommand = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Verificamos si estamos en el navegador y si la API está soportada
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setError('El navegador no soporta dictado por voz. Usa Google Chrome o Edge.');
        return;
      }

      const recog = new SpeechRecognition();
      // 'false' obliga a que escuche una sola frase y se apague (ideal para WMS)
      recog.continuous = false; 
      recog.lang = 'es-ES'; // Forzamos el idioma a español
      recog.interimResults = false; // Solo queremos el resultado final limpio

      recog.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
      };

      recog.onerror = (event) => {
        setError(`Error de micrófono: ${event.error}`);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    if (recognition) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.warn("El reconocimiento ya estaba en curso.");
      }
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return { transcript, isListening, error, startListening, stopListening };
};

export default useVoiceCommand;