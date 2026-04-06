-- Persist order fields needed for existing-customer branching and post-payment account-result handling.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'existing_username'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN existing_username TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'expired_more_than_one_week'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN expired_more_than_one_week BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'provisioning_branch'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN provisioning_branch TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'generated_username'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN generated_username TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'generated_password'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN generated_password TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'country_preference'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN country_preference TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_message'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN customer_message TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN customer_phone TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_existing_username ON public.orders(existing_username);
CREATE INDEX IF NOT EXISTS idx_orders_provisioning_branch ON public.orders(provisioning_branch);

COMMENT ON COLUMN public.orders.existing_username IS 'Username submitted by an existing customer during checkout.';
COMMENT ON COLUMN public.orders.expired_more_than_one_week IS 'Customer-selected signal that their prior account has been expired long enough to allow safe new-account fallback.';
COMMENT ON COLUMN public.orders.provisioning_branch IS 'Provisioning decision branch for webhook and manual-review flows.';
COMMENT ON COLUMN public.orders.generated_username IS 'Provisioned or fallback-generated IPTV username tied to the order result.';
COMMENT ON COLUMN public.orders.generated_password IS 'Provisioned or fallback-generated IPTV password tied to the order result.';
COMMENT ON COLUMN public.orders.country_preference IS 'Selected country or bouquet preference captured at checkout.';
COMMENT ON COLUMN public.orders.customer_message IS 'Customer notes captured at checkout.';
COMMENT ON COLUMN public.orders.customer_phone IS 'Customer phone captured at checkout.';
