# Backup & rollback map (Owner CMS work — 2026-09-21)

## Primary restore point (before this CMS work)

| Item | Value |
|------|--------|
| **Git tag** | `backup-pre-owner-cms-20260921` |
| **Commit** | `683893b` — *Admin: plain-language Change prices guide…* |
| **Repo** | `https://github.com/reloadedfiretvteam-hash/streamerstickprofinal` |
| **Branch** | `clean-main` |

### How to roll code back (owner or agent)

```bash
git fetch origin
git checkout clean-main
git reset --hard backup-pre-owner-cms-20260921
# then force-push ONLY if owner explicitly approves:
# git push --force-with-lease origin clean-main
```

Safer alternative: Cloudflare Pages → `streamerstickpro-live` → Deployments → rollback to the deployment whose commit is `683893b` (may need to deploy that commit again if it aged out of the recent list).

## Also available

| Backup | Location |
|--------|----------|
| Older tag | `pre-elite-revamp-20260328` (much older baseline) |
| Current tip (post-CMS) | `2f0dc38` on `origin/clean-main` |
| Cloudflare project | `streamerstickpro-live` (Pages) |
| CMS content (JSON) | Supabase `site_settings` keys: `cms_homepage_v1`, `cms_devices_v1`, `cms_plans_v1` |

### Content-only undo (no code rollback)

Delete or empty these `site_settings` rows if CMS copy should revert while keeping the new code:

- `cms_homepage_v1`
- `cms_devices_v1`
- `cms_plans_v1`
- (and any later `cms_*_v1` keys)

### Do not confuse with payment backup

Checkout/Stripe/env secrets live in **Cloudflare environment variables**, not in these CMS keys. Rolling back CMS code does not restore deleted Stripe keys that were removed from `site_settings` (those should only exist in Cloudflare).
