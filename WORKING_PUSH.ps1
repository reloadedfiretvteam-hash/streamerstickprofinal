# Working Push - Step by step with output

$ErrorActionPreference = "Continue"

cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

Write-Host "=== STEP BY STEP PUSH ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check branch
Write-Host "Step 1: Current branch" -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "Branch: $branch" -ForegroundColor White
if ($branch -ne "clean-main") {
    Write-Host "Switching to clean-main..." -ForegroundColor Yellow
    git checkout clean-main
    $branch = git branch --show-current
    Write-Host "Now on: $branch" -ForegroundColor White
}
Write-Host ""

# Step 2: Remove and add remote
Write-Host "Step 2: Setting remote" -ForegroundColor Yellow
git remote remove origin 2>&1 | Out-Null
git remote add origin https://github.com/reloadedfiretvteam-hash/streamerstickprofinal.git
Write-Host "Remote set" -ForegroundColor White
git remote -v
Write-Host ""

# Step 3: Test connection
Write-Host "Step 3: Testing connection" -ForegroundColor Yellow
$test = git ls-remote origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connection works!" -ForegroundColor Green
} else {
    Write-Host "❌ Connection failed:" -ForegroundColor Red
    Write-Host $test -ForegroundColor Red
    Write-Host "Trying with token..." -ForegroundColor Yellow
    git remote set-url origin https://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@github.com/reloadedfiretvteam-hash/streamerstickprofinal.git
    $test2 = git ls-remote origin 2>&1
    Write-Host $test2
}
Write-Host ""

# Step 4: Stage
Write-Host "Step 4: Staging all changes" -ForegroundColor Yellow
git add -A
$status = git status --short
if ($status) {
    Write-Host "Files staged:" -ForegroundColor White
    Write-Host $status
} else {
    Write-Host "No changes to stage" -ForegroundColor Cyan
}
Write-Host ""

# Step 5: Commit
Write-Host "Step 5: Committing" -ForegroundColor Yellow
$commit = git commit -m "COMPLETE FIX: All fixes consolidated" 2>&1
Write-Host $commit
Write-Host ""

# Step 6: Push
Write-Host "Step 6: Pushing to clean-main" -ForegroundColor Yellow
$push1 = git push origin clean-main --force 2>&1
Write-Host $push1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Push failed!" -ForegroundColor Red
}
Write-Host ""

# Step 7: Push to main
Write-Host "Step 7: Pushing to main" -ForegroundColor Yellow
$push2 = git push origin clean-main:main --force 2>&1
Write-Host $push2
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Push to main successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Push to main failed!" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== COMPLETE ===" -ForegroundColor Cyan

