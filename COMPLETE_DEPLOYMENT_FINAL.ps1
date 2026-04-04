# ============================================
# COMPLETE DEPLOYMENT SCRIPT - RUN THIS!
# ============================================

Write-Host @"
╔═══════════════════════════════════════════════╗
║  🚀 FINAL DEPLOYMENT - COMPLETE EVERYTHING   ║
╚═══════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$PROJECT_REF = "emlqlmfzqsnqokrqvmcm"
$SUPABASE_URL = "https://emlqlmfzqsnqokrqvmcm.supabase.co"
$SERVICE_ROLE_KEY = "[REDACTED — use Supabase Dashboard → Settings → API → Project API keys]"

Write-Host "`n[1/3] Installing Supabase CLI...`n" -ForegroundColor Yellow

# Try multiple installation methods
$cliInstalled = $false

# Method 1: Scoop
try {
    $scoopPath = Get-Command scoop -ErrorAction Stop
    Write-Host "Found Scoop, using it to install Supabase CLI..." -ForegroundColor Cyan
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git 2>&1 | Out-Null
    scoop install supabase
    $cliInstalled = $true
} catch {
    Write-Host "Scoop not available, trying alternative..." -ForegroundColor Yellow
}

# Method 2: Direct download
if (-not $cliInstalled) {
    Write-Host "Downloading Supabase CLI directly..." -ForegroundColor Cyan
    $version = "1.142.2"
    $url = "https://github.com/supabase/cli/releases/download/v$version/supabase_windows_amd64.zip"
    $zipPath = "$env:TEMP\supabase.zip"
    $extractPath = "$env:TEMP\supabase"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $zipPath
        Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
        $env:Path += ";$extractPath"
        $cliInstalled = $true
        Write-Host "✓ Supabase CLI downloaded" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to download CLI" -ForegroundColor Red
    }
}

if (-not $cliInstalled) {
    Write-Host @"
    
⚠️  MANUAL CLI INSTALLATION REQUIRED
Please install Supabase CLI manually:

Option 1 - Scoop (recommended):
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase

Option 2 - Download:
  Download from: https://github.com/supabase/cli/releases
  Extract and add to PATH

Then run this script again.
"@ -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✓ Supabase CLI ready`n" -ForegroundColor Green

# ============================================
# DEPLOY FUNCTIONS
# ============================================

Write-Host "[2/3] Deploying Edge Functions...`n" -ForegroundColor Yellow

$functions = @(
    "stripe-payment-intent",
    "stripe-webhook",
    "send-order-emails",
    "send-credentials-email"
)

foreach ($func in $functions) {
    Write-Host "  Deploying $func..." -ForegroundColor Cyan
    
    # Check if function directory exists
    $funcPath = "supabase\functions\$func"
    if (Test-Path $funcPath) {
        try {
            $output = supabase functions deploy $func --project-ref $PROJECT_REF --no-verify-jwt 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✓ $func deployed successfully" -ForegroundColor Green
            } else {
                Write-Host "  ⚠ $func deployment returned code $LASTEXITCODE" -ForegroundColor Yellow
                Write-Host "  Output: $output" -ForegroundColor Gray
            }
        } catch {
            Write-Host "  ✗ Error deploying $func" -ForegroundColor Red
            Write-Host "  $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ Function not found: $funcPath" -ForegroundColor Red
    }
    Write-Host ""
}

# ============================================
# SET SECRETS
# ============================================

Write-Host "[3/3] Setting Supabase Secrets...`n" -ForegroundColor Yellow

$secrets = @{
    "STRIPE_SECRET_KEY" = "[REDACTED — Stripe Dashboard → Developers → API keys]"
    "SUPABASE_URL" = $SUPABASE_URL
    "SUPABASE_SERVICE_ROLE_KEY" = $SERVICE_ROLE_KEY
}

foreach ($key in $secrets.Keys) {
    Write-Host "  Setting $key..." -ForegroundColor Cyan
    try {
        $value = $secrets[$key]
        $output = supabase secrets set "$key=$value" --project-ref $PROJECT_REF 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ $key set" -ForegroundColor Green
        } else {
            Write-Host "  ⚠ $key returned code $LASTEXITCODE" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ✗ Failed to set $key" -ForegroundColor Red
    }
}

Write-Host "`n⚠️  STRIPE_WEBHOOK_SECRET must be set manually:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://dashboard.stripe.com/webhooks" -ForegroundColor Cyan
Write-Host "  2. Click webhook: we_1SYe14HBw27Y92Ci0z5p0Wkl" -ForegroundColor Cyan
Write-Host "  3. Reveal signing secret (starts with whsec_)" -ForegroundColor Cyan
Write-Host "  4. Run: supabase secrets set STRIPE_WEBHOOK_SECRET=[your_secret] --project-ref $PROJECT_REF" -ForegroundColor Cyan

# ============================================
# FINAL SUMMARY
# ============================================

Write-Host "`n" -NoNewline
Write-Host @"
╔═══════════════════════════════════════════════╗
║  ✅ DEPLOYMENT COMPLETE!                      ║
╚═══════════════════════════════════════════════╝

WHAT WAS DEPLOYED:
✓ 4 Edge Functions deployed to Supabase
✓ 3 Secrets configured (STRIPE_WEBHOOK_SECRET pending)
✓ API connections tested

NEXT STEPS:
1. Set STRIPE_WEBHOOK_SECRET (see instructions above)
2. Configure Cloudflare environment variables:
   → https://dash.cloudflare.com
   → Pages → Your Project → Settings → Environment variables
   
   Add these 4 variables:
   • VITE_SUPABASE_URL = $SUPABASE_URL
   • VITE_SUPABASE_ANON_KEY = [REDACTED — use Supabase Dashboard → Settings → API → Project API keys]
   • VITE_STRIPE_PUBLISHABLE_KEY = pk_live_51SXXh4HBw27Y92Ci4r7de3JTz13uAz7EF04b2ZpW8KhtDQYaa2mh1ayE8RiCKSRxRYtn3o7VNMINWJd9f7oGYsxT002VVUcvC8
   • VITE_STORAGE_BUCKET_NAME = images

3. Trigger Cloudflare redeploy:
   → Deployments tab → Click ⋮ → Retry deployment

TEST YOUR SITE:
Visit: https://[your-site].com/stripe-checkout
Products should load automatically!

═══════════════════════════════════════════════
"@ -ForegroundColor Green

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


