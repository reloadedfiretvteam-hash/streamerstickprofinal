# COMPREHENSIVE CHECKOUT EMAIL SYSTEM PROMPT

## OVERVIEW
This document provides a detailed specification for the customer checkout email system, including URL generation, product information structure, secure checkout page integration, and product linking across the website.

---

## 1. EMAIL SYSTEM ARCHITECTURE

### 1.1 Email Generation Components

#### Primary Email Generator Location
- **File**: `src/components/CheckoutCart.tsx`
- **Function**: `sendCustomerEmail()` (Line 109-197)
- **Edge Function**: `supabase/functions/send-order-emails/index.ts`

#### Email Types Generated
1. **Customer Order Confirmation Email** (`order_confirmation`)
2. **Shop Owner Notification Email** (`shop_notification`)
3. **Service Portal Credentials Email** (`service_credentials`)
4. **Shop Owner Credentials Copy** (`service_credentials_owner_copy`)

### 1.2 Email Database Storage
- **Table**: `email_logs`
- **Fields**: `recipient`, `template_key`, `subject`, `body`, `status`
- **Status**: Emails are logged with status `'pending'` for processing

---

## 2. URL BUILDING SYSTEM

### 2.1 Base URL Configuration

#### Dynamic URL Generation
```javascript
// Base URL is dynamically generated using:
window.location.origin

// Examples:
// Development: http://localhost:5173
// Production: https://streamstickpro.com
// Secure Checkout: https://secure.streamstickpro.com
```

#### Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SECURE_HOSTS`: Comma-separated list of secure checkout domains
- `VITE_CONCIERGE_HOSTS`: Comma-separated list of concierge service domains

### 2.2 Product URL Structure

#### Main Shop Page
- **URL Pattern**: `{baseUrl}/shop#{product-slug}`
- **Example**: `https://streamstickpro.com/shop#fire-stick-4k-max`
- **Implementation**: Products are linked using hash anchors on the shop page

#### Product Slug Generation
```javascript
// From sitemapGenerator.ts (Line 99)
const slug = product.name
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-]/g, '');
```

#### Secure Checkout Page
- **URL Pattern**: `{baseUrl}/secure-checkout`
- **Product Selection**: Products are selected from `square_products` table
- **Product Display**: Products appear in a grid with selection capability

### 2.3 Order Tracking URLs
- **Pattern**: `{baseUrl}/track-order?code={orderCode}`
- **Example**: `https://streamstickpro.com/track-order?code=BTC-ABC123XYZ`
- **Used In**: Customer confirmation emails

### 2.4 Payment Success URLs
- **Pattern**: `{baseUrl}/order-success?code={orderCode}`
- **Example**: `https://streamstickpro.com/order-success?code=BTC-ABC123XYZ`
- **Used In**: NOWPayments Bitcoin payment flow

---

## 3. PRODUCT INFORMATION STRUCTURE

### 3.1 Product Database Tables

#### Main Products Table: `real_products`
```sql
- id: uuid (Primary Key)
- name: text (Product Name)
- slug: text (URL-friendly identifier)
- description: text (Full product description)
- short_description: text (Brief description)
- price: decimal(10,2) (Base price)
- sale_price: decimal(10,2) (Sale price, nullable)
- main_image: text (Primary product image URL)
- gallery_images: text[] (Additional product images)
- category: text (Product category)
- stock_quantity: integer (Available inventory)
- status: text ('active', 'publish', 'published', 'draft', 'archived')
- featured: boolean (Featured product flag)
- sku: text (Stock Keeping Unit)
- created_at: timestamptz
- updated_at: timestamptz
```

#### Secure Checkout Products Table: `square_products`
```sql
- id: string (Primary Key)
- name: text (Product Name)
- description: text (Product description)
- price: string (Product price as string)
- image_url: text (Product image URL)
- category: text (Product category)
- is_active: boolean (Active status flag)
```

### 3.2 Product Data in Emails

#### Product Information Included in Emails
```javascript
{
  product_id: string,
  product_name: string,
  quantity: number,
  unit_price: number,
  total_price: number
}
```

#### Email Product List Format
```
- {product_name} x{quantity} = ${total_price}
```

**Example Output:**
```
- Fire Stick 4K Max x1 = $49.99
- IPTV 12-Month Subscription x1 = $99.99
```

---

## 4. SECURE CHECKOUT PAGE PRODUCTS

### 4.1 Secure Checkout Page Location
- **File**: `src/pages/SecureCheckoutPage.tsx`
- **Route**: `/secure-checkout`
- **Product Source**: `square_products` table

### 4.2 Products Displayed on Secure Checkout

#### Product Loading Logic
```typescript
// Line 46-61 in SecureCheckoutPage.tsx
async function loadProducts() {
  const { data, error } = await supabase
    .from('square_products')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });
}
```

#### Product Display Structure
- **Grid Layout**: 3 columns on large screens, 2 on medium, 1 on mobile
- **Product Card Contains**:
  - Product image (or placeholder icon)
  - Product name
  - Product description
  - Product category badge
  - Product price
  - "Select & Checkout" button

#### Product Selection Flow
1. Customer views products on `/secure-checkout`
2. Customer clicks "Select & Checkout" on desired product
3. Product is set as `selectedProduct`
4. Customer proceeds to payment method selection
5. Customer completes checkout with payment details

