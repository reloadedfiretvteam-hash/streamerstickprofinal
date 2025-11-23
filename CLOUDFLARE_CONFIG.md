# Cloudflare Integration Configuration

This document describes the Cloudflare integration setup for streamerstickprofinal.

## Overview

The project is configured to deploy automatically to Cloudflare Pages with optimized caching, CDN acceleration, and edge computing capabilities.

## Required Environment Variables

### GitHub Secrets (Required for CI/CD)

Configure these secrets in your GitHub repository:
`https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/settings/secrets/actions`

1. **CLOUDFLARE_API_TOKEN**
   - Description: Cloudflare API token with Pages permissions
   - How to get: Cloudflare Dashboard → My Profile → API Tokens → Create Token
   - Required permissions: Cloudflare Pages (Edit)

2. **CLOUDFLARE_ACCOUNT_ID**
   - Description: Your Cloudflare account ID
   - How to get: Cloudflare Dashboard → Workers & Pages → Overview (right sidebar)
   - Format: 32-character hex string

3. **VITE_SUPABASE_URL**
   - Description: Supabase project URL for database connection
   - Format: `https://[PROJECT_ID].supabase.co`

4. **VITE_SUPABASE_ANON_KEY**
   - Description: Supabase anonymous/public key
   - Format: JWT token string

### Cloudflare Pages Environment Variables

Set these in Cloudflare Pages Dashboard:
`https://dash.cloudflare.com/[ACCOUNT_ID]/pages/view/streamerstickprofinal/settings/environment-variables`

- **VITE_SUPABASE_URL**: Same as GitHub secret
- **VITE_SUPABASE_ANON_KEY**: Same as GitHub secret

## Cloudflare Pages Configuration

### Build Settings

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Node version**: 20
- **Environment variables**: Set as described above

### Deployment Settings

- **Production branch**: `main`
- **Preview deployments**: Enabled for all branches
- **Automatic deployments**: Enabled via GitHub integration

## CDN and Caching Configuration

### Cache Layers

1. **Browser Cache**: Controlled via `Cache-Control` headers
2. **Cloudflare Edge Cache**: Optimized for static assets
3. **CDN Cache Control**: Extended caching for immutable assets

### Asset Optimization

#### Static Assets (`/assets/*`)
- **Cache Duration**: 1 year (31536000 seconds)
- **Cache Type**: Immutable
- **Compression**: Brotli, gzip, deflate
- **CDN Acceleration**: Enabled

#### Images (`.jpg`, `.png`, `.webp`, etc.)
- **Cache Duration**: 1 year
- **Cloudflare Polish**: Enabled (lossy compression)
- **Format Optimization**: Automatic WebP/AVIF conversion
- **Responsive Images**: Supported via CF Image Resizing

#### HTML Files
- **Cache Duration**: No cache (always fresh)
- **Validation**: Must-revalidate
- **Edge Caching**: Disabled to ensure dynamic updates

#### Service Worker
- **Cache Duration**: No cache
- **Must-revalidate**: Yes
- **Ensures**: Always latest version

## Security Headers

All pages include comprehensive security headers:

- **HSTS**: Force HTTPS for 1 year with subdomains
- **X-Content-Type-Options**: Prevent MIME sniffing
- **X-Frame-Options**: Prevent clickjacking
- **CSP**: Content Security Policy for XSS protection
- **Referrer-Policy**: Privacy-focused referrer handling

## DNS Configuration

### Custom Domains

To add a custom domain to Cloudflare Pages:

1. Go to Cloudflare Pages project settings
2. Navigate to "Custom domains"
3. Add your domain (e.g., `streamstickprofinal.com`)
4. Cloudflare will automatically configure DNS
5. SSL certificate is provisioned automatically

### Recommended Subdomains

- `www.streamstickprofinal.com` - Main website
- `checkout.streamstickprofinal.com` - Checkout pages
- `secure.streamstickprofinal.com` - Secure payment flows
- `api.streamstickprofinal.com` - API endpoints (if using Workers)

## Static Asset Acceleration

### Optimization Features

1. **Automatic Minification**: HTML, CSS, JS
2. **Brotli Compression**: Better than gzip for text assets
3. **HTTP/3**: Faster protocol with QUIC
4. **Early Hints**: Preload critical resources
5. **Image Optimization**: Polish, WebP/AVIF conversion
6. **Auto Minify**: JavaScript, CSS, HTML

### Enable in Cloudflare Dashboard

Go to: **Speed** → **Optimization**

Enable:
- ✅ Auto Minify (JavaScript, CSS, HTML)
- ✅ Brotli
- ✅ Early Hints
- ✅ HTTP/3 (with QUIC)
- ✅ Image Optimization (Polish)
- ✅ Mirage (Image lazy loading)
- ✅ Rocket Loader (Async JS loading)

## Edge Functions (Optional)

The project supports Cloudflare Workers/Functions for edge computing:

### Function Locations
- Place edge functions in `/functions` directory
- Each `.ts` or `.js` file becomes an endpoint

### Example Edge Function
```typescript
// functions/api/hello.ts
export async function onRequest(context) {
  return new Response('Hello from the edge!', {
    headers: { 'content-type': 'text/plain' },
  });
}
```

## Routes Configuration

The `public/_routes.json` file controls which paths are handled by:
- **Static Assets**: Served directly from CDN
- **Edge Functions**: Processed by Cloudflare Workers

Current configuration excludes static assets and serves them directly for maximum performance.

## Monitoring and Analytics

### Cloudflare Analytics

View in Dashboard → Pages → streamerstickprofinal → Analytics

Monitor:
- Requests per second
- Bandwidth usage
- Cache hit ratio
- Geographic distribution
- Status code breakdown

### Web Analytics

Enable Cloudflare Web Analytics for:
- Page views
- Unique visitors
- Page load time
- Core Web Vitals
- Referrer tracking

## Deployment Workflow

### Automatic Deployment

1. Push code to `main` branch
2. GitHub Actions triggers
3. Dependencies installed (`npm ci`)
4. Project built (`npm run build`)
5. Build artifacts optimized for CDN
6. Deployed to Cloudflare Pages
7. Global CDN cache updated
8. Site live within seconds

### Manual Deployment

Using Wrangler CLI:

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist --project-name=streamerstickprofinal
```

## Troubleshooting

### Build Failures

1. Check GitHub Actions logs
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check Node version matches (20.x)

### Cache Issues

1. Purge cache in Cloudflare Dashboard
2. Development mode: Set "Bypass Cache on Cookie" rule
3. Force refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### SSL/HTTPS Issues

- SSL is automatic on Cloudflare
- Certificate provisioned within minutes
- Force HTTPS via HSTS headers (already configured)

## Performance Optimization Checklist

- [x] Cloudflare CDN enabled
- [x] Static asset caching configured (1 year)
- [x] Image optimization (Polish) ready
- [x] Brotli compression enabled
- [x] Security headers configured
- [x] Service worker cache control
- [x] HTML no-cache policy
- [x] Edge caching rules
- [x] Auto minification ready
- [x] HTTP/3 support

## Additional Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare CDN Documentation](https://developers.cloudflare.com/cache/)

## Support

For Cloudflare-specific issues:
- Cloudflare Community: https://community.cloudflare.com/
- Cloudflare Support: https://dash.cloudflare.com/?to=/:account/support

For application issues:
- GitHub Issues: https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/issues
