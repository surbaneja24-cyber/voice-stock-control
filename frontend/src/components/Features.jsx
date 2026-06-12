function Features() {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-32">

      <h2 className="text-4xl font-bold text-center mb-16">
        Why VoiceStock?
      </h2>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-zinc-900 border border-zinc-800 p-8 text-center min-h-[180px] rounded-3xl hover:scale-105 hover:border-white transition duration-300">
          <h3 className="text-xl font-semibold mb-3">
            Voice Recognition
          </h3>

          <p className="text-zinc-400">
            Manage inventory using natural voice commands.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 text-center min-h-[180px] rounded-3xl hover:scale-105 hover:border-white transition duration-300">
          <h3 className="text-xl font-semibold mb-3">
            AI Processing
          </h3>

          <p className="text-zinc-400">
            Gemini AI understands and structures commands automatically.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 text-center min-h-[180px] rounded-3xl hover:scale-105 hover:border-white transition duration-300">
          <h3 className="text-xl font-semibold mb-3">
            Real-Time Stock
          </h3>

          <p className="text-zinc-400">
            Update products instantly without touching a keyboard.
          </p>
        </div>

      </div>

    </section>
  );
}

export default Features;