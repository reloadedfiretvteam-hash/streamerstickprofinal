# Fix Repository Access Script
# This will help identify and fix repository access issues

Write-Host "=== DIAGNOSING REPOSITORY ACCESS ===" -ForegroundColor Cyan

# Check current remote
Write-Host "`n1. Current remote URL:" -ForegroundColor Yellow
git remote -v

# Test connection
Write-Host "`n2. Testing connection..." -ForegroundColor Yellow
$testResult = git ls-remote origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Connection successful!" -ForegroundColor Green
    Write-Host $testResult
} else {
    Write-Host "❌ Connection failed!" -ForegroundColor Red
    Write-Host $testResult
    
    Write-Host "`n3. Possible issues:" -ForegroundColor Yellow
    Write-Host "   - Repository name might be wrong" -ForegroundColor Yellow
    Write-Host "   - Organization/user name might be wrong" -ForegroundColor Yellow
    Write-Host "   - Token might not have access" -ForegroundColor Yellow
    Write-Host "   - Repository might have been deleted/renamed" -ForegroundColor Yellow
    
    Write-Host "`n4. Please check:" -ForegroundColor Cyan
    Write-Host "   - Go to: https://github.com/reloadedfiretvteam-hash" -ForegroundColor Cyan
    Write-Host "   - Find the correct repository name" -ForegroundColor Cyan
    Write-Host "   - Or check if it's under a different organization" -ForegroundColor Cyan
}

# Show current branch
Write-Host "`n5. Current branch:" -ForegroundColor Yellow
git branch --show-current

# Show uncommitted changes
Write-Host "`n6. Uncommitted changes:" -ForegroundColor Yellow
git status --short

Write-Host "`n=== DIAGNOSIS COMPLETE ===" -ForegroundColor Cyan

