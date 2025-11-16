/*
  # Add Missing Foreign Key Indexes

  This migration addresses performance issues by adding indexes to all foreign key columns
  that currently lack them. Indexing foreign keys significantly improves JOIN operations
  and query performance.

  ## Tables and Indexes Added

  ### admin_activity_log
  - idx_admin_activity_log_admin_user_id on admin_user_id

  ### affiliate_commissions
  - idx_affiliate_commissions_affiliate_id on affiliate_id
  - idx_affiliate_commissions_order_id on order_id

  ### affiliates
  - idx_affiliates_auth_user_id on auth_user_id

  ### blog_posts
  - idx_blog_posts_author_id on author_id

  ### conversion_events
  - idx_conversion_events_order_id on order_id
  - idx_conversion_events_product_id on product_id
  - idx_conversion_events_visitor_tracking_id on visitor_tracking_id

  ### customer_notes
  - idx_customer_notes_created_by on created_by
  - idx_customer_notes_customer_id on customer_id

  ### customers
  - idx_customers_auth_user_id on auth_user_id

  ### order_items
  - idx_order_items_order_id on order_id
  - idx_order_items_product_id on product_id

  ### page_views
  - idx_page_views_visitor_tracking_id on visitor_tracking_id

  ### payments
  - idx_payments_order_id on order_id

  ### referrals
  - idx_referrals_order_id on order_id
  - idx_referrals_referred_customer_id on referred_customer_id
  - idx_referrals_referrer_customer_id on referrer_customer_id

  ### reviews
  - idx_reviews_customer_id on customer_id
  - idx_reviews_order_id on order_id
  - idx_reviews_product_id on product_id

  ### site_settings
  - idx_site_settings_updated_by on updated_by

  ### social_media_posts
  - idx_social_media_posts_created_by on created_by

  ### support_tickets
  - idx_support_tickets_assigned_to on assigned_to
  - idx_support_tickets_customer_id on customer_id
  - idx_support_tickets_order_id on order_id

  ### ticket_messages
  - idx_ticket_messages_sender_id on sender_id
  - idx_ticket_messages_ticket_id on ticket_id

  ### visitor_tracking
  - idx_visitor_tracking_customer_id on customer_id
*/

-- admin_activity_log
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_user_id ON public.admin_activity_log(admin_user_id);

-- affiliate_commissions
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_affiliate_id ON public.affiliate_commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_order_id ON public.affiliate_commissions(order_id);

-- affiliates
CREATE INDEX IF NOT EXISTS idx_affiliates_auth_user_id ON public.affiliates(auth_user_id);

-- blog_posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);

-- conversion_events
CREATE INDEX IF NOT EXISTS idx_conversion_events_order_id ON public.conversion_events(order_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_product_id ON public.conversion_events(product_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_visitor_tracking_id ON public.conversion_events(visitor_tracking_id);

-- customer_notes
CREATE INDEX IF NOT EXISTS idx_customer_notes_created_by ON public.customer_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer_id ON public.customer_notes(customer_id);

-- customers
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON public.customers(auth_user_id);

-- order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- page_views
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_tracking_id ON public.page_views(visitor_tracking_id);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- referrals
CREATE INDEX IF NOT EXISTS idx_referrals_order_id ON public.referrals(order_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_customer_id ON public.referrals(referred_customer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_customer_id ON public.referrals(referrer_customer_id);

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);

-- site_settings
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_by ON public.site_settings(updated_by);

-- social_media_posts
CREATE INDEX IF NOT EXISTS idx_social_media_posts_created_by ON public.social_media_posts(created_by);

-- support_tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer_id ON public.support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_order_id ON public.support_tickets(order_id);

-- ticket_messages
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender_id ON public.ticket_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);

-- visitor_tracking
CREATE INDEX IF NOT EXISTS idx_visitor_tracking_customer_id ON public.visitor_tracking(customer_id);
