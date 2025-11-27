# Check if push worked

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== CHECKING STATUS ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Local commit:" -ForegroundColor Yellow
git log --oneline -1
Write-Host ""

Write-Host "2. Fetching from remote..." -ForegroundColor Yellow
git fetch origin clean-main 2>&1
Write-Host ""

Write-Host "3. Remote commit:" -ForegroundColor Yellow
git log origin/clean-main --oneline -1
Write-Host ""

Write-Host "4. Git status:" -ForegroundColor Yellow
git status
Write-Host ""

Write-Host "5. Comparing commits..." -ForegroundColor Yellow
$local = git rev-parse HEAD
$remote = git rev-parse origin/clean-main 2>&1

Write-Host "Local:  $local" -ForegroundColor Cyan
Write-Host "Remote: $remote" -ForegroundColor Cyan
Write-Host ""

if ($local -eq $remote) {
    Write-Host "✅ SUCCESS - Commits match! Push worked!" -ForegroundColor Green
} else {
    Write-Host "❌ FAILED - Commits don't match. Need to push." -ForegroundColor Red
}