### 4.3 Why Products Appear on Secure Checkout

#### Purpose
- **Secure Payment Processing**: Products on secure checkout are specifically configured for Square payment integration
- **Service-Based Products**: These products typically represent services (IPTV subscriptions, setup services, etc.) rather than physical products
- **Streamlined Checkout**: Direct product selection without cart functionality for faster checkout experience

#### Product Categories on Secure Checkout
- IPTV Subscriptions
- Setup Services
- Professional Services
- Digital Products

---

## 4.4 SECURE CHECKOUT PAGE DESIGN & PRODUCT SPECIFICATIONS

### 4.4.1 Complete Page Design Structure

#### Page Layout Overview
The secure checkout page (`/secure-checkout`) features a professional, modern design with the following structure:

1. **Header Navigation Bar** (Top)
2. **Hero Section** (Title and description)
3. **Products Grid** (Main content area)
4. **Trust Badges Section** (Bottom)

#### Color Scheme
- **Primary Background**: Gradient from `slate-50` to `slate-100`
- **Card Background**: White (`bg-white`)
- **Primary Accent**: Blue gradient (`from-blue-600 to-blue-700`)
- **Text Primary**: Slate-800 (dark gray)
- **Text Secondary**: Slate-600 (medium gray)
- **Success**: Green-600
- **Warning**: Orange-600
- **Info**: Blue-600

### 4.4.2 Header Navigation Design

#### Header Specifications
```html
<nav className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      <!-- Logo Section -->
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-2xl font-bold text-slate-800">Secure Checkout</span>
          <p className="text-xs text-slate-500">Professional Services</p>
        </div>
      </div>
      <!-- SSL Badge -->
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Lock className="w-4 h-4" />
        <span>SSL Encrypted</span>
      </div>
    </div>
  </div>
</nav>
```

**Header Design Details:**
- **Background**: White with subtle shadow and bottom border
- **Logo Icon**: Shield icon in blue gradient circle (40x40px, rounded corners)
- **Title**: "Secure Checkout" (24px, bold, dark slate)
- **Subtitle**: "Professional Services" (12px, medium gray)
- **SSL Badge**: Lock icon with "SSL Encrypted" text (14px, medium gray)

### 4.4.3 Products Grid Section Design

#### Section Header
```html
<section className="max-w-7xl mx-auto px-6 py-12">
  <div className="text-center mb-12">
    <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
      Choose Your Service
    </h1>
    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
      Select a professional service below. All payments are processed securely.
    </p>
  </div>
</section>
```

**Section Header Specifications:**
- **Title**: "Choose Your Service"
  - Mobile: 36px (text-4xl)
  - Desktop: 48px (text-5xl)
  - Weight: Bold
  - Color: Slate-800
- **Subtitle**: "Select a professional service below..."
  - Size: 20px (text-xl)
  - Color: Slate-600
  - Max Width: 672px (2xl), centered
- **Spacing**: 48px bottom margin

#### Products Grid Layout
```html
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  <!-- Product cards -->
</div>
```

**Grid Specifications:**
- **Mobile**: 1 column (default)
- **Tablet (md)**: 2 columns
- **Desktop (lg)**: 3 columns
- **Gap**: 32px between cards (gap-8)

### 4.4.4 Product Card Complete Design

#### Full Product Card Structure
```html
<div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all 
                border border-slate-200 overflow-hidden transform hover:scale-105">
  
  <!-- Image Section (192px height) -->
  <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 relative">
    {product.image_url ? (
      <img src={product.image_url} alt={product.name} 
           className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center">
        <Package className="w-16 h-16 text-white opacity-50" />
      </div>
    )}
    <!-- Category Badge (top-right) -->
    <div className="absolute top-4 right-4">
      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full 
                       text-xs font-bold text-blue-600">
        {product.category}
      </span>
    </div>
  </div>
  
  <!-- Content Section -->
  <div className="p-6">
    <!-- Product Name -->
    <h3 className="text-xl font-bold text-slate-800 mb-2">
      {product.name}
    </h3>
    
    <!-- Product Description -->
    <p className="text-slate-600 mb-4 min-h-[60px] text-sm">
      {product.description}
    </p>
    
    <!-- Price -->
    <div className="flex items-end justify-between mb-4">
      <div>
        <span className="text-3xl font-bold text-slate-800">
          ${product.price}
        </span>
      </div>
    </div>
    
    <!-- Select Button -->
    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 
                       hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 
                       rounded-lg font-semibold transition-all shadow-md hover:shadow-lg 
                       flex items-center justify-center gap-2">
      <ArrowRight className="w-4 h-4" />
      Select & Checkout
    </button>
  </div>
</div>
```

#### Product Card Specifications

**Card Container:**
- **Background**: White
- **Border Radius**: 12px (rounded-xl)
- **Shadow**: Large shadow, increases to 2xl on hover
- **Border**: 1px slate-200
- **Hover Effect**: Scale up 5% (transform hover:scale-105)
- **Transition**: All properties animate smoothly

**Image Section:**
- **Height**: Fixed 192px (h-48)
- **Background Fallback**: Blue gradient (from-blue-500 to-blue-600)
- **Image**: Full width/height, object-cover maintains aspect ratio
- **Placeholder**: Package icon (64x64px, white, 50% opacity) if no image

