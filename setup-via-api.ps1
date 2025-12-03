# ============================================================
# SETUP SUPABASE SECRETS VIA API
# ============================================================
# Alternative method if Supabase CLI is not available
# Note: Supabase doesn't expose secrets via REST API for security
# This script provides instructions for manual setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUPABASE EDGE FUNCTIONS SECRETS SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Since Supabase CLI is not installed, use the Dashboard method:" -ForegroundColor Yellow
Write-Host ""

Write-Host "STEP 1: Go to Supabase Dashboard" -ForegroundColor Yellow
Write-Host "  URL: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions/settings" -ForegroundColor Cyan
Write-Host ""

Write-Host "STEP 2: Add these secrets:" -ForegroundColor Yellow
Write-Host ""

$secrets = @{
    "STRIPE_SECRET_KEY" = "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"
    "SUPABASE_URL" = "https://emlqlmfzqsnqokrqvmcm.supabase.co"
    "SUPABASE_SERVICE_ROLE_KEY" = "GET_FROM_DASHBOARD"
}

foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    Write-Host "  Secret Name: $key" -ForegroundColor Cyan
    Write-Host "  Value: $value" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "STEP 3: Get Service Role Key" -ForegroundColor Yellow
Write-Host "  URL: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api" -ForegroundColor Cyan
Write-Host "  Look for 'service_role' key (⚠️ Keep secret!)" -ForegroundColor Yellow
Write-Host ""

Write-Host "STEP 4: After creating Stripe webhook, add:" -ForegroundColor Yellow
Write-Host "  Secret Name: STRIPE_WEBHOOK_SECRET" -ForegroundColor Cyan
Write-Host "  Value: whsec_... (from Stripe Dashboard)" -ForegroundColor Gray
Write-Host ""

Write-Host "Opening Supabase Dashboard in browser..." -ForegroundColor Yellow
Start-Process "https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions/settings"






