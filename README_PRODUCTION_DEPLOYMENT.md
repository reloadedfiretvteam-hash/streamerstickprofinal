# 🚨 PRODUCTION DEPLOYMENT - READ THIS FIRST

## Critical Information

**Your Production Branch:** `clean-main` (NOT `main`)

If your pull requests are going to Cloudflare **preview** instead of **production**, you need to fix your deployment configuration.

---

## 🚀 Quick Fixes

### For Immediate Production Deployment:
**→ See [`DEPLOY_TO_PRODUCTION_NOW.md`](DEPLOY_TO_PRODUCTION_NOW.md)** 
- Takes ~5 minutes
- Just update Cloudflare settings and click deploy
- Gets your merged PRs live immediately

### For Automatic Future Deployments:
**→ See [`.github/CLOUDFLARE_PRODUCTION_SETUP.md`](.github/CLOUDFLARE_PRODUCTION_SETUP.md)**
- Complete setup guide
- Configures GitHub Actions for automatic deployment
- Troubleshooting for common issues

---

## Understanding the Issue

### Why PRs Go to Preview:
1. Cloudflare is configured to use `main` as production branch
2. Your actual production branch is `clean-main`
3. PRs merged to `clean-main` are treated as non-production
4. Result: Preview deployments instead of production

### The Solution:
**Change Cloudflare's production branch from `main` to `clean-main`**

---

## Production vs Preview

| Deployment Type | Branch | URL Type | Badge in Cloudflare |
|----------------|--------|----------|---------------------|
| **Production** ✅ | `clean-main` | Your custom domain | "Production" |
| **Preview** ❌ | Any other | Random `.pages.dev` | None or "Preview" |

---

## Next Steps

1. Read: [`DEPLOY_TO_PRODUCTION_NOW.md`](DEPLOY_TO_PRODUCTION_NOW.md)
2. Follow: The 5-minute quick fix
3. Verify: Latest changes are on your live domain
4. Setup: GitHub Actions for future automation (optional)

---

## Still Confused?

**The Simple Truth:**
- All your code is already in `clean-main` ✅
- It just needs to be deployed **as production** (not preview)
- This is a configuration issue, not a code issue
- Fix takes ~5 minutes with no code changes

---

**For detailed instructions, see the guides linked above.**

