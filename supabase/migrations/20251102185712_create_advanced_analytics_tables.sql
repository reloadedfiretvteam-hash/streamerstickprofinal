/*
  # Advanced Analytics and Conversion Tracking Tables

  1. New Tables
    - `page_views` - Track all page views with session data
    - `cart_events` - Track add to cart actions
    - `checkout_events` - Track checkout flow
    - `purchase_events` - Track completed purchases
    - `conversions` - General conversion tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated admin access only

  3. Indexes
    - Add indexes on session_id and timestamp for fast queries
*/

-- Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  page_url text NOT NULL,
  page_title text,
  referrer text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Cart Events Table
CREATE TABLE IF NOT EXISTS cart_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  product_id text,
  product_name text,
  price numeric(10,2),
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Checkout Events Table
CREATE TABLE IF NOT EXISTS checkout_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  cart_total numeric(10,2),
  item_count integer,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Purchase Events Table
CREATE TABLE IF NOT EXISTS purchase_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  order_id text,
  total_amount numeric(10,2),
  items jsonb,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- General Conversions Table
CREATE TABLE IF NOT EXISTS conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  event_type text NOT NULL,
  event_value numeric(10,2),
  page_url text,
  referrer text,
  user_agent text,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_timestamp ON page_views(timestamp);
CREATE INDEX IF NOT EXISTS idx_cart_events_session ON cart_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_timestamp ON cart_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_checkout_events_session ON checkout_events(session_id);
CREATE INDEX IF NOT EXISTS idx_purchase_events_session ON purchase_events(session_id);
CREATE INDEX IF NOT EXISTS idx_conversions_session ON conversions(session_id);

-- Enable RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Admin only can view analytics)
CREATE POLICY "Admins can view page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Anyone can insert page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view cart events"
  ON cart_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Anyone can insert cart events"
  ON cart_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view checkout events"
  ON checkout_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Anyone can insert checkout events"
  ON checkout_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view purchase events"
  ON purchase_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Anyone can insert purchase events"
  ON purchase_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view conversions"
  ON conversions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Anyone can insert conversions"
  ON conversions FOR INSERT
  WITH CHECK (true);
