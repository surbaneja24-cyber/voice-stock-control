function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-10 py-5 backdrop-blur-xl bg-black/70 border-b border-white/10">

      <h1 className="text-2xl font-bold">
        VoxStock
      </h1>

      <div className="hidden md:flex gap-8 text-zinc-400">
        <a href="#features" className="hover:text-white transition">
          Dashboard
        </a>

        <a href="#pricing" className="hover:text-white transition">
          Pricing
        </a>

        <a href="#faq" className="hover:text-white transition">
          Voice AI
        </a>

        <a href="#contact" className="hover:text-white transition">
          Contact
        </a>
        <div className="relative group">
          <button className="text-zinc-400 hover:text-white transition">
            Language ▼
          </button>

          <div className="absolute top-full mt-2 hidden group-hover:block bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl min-w-[180px]">

            <div className="p-2 flex flex-col">

              <button className="px-4 py-2 text-left hover:bg-zinc-800 rounded-lg">
                🇪🇸 Español
              </button>

              <button className="px-4 py-2 text-left hover:bg-zinc-800 rounded-lg">
                🇬🇧 English
              </button>

              <button className="px-4 py-2 text-left hover:bg-zinc-800 rounded-lg">
                🇨🇳 中文
              </button>

              <button className="px-4 py-2 text-left hover:bg-zinc-800 rounded-lg">
                🇫🇷 Français
              </button>

              <button className="px-4 py-2 text-left hover:bg-zinc-800 rounded-lg">
                🇩🇪 Deutsch
              </button>

              <button className="px-4 py-2 text-left hover:bg-zinc-800 rounded-lg">
                🇮🇹 Italiano
              </button>

              <button className="px-4 py-2 text-left hover:bg-zinc-800 rounded-lg">
                🇵🇹 Português
              </button>

              <button className="px-4 py-2 text-left hover:bg-zinc-800 rounded-lg">
                Català
              </button>

            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="px-5 py-2 border border-zinc-700 rounded-xl">
          Login
        </button>

        <button className="px-5 py-2 bg-white text-black rounded-xl font-semibold">
          Get Started
        </button>
      </div>

    </nav>
  );
}

export default Navbar;