**Category Badge:**
- **Position**: Absolute, top-right (16px from top, 16px from right)
- **Background**: White with 90% opacity, backdrop blur
- **Padding**: 12px horizontal, 4px vertical
- **Border Radius**: Fully rounded (pill shape)
- **Text**: 12px, bold, blue-600

**Product Name:**
- **Size**: 20px (text-xl)
- **Weight**: Bold
- **Color**: Slate-800
- **Margin**: 8px bottom

**Product Description:**
- **Size**: 14px (text-sm)
- **Color**: Slate-600
- **Min Height**: 60px (ensures consistent card heights)
- **Margin**: 16px bottom

**Price Display:**
- **Size**: 30px (text-3xl)
- **Weight**: Bold
- **Color**: Slate-800

**Select Button:**
- **Width**: Full width
- **Background**: Blue gradient (from-blue-600 to-blue-700)
- **Hover**: Darker blue gradient (from-blue-700 to-blue-800)
- **Text**: White, semibold
- **Padding**: 24px horizontal, 12px vertical
- **Border Radius**: 8px (rounded-lg)
- **Shadow**: Medium, increases on hover
- **Icon**: ArrowRight, 16x16px, with 8px gap

### 4.4.5 ACTUAL PRODUCTS FOR SECURE CHECKOUT (Square-Safe)

#### Your Current Square Products Configuration

These are the **actual products** configured in your database for the secure checkout page. These products are Square-compliant and appear on `secure.streamstickpro.com`.

**Product Mapping:**
- **Fire Sticks** → Website Development & SEO Services
- **IPTV Subscriptions** → Content Management & Research Services

#### Complete Product List

**1. Content Services (IPTV Subscriptions Mapped)**

```javascript
// Product 1: 1 Month Content Service
{
  id: "uuid-generated",
  name: "Content Research & Curation Service - 1 Month",
  description: "Professional content research and curation service for your website. Our team analyzes trending topics, competitor content, and industry insights to provide you with a curated content library. Includes access to premium research tools, content recommendations, and monthly strategy reports. Perfect for bloggers, content creators, and digital marketers who need fresh content ideas and market intelligence.",
  short_description: "1-month content research and curation service with premium tools access",
  price: 15.00,
  category: "Content Services",
  is_active: true,
  sort_order: 1
}

// Product 2: 3 Month Content Service
{
  id: "uuid-generated",
  name: "Content Strategy & Research Package - 3 Months",
  description: "Comprehensive 3-month content strategy package for growing websites. Includes ongoing content research, competitor analysis, trending topic identification, and personalized content recommendations. Our team monitors your industry, analyzes performance data, and delivers monthly strategy reports with actionable insights. Includes access to premium research databases and content planning tools. Ideal for businesses building their content marketing presence.",
  short_description: "3-month content strategy package with research tools and monthly reports",
  price: 25.00,
  category: "Content Services",
  is_active: true,
  sort_order: 2
}

// Product 3: 6 Month Content Service
{
  id: "uuid-generated",
  name: "Premium Digital Media Library Access - 6 Months",
  description: "6-month access to our premium digital media library and content management platform. Includes unlimited access to curated media resources, stock content libraries, research databases, and content planning tools. Our platform provides real-time market insights, trending content analysis, and automated content recommendations based on your niche. Perfect for agencies, content teams, and serious content creators who need comprehensive media resources.",
  short_description: "6-month premium digital media library and content management platform access",
  price: 40.00,
  category: "Content Services",
  is_active: true,
  sort_order: 3
}

// Product 4: 1 Year Content Service
{
  id: "uuid-generated",
  name: "Enterprise Content Management & Research Platform - 1 Year",
  description: "Annual subscription to our enterprise-grade content management and research platform. Includes full access to premium research tools, content databases, competitor intelligence, market trend analysis, and automated content strategy recommendations. Our platform provides real-time industry insights, content performance analytics, and personalized content roadmaps. Includes priority support, monthly strategy consultations, and custom research reports. Best value for agencies, content teams, and businesses serious about content marketing success.",
  short_description: "1-year enterprise content management platform with research tools and priority support",
  price: 70.00,
  category: "Content Services",
  is_active: true,
  sort_order: 4
}
```

**2. Web Development Services (Fire Sticks Mapped)**

```javascript
// Product 5: Basic Website Page
{
  id: "uuid-generated",
  name: "Professional Website Page Design & Development",
  description: "Complete website page design and development service. Our team creates a custom, responsive web page tailored to your business needs. Includes modern design, mobile optimization, SEO-friendly structure, and professional implementation. Perfect for adding new pages to existing sites or creating standalone landing pages. Includes 1 round of revisions and basic content optimization.",
  short_description: "Custom website page design and development with mobile optimization",
  price: 140.00,
  category: "Web Development",
  is_active: true,
  sort_order: 5
}

// Product 6: Website + 1 Month SEO
{
  id: "uuid-generated",
  name: "Website Page Design + 1 Month SEO Optimization",
  description: "Complete website page design with 1 month of ongoing SEO optimization. Includes custom page design, mobile optimization, on-page SEO implementation, keyword research, meta tag optimization, and performance monitoring. Our team designs your page with SEO best practices built-in, then provides a month of optimization and monitoring to ensure maximum search visibility.",
  short_description: "Website page design with 1 month of SEO optimization and monitoring",
  price: 150.00,
  category: "Web Development",
  is_active: true,
  sort_order: 6
}

// Product 7: Website + 6 Months SEO
{
  id: "uuid-generated",
  name: "Website Page Design + 6 Months SEO Strategy",
  description: "Premium website page design with 6 months of comprehensive SEO strategy and optimization. Includes custom page design, advanced SEO implementation, ongoing keyword research, content optimization, performance tracking, monthly SEO reports, and strategy adjustments. Our team provides long-term SEO support to help your page rank higher and drive organic traffic. Best value for businesses serious about search visibility.",
  short_description: "Website page design with 6 months of comprehensive SEO strategy and optimization",
  price: 160.00,
  category: "Web Development",
  is_active: true,
  sort_order: 7
}
```

