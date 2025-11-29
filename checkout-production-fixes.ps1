# Checkout and Review Production Fixes
Write-Host "🔍 Checking out branches with production fixes..." -ForegroundColor Green
Write-Host ""

# Fetch all branches first
Write-Host "📥 Fetching all branches..." -ForegroundColor Cyan
git fetch --all --prune 2>&1 | Out-Null
Write-Host "✅ Fetched all branches" -ForegroundColor Green

# List all branches
Write-Host "`n📋 Available branches:" -ForegroundColor Cyan
git branch -a 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }

# Check current branch
Write-Host "`n📍 Current branch:" -ForegroundColor Cyan
$currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
Write-Host "  $currentBranch" -ForegroundColor Yellow

# Check for merge commits with production fixes
Write-Host "`n🔍 Recent merge commits (last 20):" -ForegroundColor Cyan
git log --all --merges --oneline --decorate -20 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }

# Check for commits mentioning "fix" or "production"
Write-Host "`n🔧 Recent commits with 'fix' or 'production' (last 30):" -ForegroundColor Cyan
git log --all --oneline --grep="fix\|production\|Fix\|Production" -i -30 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }

# Try to checkout clean-main if it exists
Write-Host "`n🔄 Attempting to checkout clean-main..." -ForegroundColor Cyan
$cleanMainExists = git show-ref --verify --quiet refs/heads/clean-main 2>&1
if ($LASTEXITCODE -eq 0) {
    git checkout clean-main 2>&1 | Out-Null
    Write-Host "✅ Checked out clean-main" -ForegroundColor Green
    Write-Host "`n📝 Recent commits on clean-main:" -ForegroundColor Cyan
    git log --oneline -10 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
} else {
    Write-Host "⚠️  clean-main branch not found locally" -ForegroundColor Yellow
    $remoteCleanMain = git show-ref --verify --quiet refs/remotes/origin/clean-main 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Found remote clean-main, checking out..." -ForegroundColor Yellow
        git checkout -b clean-main origin/clean-main 2>&1 | Out-Null
        Write-Host "✅ Checked out clean-main from remote" -ForegroundColor Green
    }
}

# Try to checkout main if it exists
Write-Host "`n🔄 Attempting to checkout main..." -ForegroundColor Cyan
$mainExists = git show-ref --verify --quiet refs/heads/main 2>&1
if ($LASTEXITCODE -eq 0) {
    git checkout main 2>&1 | Out-Null
    Write-Host "✅ Checked out main" -ForegroundColor Green
    Write-Host "`n📝 Recent commits on main:" -ForegroundColor Cyan
    git log --oneline -10 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
} else {
    Write-Host "⚠️  main branch not found locally" -ForegroundColor Yellow
    $remoteMain = git show-ref --verify --quiet refs/remotes/origin/main 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Found remote main, checking out..." -ForegroundColor Yellow
        git checkout -b main origin/main 2>&1 | Out-Null
        Write-Host "✅ Checked out main from remote" -ForegroundColor Green
    }
}

# Summary
Write-Host "`n📊 Summary:" -ForegroundColor Cyan
Write-Host "  Current branch: $(git rev-parse --abbrev-ref HEAD 2>&1)" -ForegroundColor Green
Write-Host "  Uncommitted changes: $(git status --porcelain 2>&1 | Measure-Object -Line | Select-Object -ExpandProperty Lines)" -ForegroundColor Green
Write-Host "`n✅ Review complete! Check the commits above for production fixes." -ForegroundColor Green


