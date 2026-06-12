function DashboardPreview() {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-32">

      <div className="relative">

        {/* Glow */}
        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-3xl"></div>

        {/* Panel */}
        <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 text-center">

          <div className="flex items-center justify-start gap-2 mb-6">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>

          <div className="space-y-6">

            <div className="border border-zinc-800 rounded-2xl p-6">
              <p className="text-zinc-400 text-sm">
                🎤 Last Voice Command
              </p>

              <h3 className="text-2xl font-semibold mt-2">
                Add 20 units of Product A
              </h3>

              <p className="text-green-400 mt-3">
                ✓ Inventory Updated Successfully
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="bg-black rounded-xl p-4 text-center">
                <p className="text-zinc-500 text-sm">Products</p>
                <h3 className="text-3xl font-bold">1,245</h3>
              </div>

              <div className="bg-black rounded-xl p-4 text-center">
                <p className="text-zinc-500 text-sm">Orders</p>
                <h3 className="text-3xl font-bold">324</h3>
              </div>

              <div className="bg-black rounded-xl p-4 text-center">
                <p className="text-zinc-500 text-sm">Accuracy</p>
                <h3 className="text-3xl font-bold">99%</h3>
              </div>

              <div className="bg-black rounded-xl p-4 text-center">
                <p className="text-zinc-500 text-sm">AI Status</p>
                <h3 className="text-3xl font-bold text-green-400">ON</h3>
              </div>

            </div>

            <div className="border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">
                Recent Activity
              </h3>

              <div className="space-y-3 text-zinc-400">

                <p>• Added 20 units of Product A</p>

                <p>• Removed 5 units of Product B</p>

                <p>• Stock verification completed</p>

                <p>• New inventory report generated</p>

              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default DashboardPreview;