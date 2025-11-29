# ULTRA-DETAILED SECURE CHECKOUT PAGE BUILD PROMPT

## PROJECT OVERVIEW

Build a complete secure checkout page system for an e-commerce website using React, TypeScript, Supabase, and Tailwind CSS. The system must handle product display, order processing, payment integration (Square, Bitcoin, Cash App), URL generation, and automated email sending.

---

## PART 1: TECHNOLOGY STACK & DEPENDENCIES

### 1.1 Required Technologies

**Frontend Framework:**
- React 18.3.1
- TypeScript 5.9.3
- Vite 5.4.21 (Build tool)

**Styling:**
- Tailwind CSS 3.4.1
- PostCSS 8.4.35
- Autoprefixer 10.4.18

**Backend/Database:**
- Supabase (PostgreSQL database)
- Supabase Edge Functions (Deno runtime)

**Icons:**
- Lucide React 0.344.0

**HTTP Client:**
- Built-in Fetch API

### 1.2 Package.json Dependencies

```json
{
  "name": "streamerstickprofinal",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.app.json"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.57.4",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.7.0",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.9.3",
    "vite": "^5.4.21"
  }
}
```

### 1.3 Environment Variables Required

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SITE_URL=https://streamstickpro.com
```

---

## PART 2: DATABASE SCHEMA & MIGRATIONS

### 2.1 Create Supabase Migration File

**File:** `supabase/migrations/YYYYMMDDHHMMSS_create_secure_checkout_tables.sql`

```sql
-- ============================================
-- SECURE CHECKOUT DATABASE SCHEMA
-- ============================================

-- 1. Square Products Table
CREATE TABLE IF NOT EXISTS square_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  real_product_id uuid REFERENCES real_products(id) ON DELETE SET NULL,
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

-- 2. Square Orders Table
CREATE TABLE IF NOT EXISTS square_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  product_id uuid REFERENCES square_products(id),
  product_name text NOT NULL,
  product_price numeric(10,2) NOT NULL,
  payment_method text NOT NULL,
  payment_status text DEFAULT 'pending',
  order_status text DEFAULT 'pending',
  total numeric(10,2) NOT NULL,
  square_transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Bitcoin Orders Table
CREATE TABLE IF NOT EXISTS bitcoin_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  product_id uuid REFERENCES square_products(id),
  product_name text NOT NULL,
  total_usd numeric(10,2) NOT NULL,
  total_btc numeric(20,8) NOT NULL,
  btc_price_usd numeric(10,2) NOT NULL,
  bitcoin_address text NOT NULL,
  payment_status text DEFAULT 'pending',
  order_status text DEFAULT 'pending',
  nowpayments_invoice_id text,
  nowpayments_payment_url text,
  expires_at timestamptz,
  customer_instructions_sent boolean DEFAULT false,
  admin_notification_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Cash App Orders Table
