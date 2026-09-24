-- Close tables the public key could read or change.
-- The live site worker uses the service role, which bypasses row level security.

drop policy if exists "Anyone can read admin credentials for login" on public.admin_credentials;
drop policy if exists "Only authenticated admins can modify credentials" on public.admin_credentials;
drop policy if exists "Allow all" on public.password_reset_tokens;
drop policy if exists "Allow all" on public.abandoned_carts;
drop policy if exists "Service role full access contacts" on public.contacts;
drop policy if exists "Service role full access email_campaigns" on public.email_campaigns;
drop policy if exists "Service role full access email_sends" on public.email_sends;
drop policy if exists "Public can read customer accounts" on public.customer_accounts;
drop policy if exists "Authenticated users can manage accounts" on public.customer_accounts;

revoke all on table public.admin_credentials from anon, authenticated, public;
revoke all on table public.password_reset_tokens from anon, authenticated, public;
revoke all on table public.abandoned_carts from anon, authenticated, public;
revoke all on table public.contacts from anon, authenticated, public;
revoke all on table public.email_campaigns from anon, authenticated, public;
revoke all on table public.email_sends from anon, authenticated, public;
revoke all on table public.customer_accounts from anon, authenticated, public;

alter view public."blogPosts" set (security_invoker = true);
revoke all on table public."blogPosts" from anon, authenticated, public;
grant select on table public."blogPosts" to anon, authenticated;

revoke all on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
grant execute on function public.has_role(uuid, public.app_role) to service_role;
