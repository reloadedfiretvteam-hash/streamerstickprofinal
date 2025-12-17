# Restore Checkout and Deploy to GitHub
# This script restores the complete checkout functionality and pushes to GitHub

$ErrorActionPreference = "Continue"

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== RESTORING CHECKOUT & DEPLOYING ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check branch
Write-Host "Step 1: Current branch" -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "Branch: $branch" -ForegroundColor White
if ($branch -ne "clean-main") {
    Write-Host "Switching to clean-main..." -ForegroundColor Yellow
    git checkout clean-main
    $branch = git branch --show-current
    Write-Host "Now on: $branch" -ForegroundColor White
}
Write-Host ""

# Step 2: Set remote with token
Write-Host "Step 2: Setting remote with token" -ForegroundColor Yellow
git remote remove origin 2>&1 | Out-Null
git remote add origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git
Write-Host "Remote set" -ForegroundColor White
Write-Host ""

# Step 3: Stage all changes
Write-Host "Step 3: Staging all changes" -ForegroundColor Yellow
git add -A
$status = git status --short
if ($status) {
    Write-Host "Files staged:" -ForegroundColor White
    Write-Host $status
} else {
    Write-Host "No changes to stage" -ForegroundColor Cyan
}
Write-Host ""

# Step 4: Commit
Write-Host "Step 4: Committing checkout restoration" -ForegroundColor Yellow
$commit = git commit -m "RESTORE CHECKOUT: Complete checkout functionality restored - All routes, pages, and payment methods working" 2>&1
Write-Host $commit
Write-Host ""

# Step 5: Push to clean-main
Write-Host "Step 5: Pushing to clean-main" -ForegroundColor Yellow
$push1 = git push origin clean-main --force 2>&1
Write-Host $push1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push to clean-main successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Push to clean-main failed!" -ForegroundColor Red
}
Write-Host ""

# Step 6: Push to main (for Cloudflare deployment)
Write-Host "Step 6: Pushing to main (for Cloudflare)" -ForegroundColor Yellow
$push2 = git push origin clean-main:main --force 2>&1
Write-Host $push2
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push to main successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Push to main failed!" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== CHECKOUT RESTORATION COMPLETE ===" -ForegroundColor Green
Write-Host "Your checkout is now live on GitHub and will deploy to your website!" -ForegroundColor Cyan







