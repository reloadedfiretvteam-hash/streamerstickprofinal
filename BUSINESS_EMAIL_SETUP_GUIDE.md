# 📧 BUSINESS EMAIL SETUP GUIDE
## streamstickpro.com Professional Email System

---

## ✅ YOUR DOMAIN INFORMATION (VERIFIED)

**Domain:** `streamstickpro.com`
**Status:** ✅ Active on Cloudflare
**Zone ID:** `afa438852c5c0164bd263889401b36fb`
**Name Servers:**
- kate.ns.cloudflare.com
- mike.ns.cloudflare.com

**Cloudflare Account:** Reloadedfiretvteam@gmail.com's Account
**Plan:** Free Website

---

## 🎯 WHAT YOU'LL GET

Create unlimited professional email addresses that forward to your Gmail:

✉️ **Business Emails:**
- `admin@streamstickpro.com`
- `support@streamstickpro.com`
- `sales@streamstickpro.com`
- `orders@streamstickpro.com`
- `info@streamstickpro.com`
- `noreply@streamstickpro.com`

All emails forward to: `reloadedfiretvteam@gmail.com`

---

## 📋 STEP-BY-STEP SETUP (5 MINUTES)

### STEP 1: Enable Email Routing in Cloudflare

**🔗 CLICKABLE LINK:**
```
https://dash.cloudflare.com/afa438852c5c0164bd263889401b36fb/email/routing
```

**Instructions:**
1. Click the link above (opens Cloudflare Email Routing)
2. Click the **"Enable Email Routing"** button
3. Cloudflare will automatically add DNS records (MX and TXT)
4. Click **"Add records and enable"**
5. Wait 30 seconds for DNS propagation

---

### STEP 2: Add Your Destination Email

**In the same page:**

1. Look for **"Destination addresses"** section
2. Click **"Add destination address"**
3. **Enter:**
   ```
   reloadedfiretvteam@gmail.com
   ```
4. Click **"Send verification email"**
5. **Go to your Gmail** and click the verification link
6. ✅ Email verified!

---

### STEP 3: Create Email Addresses

**For EACH email address you want, do this:**

1. In Email Routing page, find **"Routing rules"** section
2. Click **"Create address"**
3. **Fill in the form:**

#### Email #1: Admin Email
```
Custom address:     admin
Action:             Send to a destination address
Destination:        reloadedfiretvteam@gmail.com
```
Click **"Save"**

#### Email #2: Support Email
```
Custom address:     support
Action:             Send to a destination address
Destination:        reloadedfiretvteam@gmail.com
```
Click **"Save"**

#### Email #3: Sales Email
```
Custom address:     sales
Action:             Send to a destination address
Destination:        reloadedfiretvteam@gmail.com
```
Click **"Save"**

#### Email #4: Orders Email
```
Custom address:     orders
Action:             Send to a destination address
Destination:        reloadedfiretvteam@gmail.com
```
Click **"Save"**

#### Email #5: Info Email
```
Custom address:     info
Action:             Send to a destination address
Destination:        reloadedfiretvteam@gmail.com
```
Click **"Save"**

#### Email #6: No-Reply Email
```
Custom address:     noreply
Action:             Send to a destination address
Destination:        reloadedfiretvteam@gmail.com
```
Click **"Save"**

---

### STEP 4: Test Email Reception

**Send a test email:**

1. From any email account, send an email to: `admin@streamstickpro.com`
2. Check your Gmail: `reloadedfiretvteam@gmail.com`
3. ✅ You should receive it within seconds!

---

## 📤 SEND EMAILS FROM YOUR BUSINESS EMAIL

### METHOD 1: Gmail SMTP (Recommended)

#### Part A: Create Gmail App Password

**🔗 CLICKABLE LINK:**
```
https://myaccount.google.com/apppasswords
```

