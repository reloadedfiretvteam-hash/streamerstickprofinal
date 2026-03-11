# API access and infrastructure

StreamStickPro uses **Cloudflare**, **Supabase**, and **GitHub** for hosting, data, and deployments. Access is via **environment variables and GitHub Secrets only** — tokens are never written into source code.

## How tokens are used

- **Local / scripts:** Copy `.env.example` to `.env`, fill in your values. Scripts (e.g. `scripts/audit-infrastructure.mjs`) read from `process.env`.
- **CI (GitHub Actions):** Set the same variable names in **Settings → Secrets and variables → Actions**. The deploy workflow uses `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`), etc.
- **Cloudflare Pages:** Configure env vars in the Cloudflare dashboard for the Pages project so the Worker and build have Supabase/Stripe/Resend keys at runtime.

## Running the infrastructure audit

From the repo root, with tokens set in `.env`:

```bash
node scripts/audit-infrastructure.mjs
```

This checks:

- **Cloudflare:** Lists Pages projects (uses `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`).
- **Supabase:** Probes REST API (uses `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_KEY` or `SUPABASE_SERVICE_ROLE_KEY`).
- **GitHub:** Verifies token (uses `GITHUB_TOKEN`).

No token values are logged or stored in the repo.

## Supabase analytics (optional)

For an analytics table, create it in the Supabase SQL editor or via a migration, then reference it in app code. Example table name: `analytics` (e.g. `page`, `timestamp`, `session_id`). Use `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or your project’s `VITE_*` equivalents) in the frontend; use the service role only in server/worker code.

## Deploy (clean-main)

Pushes to the `clean-main` branch trigger the GitHub Action that builds and deploys to Cloudflare Pages. Ensure GitHub Secrets are set so the workflow can call Cloudflare and Supabase.
