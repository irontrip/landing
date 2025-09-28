import { useMemo, useState } from 'react'
import LocationAutocomplete from './LocationAutocomplete'

const STRINGS = {
  en: {
    title: 'Join Irontrip as a Nomad',
    subtitle: 'Tell us how you travel and train so we can match you with the right locals and gear.',
    step: (current, total) => `Step ${current} of ${total}`,
    sections: ['Essentials', 'Fitness profile', 'Travel context', 'Community'],
    fields: {
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone (optional)',
      location: 'Current city or location',
      trainingTools: 'Preferred training tools',
      experience: 'Experience level',
      trainingStyle: 'Training style',
      nomadType: 'Nomad type',
      travelPace: 'Travel pace',
      languages: 'Languages you speak',
      openToTraining: 'Open to training with locals?',
      connectionPrefs: 'Preferred way to connect',
      notes: 'Anything else we should know? (optional)',
    },
    options: {
      trainingTools: ['Sandbag', 'Macebell', 'Clubbell', 'Bodyweight', 'Open to anything'],
      experience: ['Beginner', 'Intermediate', 'Advanced'],
      trainingStyle: ['Strength', 'Conditioning', 'Endurance', 'Mixed'],
      nomadType: ['Solo', 'With partner', 'With family'],
      travelPace: ['Short stays', 'Long stays', 'Slow travel / digital nomad'],
      connectionPrefs: ['Quick workout', 'Coffee + chat', 'Just gear access'],
    },
    yes: 'Yes',
    no: 'No',
    actions: {
      back: 'Back',
      next: 'Next',
      submit: 'Submit application',
      submitting: 'Submitting…',
      close: 'Close',
    },
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    noEndpoint: 'Nomad onboarding is not available yet. Please try again later.',
    successTitle: 'Application sent!',
    successBody:
      'Thanks for sharing your travel and training context. We will reach out after pairing you with relevant hosts.',
  },
  es: {
    title: 'Únete a Irontrip como Nómada',
    subtitle: 'Cuéntanos cómo viajas y entrenas para conectarte con los locales y el equipamiento adecuados.',
    step: (current, total) => `Paso ${current} de ${total}`,
    sections: ['Esenciales', 'Perfil de entrenamiento', 'Contexto de viaje', 'Comunidad'],
    fields: {
      fullName: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Teléfono (opcional)',
      location: 'Ciudad o ubicación actual',
      trainingTools: 'Herramientas preferidas',
      experience: 'Nivel de experiencia',
      trainingStyle: 'Estilo de entrenamiento',
      nomadType: 'Tipo de nómada',
      travelPace: 'Ritmo de viaje',
      languages: 'Idiomas que hablas',
      openToTraining: '¿Abierto a entrenar con locales?',
      connectionPrefs: 'Forma preferida de conectar',
      notes: '¿Algo más que debamos saber? (opcional)',
    },
    options: {
      trainingTools: ['Sac de arena', 'Mazo (macebell)', 'Clubbell', 'Peso corporal', 'Abierto a todo'],
      experience: ['Principiante', 'Intermedio', 'Avanzado'],
      trainingStyle: ['Fuerza', 'Condicionamiento', 'Resistencia', 'Mixto'],
      nomadType: ['Solo', 'Con pareja', 'Con familia'],
      travelPace: ['Estancias cortas', 'Estancias largas', 'Travel lento / digital'],
      connectionPrefs: ['Entrenamiento rápido', 'Café + charla', 'Solo acceso a equipo'],
    },
    yes: 'Sí',
    no: 'No',
    actions: {
      back: 'Atrás',
      next: 'Siguiente',
      submit: 'Enviar solicitud',
      submitting: 'Enviando…',
      close: 'Cerrar',
    },
    required: 'Este campo es obligatorio',
    invalidEmail: 'Introduce un correo válido',
    noEndpoint: 'El onboarding para nómadas aún no está disponible. Intenta más tarde.',
    successTitle: '¡Solicitud enviada!',
    successBody:
      'Gracias por compartir tu contexto de viaje y entrenamiento. Te contactaremos cuando encontremos anfitriones apropiados.',
  },
}

const FORM_ID = 'nomad-onboarding'
const RECAPTCHA_ACTION = 'nomad_onboarding'
const TOTAL_STEPS = 4

const INITIAL_VALUES = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  locationDetails: null,
  locationReview: '',
  trainingTools: [],
  experience: '',
  trainingStyle: '',
  nomadType: '',
  travelPace: '',
  languages: '',
  openToTraining: 'yes',
  connectionPrefs: [],
  notes: '',
}

