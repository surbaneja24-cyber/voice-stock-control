import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav
      className="
      sticky top-0 z-50
      flex justify-between items-center
      px-10 py-5
      backdrop-blur-2xl
      bg-black/80
      border-b border-white/5
      shadow-[0_8px_30px_rgba(0,0,0,0.5)]
      "
    >
      {/* Logo */}

      <Link
        to="/"
        className="
  text-2xl font-bold tracking-tight
  bg-gradient-to-r
  from-white
  via-zinc-300
  to-zinc-500
  bg-clip-text
  text-transparent
  hover:scale-105
  transition-all duration-300
  "
      >
        VoxStock
      </Link>

      {/* Navigation */}

      <div className="hidden md:flex gap-8">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `transition-all duration-300 hover:scale-105 ${isActive
              ? "text-white font-semibold border-b-2 border-white pb-1"
              : "text-white/70 hover:text-white"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            `transition-all duration-300 hover:scale-105 ${isActive
              ? "text-white font-semibold border-b-2 border-white pb-1"
              : "text-white/70 hover:text-white"
            }`
          }
        >
          History
        </NavLink>

        <NavLink
          to="/pricing"
          className={({ isActive }) =>
            `transition-all duration-300 hover:scale-105 ${isActive
              ? "text-white font-semibold border-b-2 border-white pb-1"
              : "text-white/70 hover:text-white"
            }`
          }
        >
          Pricing
        </NavLink>

        <NavLink
          to="/VoiceAI"
          className={({ isActive }) =>
            `transition-all duration-300 hover:scale-105 ${isActive
              ? "text-white font-semibold border-b-2 border-white pb-1"
              : "text-white/70 hover:text-white"
            }`
          }
        >
          Voice AI
        </NavLink>

        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `transition-all duration-300 hover:scale-105 ${isActive
              ? "text-white font-semibold border-b-2 border-white pb-1"
              : "text-white/70 hover:text-white"
            }`
          }
        >
          Contact
        </NavLink>

        {/* Language */}

        <div className="relative group">
          <button
            className="
            text-white/90
            hover:text-white
            transition-all duration-300
            "
          >
            Language ▼
          </button>

          <div
            className="
  absolute top-full mt-3
  hidden group-hover:block
  bg-zinc-900/95
  text-white
  backdrop-blur-xl
  border border-white/10
  rounded-2xl
  shadow-2xl
  min-w-[200px]
  overflow-hidden
  "
          >
            <div className="p-2 flex flex-col">

              {[
                "🇪🇸 Español",
                "🇬🇧 English",
                "🇨🇳 中文",
                "🇫🇷 Français",
                "🇩🇪 Deutsch",
                "🇮🇹 Italiano",
                "🇵🇹 Português",
                "🇨🇦 Català",
              ].map((lang) => (
                <button
                  key={lang}
                  className="
                  px-4 py-3 text-left
                  rounded-xl
                  hover:bg-white/10
                  transition
                  "
                >
                  {lang}
                </button>
              ))}

            </div>
          </div>
        </div>

      </div>

      {/* Buttons */}

      <div className="flex gap-4">

        <button
          className="
  px-5 py-2
  rounded-xl
  border border-white/20
  bg-white/10
  text-white
  backdrop-blur-md
  hover:bg-white/20
  transition-all duration-300
  "
        >
          Login
        </button>

        <button
          className="
          px-5 py-2
          rounded-xl
          bg-white
          text-black
          font-semibold
          hover:scale-105
          hover:shadow-[0_0_30px_rgba(255,255,255,0.35)]
          transition-all duration-300
          "
        >
          Get Started
        </button>

      </div>
    </nav>
  );
}

export default Navbar;