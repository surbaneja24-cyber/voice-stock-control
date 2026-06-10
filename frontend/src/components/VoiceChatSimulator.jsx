import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const conversation = [
  { sender: 'user', text: '¿Cuántas unidades de Coca-Cola quedan?' },
  { sender: 'bot', text: 'Quedan 24 unidades. Stock por encima del mínimo.' },
  { sender: 'user', text: 'Añade 20 cajas de agua.' },
  { sender: 'bot', text: 'Registrado. Stock actualizado a 45 cajas.' },
];

const VoiceChatSimulator = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    conversation.forEach((msg, index) => {
      setTimeout(() => {
        setMessages((prev) => [...prev, msg]);
      }, index * 2000);
    });
  }, []);

  return (
    <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl border border-slate-700 max-w-lg mx-auto">
      <div className="space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg text-sm ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white ml-auto max-w-[80%]' 
                  : 'bg-slate-800 text-slate-300 mr-auto max-w-[80%]'
              }`}
            >
              {msg.sender === 'bot' && <span className="mr-2">🤖</span>}
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VoiceChatSimulator;