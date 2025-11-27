# Verify Push Script - Actually checks if push succeeded

Write-Host "=== VERIFYING PUSH STATUS ===" -ForegroundColor Cyan

# Get local commit
Write-Host "`n1. Local commit:" -ForegroundColor Yellow
$localCommit = git rev-parse HEAD
Write-Host $localCommit

# Fetch latest from remote
Write-Host "`n2. Fetching from remote..." -ForegroundColor Yellow
git fetch origin clean-main 2>&1 | Out-Null

# Get remote commit
Write-Host "`n3. Remote commit:" -ForegroundColor Yellow
$remoteCommit = git rev-parse origin/clean-main 2>&1
Write-Host $remoteCommit

# Compare
Write-Host "`n4. Comparison:" -ForegroundColor Yellow
if ($localCommit -eq $remoteCommit) {
    Write-Host "✅ PUSH VERIFIED - Local and remote commits match!" -ForegroundColor Green
    Write-Host "   Your fixes are on GitHub!" -ForegroundColor Green
} else {
    Write-Host "❌ PUSH FAILED - Commits do not match!" -ForegroundColor Red
    Write-Host "   Local:  $localCommit" -ForegroundColor Red
    Write-Host "   Remote: $remoteCommit" -ForegroundColor Red
    Write-Host "`n   Need to push!" -ForegroundColor Yellow
}

# Show latest commit message
Write-Host "`n5. Latest local commit message:" -ForegroundColor Yellow
git log --oneline -1

Write-Host "`n6. Latest remote commit message:" -ForegroundColor Yellow
git log origin/clean-main --oneline -1

Write-Host "`n=== VERIFICATION COMPLETE ===" -ForegroundColor Cyan

