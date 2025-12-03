# DEEP AUDIT USING YOUR TOKENS
$ErrorActionPreference = "Continue"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DEEP AUDIT - CHECKING EVERYTHING" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Tokens
$SUPABASE_URL = "https://emlqlmfzqsnqokrqvmcm.supabase.co"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg"
$SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg4NDQ5MiwiZXhwIjoyMDc5NDYwNDkyfQ.m3xw006mSdP1DeunLo4CoNDonIIXkQSt353VL-ibb0c"
$GITHUB_TOKEN = "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"

$headers = @{
    "Authorization" = "Bearer $SERVICE_KEY"
    "apikey" = $ANON_KEY
    "Content-Type" = "application/json"
}

# CHECK 1: Supabase Products
Write-Host "[1/5] Checking real_products table..." -ForegroundColor Yellow
try {
    $products = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/real_products?select=id,name,price,status" -Headers $headers -Method GET -TimeoutSec 10
    Write-Host "Products found: $($products.Count)" -ForegroundColor Green
    if ($products.Count -eq 0) {
        Write-Host "⚠ DATABASE IS EMPTY - No products yet!" -ForegroundColor Red
        Write-Host "This is why admin shows 'Add product first'" -ForegroundColor Yellow
    } else {
        $products | Format-Table -AutoSize
    }
} catch {
    Write-Host "✗ Error checking products: $_" -ForegroundColor Red
}
Write-Host ""

# CHECK 2: Supabase Functions
Write-Host "[2/5] Checking Edge Functions..." -ForegroundColor Yellow
$functions = @("stripe-payment-intent", "stripe-webhook", "send-order-emails", "send-credentials-email")
foreach ($func in $functions) {
    try {
        $response = Invoke-WebRequest -Uri "$SUPABASE_URL/functions/v1/$func" -Headers @{"apikey"=$ANON_KEY} -Method OPTIONS -TimeoutSec 5
        Write-Host "✓ $func - DEPLOYED" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 404) {
            Write-Host "✗ $func - NOT DEPLOYED" -ForegroundColor Red
        } else {
            Write-Host "? $func - Unknown status" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# CHECK 3: GitHub Repo
Write-Host "[3/5] Checking GitHub repository..." -ForegroundColor Yellow
try {
    $ghHeaders = @{
        "Authorization" = "token $GITHUB_TOKEN"
        "Accept" = "application/vnd.github.v3+json"
    }
    $repo = Invoke-RestMethod -Uri "https://api.github.com/repos/reloadedfiretvteam-hash/streamerstickprofinal" -Headers $ghHeaders -TimeoutSec 10
    Write-Host "✓ Repository accessible" -ForegroundColor Green
    Write-Host "  Default branch: $($repo.default_branch)" -ForegroundColor Cyan
    Write-Host "  Last pushed: $($repo.pushed_at)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error accessing GitHub: $_" -ForegroundColor Red
}
Write-Host ""

# CHECK 4: GitHub Branches
Write-Host "[4/5] Checking clean-main branch..." -ForegroundColor Yellow
try {
    $branch = Invoke-RestMethod -Uri "https://api.github.com/repos/reloadedfiretvteam-hash/streamerstickprofinal/branches/clean-main" -Headers $ghHeaders -TimeoutSec 10
    Write-Host "✓ clean-main branch exists" -ForegroundColor Green
    Write-Host "  Last commit: $($branch.commit.commit.message)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error checking branch: $_" -ForegroundColor Red
}
Write-Host ""

# CHECK 5: Local vs Remote
Write-Host "[5/5] Checking local git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠ You have uncommitted changes:" -ForegroundColor Yellow
    $gitStatus | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} else {
    Write-Host "✓ No uncommitted changes" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "AUDIT COMPLETE - SUMMARY" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SAVE THIS OUTPUT TO A FILE:" -ForegroundColor Yellow
Write-Host "It shows you exactly what's deployed vs what's missing" -ForegroundColor Yellow
Write-Host ""
pause


