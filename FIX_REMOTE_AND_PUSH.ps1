# Fix Remote and Push

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== FIXING REMOTE URL ===" -ForegroundColor Cyan

# Remove old remote
Write-Host "Removing old remote..." -ForegroundColor Yellow
git remote remove origin 2>&1 | Out-Null

# Add correct remote (without token first to test)
Write-Host "Adding remote..." -ForegroundColor Yellow
git remote add origin https://github.com/reloadedfiretvteam-hash/streamerstickprofinal.git

# Test connection
Write-Host "Testing connection..." -ForegroundColor Yellow
$test = git ls-remote origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connection works!" -ForegroundColor Green
} else {
    Write-Host "❌ Connection failed:" -ForegroundColor Red
    Write-Host $test
    exit 1
}

# Set URL with token
Write-Host "Setting URL with token..." -ForegroundColor Yellow
git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git

# Stage and commit
Write-Host "`n=== STAGING AND COMMITTING ===" -ForegroundColor Cyan
Write-Host "Staging all changes..." -ForegroundColor Yellow
git add -A

Write-Host "Committing..." -ForegroundColor Yellow
git commit -m "COMPLETE FIX: All fixes consolidated" 2>&1

# Push
Write-Host "`n=== PUSHING ===" -ForegroundColor Cyan
Write-Host "Pushing to clean-main..." -ForegroundColor Yellow
$push1 = git push origin clean-main --force 2>&1
Write-Host $push1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push to clean-main successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Push to clean-main failed!" -ForegroundColor Red
}

Write-Host "Pushing to main..." -ForegroundColor Yellow
$push2 = git push origin clean-main:main --force 2>&1
Write-Host $push2

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push to main successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Push to main failed!" -ForegroundColor Red
}

Write-Host "`n=== DONE ===" -ForegroundColor Cyan