#### Product Price Summary

| Product Name | Price | Category | Sort Order |
|-------------|-------|----------|------------|
| Content Research & Curation Service - 1 Month | $15.00 | Content Services | 1 |
| Content Strategy & Research Package - 3 Months | $25.00 | Content Services | 2 |
| Premium Digital Media Library Access - 6 Months | $40.00 | Content Services | 3 |
| Enterprise Content Management & Research Platform - 1 Year | $70.00 | Content Services | 4 |
| Professional Website Page Design & Development | $140.00 | Web Development | 5 |
| Website Page Design + 1 Month SEO Optimization | $150.00 | Web Development | 6 |
| Website Page Design + 6 Months SEO Strategy | $160.00 | Web Development | 7 |

#### Important Notes About Square Products

1. **Square Compliance**: All product names and descriptions are Square-compliant (no mention of IPTV, jailbroken devices, etc.)

2. **Product Mapping**:
   - **Fire Stick HD ($140)** → Professional Website Page Design & Development
   - **Fire Stick 4K ($150)** → Website Page Design + 1 Month SEO Optimization
   - **Fire Stick 4K Max ($160)** → Website Page Design + 6 Months SEO Strategy
   - **1 Month IPTV ($15)** → Content Research & Curation Service - 1 Month
   - **3 Month IPTV ($25)** → Content Strategy & Research Package - 3 Months
   - **6 Month IPTV ($40)** → Premium Digital Media Library Access - 6 Months
   - **1 Year IPTV ($70)** → Enterprise Content Management & Research Platform - 1 Year

3. **Price Synchronization**: Prices automatically sync with your real products via the Square Product Manager admin panel

4. **Display Order**: Products are sorted by `sort_order` field (1-7), then by price (ascending)

5. **Active Status**: All products are set to `is_active: true` by default

6. **Categories**: 
   - "Content Services" (for IPTV subscriptions)
   - "Web Development" (for Fire Stick devices)

### 4.4.6 Trust Badges Section Design

#### Trust Badges Layout
```html
<section className="max-w-7xl mx-auto px-6 py-12">
  <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
    <div className="grid md:grid-cols-3 gap-8">
      <!-- Secure Payment Badge -->
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Secure Payment</h3>
        <p className="text-slate-600 text-sm">
          All transactions processed through secure payment gateways
        </p>
      </div>
      
      <!-- Data Protection Badge -->
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Data Protection</h3>
        <p className="text-slate-600 text-sm">
          Your information is encrypted and never shared
        </p>
      </div>
      
      <!-- Expert Support Badge -->
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Expert Support</h3>
        <p className="text-slate-600 text-sm">
          Professional assistance every step of the way
        </p>
      </div>
    </div>
  </div>
</section>
```

**Trust Badges Specifications:**
- **Container**: White background, rounded-xl, shadow-md
- **Padding**: 32px (mobile), 48px (desktop)
- **Grid**: 3 columns on medium+ screens
- **Icon Circle**: 64x64px, rounded-full, colored background
- **Icon**: 32x32px, colored to match theme
- **Title**: 18px, bold, slate-800
- **Description**: 14px, slate-600

**Badge Color Themes:**
1. **Secure Payment**: Blue (bg-blue-100, text-blue-600)
2. **Data Protection**: Green (bg-green-100, text-green-600)
3. **Expert Support**: Purple (bg-purple-100, text-purple-600)

### 4.4.7 Product Database Schema

#### `square_products` Table Structure
```sql
CREATE TABLE square_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,  -- Stored as string for display
  image_url TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Required Fields
- **id**: Unique identifier (string/text, required)
- **name**: Product name (required, 50-100 characters recommended)
- **description**: Product description (recommended, 100-200 characters)
- **price**: Product price as string (required, format: "XX.XX")
- **image_url**: Product image URL (optional but recommended)
- **category**: Product category (required, e.g., "IPTV Subscriptions")
- **is_active**: Active status (boolean, default true)
- **sort_order**: Display order (integer, lower numbers appear first)

#### Product Image Requirements
- **Recommended Size**: 800x600px or 16:9 aspect ratio
- **Format**: JPG, PNG, or WebP
- **File Size**: Under 500KB for fast loading
- **Alt Text**: Should match product name
- **Fallback**: Package icon displayed if no image provided

### 4.4.8 Empty State Design

#### No Products Available
```html
{products.length === 0 && (
  <div className="text-center py-12">
    <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
    <p className="text-slate-600">No services available at this time.</p>
  </div>
)}
```

**Empty State Specifications:**
- **Icon**: Package icon, 64x64px, slate-400 color
- **Text**: "No services available at this time." (slate-600)
- **Spacing**: 48px vertical padding
- **Alignment**: Centered

---

## 5. PRODUCT LINKING ON REAL PAGE

### 5.1 Main Shop Page (`/shop`)

#### Product Display
- **File**: `src/pages/ShopPage.tsx`
- **Product Source**: `real_products` table
- **Filter**: `status IN ('active', 'publish', 'published')`

#### Product Linking Mechanism
```typescript
// Products are linked using hash anchors
// URL Format: /shop#{product-slug}

