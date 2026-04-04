-- =============================================================================
-- StreamStickPro — one-shot Supabase fix (run in Dashboard → SQL → New query)
-- =============================================================================
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT DO NOTHING where applicable.
--
-- SECURITY: Never paste service_role JWTs in chat, code, or tickets. If exposed,
-- rotate immediately: Project Settings → API → regenerate "service_role" secret,
-- then update Cloudflare / worker env vars only in the dashboard.
--
-- After run: wait ~1 min or execute the NOTIFY at the bottom so PostgREST picks
-- up new tables/columns.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) Site-wide promotion (admin + public read via worker)
-- ---------------------------------------------------------------------------
create table if not exists public.site_promotion (
  id text primary key default 'default',
  is_active boolean not null default false,
  headline text not null default '',
  subheadline text,
  cta_label text default 'Claim offer',
  real_product_id text not null default '',
  promo_shadow_price_id text not null default '',
  promo_amount_cents integer not null default 0,
  shadow_headline text,
  shadow_subheadline text,
  ends_at timestamptz,
  updated_at timestamptz default now()
);

comment on table public.site_promotion is
  'Homepage/shadow banner; checkout uses promo_shadow_price_id when applySitePromotion matches real_product_id.';

insert into public.site_promotion (id)
values ('default')
on conflict (id) do nothing;

alter table public.site_promotion enable row level security;

-- Table-level rights (worker uses service_role; service_role bypasses RLS)
grant select, insert, update, delete on table public.site_promotion to postgres;
grant select, insert, update, delete on table public.site_promotion to service_role;

-- ---------------------------------------------------------------------------
-- 2) Per-product sale price + card ribbon (real_products + optional shadow_products)
-- ---------------------------------------------------------------------------
alter table public.real_products add column if not exists sale_price integer;
alter table public.real_products add column if not exists card_promo_label text;

comment on column public.real_products.sale_price is
  'Promotional price in cents; must be < price when set. Sync Stripe shadow_price_id via admin.';
comment on column public.real_products.card_promo_label is
  'Short ribbon on product cards (e.g. Limited time).';

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'shadow_products'
  ) then
    alter table public.shadow_products add column if not exists card_promo_label text;
    alter table public.shadow_products add column if not exists sale_price integer;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 3) Optional: shadow_products ribbon only (if block above skipped table)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'shadow_products'
  ) then
    alter table public.shadow_products add column if not exists card_promo_label text;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4) Nudge PostgREST to reload schema cache (new table/columns)
-- ---------------------------------------------------------------------------
select pg_notify('pgrst', 'reload schema');

-- Done. Verify:
--   select * from public.site_promotion where id = 'default';
--   select column_name from information_schema.columns
--     where table_schema = 'public' and table_name = 'real_products'
--     and column_name in ('sale_price', 'card_promo_label');
