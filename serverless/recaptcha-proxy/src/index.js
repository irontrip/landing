const DEFAULT_MIN_SCORE = 0.5

export default {
  async fetch(request, env) {
    const {
      RECAPTCHA_SECRET,
      RECAPTCHA_SECRET_KEY,
      FORM_ENDPOINT,
      FORM_ENDPOINT_URL,
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

    const { token, name, email, message } = body ?? {}
    if (!token || !name || !email || !message) {
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

    const formEndpoint = FORM_ENDPOINT || FORM_ENDPOINT_URL || 'https://formspree.io/f/xblzderv'

    const forwardResponse = await fetch(formEndpoint, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify({
        name,
        email,
        message,
        from: email,
        replyto: email,
        subject: 'Irontrip Contact',
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
