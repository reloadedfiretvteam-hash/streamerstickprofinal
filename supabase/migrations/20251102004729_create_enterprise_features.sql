/*
  # Enterprise Features for $1M Website

  1. New Tables
    - `live_chat_messages` - Customer support chat system
    - `affiliates` - Affiliate program management
    - `customer_reviews` - Product reviews and testimonials
    - `subscriptions` - Recurring subscription management
    
  2. Security
    - Enable RLS on all tables
    - Admin-only access policies
    
  3. Indexes
    - Performance indexes for fast queries
*/

-- Live Chat Messages Table
CREATE TABLE IF NOT EXISTS live_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  message text NOT NULL,
  reply text,
  status text NOT NULL DEFAULT 'pending',
  replied_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage live chat messages"
  ON live_chat_messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_live_chat_status ON live_chat_messages(status);
CREATE INDEX IF NOT EXISTS idx_live_chat_created ON live_chat_messages(created_at DESC);

-- Affiliates Table
CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_code text UNIQUE NOT NULL,
  affiliate_name text NOT NULL,
  affiliate_email text NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 20,
  total_sales numeric DEFAULT 0,
  total_commission numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage affiliates"
  ON affiliates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_affiliate_code ON affiliates(affiliate_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_status ON affiliates(status);

-- Customer Reviews Table
CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title text NOT NULL,
  review_text text NOT NULL,
  product_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  verified_purchase boolean DEFAULT false,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage customer reviews"
  ON customer_reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Public can view approved reviews"
  ON customer_reviews
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE INDEX IF NOT EXISTS idx_reviews_status ON customer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON customer_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON customer_reviews(featured);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  plan_name text NOT NULL,
  amount numeric NOT NULL,
  billing_cycle text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  start_date timestamptz NOT NULL DEFAULT now(),
  next_billing_date timestamptz NOT NULL,
  auto_renew boolean DEFAULT true,
  payment_method text NOT NULL,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_email ON subscriptions(customer_email);
