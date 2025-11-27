# Direct Push to GitHub - Bypass Desktop
# This pushes directly to GitHub using the token

Write-Host "=== DIRECT PUSH TO GITHUB ===" -ForegroundColor Cyan

# Ensure correct remote
Write-Host "`n1. Setting remote URL..." -ForegroundColor Yellow
git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git

# Check current branch
Write-Host "`n2. Current branch:" -ForegroundColor Yellow
git branch --show-current

# Stage all changes
Write-Host "`n3. Staging all changes..." -ForegroundColor Yellow
git add -A
git status --short

# Commit if needed
Write-Host "`n4. Committing..." -ForegroundColor Yellow
git commit -m "COMPLETE FIX: All fixes consolidated - ProductDetailPage props, AppRouter routes, MediaCarousel removed, credentials generator, 50% OFF, Supabase images, admin 404, all broken routes fixed" 2>&1

# Push to clean-main
Write-Host "`n5. Pushing to clean-main..." -ForegroundColor Yellow
$result1 = git push origin clean-main --force 2>&1
Write-Host $result1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push to clean-main successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Push to clean-main failed!" -ForegroundColor Red
    Write-Host $result1
}

# Push to main (for Cloudflare)
Write-Host "`n6. Pushing to main (for Cloudflare)..." -ForegroundColor Yellow
$result2 = git push origin clean-main:main --force 2>&1
Write-Host $result2

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push to main successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Push to main failed!" -ForegroundColor Red
    Write-Host $result2
}

Write-Host "`n=== PUSH COMPLETE ===" -ForegroundColor Cyan
Write-Host "`nCheck: https://github.com/reloadedfiretvteam-hash/streamerstickprofinal" -ForegroundColor Cyan

