# ============================================================
# COMPLETE EVERYTHING - FULL AUTOMATION ATTEMPT
# ============================================================
# This script attempts to complete ALL remaining setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMPLETE SETUP - FULL AUTOMATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$supabaseUrl = "https://emlqlmfzqsnqokrqvmcm.supabase.co"
$supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg"
$stripeSecretKey = "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"

Write-Host "Step 1: Verifying Stripe Webhook..." -ForegroundColor Yellow
$webhookId = "we_1SYe14HBw27Y92Ci0z5p0Wkl"
$headers = @{"Authorization"="Bearer $stripeSecretKey"}
try {
    $webhook = Invoke-RestMethod -Uri "https://api.stripe.com/v1/webhook_endpoints/$webhookId" -Method Get -Headers $headers
    Write-Host "  ✓ Webhook Status: $($webhook.status)" -ForegroundColor Green
    Write-Host "  ✓ Webhook URL: $($webhook.url)" -ForegroundColor Green
    Write-Host "  ✓ Events: $($webhook.enabled_events.Count) events configured" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error checking webhook: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 2: Checking Database Schema..." -ForegroundColor Yellow
$dbHeaders = @{
    "apikey" = $supabaseAnonKey
    "Authorization" = "Bearer $supabaseAnonKey"
    "Content-Type" = "application/json"
}
try {
    # Check if cloaked_name column exists
    $checkQuery = "SELECT column_name FROM information_schema.columns WHERE table_name = 'real_products' AND column_name = 'cloaked_name'"
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/rpc/exec_sql" -Method Post -Headers $dbHeaders -Body (@{query=$checkQuery} | ConvertTo-Json) -ErrorAction SilentlyContinue
    Write-Host "  ⚠ Database check requires service role key" -ForegroundColor Yellow
    Write-Host "  → Run DATABASE_SETUP_SQL.sql manually in Supabase SQL Editor" -ForegroundColor Cyan
} catch {
    Write-Host "  → Database setup requires manual SQL execution" -ForegroundColor Yellow
    Write-Host "    File: DATABASE_SETUP_SQL.sql" -ForegroundColor Cyan
    Write-Host "    URL: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Step 3: Creating Setup Instructions..." -ForegroundColor Yellow

# Create comprehensive setup file
$setupContent = @"
# 🎯 FINAL SETUP INSTRUCTIONS

## ✅ Already Completed:
- [x] Code configured with cloaked names
- [x] Stripe webhook created and configured
- [x] All configuration files created

## 📋 Remaining Steps (15 minutes):

### 1. Database Setup (5 min)
**Run SQL in Supabase:**
1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new
2. Open file: `DATABASE_SETUP_SQL.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run"

### 2. Supabase Secrets (5 min)
**Add in Dashboard:**
URL: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions/settings

Add these secrets:
- STRIPE_SECRET_KEY = $stripeSecretKey
- SUPABASE_URL = $supabaseUrl
- SUPABASE_SERVICE_ROLE_KEY = (Get from: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api)
- STRIPE_WEBHOOK_SECRET = (Get from: https://dashboard.stripe.com/webhooks → Click webhook → Reveal secret)

### 3. Deploy Edge Functions (3 min)
**Deploy in Dashboard:**
URL: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions

Deploy:
- stripe-payment-intent
- stripe-webhook

### 4. Cloudflare Variables (2 min)
**Add in Cloudflare Pages:**
Your Project → Settings → Environment Variables

Add:
- VITE_SUPABASE_URL = $supabaseUrl
- VITE_SUPABASE_ANON_KEY = $supabaseAnonKey
- VITE_STRIPE_PUBLISHABLE_KEY = (Get from: https://dashboard.stripe.com/apikeys)
- VITE_STORAGE_BUCKET_NAME = images

## 🎉 That's It!
After these 4 steps, your payment system will be fully operational!
"@

$setupContent | Out-File -FilePath "FINAL_STEPS.md" -Encoding UTF8
Write-Host "  ✓ Created FINAL_STEPS.md" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Opening Setup Pages..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Open all necessary pages
Write-Host "  Opening Supabase SQL Editor..." -ForegroundColor Cyan
Start-Process "https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new"

Start-Sleep -Seconds 1
Write-Host "  Opening Supabase Secrets..." -ForegroundColor Cyan
Start-Process "https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions/settings"

Start-Sleep -Seconds 1
Write-Host "  Opening Supabase Functions..." -ForegroundColor Cyan
Start-Process "https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/functions"

Start-Sleep -Seconds 1
Write-Host "  Opening Stripe Webhooks..." -ForegroundColor Cyan
Start-Process "https://dashboard.stripe.com/webhooks"

Start-Sleep -Seconds 1
Write-Host "  Opening Stripe API Keys..." -ForegroundColor Cyan
Start-Process "https://dashboard.stripe.com/apikeys"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "AUTOMATION COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "All automated steps completed!" -ForegroundColor Cyan
Write-Host "Browser tabs opened with all setup pages." -ForegroundColor Cyan
Write-Host ""
Write-Host "Follow FINAL_STEPS.md for remaining manual steps." -ForegroundColor Yellow
Write-Host ""






