# 🚀 How to Run IPTV Campaign Posts Seeder

## Quick Start

### Option 1: Using tsx (Recommended)

```bash
npx tsx scripts/run-iptv-campaign-seed.ts
```

### Option 2: Using Node with TypeScript

```bash
npm run build
node dist/scripts/run-iptv-campaign-seed.js
```

### Option 3: Using ts-node

```bash
npx ts-node scripts/run-iptv-campaign-seed.ts
```

## Prerequisites

1. **Environment Variables Required:**
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_KEY` - Your Supabase service role key

2. **Set Environment Variables:**
   ```bash
   export SUPABASE_URL=https://emlqlmfzqsnqokrqvmcm.supabase.co
   export SUPABASE_SERVICE_KEY=your-service-key-here
   ```

   Or create a `.env` file:
   ```
   SUPABASE_URL=https://emlqlmfzqsnqokrqvmcm.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key-here
   ```

## What This Script Does

1. ✅ Creates 60 SEO-optimized blog posts
2. ✅ All posts link back to `https://streamstickpro.com`
3. ✅ All posts promote free trials
4. ✅ Covers all IPTV setup topics:
   - IPTV Smarters Pro setup (10 posts)
   - Downloader app setup (10 posts)
   - Fire Stick setup (10 posts)
   - ONN device setup (10 posts)
   - Smart TV & Google TV setup (10 posts)
   - Media players & IPTV players (10 posts)

## Expected Output

```
🚀 Starting IPTV Setup Campaign Posts Generation...
📝 Generating 60 SEO-optimized posts...

✅ Progress: 10/60 posts created...
✅ Progress: 20/60 posts created...
✅ Progress: 30/60 posts created...
✅ Progress: 40/60 posts created...
✅ Progress: 50/60 posts created...
✅ Progress: 60/60 posts created...

🎉 IPTV Setup Campaign Posts Generation Complete!
✅ Successfully created: 60 posts
⏭️  Skipped (already exist): 0 posts
❌ Errors: 0 posts

📈 Your website now has 60 new SEO-optimized IPTV setup posts!
🔗 All posts link back to https://streamstickpro.com and promote free trials!
```

## After Running

1. ✅ Check Admin Panel → Blog → Posts (should see 60 new posts)
2. ✅ Verify posts are published and visible
3. ✅ Check that homepage links work correctly
4. ✅ Verify free trial links work
5. ✅ Monitor Google Search Console for new impressions

## Troubleshooting

**Error: SUPABASE_SERVICE_KEY not set**
- Set environment variable before running script
- Or add to `.env` file

**Error: Cannot connect to Supabase**
- Check SUPABASE_URL is correct
- Verify SUPABASE_SERVICE_KEY is valid
- Check internet connection

**Posts not appearing?**
- Check database connection
- Verify posts are marked as published
- Check blog posts table in Supabase

## Manual Check

To verify posts were created:
1. Go to Admin Panel
2. Navigate to Blog → Posts
3. Filter by category "Setup Guides"
4. Should see all 60 posts

---

**Ready to deploy!** Run the script and watch your blog grow with 60 SEO-optimized posts! 🚀
