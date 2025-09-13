import { useEffect, useState, useMemo } from 'react'
import { translations, getText, availableLangs, detectInitialLang } from './i18n'

function App() {
  const [lang, setLang] = useState(detectInitialLang())

  useEffect(() => {
    try { localStorage.setItem('lang', lang) } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  const t = useMemo(() => (path, vars) => getText(translations, lang, path, vars), [lang])

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <a href="#" className="font-semibold text-white tracking-tight text-lg">{t('brand')}</a>
          <div className="flex items-center gap-2">
            <nav className="hidden sm:flex items-center gap-2">
              <a href="#waitlist" className="inline-flex items-center rounded-md bg-indigo-500/90 hover:bg-indigo-400 px-4 py-2 text-sm font-medium text-white transition">{t('hero.ctaWaitlist')}</a>
              <a href="#lend" className="inline-flex items-center rounded-md border border-white/20 hover:border-white/40 px-4 py-2 text-sm font-medium text-white/90 transition">{t('hero.ctaLend')}</a>
            </nav>
            <div className="flex items-center rounded-md border border-white/15 overflow-hidden">
              {availableLangs.map(({ code, label }) => (
                <button
                  key={code}
                  aria-label={`Switch language to ${label}`}
                  onClick={() => setLang(code)}
                  className={`px-3 py-1 text-xs font-medium transition ${
                    lang === code ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -inset-x-40 -top-56 h-[32rem] rotate-12 bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/10 to-cyan-500/20 blur-3xl"></div>
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-8 sm:pt-24 sm:pb-12">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
              <span className="block">{t('hero.headline1')}</span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400">{t('hero.headline2')}</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl leading-relaxed text-slate-300">{t('hero.sub')}</p>
            {/* CTAs moved into cards below */}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="relative mt-6 sm:mt-8 lg:mt-10">
        <div className="mx-auto max-w-7xl px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nomads */}
            <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 ring-1 ring-black/10 transition hover:bg-white/[0.07] flex flex-col">
              <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-cyan-500/10 pointer-events-none"></div>
              <h3 className="text-xl font-semibold text-white">{t('value.nomadsTitle')}</h3>
              <p className="mt-2 text-2xl font-bold text-slate-100">{t('value.nomadsHeadline')}</p>
              <p className="mt-4 text-slate-300 leading-relaxed">{t('value.nomadsBody')}</p>
              <div className="mt-auto pt-6">
                <a id="waitlist" href="#" className="inline-flex items-center rounded-lg bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition">
                  {t('hero.ctaWaitlist')}
                </a>
              </div>
            </div>
            {/* Locals */}
            <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 ring-1 ring-black/10 transition hover:bg-white/[0.07] flex flex-col">
              <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-cyan-500/10 via-fuchsia-500/5 to-indigo-500/10 pointer-events-none"></div>
              <h3 className="text-xl font-semibold text-white">{t('value.localsTitle')}</h3>
              <p className="mt-2 text-2xl font-bold text-slate-100">{t('value.localsHeadline')}</p>
              <p className="mt-4 text-slate-300 leading-relaxed">{t('value.localsBody')}</p>
              <div className="mt-auto pt-6">
                <a id="lend" href="#" className="inline-flex items-center rounded-lg bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition">
                  {t('hero.ctaLend')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-200 transition">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-slate-200 transition">{t('footer.contact')}</a>
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:text-slate-200 transition">{t('footer.github')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
