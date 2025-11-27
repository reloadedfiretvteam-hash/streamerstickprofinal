# Override remote and push

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== OVERRIDING REMOTE AND PUSHING ===" -ForegroundColor Cyan
Write-Host ""

# Make sure on clean-main
Write-Host "1. Checking out clean-main..." -ForegroundColor Yellow
git checkout clean-main 2>&1 | Out-Null
Write-Host ""

# Set remote
Write-Host "2. Setting remote..." -ForegroundColor Yellow
git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git
Write-Host ""

# Fetch to see what's on remote
Write-Host "3. Fetching from remote..." -ForegroundColor Yellow
git fetch origin clean-main 2>&1
Write-Host ""

# Reset to match remote first (get their version)
Write-Host "4. Resetting to match remote..." -ForegroundColor Yellow
git reset --hard origin/clean-main 2>&1
Write-Host ""

# Now add all our changes
Write-Host "5. Staging all local changes..." -ForegroundColor Yellow
git add -A
Write-Host ""

# Commit everything
Write-Host "6. Committing all fixes..." -ForegroundColor Yellow
git commit -m "COMPLETE FIX: All fixes consolidated - ProductDetailPage props, AppRouter routes, MediaCarousel removed, credentials generator, 50% OFF, Supabase images, admin 404, all broken routes fixed" 2>&1
Write-Host ""

# Push with force-with-lease (safer than force)
Write-Host "7. Pushing to clean-main (force-with-lease)..." -ForegroundColor Yellow
git push origin clean-main --force-with-lease 2>&1

# If that fails, try regular force
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Trying with regular force..." -ForegroundColor Yellow
    git push origin clean-main --force 2>&1
}

Write-Host ""

# Push to main
Write-Host "8. Pushing to main..." -ForegroundColor Yellow
git push origin clean-main:main --force 2>&1
Write-Host ""

Write-Host "✅ Done!" -ForegroundColor Green

