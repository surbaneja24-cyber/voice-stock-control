function Terms() {
return ( <div className="min-h-screen bg-black text-white px-6 py-20"> <div className="max-w-5xl mx-auto">

    {/* Header */}

    <div className="mb-16">
      <h1 className="text-5xl md:text-6xl font-bold mb-4">
        Terms of Service
      </h1>

      <p className="text-zinc-400 text-lg">
        Last updated: June 2026
      </p>
    </div>

    {/* Content */}

    <div className="space-y-8">

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Acceptance of Terms
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          By accessing or using VoxStock, you agree to be bound by
          these Terms of Service. If you do not agree with any part
          of these terms, you should not use the platform.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          User Responsibilities
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          Users are responsible for maintaining the accuracy of
          inventory records, account information and all data
          entered into the platform.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Acceptable Use
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          Users may not attempt to interfere with, disrupt,
          compromise or gain unauthorized access to VoxStock,
          its systems, infrastructure or data.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Service Availability
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          While we strive to maintain reliable service,
          VoxStock does not guarantee uninterrupted platform
          availability and may perform maintenance, updates
          or modifications at any time.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Limitation of Liability
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          VoxStock shall not be liable for any indirect,
          incidental or consequential damages arising from
          the use or inability to use the platform.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Changes to the Terms
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          VoxStock reserves the right to update or modify
          these Terms of Service at any time. Continued use
          of the platform after changes constitutes acceptance
          of the revised terms.
        </p>
      </div>

    </div>

  </div>
</div>

);
}

export default Terms;