function NomadOnboardingForm({ lang, recaptchaSiteKey, endpoint, onClose }) {
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

  function toggleInArray(field, option) {
    setValues((prev) => {
      const set = new Set(prev[field])
      if (set.has(option)) set.delete(option)
      else set.add(option)
      return { ...prev, [field]: Array.from(set) }
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
      if (!values.trainingTools.length) nextErrors.trainingTools = L.required
      if (!values.experience) nextErrors.experience = L.required
      if (!values.trainingStyle) nextErrors.trainingStyle = L.required
    } else if (currentStep === 2) {
      if (!values.nomadType) nextErrors.nomadType = L.required
      if (!values.travelPace) nextErrors.travelPace = L.required
      if (!values.languages.trim()) nextErrors.languages = L.required
    } else if (currentStep === 3) {
      if (!values.openToTraining) nextErrors.openToTraining = L.required
      if (values.openToTraining === 'yes' && !values.connectionPrefs.length) {
        nextErrors.connectionPrefs = L.required
      }
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
        `Preferred tools: ${values.trainingTools.join(', ') || 'N/A'}`,
        `Experience level: ${values.experience}`,
        `Training style: ${values.trainingStyle}`,
        `Nomad type: ${values.nomadType}`,
        `Travel pace: ${values.travelPace}`,
        `Languages: ${values.languages}`,
        `Open to training: ${values.openToTraining}`,
        `Connection preferences: ${values.connectionPrefs.join(', ') || 'N/A'}`,
        values.notes ? `Notes: ${values.notes}` : '',
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
        trainingTools: values.trainingTools.join(', '),
        experienceLevel: values.experience,
        trainingStyle: values.trainingStyle,
        nomadType: values.nomadType,
        travelPace: values.travelPace,
        languages: values.languages,
        openToTraining: values.openToTraining,
        connectionPreferences: values.connectionPrefs.join(', '),
        notes: values.notes,
        from: values.email,
        replyto: values.email,
        subject: 'Nomad onboarding',
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
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-300">{errors.fullName}</p>
                )}
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
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-300">{errors.email}</p>
                )}
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
                <p className="text-sm text-slate-300 mb-2">{L.fields.trainingTools}</p>
                <div className="flex flex-wrap gap-2">
                  {L.options.trainingTools.map((tool) => {
                    const active = values.trainingTools.includes(tool)
                    const className = `rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? 'border-indigo-400 bg-indigo-500/20 text-indigo-200'
                        : 'border-white/15 bg-white/5 text-slate-200 hover:border-indigo-300/50'
                    }`
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleInArray('trainingTools', tool)}
                        className={className}
                      >
                        {tool}
                      </button>
                    )
                  })}
                </div>
                {errors.trainingTools && (
                  <p className="mt-1 text-xs text-rose-300">{errors.trainingTools}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-2">{L.fields.experience}</p>
                <div className="flex flex-wrap gap-2">
                  {L.options.experience.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="experience"
                        value={option}
                        checked={values.experience === option}
                        onChange={(event) => updateValue('experience', event.target.value)}
                        className="accent-indigo-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.experience && (
                  <p className="mt-1 text-xs text-rose-300">{errors.experience}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-2">{L.fields.trainingStyle}</p>
                <div className="flex flex-wrap gap-2">
                  {L.options.trainingStyle.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="trainingStyle"
                        value={option}
                        checked={values.trainingStyle === option}
                        onChange={(event) => updateValue('trainingStyle', event.target.value)}
                        className="accent-indigo-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.trainingStyle && (
                  <p className="mt-1 text-xs text-rose-300">{errors.trainingStyle}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-300 mb-2">{L.fields.nomadType}</p>
                <div className="flex flex-wrap gap-2">
                  {L.options.nomadType.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="nomadType"
                        value={option}
                        checked={values.nomadType === option}
                        onChange={(event) => updateValue('nomadType', event.target.value)}
                        className="accent-indigo-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.nomadType && (
                  <p className="mt-1 text-xs text-rose-300">{errors.nomadType}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-2">{L.fields.travelPace}</p>
                <div className="flex flex-wrap gap-2">
                  {L.options.travelPace.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="radio"
                        name="travelPace"
                        value={option}
                        checked={values.travelPace === option}
                        onChange={(event) => updateValue('travelPace', event.target.value)}
                        className="accent-indigo-500"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                {errors.travelPace && (
                  <p className="mt-1 text-xs text-rose-300">{errors.travelPace}</p>
                )}
              </div>

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
                {errors.languages && (
                  <p className="mt-1 text-xs text-rose-300">{errors.languages}</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
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
                          if (event.target.value === 'no') {
                            updateValue('connectionPrefs', [])
                          }
                        }}
                        className="accent-indigo-500"
                      />
                      {option === 'yes' ? L.yes : L.no}
                    </label>
                  ))}
                </div>
                {errors.openToTraining && (
                  <p className="mt-1 text-xs text-rose-300">{errors.openToTraining}</p>
                )}
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
                          onClick={() => toggleInArray('connectionPrefs', option)}
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
                <label className="block text-sm text-slate-300 mb-1">{L.fields.notes}</label>
                <textarea
                  rows={3}
                  value={values.notes}
                  onChange={(event) => updateValue('notes', event.target.value)}
                  className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          )}

          {serverMsg && (
            <p className="text-sm text-amber-300">{serverMsg}</p>
          )}

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

export default NomadOnboardingForm
