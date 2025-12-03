# ============================================================
# COMPLETE STRIPE PAYMENT SETUP SCRIPT
# ============================================================
# This script automates the complete setup process

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMPLETE STRIPE PAYMENT SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot
Set-Location $projectRoot

Write-Host "Step 1: Database Setup" -ForegroundColor Yellow
Write-Host "----------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please run the SQL script in Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "  File: DATABASE_SETUP_SQL.sql" -ForegroundColor Cyan
Write-Host "  URL: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new" -ForegroundColor Cyan
Write-Host ""
$continue = Read-Host "Have you run the SQL script? (y/n)"
if ($continue -ne "y") {
    Write-Host ""
    Write-Host "Please run DATABASE_SETUP_SQL.sql first, then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 2: Supabase Edge Functions Secrets" -ForegroundColor Yellow
Write-Host "------------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "Setting up Edge Functions secrets..." -ForegroundColor Yellow
& "$projectRoot\setup-supabase-secrets.ps1"

Write-Host ""
Write-Host "Step 3: Deploy Edge Functions" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "Deploying Edge Functions..." -ForegroundColor Yellow
& "$projectRoot\deploy-edge-functions.ps1"

Write-Host ""
Write-Host "Step 4: Cloudflare Environment Variables" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Set these in Cloudflare Pages Dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Go to: Cloudflare Pages → Your Project → Settings → Environment Variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "Add these variables (see .env.example for values):" -ForegroundColor Yellow
Write-Host "  - VITE_SUPABASE_URL" -ForegroundColor Cyan
Write-Host "  - VITE_SUPABASE_ANON_KEY" -ForegroundColor Cyan
Write-Host "  - VITE_STRIPE_PUBLISHABLE_KEY" -ForegroundColor Cyan
Write-Host "  - VITE_STORAGE_BUCKET_NAME" -ForegroundColor Cyan
Write-Host ""
$continue = Read-Host "Have you set Cloudflare variables? (y/n)"
if ($continue -ne "y") {
    Write-Host ""
    Write-Host "Please set Cloudflare variables, then continue with webhook setup." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 5: Stripe Webhook Setup" -ForegroundColor Yellow
Write-Host "-----------------------------" -ForegroundColor Yellow
Write-Host ""
Write-Host "Create webhook in Stripe Dashboard:" -ForegroundColor Yellow
Write-Host "  URL: https://dashboard.stripe.com/webhooks" -ForegroundColor Cyan
Write-Host "  Endpoint: https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook" -ForegroundColor Cyan
Write-Host "  Events: payment_intent.succeeded, payment_intent.payment_failed, etc." -ForegroundColor Cyan
Write-Host ""
Write-Host "After creating webhook, copy the signing secret and add to Supabase:" -ForegroundColor Yellow
Write-Host "  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref emlqlmfzqsnqokrqvmcm" -ForegroundColor Cyan
Write-Host ""
$continue = Read-Host "Have you created the Stripe webhook? (y/n)"
if ($continue -ne "y") {
    Write-Host ""
    Write-Host "Please create the Stripe webhook, then you're done!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test payment with card: 4242 4242 4242 4242" -ForegroundColor Cyan
Write-Host "  2. Verify order in database" -ForegroundColor Cyan
Write-Host "  3. Check Stripe Dashboard for payment" -ForegroundColor Cyan
Write-Host "  4. Verify webhook events in Supabase logs" -ForegroundColor Cyan
Write-Host ""






