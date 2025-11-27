# Fix Everything - Get to Clean State

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== FIXING EVERYTHING ===" -ForegroundColor Cyan
Write-Host ""

# Check current branch
Write-Host "1. Current branch:" -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "   $currentBranch" -ForegroundColor Cyan
Write-Host ""

# Check if clean-main exists locally
Write-Host "2. Checking for clean-main branch..." -ForegroundColor Yellow
$branches = git branch --list
if ($branches -match "clean-main") {
    Write-Host "   ✅ clean-main exists locally" -ForegroundColor Green
} else {
    Write-Host "   ❌ clean-main doesn't exist - creating it..." -ForegroundColor Yellow
    git checkout -b clean-main 2>&1
}

# Switch to clean-main
Write-Host "3. Switching to clean-main..." -ForegroundColor Yellow
git checkout clean-main 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Now on clean-main" -ForegroundColor Green
} else {
    Write-Host "   ❌ Failed to switch" -ForegroundColor Red
}
Write-Host ""

# Check status
Write-Host "4. Current status:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Fix remote
Write-Host "5. Fixing remote..." -ForegroundColor Yellow
git remote remove origin 2>&1 | Out-Null
git remote add origin https://github.com/reloadedfiretvteam-hash/streamerstickprofinal.git
Write-Host "   ✅ Remote set" -ForegroundColor Green
Write-Host ""

# Stage everything
Write-Host "6. Staging all changes..." -ForegroundColor Yellow
git add -A
$staged = git status --short
if ($staged) {
    Write-Host "   ✅ Changes staged" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No changes to stage" -ForegroundColor Cyan
}
Write-Host ""

# Commit
Write-Host "7. Committing..." -ForegroundColor Yellow
git commit -m "COMPLETE FIX: All fixes consolidated" 2>&1
Write-Host ""

# Show final status
Write-Host "8. Final status:" -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "=== READY TO PUSH ===" -ForegroundColor Cyan
Write-Host "Run: git push origin clean-main --force" -ForegroundColor Yellow

