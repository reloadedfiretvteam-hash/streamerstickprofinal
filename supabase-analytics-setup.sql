-- ============================================
-- Supabase Analytics Setup SQL
-- ============================================
-- Run this in your Supabase SQL Editor to set up
-- the analytics tables and functions for page view tracking.
-- ============================================

-- Table for aggregated page views
create table if not exists analytics_page_views (
  id bigserial primary key,
  path text not null,
  views bigint not null default 1,
  last_view_at timestamptz not null default timezone('utc'::text, now()),
  constraint analytics_page_views_path_unique unique (path)
);

-- Table for individual visits (for live list)
create table if not exists analytics_visits (
  id bigserial primary key,
  session_id uuid not null,
  path text not null,
  ip_hash text,
  user_agent text,
  country text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- Index for faster queries
create index if not exists idx_analytics_visits_created_at on analytics_visits(created_at desc);
create index if not exists idx_analytics_visits_session_id on analytics_visits(session_id);
create index if not exists idx_analytics_page_views_path on analytics_page_views(path);

-- Function to log page views (upserts aggregated views and logs individual visit)
create or replace function public.log_page_view(
  p_path text,
  p_session_id uuid,
  p_ip_hash text,
  p_user_agent text,
  p_country text
)
returns void
language plpgsql
as $$
begin
  -- upsert aggregated views
  if exists (select 1 from analytics_page_views where path = p_path) then
    update analytics_page_views
    set
      views = views + 1,
      last_view_at = timezone('utc'::text, now())
    where path = p_path;
  else
    insert into analytics_page_views (path)
    values (p_path);
  end if;

  -- insert individual visit row
  insert into analytics_visits (session_id, path, ip_hash, user_agent, country)
  values (p_session_id, p_path, p_ip_hash, p_user_agent, p_country);
end;
$$;

-- Enable Row Level Security (RLS)
alter table analytics_page_views enable row level security;
alter table analytics_visits enable row level security;

-- Policy for service role (backend API calls)
create policy "allow service role full access on analytics"
on analytics_page_views
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "allow service role full access on visits"
on analytics_visits
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Policy for anon key (browser/admin UI reads)
-- Adjust these based on your security needs
create policy "allow anon read on analytics_page_views"
on analytics_page_views
for select
using (true);

create policy "allow anon read on analytics_visits"
on analytics_visits
for select
using (true);

-- ============================================
-- Next Steps:
-- ============================================
-- 1. Go to Supabase Dashboard → Database → Replication → Realtime
-- 2. Enable Realtime for:
--    - public.analytics_page_views
--    - public.analytics_visits
-- ============================================

