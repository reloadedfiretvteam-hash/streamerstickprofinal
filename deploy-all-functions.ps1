# PowerShell script to deploy all Supabase Edge Functions
# Run this script to deploy all functions at once

Write-Host "🚀 Deploying all Supabase Edge Functions..." -ForegroundColor Green
Write-Host ""

$functions = @(
    "stripe-payment-intent",
    "stripe-webhook",
    "create-payment-intent",
    "confirm-payment",
    "send-order-emails",
    "nowpayments-webhook"
)

foreach ($func in $functions) {
    Write-Host "Deploying: $func" -ForegroundColor Yellow
    supabase functions deploy $func
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $func deployed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to deploy $func" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "✨ All functions deployment complete!" -ForegroundColor Green







