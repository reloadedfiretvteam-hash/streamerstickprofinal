# GitHub OAuth Setup Information

## 📋 Information for GitHub OAuth Application

If you're setting up GitHub OAuth for your StreamStickPro application, here's what you need:

### 1. Application Name
```
StreamStickPro
```

### 2. Homepage URL
```
https://streamstickpro.com
```

### 3. Authorization Callback URL
```
https://streamstickpro.com/auth/github/callback
```

**Alternative callback URLs** (depending on your routing setup):
- `https://streamstickpro.com/api/auth/github/callback`
- `https://streamstickpro.com/callback/github`
- `https://streamstickpro.com/auth/callback`

### 4. For Development/Local Testing
If you need to test locally:
```
http://localhost:5173/auth/github/callback
```
(Replace `5173` with your local dev server port)

---

## 🔧 How to Set Up GitHub OAuth

### Step 1: Create OAuth App on GitHub

1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"** (or **"New GitHub App"**)
3. Fill in:
   - **Application name:** `StreamStickPro`
   - **Homepage URL:** `https://streamstickpro.com`
   - **Authorization callback URL:** `https://streamstickpro.com/auth/github/callback`
4. Click **"Register application"**
5. **Copy your Client ID and Client Secret** (you'll need these)

### Step 2: Add to Your Project

Add these environment variables to your `.env` file:

```env
VITE_GITHUB_CLIENT_ID=your_client_id_here
VITE_GITHUB_CLIENT_SECRET=your_client_secret_here
VITE_GITHUB_CALLBACK_URL=https://streamstickpro.com/auth/github/callback
```

### Step 3: Update Cloudflare Pages Environment Variables

1. Go to Cloudflare Dashboard → Your Project → Settings → Environment Variables
2. Add the same variables (without `VITE_` prefix for server-side)

---

## 📝 Project URLs Summary

### Production URLs
- **Main Domain:** `https://streamstickpro.com`
- **WWW Domain:** `https://www.streamstickpro.com`
- **Cloudflare Pages:** `https://streamstickpro.pages.dev`

### API/Webhook URLs
- **NOWPayments Webhook:** `https://streamstickpro.com/api/nowpayments-webhook`
- **GitHub OAuth Callback:** `https://streamstickpro.com/auth/github/callback`

---

## 🔐 Security Notes

1. **Never commit** your Client Secret to GitHub
2. Store secrets in environment variables only
3. Use HTTPS for all callback URLs
4. Validate the callback state parameter to prevent CSRF attacks

---

## 📚 GitHub Repository Information

If you're just pushing code (not OAuth), you need:

### Repository URL Format
```
https://github.com/YOUR_USERNAME/streamerstickprofinal.git
```

### To Find Your Repository URL:
1. Go to your GitHub repository
2. Click the green **"Code"** button
3. Copy the HTTPS URL

---

## ❓ Which One Do You Need?

- **Pushing code to GitHub?** → Use the repository URL format above
- **Setting up GitHub login for users?** → Use the OAuth callback URL: `https://streamstickpro.com/auth/github/callback`
- **Connecting Cloudflare to GitHub?** → Use the repository URL when connecting in Cloudflare Pages