**Instructions:**
1. Click the link above
2. You may need to enable 2-Factor Authentication first
3. In "Select app" dropdown: Choose **"Mail"**
4. In "Select device" dropdown: Choose **"Other (Custom name)"**
5. Type: `Streamstickpro Business Email`
6. Click **"Generate"**
7. **COPY THE 16-CHARACTER PASSWORD** (you'll need it in next step)
8. Save it somewhere safe - you can't see it again!

**Example App Password format:**
```
xxxx xxxx xxxx xxxx
```

---

#### Part B: Add Business Email to Gmail

**🔗 CLICKABLE LINK:**
```
https://mail.google.com/mail/u/0/#settings/accounts
```

**Instructions:**
1. Click the link above (opens Gmail Settings → Accounts tab)
2. Find section: **"Send mail as:"**
3. Click **"Add another email address"**

**Pop-up Window - Page 1:**
```
Name:           Inferno TV Support Team
Email address:  support@streamstickpro.com
☐ Treat as an alias (UNCHECK THIS BOX)
```
Click **"Next Step"**

**Pop-up Window - Page 2 (SMTP Settings):**
```
SMTP Server:    smtp.gmail.com
Port:           587
Username:       reloadedfiretvteam@gmail.com
Password:       [PASTE YOUR 16-CHARACTER APP PASSWORD HERE]
☑ Secured connection using TLS (CHECK THIS)
```
Click **"Add Account"**

**Verification:**
- Gmail will send a confirmation code
- Check `support@streamstickpro.com` (it forwards to your Gmail)
- Copy the verification code
- Enter it in the verification box
- Click **"Verify"**
- ✅ Done!

---

#### Part C: Repeat for Other Email Addresses

**Repeat Part B for each business email:**

**Admin Email:**
```
Name:    Inferno TV Admin
Email:   admin@streamstickpro.com
```

**Sales Email:**
```
Name:    Inferno TV Sales
Email:   sales@streamstickpro.com
```

**Orders Email:**
```
Name:    Inferno TV Orders
Email:   orders@streamstickpro.com
```

**Info Email:**
```
Name:    Inferno TV Info
Email:   info@streamstickpro.com
```

---

### METHOD 2: Update Your Website Email Forms

**Update all email forms in your admin dashboard to use:**

```javascript
// Update in: Supabase Edge Functions or Admin Settings

FROM_EMAIL = "noreply@streamstickpro.com"
REPLY_TO = "support@streamstickpro.com"
```

**Quick Database Update (Optional):**

Run this in Supabase SQL Editor to update system emails:

```sql
-- Update system configuration
UPDATE site_settings
SET
  admin_email = 'admin@streamstickpro.com',
  support_email = 'support@streamstickpro.com',
  noreply_email = 'noreply@streamstickpro.com'
WHERE id = 1;

-- If the table doesn't exist, create it:
CREATE TABLE IF NOT EXISTS site_settings (
  id int PRIMARY KEY DEFAULT 1,
  admin_email text DEFAULT 'admin@streamstickpro.com',
  support_email text DEFAULT 'support@streamstickpro.com',
  noreply_email text DEFAULT 'noreply@streamstickpro.com',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO site_settings (id) VALUES (1)
ON CONFLICT (id) DO UPDATE SET
  admin_email = 'admin@streamstickpro.com',
  support_email = 'support@streamstickpro.com',
  noreply_email = 'noreply@streamstickpro.com',
  updated_at = now();
```

---

## 📱 QUICK REFERENCE - ALL LINKS

### Cloudflare Links
| Action | Link |
|--------|------|
| Email Routing Dashboard | https://dash.cloudflare.com/afa438852c5c0164bd263889401b36fb/email/routing |
| DNS Settings | https://dash.cloudflare.com/afa438852c5c0164bd263889401b36fb/dns |
| Zone Overview | https://dash.cloudflare.com/afa438852c5c0164bd263889401b36fb |

### Gmail Links
| Action | Link |
|--------|------|
| Gmail Settings (Accounts) | https://mail.google.com/mail/u/0/#settings/accounts |
| Gmail App Passwords | https://myaccount.google.com/apppasswords |
| Enable 2-Factor Auth | https://myaccount.google.com/signinoptions/two-step-verification |

---

## 📋 COPY-PASTE VALUES

### Domain Information
```
Domain:              streamstickpro.com
Zone ID:             afa438852c5c0164bd263889401b36fb
Gmail Account:       reloadedfiretvteam@gmail.com
```

### Email Addresses Created
```
admin@streamstickpro.com
support@streamstickpro.com
sales@streamstickpro.com
orders@streamstickpro.com
info@streamstickpro.com
noreply@streamstickpro.com
```

### SMTP Settings (for Gmail)
```
SMTP Server:         smtp.gmail.com
Port:                587
Username:            reloadedfiretvteam@gmail.com
Password:            [YOUR APP PASSWORD]
Security:            TLS
```

### DNS Records (Cloudflare Auto-Creates These)
```
Type:   MX
Name:   @
Value:  route1.mx.cloudflare.net
Priority: 46

Type:   MX
Name:   @
Value:   route2.mx.cloudflare.net
Priority: 24

Type:   MX
Name:   @
Value:   route3.mx.cloudflare.net
Priority: 97

Type:   TXT
Name:   @
Value:   v=spf1 include:_spf.mx.cloudflare.net ~all
```

---

## ✅ VERIFICATION CHECKLIST

Use this to confirm everything is working:

### Email Receiving (Forwarding)
- [ ] Sent test email to `admin@streamstickpro.com` → Received in Gmail
- [ ] Sent test email to `support@streamstickpro.com` → Received in Gmail
- [ ] Sent test email to `sales@streamstickpro.com` → Received in Gmail

### Email Sending (SMTP)
- [ ] Created Gmail App Password
- [ ] Added `support@streamstickpro.com` to Gmail
- [ ] Verified email address
- [ ] Sent test email FROM `support@streamstickpro.com` successfully

### DNS Configuration
- [ ] MX records added by Cloudflare
- [ ] TXT (SPF) record added by Cloudflare
- [ ] Email Routing status: ✅ Enabled

---

## 🎯 RECOMMENDED EMAIL USAGE

**For Your Business:**

| Email | Purpose | Use For |
|-------|---------|---------|
| `admin@streamstickpro.com` | Administrative | Internal operations, important notices |
| `support@streamstickpro.com` | Customer Support | Help requests, technical issues |
| `sales@streamstickpro.com` | Sales Inquiries | Product questions, bulk orders |
| `orders@streamstickpro.com` | Order Updates | Order confirmations, shipping updates |
| `info@streamstickpro.com` | General Inquiries | General questions, contact form |
| `noreply@streamstickpro.com` | Automated Emails | System notifications (do not reply) |

**Update your website footer to show:**
```
Support: support@streamstickpro.com
Sales: sales@streamstickpro.com
General: info@streamstickpro.com
```

---

## 🔒 SECURITY BEST PRACTICES

1. **Never share your Gmail password** - Use App Passwords only
2. **Keep your Cloudflare API token secure** - Don't share publicly
3. **Enable 2-Factor Authentication** on both Gmail and Cloudflare
4. **Monitor Email Routing logs** in Cloudflare dashboard
5. **Use different emails for different purposes** - Makes tracking easier

---

## 🆘 TROUBLESHOOTING

### Problem: Not receiving forwarded emails
**Solution:**
1. Check Gmail spam folder
2. Verify destination email in Cloudflare is verified (green checkmark)
3. Wait 5 minutes for DNS propagation
4. Check Cloudflare Email Routing logs

### Problem: Can't send from business email
**Solution:**
1. Verify you created Gmail App Password (not regular password)
2. Check SMTP settings are exactly: `smtp.gmail.com:587`
3. Ensure TLS is enabled
4. Re-verify the email address in Gmail

### Problem: "Authentication error" in Gmail
**Solution:**
1. Create a new App Password
2. Delete and re-add the email address in Gmail
3. Make sure 2FA is enabled on Gmail account

---

## 📞 SUPPORT

**Cloudflare Support:**
- Dashboard: https://dash.cloudflare.com/
- Help Center: https://support.cloudflare.com/

**Gmail Support:**
- Help Center: https://support.google.com/mail/

**Your Cloudflare Zone ID:** `afa438852c5c0164bd263889401b36fb`
**Your Domain:** `streamstickpro.com`

---

## 🎉 COMPLETION STATUS

Once you've completed all steps:

✅ **Email Routing Enabled** in Cloudflare
✅ **6 Business Email Addresses** created
✅ **Gmail App Password** generated
✅ **SMTP Configuration** added to Gmail
✅ **All emails verified** and working
✅ **Professional business email** system active!

---

**Last Updated:** November 9, 2025
**Your Domain:** streamstickpro.com
**Status:** Ready to Configure

---

**🚀 START HERE:** https://dash.cloudflare.com/afa438852c5c0164bd263889401b36fb/email/routing
