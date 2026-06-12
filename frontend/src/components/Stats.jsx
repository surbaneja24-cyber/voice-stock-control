function Stats() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-center px-6">

      <div>
        <h2 className="text-5xl font-bold">99%</h2>
        <p className="text-zinc-400 mt-2">Voice Accuracy</p>
      </div>

      <div>
        <h2 className="text-5xl font-bold">24/7</h2>
        <p className="text-zinc-400 mt-2">Availability</p>
      </div>

      <div>
        <h2 className="text-5xl font-bold">10x</h2>
        <p className="text-zinc-400 mt-2">Faster Operations</p>
      </div>

    </section>
  );
}

export default Stats;