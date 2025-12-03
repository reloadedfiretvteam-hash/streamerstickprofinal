# ============================================================
# SUPABASE CLI SETUP AND COMPLETE CONFIGURATION
# ============================================================

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUPABASE CLI COMPLETE SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRef = "emlqlmfzqsnqokrqvmcm"
$supabaseUrl = "https://emlqlmfzqsnqokrqvmcm.supabase.co"
$stripeSecretKey = "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"

# Check if CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "Supabase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
    
    # Try npm
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "Installing via npm..." -ForegroundColor Cyan
        npm install -g supabase
    }
    # Try scoop
    elseif (Get-Command scoop -ErrorAction SilentlyContinue) {
        Write-Host "Installing via scoop..." -ForegroundColor Cyan
        scoop install supabase
    }
    else {
        Write-Host ""
        Write-Host "Please install Supabase CLI manually:" -ForegroundColor Yellow
        Write-Host "  1. npm install -g supabase" -ForegroundColor Cyan
        Write-Host "  2. Or download from: https://github.com/supabase/cli/releases" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Then run this script again." -ForegroundColor Yellow
        exit 1
    }
    
    # Verify installation
    if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
        Write-Host ""
        Write-Host "Installation may have failed. Please install manually and try again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Supabase CLI found!" -ForegroundColor Green
$version = supabase --version
Write-Host "  Version: $version" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login
Write-Host "STEP 1: Logging in to Supabase..." -ForegroundColor Yellow
Write-Host "(This will open a browser for authentication)" -ForegroundColor Cyan
Write-Host ""

try {
    supabase login
    Write-Host "✓ Login successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Login may require manual authentication" -ForegroundColor Yellow
    Write-Host "Please complete login in the browser that opened" -ForegroundColor Cyan
    $continue = Read-Host "Press Enter after logging in"
}

Write-Host ""

# Step 2: Link project
Write-Host "STEP 2: Linking to project..." -ForegroundColor Yellow
Write-Host "Project Reference: $projectRef" -ForegroundColor Cyan
Write-Host ""

try {
    supabase link --project-ref $projectRef
    Write-Host "✓ Project linked!" -ForegroundColor Green
} catch {
    Write-Host "⚠ Link command failed, trying alternative..." -ForegroundColor Yellow
    # Alternative: Initialize and link
    if (-not (Test-Path ".supabase")) {
        supabase init
    }
    supabase link --project-ref $projectRef
}

Write-Host ""

# Step 3: Set secrets
Write-Host "STEP 3: Setting Edge Function secrets..." -ForegroundColor Yellow
Write-Host ""

$secrets = @{
    "STRIPE_SECRET_KEY" = $stripeSecretKey
    "SUPABASE_URL" = $supabaseUrl
}

foreach ($key in $secrets.Keys) {
    $value = $secrets[$key]
    Write-Host "Setting $key..." -ForegroundColor Cyan
    try {
        supabase secrets set "$key=$value" --project-ref $projectRef
        Write-Host "  ✓ $key set" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to set $key" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "⚠ IMPORTANT: Set these secrets manually:" -ForegroundColor Yellow
Write-Host "  SUPABASE_SERVICE_ROLE_KEY - Get from Dashboard" -ForegroundColor Cyan
Write-Host "  STRIPE_WEBHOOK_SECRET - Get from Stripe Dashboard" -ForegroundColor Cyan
Write-Host ""

# Step 4: Deploy functions
Write-Host "STEP 4: Deploying Edge Functions..." -ForegroundColor Yellow
Write-Host ""

$functions = @("stripe-payment-intent", "stripe-webhook")

foreach ($function in $functions) {
    $functionPath = "supabase\functions\$function"
    
    if (Test-Path $functionPath) {
        Write-Host "Deploying $function..." -ForegroundColor Cyan
        try {
            supabase functions deploy $function --project-ref $projectRef
            Write-Host "  ✓ $function deployed" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Failed to deploy $function" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ✗ Function not found: $functionPath" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "CLI SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Remaining steps:" -ForegroundColor Yellow
Write-Host "  1. Set SUPABASE_SERVICE_ROLE_KEY secret" -ForegroundColor Cyan
Write-Host "  2. Set STRIPE_WEBHOOK_SECRET secret" -ForegroundColor Cyan
Write-Host "  3. Run DATABASE_SETUP_SQL.sql in SQL Editor" -ForegroundColor Cyan
Write-Host "  4. Set Cloudflare environment variables" -ForegroundColor Cyan
Write-Host ""






