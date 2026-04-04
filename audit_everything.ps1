# DEEP AUDIT USING YOUR TOKENS
$ErrorActionPreference = "Continue"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DEEP AUDIT - CHECKING EVERYTHING" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Set in your shell (never commit real values): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY, optional GITHUB_TOKEN.
$SUPABASE_URL = $env:VITE_SUPABASE_URL; if (-not $SUPABASE_URL) { $SUPABASE_URL = $env:SUPABASE_URL }
$ANON_KEY = $env:VITE_SUPABASE_ANON_KEY
$SERVICE_KEY = $env:SUPABASE_SERVICE_ROLE_KEY; if (-not $SERVICE_KEY) { $SERVICE_KEY = $env:SUPABASE_SERVICE_KEY }
$GITHUB_TOKEN = $env:GITHUB_TOKEN
if (-not $SUPABASE_URL -or -not $ANON_KEY -or -not $SERVICE_KEY) {
  Write-Host "Missing env: VITE_SUPABASE_URL (or SUPABASE_URL), VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Red
  exit 1
}

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


