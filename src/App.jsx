import { useEffect, useState } from 'react'
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
          try {
            const mode = import.meta.env.MODE
            if (typeof window !== 'undefined' && mode !== 'production') {
              console.log('reCAPTCHA token length:', recaptchaToken?.length || 0)
            }
          } catch {}
        } catch {}
      }

      // Siempre usar URL absoluta
      const endpoint =
        contactEndpoint?.startsWith('http')
          ? contactEndpoint
          : 'https://irontrip-recaptcha.irontrip-fit.workers.dev'

      console.log('📬 Sending contact form to endpoint:', endpoint)

      const payload = {
        token: recaptchaToken,
        name,
        email,
        message,
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
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

export default ContactSection
