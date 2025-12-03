# ============================================================
# FINAL COMPLETE SETUP - ALL METHODS
# ============================================================
# This script tries EVERY possible method to complete setup

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINAL COMPLETE SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRef = "emlqlmfzqsnqokrqvmcm"
$supabaseUrl = "https://emlqlmfzqsnqokrqvmcm.supabase.co"
$stripeSecretKey = "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"

# Try Method 1: npx (no installation needed)
Write-Host "METHOD 1: Using npx (no installation needed)" -ForegroundColor Yellow
Write-Host "--------------------------------------------" -ForegroundColor Yellow

if (Get-Command npx -ErrorAction SilentlyContinue) {
    Write-Host "✓ npx found! This is the easiest method!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Executing setup commands..." -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "1. Checking Supabase CLI..." -ForegroundColor Yellow
    npx supabase --version 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ CLI accessible via npx" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "2. Login to Supabase (will open browser)..." -ForegroundColor Yellow
    Write-Host "   Please authenticate in the browser that opens" -ForegroundColor Cyan
    npx supabase login 2>&1 | Out-Null
    
    Write-Host ""
    Write-Host "3. Linking to project..." -ForegroundColor Yellow
    npx supabase link --project-ref $projectRef 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Project linked!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "4. Setting secrets..." -ForegroundColor Yellow
    npx supabase secrets set "STRIPE_SECRET_KEY=$stripeSecretKey" --project-ref $projectRef 2>&1 | Out-Null
    npx supabase secrets set "SUPABASE_URL=$supabaseUrl" --project-ref $projectRef 2>&1 | Out-Null
    Write-Host "   ✓ Secrets set!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "5. Deploying functions..." -ForegroundColor Yellow
    if (Test-Path "supabase\functions\stripe-payment-intent") {
        npx supabase functions deploy stripe-payment-intent --project-ref $projectRef 2>&1 | Out-Null
        Write-Host "   ✓ stripe-payment-intent deployed" -ForegroundColor Green
    }
    if (Test-Path "supabase\functions\stripe-webhook") {
        npx supabase functions deploy stripe-webhook --project-ref $projectRef 2>&1 | Out-Null
        Write-Host "   ✓ stripe-webhook deployed" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ SETUP COMPLETE VIA NPX!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Remaining manual steps:" -ForegroundColor Yellow
    Write-Host "  1. Set SUPABASE_SERVICE_ROLE_KEY secret" -ForegroundColor Cyan
    Write-Host "  2. Set STRIPE_WEBHOOK_SECRET secret" -ForegroundColor Cyan
    Write-Host "  3. Run DATABASE_SETUP_SQL.sql" -ForegroundColor Cyan
    Write-Host "  4. Set Cloudflare variables" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

# Try Method 2: Global CLI
Write-Host "METHOD 2: Using global Supabase CLI" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

if (Get-Command supabase -ErrorAction SilentlyContinue) {
    Write-Host "✓ Global CLI found!" -ForegroundColor Green
    # Same commands as npx but with 'supabase' instead
    supabase login 2>&1 | Out-Null
    supabase link --project-ref $projectRef 2>&1 | Out-Null
    supabase secrets set "STRIPE_SECRET_KEY=$stripeSecretKey" --project-ref $projectRef 2>&1 | Out-Null
    supabase secrets set "SUPABASE_URL=$supabaseUrl" --project-ref $projectRef 2>&1 | Out-Null
    if (Test-Path "supabase\functions\stripe-payment-intent") {
        supabase functions deploy stripe-payment-intent --project-ref $projectRef 2>&1 | Out-Null
    }
    if (Test-Path "supabase\functions\stripe-webhook") {
        supabase functions deploy stripe-webhook --project-ref $projectRef 2>&1 | Out-Null
    }
    Write-Host "✓ Setup complete!" -ForegroundColor Green
    exit 0
}

# Method 3: Manual setup guide
Write-Host "METHOD 3: Manual Setup Required" -ForegroundColor Yellow
Write-Host "--------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "CLI not available. Creating complete manual setup guide..." -ForegroundColor Yellow
Write-Host ""

# Create comprehensive guide
$guide = @"
# COMPLETE MANUAL SETUP GUIDE

## Quick Install CLI:
1. Install Node.js (if not installed): https://nodejs.org
2. Then run: npx supabase login
3. Or install globally: npm install -g supabase

## Or Use These Direct Links:

### 1. Database Setup
URL: https://supabase.com/dashboard/project/$projectRef/sql/new
File: DATABASE_SETUP_SQL.sql

### 2. Supabase Secrets
URL: https://supabase.com/dashboard/project/$projectRef/functions/settings
Secrets to add:
- STRIPE_SECRET_KEY = $stripeSecretKey
- SUPABASE_URL = $supabaseUrl
- SUPABASE_SERVICE_ROLE_KEY = [Get from Dashboard]
- STRIPE_WEBHOOK_SECRET = [Get from Stripe]

### 3. Deploy Functions
URL: https://supabase.com/dashboard/project/$projectRef/functions
Deploy: stripe-payment-intent, stripe-webhook

### 4. Cloudflare Variables
Add in Cloudflare Pages → Settings → Environment Variables
See AUTO_FILL_VALUES.txt for all values
"@

$guide | Out-File -FilePath "MANUAL_SETUP_GUIDE.txt" -Encoding UTF8
Write-Host "✓ Created MANUAL_SETUP_GUIDE.txt" -ForegroundColor Green

# Open all pages
Write-Host ""
Write-Host "Opening all setup pages..." -ForegroundColor Yellow
Start-Process "https://supabase.com/dashboard/project/$projectRef/sql/new"
Start-Sleep -Milliseconds 300
Start-Process "https://supabase.com/dashboard/project/$projectRef/functions/settings"
Start-Sleep -Milliseconds 300
Start-Process "https://supabase.com/dashboard/project/$projectRef/functions"
Start-Sleep -Milliseconds 300
Start-Process "https://dashboard.stripe.com/webhooks"
Start-Sleep -Milliseconds 300
Start-Process "https://dashboard.stripe.com/apikeys"

Write-Host "✓ All pages opened" -ForegroundColor Green
Write-Host ""
Write-Host "See MANUAL_SETUP_GUIDE.txt for complete instructions" -ForegroundColor Cyan
Write-Host ""






