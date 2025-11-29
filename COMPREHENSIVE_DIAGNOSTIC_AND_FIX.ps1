# Comprehensive Diagnostic and Fix Script
# This will diagnose, show status, and help complete merges to clean-main (production)

Write-Host "`n🔍 COMPREHENSIVE DIAGNOSTIC AND FIX" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Step 1: Check if we're in a git repo
Write-Host "📁 Step 1: Checking Git Repository..." -ForegroundColor Cyan
$isGitRepo = Test-Path .git
if (-not $isGitRepo) {
    Write-Host "❌ Not in a git repository!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git repository found" -ForegroundColor Green

# Step 2: Fetch all branches
Write-Host "`n📥 Step 2: Fetching all branches..." -ForegroundColor Cyan
$fetchOutput = git fetch --all --prune 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Fetched all branches" -ForegroundColor Green
} else {
    Write-Host "⚠️  Fetch had issues: $fetchOutput" -ForegroundColor Yellow
}

# Step 3: Get current branch
Write-Host "`n📍 Step 3: Current Branch Status..." -ForegroundColor Cyan
$currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
$currentCommit = git rev-parse --short HEAD 2>&1
Write-Host "  Current branch: $currentBranch" -ForegroundColor Yellow
Write-Host "  Current commit: $currentCommit" -ForegroundColor Yellow

# Step 4: List all branches
Write-Host "`n🌿 Step 4: All Branches..." -ForegroundColor Cyan
Write-Host "`n--- Local Branches ---" -ForegroundColor Yellow
$localBranches = git branch --format='%(refname:short)' 2>&1 | Where-Object { $_ -notmatch '^\s*$' }
if ($localBranches) {
    $localBranches | ForEach-Object { 
        $marker = if ($_ -eq $currentBranch) { "📍 " } else { "   " }
        Write-Host "$marker$_" -ForegroundColor White
    }
} else {
    Write-Host "  (none)" -ForegroundColor Gray
}

Write-Host "`n--- Remote Branches ---" -ForegroundColor Yellow
$remoteBranches = git branch -r --format='%(refname:short)' 2>&1 | Where-Object { $_ -notmatch 'HEAD' -and $_ -notmatch '^\s*$' }
if ($remoteBranches) {
    $remoteBranches | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Host "  (none)" -ForegroundColor Gray
}

# Step 5: Check for clean-main
Write-Host "`n🎯 Step 5: Production Branch (clean-main) Status..." -ForegroundColor Cyan
$cleanMainExists = $false
$cleanMainLocal = git show-ref --verify --quiet refs/heads/clean-main 2>&1
if ($LASTEXITCODE -eq 0) {
    $cleanMainExists = $true
    Write-Host "✅ clean-main exists locally" -ForegroundColor Green
    $cleanMainCommit = git rev-parse --short clean-main 2>&1
    Write-Host "  Commit: $cleanMainCommit" -ForegroundColor Yellow
} else {
    $cleanMainRemote = git show-ref --verify --quiet refs/remotes/origin/clean-main 2>&1
    if ($LASTEXITCODE -eq 0) {
        $cleanMainExists = $true
        Write-Host "✅ clean-main exists on remote" -ForegroundColor Green
        Write-Host "  (not checked out locally)" -ForegroundColor Yellow
    } else {
        Write-Host "❌ clean-main branch not found" -ForegroundColor Red
        Write-Host "  Checking for 'main' branch instead..." -ForegroundColor Yellow
        $mainExists = git show-ref --verify --quiet refs/heads/main 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ main branch exists" -ForegroundColor Green
        }
    }
}

# Step 6: Check what's merged
Write-Host "`n🔄 Step 6: Merge Status..." -ForegroundColor Cyan
if ($cleanMainExists) {
    if ($currentBranch -ne "clean-main") {
        Write-Host "  Switching to clean-main to check merge status..." -ForegroundColor Yellow
        git checkout clean-main 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $currentBranch = "clean-main"
            Write-Host "✅ Switched to clean-main" -ForegroundColor Green
        }
    }
    
    Write-Host "`n--- Branches merged into clean-main ---" -ForegroundColor Yellow
    $mergedBranches = git branch --merged clean-main 2>&1 | Where-Object { $_ -notmatch '\*' -and $_ -notmatch 'clean-main' -and $_ -notmatch '^\s*$' }
    if ($mergedBranches) {
        $mergedBranches | ForEach-Object { Write-Host "  ✅ $($_.Trim())" -ForegroundColor Green }
    } else {
        Write-Host "  (none)" -ForegroundColor Gray
    }
    
    Write-Host "`n--- Branches NOT merged into clean-main ---" -ForegroundColor Yellow
    $unmergedBranches = git branch --no-merged clean-main 2>&1 | Where-Object { $_ -notmatch '\*' -and $_ -notmatch 'clean-main' -and $_ -notmatch '^\s*$' }
    if ($unmergedBranches) {
        $unmergedBranches | ForEach-Object { 
            $branchName = $_.Trim()
            Write-Host "  ❌ $branchName" -ForegroundColor Red
            # Show commit count
            $commitCount = git rev-list --count "$branchName..clean-main" 2>&1
            if ($commitCount -match '^\d+$') {
                Write-Host "     ($commitCount commits ahead)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "  (all merged)" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Cannot check merge status - clean-main not found" -ForegroundColor Yellow
}

# Step 7: Check for branches with numbers (105, 205, etc.)
Write-Host "`n🔢 Step 7: Branches with Numbers (105, 205, etc.)..." -ForegroundColor Cyan
$allBranches = ($localBranches + $remoteBranches) | Where-Object { $_ -notmatch 'HEAD' }
$numberBranches = $allBranches | Where-Object { $_ -match '\d{3,}' -or $_ -match '105|205' }
if ($numberBranches) {
    $numberBranches | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
} else {
    Write-Host "  (none found)" -ForegroundColor Gray
}

# Step 8: Check uncommitted changes
Write-Host "`n📋 Step 8: Uncommitted Changes..." -ForegroundColor Cyan
$changes = git status --porcelain 2>&1
if ($changes) {
    $changeCount = ($changes | Measure-Object -Line).Lines
    Write-Host "⚠️  $changeCount file(s) with uncommitted changes" -ForegroundColor Yellow
    Write-Host "  Run 'git status' to see details" -ForegroundColor Gray
} else {
    Write-Host "✅ Working directory clean" -ForegroundColor Green
}

# Step 9: Recent commits
Write-Host "`n📜 Step 9: Recent Commits on Current Branch..." -ForegroundColor Cyan
$commits = git log --oneline -10 2>&1
if ($commits) {
    $commits | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
} else {
    Write-Host "  (none)" -ForegroundColor Gray
}

# Step 10: Summary and recommendations
Write-Host "`n📊 SUMMARY" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host "  Current branch: $currentBranch" -ForegroundColor White
Write-Host "  Production branch: $(if ($cleanMainExists) { 'clean-main ✅' } else { 'Not found ❌' })" -ForegroundColor $(if ($cleanMainExists) { 'Green' } else { 'Red' })
if ($unmergedBranches) {
    $unmergedCount = ($unmergedBranches | Measure-Object).Count
    Write-Host "  Unmerged branches: $unmergedCount" -ForegroundColor Red
    Write-Host "`n🔧 RECOMMENDATION:" -ForegroundColor Yellow
    Write-Host "  Run complete-all-merges.ps1 to merge all branches to clean-main" -ForegroundColor White
} else {
    Write-Host "  All branches merged ✅" -ForegroundColor Green
}

Write-Host "`n✅ Diagnostic complete!" -ForegroundColor Green


