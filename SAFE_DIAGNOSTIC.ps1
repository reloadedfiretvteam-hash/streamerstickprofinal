# Safe Diagnostic - Read-Only Check of Repository State
# This script does NOT modify anything - it only reads and reports

Write-Host "🔍 SAFE DIAGNOSTIC - Repository State Check" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host "This script is READ-ONLY - it will NOT modify anything" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repo
$isGitRepo = Test-Path .git
Write-Host "📁 Git Repository: $(if ($isGitRepo) { '✅ Found' } else { '❌ Not found' })" -ForegroundColor $(if ($isGitRepo) { 'Green' } else { 'Red' })

if (-not $isGitRepo) {
    Write-Host "`n⚠️  Not in a git repository. Exiting." -ForegroundColor Yellow
    exit
}

# Current branch
Write-Host "`n📍 Current Branch:" -ForegroundColor Cyan
try {
    $currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  $currentBranch" -ForegroundColor Yellow
    } else {
        Write-Host "  ⚠️  Could not determine" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Error: $_" -ForegroundColor Red
}

# Current commit
Write-Host "`n📝 Current Commit:" -ForegroundColor Cyan
try {
    $currentCommit = git rev-parse --short HEAD 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  $currentCommit" -ForegroundColor Yellow
        $commitMsg = git log -1 --pretty=format:"%s" 2>&1
        Write-Host "  Message: $commitMsg" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  Could not determine" -ForegroundColor Yellow
}

# Uncommitted changes
Write-Host "`n📋 Uncommitted Changes:" -ForegroundColor Cyan
try {
    $changes = git status --porcelain 2>&1
    if ($changes) {
        $changeCount = ($changes | Measure-Object -Line).Lines
        Write-Host "  ⚠️  $changeCount file(s) with uncommitted changes" -ForegroundColor Yellow
        Write-Host "  (Run 'git status' to see details)" -ForegroundColor Gray
    } else {
        Write-Host "  ✅ Working directory clean" -ForegroundColor Green
    }
} catch {
    Write-Host "  ⚠️  Could not check" -ForegroundColor Yellow
}

# Local branches
Write-Host "`n🌿 Local Branches:" -ForegroundColor Cyan
try {
    $localBranches = git branch --format='%(refname:short)' 2>&1
    if ($localBranches) {
        $branchList = $localBranches | Where-Object { $_ -notmatch '^\s*$' }
        if ($branchList) {
            $branchList | ForEach-Object { 
                $marker = if ($_ -eq $currentBranch) { "📍 " } else { "   " }
                Write-Host "$marker$_" -ForegroundColor White
            }
            Write-Host "  Total: $($branchList.Count) branch(es)" -ForegroundColor Gray
        } else {
            Write-Host "  (none found)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "  ⚠️  Could not list branches" -ForegroundColor Yellow
}

# Remote branches
Write-Host "`n🌐 Remote Branches:" -ForegroundColor Cyan
try {
    $remoteBranches = git branch -r --format='%(refname:short)' 2>&1 | Where-Object { $_ -notmatch 'HEAD' -and $_ -notmatch '^\s*$' }
    if ($remoteBranches) {
        $remoteBranches | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
        Write-Host "  Total: $($remoteBranches.Count) branch(es)" -ForegroundColor Gray
    } else {
        Write-Host "  (none found)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  Could not list remote branches" -ForegroundColor Yellow
}

# Branches with numbers (105, 205, etc.)
Write-Host "`n🔢 Branches with Numbers (105, 205, etc.):" -ForegroundColor Cyan
try {
    $allBranches = (git branch -a --format='%(refname:short)' 2>&1) | Where-Object { $_ -notmatch 'HEAD' -and $_ -notmatch '^\s*$' }
    $numberBranches = $allBranches | Where-Object { $_ -match '\d{3,}' -or $_ -match '105|205' }
    if ($numberBranches) {
        $numberBranches | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    } else {
        Write-Host "  (none found)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  Could not check" -ForegroundColor Yellow
}

# Merge status (what's merged into current branch)
Write-Host "`n🔄 Merge Status (into current branch):" -ForegroundColor Cyan
try {
    $mergedBranches = git branch --merged 2>&1 | Where-Object { $_ -notmatch '\*' -and $_ -notmatch '^\s*$' }
    $unmergedBranches = git branch --no-merged 2>&1 | Where-Object { $_ -notmatch '\*' -and $_ -notmatch '^\s*$' }
    
    if ($mergedBranches) {
        Write-Host "  ✅ Merged branches:" -ForegroundColor Green
        $mergedBranches | ForEach-Object { Write-Host "    $_" -ForegroundColor Green }
    }
    
    if ($unmergedBranches) {
        Write-Host "  ❌ Unmerged branches:" -ForegroundColor Red
        $unmergedBranches | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    }
    
    if (-not $mergedBranches -and -not $unmergedBranches) {
        Write-Host "  (no other branches to compare)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  Could not check merge status" -ForegroundColor Yellow
}

# Recent commits
Write-Host "`n📜 Recent Commits (last 10):" -ForegroundColor Cyan
try {
    $commits = git log --oneline -10 2>&1
    if ($commits) {
        $commits | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    } else {
        Write-Host "  (none found)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  Could not get commits" -ForegroundColor Yellow
}

# Remote info
Write-Host "`n🔗 Remote Information:" -ForegroundColor Cyan
try {
    $remotes = git remote 2>&1
    if ($remotes) {
        $remotes | ForEach-Object {
            $remote = $_
            $url = git remote get-url $remote 2>&1
            Write-Host "  $remote : $url" -ForegroundColor White
        }
    } else {
        Write-Host "  (no remotes configured)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️  Could not get remote info" -ForegroundColor Yellow
}

Write-Host "`n✅ Diagnostic complete!" -ForegroundColor Green
Write-Host "`nThis was a READ-ONLY check - nothing was modified." -ForegroundColor Cyan


