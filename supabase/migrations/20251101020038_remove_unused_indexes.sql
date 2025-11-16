/*
  # Remove Unused Indexes

  This migration removes indexes that are not being used by queries, reducing
  database maintenance overhead and improving write performance.

  ## Indexes Removed

  1. email_subscribers table
     - idx_email_subscribers_email (unused)
     - idx_email_subscribers_subscribed (unused)

  2. cart_abandonments table
     - idx_cart_abandonments_email (unused)
     - idx_cart_abandonments_converted (unused)

  3. visitor_analytics table
     - idx_visitor_analytics_visited (unused)

  4. pricing_plans table
     - idx_pricing_plans_order (unused)

  5. customers table
     - idx_customers_email (unused)

  6. orders table
     - idx_orders_customer_id (unused)
     - idx_orders_created_at (unused)

  7. visitor_tracking table
     - idx_visitor_tracking_session_id (unused)

  Note: These indexes were identified as unused. If query patterns change in the future
  and these indexes become necessary, they can be recreated.
*/

-- Remove unused indexes from email_subscribers
DROP INDEX IF EXISTS public.idx_email_subscribers_email;
DROP INDEX IF EXISTS public.idx_email_subscribers_subscribed;

-- Remove unused indexes from cart_abandonments
DROP INDEX IF EXISTS public.idx_cart_abandonments_email;
DROP INDEX IF EXISTS public.idx_cart_abandonments_converted;

-- Remove unused indexes from visitor_analytics
DROP INDEX IF EXISTS public.idx_visitor_analytics_visited;

-- Remove unused indexes from pricing_plans
DROP INDEX IF EXISTS public.idx_pricing_plans_order;

-- Remove unused indexes from customers
DROP INDEX IF EXISTS public.idx_customers_email;

-- Remove unused indexes from orders
DROP INDEX IF EXISTS public.idx_orders_customer_id;
DROP INDEX IF EXISTS public.idx_orders_created_at;

-- Remove unused indexes from visitor_tracking
DROP INDEX IF EXISTS public.idx_visitor_tracking_session_id;
