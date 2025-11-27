# Fresh Push - Stage Everything and Push

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== FRESH PUSH - ALL FIXES ===" -ForegroundColor Cyan
Write-Host ""

# Make sure on clean-main
Write-Host "1. Checking out clean-main..." -ForegroundColor Yellow
git checkout clean-main 2>&1 | Out-Null
Write-Host ""

# Set remote
Write-Host "2. Setting remote..." -ForegroundColor Yellow
git remote remove origin 2>&1 | Out-Null
git remote add origin https://github.com/reloadedfiretvteam-hash/streamerstickprofinal.git
Write-Host "   ✅ Remote set" -ForegroundColor Green
Write-Host ""

# Stage EVERYTHING
Write-Host "3. Staging ALL changes..." -ForegroundColor Yellow
git add -A
Write-Host ""

# Show what's staged
Write-Host "4. Files staged:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Commit everything
Write-Host "5. Committing all fixes..." -ForegroundColor Yellow
git commit -m "COMPLETE FIX: All fixes consolidated - ProductDetailPage props, AppRouter routes, MediaCarousel removed, credentials generator, 50% OFF, Supabase images, admin 404, all broken routes fixed" 2>&1
Write-Host ""

# Push to clean-main
Write-Host "6. Pushing to clean-main..." -ForegroundColor Yellow
git push origin clean-main --force 2>&1
Write-Host ""

# Push to main
Write-Host "7. Pushing to main (for Cloudflare)..." -ForegroundColor Yellow
git push origin clean-main:main --force 2>&1
Write-Host ""

Write-Host "✅ DONE! Check GitHub now." -ForegroundColor Green
Write-Host "   https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/commits/clean-main" -ForegroundColor Cyan

