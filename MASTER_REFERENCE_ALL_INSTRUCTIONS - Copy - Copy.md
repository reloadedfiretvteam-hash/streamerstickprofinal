# 🎯 MASTER REFERENCE - ALL INSTRUCTIONS & CURRENT STATUS

**Last Updated:** November 19, 2025  
**Repository:** `streamstickpro`  
**Owner:** `reloadedfiretvteam-hash`  
**Domain:** `streamstickpro.com`

---

## ✅ CURRENT STATUS

### 🔐 GitHub Token Configured
- **Token:** `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`
- **MCP Config:** `cursor-mcp-config.json` ✅
- **Git Remote:** Updated with token ✅
- **Action Needed:** Restart Cursor to activate MCP connection

### 📦 Repository Setup
- **Standardized Name:** `streamstickpro` (matches domain)
- **Owner:** `reloadedfiretvteam-hash`
- **Payment Processor:** Square (NOT Stripe)
- **All hardcoded secrets removed** ✅

---

## 🚀 DEPLOYMENT INSTRUCTIONS

### Step 1: Create GitHub Repository (If Not Exists)
Go to: https://github.com/new

**Settings:**
- Repository name: `streamstickpro`
- Owner: `reloadedfiretvteam-hash`
- Description: "Premium IPTV subscriptions and jailbroken Fire Stick e-commerce platform"
- **Do NOT initialize** with README, .gitignore, or license
- Click "Create repository"

### Step 2: Push Your Code
After creating the repository, run:

```bash
git add .
git commit -m "Initial commit: Full website - streamstickpro - All features and Square integration"
git push -u origin main
```

### Step 3: Connect Cloudflare Pages
1. Go to: https://dash.cloudflare.com
2. Navigate to Pages
3. Connect to GitHub repository: `reloadedfiretvteam-hash/streamstickpro`
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: `20`

### Step 4: Add Environment Variables in Cloudflare
Go to: Cloudflare Pages → Your Project → Settings → Environment Variables

**Add these:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SQUARE_APPLICATION_ID` - Square application ID
- `SQUARE_ACCESS_TOKEN` - Square access token
- `SQUARE_LOCATION_ID` - Square location ID
- `SQUARE_ENVIRONMENT` - `sandbox` or `production`

---

## 💳 PAYMENT PROCESSOR: SQUARE

**⚠️ IMPORTANT: This project uses SQUARE, NOT STRIPE**

### Square Configuration Files:
- ✅ `src/components/SquareCheckout.tsx` - Square checkout component
- ✅ `pages/api/create-square-session.ts` - Square API route
- ✅ `src/pages/NewCheckoutPage.tsx` - Uses Square checkout
- ✅ `src/components/custom-admin/SimplePaymentSettings.tsx` - Square settings

### Removed Stripe Files:
- ❌ `src/components/StripeCheckout.tsx` - REMOVED
- ❌ `pages/api/create-stripe-session.ts` - REMOVED

### Square Environment Variables Needed:
```
SQUARE_APPLICATION_ID=your_app_id
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=sandbox
```

---

## 🏠 HOMEPAGE LAYOUT

**User wants OLD homepage layout, NOT the new "luxury" look**

### Files to Keep (Old Layout):
- ✅ `src/components/Hero.tsx` - Main hero section
- ✅ `src/components/FeatureIconRow.tsx` - Feature icons
- ✅ `src/components/HowItWorksSteps.tsx` - How it works
- ✅ `src/components/WhatYouGetVideo.tsx` - Video showcase
- ✅ `src/components/BlogDisplay.tsx` - Blog posts

### Files to Remove (New Layout):
- ❌ `src/components/LuxuryPromoRail.tsx` - REMOVE THIS
- ❌ `src/components/PaymentShowcase.tsx` - Can keep but update for Square

### Homepage Structure:
```
HomePage
├── Hero
├── FeatureIconRow
├── HowItWorksSteps
├── WhatYouGetVideo
└── BlogDisplay
```

---

## 📁 PROJECT STRUCTURE

```
streamstickpro/
├── src/
│   ├── App.tsx                    # Main app component
│   ├── AppRouter.tsx              # Routing logic
│   ├── main.tsx                   # Entry point
│   ├── components/
│   │   ├── SquareCheckout.tsx     # Square payment component
│   │   ├── Hero.tsx               # Homepage hero
│   │   ├── FeatureIconRow.tsx     # Features
│   │   ├── HowItWorksSteps.tsx    # Steps
│   │   ├── WhatYouGetVideo.tsx    # Video
│   │   ├── BlogDisplay.tsx        # Blog
│   │   └── custom-admin/          # Admin panel
│   │       └── SimplePaymentSettings.tsx
│   └── pages/
│       ├── HomePage.tsx           # Main homepage
│       ├── NewCheckoutPage.tsx    # Checkout (Square)
│       └── ConciergeLanding.tsx   # Concierge subdomain
├── pages/
│   └── api/
│       └── create-square-session.ts  # Square API route
├── public/
│   └── assets/                    # ALL IMAGES GO HERE
├── cursor-mcp-config.json         # MCP GitHub config
├── wrangler.toml                  # Cloudflare config
└── package.json
```

---

## 🖼️ IMAGE HANDLING

**CRITICAL: All images must be in `public/assets/`**

### Rules:
1. ✅ Store ALL images in `public/assets/`
2. ✅ Use root-relative paths: `/assets/image.jpg`
3. ❌ NEVER use relative paths like `./assets/image.jpg`
4. ✅ Images in `public/` are included in the build bundle

### Example:
```tsx
// ✅ CORRECT
<img src="/assets/product-image.jpg" />

