# Admin Panel Test Data – Instructions

Use this test data to confirm your Admin Panel (Products and Blog tabs) is working.

---

## Quick Steps

1. **Open Supabase Dashboard** → your project → **SQL Editor**.
2. Open the file:  
   `supabase/seed-test-data-admin-panel.sql`
3. **Copy the whole file** and paste it into the SQL Editor.
4. Click **Run**.
5. Open your site → **Admin Panel** → refresh the **Products** and **Blog** tabs.

You should see:
- **Products**: 3 test products (e.g. StreamStick Starter Kit, 4K Kit, Live TV 1 Month)
- **Blog**: 1 test post (“Test Post – Admin Panel Check”)

---

## If Products Don’t Appear

Your database may use a different schema. In that case:

- If you get: **`column image_url does not exist`** or **`relation real_products does not exist`**
- Open `supabase/seed-test-data-admin-panel.sql` and look for **OPTION B** (commented block).
- Uncomment the block under “OPTION B” and comment out or remove **OPTION A**.
- Run the script again.

---

## If Blog Doesn’t Appear

If you get **`column is_published does not exist`**:

1. In Supabase SQL Editor, run:
   ```sql
   ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
   UPDATE blog_posts SET is_published = (status = 'published') WHERE is_published IS NULL;
   ```
2. Re-run the seed file.

---

## Still Not Seeing Data?

- Ensure you’re logged in with an **admin** account.
- Check the browser **Network** tab (F12) for `/api/admin/products` and `/api/admin/blog/posts` – if these return 403 or 500, it’s an auth or API issue.
- In Supabase, check **RLS policies** on `real_products` and `blog_posts` so your admin user can read these tables.
