# ============================================================
# SUPABASE EDGE FUNCTIONS SECRETS SETUP SCRIPT
# ============================================================
# This script helps you set up Supabase Edge Functions secrets
# Note: Supabase CLI is required for this to work

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUPABASE EDGE FUNCTIONS SECRETS SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Supabase CLI is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install it from: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or manually add secrets in Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions/settings" -ForegroundColor Yellow
    exit 1
}

Write-Host "Supabase CLI found!" -ForegroundColor Green
Write-Host ""

# Set secrets
$secrets = @{
    "STRIPE_SECRET_KEY" = "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"
    "SUPABASE_URL" = "https://emlqlmfzqsnqokrqvmcm.supabase.co"
}

Write-Host "Setting up Supabase Edge Functions secrets..." -ForegroundColor Yellow
Write-Host ""

# Note: Supabase CLI secrets are set per project
# You need to be logged in and linked to your project first
Write-Host "IMPORTANT: Make sure you're logged in to Supabase CLI:" -ForegroundColor Yellow
Write-Host "  supabase login" -ForegroundColor Cyan
Write-Host "  supabase link --project-ref emlqlmfzqsnqokrqvmcm" -ForegroundColor Cyan
Write-Host ""

$continue = Read-Host "Have you logged in and linked your project? (y/n)"
if ($continue -ne "y") {
    Write-Host ""
    Write-Host "Please run these commands first:" -ForegroundColor Yellow
    Write-Host "  supabase login" -ForegroundColor Cyan
    Write-Host "  supabase link --project-ref emlqlmfzqsnqokrqvmcm" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Setting secrets..." -ForegroundColor Yellow

foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    Write-Host "Setting $key..." -ForegroundColor Cyan
    supabase secrets set "$key=$value" --project-ref emlqlmfzqsnqokrqvmcm
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ $key set successfully" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to set $key" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMPORTANT: Set STRIPE_WEBHOOK_SECRET manually" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After creating the Stripe webhook, get the signing secret" -ForegroundColor Yellow
Write-Host "and set it with:" -ForegroundColor Yellow
Write-Host "  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref emlqlmfzqsnqokrqvmcm" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or add it in Supabase Dashboard:" -ForegroundColor Yellow
Write-Host "https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions/settings" -ForegroundColor Cyan
Write-Host ""






