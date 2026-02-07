# Deploy and Update – StreamStickPro

This doc covers deploying the full stack (GitHub → Cloudflare, Supabase), pushing to search engines, and using the admin broadcast email.

---

## 1. GitHub secrets (required for deploy)

In **GitHub repo → Settings → Secrets and variables → Actions**, add:

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages edit permission |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID (dashboard URL or Overview) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (backend only) |
| `SUPABASE_DATABASE_URL` | Direct DB URL (for migrations, if used) |
| `DATABASE_URL` | Same as SUPABASE_DATABASE_URL if needed by migration script |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `RESEND_API_KEY` | Resend API key for email |
| `SESSION_SECRET` | Random string for admin sessions |

Do **not** commit these values; use GitHub Secrets only.

---

## 2. Deploy to Cloudflare (and Supabase)

1. **Push to the branch that triggers deploy**  
   Default branch in the workflow is `clean-main`. Push your code:
   ```bash
   git add -A
   git commit -m "Your message"
   git push origin clean-main
   ```
   If your default branch is `main`, either change the workflow to `main` or push to `clean-main`.

2. **GitHub Actions**  
   - Go to **Actions** in the repo and open the “Deploy to Cloudflare Pages” workflow.  
   - The run will: install deps, run DB migration (if configured), build, deploy to Cloudflare Pages.  
   - After deploy, the workflow pings the sitemap and notifies Bing/Google of the sitemap URL.

3. **Cloudflare cache (if you use a Zone in front of Pages)**  
   If your domain uses Cloudflare proxy (orange cloud):
   - **Dashboard → your domain → Caching → Configuration → Purge Everything** (after a deploy when you want cache cleared).

4. **Supabase**  
   - Code and env are already set in the app; migrations run from the workflow if `DATABASE_URL` / `SUPABASE_DATABASE_URL` is set.  
   - For Supabase schema changes, run your migration script locally or via CI using the same URL.

---

## 3. Push to search engines (Google, Bing, Yahoo)

- **Sitemap URL:** `https://streamstickpro.com/sitemap.xml`

**Google Search Console**

1. Add the property `https://streamstickpro.com` if needed.  
2. **Sitemaps** → Add sitemap → enter: `sitemap.xml` (or full URL).  
3. Optionally use **URL Inspection** for important URLs (e.g. `/`, `/iptv-services`, `/iptv-firestick`) and request indexing.

**Bing Webmaster Tools**

1. Add the site if needed.  
2. **Sitemaps** → Submit sitemap → `https://streamstickpro.com/sitemap.xml`.  
3. Bing feeds into **Yahoo**; no separate Yahoo sitemap step needed.

**After each major content update**

- Re-submit the sitemap in GSC and Bing.  
- The GitHub Actions workflow already pings the sitemap URL for Bing and Google.

---

## 4. Email broadcast (customers and free trials)

- **Where:** Admin panel → **Settings** (or the tab where “Email Broadcast” card is).  
- **What it does:** Sends one “website update reminder” email to every unique email from:
  - `customers` table  
  - `orders` (customer_email)  
  - `email_campaigns` (customer_email)  

**Steps**

1. Log in to **Admin** at `https://streamstickpro.com/admin`.  
2. Open the **Email Broadcast** card.  
3. Click **Preview count** to see how many recipients will get the email.  
4. Click **Send website reminder to all** and confirm.  
5. Emails are sent with a short delay between each to respect rate limits.

**Backend**

- `POST /api/admin/broadcast-email` – sends the broadcast (auth required).  
- `GET /api/admin/broadcast-email/preview` – returns recipient count (auth required).

---

## 5. Making sure everything works together

- **Frontend:** Vite app in `client/`; build output is in `dist/` and deployed to Cloudflare Pages.  
- **Backend:** Worker in `worker/` is part of the same Pages project (or Workers); API under `/api/*`.  
- **Supabase:** Used for DB, auth, and storage; keys in GitHub Secrets and Cloudflare env.  
- **Resend:** Used for order emails, trials, and the admin broadcast; `RESEND_API_KEY` and `RESEND_FROM_EMAIL` must be set.

After deploy:

- Open `https://streamstickpro.com` and test: home, shop, blog, pillar pages, checkout (test mode).  
- Open `https://streamstickpro.com/admin` and test: login, orders, customers, **Email Broadcast** (preview first), and any other admin actions.

---

## 6. Quick checklist after a deploy

- [ ] GitHub Actions workflow completed without errors.  
- [ ] Site loads at `https://streamstickpro.com`.  
- [ ] Sitemap loads: `https://streamstickpro.com/sitemap.xml`.  
- [ ] If using Cloudflare proxy, purge cache if needed.  
- [ ] GSC/Bing: sitemap submitted and (optionally) key URLs requested for indexing.  
- [ ] Admin login and broadcast preview/send work.  
- [ ] Test payment (Stripe test mode) and/or free trial signup if applicable.
