-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Fixes: "promotion could not run" when public.site_promotion does not exist.

-- 1) Table + default row + RLS
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

comment on table public.site_promotion is 'Active promo banner + Stripe price id override when checkout sends applySitePromotion for real_product_id';

insert into public.site_promotion (id)
  values ('default')
on conflict (id) do nothing;

alter table public.site_promotion enable row level security;

-- 2) API roles (worker should use service_role key in Cloudflare)
grant select, insert, update, delete on table public.site_promotion to postgres;
grant select, insert, update, delete on table public.site_promotion to service_role;

-- 3) Optional: shadow_products promo label (admin sync); skip if table missing
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'shadow_products'
  ) then
    alter table public.shadow_products add column if not exists card_promo_label text;
  end if;
end $$;
