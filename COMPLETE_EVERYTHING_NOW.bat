@echo off
REM ============================================================
REM COMPLETE SETUP - ALL METHODS ATTEMPTED
REM ============================================================

echo ========================================
echo COMPLETE SUPABASE SETUP
echo ========================================
echo.

set PROJECT_REF=emlqlmfzqsnqokrqvmcm
set SUPABASE_URL=https://emlqlmfzqsnqokrqvmcm.supabase.co
set STRIPE_KEY=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

echo Step 1: Opening all setup pages...
start https://supabase.com/dashboard/project/%PROJECT_REF%/sql/new
timeout /t 1 /nobreak >nul
start https://supabase.com/dashboard/project/%PROJECT_REF%/functions/settings
timeout /t 1 /nobreak >nul
start https://supabase.com/dashboard/project/%PROJECT_REF%/functions
timeout /t 1 /nobreak >nul
start https://supabase.com/dashboard/project/%PROJECT_REF%/settings/api
timeout /t 1 /nobreak >nul
start https://dashboard.stripe.com/webhooks
timeout /t 1 /nobreak >nul
start https://dashboard.stripe.com/apikeys
echo   [OK] All pages opened
echo.

echo Step 2: Attempting CLI setup (if available)...
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] npx found
    echo   Attempting login (browser will open)...
    npx supabase login
    echo   Linking project...
    npx supabase link --project-ref %PROJECT_REF%
    echo   Setting secrets...
    npx supabase secrets set "STRIPE_SECRET_KEY=%STRIPE_KEY%" --project-ref %PROJECT_REF%
    npx supabase secrets set "SUPABASE_URL=%SUPABASE_URL%" --project-ref %PROJECT_REF%
    echo   Deploying functions...
    npx supabase functions deploy stripe-payment-intent --project-ref %PROJECT_REF%
    npx supabase functions deploy stripe-webhook --project-ref %PROJECT_REF%
    echo   [OK] CLI setup attempted
) else (
    echo   [SKIP] npx not found - use manual setup
)
echo.

echo Step 3: Opening setup files...
start AUTO_FILL_VALUES.txt
start DATABASE_SETUP_SQL.sql
start FINAL_COMPLETE_SOLUTION.md
echo   [OK] Files opened
echo.

echo ========================================
echo SETUP INITIATED!
echo ========================================
echo.
echo All pages and files are open.
echo Follow the instructions in the browser tabs.
echo.
echo Quick checklist:
echo   1. Run DATABASE_SETUP_SQL.sql in SQL Editor tab
echo   2. Add secrets in Functions Settings tab
echo   3. Deploy functions in Functions tab
echo   4. Set Cloudflare variables
echo.
pause






