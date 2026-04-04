-- Single-row site promotion: homepage (real) + shadow storefront + Stripe promo price id
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
