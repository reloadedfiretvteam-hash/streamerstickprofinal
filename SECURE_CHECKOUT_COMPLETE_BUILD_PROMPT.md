# COMPLETE SECURE CHECKOUT PAGE BUILD PROMPT

## OVERVIEW
This document provides a comprehensive, detailed prompt for building the secure checkout page system, including product configurations, checkout flow, order processing, URL generation, and email automation. Use this prompt with an AI assistant to build the complete system.

---

## PART 1: PRODUCT CONFIGURATIONS FOR SECURE CHECKOUT

### 1.1 Product Database Schema

#### `square_products` Table Structure
```sql
CREATE TABLE square_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  real_product_id uuid REFERENCES real_products(id),
  name text NOT NULL,
  description text NOT NULL,
  short_description text,
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  image_url text,
  category text DEFAULT 'Digital Services',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 1.2 UPDATED PRODUCT DESCRIPTIONS (Website Tools & AI Tools Theme)

#### Content Services (IPTV Subscriptions Mapped)

**Product 1: AI Content Research Assistant - 1 Month**
```javascript
{
  name: "AI Content Research Assistant - 1 Month",
  description: "Advanced AI-powered content research tool with real-time trend analysis. Get instant access to trending topics, competitor content analysis, keyword insights, and automated content recommendations. Includes AI-powered content gap analysis, SERP research, and personalized content strategy suggestions. Perfect for content creators, bloggers, and marketers who need intelligent content planning tools. Features: Real-time trend tracking, AI content suggestions, competitor analysis dashboard, keyword research tools, content performance predictions.",
  short_description: "AI-powered content research tool with trend analysis and automated recommendations",
  price: 15.00,
  category: "AI Tools",
  is_active: true,
  sort_order: 1
}
```

**Product 2: AI Content Strategy Suite - 3 Months**
```javascript
{
  name: "AI Content Strategy Suite - 3 Months",
  description: "Comprehensive AI content strategy platform with advanced analytics and automation. Includes AI-powered content planning, automated competitor monitoring, trend prediction algorithms, content performance analytics, and personalized strategy recommendations. Features intelligent content scheduling, multi-platform content optimization, AI writing assistance, and automated A/B testing suggestions. Includes monthly strategy reports with AI-generated insights and recommendations. Perfect for businesses building their content marketing presence with data-driven strategies.",
  short_description: "3-month AI content strategy platform with analytics and automated planning tools",
  price: 25.00,
  category: "AI Tools",
  is_active: true,
  sort_order: 2
}
```

**Product 3: Enterprise AI Content Platform - 6 Months**
```javascript
{
  name: "Enterprise AI Content Platform - 6 Months",
  description: "Enterprise-grade AI content management and automation platform. Full access to advanced AI tools including content generation assistance, automated SEO optimization, intelligent content distribution, AI-powered analytics dashboard, and predictive content performance modeling. Features include: Multi-language content support, AI content personalization, automated content scheduling across platforms, advanced analytics with AI insights, team collaboration tools, and API access for custom integrations. Includes priority support, custom AI model training, and dedicated account management.",
  short_description: "6-month enterprise AI content platform with automation and advanced analytics",
  price: 40.00,
  category: "AI Tools",
  is_active: true,
  sort_order: 3
}
```

**Product 4: Premium AI Content Intelligence Suite - 1 Year**
```javascript
{
  name: "Premium AI Content Intelligence Suite - 1 Year",
  description: "Annual subscription to our premium AI-powered content intelligence and automation platform. Complete suite of AI tools including: Advanced content generation AI, predictive analytics engine, automated content optimization, intelligent content distribution, multi-platform management, AI-powered competitor intelligence, real-time trend analysis, and personalized content roadmaps. Features enterprise-grade security, unlimited API access, custom AI model training, white-label options, dedicated support team, monthly strategy consultations, and custom research reports. Best value for agencies, content teams, and businesses serious about AI-driven content marketing success.",
  short_description: "1-year premium AI content intelligence suite with full automation and enterprise features",
  price: 70.00,
  category: "AI Tools",
  is_active: true,
  sort_order: 4
}
```

#### Web Development Services (Fire Sticks Mapped)

**Product 5: Professional Website Page Builder & Design Tool**
```javascript
{
  name: "Professional Website Page Builder & Design Tool",
  description: "Complete website page design and development tool with drag-and-drop builder. Create custom, responsive web pages with modern design templates, mobile optimization tools, SEO-friendly structure builder, and professional implementation features. Includes: Visual page builder, responsive design preview, SEO optimization tools, performance analytics, code export options, and integration with popular CMS platforms. Perfect for adding new pages to existing sites or creating standalone landing pages. Includes 1 round of design revisions, basic SEO optimization, and mobile responsiveness testing.",
  short_description: "Professional website page builder with drag-and-drop design tools and SEO optimization",
  price: 140.00,
  category: "Website Tools",
  is_active: true,
  sort_order: 5
}
```

**Product 6: Website Builder + AI SEO Optimization Suite - 1 Month**
```javascript
{
  name: "Website Builder + AI SEO Optimization Suite - 1 Month",
  description: "Complete website page builder with integrated AI-powered SEO optimization tools. Includes visual page builder, AI keyword research, automated meta tag optimization, on-page SEO analysis, performance monitoring dashboard, and AI-generated content suggestions. Features: Real-time SEO scoring, automated optimization recommendations, competitor SEO analysis, AI content optimization, mobile performance testing, and monthly SEO performance reports. Our AI tools analyze your page and provide intelligent recommendations for maximum search visibility. Includes 1 month of ongoing optimization and monitoring.",
  short_description: "Website builder with 1 month of AI-powered SEO optimization and monitoring tools",
  price: 150.00,
  category: "Website Tools",
  is_active: true,
  sort_order: 6
}
```

**Product 7: Website Builder + Advanced AI SEO Platform - 6 Months**
```javascript
{
  name: "Website Builder + Advanced AI SEO Platform - 6 Months",
  description: "Premium website page builder with 6 months of comprehensive AI-powered SEO strategy and optimization. Includes visual page builder, advanced AI SEO tools, automated keyword research, intelligent content optimization, performance tracking dashboard, monthly SEO reports, and AI-driven strategy adjustments. Features: Predictive SEO analytics, AI content recommendations, automated technical SEO fixes, competitor intelligence, backlink analysis tools, and personalized SEO roadmaps. Our AI platform provides long-term SEO support with machine learning algorithms that adapt to search engine updates. Best value for businesses serious about search visibility and organic traffic growth.",
  short_description: "Website builder with 6 months of advanced AI SEO platform and strategy tools",
  price: 160.00,
  category: "Website Tools",
  is_active: true,
  sort_order: 7
}
```

---

## PART 2: SECURE CHECKOUT PAGE BUILD INSTRUCTIONS

### 2.1 Page Structure & Layout

#### File Location
- **Component File**: `src/pages/SecureCheckoutPage.tsx`
- **Route**: `/secure-checkout`
- **Product Source**: `square_products` table from Supabase

#### Page States
The page has three main states:
1. **Loading State**: Shows loading spinner while fetching products
2. **Product Selection State**: Displays products in grid layout
3. **Checkout State**: Shows payment form and customer information
4. **Success State**: Shows order confirmation

### 2.2 Product Selection Page Design

#### Header Section
```tsx
<nav className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-2xl font-bold text-slate-800">Secure Checkout</span>
          <p className="text-xs text-slate-500">Professional Services</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Lock className="w-4 h-4" />
        <span>SSL Encrypted</span>
      </div>
    </div>
  </div>
