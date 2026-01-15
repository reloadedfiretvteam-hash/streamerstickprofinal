Write-Host "DEPLOYING TO SUPABASE..." -ForegroundColor Cyan
Write-Host ""

$PROJECT_REF = "emlqlmfzqsnqokrqvmcm"
$STRIPE_SECRET = "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"
$SUPABASE_URL = "https://emlqlmfzqsnqokrqvmcm.supabase.co"
# ⚠️ SECURITY: Service key should come from environment variable, not hardcoded!
# Get from: Supabase Dashboard → Settings → API → service_role key
$SERVICE_ROLE = $env:SUPABASE_SERVICE_KEY
if (-not $SERVICE_ROLE) {
    Write-Host "❌ ERROR: SUPABASE_SERVICE_KEY environment variable not set!" -ForegroundColor Red
    Write-Host "   Get your service key from: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api" -ForegroundColor Yellow
    exit 1
}

Write-Host "PROJECT: $PROJECT_REF" -ForegroundColor Yellow
Write-Host ""

# Deploy functions
Write-Host "Deploying functions..." -ForegroundColor Yellow
supabase functions deploy stripe-payment-intent --project-ref $PROJECT_REF
supabase functions deploy stripe-webhook --project-ref $PROJECT_REF
supabase functions deploy send-order-emails --project-ref $PROJECT_REF
supabase functions deploy send-credentials-email --project-ref $PROJECT_REF

# Set secrets
Write-Host ""
Write-Host "Setting secrets..." -ForegroundColor Yellow
supabase secrets set "STRIPE_SECRET_KEY=$STRIPE_SECRET" --project-ref $PROJECT_REF
supabase secrets set "SUPABASE_URL=$SUPABASE_URL" --project-ref $PROJECT_REF
supabase secrets set "SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE" --project-ref $PROJECT_REF

Write-Host ""
Write-Host "DONE! Now set STRIPE_WEBHOOK_SECRET manually" -ForegroundColor Green
Write-Host "Get it from: https://dashboard.stripe.com/webhooks" -ForegroundColor Cyan


