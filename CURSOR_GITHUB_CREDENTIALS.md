# Cursor GitHub OAuth Credentials

## ✅ Your Client ID
```
Ov23li8nE3AwKUlpqzrm
```

## 🔑 Next Steps

### Step 1: Get Your Client Secret

1. Go to: https://github.com/settings/developers
2. Click on **"OAuth Apps"** in the left sidebar
3. Find your **"Cursor"** application (or the app with Client ID: `Ov23li8nE3AwKUlpqzrm`)
4. Click on the application name
5. You'll see:
   - **Client ID:** `Ov23li8nE3AwKUlpqzrm` ✅ (you have this)
   - **Client Secret:** `ghp_...` or `github_...` (you need this!)
6. Click **"Generate a new client secret"** if you don't see one, or copy the existing one

### Step 2: Configure in Cursor

1. Open **Cursor Settings**
   - Press `Ctrl+,` (or `Cmd+,` on Mac)
   - Or go to: File → Preferences → Settings

2. Search for **"GitHub"** in settings

3. Enter your credentials:
   - **GitHub Client ID:** `Ov23li8nE3AwKUlpqzrm`
   - **GitHub Client Secret:** `[paste your secret here]`

4. Click **"Authorize"** or **"Connect to GitHub"**

### Step 3: Authorize Cursor

After entering credentials, Cursor will:
1. Open a browser window
2. Ask you to authorize Cursor on GitHub
3. Redirect back to Cursor
4. Confirm the connection

---

## 🔍 Alternative: Check Cursor Settings Location

If you can't find GitHub settings in Cursor:

1. **Check Command Palette:**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type: `GitHub: Sign In`
   - Follow the prompts

2. **Check Account Settings:**
   - Look for "Accounts" or "Integrations" in settings
   - Find GitHub connection option

3. **Check Status Bar:**
   - Look at the bottom of Cursor window
   - There might be a GitHub icon to click

---

## 📝 Quick Reference

**Your OAuth App Details:**
- **Application Name:** Cursor (or your custom name)
- **Client ID:** `Ov23li8nE3AwKUlpqzrm`
- **Client Secret:** [Get from GitHub Developer Settings]
- **Homepage URL:** `https://cursor.sh`
- **Callback URL:** `https://cursor.sh/auth/github/callback`

---

## ⚠️ Important Notes

1. **Client Secret is sensitive** - Don't share it publicly
2. **If you lose the secret** - You can generate a new one (the old one will stop working)
3. **Keep these credentials secure** - They give access to your GitHub account

---

## 🆘 Troubleshooting

**If authorization fails:**
- Make sure the callback URL in GitHub matches: `https://cursor.sh/auth/github/callback`
- Check that the Client ID and Secret are correct (no extra spaces)
- Try regenerating the Client Secret
- Check Cursor's GitHub integration documentation

**If you can't find GitHub settings in Cursor:**
- Cursor might use a different method (like Personal Access Token)
- Check Cursor's documentation or help menu
- Look for "Source Control" or "Git" settings instead

---

## 🔄 Using Personal Access Token Instead

If OAuth is too complex, you can use a Personal Access Token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Name it: `Cursor Access`
4. Select scope: `repo` (full control)
5. Click **"Generate token"**
6. Copy the token (starts with `ghp_`)
7. In Cursor, look for "GitHub Token" or "Personal Access Token" field
8. Paste the token there

This is often simpler and works just as well!

