# Seed 25,000 location pages (sitemap URLs)

The sitemap can list up to **25,000 location pages** plus static and blog URLs. Those location rows live in Supabase `seo_architecture`. The seed script fills that table.

## Option A: Run in GitHub Actions (recommended)

1. In **GitHub**: repo → **Settings** → **Secrets and variables** → **Actions**.
2. Add two secrets (get values from **Supabase** → your project → **Settings** → **API**):
   - **`VITE_SUPABASE_URL`** — Project URL (e.g. `https://xxxx.supabase.co`)
   - **`SUPABASE_SERVICE_KEY`** — `service_role` key (not the anon key)
3. Push to `clean-main` or go to **Actions** → **Deploy to Cloudflare Pages** → **Run workflow**.

The workflow will run the seed step; when it succeeds, the next deploy will have ~25K URLs in the sitemap.

## Option B: Run locally once

1. Get from **Supabase** → **Settings** → **API**:
   - Project URL
   - `service_role` secret key
2. In a terminal (from the project root):

   **PowerShell (Windows):**
   ```powershell
   $env:VITE_SUPABASE_URL = "https://your-project.supabase.co"
   $env:SUPABASE_SERVICE_KEY = "your-service-role-key"
   npm run seed:25k
   ```

   **Bash (Mac/Linux):**
   ```bash
   export VITE_SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_KEY="your-service-role-key"
   npm run seed:25k
   ```

3. Wait for the script to finish (inserts in batches of 500). Then deploy as usual; the live sitemap will include the new pages.

## Check that it worked

- **Admin**: Infrastructure & SEO → “X / 25,000 location pages” should show a number in the thousands.
- **Live**: Open `https://streamstickpro.com/sitemap.xml` and count `<loc>` tags (or check the “Verify sitemap” step in the latest Actions run).
