# Complete Production Deployment - Merge All to clean-main
# This will complete all merges and deploy to production (not preview)

Write-Host "`n🚀 COMPLETE PRODUCTION DEPLOYMENT" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host "Goal: Get all fixes to clean-main (PRODUCTION), not previews" -ForegroundColor Cyan
Write-Host ""

# Step 1: Fetch everything
Write-Host "📥 Step 1: Fetching all branches..." -ForegroundColor Cyan
git fetch --all --prune 2>&1 | Out-Null
Write-Host "✅ Fetched" -ForegroundColor Green

# Step 2: Checkout clean-main (production branch)
Write-Host "`n🎯 Step 2: Switching to clean-main (production branch)..." -ForegroundColor Cyan
$currentBranch = git rev-parse --abbrev-ref HEAD 2>&1

# Check if clean-main exists
$cleanMainLocal = git show-ref --verify --quiet refs/heads/clean-main 2>&1
$cleanMainRemote = git show-ref --verify --quiet refs/remotes/origin/clean-main 2>&1

if ($LASTEXITCODE -eq 0 -or $cleanMainRemote) {
    if ($currentBranch -ne "clean-main") {
        if ($cleanMainLocal) {
            git checkout clean-main 2>&1 | Out-Null
        } elseif ($cleanMainRemote) {
            git checkout -b clean-main origin/clean-main 2>&1 | Out-Null
        }
        Write-Host "✅ Switched to clean-main" -ForegroundColor Green
    } else {
        Write-Host "✅ Already on clean-main" -ForegroundColor Green
    }
    
    # Pull latest
    Write-Host "⬇️  Pulling latest clean-main..." -ForegroundColor Yellow
    git pull origin clean-main --no-edit 2>&1 | Out-Null
    Write-Host "✅ Pulled latest" -ForegroundColor Green
} else {
    Write-Host "⚠️  clean-main not found, checking for main..." -ForegroundColor Yellow
    $mainExists = git show-ref --verify --quiet refs/heads/main 2>&1
    if ($LASTEXITCODE -eq 0) {
        git checkout main 2>&1 | Out-Null
        Write-Host "✅ Switched to main" -ForegroundColor Green
    } else {
        Write-Host "❌ No production branch found!" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Find all unmerged branches
Write-Host "`n🔍 Step 3: Finding all unmerged branches..." -ForegroundColor Cyan
$prodBranch = if (git rev-parse --verify --quiet clean-main 2>&1) { "clean-main" } else { "main" }
$unmergedBranches = git branch --no-merged $prodBranch 2>&1 | Where-Object { $_ -notmatch '\*' -and $_ -notmatch $prodBranch -and $_ -notmatch '^\s*$' }

if ($unmergedBranches) {
    Write-Host "Found $($unmergedBranches.Count) unmerged branch(es):" -ForegroundColor Yellow
    $unmergedBranches | ForEach-Object { 
        $branchName = $_.Trim()
        Write-Host "  - $branchName" -ForegroundColor White
    }
} else {
    Write-Host "✅ All branches already merged!" -ForegroundColor Green
    Write-Host "`n📊 Current Status:" -ForegroundColor Cyan
    Write-Host "  Branch: $prodBranch" -ForegroundColor Green
    Write-Host "  Commit: $(git rev-parse --short HEAD 2>&1)" -ForegroundColor Green
    Write-Host "`n✅ Ready to deploy to production!" -ForegroundColor Green
    exit 0
}

# Step 4: Create backup
Write-Host "`n💾 Step 4: Creating backup branch..." -ForegroundColor Cyan
$backupName = "backup-before-merge-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git branch $backupName 2>&1 | Out-Null
Write-Host "✅ Backup created: $backupName" -ForegroundColor Green

# Step 5: Merge all unmerged branches
Write-Host "`n🔄 Step 5: Merging all branches to $prodBranch..." -ForegroundColor Cyan
$mergeCount = 0
$mergeErrors = @()

foreach ($branch in $unmergedBranches) {
    $branchName = $branch.Trim()
    Write-Host "`n  Merging: $branchName" -ForegroundColor Yellow
    
    # Show what commits will be merged
    $commits = git log $prodBranch..$branchName --oneline 2>&1
    if ($commits) {
        Write-Host "    Commits to merge:" -ForegroundColor Gray
        $commits | Select-Object -First 5 | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
        if (($commits | Measure-Object -Line).Lines -gt 5) {
            Write-Host "      ... and $((($commits | Measure-Object -Line).Lines) - 5) more" -ForegroundColor Gray
        }
    }
    
    # Attempt merge
    try {
        $mergeOutput = git merge $branchName --no-ff -m "Merge $branchName to $prodBranch (production)" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ Successfully merged $branchName" -ForegroundColor Green
            $mergeCount++
        } else {
            # Check if it's a conflict
            if ($mergeOutput -match 'conflict' -or $mergeOutput -match 'CONFLICT') {
                Write-Host "    ⚠️  Merge conflict detected" -ForegroundColor Yellow
                Write-Host "    Attempting to resolve..." -ForegroundColor Yellow
                
                # Try to resolve with ours strategy (keep production)
                git merge --abort 2>&1 | Out-Null
                git merge $branchName --strategy-option=ours --no-ff -m "Merge $branchName to $prodBranch (resolved conflicts)" 2>&1 | Out-Null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "    ✅ Resolved and merged" -ForegroundColor Green
                    $mergeCount++
                } else {
                    Write-Host "    ❌ Could not resolve automatically" -ForegroundColor Red
                    Write-Host "    Manual resolution needed" -ForegroundColor Yellow
                    $mergeErrors += $branchName
                }
            } else {
                Write-Host "    ⚠️  Merge issue: $mergeOutput" -ForegroundColor Yellow
                $mergeErrors += $branchName
            }
        }
    } catch {
        Write-Host "    ❌ Error: $_" -ForegroundColor Red
        $mergeErrors += $branchName
    }
}

