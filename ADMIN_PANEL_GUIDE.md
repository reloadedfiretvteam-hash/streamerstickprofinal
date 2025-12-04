# Admin Panel User Guide

## Accessing the Admin Panel

1. Navigate to: `https://yourdomain.com/custom-admin`
2. Log in with your admin credentials
3. You'll see the main dashboard with navigation menu

## Dashboard Overview

The dashboard displays:
- **Total Products**: Count of products in your store
- **Total Orders**: Number of orders received
- **Customers**: Count of unique customers
- **Total Revenue**: Sum of all completed orders
- **Live Visitor Statistics**: Real-time visitor data (updates every 30 seconds)

### Quick Actions
Click any quick action button to jump directly to that section:
- Edit Homepage
- Manage Products
- Write Blog Post
- View Orders

## Main Features

### 1. Product Management

**Location**: Products (Manage All Products)

**Features**:
- View all products in a grid layout
- Search products by name or SKU
- Add new products with the "Add New Product" button
- Edit existing products (click Edit button on any product card)
- Delete products (click Delete button, requires confirmation)

**Product Fields**:
- **Product Name**: The customer-facing name (e.g., "1 Month IPTV Subscription")
- **URL Slug**: Used in product URLs (e.g., "1-month-iptv")
- **SKU**: Internal product code for inventory tracking
- **Description**: Full product description (supports HTML)
- **Regular Price**: Standard price in USD
- **Sale Price**: Optional discounted price
- **Stock Quantity**: Number of units available
- **Category**: Subscriptions, Devices, or Accessories
- **Status**: Published (visible), Draft (hidden), or Private
- **Main Image URL**: URL to product image
- **Featured**: Check to display on homepage

**Stripe Compliance (Carnage)**:
- **Cloaked Name**: The generic name shown to Stripe (never mentions IPTV/Fire Stick)
- Recommended names:
  - "Digital Entertainment Service"
  - "Digital Entertainment Service - Subscription"
  - "Digital Entertainment Service - Hardware Bundle"
- This field is CRITICAL for Stripe compliance
- When customers checkout, Stripe sees only the cloaked name
- Customers see the real product name everywhere else

**SEO Settings (per product)**:
- **Meta Title**: Custom title for search engines (50-60 characters optimal)
- **Meta Description**: Search result description (150-160 characters optimal)

**Price Changes**:
- When you update a product's price, it's automatically updated for Stripe
- No separate syncing needed - same database row

### 2. Blog Management

**Location**: Blog Posts (With SEO Scores)

**Features**:
- View all blog posts with SEO scores
- Real-time SEO scoring based on:
  - Title length (50-60 chars optimal)
  - Meta description length (150-160 chars optimal)
  - Presence of focus keyword
  - Content word count (1000+ words optimal)
  - Excerpt quality (50+ characters)
  - Featured image
  - Category assignment
- Create new posts with "Add New Post" button
- Edit existing posts
- Delete posts
- Search posts by title

**Blog Post Fields**:
- **Title**: Post headline
- **Slug**: URL-friendly version of title
- **Content**: Full post content (HTML supported)
- **Excerpt**: Short summary for previews
- **Featured Image**: Main post image URL
- **Category**: Topic classification
- **Tags**: Keywords for organization
- **Status**: Published (live) or Draft (hidden)
- **Focus Keyword**: Main SEO keyword
- **Meta Title**: Custom search engine title
- **Meta Description**: Search result description
- **Author**: Post author name
- **Published Date**: Publication timestamp

**SEO Score Indicators**:
- 🟢 Green (80-100): Excellent optimization
- 🟡 Yellow (60-79): Good, needs minor improvements
- 🔴 Red (0-59): Needs significant SEO work

### 3. SEO Settings

**Location**: SEO Settings & Google

**Tabs**:

#### Google Services Tab
- **Google Analytics 4 Measurement ID**: Format `G-XXXXXXXXXX`
  - Get from: Google Analytics → Admin → Data Streams
  - Automatically injected into your site when configured
- **Google Search Console Verification**: Your verification code
  - Get from: Search Console → Settings → Ownership verification → HTML tag
  - Meta tag automatically injected into site header
- **Bing Webmaster Tools Verification**: Your Bing verification code
  - Get from: Bing Webmaster Tools → Site verification → HTML tag
  - Meta tag automatically injected into site header
- **Google Tag Manager ID** (Optional): Format `GTM-XXXXXXX`

**Quick Setup Links**: Direct links to each service for easy setup

#### Site Information Tab
- Site name, description, keywords
- Used across the site and in SEO

#### Social Media Tab
- Facebook, Twitter, Instagram, YouTube, LinkedIn URLs
- Displayed in footer and social meta tags

#### Business Info Tab
- Business name, email, phone, address
- Used for structured data and contact information

**How Verification Works**:
1. Enter your verification code in the admin panel
2. Click "Save Changes"
3. The system automatically injects the meta tag into your site's `<head>`
4. Visit Google Search Console or Bing Webmaster Tools
5. Click "Verify" - verification should succeed instantly

### 4. System Health Check

**Location**: System Health Check

**Checks**:
- Database Connection
- Real Products Table
- Orders System
- Payment System
- Email Collection
- Blog System
- Reviews System
- FAQ System
- Visitor Tracking

**Status Indicators**:
- ✅ Pass: System working correctly
- ⚠️ Warning: System functional but needs attention
- ❌ Fail: System error needs fixing

### 5. Product Mapping Manager

**Location**: Stripe Product Mapping

**Purpose**: Verify and manage Carnage product name mappings for Stripe compliance

