import { useEffect, useState, useMemo } from 'react'
import { translations, getText, availableLangs, detectInitialLang } from './i18n'

function ContactSection({ lang }) {
  const dict = {
    en: { /* ... igual que antes ... */ },
    es: { /* ... igual que antes ... */ },
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
      if (recaptchaSiteKey && window.grecaptcha?.execute) {
        await new Promise((ready) => window.grecaptcha.ready(ready))
        recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, { action: 'contact' })
        console.log('🎟️ reCAPTCHA token length:', recaptchaToken?.length || 0)
      }

      // 👇 Simplified payloads
      const payload = contactEndpoint
        ? {
            "g-recaptcha-response": recaptchaToken,
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
            "g-recaptcha-response": recaptchaToken,
          }

      const endpoint = contactEndpoint || 'https://api.web3forms.com/submit'
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
      {/* ... resto del form exactamente igual ... */}
    </section>
  )
}

function App() {
  const [lang, setLang] = useState(detectInitialLang())
  const [contactOpen, setContactOpen] = useState(false)
  const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

  useEffect(() => {
    try { localStorage.setItem('lang', lang) } catch {}
    if (typeof document !== 'undefined') document.documentElement.lang = lang
  }, [lang])

  const t = useMemo(() => (path, vars) => getText(translations, lang, path, vars), [lang])

  // Load reCAPTCHA script
  useEffect(() => {
    if (!recaptchaSiteKey || typeof document === 'undefined') return
    const src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(recaptchaSiteKey)}`
    if (!Array.from(document.scripts).some((s) => s.src.includes('/recaptcha/api.js'))) {
      const s = document.createElement('script')
      s.src = src
      s.async = true
      s.defer = true
      document.head.appendChild(s)
    }
  }, [recaptchaSiteKey])

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* header, hero, value props … */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setContactOpen(false)} />
          <div role="dialog" className="relative z-10 w-full max-w-3xl px-4 sm:px-6 py-8">
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur">
              <button onClick={() => setContactOpen(false)} className="absolute right-3 top-3">✕</button>
              <ContactSection lang={lang} />
            </div>
          </div>
        </div>
      )}
      {/* footer … */}
    </div>
  )
}

export default App
