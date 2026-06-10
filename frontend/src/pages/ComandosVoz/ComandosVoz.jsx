import VoiceChatSimulator from "../../components/VoiceChatSimulator";

const ComandosVoz = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 px-6">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-6">Controla tu stock con tu voz</h1>
        <p className="text-xl text-slate-400 mb-12">No escribas, habla. Actualiza tu inventario en segundos.</p>
        
        {/* Aquí entra el elemento estrella */}
        <div className="mt-10">
          <VoiceChatSimulator />
        </div>
      </section>

      {/* Problema Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 py-20">
        {/* Aquí irían tus 4 tarjetas de pain points */}
      </section>
    </div>
  );
};

export default ComandosVoz;