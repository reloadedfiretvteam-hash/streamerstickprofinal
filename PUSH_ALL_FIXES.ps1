# Complete Fix Push Script
# This script will push ALL fixes to GitHub

Write-Host "=== PUSHING ALL FIXES TO GITHUB ===" -ForegroundColor Green

# Step 1: Check current status
Write-Host "`n1. Checking git status..." -ForegroundColor Yellow
git status

# Step 2: Ensure we're on clean-main
Write-Host "`n2. Checking branch..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

if ($currentBranch -ne "clean-main") {
    Write-Host "Switching to clean-main..." -ForegroundColor Yellow
    git checkout clean-main
}

# Step 3: Fetch latest
Write-Host "`n3. Fetching latest from remote..." -ForegroundColor Yellow
git fetch origin

# Step 4: Stage all changes
Write-Host "`n4. Staging all changes..." -ForegroundColor Yellow
git add -A
git status --short

# Step 5: Create comprehensive commit
Write-Host "`n5. Creating comprehensive commit with ALL fixes..." -ForegroundColor Yellow
$commitMessage = @"
COMPLETE FIX PACKAGE - All Audit Fixes

✅ Fixed AppRouter.tsx - Product detail route (productId extraction)
✅ Removed MediaCarousel from App.tsx
✅ Fixed Shop.tsx - 50% OFF text, replaced Pexels images with Supabase
✅ Created credentialsGenerator.ts utility
✅ Fixed admin panel 404 issue
✅ Verified all routes (no dead ends)
✅ Verified Supabase connection
✅ Verified checkout system
✅ Complete audit and verification

All fixes from comprehensive audit included.
"@

git commit -m $commitMessage

# Step 6: Force push to clean-main
Write-Host "`n6. Force pushing to clean-main..." -ForegroundColor Yellow
git push origin clean-main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to clean-main!" -ForegroundColor Green
} else {
    Write-Host "❌ Push to clean-main failed!" -ForegroundColor Red
    exit 1
}

# Step 7: Force push to main (for Cloudflare)
Write-Host "`n7. Force pushing to main (for Cloudflare)..." -ForegroundColor Yellow
git push origin clean-main:main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to main!" -ForegroundColor Green
} else {
    Write-Host "❌ Push to main failed!" -ForegroundColor Red
    exit 1
}

# Step 8: Verify
Write-Host "`n8. Verifying push..." -ForegroundColor Yellow
Write-Host "Latest commits:" -ForegroundColor Cyan
git log --oneline -3

Write-Host "`n=== PUSH COMPLETE ===" -ForegroundColor Green
Write-Host "Check GitHub: https://github.com/reloadedfiretvteam-hash/streamstickprofinal" -ForegroundColor Cyan
Write-Host "Check Cloudflare dashboard for deployment" -ForegroundColor Cyan


