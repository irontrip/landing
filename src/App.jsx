function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <a href="#" className="font-semibold text-white tracking-tight text-lg">Irontrip</a>
          <nav className="hidden sm:flex items-center gap-2">
            <a href="#waitlist" className="inline-flex items-center rounded-md bg-indigo-500/90 hover:bg-indigo-400 px-4 py-2 text-sm font-medium text-white transition">Join Waitlist</a>
            <a href="#lend" className="inline-flex items-center rounded-md border border-white/20 hover:border-white/40 px-4 py-2 text-sm font-medium text-white/90 transition">Lend Your Gear</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-x-40 -top-56 h-[32rem] rotate-12 bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/10 to-cyan-500/20 blur-3xl"></div>
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
              Fitness that travels. <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400">Community that lasts.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-slate-300">
              Irontrip helps nomads keep their training rituals alive anywhere — and gives locals a way to share their gear, connect, and build community.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a id="waitlist" href="#" className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-indigo-500 hover:bg-indigo-400 px-6 py-3 text-base font-medium text-white shadow-lg shadow-indigo-500/20 transition">
                👉 Join Waitlist
              </a>
              <a id="lend" href="#" className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-white/20 hover:border-white/40 px-6 py-3 text-base font-medium text-white/90 backdrop-blur transition">
                👉 Lend Your Gear
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nomads */}
            <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 ring-1 ring-black/10 transition hover:bg-white/[0.07]">
              <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-cyan-500/10 pointer-events-none"></div>
              <h3 className="text-xl font-semibold text-white">For Nomads</h3>
              <p className="mt-2 text-2xl font-bold text-slate-100">Access your training, anywhere.</p>
              <p className="mt-4 text-slate-300 leading-relaxed">
                Stay consistent on the road. Irontrip connects you to simple tools and portable rituals that fit your lifestyle, so you never lose your rhythm.
              </p>
            </div>
            {/* Locals */}
            <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 ring-1 ring-black/10 transition hover:bg-white/[0.07]">
              <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-cyan-500/10 via-fuchsia-500/5 to-indigo-500/10 pointer-events-none"></div>
              <h3 className="text-xl font-semibold text-white">For Locals</h3>
              <p className="mt-2 text-2xl font-bold text-slate-100">Your gear, their journey.</p>
              <p className="mt-4 text-slate-300 leading-relaxed">
                Lend your equipment, meet like‑minded people, and spark connections rooted in movement and resilience. Build community while empowering nomads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Irontrip</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-200 transition">Privacy</a>
            <a href="#" className="hover:text-slate-200 transition">Contact</a>
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:text-slate-200 transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
