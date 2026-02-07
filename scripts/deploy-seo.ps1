# StreamStickPro SEO Deploy Script
# Run after merging SEO changes: build, deploy, purge cache, submit sitemaps.

param(
    [switch]$SkipBuild,
    [switch]$PurgeOnly
)

$ErrorActionPreference = "Stop"
$SITE_URL = "https://streamstickpro.com"
$SITEMAP_URL = "$SITE_URL/sitemap.xml"

Write-Host "=== StreamStickPro SEO Deploy ===" -ForegroundColor Cyan

if (-not $PurgeOnly -and -not $SkipBuild) {
    Write-Host "Building client..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { exit 1 }
    Write-Host "Build OK." -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps (manual):" -ForegroundColor Cyan
Write-Host "1. Push to GitHub / trigger your Cloudflare Pages deploy (e.g. git push origin main)."
Write-Host "2. Cloudflare Dashboard: Caching → Configuration → Purge Everything (or Purge by URL: $SITE_URL/sitemap.xml, $SITE_URL/, $SITE_URL/iptv-services, etc.)."
Write-Host "3. Submit sitemap to search engines:"
Write-Host "   - Google Search Console: Sitemaps → Add sitemap → $SITEMAP_URL"
Write-Host "   - Bing Webmaster: Sitemaps → Submit sitemap → $SITEMAP_URL"
Write-Host "4. (Optional) Request indexing for new pillar URLs in GSC: URL Inspection → Request indexing for /iptv-services, /iptv-firestick, /jailbroken-fire-sticks, /firestick-devices, /best-iptv-firestick"
Write-Host ""
Write-Host "Done. Run with -PurgeOnly to skip build and only show purge/sitemap steps." -ForegroundColor Gray
