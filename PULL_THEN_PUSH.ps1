# Pull first, then push

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== PULL THEN PUSH ===" -ForegroundColor Cyan
Write-Host ""

# Make sure on clean-main
Write-Host "1. Checking out clean-main..." -ForegroundColor Yellow
git checkout clean-main 2>&1 | Out-Null
Write-Host ""

# Set remote
Write-Host "2. Setting remote..." -ForegroundColor Yellow
git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git
Write-Host ""

# Fetch latest
Write-Host "3. Fetching from remote..." -ForegroundColor Yellow
git fetch origin clean-main 2>&1
Write-Host ""

# Pull (merge remote changes)
Write-Host "4. Pulling remote changes..." -ForegroundColor Yellow
git pull origin clean-main --no-edit 2>&1
Write-Host ""

# Stage any new changes
Write-Host "5. Staging all changes..." -ForegroundColor Yellow
git add -A
Write-Host ""

# Commit if there are changes
Write-Host "6. Committing..." -ForegroundColor Yellow
git commit -m "COMPLETE FIX: All fixes consolidated" 2>&1
Write-Host ""

# Push
Write-Host "7. Pushing to clean-main..." -ForegroundColor Yellow
git push origin clean-main 2>&1
Write-Host ""

# Push to main
Write-Host "8. Pushing to main..." -ForegroundColor Yellow
git push origin clean-main:main --force 2>&1
Write-Host ""

Write-Host "✅ Done!" -ForegroundColor Green

