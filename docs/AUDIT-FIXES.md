# Audit Fixes Documentation

## Required Environment Variables

All sensitive credentials and configuration should be set via environment variables rather than hardcoded in source code.

### Payment Integration

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SQUARE_APP_ID` | Your Square Application ID from the Square Developer Dashboard | Yes (for Square payments) |
| `VITE_SQUARE_LOCATION_ID` | Your Square Location ID from the Square Dashboard | Yes (for Square payments) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Your Stripe Publishable Key | Yes (for Stripe payments) |

### Supabase Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes (for database features) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | Yes (for database features) |

### Admin Authentication

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_ADMIN_DEFAULT_USER` | Default admin username for local/dev testing | For local/dev only |
| `VITE_ADMIN_DEFAULT_PASSWORD` | Default admin password for local/dev testing | For local/dev only |
| `VITE_ADMIN_DEFAULT_EMAIL` | Default admin email for local/dev testing | Optional |

**Important:** In production, admin credentials should be stored in the Supabase `admin_credentials` table, not in environment variables. The environment-based fallback is only for local development and testing when Supabase is not configured.

---

## Square Payment Integration

### How to Obtain Square Credentials

1. **Create a Square Developer Account**
   - Visit [developer.squareup.com](https://developer.squareup.com)
   - Sign up for a Square Developer account or log in with your existing Square account

2. **Create an Application**
   - In the Developer Dashboard, click "Create Application"
   - Name your application and select the appropriate settings
   - Note down your **Application ID** (this is your `VITE_SQUARE_APP_ID`)

3. **Get Your Location ID**
   - In the Square Dashboard, go to Settings > Locations
   - Copy your **Location ID** (this is your `VITE_SQUARE_LOCATION_ID`)

### Setting Environment Variables

#### For Cloudflare Pages

1. Go to your Cloudflare Pages project settings
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - `VITE_SQUARE_APP_ID` = your-square-app-id
   - `VITE_SQUARE_LOCATION_ID` = your-square-location-id

#### For Local Development

Create a `.env` file in the project root:

```env
# Payment Integration
VITE_SQUARE_APP_ID=your-square-app-id
VITE_SQUARE_LOCATION_ID=your-square-location-id

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Admin Credentials (local/dev only - DO NOT use in production)
VITE_ADMIN_DEFAULT_USER=your-admin-username
VITE_ADMIN_DEFAULT_PASSWORD=your-admin-password
VITE_ADMIN_DEFAULT_EMAIL=your-admin-email@example.com
```

**Note:** Never commit your `.env` file to version control.

### Behavior When Environment Variables Are Missing

If the Square environment variables are not configured, the SquarePaymentForm component will:
- Display a helpful configuration message instead of crashing
- List the missing environment variables
- Provide instructions on how to obtain and configure the credentials
- The payment button will be disabled until configuration is complete

This ensures a graceful degradation and prevents runtime errors in production.

---

## Stripe Payment Integration

### Stripe Keys Storage

Stripe publishable and secret keys can be configured via:
1. Environment variables (`VITE_STRIPE_PUBLISHABLE_KEY`)
2. Admin panel → Payment Settings (stored in `site_settings` table)

The admin panel (`SimplePaymentSettings.tsx`) allows storing Stripe keys in the Supabase `site_settings` table. **Never commit Stripe secret keys to source code.**

---

## Admin Panel Authentication

### Production Setup (Recommended)

1. Create an admin user in the Supabase `admin_credentials` table:

```sql
INSERT INTO admin_credentials (username, email, password_hash, role, is_active)
VALUES ('your-username', 'your-email@example.com', 'your-secure-password', 'super_admin', true);
```

2. The admin login page (`UnifiedAdminLogin.tsx` or `CustomAdminLogin.tsx`) will authenticate against this table.

### Local/Dev Setup (Fallback)

For local development when Supabase is not configured:

1. Set environment variables:
   ```env
   VITE_ADMIN_DEFAULT_USER=admin
   VITE_ADMIN_DEFAULT_PASSWORD=your-local-password
   ```

2. The login page will check these credentials when database authentication fails.

---

## Consolidated Files

### SquarePaymentForm Component

The canonical SquarePaymentForm component is located at:
```
src/components/SquarePaymentForm.tsx
```

Previous duplicate copies have been moved to:
```
archive/duplicates/
```

The SecureCheckoutPage (`src/pages/SecureCheckoutPage.tsx`) imports the canonical component.

### WhatYouGetVideo Component

The canonical WhatYouGetVideo component is located at:
```
src/components/WhatYouGetVideo.tsx
```

No duplicates found.

### Stripe Components

- Canonical StripeCheckout: `src/components/StripeCheckout.tsx`
- Stripe Checkout Page: `src/pages/StripeCheckoutPage.tsx`
- Payment Settings Admin: `src/components/custom-admin/SimplePaymentSettings.tsx`

### Admin Login Components

The main admin login is `UnifiedAdminLogin.tsx` which:
- First checks environment-based credentials (for local/dev)
- Falls back to Supabase `admin_credentials` table (for production)

---

## Archived Duplicates

### Image Duplicates

Duplicate image files with "copy" in their names have been moved to:
```
archive/images-duplicates/
```

### Component Duplicates

Previous duplicate SquarePaymentForm components have been moved to:
```
archive/duplicates/
```

---

## Changes Made

1. **Consolidated SquarePaymentForm** - Moved duplicate copies to `archive/duplicates/` with timestamps
2. **Enhanced Error Handling** - SquarePaymentForm shows a helpful message when environment variables are missing
3. **Removed Hardcoded Credentials** - Admin login now uses environment variables instead of plaintext passwords
4. **Archived Duplicate Images** - Moved duplicate image files to `archive/images-duplicates/`
5. **Updated Documentation** - Comprehensive documentation for all required environment variables and setup instructions
