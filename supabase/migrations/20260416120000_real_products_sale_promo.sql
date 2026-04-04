-- Per-product sale pricing (cents) and optional card ribbon text (live + shadow UI).
-- Checkout uses shadow_price_id created for the *effective* charge (sale if valid, else regular).
alter table public.real_products add column if not exists sale_price integer;
alter table public.real_products add column if not exists card_promo_label text;

comment on column public.real_products.sale_price is 'Promotional price in cents; must be < price when set. shadow_price_id must be synced to this amount via admin save.';
comment on column public.real_products.card_promo_label is 'Short label on product cards (e.g. Limited time).';

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'shadow_products'
  ) then
    alter table public.shadow_products add column if not exists card_promo_label text;
  end if;
end $$;
