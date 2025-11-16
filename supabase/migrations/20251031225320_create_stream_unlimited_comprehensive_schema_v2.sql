/*
  # StreamUnlimited.tv - Complete E-Commerce Platform Schema

  ## Overview
  Comprehensive database schema for StreamUnlimited.tv featuring complete backend control,
  visitor tracking, payment processing, marketing automation, and admin management.

  ## New Tables (27 total)
  
  Core Business: customers, products, orders, order_items, payments, payment_gateways
  Analytics: visitor_tracking, page_views, conversion_events, utm_campaigns
  Marketing: email_campaigns, email_subscribers, social_media_posts, promotions, coupons
  Affiliates: affiliates, affiliate_commissions, referrals
  Support: support_tickets, ticket_messages, customer_notes
  Content: blog_posts, reviews, faqs
  SEO: backlinks, competitor_tracking, keywords
  System: site_settings, api_keys, admin_activity_log

  ## Security
  All tables have RLS enabled with restrictive default policies
*/

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state_province text,
  postal_code text,
  country text DEFAULT 'US',
  customer_type text DEFAULT 'retail',
  lifetime_value numeric DEFAULT 0,
  total_orders integer DEFAULT 0,
  last_order_date timestamptz,
  acquisition_source text,
  customer_status text DEFAULT 'active',
  vip_tier text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  product_type text NOT NULL,
  sku text UNIQUE,
  price numeric NOT NULL,
  compare_at_price numeric,
  cost numeric,
  inventory_count integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  image_url text,
  gallery_images jsonb DEFAULT '[]',
  features jsonb DEFAULT '[]',
  specifications jsonb DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  seo_title text,
  seo_description text,
  subscription_duration_days integer,
  channels_included integer,
  max_devices integer,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  order_status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  subtotal numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  shipping_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  coupon_code text,
  payment_method text,
  payment_gateway_id uuid,
  transaction_id text,
  shipping_address jsonb,
  billing_address jsonb,
  customer_ip text,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  notes text,
  admin_notes text,
  fulfillment_date timestamptz,
  tracking_number text,
  shipping_carrier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  cost numeric,
  is_subscription boolean DEFAULT false,
  subscription_start_date timestamptz,
  subscription_end_date timestamptz,
  serial_number text,
  activation_code text,
  created_at timestamptz DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  payment_method text NOT NULL,
  payment_gateway text,
  transaction_id text,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  payment_status text DEFAULT 'pending',
  gateway_response jsonb,
  crypto_wallet_address text,
  crypto_amount numeric,
  crypto_currency text,
  confirmation_count integer DEFAULT 0,
  refund_amount numeric DEFAULT 0,
  refund_reason text,
  processor_fee numeric DEFAULT 0,
  net_amount numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment gateways
CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  is_active boolean DEFAULT false,
  is_test_mode boolean DEFAULT true,
  api_key_encrypted text,
  api_secret_encrypted text,
  webhook_secret_encrypted text,
  additional_config jsonb DEFAULT '{}',
  transaction_fee_percent numeric DEFAULT 0,
  transaction_fee_fixed numeric DEFAULT 0,
  supported_currencies jsonb DEFAULT '["USD"]',
  logo_url text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Visitor tracking