**Features**:
- View all products with their cloaked names
- Verify compliance status
- Quick fix for missing cloaked names
- SQL helpers for bulk updates

### 6. Orders & Customers

**Location**: Orders & Customers

**Features**:
- View all orders
- See customer information
- Check payment status
- View order items
- Track order status

### 7. Advanced Analytics

**Location**: Analytics Dashboard

**Metrics**:
- Sales trends
- Popular products
- Customer demographics
- Traffic sources
- Conversion rates

### 8. Image Management

**When editing a product**:
1. Scroll to "Product Images" section
2. Click "Upload Images" button
3. Select one or more images from your computer
4. Images are uploaded to Supabase Storage
5. First image is automatically set as primary
6. Click "Set Primary" on any image to make it the main product image
7. Click X to delete an image

**Supported Formats**: JPG, PNG, GIF, WebP
**Max Size**: 50MB per image
**Storage**: Supabase Storage bucket (configured via `VITE_STORAGE_BUCKET_NAME`)

**Troubleshooting Images**:
- If images don't upload, check that storage bucket exists
- Bucket must be set to "Public" in Supabase
- See `SUPABASE_STORAGE_SETUP.md` for detailed configuration

## Common Tasks

### Adding a New Product

1. Go to **Products** section
2. Click **"Add New Product"**
3. Fill in required fields (marked with *)
4. Set a **Stripe Cloaked Name** (generic, compliant name)
5. Add SEO meta title and description
6. Upload product images
7. Click **"Save Product"**
8. Product is now live (if status is "Published")

### Creating a Blog Post

1. Go to **Blog Posts** section
2. Click **"Add New Post"**
3. Write compelling title (aim for 50-60 characters)
4. Add content (aim for 1000+ words for best SEO)
5. Write excerpt (short summary)
6. Add featured image
7. Choose category and tags
8. Add focus keyword
9. Fill SEO meta fields
10. Set status to "Published"
11. Click **"Save Post"**
12. Check SEO score - aim for 80+

### Setting Up Search Engine Verification

**For Google**:
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property
3. Choose "HTML tag" verification method
4. Copy the code from the meta tag (just the value in `content=""`)
5. In admin panel, go to **SEO Settings** → **Google Services**
6. Paste into "Google Search Console Verification" field
7. Click **"Save Changes"**
8. Return to Search Console and click "Verify"

**For Bing**:
1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Choose "HTML Meta Tag" verification
4. Copy the verification code (just the code, not the full tag)
5. In admin panel, go to **SEO Settings** → **Google Services**
6. Paste into "Bing Webmaster Verification" field
7. Click **"Save Changes"**
8. Return to Bing and click "Verify"

### Changing Product Prices

1. Go to **Products**
2. Click **Edit** on the product
3. Update **Regular Price** and/or **Sale Price**
4. Click **"Save Product"**
5. Price is immediately updated everywhere (frontend and Stripe)
6. No separate Stripe product sync needed

### Managing Cloaked Product Names

1. Edit any product
2. Scroll to **"Stripe Compliance (Carnage Product Name)"** section
3. View or edit the **Cloaked Name**
4. Use generic terms only (no IPTV, Fire Stick, etc.)
5. Recommended formats provided in helper text
6. Click **"Save Product"**

## Security Best Practices

1. **Never share admin credentials** - keep them secure
2. **Use strong passwords** - mix of letters, numbers, symbols
3. **Log out when done** - click Logout in sidebar
4. **Regular backups** - export data periodically
5. **Monitor activity** - check System Health regularly
6. **Review orders** - check for suspicious transactions

## Troubleshooting

### Can't Upload Images
- Check Supabase Storage bucket exists
- Verify bucket is set to "Public"
- See `SUPABASE_STORAGE_SETUP.md`

### SEO Tags Not Showing
- Verify codes entered correctly (no extra spaces)
- Codes should not include `<meta>` tags, just the code
- Save changes and refresh your site
- View page source to confirm meta tags present

### Products Not Displaying
- Check product status is "Published"
- Verify stock quantity > 0
- Clear browser cache
- Check browser console for errors

### Orders Not Showing
- Verify database connection in System Health
- Check payment gateway configuration
- Review browser console for API errors

## Support Resources

- **Storage Setup**: `SUPABASE_STORAGE_SETUP.md`
- **Stripe Documentation**: `STRIPE_AUDIT_SUMMARY_REPORT.md`
- **System Health**: Built-in health check tool
- **Supabase Dashboard**: Direct database access if needed

## Quick Reference

### Admin URL
```
https://yourdomain.com/custom-admin
```

### Main Sections
- 🏠 Dashboard - Overview and stats
- 🏥 System Health Check - System diagnostics
- 🛡️ Product Mapping - Stripe compliance
- 🖼️ Homepage Editor - Visual page editor
- 📦 Products - Product management
- 🎬 AI Video Generator - Marketing videos
- ⚡ Amazon Automation - Fire Stick automation
- 📝 Blog Posts - Content management
- 🌍 SEO Settings - Search engine setup
- 🎯 SEO Manager - Advanced SEO tools
- 🛒 Orders - Order management
- 📊 Analytics - Sales analytics
- 🏷️ Categories - Category management
- 📧 Email Campaigns - Bulk email
- 🔧 GitHub & Cloudflare - Deployment config
- ⚙️ Site Settings - General settings

### Keyboard Shortcuts
- `Esc` - Close modal dialogs
- `Ctrl+S` / `Cmd+S` - Save (when editing)

---

**Last Updated**: December 2024
**Version**: 2.0
