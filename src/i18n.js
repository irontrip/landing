export const availableLangs = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
]

export const translations = {
  en: {
    brand: 'Irontrip',
    hero: {
      headline: 'Fitness that travels. Community that lasts.',
      headline1: 'Fitness that travels.',
      headline2: 'Community that lasts.',
      sub: 'Irontrip helps nomads keep their training rituals alive anywhere — and gives locals a way to share their gear, connect, and build community.',
      ctaWaitlist: '👉 Join Waitlist',
      ctaLend: '👉 Share Your Gear',
      ctaNomadOnboarding: 'Start Nomad onboarding',
    },
    value: {
      nomadsTitle: 'For Nomads',
      nomadsHeadline: 'Access your training, anywhere.',
      nomadsBody:
        'Stay consistent on the road. Irontrip connects you to simple tools and portable rituals that fit your lifestyle, so you never lose your rhythm.',
      localsTitle: 'For Locals',
      localsHeadline: 'Your gear, their journey.',
      localsBody:
        'Share your equipment, meet like‑minded people, and spark connections rooted in movement and resilience. Build community while empowering nomads.',
    },
    footer: {
      privacy: 'Privacy',
      contact: 'Contact',
      github: 'GitHub',
      copyright: '© {year} Irontrip',
    },
  },
  es: {
    brand: 'Irontrip',
    hero: {
      headline: 'Fitness que viaja. Comunidad que perdura.',
      headline1: 'Fitness que viaja.',
      headline2: 'Comunidad que perdura.',
      sub: 'Irontrip ayuda a nómadas a mantener sus rituales de entrenamiento en cualquier lugar — y ofrece a locales una forma de compartir su equipo, conectar y construir comunidad.',
      ctaWaitlist: '👉 Únete a la lista de espera',
      ctaLend: '👉 Comparte tu equipo',
      ctaNomadOnboarding: 'Inicia onboarding para nómadas',
    },
    value: {
      nomadsTitle: 'Para Nómadas',
      nomadsHeadline: 'Accede a tu entrenamiento, donde sea.',
      nomadsBody:
        'Mantén la constancia en el camino. Irontrip te conecta con herramientas simples y rituales portátiles que se ajustan a tu estilo de vida, para que no pierdas el ritmo.',
      localsTitle: 'Para Locales',
      localsHeadline: 'Tu equipo, su viaje.',
      localsBody:
        'Comparte tu equipamiento, conoce a personas afines y crea conexiones basadas en el movimiento y la resiliencia. Construye comunidad mientras apoyas a nómadas.',
    },
    footer: {
      privacy: 'Privacidad',
      contact: 'Contacto',
      github: 'GitHub',
      copyright: '© {year} Irontrip',
    },
  },
}

export function getText(dict, lang, path, vars = {}) {
  const parts = path.split('.')
  let cur = dict[lang]
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p]
    else return path // fallback to key
  }
  if (typeof cur === 'string') {
    return cur.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`))
  }
  return String(cur)
}

export function detectInitialLang() {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('lang') : null
  if (saved && (saved === 'en' || saved === 'es')) return saved
  const nav = typeof navigator !== 'undefined' ? navigator.language || navigator.userLanguage : 'en'
  return nav && nav.toLowerCase().startsWith('es') ? 'es' : 'en'
}