CREATE TABLE IF NOT EXISTS visitor_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  visitor_id text,
  ip_address text,
  country text,
  country_code text,
  region text,
  city text,
  latitude numeric,
  longitude numeric,
  timezone text,
  isp text,
  device_type text,
  device_brand text,
  device_model text,
  os text,
  os_version text,
  browser text,
  browser_version text,
  user_agent text,
  screen_resolution text,
  language text,
  referrer_url text,
  referrer_domain text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  landing_page text,
  entry_time timestamptz DEFAULT now(),
  exit_time timestamptz,
  session_duration integer,
  pages_viewed integer DEFAULT 1,
  is_bounce boolean DEFAULT false,
  converted boolean DEFAULT false,
  conversion_value numeric DEFAULT 0,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Page views
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_tracking_id uuid REFERENCES visitor_tracking(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  page_url text NOT NULL,
  page_title text,
  referrer_url text,
  time_on_page integer,
  scroll_depth_percent integer,
  clicks_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Conversion events
CREATE TABLE IF NOT EXISTS conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_tracking_id uuid REFERENCES visitor_tracking(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_value numeric DEFAULT 0,
  event_data jsonb DEFAULT '{}',
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- UTM campaigns
CREATE TABLE IF NOT EXISTS utm_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  total_visits integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  cost_per_click numeric DEFAULT 0,
  ad_spend numeric DEFAULT 0,
  roi numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  subject_line text NOT NULL,
  preview_text text,
  email_body_html text NOT NULL,
  email_body_text text,
  sender_name text DEFAULT 'StreamUnlimited',
  sender_email text DEFAULT 'support@streamunlimited.tv',
  campaign_type text DEFAULT 'promotional',
  target_segment text,
  send_status text DEFAULT 'draft',
  scheduled_send_time timestamptz,
  total_recipients integer DEFAULT 0,
  emails_sent integer DEFAULT 0,
  emails_delivered integer DEFAULT 0,
  emails_opened integer DEFAULT 0,
  emails_clicked integer DEFAULT 0,
  emails_bounced integer DEFAULT 0,
  emails_unsubscribed integer DEFAULT 0,
  open_rate numeric DEFAULT 0,
  click_rate numeric DEFAULT 0,
  conversion_count integer DEFAULT 0,
  revenue_generated numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Email subscribers
CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  subscription_status text DEFAULT 'subscribed',
  subscriber_type text DEFAULT 'prospect',
  source text,
  tags jsonb DEFAULT '[]',
  custom_fields jsonb DEFAULT '{}',
  subscribed_date timestamptz DEFAULT now(),
  unsubscribed_date timestamptz,
  last_email_sent timestamptz,
  email_opens_count integer DEFAULT 0,
  email_clicks_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Social media posts
CREATE TABLE IF NOT EXISTS social_media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  post_type text DEFAULT 'video',
  content text NOT NULL,
  media_url text,
  thumbnail_url text,
  hashtags jsonb DEFAULT '[]',
  post_status text DEFAULT 'draft',
  scheduled_time timestamptz,
  published_time timestamptz,
  post_url text,
  engagement_likes integer DEFAULT 0,
  engagement_comments integer DEFAULT 0,
  engagement_shares integer DEFAULT 0,
  engagement_views integer DEFAULT 0,
  reach integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  ai_generated boolean DEFAULT false,
  ai_prompt text,
  campaign_id uuid,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_name text NOT NULL,
  promotion_type text NOT NULL,
  discount_value numeric NOT NULL,
  minimum_purchase_amount numeric DEFAULT 0,
  maximum_discount_amount numeric,
  applies_to text DEFAULT 'all',
  product_ids jsonb DEFAULT '[]',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  terms_conditions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL,
  discount_value numeric NOT NULL,
  minimum_order_amount numeric DEFAULT 0,
  maximum_discount_amount numeric,
  usage_limit_per_coupon integer,
  usage_limit_per_customer integer DEFAULT 1,
  usage_count integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  applies_to_product_ids jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Affiliates
CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text,
  website_url text,
  affiliate_code text UNIQUE NOT NULL,
  commission_rate numeric DEFAULT 10.00,
  payment_method text DEFAULT 'paypal',
  payment_details jsonb DEFAULT '{}',
  affiliate_status text DEFAULT 'pending',
  total_clicks integer DEFAULT 0,
  total_conversions integer DEFAULT 0,
  total_revenue_generated numeric DEFAULT 0,
  total_commission_earned numeric DEFAULT 0,
  total_commission_paid numeric DEFAULT 0,
  commission_balance numeric DEFAULT 0,
  approval_date timestamptz,
  last_payout_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Affiliate commissions
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  commission_amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  order_total numeric NOT NULL,
  commission_status text DEFAULT 'pending',
  payout_date timestamptz,
  payout_method text,
  payout_transaction_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  referred_customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  referral_status text DEFAULT 'pending',
  reward_type text,
  reward_amount numeric,
  reward_given boolean DEFAULT false,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  subject text NOT NULL,
  priority text DEFAULT 'medium',
  ticket_status text DEFAULT 'open',
  category text,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  first_response_time timestamptz,
  resolution_time timestamptz,
  satisfaction_rating integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ticket messages
CREATE TABLE IF NOT EXISTS ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type text NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name text NOT NULL,
  message_text text NOT NULL,
  attachments jsonb DEFAULT '[]',
  is_internal_note boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Customer notes
CREATE TABLE IF NOT EXISTS customer_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  note_type text DEFAULT 'general',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name text,
  created_at timestamptz DEFAULT now()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text,
  post_status text DEFAULT 'draft',
  published_date timestamptz,
  scheduled_publish_date timestamptz,
  categories jsonb DEFAULT '[]',
  tags jsonb DEFAULT '[]',
  seo_title text,
  seo_description text,
  seo_keywords text,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  reading_time_minutes integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title text,
  review_text text,
  is_verified_purchase boolean DEFAULT false,
  review_status text DEFAULT 'pending',
  helpful_count integer DEFAULT 0,
  not_helpful_count integer DEFAULT 0,
  admin_response text,
  admin_response_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  sort_order integer DEFAULT 0,
  is_published boolean DEFAULT true,
  view_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Backlinks
CREATE TABLE IF NOT EXISTS backlinks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text NOT NULL,
  source_domain text NOT NULL,
  target_url text NOT NULL,
  anchor_text text,
  link_type text DEFAULT 'dofollow',
  link_status text DEFAULT 'active',
  domain_authority integer,
  page_authority integer,
  spam_score integer,
  discovery_date timestamptz DEFAULT now(),
  last_checked_date timestamptz DEFAULT now(),
  outreach_status text,
  outreach_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Competitor tracking
CREATE TABLE IF NOT EXISTS competitor_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name text NOT NULL,
  competitor_url text NOT NULL,
  competitor_type text DEFAULT 'direct',
  tracked_metrics jsonb DEFAULT '{}',
  last_crawl_date timestamptz,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Keywords
CREATE TABLE IF NOT EXISTS keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword_text text UNIQUE NOT NULL,
  search_volume integer DEFAULT 0,
  keyword_difficulty integer,
  current_ranking integer,
  best_ranking integer,
  target_url text,
  ranking_history jsonb DEFAULT '[]',
  last_checked_date timestamptz DEFAULT now(),
  is_tracking boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Site settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'text',
  setting_category text DEFAULT 'general',
  is_encrypted boolean DEFAULT false,
  description text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- API keys
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text UNIQUE NOT NULL,
  api_key_encrypted text,
  api_secret_encrypted text,
  additional_config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_used_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text NOT NULL,
  action_type text NOT NULL,
  table_name text,
  record_id uuid,
  changes jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_session_id ON visitor_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE backlinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Public policies
CREATE POLICY "Public read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read published blogs" ON blog_posts FOR SELECT USING (post_status = 'published');
CREATE POLICY "Public read FAQs" ON faqs FOR SELECT USING (is_published = true);
CREATE POLICY "Public read approved reviews" ON reviews FOR SELECT USING (review_status = 'approved');
CREATE POLICY "Anyone can subscribe" ON email_subscribers FOR INSERT WITH CHECK (true);
