# Landing (Vite + React + Tailwind)

Local dev and build are handled by Vite.

## Scripts
- `npm run dev`: Start dev server
- `npm run build`: Production build to `dist/`
- `npm run preview`: Preview the built app

## GitHub Pages Deployment
This repo is preconfigured to deploy the app to GitHub Pages via GitHub Actions.

### How it works
- Workflow: `landing/.github/workflows/pages.yml`
- Branch: `main` (on push) or manual run
- Build dir: `dist`
- Vite base: configured as `base: './'` in `landing/vite.config.js` so assets work under a project subpath

### One-time setup
1) Push this repository to GitHub.
2) In GitHub → Settings → Pages, set Source to “GitHub Actions”.

### Deploy
1) Commit your changes to `main` and push.
2) Wait for the “Deploy landing to GitHub Pages” workflow to finish.
3) Find the live URL in the workflow’s “github-pages” environment or under Settings → Pages.

### SPA routing on Pages
The workflow copies `dist/index.html` to `dist/404.html`, which enables client‑side routing on GitHub Pages (deep links won’t 404).

### Troubleshooting
- Blank page or missing styles: ensure `base: './'` in `landing/vite.config.js`. If you prefer absolute paths, set `base: '/<REPO_NAME>/'`.
- 404 on refresh: confirm `404.html` is present in the deployed artifact (the workflow creates it).
- Build failures: use Node 18/20 on your local and workflow; delete `node_modules` and `package-lock.json`, then `npm ci` if needed.
- Pages not updating: check Actions logs, confirm Pages is set to “GitHub Actions”, and that the workflow has `pages` + `id-token` permissions.

## ESLint
Type‑aware rules require TypeScript. For TS setup, see the Vite React TS template and `typescript-eslint` docs.
