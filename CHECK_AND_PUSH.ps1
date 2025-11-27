# Check Status and Push

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== CHECKING STATUS ===" -ForegroundColor Cyan
Write-Host ""

# Check current branch
Write-Host "1. Current branch:" -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "   $branch" -ForegroundColor Cyan
Write-Host ""

# If not on clean-main, switch
if ($branch -ne "clean-main") {
    Write-Host "2. Switching to clean-main..." -ForegroundColor Yellow
    git checkout clean-main 2>&1
    Write-Host ""
}

# Check status
Write-Host "3. Status:" -ForegroundColor Yellow
git status
Write-Host ""

# Check remote
Write-Host "4. Remote:" -ForegroundColor Yellow
git remote -v
Write-Host ""

# Fix remote if needed
Write-Host "5. Fixing remote..." -ForegroundColor Yellow
git remote remove origin 2>&1 | Out-Null
git remote add origin https://github.com/reloadedfiretvteam-hash/streamerstickprofinal.git
Write-Host "   ✅ Remote set" -ForegroundColor Green
Write-Host ""

# Show latest commit
Write-Host "6. Latest commit:" -ForegroundColor Yellow
git log --oneline -1
Write-Host ""

# Push
Write-Host "7. Pushing to clean-main..." -ForegroundColor Yellow
git push origin clean-main --force 2>&1

Write-Host "`n8. Pushing to main..." -ForegroundColor Yellow
git push origin clean-main:main --force 2>&1

Write-Host "`n✅ Done!" -ForegroundColor Green

