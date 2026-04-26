## Pages Env Vars

Set these in Cloudflare Pages for `streamerstickpro-live`.

### Non-secret vars

`WP_ORIGIN=https://indigo-meerkat-253284.hostingersite.com`

`WORDPRESS_URL=https://indigo-meerkat-253284.hostingersite.com`

`WP_HOME_PAGE_SLUG=streamstick-home-v1`

`WP_PRICING_PAGE_SLUG=streamstick-pricing-v1`

### Optional vars

`SHADOW_HOSTS=<preview-or-shadow-hostname>`

Use this only if the Pages project has a distinct preview/shadow hostname you want treated as draft-aware.

### Auth vars for draft vs published reads

Set one of the following patterns:

1. Explicit header:

`WP_REST_BASIC_AUTH=Basic <base64(user:application-password)>`

2. Separate credentials:

`WP_APPLICATION_USER=<wordpress-application-user>`

`WP_APPLICATION_PASSWORD=<wordpress-application-password>`

### Important

- Do not add these to `wrangler.toml`.
- Do not overwrite existing Stripe, Resend, or Supabase secrets.
- Keep pricing pages empty until Stripe `price_...` IDs are verified.

### CI sync (deploy-cloudflare.yml)

These same variable names are now also synced from **GitHub Actions secrets** to Cloudflare Pages on every push to `clean-main` (see `.github/workflows/deploy-cloudflare.yml`):

- `WP_ORIGIN`, `WORDPRESS_URL`
- `WP_HOME_PAGE_SLUG`, `WP_PRICING_PAGE_SLUG`
- `WP_APPLICATION_USER`, `WP_APPLICATION_PASSWORD`
- `WP_REST_BASIC_AUTH` (alternative to user+password)
- `SHADOW_HOSTS`
- Build-time: `VITE_WP_ORIGIN`, `VITE_WORDPRESS_URL` (used by the React admin to link to wp-admin)

### Verification

After deploy, hit:

- `https://<your-pages-host>/api/cms/health` → returns `{ ok: true }` with both pages found and JSON parseable.
- `https://<wp-host>/wp-json/streamstickpro/v1/health` → confirms the plugin is active and lists the home/pricing page IDs.

### One-time WordPress page bootstrap

If the two CMS pages don't exist yet, log into wp-admin, activate the **StreamStickPro Controls** plugin, then call (with an admin Application Password):

```bash
curl -X POST "https://<wp-host>/wp-json/streamstickpro/v1/ensure-pages" \
  -u "<wp-user>:<application-password>"
```

This creates `streamstick-home-v1` and `streamstick-pricing-v1` with empty JSON `{}`, which the React admin can then populate.
