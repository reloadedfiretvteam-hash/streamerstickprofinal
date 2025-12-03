@echo off
REM ============================================================
REM COMPLETE SUPABASE SETUP - BATCH FILE
REM ============================================================

echo ========================================
echo COMPLETE SUPABASE SETUP
echo ========================================
echo.

set PROJECT_REF=emlqlmfzqsnqokrqvmcm
set SUPABASE_URL=https://emlqlmfzqsnqokrqvmcm.supabase.co
set STRIPE_SECRET_KEY=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

echo Step 1: Checking for npx...
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] npx found!
    echo.
    echo Step 2: Login to Supabase (will open browser)...
    npx supabase login
    echo.
    echo Step 3: Linking project...
    npx supabase link --project-ref %PROJECT_REF%
    echo.
    echo Step 4: Setting secrets...
    npx supabase secrets set "STRIPE_SECRET_KEY=%STRIPE_SECRET_KEY%" --project-ref %PROJECT_REF%
    npx supabase secrets set "SUPABASE_URL=%SUPABASE_URL%" --project-ref %PROJECT_REF%
    echo.
    echo Step 5: Deploying functions...
    npx supabase functions deploy stripe-payment-intent --project-ref %PROJECT_REF%
    npx supabase functions deploy stripe-webhook --project-ref %PROJECT_REF%
    echo.
    echo ========================================
    echo SETUP COMPLETE!
    echo ========================================
) else (
    echo   [ERROR] npx not found!
    echo.
    echo Please install Node.js from https://nodejs.org
    echo Then run this script again.
    echo.
    pause
)

echo.
echo Remaining manual steps:
echo   1. Set SUPABASE_SERVICE_ROLE_KEY secret
echo   2. Set STRIPE_WEBHOOK_SECRET secret  
echo   3. Run DATABASE_SETUP_SQL.sql
echo   4. Set Cloudflare variables
echo.
pause






