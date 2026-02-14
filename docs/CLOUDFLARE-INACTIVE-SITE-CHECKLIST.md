# Cloudflare: Why Google Might Say Your Site Is "Inactive"

If **Google AI** or **Google Search** reports that **StreamStickPro.com** is "inactive," the cause is often a **Cloudflare** or **hosting** setting that blocks crawlers, returns errors, or serves empty/redirected pages. This checklist is what to verify in Cloudflare (and in code) — **you** run these checks in the Cloudflare Dashboard; no one else can log in for you.

---

## 1. DNS (Cloudflare → streamstickpro.com → DNS)

| Check | What to do |
|-------|------------|
| **Proxied (orange cloud)** | Your root and `www` should be **Proxied** (orange) so traffic goes through Cloudflare. If they’re DNS-only (grey), that’s fine too, but then the next checks are on your origin, not Cloudflare. |
| **A/AAAA records** | Root and `www` must point to the correct origin (e.g. Cloudflare Pages or your host). Wrong or missing records = site unreachable = "inactive." |
| **No accidental redirect at DNS** | Some setups use CNAME to a redirect domain; confirm the CNAME target is your **Pages** URL (e.g. `streamerstickpro-live.pages.dev`) or your actual host. |

---

## 2. SSL/TLS (Cloudflare → SSL/TLS)

| Check | What to do |
|-------|------------|
| **SSL mode** | Use **Full** or **Full (strict)**. "Flexible" can cause mixed content or redirect loops that crawlers don’t follow well. |
| **No "Always Use HTTPS" misconfiguration** | If you use a Page Rule or Redirect Rule for HTTPS, ensure it doesn’t create a loop (e.g. redirecting API or health paths incorrectly). |
| **Minimum TLS** | 1.2 or higher. 1.0/1.1 can cause issues for some clients. |

---

## 3. Firewall & Security (Cloudflare → Security)

These are the **most common** reasons a site is seen as "inactive" for crawlers.

| Check | What to do |
|-------|------------|
| **Bot Fight Mode** | **Turn OFF** for your domain. It can challenge or block Googlebot and other crawlers, so Google may treat the site as down or inaccessible. |
| **Under Attack Mode** | **Turn OFF** unless you’re under a real attack. When on, it shows a "Checking your browser" challenge that many crawlers don’t pass. |
| **Security Level** | Set to **Medium** or **Low**. "High" or "I’m Under Attack" can block or challenge bots. |
| **Firewall rules blocking bots** | In **Security → WAF → Custom rules** (and **Tools**), check that you don’t have a rule that blocks `User-Agent` containing `Googlebot`, `bingbot`, or similar. |
| **IP Access Rules** | In **Security → WAF → Tools**, ensure you’re not blocking Google’s IP ranges. |
| **Rate limiting** | If you have rate limiting rules, ensure they don’t apply to `/` or important paths for crawlers, or that the threshold isn’t so low that bots get blocked. |

---

## 4. Page Rules / Redirect Rules (Cloudflare → Rules)

| Check | What to do |
|-------|------------|
| **Redirects** | If you have a rule that redirects **all** traffic (e.g. to a "coming soon" or another domain), **remove or disable it** so the main site is served. |
| **Cache or security rules** | Ensure no rule returns 403/503 for the root URL or for `*streamstickpro.com/*`. |

---

## 5. Caching (Cloudflare → Caching)

| Check | What to do |
|-------|------------|
| **Caching Level** | "Standard" is fine. If you use "Bypass," the site still works; if something is wrong with the origin, cache can’t fix it. |
| **Purge** | After fixing anything, do **Purge Everything** once so Google doesn’t keep seeing old error pages. (Your deploy workflow can do this if `CLOUDFLARE_ZONE_ID` is set.) |

---

## 6. Scrape Shield (Cloudflare → Scrape Shield)

| Check | What to do |
|-------|------------|
| **Email Address Obfuscation** | Usually harmless for SEO. |
| **Server-side Excludes** | If enabled, ensure they don’t remove critical content that makes the page look empty to crawlers. |
| **Hotlink Protection** | Unlikely to cause "inactive," but if in doubt, test with it off. |

---

## 7. Workers & Pages (Cloudflare → Workers & Pages)

| Check | What to do |
|-------|------------|
| **Pages project** | **streamerstickpro-live** (or whatever your project name is) should be **Active** and linked to the correct branch (e.g. `clean-main`). |
| **Custom domain** | streamstickpro.com and www.streamstickpro.com should be attached and **Active**. |
| **Builds** | Last build should be **Success**. If the last build failed, the live site can be broken or an old version. |
| **Environment variables** | Production env vars (Supabase, Stripe, etc.) must be set. Missing vars can cause 500s on API or key pages, which can make the site appear broken. |

---

## 8. What Your Repo Already Does

- **Deploy:** Pushing to `clean-main` runs the GitHub Action that builds and deploys to Cloudflare Pages.
- **Cache purge:** If `CLOUDFLARE_ZONE_ID` is in GitHub Secrets, the workflow purges cache after deploy.
- **Sitemaps:** The workflow pings Google/Bing with your sitemap URL.

So if the **code** is fine, the problem is usually one of: **Firewall/Bot Fight/Under Attack**, **redirect rule**, **DNS**, or **Pages build/domain**.

---

## 9. Quick Checks You Can Do Right Now

1. **Incognito / different network:** Open `https://streamstickpro.com`. Does the full homepage load (no "Checking your browser," no redirect to another site)?
2. **Googlebot test:** In [Google Search Console](https://search.google.com/search-console) → URL Inspection → enter `https://streamstickpro.com` → **Test live URL**. See if Google can fetch the page and what it gets (e.g. 200 with content vs 403/5xx).
3. **robots.txt:** Open `https://streamstickpro.com/robots.txt`. It should allow `/` and point to sitemaps. If it disallows everything or returns 404, fix that (in repo and/or Cloudflare).
4. **Cloudflare Analytics:** In the dashboard, check **Security → Events** and **Traffic** for a spike of blocked/challenged requests that might correspond to crawlers.

---

## 10. If You Want to Use the Cloudflare API (Optional)

You can run a script **locally** that uses your **Cloudflare API token** and **Zone ID** (from env) to:

- Check zone status (active/paused).
- List DNS records for your domain.
- List WAF/custom rules (to spot blocks).

**Never paste your API token or Zone ID in chat or in the repo.** Store them in:

- **Windows:** `set CLOUDFLARE_API_TOKEN=your_token` and `set CLOUDFLARE_ZONE_ID=your_zone_id` in the terminal, or use a `.env` file that is in `.gitignore`.
- **GitHub:** Only in **Secrets** (e.g. for the deploy workflow).

If you want, we can add a small **Node script** (e.g. `scripts/check-cloudflare-zone.ts`) that you run with `npx tsx scripts/check-cloudflare-zone.ts` and that reads `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ZONE_ID` from the environment and prints zone status and a short summary. You would run it on your machine with your token in env.

---

## Summary: Most Likely Causes of "Inactive"

1. **Bot Fight Mode** or **Under Attack Mode** (or very high Security Level) blocking/challenging Googlebot.  
2. A **redirect rule** sending everyone (including bots) to a different URL or a "coming soon" page.  
3. **Pages** project not linked to the domain, or **last build failed**.  
4. **DNS** pointing to the wrong place or not proxied correctly.

Fix those first, then re-check in GSC (URL Inspection) and request indexing for the homepage.
