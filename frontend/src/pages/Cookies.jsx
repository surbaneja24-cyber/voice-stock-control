function Cookies() {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-5xl mx-auto">

        {/* Header */}

        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Cookies Policy
          </h1>

          <p className="text-zinc-400 text-lg">
            Last updated: June 2026
          </p>
        </div>

        {/* Content */}

        <div className="space-y-8">

          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-4">
              What Are Cookies?
            </h2>

            <p className="text-zinc-300 leading-relaxed">
              Cookies are small text files stored on your device when
              you visit a website. They help websites remember user
              preferences, improve performance, and provide a better
              browsing experience.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-4">
              How VoxStock Uses Cookies
            </h2>

            <p className="text-zinc-300 leading-relaxed">
              VoxStock uses cookies to maintain secure sessions,
              remember user preferences, analyze platform usage,
              and improve overall functionality and performance.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-4">
              Types of Cookies We Use
            </h2>

            <ul className="space-y-3 text-zinc-300">
              <li>
                • Essential Cookies – Required for platform operation.
              </li>

              <li>
                • Functional Cookies – Store user preferences and settings.
              </li>

              <li>
                • Analytics Cookies – Help us understand how users interact
                with VoxStock.
              </li>

              <li>
                • Security Cookies – Help protect accounts and prevent abuse.
              </li>
            </ul>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-4">
              Managing Cookies
            </h2>

            <p className="text-zinc-300 leading-relaxed">
              Most web browsers allow you to control or disable cookies
              through browser settings. Please note that disabling cookies
              may affect certain features and functionality of the platform.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold mb-4">
              Consent
            </h2>

            <p className="text-zinc-300 leading-relaxed">
              By continuing to use VoxStock, you agree to the use of
              cookies in accordance with this Cookies Policy.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Cookies;