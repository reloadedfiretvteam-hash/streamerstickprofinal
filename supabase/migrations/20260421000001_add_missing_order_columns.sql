-- Add missing columns to orders table that are referenced in the application code
DO 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_message'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN customer_message TEXT;
    COMMENT ON COLUMN public.orders.customer_message IS 'Optional message from customer during checkout';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN customer_phone TEXT;
    COMMENT ON COLUMN public.orders.customer_phone IS 'Customer contact phone number from checkout';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'purchase_code'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN purchase_code TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_purchase_code ON public.orders(purchase_code) WHERE purchase_code IS NOT NULL;
    COMMENT ON COLUMN public.orders.purchase_code IS 'Unique purchase code for order tracking (format: PC-XXXXX)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'service_url'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN service_url TEXT DEFAULT 'http://ky-tv.cc';
    COMMENT ON COLUMN public.orders.service_url IS 'IPTV service portal URL sent to customer';
  END IF;
END ;

-- Ensure provisioning_jobs table exists
CREATE TABLE IF NOT EXISTS public.provisioning_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  job_type text NOT NULL DEFAULT 'iptv_order',
  status text NOT NULL DEFAULT 'pending',
  provider text,
  payload text,
  result text,
  last_error text,
  attempt_count integer NOT NULL DEFAULT 0,
  next_run_at timestamptz DEFAULT now(),
  locked_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_provisioning_jobs_order_id ON public.provisioning_jobs(order_id);
CREATE INDEX IF NOT EXISTS idx_provisioning_jobs_status ON public.provisioning_jobs(status);
CREATE INDEX IF NOT EXISTS idx_provisioning_jobs_next_run_at ON public.provisioning_jobs(next_run_at);