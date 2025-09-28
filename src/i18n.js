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
      nomadsHeadline: 'Fitness that travels with you.',
      nomadsBody:
        'Irontrip helps nomads stay consistent with their training anywhere in the world. Lightweight rituals, simple tools, and access to local hosts mean your rhythm never breaks — whether you’re in a city park, a mountain trail, or a friend’s living room.',
      localsTitle: 'For Locals',
      localsHeadline: 'Your gear. Their journey.',
      localsBody:
        'As a local, you can share your kettlebell, sandbag, macebell, or other tools with nomads passing through. It’s not just about lending equipment — it’s about connection. Meet like-minded people, spark conversations, and build a community rooted in movement and resilience.',
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
      nomadsHeadline: 'Fitness que viaja contigo.',
      nomadsBody:
        'Irontrip ayuda a las personas nómadas a mantenerse constantes con su entrenamiento en cualquier lugar del mundo. Rituales ligeros, herramientas sencillas y acceso a anfitriones locales mantienen tu ritmo, ya sea en un parque urbano, un sendero de montaña o la sala de una amistad.',
      localsTitle: 'Para Locales',
      localsHeadline: 'Tu equipo. Su travesía.',
      localsBody:
        'Como local, puedes compartir tu kettlebell, sandbag, macebell u otras herramientas con nómadas de paso. No se trata solo de prestar equipo — se trata de conexión. Conoce a personas afines, enciende conversaciones y construye una comunidad basada en el movimiento y la resiliencia.',
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