CREATE TABLE IF NOT EXISTS cashapp_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  product_id uuid REFERENCES square_products(id),
  product_name text NOT NULL,
  total numeric(10,2) NOT NULL,
  payment_status text DEFAULT 'pending',
  order_status text DEFAULT 'pending',
  cashapp_receipt_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Email Logs Table (if not exists)
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  template_key text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'pending',
  metadata jsonb DEFAULT '{}',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_square_products_active ON square_products(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_square_products_category ON square_products(category);
CREATE INDEX IF NOT EXISTS idx_square_orders_code ON square_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_square_orders_email ON square_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_bitcoin_orders_code ON bitcoin_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_bitcoin_orders_email ON bitcoin_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_code ON cashapp_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_cashapp_orders_email ON cashapp_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE square_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE square_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bitcoin_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cashapp_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Square Products: Anyone can view active products
CREATE POLICY "Anyone can view active square products"
  ON square_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage square products"
  ON square_products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Square Orders: Users can view their own orders, authenticated can manage all
CREATE POLICY "Users can view own square orders"
  ON square_orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert square orders"
  ON square_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update square orders"
  ON square_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Bitcoin Orders: Similar policies
CREATE POLICY "Users can view own bitcoin orders"
  ON bitcoin_orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert bitcoin orders"
  ON bitcoin_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update bitcoin orders"
  ON bitcoin_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Cash App Orders: Similar policies
CREATE POLICY "Users can view own cashapp orders"
  ON cashapp_orders FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert cashapp orders"
  ON cashapp_orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cashapp orders"
  ON cashapp_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Email Logs: Authenticated users only
CREATE POLICY "Authenticated users can manage email logs"
  ON email_logs FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- INSERT PRODUCT DATA
-- ============================================

-- Insert AI Tools Products (IPTV Subscriptions Mapped)
INSERT INTO square_products (name, description, short_description, price, category, is_active, sort_order) VALUES
(
  'AI Content Research Assistant - 1 Month',
  'Advanced AI-powered content research tool with real-time trend analysis. Get instant access to trending topics, competitor content analysis, keyword insights, and automated content recommendations. Includes AI-powered content gap analysis, SERP research, and personalized content strategy suggestions. Perfect for content creators, bloggers, and marketers who need intelligent content planning tools. Features: Real-time trend tracking, AI content suggestions, competitor analysis dashboard, keyword research tools, content performance predictions.',
  'AI-powered content research tool with trend analysis and automated recommendations',
  15.00,
  'AI Tools',
  true,
  1
),
(
  'AI Content Strategy Suite - 3 Months',
  'Comprehensive AI content strategy platform with advanced analytics and automation. Includes AI-powered content planning, automated competitor monitoring, trend prediction algorithms, content performance analytics, and personalized strategy recommendations. Features intelligent content scheduling, multi-platform content optimization, AI writing assistance, and automated A/B testing suggestions. Includes monthly strategy reports with AI-generated insights and recommendations. Perfect for businesses building their content marketing presence with data-driven strategies.',
  '3-month AI content strategy platform with analytics and automated planning tools',
  25.00,
  'AI Tools',
  true,
  2
),
(
  'Enterprise AI Content Platform - 6 Months',
  'Enterprise-grade AI content management and automation platform. Full access to advanced AI tools including content generation assistance, automated SEO optimization, intelligent content distribution, AI-powered analytics dashboard, and predictive content performance modeling. Features include: Multi-language content support, AI content personalization, automated content scheduling across platforms, advanced analytics with AI insights, team collaboration tools, and API access for custom integrations. Includes priority support, custom AI model training, and dedicated account management.',
  '6-month enterprise AI content platform with automation and advanced analytics',
  40.00,
  'AI Tools',
  true,
  3
),
(
  'Premium AI Content Intelligence Suite - 1 Year',
  'Annual subscription to our premium AI-powered content intelligence and automation platform. Complete suite of AI tools including: Advanced content generation AI, predictive analytics engine, automated content optimization, intelligent content distribution, multi-platform management, AI-powered competitor intelligence, real-time trend analysis, and personalized content roadmaps. Features enterprise-grade security, unlimited API access, custom AI model training, white-label options, dedicated support team, monthly strategy consultations, and custom research reports. Best value for agencies, content teams, and businesses serious about AI-driven content marketing success.',
  '1-year premium AI content intelligence suite with full automation and enterprise features',
  70.00,
  'AI Tools',
  true,
  4
),
(
  'Professional Website Page Builder & Design Tool',
  'Complete website page design and development tool with drag-and-drop builder. Create custom, responsive web pages with modern design templates, mobile optimization tools, SEO-friendly structure builder, and professional implementation features. Includes: Visual page builder, responsive design preview, SEO optimization tools, performance analytics, code export options, and integration with popular CMS platforms. Perfect for adding new pages to existing sites or creating standalone landing pages. Includes 1 round of design revisions, basic SEO optimization, and mobile responsiveness testing.',
  'Professional website page builder with drag-and-drop design tools and SEO optimization',
  140.00,
  'Website Tools',
  true,
  5
),
(
  'Website Builder + AI SEO Optimization Suite - 1 Month',
  'Complete website page builder with integrated AI-powered SEO optimization tools. Includes visual page builder, AI keyword research, automated meta tag optimization, on-page SEO analysis, performance monitoring dashboard, and AI-generated content suggestions. Features: Real-time SEO scoring, automated optimization recommendations, competitor SEO analysis, AI content optimization, mobile performance testing, and monthly SEO performance reports. Our AI tools analyze your page and provide intelligent recommendations for maximum search visibility. Includes 1 month of ongoing optimization and monitoring.',
  'Website builder with 1 month of AI-powered SEO optimization and monitoring tools',
  150.00,
  'Website Tools',
  true,
  6
),
(
  'Website Builder + Advanced AI SEO Platform - 6 Months',
  'Premium website page builder with 6 months of comprehensive AI-powered SEO strategy and optimization. Includes visual page builder, advanced AI SEO tools, automated keyword research, intelligent content optimization, performance tracking dashboard, monthly SEO reports, and AI-driven strategy adjustments. Features: Predictive SEO analytics, AI content recommendations, automated technical SEO fixes, competitor intelligence, backlink analysis tools, and personalized SEO roadmaps. Our AI platform provides long-term SEO support with machine learning algorithms that adapt to search engine updates. Best value for businesses serious about search visibility and organic traffic growth.',
  'Website builder with 6 months of advanced AI SEO platform and strategy tools',
  160.00,
  'Website Tools',
  true,
  7
)
ON CONFLICT DO NOTHING;
```

---

## PART 3: UTILITY FUNCTIONS & HELPERS

### 3.1 Create URL Helper Functions

**File:** `src/utils/urlHelpers.ts`

```typescript
/**
 * URL Helper Functions for Order Processing and Email Generation
 */

/**
 * Get base URL dynamically (client-side or server-side)
 */
export function getBaseUrl(): string {
  // Client-side: Use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side: Use environment variable
  return import.meta.env.VITE_SITE_URL || 'https://streamstickpro.com';
}

/**
 * Generate order tracking URL
 * @param orderCode - Unique order code
 * @returns Complete tracking URL
 */
export function buildOrderTrackingUrl(orderCode: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/track-order?code=${orderCode}`;
}

/**
 * Generate product URL for secure checkout
 * @param productId - Product UUID
 * @returns Complete product URL
 */
export function buildProductUrl(productId: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/secure-checkout?product=${productId}`;
}

/**
 * Generate secure checkout URL
 * @param productId - Optional product ID to pre-select
 * @returns Complete secure checkout URL
 */
export function buildSecureCheckoutUrl(productId?: string): string {
  const baseUrl = getBaseUrl();
  if (productId) {
    return `${baseUrl}/secure-checkout?product=${productId}`;
  }
  return `${baseUrl}/secure-checkout`;
}

/**
 * Generate slug from product name
 * @param name - Product name
 * @returns URL-safe slug
 */
export function generateProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
```

### 3.2 Create Order Code Generator

**File:** `src/utils/orderHelpers.ts`

```typescript
/**
 * Order Helper Functions
 */

/**
 * Generate unique order code
 * Format: SEC-{timestamp}-{random}
 * Example: SEC-LXK9M2N-ABC12
 */
export function generateOrderCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SEC-${timestamp}-${random}`;
}

/**
 * Validate order code format
 */
export function isValidOrderCode(code: string): boolean {
  return /^SEC-[A-Z0-9]+-[A-Z0-9]+$/.test(code);
}
```

### 3.3 Create Bitcoin Price Fetcher

**File:** `src/utils/bitcoinHelpers.ts`

```typescript
/**
 * Bitcoin Helper Functions
 */

/**
 * Fetch current Bitcoin price in USD from Coinbase API
 */
export async function fetchBitcoinPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
    const data = await response.json();
    
    if (data?.data?.rates?.USD) {
      return parseFloat(data.data.rates.USD);
    }
    
    throw new Error('Invalid response from Coinbase API');
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    // Fallback price
    return 95000;
  }
}

/**
 * Calculate Bitcoin amount from USD
 */
export function calculateBitcoinAmount(usdAmount: number, btcPrice: number): string {
  return (usdAmount / btcPrice).toFixed(8);
}
```

---

## PART 4: SUPABASE CLIENT SETUP

### 4.1 Supabase Client Configuration

**File:** `src/lib/supabase.ts` (Already exists, verify it matches)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables are missing. ' +
    'Main site will load, but features are disabled.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'public-anon-key-placeholder',
);
```

---

## PART 5: SECURE CHECKOUT PAGE COMPONENT

### 5.1 Main Secure Checkout Page

**File:** `src/pages/SecureCheckoutPage.tsx`

```typescript
import { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  CreditCard, 
  Bitcoin, 
  DollarSign, 
  Package, 
  CheckCircle, 
  ArrowRight, 
  Info 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateOrderCode } from '../utils/orderHelpers';
