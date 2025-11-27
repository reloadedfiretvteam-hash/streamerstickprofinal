# Check if push succeeded

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== CHECKING IF PUSH SUCCEEDED ===" -ForegroundColor Cyan
Write-Host ""

# Check current branch
Write-Host "1. Current branch:" -ForegroundColor Yellow
git branch --show-current
Write-Host ""

# Check status
Write-Host "2. Status:" -ForegroundColor Yellow
git status
Write-Host ""

# Local commit
Write-Host "3. Local commit:" -ForegroundColor Yellow
git log --oneline -1
Write-Host ""

# Fetch and check remote
Write-Host "4. Fetching from remote..." -ForegroundColor Yellow
git fetch origin clean-main 2>&1 | Out-Null
Write-Host ""

Write-Host "5. Remote commit:" -ForegroundColor Yellow
git log origin/clean-main --oneline -1
Write-Host ""

# Compare
Write-Host "6. Comparing..." -ForegroundColor Yellow
$local = git rev-parse HEAD
$remote = git rev-parse origin/clean-main 2>&1

Write-Host "Local:  $local" -ForegroundColor Cyan
Write-Host "Remote: $remote" -ForegroundColor Cyan
Write-Host ""

if ($local -eq $remote) {
    Write-Host "✅ SUCCESS! Push worked! Commits match!" -ForegroundColor Green
    Write-Host "   Your fixes are on GitHub!" -ForegroundColor Green
} else {
    Write-Host "❌ Push didn't work. Commits don't match." -ForegroundColor Red
    Write-Host "   Need to push again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Check GitHub: https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/commits/clean-main" -ForegroundColor Cyan


cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== CHECKING IF PUSH SUCCEEDED ===" -ForegroundColor Cyan
Write-Host ""

# Check current branch
Write-Host "1. Current branch:" -ForegroundColor Yellow
git branch --show-current
Write-Host ""

# Check status
Write-Host "2. Status:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Get local commit
Write-Host "3. Local commit:" -ForegroundColor Yellow
$local = git rev-parse HEAD
git log --oneline -1
Write-Host ""

# Fetch and get remote commit
Write-Host "4. Fetching from remote..." -ForegroundColor Yellow
git fetch origin clean-main 2>&1 | Out-Null
Write-Host ""

Write-Host "5. Remote commit:" -ForegroundColor Yellow
$remote = git rev-parse origin/clean-main 2>&1
git log origin/clean-main --oneline -1
Write-Host ""

# Compare
Write-Host "6. Comparison:" -ForegroundColor Yellow
Write-Host "Local:  $local" -ForegroundColor Cyan
Write-Host "Remote: $remote" -ForegroundColor Cyan
Write-Host ""

if ($local -eq $remote) {
    Write-Host "✅ SUCCESS! Push worked! Commits match!" -ForegroundColor Green
    Write-Host "   Your fixes are on GitHub!" -ForegroundColor Green
} else {
    Write-Host "❌ Push didn't work. Commits don't match." -ForegroundColor Red
    Write-Host "   Need to push again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Check GitHub: https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/commits/clean-main" -ForegroundColor Cyan

