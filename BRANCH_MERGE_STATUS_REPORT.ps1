# Comprehensive Branch Merge Status Report
Write-Host "📊 COMPREHENSIVE BRANCH MERGE STATUS REPORT" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

# Fetch everything first
Write-Host "📥 Fetching latest information..." -ForegroundColor Cyan
git fetch --all --prune 2>&1 | Out-Null

# Get all branches
$allBranches = @()
$localBranches = git branch --format='%(refname:short)' 2>&1 | Where-Object { $_ -notmatch '^\s*$' }
$remoteBranches = git branch -r --format='%(refname:short)' 2>&1 | Where-Object { $_ -notmatch '^\s*$' -and $_ -notmatch 'HEAD' }

$currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
$prodBranch = $null

# Determine production branch
if (git show-ref --verify --quiet refs/heads/clean-main 2>&1) {
    $prodBranch = "clean-main"
} elseif (git show-ref --verify --quiet refs/remotes/origin/clean-main 2>&1) {
    $prodBranch = "clean-main"
} elseif (git show-ref --verify --quiet refs/heads/main 2>&1) {
    $prodBranch = "main"
} elseif (git show-ref --verify --quiet refs/remotes/origin/main 2>&1) {
    $prodBranch = "main"
}

Write-Host "`n📍 CURRENT STATUS" -ForegroundColor Cyan
Write-Host "  Current branch: $currentBranch" -ForegroundColor Yellow
Write-Host "  Production branch: $(if ($prodBranch) { $prodBranch } else { 'Not found' })" -ForegroundColor Yellow
Write-Host "  Latest commit: $(git rev-parse --short HEAD 2>&1)" -ForegroundColor Yellow
Write-Host "  Uncommitted files: $(git status --porcelain 2>&1 | Measure-Object -Line | Select-Object -ExpandProperty Lines)" -ForegroundColor Yellow

# Analyze each branch
Write-Host "`n📋 BRANCH ANALYSIS" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

$branchReport = @()

foreach ($branch in ($localBranches + $remoteBranches | Select-Object -Unique)) {
    $branchName = $branch.Trim()
    if ($branchName -match 'origin/') {
        $branchName = $branchName -replace 'origin/', ''
    }
    
    $isMerged = $false
    $isCurrent = ($branchName -eq $currentBranch)
    $hasRemote = $remoteBranches | Where-Object { $_ -match "origin/$branchName" }
    $hasLocal = $localBranches | Where-Object { $_ -eq $branchName }
    
    # Check if merged into production
    if ($prodBranch) {
        try {
            $mergedCheck = git branch --merged $prodBranch 2>&1 | Where-Object { $_ -match $branchName }
            $isMerged = $null -ne $mergedCheck
        } catch {
            $isMerged = $false
        }
    }
    
    # Get commit info
    $commitCount = 0
    $lastCommit = ""
    try {
        $commits = git log $branchName --oneline -1 2>&1
        if ($commits) {
            $commitCount = (git rev-list --count $branchName 2>&1) -as [int]
            $lastCommit = ($commits -split ' ')[0]
        }
    } catch {
        # Branch might not exist locally
    }
    
    $status = if ($isMerged) { "✅ MERGED" } elseif ($isCurrent) { "📍 CURRENT" } else { "❌ NOT MERGED" }
    
    $branchReport += [PSCustomObject]@{
        Branch = $branchName
        Status = $status
        Merged = $isMerged
        Local = $hasLocal
        Remote = $hasRemote
        Commits = $commitCount
        LastCommit = $lastCommit
    }
}

# Display report
Write-Host "`n"
$branchReport | Format-Table -AutoSize

# Summary
$mergedCount = ($branchReport | Where-Object { $_.Merged }).Count
$unmergedCount = ($branchReport | Where-Object { -not $_.Merged -and $_.Branch -ne $currentBranch }).Count

Write-Host "`n📊 SUMMARY" -ForegroundColor Cyan
Write-Host "  Total branches: $($branchReport.Count)" -ForegroundColor White
Write-Host "  ✅ Merged: $mergedCount" -ForegroundColor Green
Write-Host "  ❌ Not merged: $unmergedCount" -ForegroundColor Red
Write-Host "  📍 Current: $currentBranch" -ForegroundColor Yellow

# List unmerged branches
if ($unmergedCount -gt 0) {
    Write-Host "`n❌ BRANCHES NEEDING MERGE" -ForegroundColor Red
    $branchReport | Where-Object { -not $_.Merged -and $_.Branch -ne $currentBranch } | ForEach-Object {
        Write-Host "  - $($_.Branch) ($($_.Commits) commits)" -ForegroundColor Yellow
    }
}

# Deployment status
Write-Host "`n🚀 DEPLOYMENT STATUS" -ForegroundColor Cyan
Write-Host "  Production branch: $(if ($prodBranch) { $prodBranch } else { 'Not found' })" -ForegroundColor $(if ($prodBranch) { 'Green' } else { 'Red' })
Write-Host "  Ready to deploy: $(if ((git status --porcelain 2>&1 | Measure-Object -Line | Select-Object -ExpandProperty Lines) -eq 0) { 'Yes' } else { 'No - uncommitted changes' })" -ForegroundColor $(if ((git status --porcelain 2>&1 | Measure-Object -Line | Select-Object -ExpandProperty Lines) -eq 0) { 'Green' } else { 'Yellow' })

# Save report to file
$reportFile = "BRANCH_MERGE_STATUS_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$branchReport | Format-Table -AutoSize | Out-File $reportFile
Write-Host "`n💾 Report saved to: $reportFile" -ForegroundColor Cyan

Write-Host "`n✅ Status report complete!" -ForegroundColor Green