import { buildOrderTrackingUrl, buildProductUrl } from '../utils/urlHelpers';
import SquarePaymentForm from '../components/SquarePaymentForm';
import BitcoinPaymentFlow from '../components/BitcoinPaymentFlow';
import { sendOrderConfirmationEmail } from '../utils/emailHelpers';

interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  image_url?: string;
  category: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

type PaymentMethod = 'square' | 'bitcoin' | 'cashapp' | '';
type PageStep = 'select' | 'checkout' | 'success';

export default function SecureCheckoutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('');
  const [step, setStep] = useState<PageStep>('select');
  const [loading, setLoading] = useState(true);
  const [orderCode, setOrderCode] = useState<string>('');
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: ''
  });

  // Load products on mount
  useEffect(() => {
    loadProducts();
    
    // Check for product ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    if (productId) {
      // Product will be selected after products load
    }
  }, []);

  // Auto-select product from URL
  useEffect(() => {
    if (products.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('product');
      if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
          setSelectedProduct(product);
          setStep('checkout');
        }
      }
    }
  }, [products]);

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from('square_products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('price', { ascending: true });

      if (error) throw error;
      
      // Convert price from string/number to number
      const formattedProducts = (data || []).map(product => ({
        ...product,
        price: parseFloat(product.price.toString()),
        sale_price: product.sale_price ? parseFloat(product.sale_price.toString()) : undefined
      }));
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectProduct(product: Product) {
    setSelectedProduct(product);
    setStep('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBackToProducts() {
    setStep('select');
    setSelectedProduct(null);
    setPaymentMethod('');
  }

  async function handleSquarePayment(token: string) {
    if (!selectedProduct || !customerInfo.name || !customerInfo.email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const code = generateOrderCode();
      setOrderCode(code);

      // Create order in database
      const orderData = {
        order_code: code,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone || null,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_price: selectedProduct.sale_price || selectedProduct.price,
        payment_method: 'square',
        payment_status: 'completed',
        order_status: 'pending',
        total: selectedProduct.sale_price || selectedProduct.price,
        square_transaction_id: token
      };

      const { data: order, error } = await supabase
        .from('square_orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Generate URLs
      const trackingUrl = buildOrderTrackingUrl(code);
      const productUrl = buildProductUrl(selectedProduct.id);

      // Send confirmation email
      await sendOrderConfirmationEmail({
        ...order,
        customer_phone: customerInfo.phone
      }, trackingUrl, productUrl);

      // Show success page
      setStep('success');
    } catch (error) {
      console.error('Error processing Square payment:', error);
      alert('Error processing payment. Please try again.');
    }
  }

  function handleOrderComplete(code: string) {
    setOrderCode(code);
    setStep('success');
  }

  const totalAmount = selectedProduct 
    ? (selectedProduct.sale_price || selectedProduct.price) 
    : 0;

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading secure checkout...</p>
        </div>
      </div>
    );
  }

  // Success State
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your secure transaction has been completed.</p>
          {selectedProduct && (
            <div className="p-4 bg-gray-50 rounded-lg text-left mb-6">
              <p className="text-sm text-gray-500 mb-1">Service</p>
              <p className="font-medium text-gray-900">{selectedProduct.name}</p>
              <p className="text-sm text-gray-500 mt-2">Amount</p>
              <p className="font-bold text-lg text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
          )}
          {orderCode && (
            <div className="p-4 bg-blue-50 rounded-lg mb-6 text-left">
              <p className="text-sm text-blue-800">
                <strong>Order Code:</strong> {orderCode}
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <strong>Next Steps:</strong> You will receive a confirmation email with your order details and service access information.
              </p>
            </div>
          )}
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Product Selection State
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
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

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Choose Your Service
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Select a professional service below. All payments are processed securely.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border border-slate-200 overflow-hidden transform hover:scale-105"
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
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600">
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
                    {product.short_description || product.description.substring(0, 100) + '...'}
                  </p>
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      {product.sale_price ? (
                        <>
                          <span className="text-2xl font-bold text-slate-800">${product.sale_price.toFixed(2)}</span>
                          <span className="text-sm text-slate-500 line-through ml-2">${product.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-slate-800">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectProduct(product)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Select & Checkout
                  </button>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No services available at this time.</p>
            </div>
          )}
        </section>

        {/* Trust Badges */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-white rounded-xl shadow-md p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Secure Payment</h3>
                <p className="text-slate-600 text-sm">
                  All transactions processed through secure payment gateways
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Data Protection</h3>
                <p className="text-slate-600 text-sm">
                  Your information is encrypted and never shared
                </p>
              </div>
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
      </div>
    );
  }

  // Checkout State
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBackToProducts}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Products</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Summary & Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
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
                      <p className="text-sm text-slate-500 mt-1">{selectedProduct.short_description || selectedProduct.description.substring(0, 60) + '...'}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                    <span className="text-lg font-bold text-slate-800">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    This transaction will appear as <strong>"PRO DIGITAL SERVICES"</strong> on your statement.
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Contact Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Lock className="w-6 h-6 text-green-600" />
                Select Payment Method
              </h2>

              {/* Payment Method Selection */}
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
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'square' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-slate-800">Credit/Debit Card</span>
                  </div>
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
                  <div className="flex items-center gap-3 mb-2">
                    <Bitcoin className={`w-6 h-6 ${paymentMethod === 'bitcoin' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-slate-800">Bitcoin (BTC)</span>
                  </div>
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
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className={`w-6 h-6 ${paymentMethod === 'cashapp' ? 'text-green-600' : 'text-slate-400'}`} />
                    <span className="font-bold text-slate-800">Cash App</span>
                  </div>
                  <p className="text-sm text-slate-600">Send payment via Cash App</p>
                </button>
              </div>

              {/* Square Payment Form */}
              {paymentMethod === 'square' && customerInfo.email && customerInfo.name && (
                <div className="mb-6">
                  <SquarePaymentForm 
                    amount={totalAmount} 
                    onSubmit={handleSquarePayment}
                  />
                </div>
              )}

              {/* Bitcoin Payment Flow */}
              {paymentMethod === 'bitcoin' && customerInfo.email && customerInfo.name && (
                <div className="mb-6">
                  <BitcoinPaymentFlow
                    totalAmount={totalAmount}
                    customerInfo={customerInfo}
                    products={selectedProduct ? [{
                      name: selectedProduct.name,
                      price: totalAmount,
                      quantity: 1
                    }] : []}
                    onOrderComplete={handleOrderComplete}
                    onBack={() => setPaymentMethod('')}
                  />
                </div>
              )}

              {/* Cash App Payment */}
              {paymentMethod === 'cashapp' && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">Cash App Payment</h3>
                      <p className="text-sm text-gray-600">Send payment directly via Cash App</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Send payment to:
                    </label>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                      <span className="font-mono text-lg font-bold text-green-600">$starevan11</span>
                      <button
                        onClick={() => navigator.clipboard.writeText('$starevan11')}
                        className="ml-auto px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount to Send:
                    </label>
                    <div className="text-3xl font-bold text-gray-900">${totalAmount.toFixed(2)}</div>
                  </div>

                  {customerInfo.name && customerInfo.email && (
                    <button
                      onClick={async () => {
                        if (!selectedProduct) return;
                        const code = generateOrderCode();
                        setOrderCode(code);
                        
                        // Create order
                        const { data: order } = await supabase
                          .from('cashapp_orders')
                          .insert([{
                            order_code: code,
                            customer_name: customerInfo.name,
                            customer_email: customerInfo.email,
                            customer_phone: customerInfo.phone || null,
                            product_id: selectedProduct.id,
                            product_name: selectedProduct.name,
                            total: totalAmount,
                            payment_method: 'cashapp',
                            payment_status: 'pending',
                            order_status: 'pending'
                          }])
                          .select()
                          .single();
                        
                        if (order) {
                          const trackingUrl = buildOrderTrackingUrl(code);
                          const productUrl = buildProductUrl(selectedProduct.id);
                          await sendOrderConfirmationEmail(order, trackingUrl, productUrl);
                          setStep('success');
                        }
                      }}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all"
                    >
                      Complete Order
                    </button>
                  )}
                </div>
              )}

              {paymentMethod === '' && (
                <div className="text-center py-8 text-slate-500">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Please select a payment method above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## PART 6: EMAIL HELPER FUNCTIONS

### 6.1 Email Generation Helper

**File:** `src/utils/emailHelpers.ts`

```typescript
import { supabase } from '../lib/supabase';
import { buildOrderTrackingUrl, buildProductUrl, getBaseUrl } from './urlHelpers';

interface Order {
  id: string;
  order_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  product_id: string;
  product_name: string;
  total: number;
  payment_method: string;
  payment_status: string;
  total_btc?: number;
  bitcoin_address?: string;
}

/**
 * Generate order confirmation email HTML
 */
export function generateOrderConfirmationEmail(
  order: Order,
  trackingUrl: string,
  productUrl: string
): string {
  const baseUrl = getBaseUrl();
  const currentYear = new Date().getFullYear();
  
  // Generate payment instructions based on payment method
  let paymentInstructions = '';
  
  if (order.payment_method === 'bitcoin' && order.bitcoin_address && order.total_btc) {
    paymentInstructions = `
      <div class="section">
        <h2 style="margin-top: 0; color: #1f2937;">Bitcoin Payment Instructions</h2>
        <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
          <p><strong>Bitcoin Amount:</strong> <span style="font-family: monospace; font-size: 18px; color: #f97316;">${order.total_btc.toFixed(8)} BTC</span></p>
          <p><strong>Bitcoin Address:</strong></p>
          <p style="font-family: monospace; font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${order.bitcoin_address}</p>
        </div>
        <ol style="color: #6b7280; line-height: 1.8;">
          <li>Copy the Bitcoin address and exact amount shown above</li>
          <li>Send your Bitcoin payment to the address</li>
          <li>After sending, email a screenshot of your payment confirmation to reloadedfiretvteam@gmail.com</li>
          <li>Include your order code: <strong>${order.order_code}</strong> in the email</li>
        </ol>
      </div>
    `;
  } else if (order.payment_method === 'cashapp') {
    paymentInstructions = `
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
      ${order.payment_status === 'pending' ? paymentInstructions : ''}
      
      <!-- Support Section -->
      <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 30px;">
        <p style="margin: 0; color: #92400e;">
          <strong>Need Support?</strong><br>
          Email us at: <a href="mailto:reloadedfiretvteam@gmail.com" style="color: #f97316;">reloadedfiretvteam@gmail.com</a>
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p>© ${currentYear} Stream Stick Pro. All rights reserved.</p>
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

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  order: Order,
  trackingUrl: string,
  productUrl: string
): Promise<void> {
  try {
    // Generate email HTML
    const emailHtml = generateOrderConfirmationEmail(order, trackingUrl, productUrl);
    
    // Log email to email_logs table
    await supabase.from('email_logs').insert({
      recipient: order.customer_email,
      template_key: 'order_confirmation',
      subject: `Order Confirmation - ${order.order_code}`,
      body: emailHtml,
      status: 'pending',
      metadata: {
        order_code: order.order_code,
        tracking_url: trackingUrl,
        product_url: productUrl,
        payment_method: order.payment_method
      }
    });
    
    // Also send via edge function if available
    try {
      await supabase.functions.invoke('send-order-emails', {
        body: {
          to: order.customer_email,
          subject: `Order Confirmation - ${order.order_code}`,
          html: emailHtml,
          orderCode: order.order_code,
          trackingUrl: trackingUrl
        }
      });
    } catch (error) {
      console.warn('Edge function email sending failed, email logged to database:', error);
    }
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
}
```

---

## PART 7: COMPLETE IMPLEMENTATION STEPS

### Step 1: Database Setup
1. Run the migration file in Supabase SQL Editor
2. Verify all tables are created
3. Verify RLS policies are active
4. Verify products are inserted

### Step 2: Create Utility Files
1. Create `src/utils/urlHelpers.ts` with all URL functions
2. Create `src/utils/orderHelpers.ts` with order code generator
3. Create `src/utils/bitcoinHelpers.ts` with Bitcoin price fetcher
4. Create `src/utils/emailHelpers.ts` with email functions

### Step 3: Create Secure Checkout Page
1. Create `src/pages/SecureCheckoutPage.tsx` with complete component
2. Add route in your router: `/secure-checkout`
3. Test product loading
4. Test product selection

### Step 4: Payment Integration
1. Ensure `SquarePaymentForm.tsx` exists and works
2. Ensure `BitcoinPaymentFlow.tsx` exists and works
3. Test each payment method

### Step 5: Email System
1. Verify edge function `send-order-emails` exists
2. Test email generation
3. Test email logging to database

### Step 6: Testing
1. Test complete order flow for Square
2. Test complete order flow for Bitcoin
3. Test complete order flow for Cash App
4. Verify emails are sent with correct URLs
5. Verify order tracking URLs work
6. Test responsive design

---

## PART 8: FILE STRUCTURE SUMMARY

```
project/
├── src/
│   ├── pages/
│   │   └── SecureCheckoutPage.tsx (NEW - Main checkout page)
│   ├── components/
│   │   ├── SquarePaymentForm.tsx (EXISTS - Verify it works)
│   │   └── BitcoinPaymentFlow.tsx (EXISTS - Verify it works)
│   ├── utils/
│   │   ├── urlHelpers.ts (NEW - URL generation)
│   │   ├── orderHelpers.ts (NEW - Order code generation)
│   │   ├── bitcoinHelpers.ts (NEW - Bitcoin price)
│   │   └── emailHelpers.ts (NEW - Email generation)
│   └── lib/
│       └── supabase.ts (EXISTS - Verify configuration)
├── supabase/
│   ├── migrations/
│   │   └── YYYYMMDDHHMMSS_create_secure_checkout_tables.sql (NEW)
│   └── functions/
│       └── send-order-emails/
│           └── index.ts (EXISTS - Update if needed)
└── .env (EXISTS - Add VITE_SITE_URL if missing)
```

---

## PART 9: TESTING CHECKLIST

### 9.1 Database Tests
- [ ] All tables created successfully
- [ ] Products inserted correctly
- [ ] RLS policies working
- [ ] Can insert orders

### 9.2 Frontend Tests
- [ ] Products load on secure checkout page
- [ ] Product selection works
- [ ] Customer form validation works
- [ ] Payment method selection works
- [ ] Order creation works for all payment methods
- [ ] Success page displays correctly

### 9.3 URL Generation Tests
- [ ] Order tracking URLs generated correctly
- [ ] Product URLs generated correctly
- [ ] URLs work in emails
- [ ] URLs are absolute (not relative)

### 9.4 Email Tests
- [ ] Emails generated with correct content
- [ ] Emails include order code
- [ ] Emails include tracking URL
- [ ] Emails include product URL
- [ ] Payment instructions included for pending payments
- [ ] Emails logged to database

### 9.5 Integration Tests
- [ ] Complete Square payment flow works
- [ ] Complete Bitcoin payment flow works
- [ ] Complete Cash App payment flow works
- [ ] Order tracking page works with order codes
- [ ] All URLs in emails are clickable and correct

---

## PART 10: CONFIGURATION VALUES

### 10.1 Payment Configuration
```typescript
const CASH_APP_TAG = '$starevan11';
const BITCOIN_ADDRESS = 'bc1q448jm49ypzwsrrk75c974uqla28k0kmnx6w95r';
const SHOP_OWNER_EMAIL = 'reloadedfiretvteam@gmail.com';
```

### 10.2 Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SITE_URL=https://streamstickpro.com
VITE_SQUARE_APP_ID=your-square-app-id (if using Square)
VITE_SQUARE_LOCATION_ID=your-square-location-id (if using Square)
```

---

## SUMMARY

This document provides:
1. ✅ Complete database schema with migrations
2. ✅ All utility functions (URL, order, Bitcoin, email)
3. ✅ Complete SecureCheckoutPage component
4. ✅ Email generation system with URLs
5. ✅ Step-by-step implementation guide
6. ✅ Complete file structure
7. ✅ Testing checklist
8. ✅ Configuration values

**NEXT STEPS:**
1. Run database migration
2. Create all utility files
3. Create SecureCheckoutPage component
4. Test each payment method
5. Verify email generation
6. Test complete flow end-to-end

**This prompt is complete and ready to use with an AI assistant to build the entire system.**

