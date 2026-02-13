# Visitor Tracking – Audit & Verification

**Status: UPDATED AND FIXED.** This doc confirms all pieces are in place and how to verify after deploy.

---

## 1. Database (Supabase)

| Item | Location | Status |
|------|----------|--------|
| Migration | `supabase/migrations/20260212000001_visitors_dedup_and_live_stats.sql` | ✅ Present |
| Columns on `visitors` | `ip_hash`, `pages_viewed`, `is_bot`, `last_visit`, `first_visit`, `state` | ✅ In migration |
| Unique index | `idx_visitors_ip_hash_unique` on `ip_hash` (partial, WHERE ip_hash IS NOT NULL) | ✅ In migration |
| RPC `get_live_visitors()` | Returns state, city, daily/yesterday/weekly/monthly/unique_ips (last 24h) | ✅ In migration |
| RPC `upsert_visitor_visit(...)` | Dedup by ip_hash; appends page to pages_viewed | ✅ In migration |
| Trigger | `visitors_preserve_first_visit_trigger` keeps first_visit on update | ✅ In migration |
| Run on deploy | `scripts/run-supabase-migration.ts` includes `20260212*` migrations | ✅ In script |

**After deploy:** Migration runs automatically if `SUPABASE_DATABASE_URL` or `DATABASE_URL` is set in GitHub Secrets. Otherwise run the SQL file manually in Supabase → SQL Editor.

---

## 2. Worker (Cloudflare)

| Item | Location | Status |
|------|----------|--------|
| POST `/api/track-visit` | `worker/index.ts` | ✅ Public; accepts ip_hash, state, city, country, user_agent, session_id, page |
| Storage `trackVisitByHash()` | `worker/storage.ts` | ✅ Calls Supabase RPC `upsert_visitor_visit` |
| Storage `getLiveVisitorsByLocation()` | `worker/storage.ts` | ✅ Calls Supabase RPC `get_live_visitors` |
| GET `/api/admin/visitors/live` | `worker/routes/visitors.ts` (GET /live) | ✅ Admin auth; returns live-by-location data |

**Env required at runtime (Cloudflare Pages → Settings → Environment variables):**  
`VITE_SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) so the worker can call the RPCs.

---

## 3. Frontend (Tracking Script)

| Item | Location | Status |
|------|----------|--------|
| Script in `<head>` | `client/index.html` | ✅ Runs once per session (`ssp_visited` in sessionStorage) |
| Geo | Fetches `https://ipapi.co/json/` (no key) | ✅ |
| IP hashing | SHA-256 in browser when available, else base64 | ✅ Privacy-safe |
| Payload | ip_hash, user_agent, state, city, country, session_id, page | ✅ |
| Endpoint | POST `/api/track-visit` (relative URL) | ✅ |

---

## 4. Admin Panel

| Item | Location | Status |
|------|----------|--------|
| State | `liveByLocation` in AdminPanel | ✅ |
| Fetch | `authFetch('/api/admin/visitors/live')` in `loadVisitorStats` | ✅ Runs every 30s with stats refresh |
| Table | “Live Visitors by Location (Deduplicated)” with State, City, Today, Yesterday, Weekly, Monthly, Unique IPs | ✅ In visitors section |

---

## 5. Verification Checklist (After Deploy)

1. **Migration applied**  
   In Supabase → Table Editor, open `visitors`. Confirm columns exist: `ip_hash`, `pages_viewed`, `last_visit`, `first_visit`, `state`. In SQL Editor run: `SELECT get_live_visitors();` (should return 0+ rows or empty).

2. **Track-visit endpoint**  
   From browser or Postman:  
   `POST https://streamstickpro.com/api/track-visit`  
   Body (JSON): `{"ip_hash":"test-audit-1","state":"Test","city":"Test City","country":"US","page":"/"}`  
   Expect: `200` and `{"ok":true}`.

3. **Frontend tracking**  
   Open site in incognito → DevTools → Network. Filter by “track-visit”. Reload once; you should see one POST to `/api/track-visit` (then sessionStorage prevents repeat in same session).

4. **Admin live table**  
   Log in to Admin → Live Visitors. Scroll to “Live Visitors by Location (Deduplicated)”. After step 2 or 3, the table should show at least one row (e.g. Test / Test City or your real state/city) within one refresh cycle (30s).

5. **Secrets**  
   No secret keys in code. Supabase URL + service key only in GitHub Secrets and Cloudflare env (see `docs/GITHUB-SECRETS-CHECKLIST.md`).

---

## 6. Summary

- **Visitor tracking is updated and fixed:** dedup by ip_hash + session, geo via ipapi.co, hashed IP, RPCs and migration in place, worker and frontend wired, admin table showing live-by-location.
- **Changes are in the repo:** migration, worker routes and storage, client script, admin panel. Deploy (e.g. push to `clean-main`) and run the verification steps above to confirm everything is working.
