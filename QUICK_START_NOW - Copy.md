# ⚡ QUICK START - DO THIS NOW

## 🎯 IMMEDIATE ACTIONS

### 1. Restart Cursor (For MCP Connection)
- Close Cursor completely
- Reopen Cursor
- MCP GitHub connection will activate

### 2. Verify Repository Exists
Go to: https://github.com/reloadedfiretvteam-hash/streamstickpro

**If it doesn't exist, create it:**
- Go to: https://github.com/new
- Name: `streamstickpro`
- Owner: `reloadedfiretvteam-hash`
- **Don't initialize** with anything
- Click "Create repository"

### 3. Push Your Code
```bash
git add .
git commit -m "Full website - streamstickpro - Square integration"
git push -u origin main
```

### 4. Connect Cloudflare
1. Go to: https://dash.cloudflare.com
2. Pages → Create Project
3. Connect to: `reloadedfiretvteam-hash/streamstickpro`
4. Build command: `npm run build`
5. Output directory: `dist`

### 5. Add Environment Variables
In Cloudflare Pages → Settings → Environment Variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_ACCESS_TOKEN=your_square_token
SQUARE_LOCATION_ID=your_square_location
SQUARE_ENVIRONMENT=sandbox
```

---

## ✅ CHECKLIST

- [ ] Cursor restarted (MCP active)
- [ ] GitHub repo `streamstickpro` exists
- [ ] Code pushed to GitHub
- [ ] Cloudflare connected to repo
- [ ] Environment variables added
- [ ] Build successful in Cloudflare

---

**That's it! Your site will auto-deploy.**

