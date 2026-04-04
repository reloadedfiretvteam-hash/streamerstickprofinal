# 🔐 MCP Blueprint - GitHub Token Configuration

## Token Used
```
[REDACTED — GitHub PAT; use gh auth login or SSH]
```

## Configuration Steps

### 1. Set Remote URL with Token
```bash
git remote set-url origin https://[REDACTED — GitHub PAT; use gh auth login or SSH]@github.com/reloadedfiretvteam-hash/streamstickprofinal.git
```

### 2. Stage All Changes
```bash
git add -A
```

### 3. Commit All Fixes
```bash
git commit -m "COMPLETE FIX PACKAGE: AppRouter fix, MediaCarousel removed, credentials generator, 50% OFF, Supabase images, admin 404 fix, all routes verified, complete audit"
```

### 4. Force Push to clean-main
```bash
git push origin clean-main --force
```

### 5. Force Push to main (for Cloudflare)
```bash
git push origin clean-main:main --force
```

## Complete Script (Copy/Paste)

```bash
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

# Configure remote with token
git remote set-url origin https://[REDACTED — GitHub PAT; use gh auth login or SSH]@github.com/reloadedfiretvteam-hash/streamstickprofinal.git

# Stage all changes
git add -A

# Commit all fixes
git commit -m "COMPLETE FIX PACKAGE: AppRouter fix, MediaCarousel removed, credentials generator, 50% OFF, Supabase images, admin 404 fix, all routes verified, complete audit"

# Force push to clean-main
git push origin clean-main --force

# Force push to main (for Cloudflare)
git push origin clean-main:main --force

# Verify
git log --oneline -3
```

## PowerShell Script Version

```powershell
cd "C:\Users\rdela\Downloads\New folder\project-bolt-sb1-19o8d5ja\project\streamerstickprofinal"

# Configure remote with token
git remote set-url origin https://[REDACTED — GitHub PAT; use gh auth login or SSH]@github.com/reloadedfiretvteam-hash/streamstickprofinal.git

# Stage all changes
git add -A

# Commit all fixes
git commit -m "COMPLETE FIX PACKAGE: AppRouter fix, MediaCarousel removed, credentials generator, 50% OFF, Supabase images, admin 404 fix, all routes verified, complete audit"

# Force push to clean-main
git push origin clean-main --force

# Force push to main (for Cloudflare)
git push origin clean-main:main --force

# Verify
git log --oneline -3

Write-Host "✅ Push complete! Check GitHub and Cloudflare." -ForegroundColor Green
```

## Security Note

⚠️ **Token is embedded in remote URL. For security:**
- After push, consider removing token from URL
- Use credential helper for future pushes
- Token has repo access - keep secure

## Remove Token from URL (After Push)

```bash
git remote set-url origin https://github.com/reloadedfiretvteam-hash/streamstickprofinal.git
```

Then use credential helper or SSH for future pushes.

---

**This blueprint can be reused for future pushes if needed.**


