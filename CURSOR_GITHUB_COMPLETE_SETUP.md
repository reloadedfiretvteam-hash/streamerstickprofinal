# ✅ Cursor GitHub Setup - Complete Credentials

## 🔑 Your GitHub OAuth Credentials

**Client ID:**
```
Ov23li8nE3AwKUlpqzrm
```

**Client Secret:**
```
a04bbcd0203c1931c67a5e3e303d6555c8c2b99b
```

---

## 🚀 How to Configure in Cursor

### Method 1: Via Settings (Recommended)

1. **Open Cursor Settings:**
   - Press `Ctrl+,` (Windows) or `Cmd+,` (Mac)
   - Or: File → Preferences → Settings

2. **Search for GitHub:**
   - In the settings search bar, type: `github`
   - Look for "GitHub" or "Git" settings

3. **Enter Credentials:**
   - **GitHub Client ID:** `Ov23li8nE3AwKUlpqzrm`
   - **GitHub Client Secret:** `a04bbcd0203c1931c67a5e3e303d6555c8c2b99b`

4. **Save and Authorize:**
   - Click "Save" or "Apply"
   - Click "Authorize" or "Connect to GitHub"
   - A browser window will open for authorization

### Method 2: Via Command Palette

1. **Open Command Palette:**
   - Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)

2. **Search for GitHub:**
   - Type: `GitHub: Sign In`
   - Or: `GitHub: Connect`
   - Or: `GitHub: Authorize`

3. **Follow the prompts:**
   - Enter Client ID when asked
   - Enter Client Secret when asked
   - Complete authorization in browser

### Method 3: Via Settings JSON

1. **Open Settings JSON:**
   - Press `Ctrl+Shift+P` → Type: `Preferences: Open User Settings (JSON)`

2. **Add these lines:**
```json
{
  "github.clientId": "Ov23li8nE3AwKUlpqzrm",
  "github.clientSecret": "a04bbcd0203c1931c67a5e3e303d6555c8c2b99b"
}
```

3. **Save the file**
4. **Restart Cursor**
5. **Authorize via Command Palette:** `GitHub: Sign In`

---

## ✅ Verification Steps

After configuration, verify it's working:

1. **Check Status Bar:**
   - Look at the bottom of Cursor
   - You should see a GitHub icon or "GitHub: Connected"

2. **Test Git Operations:**
   - Try: `Ctrl+Shift+G` to open Source Control
   - You should be able to push/pull without password prompts

3. **Check Command Palette:**
   - `Ctrl+Shift+P` → Type: `GitHub`
   - You should see GitHub-related commands available

---

## 🔧 Troubleshooting

### If Settings Don't Appear

**Cursor might use a different method:**

1. **Check for "Accounts" section:**
   - Settings → Accounts → GitHub
   - Or: Settings → Integrations → GitHub

2. **Look for "Source Control" settings:**
   - Settings → Source Control → GitHub
   - Or: Settings → Git → GitHub

3. **Check Cursor Documentation:**
   - Help → Documentation
   - Search for "GitHub integration"

### If Authorization Fails

1. **Verify OAuth App Settings on GitHub:**
   - Go to: https://github.com/settings/developers
   - Check your OAuth App has:
     - Homepage URL: `https://cursor.sh`
     - Callback URL: `https://cursor.sh/auth/github/callback`

2. **Check Credentials:**
   - Make sure no extra spaces
   - Copy-paste directly (don't type manually)

3. **Try Regenerating Secret:**
   - On GitHub, generate a new Client Secret
   - Update it in Cursor

### Alternative: Use Personal Access Token

If OAuth doesn't work, use a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `repo` scope
4. Copy token (starts with `ghp_`)
5. In Cursor: Settings → GitHub → Personal Access Token
6. Paste the token

---

## 📝 Quick Reference

**Your Complete Setup:**
- ✅ Client ID: `Ov23li8nE3AwKUlpqzrm`
- ✅ Client Secret: `a04bbcd0203c1931c67a5e3e303d6555c8c2b99b`
- ✅ Homepage URL: `https://cursor.sh`
- ✅ Callback URL: `https://cursor.sh/auth/github/callback`

---

## ⚠️ Security Reminder

- **Keep these credentials private**
- **Don't commit them to GitHub**
- **Don't share them publicly**
- If compromised, regenerate the Client Secret immediately

---

## 🎯 Next Steps After Setup

Once GitHub is connected in Cursor:

1. ✅ You can push/pull without entering credentials
2. ✅ Cursor can access your repositories
3. ✅ You can use GitHub Copilot features (if enabled)
4. ✅ Source control operations will be seamless

**Ready to push your project?** Use the scripts we created earlier:
- `.\push-to-github.ps1` (automated)
- Or follow `PUSH_NOW.md` (manual steps)