// Example product links:
- /shop#fire-stick-4k
- /shop#fire-stick-4k-max
- /shop#iptv-1month
- /shop#iptv-12months
```

#### Product Card Click Action
```typescript
// Line 70-87 in ShopPage.tsx
const addToCart = (product: Product) => {
  // Add product to cart
  // Immediately redirect to checkout
  window.location.href = '/checkout';
};
```

### 5.2 Product URL Generation for Emails

#### Product Link in Email Format
```javascript
// Product link should be generated as:
const productUrl = `${window.location.origin}/shop#${productSlug}`;

// Where productSlug is generated from product name:
const productSlug = product.name
  .toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-]/g, '');
```

#### Email Product Link Example
```html
<a href="https://streamstickpro.com/shop#fire-stick-4k-max">
  View Fire Stick 4K Max Product Page
</a>
```

### 5.3 Where Products Are Linked

#### Homepage Product Links
- **Section**: Shop/Products section
- **Link Format**: Anchor links to `#shop` section or direct `/shop` page
- **Implementation**: `src/components/Footer.tsx` (Line 33)

#### Navigation Menu Links
- **Shop Link**: `/shop` route
- **Checkout Link**: `/checkout` route
- **Secure Checkout Link**: `/secure-checkout` route

#### Blog Post Product Links
- **Placeholder System**: `[PRODUCT_LINK_1]`, `[PRODUCT_LINK_2]`, etc.
- **Implementation**: `src/components/custom-admin/AdvancedBlogManager.tsx` (Line 256)
- **Replacement**: Placeholders are replaced with actual product URLs during email generation

---

## 6. EMAIL CONTENT STRUCTURE

### 6.1 Customer Order Confirmation Email

#### Email Subject
```
Order Confirmation - {orderNumber} - Purchase Code: {purchaseCode}
```

#### Email Body Structure
```
Thank you for your order!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order Number: {orderNumber}
🔑 UNIQUE PURCHASE CODE: {purchaseCode}

Customer: {customerName}
Username: {username}
Email: {customerEmail}
Phone: {customerPhone}
Address: {customerAddress}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS ORDERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{product_name} x{quantity} = ${total_price}
[Additional products listed here]

TOTAL: ${total}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Payment method-specific instructions]

Thank you for choosing Inferno TV!
We'll process your order as soon as we receive your payment confirmation.

Need Support? Email: {SHOP_OWNER_EMAIL}
```

### 6.2 Payment Instructions by Method

#### Cash App Payment Instructions
```
CASH APP PAYMENT INSTRUCTIONS:

1. Open your Cash App
2. Copy and paste our Cash App tag: {CASH_APP_TAG}
3. Enter the amount: ${total}
4. In the "What's it for" field, paste your unique purchase code: {purchaseCode}
5. Complete the payment

IMPORTANT: Your purchase code links your payment to your order. 
Make sure to include it in the payment note.

If needed, you can also email a payment screenshot to {SHOP_OWNER_EMAIL} 
with your purchase code.

📺 Need help? Watch this tutorial: https://www.youtube.com/watch?v=fDjDH_WAvYI
```

#### Bitcoin Payment Instructions
```
BITCOIN PAYMENT INSTRUCTIONS:

1. Bitcoin Amount to Send: {btcAmount} BTC
2. Bitcoin Address: {BITCOIN_ADDRESS}
3. Current BTC Price: ${btcPrice}

IMPORTANT STEPS:
- Copy the Bitcoin address and exact amount shown above
- Send your Bitcoin payment to the address
- After sending, EMAIL a screenshot of your payment confirmation to {SHOP_OWNER_EMAIL}
- Include your unique purchase code in the email: {purchaseCode}

Your purchase code is essential for tracking your order and linking your payment.

📺 Need help with Bitcoin?
- Cash App Tutorial: https://www.youtube.com/watch?v=fDjDH_WAvYI
- Coinbase Tutorial: https://www.youtube.com/watch?v=Vhspj-KHYWs
```

### 6.3 Service Portal Credentials Email

#### Customer Credentials Email
```
Thank you for your purchase from Inferno TV!

Here is your permanent streaming portal access:

Portal URL: {SERVICE_PORTAL_URL}
Username: {portalUsername}
Password: {portalPassword}

Please keep this information safe. You and the shop owner both receive 
this email so your account can be set up on the service side.

[If Fire Stick order:]
Fire Stick Setup Tutorial:
YouTube: https://youtu.be/sO2Id0bXHIY?si=1FBAbzYvUViIpepS
```

#### Shop Owner Credentials Copy
```
NEW CUSTOMER PORTAL CREDENTIALS

Order Number: {orderNumber}
Customer: {customerName}
Email: {customerEmail}

Portal URL: {SERVICE_PORTAL_URL}
Username: {portalUsername}
Password: {portalPassword}

[If Fire Stick order:]
Fire Stick Setup Tutorial:
YouTube: https://youtu.be/sO2Id0bXHIY?si=1FBAbzYvUViIpepS

Use these credentials to configure their access on {SERVICE_PORTAL_URL}.
```

