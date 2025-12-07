# StreamStickPro - Complete Independent Deployment Guide

This guide contains everything you need to deploy and run StreamStickPro completely independently on your own infrastructure.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Required Accounts](#required-accounts)
3. [All Environment Variables/Secrets](#all-environment-variablessecrets)
4. [Supabase Database Setup](#supabase-database-setup)
5. [Stripe Setup](#stripe-setup)
6. [Resend Email Setup](#resend-email-setup)
7. [Cloudflare Pages Deployment](#cloudflare-pages-deployment)
8. [Domain Configuration](#domain-configuration)
9. [Build & Deploy Commands](#build--deploy-commands)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE PAGES                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Frontend (React/Vite) + Cloudflare Worker (Hono API)    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌────────────────┐
│   SUPABASE    │    │     STRIPE      │    │     RESEND     │
│  PostgreSQL   │    │    Payments     │    │     Emails     │
│  + Storage    │    │   + Webhooks    │    │                │
└───────────────┘    └─────────────────┘    └────────────────┘
```

**Dual-Store Product Cloaking:**
- Main Store (streamstickpro.com) → Shows real products (Fire Sticks, IPTV)
- Shadow Store (secure.streamstickpro.com/shadow-services) → Shows "Web Design", "SEO" services for payment processor

---

## Required Accounts

You need accounts with these services (all have free tiers):

1. **Cloudflare** - Hosting (free tier)
   - https://cloudflare.com

2. **Supabase** - Database & Storage (free tier)
   - https://supabase.com

3. **Stripe** - Payments (pay per transaction)
   - https://stripe.com

4. **Resend** - Emails (free tier: 3,000 emails/month)
   - https://resend.com

5. **Domain Registrar** (for custom domain)
   - Namecheap, GoDaddy, Cloudflare Registrar, etc.

---

## All Environment Variables/Secrets

These are ALL the secrets you need to configure in Cloudflare Pages:

### Required Secrets (13 total)

| Secret Name | Description | Where to Get It |
|-------------|-------------|-----------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Webhooks → Signing Secret |
| `RESEND_API_KEY` | Resend API key | Resend Dashboard → API Keys |
| `RESEND_FROM_EMAIL` | Your verified sender email | e.g., `noreply@streamstickpro.com` |
| `DATABASE_URL` | Supabase PostgreSQL connection | Supabase → Settings → Database → Connection String |
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Supabase → Settings → API → service_role key |
| `ADMIN_USERNAME` | Admin panel username | Choose your own (e.g., `admin`) |
| `ADMIN_PASSWORD_HASH` | Hashed admin password | See password hashing section below |
| `JWT_SECRET` | JWT signing secret | Generate random 64-character string |
| `SESSION_SECRET` | Session signing secret | Generate random 64-character string |

### Example Values Format

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@streamstickpro.com
DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
JWT_SECRET=your-64-character-random-string-here-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SESSION_SECRET=another-64-character-random-string-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Generate Password Hash

To hash your admin password, run this in any Node.js environment:

```javascript
const bcrypt = require('bcryptjs');
// Or use: import bcrypt from 'bcryptjs';

const password = 'your-secure-password';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
// Output: $2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Or use an online bcrypt generator: https://bcrypt-generator.com/

### Generate Random Secrets

For JWT_SECRET and SESSION_SECRET:

```bash
# Using OpenSSL (Mac/Linux)
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Supabase Database Setup

### 1. Create Supabase Project

1. Go to https://supabase.com and create account
2. Create new project
3. Wait for project to initialize (~2 minutes)

### 2. Create Database Tables

Run this SQL in Supabase SQL Editor (Database → SQL Editor):

```sql
-- Users table (admin authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customers table (IPTV customers)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    total_orders INTEGER DEFAULT 0,
    last_order_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Real products table (your actual products)
CREATE TABLE IF NOT EXISTS real_products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    category VARCHAR(50),
    image_url TEXT,
    shadow_product_id VARCHAR(255),
    shadow_price_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    customer_id UUID REFERENCES customers(id),
    stripe_checkout_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    shadow_product_id VARCHAR(255),
    shadow_price_id VARCHAR(255),
    real_product_id VARCHAR(255),
    real_product_name VARCHAR(255),
    amount INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    credentials_sent BOOLEAN DEFAULT FALSE,
    shipping_name VARCHAR(255),
    shipping_phone VARCHAR(50),
    shipping_street TEXT,
    shipping_city VARCHAR(255),
    shipping_state VARCHAR(100),
    shipping_zip VARCHAR(20),
    shipping_country VARCHAR(100),
    fulfillment_status VARCHAR(50) DEFAULT 'pending',
    amazon_order_id VARCHAR(255),
    is_renewal BOOLEAN DEFAULT FALSE,
    existing_username VARCHAR(255),
    generated_username VARCHAR(255),
    generated_password VARCHAR(255),
    country_preference TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Visitors table (analytics)
CREATE TABLE IF NOT EXISTS visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255),
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address VARCHAR(50),
    country VARCHAR(100),
    country_code VARCHAR(10),
    region VARCHAR(100),
    region_code VARCHAR(10),
    city VARCHAR(100),
    latitude DECIMAL,
    longitude DECIMAL,
    timezone VARCHAR(100),
    isp VARCHAR(255),
    is_proxy BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Page edits table (CMS)
CREATE TABLE IF NOT EXISTS page_edits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id VARCHAR(255) NOT NULL,
    section_id VARCHAR(255) NOT NULL,
    element_id VARCHAR(255) NOT NULL,
    content TEXT,
    image_url TEXT,
    element_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_checkout_session ON orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_real_products_shadow_id ON real_products(shadow_product_id);
CREATE INDEX IF NOT EXISTS idx_customers_username ON customers(username);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
```

### 3. Insert Products

Run this SQL to insert your products (you'll need to update the shadow_product_id and shadow_price_id after creating Stripe products):

```sql
-- Fire Stick Products
INSERT INTO real_products (id, name, description, price, category, image_url, shadow_product_id, shadow_price_id) VALUES
('firestick-hd', 'Fire Stick HD', 'Pre-loaded streaming device with 10,000+ channels', 11900, 'firestick', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('firestick-4k', 'Fire Stick 4K', 'Premium 4K streaming with voice remote', 12900, 'firestick', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('firestick-4k-max', 'Fire Stick 4K Max', 'Ultimate streaming performance with WiFi 6E', 13600, 'firestick', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID');

-- IPTV 1 Month Subscriptions
INSERT INTO real_products (id, name, description, price, category, image_url, shadow_product_id, shadow_price_id) VALUES
('iptv-1mo-1d', 'IPTV 1 Month - 1 Device', '1 month subscription for 1 device', 1500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-1mo-2d', 'IPTV 1 Month - 2 Devices', '1 month subscription for 2 devices', 2000, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-1mo-3d', 'IPTV 1 Month - 3 Devices', '1 month subscription for 3 devices', 2500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-1mo-4d', 'IPTV 1 Month - 4 Devices', '1 month subscription for 4 devices', 3000, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-1mo-5d', 'IPTV 1 Month - 5 Devices', '1 month subscription for 5 devices', 3500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID');

-- IPTV 3 Month Subscriptions
INSERT INTO real_products (id, name, description, price, category, image_url, shadow_product_id, shadow_price_id) VALUES
('iptv-3mo-1d', 'IPTV 3 Months - 1 Device', '3 month subscription for 1 device', 3500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-3mo-2d', 'IPTV 3 Months - 2 Devices', '3 month subscription for 2 devices', 4500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-3mo-3d', 'IPTV 3 Months - 3 Devices', '3 month subscription for 3 devices', 5500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-3mo-4d', 'IPTV 3 Months - 4 Devices', '3 month subscription for 4 devices', 6500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-3mo-5d', 'IPTV 3 Months - 5 Devices', '3 month subscription for 5 devices', 7500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID');

-- IPTV 6 Month Subscriptions
INSERT INTO real_products (id, name, description, price, category, image_url, shadow_product_id, shadow_price_id) VALUES
('iptv-6mo-1d', 'IPTV 6 Months - 1 Device', '6 month subscription for 1 device', 5000, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-6mo-2d', 'IPTV 6 Months - 2 Devices', '6 month subscription for 2 devices', 6500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-6mo-3d', 'IPTV 6 Months - 3 Devices', '6 month subscription for 3 devices', 8000, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-6mo-4d', 'IPTV 6 Months - 4 Devices', '6 month subscription for 4 devices', 9500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-6mo-5d', 'IPTV 6 Months - 5 Devices', '6 month subscription for 5 devices', 11000, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID');

-- IPTV 1 Year Subscriptions
INSERT INTO real_products (id, name, description, price, category, image_url, shadow_product_id, shadow_price_id) VALUES
('iptv-1yr-1d', 'IPTV 1 Year - 1 Device', '12 month subscription for 1 device', 7500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-1yr-2d', 'IPTV 1 Year - 2 Devices', '12 month subscription for 2 devices', 10000, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-1yr-3d', 'IPTV 1 Year - 3 Devices', '12 month subscription for 3 devices', 12500, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-1yr-4d', 'IPTV 1 Year - 4 Devices', '12 month subscription for 4 devices', 15000, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID'),
('iptv-1yr-5d', 'IPTV 1 Year - 5 Devices', '12 month subscription for 5 devices', 22000, 'iptv', NULL, 'prod_YOUR_STRIPE_ID', 'price_YOUR_STRIPE_ID');
```

### 4. Get Connection Details

From Supabase Dashboard:
- **Settings → Database → Connection String** (use "Transaction pooler" for serverless)
- **Settings → API → Project URL** = `VITE_SUPABASE_URL`
- **Settings → API → anon public** = `VITE_SUPABASE_ANON_KEY`
- **Settings → API → service_role** = `SUPABASE_SERVICE_KEY`

---

## Stripe Setup

### 1. Create Stripe Account

1. Go to https://stripe.com
2. Complete business verification
3. Get your API keys from Developers → API Keys

### 2. Create Shadow Products

Create these "shadow" products in Stripe that match your real products. These are what the payment processor sees:

| Shadow Product Name | Price | Maps To |
|---------------------|-------|---------|
| Web Design Basic | $119.00 | Fire Stick HD |
| Web Design Pro | $129.00 | Fire Stick 4K |
| Web Design Premium | $136.00 | Fire Stick 4K Max |
| SEO Package 1-Month | $15.00 | IPTV 1mo 1 Device |
| SEO Package 1-Month Plus | $20.00 | IPTV 1mo 2 Devices |
| ... (continue for all IPTV plans) | ... | ... |

For each product in Stripe:
1. Products → Add Product
2. Name: "Web Design Basic" (or shadow name)
3. Price: One-time, matching your real product price
4. Save and copy the `prod_xxx` and `price_xxx` IDs

### 3. Update Product Mappings

After creating Stripe products, update your Supabase products with the shadow IDs:

```sql
-- Example: Update Fire Stick HD with its shadow product
UPDATE real_products 
SET shadow_product_id = 'prod_xxxxxxxxxx', shadow_price_id = 'price_xxxxxxxxxx'
WHERE id = 'firestick-hd';

-- Repeat for all products...
```

### 4. Configure Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://secure.streamstickpro.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the signing secret (starts with `whsec_`)
5. Save as `STRIPE_WEBHOOK_SECRET` in Cloudflare

---

## Resend Email Setup

### 1. Create Resend Account

1. Go to https://resend.com
2. Create account and verify email

### 2. Add Domain

1. Domains → Add Domain
2. Add your domain (e.g., `streamstickpro.com`)
3. Add DNS records to your domain registrar
4. Wait for verification (~5 minutes)

### 3. Create API Key

1. API Keys → Create API Key
2. Name: "StreamStickPro"
3. Copy the key (starts with `re_`)
4. Save as `RESEND_API_KEY` in Cloudflare

### 4. Set From Email

Set `RESEND_FROM_EMAIL` to an email on your verified domain:
- `noreply@streamstickpro.com`
- `orders@streamstickpro.com`

---

## Cloudflare Pages Deployment

### 1. Create Cloudflare Account

1. Go to https://cloudflare.com
2. Create account

### 2. Connect Git Repository

1. Workers & Pages → Create
2. Connect to GitHub/GitLab
3. Select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: (leave empty)

### 3. Add Environment Variables

In Cloudflare Pages → Settings → Environment Variables:

Add ALL secrets from the table above for both Production and Preview environments.

### 4. Deploy

1. Save settings
2. Deploy!

### 5. Redeploy After Adding Secrets

After adding secrets, trigger a new deployment:
1. Go to Deployments
2. Click "Retry deployment" on the latest

---

## Domain Configuration

### 1. Add Custom Domain to Cloudflare Pages

1. Cloudflare Pages → Your Project → Custom Domains
2. Add domain: `streamstickpro.com`
3. Add subdomain: `secure.streamstickpro.com`

### 2. Configure DNS

If your domain is on Cloudflare:
- DNS records are added automatically

If your domain is elsewhere:
1. Add CNAME record:
   - Name: `@` (or `www`)
   - Target: `your-project.pages.dev`
   
2. Add CNAME for subdomain:
   - Name: `secure`
   - Target: `your-project.pages.dev`

### 3. Enable SSL

Cloudflare automatically provides SSL certificates.

---

## Build & Deploy Commands

### Local Development

```bash
# Install dependencies
npm install

# Start development server (uses Express for local dev)
npm run dev

# Access at http://localhost:5000
```

### Build for Production

```bash
# Build for Cloudflare Pages
npm run build
```

This creates a `dist/` folder with:
- Static frontend files
- Cloudflare Worker bundle

### Deploy to Cloudflare

```bash
# Using Wrangler CLI
npx wrangler pages deploy dist
```

Or push to your connected Git repository for automatic deployment.

---

## File Structure Overview

```
streamstickpro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MainStore.tsx    # Customer store
│   │   │   ├── ShadowStore.tsx  # Payment processor view
│   │   │   ├── Checkout.tsx     # Cart & checkout
│   │   │   ├── Success.tsx      # Post-payment
│   │   │   └── AdminPanel.tsx   # Admin dashboard
│   │   ├── components/
│   │   └── lib/
│   └── index.html
├── worker/                 # Cloudflare Worker (API)
│   ├── index.ts            # Main entry
│   ├── storage.ts          # Supabase database
│   ├── email.ts            # Resend emails
│   └── routes/
│       ├── checkout.ts     # Stripe checkout
│       ├── webhook.ts      # Stripe webhooks
│       ├── products.ts     # Product API
│       ├── orders.ts       # Orders API
│       ├── admin.ts        # Admin API
│       └── auth.ts         # Authentication
├── shared/                 # Shared types
│   └── schema.ts
├── wrangler.toml           # Cloudflare config
├── package.json
└── DEPLOYMENT_GUIDE.md     # This file
```

---

## Troubleshooting

### Webhook Not Working

1. Check webhook URL is correct: `https://secure.streamstickpro.com/api/stripe/webhook`
2. Verify STRIPE_WEBHOOK_SECRET is set correctly
3. Check Cloudflare Pages logs
4. Test with Stripe CLI: `stripe listen --forward-to localhost:5000/api/stripe/webhook`

### Database Connection Failed

1. Verify DATABASE_URL uses Transaction Pooler URL (port 6543)
2. Check Supabase is not paused (free tier pauses after 7 days inactive)
3. Verify connection string format

### Emails Not Sending

1. Verify domain is verified in Resend
2. Check RESEND_API_KEY is correct
3. Ensure RESEND_FROM_EMAIL matches verified domain

### Products Not Loading

1. Check products exist in Supabase `real_products` table
2. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
3. Check browser console for errors

---

## Support

For issues:
1. Check Cloudflare Pages logs (Deployments → View Logs)
2. Check browser developer console
3. Verify all environment variables are set

---

## Quick Checklist

Before going live, verify:

- [ ] All 13 secrets configured in Cloudflare
- [ ] Database tables created in Supabase
- [ ] Products inserted with shadow mappings
- [ ] Stripe webhook configured
- [ ] Domain DNS configured
- [ ] Test checkout flow works
- [ ] Test emails are received
- [ ] Admin login works
