# 🚀 INSTALL SUPABASE CLI AND COMPLETE SETUP

## Quick Install Options

### Option 1: Using npx (Recommended - No Installation)
```powershell
# Just use npx - no installation needed!
npx supabase --version
npx supabase login
npx supabase link --project-ref emlqlmfzqsnqokrqvmcm
npx supabase secrets set "STRIPE_SECRET_KEY=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" --project-ref emlqlmfzqsnqokrqvmcm
npx supabase secrets set "SUPABASE_URL=https://emlqlmfzqsnqokrqvmcm.supabase.co" --project-ref emlqlmfzqsnqokrqvmcm
npx supabase functions deploy stripe-payment-intent --project-ref emlqlmfzqsnqokrqvmcm
npx supabase functions deploy stripe-webhook --project-ref emlqlmfzqsnqokrqvmcm
```

### Option 2: Install via npm (if execution policy allows)
```powershell
# First, allow script execution (run as Administrator):
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then install:
npm install -g supabase

# Verify:
supabase --version
```

### Option 3: Install via Scoop (Windows)
```powershell
# Install scoop first if needed:
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Then install Supabase:
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Verify:
supabase --version
```

### Option 4: Manual Download
1. Go to: https://github.com/supabase/cli/releases
2. Download latest Windows binary
3. Extract and add to PATH
4. Verify: `supabase --version`

---

## Complete Setup After CLI Installation

Once CLI is installed, run these commands:

```powershell
# 1. Login (opens browser)
supabase login

# 2. Link project
supabase link --project-ref emlqlmfzqsnqokrqvmcm

# 3. Set secrets
supabase secrets set "STRIPE_SECRET_KEY=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" --project-ref emlqlmfzqsnqokrqvmcm
supabase secrets set "SUPABASE_URL=https://emlqlmfzqsnqokrqvmcm.supabase.co" --project-ref emlqlmfzqsnqokrqvmcm

# 4. Deploy functions
supabase functions deploy stripe-payment-intent --project-ref emlqlmfzqsnqokrqvmcm
supabase functions deploy stripe-webhook --project-ref emlqlmfzqsnqokrqvmcm
```

---

## Alternative: Use npx (No Installation!)

If you have Node.js installed, you can use `npx` without installing:

```powershell
# Login
npx supabase login

# Link
npx supabase link --project-ref emlqlmfzqsnqokrqvmcm

# Set secrets
npx supabase secrets set "STRIPE_SECRET_KEY=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" --project-ref emlqlmfzqsnqokrqvmcm
npx supabase secrets set "SUPABASE_URL=https://emlqlmfzqsnqokrqvmcm.supabase.co" --project-ref emlqlmfzqsnqokrqvmcm

# Deploy
npx supabase functions deploy stripe-payment-intent --project-ref emlqlmfzqsnqokrqvmcm
npx supabase functions deploy stripe-webhook --project-ref emlqlmfzqsnqokrqvmcm
```

---

## Quick Start Script

I've created `setup-with-cli.ps1` that does all of this automatically once CLI is installed!

Just run:
```powershell
.\setup-with-cli.ps1
```

---

**Status:** Ready to install and configure! 🚀