---

## 7. PRODUCT DETAILS IN EMAILS

### 7.1 Required Product Information

#### For Each Product in Email
1. **Product Name**: Full product name as stored in database
2. **Quantity**: Number of units ordered
3. **Unit Price**: Price per unit
4. **Total Price**: Quantity × Unit Price
5. **Product Link**: URL to product page on website

#### Product Link Format in Email
```html
<!-- For each product, include a clickable link -->
<div class="product-item">
  <h3>{product_name}</h3>
  <p>Quantity: {quantity}</p>
  <p>Price: ${unit_price} × {quantity} = ${total_price}</p>
  <a href="{baseUrl}/shop#{product-slug}">View Product Details</a>
</div>
```

### 7.2 Product Image in Emails

#### Image URL Structure
- **Source**: `main_image` or `image_url` field from product table
- **Format**: Full URL (absolute path)
- **Example**: `https://streamstickpro.com/images/fire-stick-4k-max.jpg`

#### Email Image Implementation
```html
<img 
  src="{product_image_url}" 
  alt="{product_name}"
  style="max-width: 300px; height: auto; border-radius: 8px;"
/>
```

### 7.3 Product Description in Emails

#### Short Description
- **Source**: `short_description` field from `real_products` table
- **Length**: Typically 100-200 characters
- **Purpose**: Brief product overview in email

#### Full Description Link
- **Location**: Product page link in email
- **Source**: `description` field from `real_products` table
- **Access**: Customer clicks product link to view full details

---

## 8. URL BUILDING FOR EMAIL GENERATOR

### 8.1 Base URL Detection

#### Implementation
```javascript
// Get base URL dynamically
const getBaseUrl = () => {
  // Use window.location.origin for client-side
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for server-side (edge functions)
  return process.env.VITE_SITE_URL || 'https://streamstickpro.com';
};
```

### 8.2 Product URL Builder Function

#### Complete URL Builder
```javascript
/**
 * Builds a complete product URL for use in emails
 * @param {Object} product - Product object from database
 * @param {string} baseUrl - Base website URL
 * @returns {string} Complete product URL
 */
function buildProductUrl(product, baseUrl) {
  // Generate slug from product name
  const slug = product.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // Build complete URL
  return `${baseUrl}/shop#${slug}`;
}

// Usage in email generation
const productUrl = buildProductUrl(product, getBaseUrl());
```

### 8.3 Order Tracking URL Builder

#### Implementation
```javascript
/**
 * Builds order tracking URL
 * @param {string} orderCode - Unique order code
 * @param {string} baseUrl - Base website URL
 * @returns {string} Order tracking URL
 */
function buildOrderTrackingUrl(orderCode, baseUrl) {
  return `${baseUrl}/track-order?code=${orderCode}`;
}
```

### 8.4 Secure Checkout URL Builder

#### Implementation
```javascript
/**
 * Builds secure checkout URL with optional product parameter
 * @param {string} baseUrl - Base website URL
 * @param {string} productId - Optional product ID to pre-select
 * @returns {string} Secure checkout URL
 */
function buildSecureCheckoutUrl(baseUrl, productId = null) {
  if (productId) {
    return `${baseUrl}/secure-checkout?product=${productId}`;
  }
  return `${baseUrl}/secure-checkout`;
}
```

---

## 9. INTEGRATION WITH EMAIL GENERATOR

### 9.1 Email Generator Function Signature

#### Complete Email Generator
```javascript
/**
 * Generates customer checkout confirmation email
 * @param {Object} orderData - Complete order information
 * @param {string} baseUrl - Base website URL
 * @returns {string} HTML email body
 */
async function generateCheckoutEmail(orderData, baseUrl) {
  const {
    orderNumber,
    purchaseCode,
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    username,
    items, // Array of product objects
    total,
    paymentMethod,
    btcAmount,
    btcAddress,
    cashAppTag
  } = orderData;
  
  // Build product list with links
  const productListHtml = items.map(item => {
    const productUrl = buildProductUrl(item.product, baseUrl);
    return `
      <div style="margin-bottom: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">
          <a href="${productUrl}" style="color: #f97316; text-decoration: none;">
            ${item.product_name}
          </a>
        </h3>
        <p style="margin: 5px 0; color: #6b7280;">
          Quantity: ${item.quantity} × $${item.unit_price.toFixed(2)} = 
          <strong style="color: #1f2937;">$${item.total_price.toFixed(2)}</strong>
        </p>
        <a href="${productUrl}" 
           style="display: inline-block; margin-top: 10px; padding: 8px 16px; 
                  background: #f97316; color: white; text-decoration: none; 
                  border-radius: 6px;">
          View Product Details →
        </a>
      </div>
    `;
  }).join('');
  
  // Build payment instructions
  const paymentInstructions = buildPaymentInstructions(
    paymentMethod,
    total,
    purchaseCode,
    btcAmount,
    btcAddress,
    cashAppTag
  );
  
  // Build order tracking URL
  const trackingUrl = buildOrderTrackingUrl(purchaseCode, baseUrl);
  
  // Generate complete email HTML
  return generateEmailTemplate({
    customerName,
    orderNumber,
    purchaseCode,
    customerEmail,
    customerPhone,
    customerAddress,
    username,
    productListHtml,
    total,
    paymentInstructions,
    trackingUrl,
    baseUrl
  });
}
```

### 9.2 Product Information Extraction

#### From Database to Email
```javascript
/**
 * Extracts product information for email
 * @param {Array} orderItems - Order items from database
 * @param {string} baseUrl - Base website URL
 * @returns {Array} Enhanced product information with URLs
 */
