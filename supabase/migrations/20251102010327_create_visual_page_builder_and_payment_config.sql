/*
  # Visual Page Builder & Real-Time Payment Configuration

  1. New Tables
    - `page_elements` - Store editable page elements for visual builder
    - `payment_gateway_config` - Real-time payment method configuration
    
  2. Security
    - Enable RLS on all tables
    - Admin-only access for editing
    
  3. Features
    - Click-to-edit page elements
    - Real-time payment configuration
    - No coding required
*/

-- Page Elements Table for Visual Builder
CREATE TABLE IF NOT EXISTS page_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_type text NOT NULL,
  element_id text NOT NULL,
  element_class text,
  content text NOT NULL,
  page_section text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage page elements"
  ON page_elements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Public can view page elements"
  ON page_elements
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_page_elements_section ON page_elements(page_section);
CREATE INDEX IF NOT EXISTS idx_page_elements_order ON page_elements(page_section, order_index);

-- Insert default hero section elements
INSERT INTO page_elements (element_type, element_id, element_class, content, page_section, order_index)
VALUES
  ('heading', 'hero-title', 'hero-heading', 'Stream Unlimited Entertainment with Inferno TV', 'hero', 1),
  ('paragraph', 'hero-description', 'hero-text', '18,000+ Live Channels, 60,000+ Movies & Series. Jailbroken Fire Sticks Available!', 'hero', 2),
  ('button', 'hero-cta', 'hero-button', 'Get Started Today', 'hero', 3)
ON CONFLICT DO NOTHING;

-- Payment Gateway Configuration Table
CREATE TABLE IF NOT EXISTS payment_gateway_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_app_tag text DEFAULT '',
  cash_app_note text DEFAULT '',
  cash_app_active boolean DEFAULT false,
  bitcoin_address text DEFAULT '',
  bitcoin_network text DEFAULT 'mainnet',
  bitcoin_active boolean DEFAULT false,
  venmo_username text DEFAULT '',
  venmo_active boolean DEFAULT false,
  zelle_email text DEFAULT '',
  zelle_active boolean DEFAULT false,
  paypal_email text DEFAULT '',
  paypal_active boolean DEFAULT false,
  stripe_public_key text DEFAULT '',
  stripe_secret_key text DEFAULT '',
  stripe_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_gateway_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment config"
  ON payment_gateway_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Public can view active payment methods"
  ON payment_gateway_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert default payment configuration
INSERT INTO payment_gateway_config (
  cash_app_tag,
  cash_app_note,
  cash_app_active,
  venmo_username,
  venmo_active,
  zelle_email,
  zelle_active,
  paypal_email,
  paypal_active,
  bitcoin_active
)
VALUES (
  '$starevan11',
  'IPTV Service Payment',
  true,
  '@starevan11',
  true,
  'reloadedfiretvteam@gmail.com',
  true,
  'reloadedfiretvteam@gmail.com',
  true,
  false
)
ON CONFLICT DO NOTHING;

-- Add more page elements for different sections
INSERT INTO page_elements (element_type, element_id, element_class, content, page_section, order_index)
VALUES
  ('heading', 'features-title', 'section-heading', 'Why Choose Inferno TV?', 'features', 1),
  ('paragraph', 'features-desc', 'section-text', 'Experience premium IPTV streaming with unmatched quality and reliability', 'features', 2),
  ('heading', 'pricing-title', 'section-heading', 'Simple, Transparent Pricing', 'pricing', 1),
  ('paragraph', 'pricing-desc', 'section-text', 'Choose the perfect plan for your streaming needs', 'pricing', 2),
  ('heading', 'about-title', 'section-heading', 'What is IPTV?', 'about', 1),
  ('paragraph', 'about-desc', 'section-text', 'IPTV (Internet Protocol Television) delivers TV content over the internet instead of traditional cable or satellite.', 'about', 2)
ON CONFLICT DO NOTHING;
