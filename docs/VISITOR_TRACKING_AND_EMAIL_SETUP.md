# Visitor Tracking & Marketing Email Setup

This doc covers the **deduplicated visitor tracking** (IP hash + session) and how to hook **marketing emails** (welcome / monthly) with a 30-day cooldown.

## 1. Database (Supabase)

Run the migration that adds:

- **visitors**: `ip_hash` (unique), `pages_viewed` (JSONB), `is_bot`, `last_visit`, `first_visit`, `state`
- **RPCs**: `get_live_visitors()` (aggregates by state/city), `upsert_visitor_visit(...)` (dedupe by ip_hash)

**Apply migration:**

- **Automatically on deploy:** Pushing to **clean-main** runs `scripts/run-supabase-migration.ts`, which includes all `20260212*` migrations (this visitor migration). Ensure **SUPABASE_DATABASE_URL** or **DATABASE_URL** is set in GitHub Secrets.
- **Manually:** Supabase Dashboard → SQL Editor: run `supabase/migrations/20260212000001_visitors_dedup_and_live_stats.sql`, or CLI: `npx supabase db push`.

## 2. Frontend Tracking

- **Script**: In `client/index.html` a script runs on first load (per session via `sessionStorage` key `ssp_visited`):
  - Fetches geo from **ipapi.co** (no key; ~1000/day free).
  - Hashes IP (SHA-256 in browser when available) for privacy.
  - Sends one request per session to **POST /api/track-visit** with `ip_hash`, `state`, `city`, `country`, `session_id`, `page`.

- **Deduplication**: Same session = one tracked visit; repeat visits same IP/session update `last_visit` and append to `pages_viewed` via `upsert_visitor_visit`.

## 3. Backend (Cloudflare Worker)

- **POST /api/track-visit** (public): Accepts `ip_hash`, `state`, `city`, `country`, `user_agent`, `session_id`, `page`; calls storage `trackVisitByHash` → Supabase RPC `upsert_visitor_visit`.
- **GET /api/admin/visitors/live** (admin auth): Returns state/city aggregates from RPC `get_live_visitors` (last 24h, deduplicated).

Worker env: Set in **Cloudflare Pages → project → Settings → Environment variables (Production)**: `VITE_SUPABASE_URL` (or the URL var your worker uses) and Supabase service key (`SUPABASE_SERVICE_KEY` or `SUPABASE_SERVICE_ROLE_KEY`) so the worker can call the RPCs. Same values as in GitHub Secrets (see `docs/GITHUB-SECRETS-CHECKLIST.md`).

## 4. Admin Panel

- **Live Visitors** section already refreshes every 30s.
- **Live by location** table: state, city, today, yesterday, weekly, monthly, unique IPs (from `get_live_visitors`).

## 5. Marketing Email (Resend + 30-day cooldown)

You already have **Resend** and **email-campaigns** in the worker. To add welcome/monthly emails with a **30-day cooldown**:

### Option A – Use existing email-campaigns

- When a user signs up or completes purchase, add them to your campaign audience (e.g. `email_campaigns` or customers table) and rely on your existing **email-campaigns** logic.
- In the campaign send logic, enforce **30-day cooldown**: e.g. only send if `last_email_sent` is null or older than 30 days, then set `last_email_sent = now()` after send.

### Option B – Supabase Edge Function (welcome on signup)

1. **Trigger**: After user insert/update (e.g. new signup or trial start), call your Edge Function (or worker endpoint):

   ```ts
   await fetch('https://<your-supabase-project>.supabase.co/functions/v1/send-marketing-email', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer <service_role_key>' },
     body: JSON.stringify({ user_id: newUser.id, type: 'welcome' })
   });
   ```

2. **Edge Function** (e.g. `send-marketing-email`):
   - Load user by `user_id` from `users` (or your table with `email`, `last_email_sent`).
   - If `last_email_sent` is set and &lt; 30 days ago, return without sending.
   - Send via **Resend** (use `RESEND_API_KEY` in Edge Function secrets).
   - Update `last_email_sent` for that user.

### Option C – Monthly cron (Worker)

- You already have **/cron/email-campaigns** in the worker.
- In that handler (or a similar cron), query users where `last_email_sent` is null or &gt; 30 days ago, then send “monthly update” via Resend and set `last_email_sent = now()`.

### 30-day cooldown (any option)

- Store `last_email_sent` (timestamp) on the user/customer record.
- Before sending any marketing email, check: `last_email_sent == null || last_email_sent < now() - 30 days`.
- After sending, set `last_email_sent = now()`.

## 6. Deployment checklist

1. Run Supabase migration (visitors columns + RPCs).
2. Deploy Cloudflare Worker (with Supabase URL + service key).
3. Deploy client (tracking script is in `index.html`).
4. In admin, open Live Visitors and confirm “Live by location” table (may be empty until visits use `/api/track-visit`).
5. Optional: Hook signup/purchase to welcome email (Option A/B) and/or monthly cron (Option C); set `last_email_sent` and enforce 30-day cooldown.

## 7. Testing

- Visit site in **incognito** once → `sessionStorage` set → one request to `/api/track-visit`.
- Refresh in same session → no second request (dedup).
- In Supabase, check `visitors` for a row with `ip_hash` and `state`/`city`; in admin, “Live by location” should show that location after refresh.