async function extractProductInfoForEmail(orderItems, baseUrl) {
  const enhancedItems = await Promise.all(
    orderItems.map(async (item) => {
      // Fetch full product details from database
      const { data: product } = await supabase
        .from('real_products')
        .select('name, slug, description, short_description, main_image, category')
        .eq('id', item.product_id)
        .single();
      
      if (product) {
        return {
          ...item,
          product: {
            ...product,
            url: buildProductUrl(product, baseUrl),
            image_url: product.main_image || null
          }
        };
      }
      
      // Fallback if product not found
      return {
        ...item,
        product: {
          name: item.product_name,
          url: `${baseUrl}/shop`,
          image_url: null
        }
      };
    })
  );
  
  return enhancedItems;
}
```

---

## 10. SECURE CHECKOUT PAGE PRODUCT INTEGRATION

### 10.1 Products on Secure Checkout Page

#### Why Products Appear
1. **Service-Based Products**: Secure checkout is designed for service subscriptions and digital products
2. **Square Payment Integration**: Products are configured specifically for Square payment processing
3. **Streamlined Experience**: Direct product selection without cart for faster checkout
4. **Professional Services**: Focus on IPTV subscriptions, setup services, and professional consultations

#### Product Source
- **Table**: `square_products`
- **Filter**: `is_active = true`
- **Order**: By price (ascending)

### 10.2 Product Linking from Secure Checkout

#### Product URL in Secure Checkout Context
```javascript
// When product is selected on secure checkout
const selectedProduct = {
  id: 'product-uuid',
  name: 'IPTV 12-Month Subscription',
  price: '99.99',
  // ... other fields
};

// Product link for email
const productUrl = `${baseUrl}/secure-checkout?product=${selectedProduct.id}`;
```

#### Email Reference to Secure Checkout Product
```html
<!-- In email, reference the secure checkout product -->
<div class="product-reference">
  <p>You purchased: <strong>{product_name}</strong></p>
  <p>View this product: 
    <a href="{baseUrl}/secure-checkout?product={product_id}">
      {product_name} on Secure Checkout
    </a>
  </p>
</div>
```

---

## 11. COMPLETE EMAIL TEMPLATE WITH PRODUCT LINKS

### 11.1 HTML Email Template Structure

#### Full Email Template
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #f97316;
    }
    .product-item {
      background: white;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .product-item img {
      max-width: 100px;
      height: auto;
      border-radius: 6px;
      margin-right: 15px;
      float: left;
    }
    .product-link {
      display: inline-block;
      margin-top: 10px;
      padding: 8px 16px;
      background: #f97316;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
    }
    .code-box {
      background: white;
      border: 3px solid #f97316;
      padding: 20px;
      text-align: center;
      border-radius: 10px;
      margin: 20px 0;
    }
    .code {
      font-size: 32px;
      font-weight: bold;
      color: #f97316;
      font-family: monospace;
      letter-spacing: 2px;
    }
    .footer {
      background: #1f2937;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 Stream Stick Pro</h1>
      <h2>Order Confirmation</h2>
    </div>
    
    <div class="content">
      <p>Hi <strong>{customerName}</strong>,</p>
      <p>Thank you for your order! We've received your order and are processing it now.</p>
      
      <!-- Purchase Code Section -->
      <div class="code-box">
        <p style="margin: 0 0 10px 0; font-weight: bold;">YOUR UNIQUE PURCHASE CODE</p>
        <div class="code">{purchaseCode}</div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
          Keep this code safe! You'll need it for payment and order tracking.
        </p>
      </div>
      
      <!-- Order Details Section -->
      <div class="section">
        <h2 style="margin-top: 0; color: #1f2937;">Order Details</h2>
        <p><strong>Order Number:</strong> {orderNumber}</p>
        <p><strong>Customer:</strong> {customerName}</p>
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Email:</strong> {customerEmail}</p>
        <p><strong>Phone:</strong> {customerPhone}</p>
        <p><strong>Shipping Address:</strong> {customerAddress}</p>
        <p>
          <a href="{trackingUrl}" style="color: #f97316; text-decoration: none; font-weight: bold;">
            Track Your Order →
          </a>
        </p>
      </div>
      
      <!-- Products Ordered Section -->
      <div class="section">
        <h2 style="margin-top: 0; color: #1f2937;">Items Ordered</h2>
        {productListHtml}
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="text-align: right; font-size: 24px; font-weight: bold; color: #1f2937;">
            TOTAL: ${total}
          </p>
        </div>
      </div>
      
      <!-- Payment Instructions Section -->
      <div class="section">
        <h2 style="margin-top: 0; color: #1f2937;">Payment Instructions</h2>
        {paymentInstructions}
      </div>
      
      <!-- Support Section -->
      <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 30px;">
        <p style="margin: 0; color: #92400e;">
          <strong>Need Support?</strong><br>
          Email us at: <a href="mailto:{SHOP_OWNER_EMAIL}" style="color: #f97316;">{SHOP_OWNER_EMAIL}</a>
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p>© {currentYear} Stream Stick Pro. All rights reserved.</p>
      <p>
        <a href="{baseUrl}" style="color: #9ca3af;">Visit Our Website</a> | 
        <a href="{baseUrl}/shop" style="color: #9ca3af;">Shop Products</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 12. IMPLEMENTATION CHECKLIST

### 12.1 Email Generator Requirements

- [ ] Implement base URL detection (client-side and server-side)
- [ ] Create product URL builder function
- [ ] Create order tracking URL builder function
- [ ] Create secure checkout URL builder function
- [ ] Extract product information from database with full details
- [ ] Generate product links for each item in order
- [ ] Include product images in email (if available)
- [ ] Format product list with clickable links
- [ ] Include purchase code prominently
- [ ] Include payment method-specific instructions
- [ ] Include order tracking link
- [ ] Include support contact information
- [ ] Test email rendering across email clients
- [ ] Verify all URLs are absolute (not relative)
- [ ] Ensure product links point to correct product pages

### 12.2 Product Information Requirements

- [ ] Product name (from `real_products.name` or `square_products.name`)
- [ ] Product description or short description
- [ ] Product price (unit price and total)
- [ ] Product quantity
- [ ] Product image URL (if available)
- [ ] Product category
- [ ] Product page URL (`/shop#{slug}` or `/secure-checkout?product={id}`)
- [ ] Product SKU (if available)

