Contact proxy (reCAPTCHA verify + forward to Web3Forms)

Overview
- This Worker verifies a Google reCAPTCHA token server‑side, then forwards the message to Web3Forms.
- Keeps your reCAPTCHA secret and Web3Forms access key off the client.

Inputs
- POST JSON: { token, name, email, message }

Deploy (Cloudflare Workers)
1) Install Wrangler: npm i -g wrangler
2) Copy wrangler.toml.example to wrangler.toml and set vars
3) Deploy: wrangler deploy

Environment variables
- RECAPTCHA_SECRET_KEY: Your reCAPTCHA secret key
- WEB3FORMS_ACCESS_KEY: Your Web3Forms access key

Endpoint
- After deploy, set VITE_CONTACT_ENDPOINT in landing/.env (or repo vars for CI) to the Worker URL.

