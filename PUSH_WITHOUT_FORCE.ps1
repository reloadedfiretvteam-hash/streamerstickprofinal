# Push without force first

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== PUSHING WITHOUT FORCE ===" -ForegroundColor Cyan
Write-Host ""

# Make sure on clean-main
Write-Host "1. Checking branch..." -ForegroundColor Yellow
git checkout clean-main 2>&1 | Out-Null
Write-Host ""

# Set remote with token
Write-Host "2. Setting remote with token..." -ForegroundColor Yellow
git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git
Write-Host ""

# Try push without force first
Write-Host "3. Pushing to clean-main (without force)..." -ForegroundColor Yellow
$result1 = git push origin clean-main 2>&1
Write-Host $result1
Write-Host ""

# If that fails, try with force
if ($LASTEXITCODE -ne 0) {
    Write-Host "4. Trying with force..." -ForegroundColor Yellow
    $result2 = git push origin clean-main --force 2>&1
    Write-Host $result2
    Write-Host ""
}

# Push to main
Write-Host "5. Pushing to main..." -ForegroundColor Yellow
git push origin clean-main:main --force 2>&1
Write-Host ""

Write-Host "=== DONE ===" -ForegroundColor Cyan

