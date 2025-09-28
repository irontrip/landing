import { useMemo, useState } from 'react'
import LocationAutocomplete from './LocationAutocomplete'

const STRINGS = {
  en: {
    title: 'Share your gear with Irontrip',
    subtitle:
      'Tell us about your equipment and availability so we can connect the right nomads with you.',
    step: (current, total) => `Step ${current} of ${total}`,
    sections: ['Essentials', 'Equipment profile', 'Community context', 'Hosting preferences'],
    fields: {
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone (optional)',
      location: 'City or location',
      equipment: 'Available equipment',
      equipmentOther: 'Other equipment (describe)',
      condition: 'Condition of equipment',
      access: 'Equipment access',
      openToTraining: 'Open to training together?',
      connectionPrefs: 'Preferred way to connect',
      languages: 'Languages you speak',
      availability: 'Availability (days, times, notes)',
      requirements: 'Requirements or guidelines',
    },
    options: {
      equipment: ['Kettlebell', 'Macebell', 'Dumbbell', 'Clubbell', 'Sandbag'],
      condition: ['Excellent', 'Good', 'Used but functional'],
      access: ['At home only', 'Can bring outdoors', 'Flexible'],
      connectionPrefs: ['Quick workout', 'Coffee + chat', 'Just lend gear'],
    },
    yes: 'Yes',
    no: 'No',
    actions: {
      back: 'Back',
      next: 'Next',
      submit: 'Submit host profile',
      submitting: 'Submitting…',
      close: 'Close',
    },
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    noEndpoint: 'Local onboarding is not available yet. Please try again later.',
    successTitle: 'Profile submitted!',
    successBody:
      'Thanks for sharing your equipment and availability. We will reach out once a nomad requests to connect.',
  },
  es: {
    title: 'Comparte tu equipo con Irontrip',
    subtitle:
      'Cuéntanos sobre tu equipamiento y disponibilidad para conectar con los nómadas adecuados.',
    step: (current, total) => `Paso ${current} de ${total}`,
    sections: ['Esenciales', 'Perfil de equipo', 'Contexto comunitario', 'Preferencias de hosting'],
    fields: {
      fullName: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Teléfono (opcional)',
      location: 'Ciudad o ubicación',
      equipment: 'Equipo disponible',
      equipmentOther: 'Otro equipo (descríbelo)',
      condition: 'Estado del equipo',
      access: 'Acceso al equipo',
      openToTraining: '¿Abierto a entrenar juntos?',
      connectionPrefs: 'Forma preferida de conectar',
      languages: 'Idiomas que hablas',
      availability: 'Disponibilidad (días, horarios, notas)',
      requirements: 'Requisitos o pautas',
    },
    options: {
      equipment: ['Kettlebell', 'Macebell', 'Mancuerna', 'Clubbell', 'Sandbag'],
      condition: ['Excelente', 'Buena', 'Usada pero funcional'],
      access: ['Solo en casa', 'Puedo llevarla al exterior', 'Flexible'],
      connectionPrefs: ['Entrenamiento rápido', 'Café + charla', 'Solo préstamo de equipo'],
    },
    yes: 'Sí',
    no: 'No',
    actions: {
      back: 'Atrás',
      next: 'Siguiente',
      submit: 'Enviar perfil de host',
      submitting: 'Enviando…',
      close: 'Cerrar',
    },
    required: 'Este campo es obligatorio',
    invalidEmail: 'Introduce un correo válido',
    noEndpoint: 'El onboarding para locales aún no está disponible. Intenta más tarde.',
    successTitle: '¡Perfil enviado!',
    successBody:
      'Gracias por compartir tu equipamiento y disponibilidad. Te contactaremos cuando un nómada solicite conectar.',
  },
}

const FORM_ID = 'local-onboarding'
const RECAPTCHA_ACTION = 'local_onboarding'
const TOTAL_STEPS = 4

const INITIAL_VALUES = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  locationDetails: null,
  locationReview: '',
  equipment: [],
  equipmentOther: '',
  condition: '',
  access: '',
  openToTraining: 'yes',
  connectionPrefs: [],
  languages: '',
  availability: '',
  requirements: '',
}

