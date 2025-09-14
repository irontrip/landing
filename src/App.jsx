import { useEffect, useState, useMemo } from 'react'
import { translations, getText, availableLangs, detectInitialLang } from './i18n'

function ContactSection({ lang }) {
  const dict = {
    en: {
      title: 'Contact Us',
      subtitle:
        'Have a question or want to say hi? Send us a message and we will get back to you.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      submit: 'Submit',
      submitting: 'Submitting…',
      successTitle: 'Message sent!',
      successBody: 'Thanks for reaching out. We have received your message.',
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      notConfigured:
        'Contact form is not configured yet. Please set VITE_WEB3FORMS_ACCESS_KEY in the environment.',
    },
    es: {
      title: 'Contáctanos',
      subtitle:
        '¿Tienes una pregunta o quieres saludar? Envíanos un mensaje y te responderemos.',
      name: 'Nombre',
      email: 'Correo electrónico',
      message: 'Mensaje',
      submit: 'Enviar',
      submitting: 'Enviando…',
      successTitle: '¡Mensaje enviado!',
      successBody: 'Gracias por escribirnos. Hemos recibido tu mensaje.',
      required: 'Este campo es obligatorio',
      invalidEmail: 'Introduce un correo válido',
      notConfigured:
        'El formulario aún no está configurado. Añade VITE_WEB3FORMS_ACCESS_KEY al entorno.',
    },
  }
  const L = dict[lang] ?? dict.en

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverMsg, setServerMsg] = useState('')
  const [botField, setBotField] = useState('')

  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
  const contactEndpoint = import.meta.env.VITE_CONTACT_ENDPOINT

  // Load reCAPTCHA script on demand
  useEffect(() => {
    if (!recaptchaSiteKey || typeof document === 'undefined') return
    const src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(recaptchaSiteKey)}`
    const already = Array.from(document.scripts).some((s) => s.src.includes('/recaptcha/api.js'))
    if (!already) {
      const s = document.createElement('script')
      s.src = src
      s.async = true
      document.head.appendChild(s)
      return () => {
        // do not remove script to avoid thrashing if modal re-opens
      }
    }
  }, [recaptchaSiteKey])

  function validate() {
    const next = {}
    if (!name.trim()) next.name = L.required
    if (!email.trim()) next.email = L.required
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)) next.email = L.invalidEmail
    if (!message.trim()) next.message = L.required
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    if (botField) return
    setSubmitting(true)
    setServerMsg('')
    await new Promise((r) => setTimeout(r, 400))
    try {
      let recaptchaToken = ''
      if (recaptchaSiteKey && window.grecaptcha && window.grecaptcha.execute) {
        try {
          await new Promise((ready) => window.grecaptcha.ready(ready))
          recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, { action: 'contact' })
          // Lightweight debug (length only)
          if (typeof window !== 'undefined' && process?.env?.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log('reCAPTCHA token length:', recaptchaToken?.length || 0)
          }
        } catch {}
      }

      // Prefer proxy endpoint if provided (server-side verifies reCAPTCHA)
      const endpoint = contactEndpoint || 'https://api.web3forms.com/submit'
      const payload = contactEndpoint
        ? {
            token: recaptchaToken,
            name,
            email,
            message,
          }
        : {
            access_key: accessKey || 'MISSING-ACCESS-KEY',
            name,
            email,
            message,
            subject: 'Irontrip Contact',
            from_name: 'Irontrip Landing',
            botcheck: botField,
            // For services that accept it, include common captcha fields
            'g-recaptcha-response': recaptchaToken,
            recaptcha_token: recaptchaToken,
          }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) {
        setSuccess(true)
        setName('')
        setEmail('')
        setMessage('')
      } else {
        setServerMsg(data.message || 'Error')
      }
    } catch (err) {
      setServerMsg(String(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="contact" className="relative mt-2 sm:mt-4">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-2xl shadow-black/40 ring-1 ring-black/10">
          <h2 id="contact-title" className="text-2xl font-semibold text-white">{L.title}</h2>
          <p className="mt-2 text-slate-300">{L.subtitle}</p>

          {success ? (
            <div className="mt-6 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
              <p className="font-medium">{L.successTitle}</p>
              <p className="text-sm mt-1">{L.successBody}</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              {!accessKey && (
                <p className="text-amber-300 text-sm">{L.notConfigured}</p>
              )}

              {/* Honeypot */}
              <input
                type="text"
                value={botField}
                onChange={(e) => setBotField(e.target.value)}
                className="hidden"
                autoComplete="off"
                tabIndex="-1"
              />

              <div>
                <label className="block text-sm text-slate-300 mb-1">{L.name}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  autoFocus
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-xs text-rose-300">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">{L.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-xs text-rose-300">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">{L.message}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-invalid={errors.message ? 'true' : 'false'}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                />
                {errors.message && (
                  <p id="message-error" className="mt-1 text-xs text-rose-300">{errors.message}</p>
                )}
              </div>

              {serverMsg && <p className="text-sm text-amber-300">{serverMsg}</p>}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center rounded-lg bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition disabled:opacity-60"
                >
                  {submitting ? L.submitting : L.submit}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function App() {
  const [lang, setLang] = useState(detectInitialLang())
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    try { localStorage.setItem('lang', lang) } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  const t = useMemo(() => (path, vars) => getText(translations, lang, path, vars), [lang])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (contactOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      const onKey = (e) => { if (e.key === 'Escape') setContactOpen(false) }
      window.addEventListener('keydown', onKey)
      return () => {
        document.body.style.overflow = prev
        window.removeEventListener('keydown', onKey)
      }
    }
  }, [contactOpen])

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/5 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-3 font-semibold text-white tracking-tight text-lg">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Irontrip logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded" />
            {t('brand')}
          </a>
          <div className="flex items-center gap-2">
            <nav className="hidden sm:flex items-center gap-2">
              <a href="#waitlist" className="inline-flex items-center rounded-md border border-white/20 hover:border-white/40 px-4 py-2 text-sm font-medium text-white/90 transition">{t('hero.ctaWaitlist')}</a>
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
              <img
                src={`${import.meta.env.BASE_URL}icons/road.png`}
                alt="Road icon"
                className="pointer-events-none select-none absolute -top-3 -right-3 w-16 sm:w-20 opacity-85 drop-shadow-xl saturate-150 brightness-110 contrast-125"
                draggable="false"
              />
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
              <img
                src={`${import.meta.env.BASE_URL}icons/kettlebell.png`}
                alt="Kettlebell icon"
                className="pointer-events-none select-none absolute -top-3 -right-3 w-16 sm:w-20 opacity-85 drop-shadow-xl saturate-150 brightness-110 contrast-125"
                draggable="false"
              />
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

      {/* Contact Modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setContactOpen(false)}></div>
          <div role="dialog" aria-modal="true" aria-labelledby="contact-title" className="relative z-10 w-full max-w-3xl px-4 sm:px-6 py-8">
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur">
              <button
                type="button"
                aria-label="Close"
                onClick={() => setContactOpen(false)}
                className="absolute right-3 top-3 z-20 rounded-md bg-white/10 hover:bg-white/20 text-white/80 p-1 pointer-events-auto"
              >
                ✕
              </button>
              <ContactSection lang={lang} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-4">
            <a href="privacy.html" className="hover:text-slate-200 transition">{t('footer.privacy')}</a>
            <button type="button" onClick={() => setContactOpen(true)} className="hover:text-slate-200 transition">
              {t('footer.contact')}
            </button>
            <a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:text-slate-200 transition">{t('footer.github')}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
