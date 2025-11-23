# Square Integration Setup Guide

This guide explains how to configure the AI Tool Suite products for Square payment processing on the secure domain.

## Overview

The application supports two modes:
1. **Main Site** (`streamstickpro.com`): General product catalog
2. **Secure Domain** (`secure.streamstickpro.com`): Square-only checkout with AI Tool Suite products

## Product Catalog

### AI Tool Suite Products (Square-Safe)

These products are displayed on the secure domain and use compliant, SEO/web-design-aligned language:

1. **AI LaunchPad Demo & Onboarding** (FREE)
   - Instant onboarding, site audit, and design preview
   - No purchase needed

2. **AI Page Builder Pro** ($15/month)
   - Auto-layout, image optimization, site speed booster
   - SEO snippet editor
   - 1 month full access

3. **AI SEO Strategy Suite** ($30/3 months)
   - Automated site audits, smart keyword research
   - Content topic generator, traffic analytics
   - 3 months access

4. **AI Blog Automation Engine** ($50/6 months)
   - Automated blog publishing
   - Keyword ranking reports, competitor gap analysis
   - Rich content suggestions
   - 6 months access

5. **AI Local Marketing Power Pack** ($75/12 months)
   - Lead magnet builder, review monitoring
   - Local keyword optimizer
   - Monthly Google My Business insights
   - Full year access

## Database Setup

The products are stored in the `square_products` table, which is created by the migration:

```
supabase/migrations/20251123000000_create_square_products_ai_tools.sql
```

Run this migration to create the table and populate it with the AI tool suite products.

## Environment Configuration

### Required Environment Variables

Copy `.env.example` to `.env` and configure the following:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Square Payment Configuration
VITE_SQUARE_APP_ID=your_square_application_id
VITE_SQUARE_LOCATION_ID=your_square_location_id

# Secure domain configuration
VITE_SECURE_HOSTS=secure.streamstickpro.com
```

### Getting Square Credentials

1. Sign up for a Square Developer account at https://developer.squareup.com/
2. Create a new application
3. Copy your Application ID and Location ID
4. Add them to your `.env` file

## Domain Routing

### Secure Domain (`secure.streamstickpro.com`)

When users access `secure.streamstickpro.com`, they will see:
- Only the ConciergeCheckout component
- Square payment form
- AI Tool Suite products
- No IPTV or streaming terminology

### Main Domain (`streamstickpro.com`)

The main domain displays:
- Full product catalog from `real_products` table
- General site features
- Link to secure domain for AI tools

### Path-Based Routing

You can also access secure mode on any domain using:
- `/secure` path
- `/square` path

Example: `http://localhost:5173/secure`

## Square Callback Handling

The application handles Square payment callbacks at:
- `/square/callback`

The callback is processed through the secure domain routing.

## Component Architecture

### Key Components

1. **ConciergeCheckout.tsx**: Square payment checkout page
2. **ConciergePage.tsx**: AI tool suite product listing
3. **SquarePaymentForm.tsx**: Square payment form integration
4. **FireStickProducts.tsx**: AI tool suite product display
5. **SquareProductManager.tsx**: Admin panel for managing Square products

### Secure Domain Flow

1. User visits `secure.streamstickpro.com`
2. App.tsx detects secure domain
3. Routes to ConciergeCheckout component
4. Loads product from `square_products` table
5. Displays Square payment form
6. Processes payment through Square API

## Testing

### Local Testing

1. Start development server:
```bash
npm run dev
```

2. Test secure mode by visiting:
```
http://localhost:5173/secure
```

3. Test product selection:
```
http://localhost:5173/secure?product=<product_id>
```

### Production Testing

1. Configure DNS for `secure.streamstickpro.com`
2. Deploy application
3. Test complete checkout flow
4. Verify Square payment processing

## Security Considerations

1. **Never commit `.env` file** - Contains sensitive Square credentials
2. **Use HTTPS only** - Required for Square payment processing
3. **Validate on server** - Always validate payments server-side
4. **RLS policies** - Supabase Row Level Security is enabled on `square_products`
5. **Compliant language** - No IPTV or streaming terms in Square-facing components

## Admin Management

Access the Square Product Manager through:
1. Admin dashboard
2. Navigate to "Square Products" section
3. Edit product names, descriptions, and images
4. Sync prices with real products
5. Toggle product active status

## Troubleshooting

### Build Errors

If you encounter build errors:
```bash
npm run build
```

Check for:
- Missing environment variables
- TypeScript errors
- Import path issues

### Square Payment Not Loading

Check:
1. Square credentials in `.env`
2. Square Web SDK script loaded
3. Browser console for errors
4. Network tab for API calls

### Products Not Displaying

Verify:
1. Database migration ran successfully
2. `square_products` table exists
3. Products are marked as `is_active = true`
4. Supabase connection is working

## Support

For additional support:
- Square Developer Docs: https://developer.squareup.com/docs
- Supabase Docs: https://supabase.com/docs
- Project Issues: Check repository issues