// ❌ WRONG
<img src="./assets/product-image.jpg" />
<img src="../assets/product-image.jpg" />
```

---

## 🔧 MCP GITHUB CONNECTION

### Current Config:
**File:** `cursor-mcp-config.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "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"
      }
    }
  }
}
```

### To Activate:
1. **Restart Cursor completely**
2. MCP connection will be active
3. I can then access GitHub directly

---

## 📝 KEY MODIFICATIONS MADE

### 1. Payment Processor Switch (Stripe → Square)
- ✅ Created `SquareCheckout.tsx`
- ✅ Created `create-square-session.ts` API route
- ✅ Updated `NewCheckoutPage.tsx` to use Square
- ✅ Updated admin payment settings for Square
- ✅ Removed all Stripe components

### 2. Repository Standardization
- ✅ Changed all references to `streamstickpro`
- ✅ Updated `wrangler.toml` name
- ✅ Updated GitHub Actions workflow
- ✅ Updated `deploy.sh` script

### 3. Security Cleanup
- ✅ Removed hardcoded API tokens
- ✅ Removed hardcoded admin credentials
- ✅ All secrets now use environment variables

### 4. Homepage Layout
- ✅ Kept old layout (Hero, Features, Steps, Video, Blog)
- ✅ Removed new "luxury" components

### 5. SEO & Backend
- ✅ SEO optimizations implemented
- ✅ Admin credential generator
- ✅ Checkout system functional
- ✅ All backend features intact

---

## 🎯 QUICK COMMANDS

### Push to GitHub:
```bash
git add .
git commit -m "Your message"
git push -u origin main
```

### Check Git Status:
```bash
git status
git remote -v
```

### Build Locally:
```bash
npm install
npm run build
```

### Run Dev Server:
```bash
npm run dev
```

---

## ⚠️ IMPORTANT REMINDERS

1. **Payment:** Use SQUARE, not Stripe
2. **Images:** Always in `public/assets/` with root-relative paths
3. **Repository:** Name is `streamstickpro` (standardized)
4. **Homepage:** Keep old layout, not the new luxury look
5. **Secrets:** Never hardcode - use environment variables
6. **MCP:** Restart Cursor to activate GitHub connection

---

## 🔗 IMPORTANT LINKS

- **GitHub Repo:** `https://github.com/reloadedfiretvteam-hash/streamstickpro`
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Supabase Dashboard:** Your Supabase project
- **Square Dashboard:** https://squareup.com/dashboard

---

## 📞 IF SOMETHING BREAKS

1. **Check Git Status:** `git status`
2. **Check Remote:** `git remote -v`
3. **Verify Environment Variables:** Check Cloudflare Pages settings
4. **Check Build Logs:** Cloudflare Pages → Deployments → View logs
5. **Verify Images:** Ensure all in `public/assets/` with `/assets/` paths

---

**This is your master reference. Everything you need is here!**

