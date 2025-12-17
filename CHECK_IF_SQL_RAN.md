# 🔍 CHECK IF SUPABASE SQL WAS ALREADY RUN

## Quick Check Method:

**Go to:** Supabase Dashboard → SQL Editor → New Query

**Run this simple check:**

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'real_products' 
AND column_name IN ('cloaked_name', 'service_url', 'setup_video_url');
```

### What You'll See:

#### If SQL Was Already Run:
```
column_name
---------------
cloaked_name
service_url
setup_video_url
```
**(3 rows returned) = ✅ You're good! Skip the SQL step!**

#### If SQL Was NOT Run Yet:
```
(No rows returned)
```
**OR only 1-2 of the columns show up**

**(0-2 rows returned) = ❌ You NEED to run the SQL from Step 1!**

---

## Why This Matters:

### If You DON'T Have These Columns:
- ❌ Stripe checkout will fail or violate ToS
- ❌ Customers won't get login credentials in emails
- ❌ Products might not display correctly

### If You DO Have These Columns:
- ✅ Stripe gets compliant product names
- ✅ Emails include IPTV service URL
- ✅ Everything works as expected

---

## 💡 Quick Answer:

**Run the check query above.**

**If you see 3 rows:** Skip Step 1 (SQL), only do Steps 2-4 (secrets)

**If you see 0-2 rows:** Do ALL steps (SQL + secrets)

