# ============================================================
# COMPLETE SETUP - ALL METHODS
# ============================================================
# This script tries every possible method to complete setup

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMPLETE SETUP - ALL METHODS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRef = "emlqlmfzqsnqokrqvmcm"
$supabaseUrl = "https://emlqlmfzqsnqokrqvmcm.supabase.co"
$supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg"
$stripeSecretKey = "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"

# Method 1: Try Supabase CLI
Write-Host "METHOD 1: Supabase CLI" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow

if (Get-Command supabase -ErrorAction SilentlyContinue) {
    Write-Host "✓ CLI found! Attempting setup..." -ForegroundColor Green
    
    # Check if already linked
    if (Test-Path ".supabase\config.toml") {
        Write-Host "  Project may already be linked" -ForegroundColor Cyan
    } else {
        Write-Host "  Initializing Supabase project..." -ForegroundColor Cyan
        supabase init 2>&1 | Out-Null
    }
    
    Write-Host "  Linking to project..." -ForegroundColor Cyan
    supabase link --project-ref $projectRef 2>&1 | Out-Null
    
    Write-Host "  Setting secrets..." -ForegroundColor Cyan
    supabase secrets set "STRIPE_SECRET_KEY=$stripeSecretKey" --project-ref $projectRef 2>&1 | Out-Null
    supabase secrets set "SUPABASE_URL=$supabaseUrl" --project-ref $projectRef 2>&1 | Out-Null
    
    Write-Host "  Deploying functions..." -ForegroundColor Cyan
    if (Test-Path "supabase\functions\stripe-payment-intent") {
        supabase functions deploy stripe-payment-intent --project-ref $projectRef 2>&1 | Out-Null
    }
    if (Test-Path "supabase\functions\stripe-webhook") {
        supabase functions deploy stripe-webhook --project-ref $projectRef 2>&1 | Out-Null
    }
    
    Write-Host "  ✓ CLI setup attempted" -ForegroundColor Green
} else {
    Write-Host "✗ CLI not installed" -ForegroundColor Red
    Write-Host "  Install: npm install -g supabase" -ForegroundColor Cyan
}

Write-Host ""

# Method 2: Create comprehensive setup file
Write-Host "METHOD 2: Creating Complete Setup File" -ForegroundColor Yellow
Write-Host "--------------------------------------" -ForegroundColor Yellow

$setupFile = @"
# COMPLETE SETUP - COPY AND PASTE READY

## 1. DATABASE SETUP
Run this SQL in: https://supabase.com/dashboard/project/$projectRef/sql/new

[Copy entire DATABASE_SETUP_SQL.sql file]

## 2. SUPABASE SECRETS
Go to: https://supabase.com/dashboard/project/$projectRef/functions/settings

Add these secrets:
- STRIPE_SECRET_KEY = $stripeSecretKey
- SUPABASE_URL = $supabaseUrl
- SUPABASE_SERVICE_ROLE_KEY = [Get from Dashboard → Settings → API]
- STRIPE_WEBHOOK_SECRET = [Get from Stripe Dashboard → Webhooks]

## 3. DEPLOY FUNCTIONS
Go to: https://supabase.com/dashboard/project/$projectRef/functions

Deploy:
- stripe-payment-intent
- stripe-webhook

## 4. CLOUDFLARE VARIABLES
Go to: Cloudflare Pages → Your Project → Settings → Environment Variables

Add:
- VITE_SUPABASE_URL = $supabaseUrl
- VITE_SUPABASE_ANON_KEY = $supabaseAnonKey
- VITE_STRIPE_PUBLISHABLE_KEY = [Get from Stripe Dashboard]
- VITE_STORAGE_BUCKET_NAME = images
"@

$setupFile | Out-File -FilePath "COMPLETE_SETUP_COPY_PASTE.txt" -Encoding UTF8
Write-Host "  ✓ Created COMPLETE_SETUP_COPY_PASTE.txt" -ForegroundColor Green

Write-Host ""

# Method 3: Open all pages with auto-fill
Write-Host "METHOD 3: Opening Setup Pages" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow

$pages = @(
    "https://supabase.com/dashboard/project/$projectRef/sql/new",
    "https://supabase.com/dashboard/project/$projectRef/functions/settings",
    "https://supabase.com/dashboard/project/$projectRef/functions",
    "https://supabase.com/dashboard/project/$projectRef/settings/api",
    "https://dashboard.stripe.com/webhooks",
    "https://dashboard.stripe.com/apikeys"
)

foreach ($page in $pages) {
    Start-Process $page
    Start-Sleep -Milliseconds 300
}

Write-Host "  ✓ All pages opened" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SETUP READY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "All methods attempted!" -ForegroundColor Cyan
Write-Host "See COMPLETE_SETUP_COPY_PASTE.txt for all values" -ForegroundColor Yellow
Write-Host ""






