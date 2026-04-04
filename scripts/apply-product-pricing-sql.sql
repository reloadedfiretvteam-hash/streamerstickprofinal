-- Run once in Supabase: Dashboard → SQL Editor → paste → Run.
-- Required for admin "Regular price / Sale price / Product card promo ribbon" and Stripe sync
-- to work without errors. Safe to re-run (IF NOT EXISTS).

-- Sale amount (cents) and optional ribbon on live + shadow product cards
alter table public.real_products add column if not exists sale_price integer;
alter table public.real_products add column if not exists card_promo_label text;

comment on column public.real_products.sale_price is 'Promotional price in cents; must be < price when set. Admin save creates a matching Stripe price on shadow_price_id.';
comment on column public.real_products.card_promo_label is 'Short label on product cards (e.g. Limited time).';

-- Admin panel syncs shadow_products when present
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'shadow_products'
  ) then
    alter table public.shadow_products add column if not exists card_promo_label text;
    -- If your shadow_products table tracks sale display locally (optional legacy columns):
    alter table public.shadow_products add column if not exists sale_price integer;
  end if;
end $$;
