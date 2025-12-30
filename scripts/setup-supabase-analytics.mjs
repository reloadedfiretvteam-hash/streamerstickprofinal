#!/usr/bin/env node
// Set up Supabase analytics tables and functions via API

const SUPABASE_URL = 'https://emlqlmfzqsnqokrqvmcm.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY');
  console.error('Get it from: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/settings/api');
  process.exit(1);
}

const SQL_SETUP = `
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

-- Function to log page views
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
drop policy if exists "allow service role full access on analytics" on analytics_page_views;
create policy "allow service role full access on analytics"
on analytics_page_views
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists "allow service role full access on visits" on analytics_visits;
create policy "allow service role full access on visits"
on analytics_visits
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- Policy for anon key (browser/admin UI reads)
drop policy if exists "allow anon read on analytics_page_views" on analytics_page_views;
create policy "allow anon read on analytics_page_views"
on analytics_page_views
for select
using (true);

drop policy if exists "allow anon read on analytics_visits" on analytics_visits;
create policy "allow anon read on analytics_visits"
on analytics_visits
for select
using (true);
`;

async function setupSupabase() {
  console.log('🚀 Setting up Supabase analytics...\n');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: SQL_SETUP })
    });

    if (response.ok) {
      console.log('✅ Supabase analytics tables created successfully!\n');
      return true;
    } else {
      // Try alternative method - direct SQL endpoint
      console.log('Trying alternative method...\n');
      const altResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: SQL_SETUP
      });
      
      if (!altResponse.ok) {
        const errorText = await altResponse.text();
        console.error('❌ Failed to set up Supabase:', errorText);
        console.error('\n📝 Manual setup required:');
        console.error('1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new');
        console.error('2. Copy and paste the SQL from: supabase-analytics-setup.sql');
        console.error('3. Click "Run"');
        return false;
      }
    }
    
    console.log('✅ Supabase analytics setup complete!\n');
    console.log('📝 Next: Enable Realtime in Supabase Dashboard:');
    console.log('   Database → Replication → Realtime → Enable for:');
    console.log('   - public.analytics_page_views');
    console.log('   - public.analytics_visits\n');
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up Supabase:', error.message);
    console.error('\n📝 Manual setup required:');
    console.error('1. Go to: https://supabase.com/dashboard/project/emlqlmfzqsnqokrqvmcm/sql/new');
    console.error('2. Copy and paste the SQL from: supabase-analytics-setup.sql');
    console.error('3. Click "Run"');
    return false;
  }
}

setupSupabase();

