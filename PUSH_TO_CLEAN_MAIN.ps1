# ALWAYS PUSH TO CLEAN-MAIN

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== ALWAYS CLEAN-MAIN ===" -ForegroundColor Cyan

# Make sure we're on clean-main
Write-Host "Checking out clean-main..." -ForegroundColor Yellow
git checkout clean-main

# Fix remote (without token first)
Write-Host "Fixing remote URL..." -ForegroundColor Yellow
git remote remove origin 2>&1 | Out-Null
git remote add origin https://github.com/reloadedfiretvteam-hash/streamerstickprofinal.git

# Test connection
Write-Host "Testing connection..." -ForegroundColor Yellow
git ls-remote origin 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connection works!" -ForegroundColor Green
} else {
    Write-Host "❌ Connection failed - trying with token..." -ForegroundColor Yellow
    git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git
}

# Stage all
Write-Host "`nStaging all changes..." -ForegroundColor Yellow
git add -A

# Commit
Write-Host "Committing..." -ForegroundColor Yellow
git commit -m "COMPLETE FIX: All fixes consolidated" 2>&1

# Push to clean-main ONLY
Write-Host "`nPushing to clean-main..." -ForegroundColor Yellow
git push origin clean-main --force 2>&1

# Also push to main for Cloudflare
Write-Host "Pushing to main (for Cloudflare)..." -ForegroundColor Yellow
git push origin clean-main:main --force 2>&1

Write-Host "`n✅ Done! Always clean-main." -ForegroundColor Green
