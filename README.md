# StreamStick Pro Final

Automated deployment pipeline from local development to production via GitHub and Cloudflare Pages.

## Repository

**GitHub:** https://github.com/reloadedfiretvteam-hash/streamstickprofinal

## Quick Setup

### Step 1: Add GitHub Secrets (REQUIRED)

The auto-deployment workflow requires secrets to be configured. Go to:

https://github.com/reloadedfiretvteam-hash/streamstickprofinal/settings/secrets/actions

Add these four secrets (see `SETUP_SECRETS.md` for values):
1. `CLOUDFLARE_ACCOUNT_ID`
2. `CLOUDFLARE_API_TOKEN`
3. `VITE_SUPABASE_URL`
4. `VITE_SUPABASE_ANON_KEY`

### Step 2: That's It!

Once secrets are added, every push to `main` will automatically:
1. Build the project
2. Deploy to Cloudflare Pages
3. Update your live site

## Local Development

From your local AI Cursor workspace:

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push

# That's it! Auto-deployment handles the rest
```

## Project Structure

```
streamstickprofinal/
├── .github/
│   └── workflows/
│       └── cloudflare-pages.yml    # Auto-deployment workflow
├── src/
│   ├── App.tsx                     # Main React app
│   ├── main.tsx                    # Entry point
│   └── index.css                   # Global styles
├── package.json                    # Dependencies
└── vite.config.ts                  # Vite configuration
```

## Multi-Domain Setup

Configure these domains in Cloudflare Pages dashboard:

- **Main site:** `streamstickprofinal.com`
- **Secure payment:** `payments.streamstickprofinal.com`
- **Secure checkout:** `secure.streamstickprofinal.com`
- **Checkout:** `checkout.streamstickprofinal.com`
- **Payment gateway:** `pay.streamstickprofinal.com`

All subdomains will serve the same built application with SSL enabled.

## Cloudflare Pages

Project: **streamerstickprofinal**
Dashboard: https://dash.cloudflare.com/f1d6fdedf801e39f184a19ae201e8be1/pages/view/streamerstickprofinal

Build settings (auto-configured):
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** 20

## Environment Variables

Environment variables are managed through GitHub Secrets and automatically injected during build:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript types
```

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite (with optimized chunking)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Database:** Supabase
- **Hosting:** Cloudflare Pages (with CDN acceleration)
- **CI/CD:** GitHub Actions (automated deployment)

## Cloudflare Optimizations

This project is fully optimized for Cloudflare Pages with:
- ✅ Vendor chunking for better caching
- ✅ Static asset acceleration (1-year cache)
- ✅ Image optimization (Polish)
- ✅ Brotli compression
- ✅ DNS prefetch & preconnect
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Edge caching rules
- ✅ HTTP/3 ready

**See `CLOUDFLARE_CONFIG.md` for complete configuration details.**
**See `CLOUDFLARE_ENV_SETUP.md` for environment variables setup.**
**See `CLOUDFLARE_OPTIMIZATION_SUMMARY.md` for optimization details.**

## Security Notes

- All API keys and tokens are stored as GitHub Secrets
- SSL/TLS automatically enabled on all domains
- Supabase handles authentication and database security
- Payment subdomains can be configured with additional access controls

## Support

For issues with:
- **Code changes:** Edit locally and push to GitHub
- **Deployment:** Check GitHub Actions logs
- **Domains:** Configure in Cloudflare Pages dashboard
- **Database:** Managed through Supabase

---

Built with automated CI/CD pipeline: Local → GitHub → Cloudflare Pages
