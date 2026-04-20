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
