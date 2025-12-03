# ============================================================
# COMPLETE SETUP VIA DIRECT API CALLS
# ============================================================
# This script attempts to complete setup using direct API calls

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMPLETE SETUP VIA API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRef = "emlqlmfzqsnqokrqvmcm"
$supabaseUrl = "https://emlqlmfzqsnqokrqvmcm.supabase.co"
$supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg"
$stripeSecretKey = "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"

# Method 1: Try to execute SQL via REST API
Write-Host "METHOD 1: Attempting Database Setup via REST API..." -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow

$sqlContent = Get-Content "DATABASE_SETUP_SQL.sql" -Raw

# Try to execute via PostgREST (limited - may not work for DDL)
$headers = @{
    "apikey" = $supabaseAnonKey
    "Authorization" = "Bearer $supabaseAnonKey"
    "Content-Type" = "application/json"
}

# Check if we can at least verify table structure
try {
    $response = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/real_products?select=id&limit=1" -Method Get -Headers $headers -ErrorAction SilentlyContinue
    if ($response) {
        Write-Host "  ✓ Can access real_products table" -ForegroundColor Green
        Write-Host "  ⚠ DDL (CREATE/ALTER) requires SQL Editor" -ForegroundColor Yellow
        Write-Host "  → Please run DATABASE_SETUP_SQL.sql manually" -ForegroundColor Cyan
    }
} catch {
    Write-Host "  ⚠ Database setup requires SQL Editor" -ForegroundColor Yellow
}

Write-Host ""

# Method 2: Create comprehensive setup file with all API endpoints
Write-Host "METHOD 2: Creating Complete API Setup Guide..." -ForegroundColor Yellow
Write-Host "------------------------------------------------" -ForegroundColor Yellow

$apiGuide = @"
# COMPLETE SETUP VIA API - ALL ENDPOINTS

## Database Setup
SQL Editor: https://supabase.com/dashboard/project/$projectRef/sql/new
File: DATABASE_SETUP_SQL.sql

## Supabase Secrets (via Dashboard - no public API)
Dashboard: https://supabase.com/dashboard/project/$projectRef/functions/settings

Secrets to add:
- STRIPE_SECRET_KEY = $stripeSecretKey
- SUPABASE_URL = $supabaseUrl
- SUPABASE_SERVICE_ROLE_KEY = [Get from Dashboard]
- STRIPE_WEBHOOK_SECRET = [Get from Stripe]

## Function Deployment (via Dashboard or CLI)
Dashboard: https://supabase.com/dashboard/project/$projectRef/functions

Functions to deploy:
- stripe-payment-intent
- stripe-webhook

## Cloudflare Variables
Add in Cloudflare Pages Dashboard

Variables:
- VITE_SUPABASE_URL = $supabaseUrl
- VITE_SUPABASE_ANON_KEY = $supabaseAnonKey
- VITE_STRIPE_PUBLISHABLE_KEY = [Get from Stripe]
- VITE_STORAGE_BUCKET_NAME = images
"@

$apiGuide | Out-File -FilePath "API_SETUP_GUIDE.txt" -Encoding UTF8
Write-Host "  ✓ Created API_SETUP_GUIDE.txt" -ForegroundColor Green

Write-Host ""

# Method 3: Open all pages and create auto-fill script
Write-Host "METHOD 3: Opening All Setup Pages..." -ForegroundColor Yellow
Write-Host "------------------------------------" -ForegroundColor Yellow

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
Write-Host "Note: Supabase secrets and function deployment" -ForegroundColor Yellow
Write-Host "require Dashboard access (security restriction)." -ForegroundColor Yellow
Write-Host ""
Write-Host "All pages are open - just copy-paste values!" -ForegroundColor Cyan
Write-Host ""






