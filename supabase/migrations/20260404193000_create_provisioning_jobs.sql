-- Durable queue for IPTV/panel provisioning after payment confirmation.
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

COMMENT ON TABLE public.provisioning_jobs IS 'Queue of post-payment IPTV/panel provisioning jobs.';
COMMENT ON COLUMN public.provisioning_jobs.status IS 'pending, processing, retry, completed, failed, or manual_review.';
COMMENT ON COLUMN public.provisioning_jobs.provider IS 'Provisioning backend used for execution, e.g. queued_local, xui_api, browser_automation.';
COMMENT ON COLUMN public.provisioning_jobs.payload IS 'Serialized provisioning request context.';
COMMENT ON COLUMN public.provisioning_jobs.result IS 'Serialized provisioning outcome context.';
