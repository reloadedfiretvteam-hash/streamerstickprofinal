# 📧 EMAIL SERVICE SETUP - CLARIFICATION

## 🚨 IMPORTANT: Email Functions Are NOT Configured Yet!

Your email functions are **PLACEHOLDERS** - they don't actually send emails!

---

## 🔍 CURRENT STATUS:

**Files:**
- `supabase/functions/send-order-emails/index.ts` - Has TODO comment (Line 129)
- `supabase/functions/send-credentials-email/index.ts` - Has TODO comment (Line 213)

**What They Do Now:**
- ✅ Generate HTML email content
- ✅ Log to console
- ❌ **DON'T ACTUALLY SEND EMAILS**

**Impact:**
- Customers won't receive order confirmations
- Customers won't receive IPTV login credentials
- You won't get admin notifications

---

## 🎯 YOU NEED TO CHOOSE AN EMAIL SERVICE

You have 3 options:

### Option 1: Resend (Easiest - Recommended)
**API Key Format:**
- Environment Variable Name: `RESEND_API_KEY` (all caps)
- API Key Value: Starts with `re_` (lowercase re underscore)
- Example: `re_abc123xyz456` 

**How to Get It:**
1. Sign up: https://resend.com
2. Go to: API Keys
3. Create new API key
4. Copy the key (starts with `re_`)

### Option 2: SendGrid
**API Key Format:**
- Environment Variable Name: `SENDGRID_API_KEY` (all caps)
- API Key Value: Starts with `SG.` (uppercase SG dot)
- Example: `SG.abc123xyz456`

**How to Get It:**
1. Sign up: https://sendgrid.com
2. Go to: Settings → API Keys
3. Create API Key
4. Copy the key (starts with `SG.`)

### Option 3: AWS SES (Advanced)
**Requires:**
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION

---

## 🔧 WHAT YOU NEED TO DO:

### If You Choose Resend:

**1. Sign up and get API key from Resend**

**2. Add to Supabase Secrets:**
```
Name: RESEND_API_KEY
Value: re_YOUR_ACTUAL_KEY (the key you copied from Resend)
```

**3. Uncomment the Resend code in BOTH email functions:**

**In send-credentials-email/index.ts (around line 227):**
```typescript
// UNCOMMENT THESE LINES:
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
await resend.emails.send({
  from: "noreply@streamstickpro.com",
  to: payload.customerEmail,
  subject: emailSubject,
  html: emailHtml,
});
```

**In send-order-emails/index.ts (around line 139):**
```typescript
// UNCOMMENT THESE LINES:
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
await resend.emails.send({
  from: "noreply@streamstickpro.com",
  to: payload.customerEmail,
  subject: emailSubject,
  html: customerEmailContent,
});
await resend.emails.send({
  from: "noreply@streamstickpro.com",
  to: payload.adminEmail,
  subject: `New Order: ${payload.orderCode}`,
  html: adminEmailContent,
});
```

**4. Import Resend at the top of both files:**
```typescript
import { Resend } from 'https://esm.sh/resend@2.0.0';
```

---

## ❓ WHICH SERVICE ARE YOU USING?

**You mentioned:** "I typically don't see lowercase"

This suggests you might be using **SendGrid** (which uses `SG.` prefix) instead of Resend.

### If You're Using SendGrid:

**Secret to add:**
```
Name: SENDGRID_API_KEY
Value: SG.YOUR_SENDGRID_KEY
```

**Then you'd need to implement SendGrid instead of Resend in the email functions.**

---

## 🎯 QUICK ANSWER TO YOUR QUESTION:

### "What's the value format?"

**Resend API Keys:**
- Format: `re_lowercase_letters_numbers`
- Example: `re_123abc456def789ghi`
- Start with: **lowercase `re_`**

**SendGrid API Keys:**
- Format: `SG.UPPERCASE_AND_NUMBERS`
- Example: `SG.abc123XYZ456`
- Start with: **uppercase `SG.`**

**Stripe Secret Keys:**
- Format: `sk_live_lowercase_letters_numbers`
- Example: `sk_live_123abc456def`
- Start with: **lowercase `sk_live_` or `sk_test_`**

---

## 💡 RECOMMENDATION:

**Since your email functions aren't configured yet, I recommend:**

1. **Use Resend** - It's the easiest to set up
2. Sign up at https://resend.com (free tier includes 100 emails/day)
3. Get API key (will start with `re_`)
4. Add to Supabase secrets as `RESEND_API_KEY`
5. Uncomment the Resend code in both email functions
6. Test sending an email

**Total Time:** 15-20 minutes

---

## ✅ SUMMARY:

**What you asked:**
- Is lowercase `re_` correct for email?

**Answer:**
- YES, if using Resend (starts with `re_`)
- NO, if using SendGrid (starts with `SG.`)
- Your functions aren't configured yet, so you need to choose one!

**The confusion:**
- Environment variable NAME: `RESEND_API_KEY` (all caps)
- API key VALUE: `re_abc123...` (starts lowercase)

---

**Let me know which email service you want to use, and I'll give you exact copy-paste code!**

