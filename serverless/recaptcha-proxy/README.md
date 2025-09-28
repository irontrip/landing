Contact proxy (reCAPTCHA verify + forward to Web3Forms)

Overview
- This Worker verifies a Google reCAPTCHA token server‑side, then forwards the message to Web3Forms.
- Keeps your reCAPTCHA secret and Web3Forms access key off the client.

Inputs
- POST JSON: { token, formId, name, email, message, ...custom }

Deploy (Cloudflare Workers)
1) Install Wrangler: npm i -g wrangler
2) Copy wrangler.toml.example to wrangler.toml and set vars
3) Deploy: wrangler deploy

Environment variables
- RECAPTCHA_SECRET: reCAPTCHA v3 secret key (fallback: `RECAPTCHA_SECRET_KEY`)
- FORMSPREE_MAP: JSON map of formId → Formspree endpoint (e.g. `{ "contact": "https://formspree.io/f/xblzderv" }`)
- FORM_ENDPOINT / FORM_ENDPOINT_URL: Optional single-endpoint fallback if the map is not provided
- ALLOWED_ORIGIN: Origin allowed to call the worker (e.g. `https://irontrip.github.io`)

Endpoint
- After deploy, set VITE_CONTACT_ENDPOINT in landing/.env (or repo vars for CI) to the Worker URL.