</nav>
```

#### Hero Section
```tsx
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

#### Products Grid
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {products.map((product) => (
    <div
      key={product.id}
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all 
                 border border-slate-200 overflow-hidden transform hover:scale-105"
    >
      {/* Product Image */}
      <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full 
                           text-xs font-bold text-blue-600">
            {product.category}
          </span>
        </div>
      </div>
      
      {/* Product Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {product.name}
        </h3>
        <p className="text-slate-600 mb-4 min-h-[60px] text-sm">
          {product.description}
        </p>
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="text-3xl font-bold text-slate-800">
              ${product.price}
            </span>
          </div>
        </div>
        <button
          onClick={() => handleSelectProduct(product)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 
                     hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 
                     rounded-lg font-semibold transition-all shadow-md hover:shadow-lg 
                     flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          Select & Checkout
        </button>
      </div>
    </div>
  ))}
</div>
```

### 2.3 Checkout Form Design

#### Two-Column Layout
```tsx
<div className="grid lg:grid-cols-3 gap-8">
  {/* Left Column: Order Summary & Customer Info (1/3 width) */}
  <div className="lg:col-span-1 space-y-6">
    {/* Order Summary Card */}
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-600" />
        Order Summary
      </h2>
      {selectedProduct && (
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            {selectedProduct.image_url && (
              <img
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800">{selectedProduct.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{selectedProduct.description}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <span className="text-lg font-bold text-slate-800">Total</span>
            <span className="text-2xl font-bold text-blue-600">${selectedProduct.price}</span>
          </div>
        </div>
      )}
    </div>
    
    {/* Customer Information Form */}
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-600" />
        Contact Information
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  </div>
  
  {/* Right Column: Payment Methods (2/3 width) */}
  <div className="lg:col-span-2">
    {/* Payment Method Selection */}
    {/* Square, Bitcoin, Cash App options */}
  </div>
</div>
```

### 2.4 Payment Method Selection

#### Payment Options
```tsx
<div className="grid md:grid-cols-3 gap-4 mb-8">
  {/* Square Payment */}
  <button
    onClick={() => setPaymentMethod('square')}
    className={`p-6 border-2 rounded-xl transition-all text-left ${
      paymentMethod === 'square'
        ? 'border-blue-600 bg-blue-50'
        : 'border-slate-200 hover:border-blue-300'
    }`}
  >
    <CreditCard className={`w-6 h-6 ${paymentMethod === 'square' ? 'text-blue-600' : 'text-slate-400'}`} />
    <span className="font-bold text-slate-800">Credit/Debit Card</span>
    <p className="text-sm text-slate-600">Secure payment via Square</p>
  </button>
  
  {/* Bitcoin Payment */}
  <button
    onClick={() => setPaymentMethod('bitcoin')}
    className={`p-6 border-2 rounded-xl transition-all text-left ${
      paymentMethod === 'bitcoin'
        ? 'border-orange-600 bg-orange-50'
        : 'border-slate-200 hover:border-orange-300'
    }`}
  >
    <Bitcoin className={`w-6 h-6 ${paymentMethod === 'bitcoin' ? 'text-orange-600' : 'text-slate-400'}`} />
    <span className="font-bold text-slate-800">Bitcoin (BTC)</span>
    <p className="text-sm text-slate-600">Pay with cryptocurrency</p>
  </button>
  
  {/* Cash App Payment */}
  <button
    onClick={() => setPaymentMethod('cashapp')}
    className={`p-6 border-2 rounded-xl transition-all text-left ${
      paymentMethod === 'cashapp'
        ? 'border-green-600 bg-green-50'
        : 'border-slate-200 hover:border-green-300'
    }`}
  >
    <DollarSign className={`w-6 h-6 ${paymentMethod === 'cashapp' ? 'text-green-600' : 'text-slate-400'}`} />
    <span className="font-bold text-slate-800">Cash App</span>
    <p className="text-sm text-slate-600">Send payment via Cash App</p>
  </button>
</div>
```

---

## PART 3: COMPLETE ORDER PROCESS FLOW

### 3.1 Order Creation Process

#### Step-by-Step Flow

**Step 1: Customer Selects Product**
```typescript
function handleSelectProduct(product: Product) {
  setSelectedProduct(product);
  setStep('checkout');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
```

**Step 2: Customer Fills Out Information**
- Customer enters: Name, Email, Phone (optional)
- Product is already selected
- Payment method is chosen

**Step 3: Payment Processing**

#### For Square Payment:
```typescript
async function handleSquarePayment(token: string) {
  // 1. Create order in database
  const orderData = {
    customer_name: customerInfo.name,
    customer_email: customerInfo.email,
    customer_phone: customerInfo.phone || '',
    product_id: selectedProduct.id,
    product_name: selectedProduct.name,
    product_price: parseFloat(selectedProduct.price),
    payment_method: 'square',
    payment_status: 'completed',
    order_status: 'pending',
    total: parseFloat(selectedProduct.price),
    order_code: generateOrderCode(), // Generate unique order code
    created_at: new Date().toISOString()
  };
  
  // 2. Insert order into database
  const { data: order, error } = await supabase
    .from('square_orders')
    .insert([orderData])
    .select()
    .single();
  
  if (error) throw error;
  
  // 3. Generate order tracking URL
  const trackingUrl = `${window.location.origin}/track-order?code=${order.order_code}`;
  
  // 4. Send confirmation emails
  await sendOrderConfirmationEmail(order, trackingUrl);
  
  // 5. Show success page
  setStep('success');
}
```

#### For Bitcoin Payment:
```typescript
async function createBitcoinPayment() {
  // 1. Generate unique order code
  const orderCode = generateOrderCode();
  
  // 2. Calculate Bitcoin amount
  const btcPrice = await fetchBitcoinPrice();
  const btcAmount = (totalAmount / btcPrice).toFixed(8);
  
  // 3. Create Bitcoin payment (NOWPayments or manual)
  const paymentData = await createNOWPayment({
    amount: totalAmount,
    orderCode: orderCode,
    customerEmail: customerInfo.email
  });
  
  // 4. Create order in database
  const orderData = {
    order_code: orderCode,
    customer_name: customerInfo.name,
    customer_email: customerInfo.email,
    customer_phone: customerInfo.phone || '',
    product_id: selectedProduct.id,
    product_name: selectedProduct.name,
    total_usd: totalAmount,
    total_btc: parseFloat(btcAmount),
    bitcoin_address: paymentData.pay_address,
    payment_status: 'pending',
    order_status: 'pending',
    nowpayments_invoice_id: paymentData.payment_id,
    nowpayments_payment_url: paymentData.invoice_url
  };
  
  const { data: order } = await supabase
    .from('bitcoin_orders')
    .insert([orderData])
    .select()
    .single();
  
  // 5. Generate tracking URL
  const trackingUrl = `${window.location.origin}/track-order?code=${orderCode}`;
  
  // 6. Send payment instructions email
  await sendBitcoinPaymentEmail(order, trackingUrl);
  
  // 7. Show payment instructions
  setPaymentCreated(true);
}
```

#### For Cash App Payment:
```typescript
async function handleCashAppPayment() {
  // 1. Generate order code
  const orderCode = generateOrderCode();
  
  // 2. Create order in database
  const orderData = {
    order_code: orderCode,
    customer_name: customerInfo.name,
    customer_email: customerInfo.email,
    customer_phone: customerInfo.phone || '',
    product_id: selectedProduct.id,
    product_name: selectedProduct.name,
    total: parseFloat(selectedProduct.price),
    payment_method: 'cashapp',
    payment_status: 'pending',
    order_status: 'pending'
  };
  
  const { data: order } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single();
  
  // 3. Generate tracking URL
  const trackingUrl = `${window.location.origin}/track-order?code=${orderCode}`;
  
  // 4. Send Cash App payment instructions email
  await sendCashAppPaymentEmail(order, trackingUrl);
  
  // 5. Show payment instructions
  setPaymentCreated(true);
}
```

### 3.2 Order Code Generation

#### Function Implementation
```typescript
function generateOrderCode(): string {
  // Format: SEC-{timestamp}-{random}
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SEC-${timestamp}-${random}`;
  
  // Example output: SEC-LXK9M2N-ABC12
}
```

### 3.3 URL Generation System

#### Base URL Detection
```typescript
function getBaseUrl(): string {
  // Client-side: Use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side: Use environment variable
  return process.env.VITE_SITE_URL || 'https://streamstickpro.com';
}
```

#### Order Tracking URL Builder
```typescript
function buildOrderTrackingUrl(orderCode: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/track-order?code=${orderCode}`;
  
  // Example: https://streamstickpro.com/track-order?code=SEC-LXK9M2N-ABC12
}
```

#### Product URL Builder (for emails)
```typescript
function buildProductUrl(product: Product): string {
  const baseUrl = getBaseUrl();
  const slug = product.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `${baseUrl}/secure-checkout?product=${product.id}`;
  
  // Example: https://streamstickpro.com/secure-checkout?product=abc-123-def
}
```

---

## PART 4: EMAIL GENERATION SYSTEM

### 4.1 Email Generation Flow

#### After Order Creation
When an order is successfully created, the system must:

1. **Generate Order Code** (if not already generated)
2. **Create Order Tracking URL**
3. **Generate Product URL** (for product link in email)
4. **Build Email Content** with all URLs
5. **Send Email via Edge Function** or log to `email_logs` table

### 4.2 Email Content Generation

#### Customer Order Confirmation Email

**Function Signature:**
```typescript
async function sendOrderConfirmationEmail(
  order: Order,
  trackingUrl: string
): Promise<void>
```

**Email Template Structure:**
```typescript
function generateOrderConfirmationEmail(
  order: Order,
  trackingUrl: string,
  productUrl: string
): string {
  const baseUrl = getBaseUrl();
  
  return `
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
    .product-item {
      background: white;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
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
      <p>Hi <strong>${order.customer_name}</strong>,</p>
      <p>Thank you for your order! We've received your order and are processing it now.</p>
      
      <!-- Order Code -->
      <div class="code-box">
        <p style="margin: 0 0 10px 0; font-weight: bold;">YOUR UNIQUE ORDER CODE</p>
        <div class="code">${order.order_code}</div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
          Keep this code safe! Use it to track your order.
        </p>
      </div>
      
      <!-- Order Details -->
      <div class="section">
        <h2 style="margin-top: 0; color: #1f2937;">Order Details</h2>
        <p><strong>Order Code:</strong> ${order.order_code}</p>
        <p><strong>Customer:</strong> ${order.customer_name}</p>
        <p><strong>Email:</strong> ${order.customer_email}</p>
        <p><strong>Phone:</strong> ${order.customer_phone || 'Not provided'}</p>
        <p>
          <a href="${trackingUrl}" style="color: #f97316; text-decoration: none; font-weight: bold;">
            Track Your Order →
          </a>
        </p>
      </div>
      
      <!-- Product Ordered -->
      <div class="section">
        <h2 style="margin-top: 0; color: #1f2937;">Service Ordered</h2>
        <div class="product-item">
          <h3 style="margin: 0 0 10px 0; color: #1f2937;">
            <a href="${productUrl}" style="color: #f97316; text-decoration: none;">
              ${order.product_name}
            </a>
          </h3>
          <p style="margin: 5px 0; color: #6b7280;">
            Price: <strong style="color: #1f2937;">$${order.total.toFixed(2)}</strong>
          </p>
          <a href="${productUrl}" class="product-link">
            View Service Details →
          </a>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
          <p style="text-align: right; font-size: 24px; font-weight: bold; color: #1f2937;">
            TOTAL: $${order.total.toFixed(2)}
          </p>
        </div>
      </div>
      
      <!-- Payment Instructions (if pending) -->
      ${order.payment_status === 'pending' ? generatePaymentInstructions(order) : ''}
      
      <!-- Support Section -->
      <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 30px;">
        <p style="margin: 0; color: #92400e;">
          <strong>Need Support?</strong><br>
          Email us at: <a href="mailto:reloadedfiretvteam@gmail.com" style="color: #f97316;">reloadedfiretvteam@gmail.com</a>
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Stream Stick Pro. All rights reserved.</p>
      <p>
        <a href="${baseUrl}" style="color: #9ca3af;">Visit Our Website</a> | 
        <a href="${baseUrl}/secure-checkout" style="color: #9ca3af;">View Services</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
```

### 4.3 Payment-Specific Email Instructions

#### Bitcoin Payment Instructions
```typescript
function generateBitcoinPaymentInstructions(order: Order): string {
  return `
<div class="section">
  <h2 style="margin-top: 0; color: #1f2937;">Bitcoin Payment Instructions</h2>
  <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
    <p><strong>Bitcoin Amount:</strong> <span style="font-family: monospace; font-size: 18px; color: #f97316;">${order.total_btc} BTC</span></p>
    <p><strong>Bitcoin Address:</strong></p>
    <p style="font-family: monospace; font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${order.bitcoin_address}</p>
  </div>
  <ol style="color: #6b7280; line-height: 1.8;">
    <li>Copy the Bitcoin address and exact amount shown above</li>
    <li>Send your Bitcoin payment to the address</li>
    <li>After sending, email a screenshot of your payment confirmation to reloadedfiretvteam@gmail.com</li>
    <li>Include your order code: <strong>${order.order_code}</strong> in the email</li>
  </ol>
  <p style="margin-top: 15px;">
    <a href="${order.nowpayments_payment_url}" style="color: #f97316; text-decoration: none; font-weight: bold;">
      Or pay via NOWPayments Invoice →
    </a>
  </p>
</div>
  `;
}
```

#### Cash App Payment Instructions
```typescript
function generateCashAppPaymentInstructions(order: Order): string {
  return `
<div class="section">
  <h2 style="margin-top: 0; color: #1f2937;">Cash App Payment Instructions</h2>
  <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
    <p><strong>Send payment to:</strong></p>
    <p style="font-family: monospace; font-size: 24px; color: #10b981; font-weight: bold;">$starevan11</p>
    <p><strong>Amount:</strong> <span style="font-size: 20px; font-weight: bold;">$${order.total.toFixed(2)}</span></p>
  </div>
  <ol style="color: #6b7280; line-height: 1.8;">
    <li>Open your Cash App</li>
    <li>Send $${order.total.toFixed(2)} to <strong>$starevan11</strong></li>
    <li>In the "What's it for" field, enter your order code: <strong>${order.order_code}</strong></li>
    <li>Complete the payment</li>
  </ol>
  <p style="margin-top: 15px; color: #dc2626; font-weight: bold;">
    ⚠️ IMPORTANT: Include your order code in the payment note!
  </p>
</div>
  `;
}
```

### 4.4 Email Sending Implementation

#### Using Supabase Edge Function
```typescript
async function sendOrderConfirmationEmail(
  order: Order,
  trackingUrl: string
): Promise<void> {
  const productUrl = buildProductUrl(order.product);
  
  // Generate email HTML
  const emailHtml = generateOrderConfirmationEmail(order, trackingUrl, productUrl);
  
  // Send via edge function
  await supabase.functions.invoke('send-order-emails', {
    body: {
      to: order.customer_email,
      subject: `Order Confirmation - ${order.order_code}`,
      html: emailHtml,
      orderCode: order.order_code,
      trackingUrl: trackingUrl
    }
  });
}
```

#### Alternative: Log to email_logs Table
```typescript
async function logOrderConfirmationEmail(
  order: Order,
  trackingUrl: string
): Promise<void> {
  const productUrl = buildProductUrl(order.product);
  const emailHtml = generateOrderConfirmationEmail(order, trackingUrl, productUrl);
  
  await supabase.from('email_logs').insert({
    recipient: order.customer_email,
    template_key: 'order_confirmation',
    subject: `Order Confirmation - ${order.order_code}`,
    body: emailHtml,
    status: 'pending',
    metadata: {
      order_code: order.order_code,
      tracking_url: trackingUrl,
      product_url: productUrl
    }
  });
}
```

### 4.5 Admin Notification Email

#### Shop Owner Email
```typescript
function generateAdminNotificationEmail(order: Order): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #dc2626;">🛒 NEW ORDER RECEIVED</h2>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Order Details</h3>
      <p><strong>Order Code:</strong> ${order.order_code}</p>
      <p><strong>Payment Method:</strong> ${order.payment_method}</p>
      <p><strong>Payment Status:</strong> ${order.payment_status}</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
    </div>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${order.customer_name}</p>
      <p><strong>Email:</strong> ${order.customer_email}</p>
      <p><strong>Phone:</strong> ${order.customer_phone || 'Not provided'}</p>
    </div>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Product Ordered</h3>
      <p><strong>Service:</strong> ${order.product_name}</p>
      <p><strong>Price:</strong> $${order.total.toFixed(2)}</p>
    </div>
    
    <p style="margin-top: 30px;">
      <a href="${getBaseUrl()}/admin/orders" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
        View Order in Admin Panel
      </a>
    </p>
  </div>
</body>
</html>
  `;
}
```

---

## PART 5: COMPLETE IMPLEMENTATION CHECKLIST

### 5.1 Database Setup
- [ ] Create `square_products` table with all fields
- [ ] Insert all 7 products with updated descriptions
- [ ] Create `square_orders` table for Square payments
- [ ] Create `bitcoin_orders` table for Bitcoin payments
- [ ] Create `orders` table for Cash App payments
- [ ] Create `email_logs` table for email tracking
- [ ] Set up RLS policies for all tables

### 5.2 Secure Checkout Page
- [ ] Build product selection page with grid layout
- [ ] Implement product card design with hover effects
- [ ] Add category badges to products
- [ ] Create checkout form with customer information
- [ ] Implement payment method selection (Square, Bitcoin, Cash App)
- [ ] Build order summary component
- [ ] Create success page after payment
- [ ] Add loading states and error handling

### 5.3 Order Processing
- [ ] Implement order code generation function
- [ ] Create order creation logic for each payment method
- [ ] Build URL generation functions (base URL, tracking URL, product URL)
- [ ] Implement order tracking page
- [ ] Add order status updates

### 5.4 Email System
- [ ] Create email template generator functions
- [ ] Build order confirmation email template
- [ ] Create payment-specific instruction emails
- [ ] Implement admin notification email
- [ ] Set up email sending via edge function or email_logs
- [ ] Add email logging and tracking

### 5.5 Testing
- [ ] Test product selection flow
- [ ] Test order creation for each payment method
- [ ] Verify URL generation (tracking, product links)
- [ ] Test email generation and sending
- [ ] Verify email content includes all URLs
- [ ] Test order tracking page with order codes
- [ ] Test responsive design on mobile/tablet/desktop

---

## PART 6: KEY CONFIGURATION VALUES

### 6.1 Payment Configuration
```typescript
const CASH_APP_TAG = '$starevan11';
const BITCOIN_ADDRESS = 'bc1q448jm49ypzwsrrk75c974uqla28k0kmnx6w95r';
const SHOP_OWNER_EMAIL = 'reloadedfiretvteam@gmail.com';
const SERVICE_PORTAL_URL = 'http://ky-tv.cc';
```

### 6.2 URL Configuration
```typescript
// Base URLs
const BASE_URL = window.location.origin; // Client-side
const BASE_URL_SERVER = process.env.VITE_SITE_URL || 'https://streamstickpro.com';

// Route Paths
const SECURE_CHECKOUT_PATH = '/secure-checkout';
const TRACK_ORDER_PATH = '/track-order';
const ORDER_SUCCESS_PATH = '/order-success';
```

---

## SUMMARY

This comprehensive prompt includes:

1. **Updated Product Descriptions**: All 7 products rewritten with Website Tools & AI Tools theme
2. **Complete Secure Checkout Page Design**: Full component structure and styling
3. **Order Processing Flow**: Step-by-step implementation for all payment methods
4. **URL Generation System**: Complete URL building functions for tracking and product links
5. **Email Generation System**: Full email templates with URLs and payment instructions
6. **Implementation Checklist**: Complete checklist for building the system

Use this prompt with an AI assistant to build the complete secure checkout system with proper URL generation and email automation.