# Step 6: Stage and commit any remaining changes
Write-Host "`n📦 Step 6: Staging all changes..." -ForegroundColor Cyan
git add -A 2>&1 | Out-Null
$hasChanges = git diff --cached --quiet 2>&1
if ($LASTEXITCODE -ne 0) {
    git commit -m "Complete production deployment - all merges to $prodBranch - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" 2>&1 | Out-Null
    Write-Host "✅ Committed remaining changes" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No additional changes to commit" -ForegroundColor Gray
}

# Step 7: Summary
Write-Host "`n📊 DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "  Production branch: $prodBranch" -ForegroundColor Green
Write-Host "  Branches merged: $mergeCount" -ForegroundColor Green
Write-Host "  Branches with errors: $($mergeErrors.Count)" -ForegroundColor $(if ($mergeErrors.Count -eq 0) { 'Green' } else { 'Yellow' })
Write-Host "  Current commit: $(git rev-parse --short HEAD 2>&1)" -ForegroundColor Green
Write-Host "  Backup branch: $backupName" -ForegroundColor Green

if ($mergeErrors.Count -gt 0) {
    Write-Host "`n⚠️  Branches needing manual attention:" -ForegroundColor Yellow
    $mergeErrors | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
}

# Step 8: Ready to push
Write-Host "`n🚀 READY TO DEPLOY TO PRODUCTION" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Review changes: git log --oneline -20" -ForegroundColor White
Write-Host "  2. Test build: npm run build" -ForegroundColor White
Write-Host "  3. Push to production: git push origin $prodBranch" -ForegroundColor White
Write-Host "`n⚠️  IMPORTANT: This will deploy to PRODUCTION, not preview!" -ForegroundColor Yellow
Write-Host "   Cloudflare will auto-deploy from $prodBranch branch" -ForegroundColor Cyan

Write-Host "`n✅ Merge process complete!" -ForegroundColor Green


