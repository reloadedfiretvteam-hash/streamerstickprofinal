# ============================================================
# DEPLOY SUPABASE EDGE FUNCTIONS
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYING SUPABASE EDGE FUNCTIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Supabase CLI is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install it from: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or deploy manually in Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions" -ForegroundColor Yellow
    exit 1
}

Write-Host "Supabase CLI found!" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Supabase CLI connection..." -ForegroundColor Yellow
$linkCheck = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Please log in and link your project first:" -ForegroundColor Yellow
    Write-Host "  supabase login" -ForegroundColor Cyan
    Write-Host "  supabase link --project-ref emlqlmfzqsnqokrqvmcm" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "✓ Connected to Supabase" -ForegroundColor Green
Write-Host ""

# Functions to deploy
$functions = @(
    "stripe-payment-intent",
    "stripe-webhook"
)

Write-Host "Deploying Edge Functions..." -ForegroundColor Yellow
Write-Host ""

foreach ($function in $functions) {
    $functionPath = "supabase\functions\$function"
    
    if (Test-Path $functionPath) {
        Write-Host "Deploying $function..." -ForegroundColor Cyan
        supabase functions deploy $function --project-ref emlqlmfzqsnqokrqvmcm
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $function deployed successfully" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to deploy $function" -ForegroundColor Red
        }
    } else {
        Write-Host "  ✗ Function not found: $functionPath" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verify deployment in Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions" -ForegroundColor Cyan
Write-Host ""






