# WORKING PUSH SCRIPT - Run This On Your Desktop
# This will show output so you can see if it works

Write-Host "=== PUSHING ALL FIXES TO GITHUB ===" -ForegroundColor Green
Write-Host ""

# Step 1: Check current status
Write-Host "1. Checking git status..." -ForegroundColor Yellow
git status
Write-Host ""

# Step 2: Fetch latest
Write-Host "2. Fetching latest from remote..." -ForegroundColor Yellow
git fetch origin
Write-Host ""

# Step 3: Configure remote with token
Write-Host "3. Configuring remote with token..." -ForegroundColor Yellow
git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamstickprofinal.git
Write-Host "Remote configured" -ForegroundColor Green
Write-Host ""

# Step 4: Stage all changes
Write-Host "4. Staging all changes..." -ForegroundColor Yellow
git add -A
$staged = git status --short
if ($staged) {
    Write-Host "Staged files:" -ForegroundColor Cyan
    Write-Host $staged
} else {
    Write-Host "No changes to stage" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Commit
Write-Host "5. Committing all fixes..." -ForegroundColor Yellow
$commitMsg = "COMPLETE FIX PACKAGE: AppRouter product route fix, MediaCarousel removed, credentials generator, 50% OFF text, Supabase images, admin 404 fix, complete audit - All fixes from comprehensive review"
git commit -m $commitMsg
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Committed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Commit may have failed or nothing to commit" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Force push to clean-main
Write-Host "6. Force pushing to clean-main..." -ForegroundColor Yellow
git push origin clean-main --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to clean-main!" -ForegroundColor Green
} else {
    Write-Host "❌ Push to clean-main FAILED!" -ForegroundColor Red
    Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Red
}
Write-Host ""

# Step 7: Force push to main
Write-Host "7. Force pushing to main (for Cloudflare)..." -ForegroundColor Yellow
git push origin clean-main:main --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to main!" -ForegroundColor Green
} else {
    Write-Host "❌ Push to main FAILED!" -ForegroundColor Red
    Write-Host "Error code: $LASTEXITCODE" -ForegroundColor Red
}
Write-Host ""

# Step 8: Verify
Write-Host "8. Verifying..." -ForegroundColor Yellow
Write-Host "Latest local commit:" -ForegroundColor Cyan
git log --oneline -1
Write-Host ""
Write-Host "Remote main branch:" -ForegroundColor Cyan
git ls-remote origin main --heads
Write-Host ""

Write-Host "=== DONE ===" -ForegroundColor Green
Write-Host "Check GitHub: https://github.com/reloadedfiretvteam-hash/streamstickprofinal" -ForegroundColor Cyan
Write-Host "Check Cloudflare dashboard for deployment" -ForegroundColor Cyan


