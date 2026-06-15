function Privacy() {
return ( <div className="min-h-screen bg-black text-white px-6 py-20"> <div className="max-w-5xl mx-auto">

    {/* Header */}

    <div className="mb-16">
      <h1 className="text-5xl md:text-6xl font-bold mb-4">
        Privacy Policy
      </h1>

      <p className="text-zinc-400 text-lg">
        Last updated: June 2026
      </p>
    </div>

    {/* Content */}

    <div className="space-y-8">

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Information We Collect
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          VoxStock may collect personal information such as your
          name, email address, account credentials, inventory data,
          and usage analytics when you interact with the platform.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          How We Use Your Information
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          The information we collect is used to provide, maintain,
          secure and improve the VoxStock platform. This includes
          inventory management features, voice command processing,
          user authentication and service optimization.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Data Protection
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          We implement appropriate technical and organizational
          measures to protect your data against unauthorized access,
          disclosure, alteration or destruction.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Sharing of Information
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          VoxStock does not sell, rent or trade personal information.
          Data may only be shared when required by law, to protect
          legal rights, or with trusted service providers necessary
          for platform operation.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          User Rights
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          Users may request access, correction or deletion of their
          personal information in accordance with applicable privacy
          regulations and data protection laws.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Contact
        </h2>

        <p className="text-zinc-300 leading-relaxed">
          If you have any questions regarding this Privacy Policy,
          please contact the VoxStock team through the official
          support channels available on the platform.
        </p>
      </div>

    </div>

  </div>
</div>

);
}

export default Privacy;
