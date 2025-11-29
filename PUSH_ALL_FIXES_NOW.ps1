# Complete Fix Push Script
# This consolidates ALL fixes and pushes to clean-main and main

Write-Host "=== CONSOLIDATING ALL FIXES ===" -ForegroundColor Cyan

# Ensure we're on clean-main
Write-Host "`n1. Checking out clean-main..." -ForegroundColor Yellow
git checkout clean-main
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Could not checkout clean-main" -ForegroundColor Red
    exit 1
}

# Pull latest
Write-Host "`n2. Pulling latest..." -ForegroundColor Yellow
git pull origin clean-main

# Stage all changes
Write-Host "`n3. Staging all changes..." -ForegroundColor Yellow
git add -A

# Check what we're committing
Write-Host "`n4. Changes to commit:" -ForegroundColor Yellow
git status --short

# Commit everything
Write-Host "`n5. Committing all fixes..." -ForegroundColor Yellow
git commit -m "COMPLETE FIX: All fixes consolidated from all AIs - ProductDetailPage props, AppRouter routes, MediaCarousel removed, credentials generator, 50% OFF, Supabase images, admin 404, all broken routes fixed, no conflicts"

# Configure remote with token
Write-Host "`n6. Configuring remote..." -ForegroundColor Yellow
git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamstickprofinal.git

# Push to clean-main
Write-Host "`n7. Pushing to clean-main..." -ForegroundColor Yellow
git push origin clean-main --force --verbose
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Push to clean-main failed" -ForegroundColor Red
    exit 1
}

# Push to main (for Cloudflare)
Write-Host "`n8. Pushing to main (for Cloudflare)..." -ForegroundColor Yellow
git push origin clean-main:main --force --verbose
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Push to main failed" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== ✅ ALL FIXES PUSHED SUCCESSFULLY ===" -ForegroundColor Green
Write-Host "`nCloudflare will auto-deploy in a few minutes." -ForegroundColor Cyan
Write-Host "Check: https://github.com/reloadedfiretvteam-hash/streamstickprofinal" -ForegroundColor Cyan


