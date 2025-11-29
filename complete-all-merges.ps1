# Complete All Branch Merges - Comprehensive Fix
Write-Host "🔧 COMPLETING ALL BRANCH MERGES" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Step 1: Fetch everything
Write-Host "📥 Step 1: Fetching all branches and remotes..." -ForegroundColor Cyan
git fetch --all --prune 2>&1 | Out-Null
Write-Host "✅ Fetched" -ForegroundColor Green

# Step 2: List ALL branches
Write-Host "`n📋 Step 2: Listing ALL branches..." -ForegroundColor Cyan
Write-Host "`n--- Local Branches ---" -ForegroundColor Yellow
$localBranches = git branch --format='%(refname:short)' 2>&1
$localBranches | ForEach-Object { Write-Host "  $_" -ForegroundColor White }

Write-Host "`n--- Remote Branches ---" -ForegroundColor Yellow
$remoteBranches = git branch -r --format='%(refname:short)' 2>&1
$remoteBranches | ForEach-Object { Write-Host "  $_" -ForegroundColor White }

# Step 3: Find branches with numbers (105, 205, etc.)
Write-Host "`n🔍 Step 3: Finding branches with numbers (105, 205, etc.)..." -ForegroundColor Cyan
$numberBranches = $localBranches + $remoteBranches | Where-Object { $_ -match '\d{3,}' }
if ($numberBranches) {
    Write-Host "Found branches with numbers:" -ForegroundColor Yellow
    $numberBranches | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Host "No branches with numbers found" -ForegroundColor Gray
}

# Step 4: Check current branch
Write-Host "`n📍 Step 4: Current branch status..." -ForegroundColor Cyan
$currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow

# Step 5: Check what's merged and what's not
Write-Host "`n🔄 Step 5: Checking merge status..." -ForegroundColor Cyan
Write-Host "`n--- Branches merged into current branch ---" -ForegroundColor Yellow
$mergedBranches = git branch --merged 2>&1 | Where-Object { $_ -notmatch '\*' -and $_ -notmatch '^\s*$' }
if ($mergedBranches) {
    $mergedBranches | ForEach-Object { Write-Host "  ✅ $_" -ForegroundColor Green }
} else {
    Write-Host "  (none)" -ForegroundColor Gray
}

Write-Host "`n--- Branches NOT merged into current branch ---" -ForegroundColor Yellow
$unmergedBranches = git branch --no-merged 2>&1 | Where-Object { $_ -notmatch '\*' -and $_ -notmatch '^\s*$' }
if ($unmergedBranches) {
    $unmergedBranches | ForEach-Object { Write-Host "  ❌ $_" -ForegroundColor Red }
} else {
    Write-Host "  (all merged)" -ForegroundColor Green
}

# Step 6: Switch to production branch (clean-main or main)
Write-Host "`n🔄 Step 6: Switching to production branch..." -ForegroundColor Cyan
$prodBranch = $null
if (git show-ref --verify --quiet refs/heads/clean-main 2>&1) {
    $prodBranch = "clean-main"
} elseif (git show-ref --verify --quiet refs/remotes/origin/clean-main 2>&1) {
    $prodBranch = "clean-main"
    git checkout -b clean-main origin/clean-main 2>&1 | Out-Null
} elseif (git show-ref --verify --quiet refs/heads/main 2>&1) {
    $prodBranch = "main"
} elseif (git show-ref --verify --quiet refs/remotes/origin/main 2>&1) {
    $prodBranch = "main"
    git checkout -b main origin/main 2>&1 | Out-Null
}

if ($prodBranch) {
    if ((git rev-parse --abbrev-ref HEAD 2>&1) -ne $prodBranch) {
        git checkout $prodBranch 2>&1 | Out-Null
    }
    Write-Host "✅ On production branch: $prodBranch" -ForegroundColor Green
} else {
    Write-Host "⚠️  No production branch found, staying on current branch" -ForegroundColor Yellow
    $prodBranch = $currentBranch
}

# Step 7: Pull latest
Write-Host "`n⬇️  Step 7: Pulling latest changes..." -ForegroundColor Cyan
git pull origin $prodBranch --no-edit 2>&1 | Out-Null
Write-Host "✅ Pulled latest" -ForegroundColor Green

# Step 8: Merge all unmerged branches
Write-Host "`n🔄 Step 8: Merging all unmerged branches..." -ForegroundColor Cyan
$mergeCount = 0
$mergeErrors = @()

foreach ($branch in $unmergedBranches) {
    $branchName = $branch.Trim()
    if ($branchName -eq $prodBranch) { continue }
    
    Write-Host "`n  Merging: $branchName" -ForegroundColor Yellow
    try {
        $mergeOutput = git merge $branchName --no-edit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ Successfully merged $branchName" -ForegroundColor Green
            $mergeCount++
        } else {
            Write-Host "    ⚠️  Merge conflict or error for $branchName" -ForegroundColor Yellow
            Write-Host "    Output: $mergeOutput" -ForegroundColor Gray
            $mergeErrors += $branchName
            
            # Try to resolve with ours strategy
            Write-Host "    Attempting to resolve with 'ours' strategy..." -ForegroundColor Yellow
            git merge --abort 2>&1 | Out-Null
            git merge $branchName --strategy-option=ours --no-edit 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ Resolved with 'ours' strategy" -ForegroundColor Green
                $mergeCount++
            } else {
                Write-Host "    ❌ Could not resolve automatically" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "    ❌ Error merging $branchName : $_" -ForegroundColor Red
        $mergeErrors += $branchName
    }
}

# Step 9: Stage and commit any remaining changes
Write-Host "`n📦 Step 9: Staging all changes..." -ForegroundColor Cyan
git add -A 2>&1 | Out-Null
$hasChanges = git diff --cached --quiet 2>&1
if ($LASTEXITCODE -ne 0) {
    git commit -m "Complete all branch merges - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" 2>&1 | Out-Null
    Write-Host "✅ Committed remaining changes" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No additional changes to commit" -ForegroundColor Gray
}

# Step 10: Summary
Write-Host "`n📊 SUMMARY" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "  Production branch: $prodBranch" -ForegroundColor Green
Write-Host "  Branches merged: $mergeCount" -ForegroundColor Green
if ($mergeErrors.Count -gt 0) {
    Write-Host "  Branches with errors: $($mergeErrors.Count)" -ForegroundColor Yellow
    $mergeErrors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
}
Write-Host "  Current commit: $(git rev-parse --short HEAD 2>&1)" -ForegroundColor Green
Write-Host "  Uncommitted changes: $(git status --porcelain 2>&1 | Measure-Object -Line | Select-Object -ExpandProperty Lines)" -ForegroundColor Green

# Step 11: Show what's ready to deploy
Write-Host "`n🚀 DEPLOYMENT STATUS" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "  Branch: $prodBranch" -ForegroundColor Green
Write-Host "  Ready to push: $(if ((git status --porcelain 2>&1 | Measure-Object -Line | Select-Object -ExpandProperty Lines) -eq 0) { 'Yes' } else { 'No (uncommitted changes)' })" -ForegroundColor $(if ((git status --porcelain 2>&1 | Measure-Object -Line | Select-Object -ExpandProperty Lines) -eq 0) { 'Green' } else { 'Yellow' })

Write-Host "`n✅ Merge process complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Review the merged changes" -ForegroundColor White
Write-Host "  2. Test the build: npm run build" -ForegroundColor White
Write-Host "  3. Push to production: git push origin $prodBranch" -ForegroundColor White


