const DEFAULT_MIN_SCORE = 0.5

export default {
  async fetch(request, env) {
    const {
      RECAPTCHA_SECRET,
      RECAPTCHA_SECRET_KEY,
      FORM_ENDPOINT,
      FORM_ENDPOINT_URL,
      FORMSPREE_MAP,
      ALLOWED_ORIGIN = '',
    } = env

    const allowedOrigins = parseAllowedOrigins(ALLOWED_ORIGIN)
    const allowAllOrigins = allowedOrigins.length === 0 || allowedOrigins.includes('*')
    const origin = request.headers.get('Origin') || ''
    const originAllowed = allowAllOrigins || (origin && allowedOrigins.includes(origin))
    const corsOrigin = originAllowed
      ? allowAllOrigins
        ? origin || '*'
        : origin
      : allowAllOrigins
        ? '*'
        : allowedOrigins[0] || ''

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      const headers = buildCorsHeaders(corsOrigin)
      const requestHeaders = request.headers.get('Access-Control-Request-Headers')
      if (requestHeaders) headers['Access-Control-Allow-Headers'] = requestHeaders

      return new Response(null, {
        status: originAllowed || allowAllOrigins ? 204 : 403,
        headers,
      })
    }

    if (!originAllowed && !allowAllOrigins) {
      return json(
        { success: false, message: 'Forbidden origin' },
        403,
        corsOrigin,
      )
    }

    if (request.method !== 'POST') {
      return json(
        { success: false, message: 'Method Not Allowed' },
        405,
        corsOrigin,
        { Allow: 'POST, OPTIONS' },
      )
    }

    let body
    try {
      body = await request.json()
    } catch {
      return json(
        { success: false, message: 'Invalid JSON payload' },
        400,
        corsOrigin,
      )
    }

    const { token, formId, ...rest } = body ?? {}
    if (!token || !formId) {
      return json(
        { success: false, message: 'Missing required fields' },
        400,
        corsOrigin,
      )
    }

    const { name, email, message } = {
      name: rest.name,
      email: rest.email,
      message: rest.message,
    }

    if (!name || !email || !message) {
      return json(
        { success: false, message: 'Missing required fields' },
        400,
        corsOrigin,
      )
    }

    const secret = RECAPTCHA_SECRET || RECAPTCHA_SECRET_KEY
    if (!secret) {
      return json(
        { success: false, message: 'Server misconfigured (missing RECAPTCHA secret)' },
        500,
        corsOrigin,
      )
    }

    // Verify reCAPTCHA token with Google
    const verificationResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    })

    const verificationData = await verificationResponse.json().catch(() => ({}))
    const score = typeof verificationData.score === 'number' ? verificationData.score : 0

    if (!verificationData.success || score < DEFAULT_MIN_SCORE) {
      return json(
        {
          success: false,
          message: 'reCAPTCHA validation failed',
          details: verificationData,
        },
        400,
        corsOrigin,
      )
    }

    // Forward verified payload to Web3Forms
    const forwardHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
    if (originAllowed && origin) {
      forwardHeaders.Origin = origin
    }

    const formEndpoint = resolveFormEndpoint(
      {
        FORM_ENDPOINT,
        FORM_ENDPOINT_URL,
        FORMSPREE_MAP,
      },
      formId,
    )

    if (!formEndpoint) {
      return json(
        { success: false, message: `Unknown formId: ${formId}` },
        400,
        corsOrigin,
      )
    }

    const forwardResponse = await fetch(formEndpoint, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify({
        ...rest,
        name,
        email,
        message,
        formId,
        from: rest.from || email,
        replyto: rest.replyto || email,
        subject: rest.subject || 'Irontrip Contact',
      }),
    })

    const forwardRaw = await forwardResponse.text().catch(() => '')
    let forwardData
    try {
      forwardData = JSON.parse(forwardRaw)
    } catch {
      forwardData = null
    }

    if (
      forwardResponse.ok &&
      (forwardData?.ok === true || forwardData?.success !== false)
    ) {
      return json(
        { success: true, message: 'Form submitted successfully.' },
        200,
        corsOrigin,
      )
    }

    return json(
      {
        success: false,
        message:
          (forwardData && (forwardData.message || forwardData?.error)) ||
          forwardRaw || 'Form endpoint error',
        details: forwardData ?? { raw: forwardRaw },
      },
      forwardResponse.status || 502,
      corsOrigin,
    )
  },
}

function json(data, status, origin, extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    ...extraHeaders,
  }
  return new Response(JSON.stringify(data), { status, headers })
}

function buildCorsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

function parseAllowedOrigins(raw) {
  if (!raw) return []
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

let cachedMapString = null
let cachedMap = null

function resolveFormEndpoint(envMap, formId) {
  if (!formId) return null

  const single = envMap.FORM_ENDPOINT || envMap.FORM_ENDPOINT_URL
  if (!envMap.FORMSPREE_MAP) {
    // Fallback to single endpoint behaviour
    return single || null
  }

  if (envMap.FORMSPREE_MAP !== cachedMapString) {
    try {
      cachedMap = JSON.parse(envMap.FORMSPREE_MAP)
      cachedMapString = envMap.FORMSPREE_MAP
    } catch {
      cachedMap = null
      cachedMapString = envMap.FORMSPREE_MAP
    }
  }

  if (cachedMap && typeof cachedMap === 'object') {
    return cachedMap[formId] || null
  }

  return single || null
}
