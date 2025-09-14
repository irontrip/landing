export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }
    let body
    try {
      body = await request.json()
    } catch {
      return json({ success: false, message: 'Invalid JSON' }, 400)
    }
    const { token, name = '', email = '', message = '' } = body || {}
    if (!token) return json({ success: false, message: 'Missing reCAPTCHA token' }, 400)

    // Verify reCAPTCHA
    const form = new URLSearchParams()
    form.set('secret', env.RECAPTCHA_SECRET_KEY)
    form.set('response', token)
    const verify = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: form,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    const v = await verify.json().catch(() => ({}))
    if (!v.success || (typeof v.score === 'number' && v.score < 0.5)) {
      return json({ success: false, message: 'reCAPTCHA failed', details: v }, 400)
    }

    // Forward to Web3Forms
    const resp = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: env.WEB3FORMS_ACCESS_KEY,
        name,
        email,
        message,
        subject: 'Irontrip Contact',
        from_name: 'Irontrip Landing',
      }),
    })
    const data = await resp.json().catch(() => ({}))
    return json(data, resp.status)
  },
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

