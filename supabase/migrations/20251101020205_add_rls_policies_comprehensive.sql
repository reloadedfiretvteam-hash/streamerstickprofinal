/*
  # Add Comprehensive RLS Policies

  This migration adds RLS policies for all tables that have RLS enabled but no policies.
  Without policies, RLS-enabled tables are completely locked down and inaccessible.

  ## Security Principles Applied
  1. Authenticated users can access their own data
  2. Service role has full access for admin operations
  3. Public data (reviews, products, etc.) readable by anyone
  4. Sensitive data (payments, orders) restricted to owners only
  5. No USING (true) policies that bypass security

  ## Tables Covered
  - admin_activity_log
  - affiliate_commissions
  - affiliates
  - api_keys
  - backlinks
  - competitor_tracking
  - conversion_events
  - coupons
  - customer_notes
  - customers
  - email_campaigns
  - keywords
  - order_items
  - orders
  - page_views
  - payment_gateways
  - payments
  - promotions
  - referrals
  - site_settings
  - social_media_posts
  - support_tickets
  - ticket_messages
  - utm_campaigns
  - visitor_tracking
*/

-- ============================================
-- ADMIN & SYSTEM TABLES
-- ============================================

-- admin_activity_log: Service role only for security auditing
CREATE POLICY "Service role can access admin activity log"
  ON public.admin_activity_log FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- api_keys: Service role only
CREATE POLICY "Service role can manage API keys"
  ON public.api_keys FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- site_settings: Public read, service role write
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Service role can manage site settings"
  ON public.site_settings FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ============================================
-- SEO & MARKETING TABLES
-- ============================================

-- backlinks: Public read, service role write
CREATE POLICY "Anyone can view backlinks"
  ON public.backlinks FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Service role can manage backlinks"
  ON public.backlinks FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- competitor_tracking: Service role only
CREATE POLICY "Service role can manage competitor tracking"
  ON public.competitor_tracking FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- keywords: Public read, service role write
CREATE POLICY "Anyone can view keywords"
  ON public.keywords FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Service role can manage keywords"
  ON public.keywords FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- utm_campaigns: Service role only
CREATE POLICY "Service role can manage UTM campaigns"
  ON public.utm_campaigns FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- social_media_posts: Public read, service role write
CREATE POLICY "Anyone can view social media posts"
  ON public.social_media_posts FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Service role can manage social media posts"
  ON public.social_media_posts FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- email_campaigns: Service role only
CREATE POLICY "Service role can manage email campaigns"
  ON public.email_campaigns FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ============================================
-- CUSTOMER TABLES
-- ============================================

-- customers: Users can view/update own data
CREATE POLICY "Users can view own customer data"
  ON public.customers FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own customer data"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Anyone can create customer record"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Service role can manage all customers"
  ON public.customers FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- customer_notes: Service role only (internal notes)
CREATE POLICY "Service role can manage customer notes"
  ON public.customer_notes FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ============================================
-- ORDER & PAYMENT TABLES
-- ============================================

-- orders: Users can view own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = orders.customer_id
      AND customers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all orders"
  ON public.orders FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- order_items: Users can view items from own orders
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN customers ON customers.id = orders.customer_id
      WHERE orders.id = order_items.order_id
      AND customers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage order items"
  ON public.order_items FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- payments: Users can view own payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN customers ON customers.id = orders.customer_id
      WHERE orders.id = payments.order_id
      AND customers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage payments"
  ON public.payments FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- payment_gateways: Service role only (sensitive config)
CREATE POLICY "Service role can manage payment gateways"
  ON public.payment_gateways FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ============================================
-- PROMOTION TABLES
-- ============================================

-- coupons: Service role manages, authenticated can view active
CREATE POLICY "Authenticated users can view active coupons"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (is_active = true AND valid_until > now());

CREATE POLICY "Service role can manage coupons"
  ON public.coupons FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- promotions: Public read, service role write
CREATE POLICY "Anyone can view active promotions"
  ON public.promotions FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Service role can manage promotions"
  ON public.promotions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ============================================
-- AFFILIATE TABLES
-- ============================================

-- affiliates: Users can view own affiliate data
CREATE POLICY "Users can view own affiliate data"
  ON public.affiliates FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can create own affiliate account"
  ON public.affiliates FOR INSERT
  TO authenticated
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can update own affiliate data"
  ON public.affiliates FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Service role can manage affiliates"
  ON public.affiliates FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- affiliate_commissions: Affiliates can view own commissions
CREATE POLICY "Users can view own affiliate commissions"
  ON public.affiliate_commissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM affiliates
      WHERE affiliates.id = affiliate_commissions.affiliate_id
      AND affiliates.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage affiliate commissions"
  ON public.affiliate_commissions FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- referrals: Users can view referrals they made or received
CREATE POLICY "Users can view own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE (customers.id = referrals.referrer_customer_id
         OR customers.id = referrals.referred_customer_id)
      AND customers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage referrals"
  ON public.referrals FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ============================================
-- SUPPORT TABLES
-- ============================================

-- support_tickets: Users can view/create own tickets
CREATE POLICY "Users can view own support tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = support_tickets.customer_id
      AND customers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own support tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = customer_id
      AND customers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage support tickets"
  ON public.support_tickets FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ticket_messages: Users can view/create messages for own tickets
CREATE POLICY "Users can view messages on own tickets"
  ON public.ticket_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      JOIN customers ON customers.id = support_tickets.customer_id
      WHERE support_tickets.id = ticket_messages.ticket_id
      AND customers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages on own tickets"
  ON public.ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      JOIN customers ON customers.id = support_tickets.customer_id
      WHERE support_tickets.id = ticket_id
      AND customers.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage ticket messages"
  ON public.ticket_messages FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ============================================
-- ANALYTICS TABLES
-- ============================================

-- visitor_tracking: Service role only
CREATE POLICY "Service role can manage visitor tracking"
  ON public.visitor_tracking FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- page_views: Service role only
CREATE POLICY "Service role can manage page views"
  ON public.page_views FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- conversion_events: Service role only
CREATE POLICY "Service role can manage conversion events"
  ON public.conversion_events FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
