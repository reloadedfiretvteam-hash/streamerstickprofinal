# ============================================================
# STRIPE WEBHOOK SETUP VIA API
# ============================================================
# This script helps create Stripe webhook via Stripe API

param(
    [string]$StripeSecretKey = "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"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STRIPE WEBHOOK SETUP VIA API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$webhookUrl = "https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook"

Write-Host "Creating Stripe webhook endpoint..." -ForegroundColor Yellow
Write-Host "  URL: $webhookUrl" -ForegroundColor Cyan
Write-Host ""

# Events to listen to
$events = @(
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "payment_intent.canceled",
    "payment_intent.processing",
    "payment_intent.created"
)

# Create webhook via Stripe API
$body = @{
    url = $webhookUrl
    enabled_events = $events
} | ConvertTo-Json

try {
    $headers = @{
        "Authorization" = "Bearer $StripeSecretKey"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Sending request to Stripe API..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "https://api.stripe.com/v1/webhook_endpoints" -Method Post -Headers $headers -Body $body
    
    Write-Host ""
    Write-Host "✓ Webhook created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Webhook Details:" -ForegroundColor Cyan
    Write-Host "  ID: $($response.id)" -ForegroundColor Gray
    Write-Host "  URL: $($response.url)" -ForegroundColor Gray
    Write-Host "  Status: $($response.status)" -ForegroundColor Gray
    Write-Host ""
    
    # Get signing secret
    Write-Host "Getting webhook signing secret..." -ForegroundColor Yellow
    $secretResponse = Invoke-RestMethod -Uri "https://api.stripe.com/v1/webhook_endpoints/$($response.id)" -Method Get -Headers $headers
    
    if ($secretResponse.secret) {
        Write-Host ""
        Write-Host "✓ Signing Secret:" -ForegroundColor Green
        Write-Host "  $($secretResponse.secret)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "IMPORTANT: Add this to Supabase Edge Functions Secrets:" -ForegroundColor Yellow
        Write-Host "  Secret Name: STRIPE_WEBHOOK_SECRET" -ForegroundColor Cyan
        Write-Host "  Value: $($secretResponse.secret)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "URL: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions/settings" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "⚠ Signing secret not available in API response" -ForegroundColor Yellow
        Write-Host "Get it from Stripe Dashboard:" -ForegroundColor Yellow
        Write-Host "  https://dashboard.stripe.com/webhooks" -ForegroundColor Cyan
        Write-Host "  Click on the webhook → Reveal signing secret" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host ""
    Write-Host "✗ Error creating webhook:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Create webhook manually in Stripe Dashboard:" -ForegroundColor Yellow
    Write-Host "  https://dashboard.stripe.com/webhooks" -ForegroundColor Cyan
    Write-Host "  Endpoint URL: $webhookUrl" -ForegroundColor Cyan
    Write-Host "  Events: $($events -join ', ')" -ForegroundColor Cyan
}

Write-Host ""