function LocalOnboardingForm({ lang, recaptchaSiteKey, endpoint, onClose }) {
  const L = useMemo(() => STRINGS[lang] ?? STRINGS.en, [lang])
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverMsg, setServerMsg] = useState('')
  const [botField, setBotField] = useState('')

  function setLocationField(textValue, details) {
    setValues((prev) => ({
      ...prev,
      location: textValue,
      locationDetails: details || null,
      locationReview: details?.manual ? 'manual-entry' : '',
    }))
    setErrors((prev) => ({ ...prev, location: undefined }))
  }

  function updateValue(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function toggleMulti(field, option) {
    setValues((prev) => {
      const next = new Set(prev[field])
      if (next.has(option)) next.delete(option)
      else next.add(option)
      return { ...prev, [field]: Array.from(next) }
    })
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)
  }

  function validateStep(currentStep) {
    const nextErrors = {}
    if (currentStep === 0) {
      if (!values.fullName.trim()) nextErrors.fullName = L.required
      if (!values.email.trim()) nextErrors.email = L.required
      else if (!validateEmail(values.email.trim())) nextErrors.email = L.invalidEmail
      if (!values.location.trim()) nextErrors.location = L.required
    } else if (currentStep === 1) {
      if (!values.equipment.length && !values.equipmentOther.trim()) {
        nextErrors.equipment = L.required
      }
      if (!values.condition) nextErrors.condition = L.required
      if (!values.access) nextErrors.access = L.required
    } else if (currentStep === 2) {
      if (!values.languages.trim()) nextErrors.languages = L.required
      if (!values.openToTraining) nextErrors.openToTraining = L.required
      if (values.openToTraining === 'yes' && !values.connectionPrefs.length) {
        nextErrors.connectionPrefs = L.required
      }
    } else if (currentStep === 3) {
      if (!values.availability.trim()) nextErrors.availability = L.required
      if (!values.requirements.trim()) nextErrors.requirements = L.required
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleNext() {
    if (validateStep(step)) {
      setServerMsg('')
      setStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1))
    }
  }

  function handleBack() {
    setServerMsg('')
    setStep((prev) => Math.max(prev - 1, 0))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validateStep(step)) return
    if (botField) return
    if (!endpoint) {
      setServerMsg(L.noEndpoint)
      return
    }
    setSubmitting(true)
    setServerMsg('')
    await new Promise((resolve) => setTimeout(resolve, 400))
    try {
      let recaptchaToken = ''
      if (recaptchaSiteKey && window.grecaptcha?.execute) {
        await new Promise((ready) => window.grecaptcha.ready(ready))
        recaptchaToken = await window.grecaptcha.execute(recaptchaSiteKey, { action: RECAPTCHA_ACTION })
      }

      const messageSummary = [
        `Name: ${values.fullName}`,
        `Email: ${values.email}`,
        `Phone: ${values.phone || 'N/A'}`,
        `Location: ${values.location}`,
        `Equipment: ${values.equipment.join(', ') || 'N/A'}`,
        values.equipmentOther ? `Other equipment: ${values.equipmentOther}` : '',
        `Condition: ${values.condition}`,
        `Access: ${values.access}`,
        `Open to training: ${values.openToTraining}`,
        `Connection preferences: ${values.connectionPrefs.join(', ') || 'N/A'}`,
        `Languages: ${values.languages}`,
        `Availability: ${values.availability}`,
        `Requirements: ${values.requirements}`,
      ]
        .filter(Boolean)
        .join('\n')

      const payload = {
        token: recaptchaToken,
        formId: FORM_ID,
        name: values.fullName,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        location: values.location,
        locationDetails: values.locationDetails ? JSON.stringify(values.locationDetails) : '',
        locationReview: values.locationReview,
        equipment: values.equipment.join(', '),
        equipmentOther: values.equipmentOther,
        equipmentCondition: values.condition,
        equipmentAccess: values.access,
        openToTraining: values.openToTraining,
        connectionPreferences: values.connectionPrefs.join(', '),
        languages: values.languages,
        availability: values.availability,
        requirements: values.requirements,
        from: values.email,
        replyto: values.email,
        subject: 'Local onboarding',
        message: messageSummary,
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok && data.success !== false) {
        setSuccess(true)
        setValues(INITIAL_VALUES)
        setStep(0)
      } else {
        setServerMsg(data.message || data.error || 'Error')
      }
    } catch (error) {
      setServerMsg(String(error))
    } finally {
      setSubmitting(false)
    }
  }

  const sectionTitle = `${L.step(step + 1, TOTAL_STEPS)} · ${L.sections[step]}`

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-300/80">{sectionTitle}</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">{L.title}</h2>
          <p className="mt-2 text-sm text-slate-300">{L.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-slate-200 hover:bg-white/10"
        >
          ×
        </button>
      </div>

      {success ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-md border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-100">
            <h3 className="text-lg font-semibold">{L.successTitle}</h3>
            <p className="mt-1 text-sm text-emerald-50/90">{L.successBody}</p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
            >
              {L.actions.close}
            </button>
          </div>
        </div>
      ) : (
        <form className="mt-6 space-y-6" onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            value={botField}
            onChange={(event) => setBotField(event.target.value)}
            tabIndex="-1"
            autoComplete="off"
            className="hidden"
          />

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">{L.fields.fullName}</label>
                <input
                  type="text"
                  value={values.fullName}
                  onChange={(event) => updateValue('fullName', event.target.value)}
                  className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-invalid={errors.fullName ? 'true' : 'false'}
                />
                {errors.fullName && <p className="mt-1 text-xs text-rose-300">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">{L.fields.email}</label>
                <input
                  type="email"
                  value={values.email}
                  onChange={(event) => updateValue('email', event.target.value)}
                  className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && <p className="mt-1 text-xs text-rose-300">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">{L.fields.phone}</label>
                <input
                  type="tel"
                  value={values.phone}
                  onChange={(event) => updateValue('phone', event.target.value)}
                  className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <LocationAutocomplete
                lang={lang}
                label={L.fields.location}
                value={values.location}
                selected={values.locationDetails}
                onTextChange={(text) => setLocationField(text, null)}
                onSelect={(details) => {
                  if (!details) return
                  setLocationField(details.label, details)
                }}
                error={errors.location}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-300 mb-2">{L.fields.equipment}</p>
                <div className="flex flex-wrap gap-2">
                  {L.options.equipment.map((option) => {
                    const active = values.equipment.includes(option)
                    const className = `rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                        : 'border-white/15 bg-white/5 text-slate-200 hover:border-indigo-300/50'
                    }`
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleMulti('equipment', option)}
                        className={className}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
                {errors.equipment && <p className="mt-1 text-xs text-rose-300">{errors.equipment}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">{L.fields.equipmentOther}</label>
                <input
                  type="text"
                  value={values.equipmentOther}
                  onChange={(event) => updateValue('equipmentOther', event.target.value)}
                  placeholder="Resistance bands, squat rack, etc."
                  className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-2">{L.fields.condition}</p>
                <div className="flex flex-wrap gap-2">
                  {L.options.condition.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="condition"
                        value={option}
                        checked={values.condition === option}
                        onChange={(event) => updateValue('condition', event.target.value)}
                        className="accent-indigo-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.condition && <p className="mt-1 text-xs text-rose-300">{errors.condition}</p>}
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-2">{L.fields.access}</p>
                <div className="flex flex-wrap gap-2">
                  {L.options.access.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="access"
                        value={option}
                        checked={values.access === option}
                        onChange={(event) => updateValue('access', event.target.value)}
                        className="accent-indigo-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.access && <p className="mt-1 text-xs text-rose-300">{errors.access}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-300 mb-2">{L.fields.openToTraining}</p>
                <div className="flex gap-4">
                  {['yes', 'no'].map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="openToTraining"
                        value={option}
                        checked={values.openToTraining === option}
                        onChange={(event) => {
                          updateValue('openToTraining', event.target.value)
                          if (event.target.value === 'no') updateValue('connectionPrefs', [])
                        }}
                        className="accent-indigo-500"
                      />
                      {option === 'yes' ? L.yes : L.no}
                    </label>
                  ))}
                </div>
                {errors.openToTraining && <p className="mt-1 text-xs text-rose-300">{errors.openToTraining}</p>}
              </div>

              {values.openToTraining === 'yes' && (
                <div>
                  <p className="text-sm text-slate-300 mb-2">{L.fields.connectionPrefs}</p>
                  <div className="flex flex-wrap gap-2">
                    {L.options.connectionPrefs.map((option) => {
                      const active = values.connectionPrefs.includes(option)
                      const className = `rounded-full border px-3 py-1 text-xs font-medium transition ${
                        active
                          ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                          : 'border-white/15 bg-white/5 text-slate-200 hover:border-indigo-300/50'
                      }`
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleMulti('connectionPrefs', option)}
                          className={className}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                  {errors.connectionPrefs && (
                    <p className="mt-1 text-xs text-rose-300">{errors.connectionPrefs}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-300 mb-1">{L.fields.languages}</label>
                <input
                  type="text"
                  value={values.languages}
                  onChange={(event) => updateValue('languages', event.target.value)}
                  placeholder="English, Spanish, Portuguese"
                  className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-invalid={errors.languages ? 'true' : 'false'}
                />
                {errors.languages && <p className="mt-1 text-xs text-rose-300">{errors.languages}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">{L.fields.availability}</label>
                <textarea
                  rows={3}
                  value={values.availability}
                  onChange={(event) => updateValue('availability', event.target.value)}
                  placeholder="Weeknights after 6pm, weekends, etc."
                  className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-invalid={errors.availability ? 'true' : 'false'}
                />
                {errors.availability && <p className="mt-1 text-xs text-rose-300">{errors.availability}</p>}
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">{L.fields.requirements}</label>
                <textarea
                  rows={3}
                  value={values.requirements}
                  onChange={(event) => updateValue('requirements', event.target.value)}
                  placeholder="ID check, message beforehand, deposit, etc."
                  className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-invalid={errors.requirements ? 'true' : 'false'}
                />
                {errors.requirements && <p className="mt-1 text-xs text-rose-300">{errors.requirements}</p>}
              </div>
            </div>
          )}

          {serverMsg && <p className="text-sm text-amber-300">{serverMsg}</p>}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={step === 0 ? onClose : handleBack}
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:border-white/30"
            >
              {step === 0 ? L.actions.close : L.actions.back}
            </button>
            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
              >
                {L.actions.next}
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 disabled:opacity-60"
              >
                {submitting ? L.actions.submitting : L.actions.submit}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

export default LocalOnboardingForm
