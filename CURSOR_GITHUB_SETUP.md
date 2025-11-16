# Cursor GitHub Authorization Setup

## 🔗 URLs for Cursor GitHub OAuth Application

When setting up Cursor as a GitHub OAuth App, use these URLs:

### Homepage URL
```
https://cursor.sh
```

### Authorization Callback URL
```
https://cursor.sh/auth/github/callback
```

**Alternative callback URLs** (if the above doesn't work):
- `https://www.cursor.sh/auth/github/callback`
- `https://cursor.sh/callback/github`
- `https://api.cursor.sh/auth/github/callback`

---

## 📋 Step-by-Step Setup

### Step 1: Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"**
4. Fill in the form:
   - **Application name:** `Cursor`
   - **Homepage URL:** `https://cursor.sh`
   - **Authorization callback URL:** `https://cursor.sh/auth/github/callback`
5. Click **"Register application"**
6. **Copy your Client ID and Client Secret**

### Step 2: Configure in Cursor

1. Open Cursor Settings
2. Go to **"GitHub"** or **"Integrations"** section
3. Enter:
   - **Client ID:** (from step 1)
   - **Client Secret:** (from step 1)
4. Click **"Authorize"** or **"Connect"**

---

## 🔍 If You Need to Find Cursor's Exact URLs

If the standard URLs don't work, check:

1. **Cursor Documentation:**
   - Visit: https://cursor.sh/docs
   - Look for "GitHub Integration" or "OAuth Setup"

2. **Check Cursor Settings:**
   - Open Cursor → Settings → GitHub
   - Look for any displayed callback URL

3. **Contact Cursor Support:**
   - They can provide the exact callback URL format

---

## ✅ Quick Reference

**For GitHub OAuth App Registration:**
- **Application name:** `Cursor`
- **Homepage URL:** `https://cursor.sh`
- **Callback URL:** `https://cursor.sh/auth/github/callback`

---

## 🔐 Security Notes

- Keep your Client Secret secure
- Don't share it publicly
- Revoke and regenerate if compromised

---

## 📚 Alternative: Personal Access Token

If OAuth setup is complex, you can also use a **Personal Access Token**:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token
5. Use it in Cursor's GitHub settings

This is simpler and works for most use cases!