### 12.3 URL Requirements

- [ ] All URLs must be absolute (include protocol and domain)
- [ ] Product URLs must use correct slug format
- [ ] Order tracking URLs must include order code parameter
- [ ] Secure checkout URLs must include product ID if applicable
- [ ] Base URL must be dynamically detected or configured
- [ ] URLs must work in both development and production environments

---

## 13. CONFIGURATION VALUES

### 13.1 Payment Gateway Configuration

```javascript
const CASH_APP_TAG = '$starevan11';
const BITCOIN_ADDRESS = 'bc1q448jm49ypzwsrrk75c974uqla28k0kmnx6w95r';
const SHOP_OWNER_EMAIL = 'reloadedfiretvteam@gmail.com';
const SERVICE_PORTAL_URL = 'http://ky-tv.cc';
```

### 13.2 URL Configuration

```javascript
// Base URLs (detected dynamically)
const BASE_URL = window.location.origin; // Client-side
const BASE_URL_SERVER = process.env.VITE_SITE_URL || 'https://streamstickpro.com'; // Server-side

// Route Paths
const SHOP_PATH = '/shop';
const CHECKOUT_PATH = '/checkout';
const SECURE_CHECKOUT_PATH = '/secure-checkout';
const TRACK_ORDER_PATH = '/track-order';
const ORDER_SUCCESS_PATH = '/order-success';
```

---

## 14. TESTING REQUIREMENTS

### 14.1 Email Testing Checklist

- [ ] Test email generation with single product order
- [ ] Test email generation with multiple products order
- [ ] Test email generation with Cash App payment method
- [ ] Test email generation with Bitcoin payment method
- [ ] Verify all product links are clickable and correct
- [ ] Verify product images display correctly (if included)
- [ ] Verify purchase code is prominently displayed
- [ ] Verify order tracking link works
- [ ] Test email rendering in Gmail
- [ ] Test email rendering in Outlook
- [ ] Test email rendering in Apple Mail
- [ ] Verify mobile email client rendering
- [ ] Test with products from `real_products` table
- [ ] Test with products from `square_products` table
- [ ] Verify secure checkout product links work correctly

### 14.2 URL Testing Checklist

- [ ] Test product URL generation with various product names
- [ ] Test product URL generation with special characters
- [ ] Test order tracking URL with valid order code
- [ ] Test secure checkout URL with product ID
- [ ] Test secure checkout URL without product ID
- [ ] Verify URLs work in development environment
- [ ] Verify URLs work in production environment
- [ ] Test URL generation with different base URLs
- [ ] Verify product slugs are URL-safe

---

## 15. SUMMARY

This comprehensive prompt document provides:

1. **Complete Email System Architecture**: Understanding of how emails are generated and stored
2. **URL Building System**: Detailed URL generation for products, orders, and checkout pages
3. **Product Information Structure**: Complete product data structure from database to email
4. **Secure Checkout Integration**: Why and how products appear on secure checkout page
5. **Product Linking**: Where and how products are linked on the real website pages
6. **Email Template**: Complete HTML email template with product links
7. **Implementation Guide**: Step-by-step checklist for implementation
8. **Testing Requirements**: Comprehensive testing checklist

### Key Points for Email Generator:

- **Base URL**: Always use `window.location.origin` (client) or environment variable (server)
- **Product URLs**: Format as `{baseUrl}/shop#{product-slug}`
- **Product Slug**: Generate from product name: lowercase, replace spaces with hyphens, remove special chars
- **Order Tracking**: Format as `{baseUrl}/track-order?code={orderCode}`
- **Secure Checkout**: Format as `{baseUrl}/secure-checkout?product={productId}`
- **Product Info**: Include name, price, quantity, total, image (if available), and clickable link
- **Email Format**: HTML with inline CSS for maximum compatibility

This document serves as the complete specification for implementing the checkout email system with proper URL generation and product linking.

