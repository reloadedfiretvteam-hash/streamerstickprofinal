# ✅ Post-Deployment Testing Guide

## 🎯 System Status: DEPLOYED

**Deployment Status:**
- ✅ GitHub: Updated
- ✅ Cloudflare: Deployed
- ✅ Supabase: Configured

**Fix Applied:**
- ✅ Email validation and fallback in webhook handler

---

## 🧪 Testing Checklist

### Test 1: Health Check

**Endpoint:** `https://secure.streamstickpro.com/api/health`

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "version": "2.0.1"
}
```

**Test:**
```bash
curl https://secure.streamstickpro.com/api/health
```

---

### Test 2: Configuration Check

**Endpoint:** `https://secure.streamstickpro.com/api/debug`

**Expected:**
- ✅ Supabase: Connected
- ✅ Stripe: Connected
- ✅ Email: Resend configured
- ✅ Webhook secret: Present

**Test:**
```bash
curl https://secure.streamstickpro.com/api/debug
```

---

### Test 3: Product Purchase Email Test

**Steps:**
1. Go to: https://streamstickpro.com
2. Add a product to cart
3. Go to checkout
4. Enter email: `evandelamarter@gmail.com`
5. Enter shipping info (for physical products)
6. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - ZIP: `12345`
7. Complete purchase

**Expected Results:**

#### Immediately:
- ✅ Redirected to `/success` page
- ✅ Order confirmation email received at `evandelamarter@gmail.com`
- ✅ Owner notification email received at `reloadedfiretvteam@gmail.com`

#### Within 5 minutes:
- ✅ Credentials email received at `evandelamarter@gmail.com`
  - Contains: Username, Password, Portal URL (`http://ky-tv.cc`)
  - Contains: YouTube tutorial link (`https://youtu.be/DYSOp6mUzDU`)

#### In Stripe Dashboard:
- ✅ Payment appears in Stripe
- ✅ Shows shadow/cloaked product name (NOT real product name)
- ✅ Webhook delivery shows "Success" (200 status)

---

### Test 4: Cloudflare Logs Verification

**Check Cloudflare Logs:**
1. Go to: Cloudflare Dashboard → Workers & Pages → Your Project → Logs
2. Look for webhook processing entries
3. Look for `[EMAIL]` log entries

**Expected Log Entries:**
```
[WEBHOOK] Processing checkout.session.completed
[CHECKOUT] Session completed: cs_...
[CHECKOUT] Found order: ... for evandelamarter@gmail.com
[EMAIL] Starting email delivery for order ...
[EMAIL] Sending to: evandelamarter@gmail.com
[EMAIL] Order confirmation sent to evandelamarter@gmail.com
[EMAIL] Owner notification sent
[EMAIL] Credentials sent to evandelamarter@gmail.com
```

**If Errors:**
- Check for `[EMAIL] ERROR:` entries
- Review error stack traces
- Verify `RESEND_API_KEY` is correct

---

### Test 5: Free Trial (Should Still Work)

**Steps:**
1. Go to free trial form
2. Enter email: `evandelamarter@gmail.com`
3. Submit

**Expected:**
- ✅ Immediate email with credentials
- ✅ Owner notification email

**This should continue working as before!**

---

## ✅ Success Criteria

**Test is successful if:**
- [ ] Health check returns OK
- [ ] Debug endpoint shows all systems connected
- [ ] Test purchase completes successfully
- [ ] Order confirmation email received (immediate)
- [ ] Credentials email received (within 5 minutes)
- [ ] Owner notification email received
- [ ] Cloudflare logs show email sending entries
- [ ] Stripe shows shadow product (not real product)
- [ ] Webhook delivery shows success in Stripe

---

## 🚨 Troubleshooting

### If Emails Don't Send:

1. **Check Cloudflare Logs:**
   - Look for `[EMAIL] ERROR:` messages
   - Check error stack traces

2. **Check Resend Dashboard:**
   - Go to: https://resend.com/emails
   - Look for email delivery attempts
   - Check for bounced/failed emails

3. **Check Environment Variables:**
   - Verify `RESEND_API_KEY` is correct
   - Verify `RESEND_FROM_EMAIL` is verified domain
   - Verify `STRIPE_WEBHOOK_SECRET` matches Stripe

4. **Check Email Address:**
   - Verify email is valid
   - Check spam folder
   - Try different email address

### If Webhook Fails:

1. **Check Stripe Dashboard:**
   - Go to: Webhooks → Your Webhook → Logs
   - Check for delivery failures
   - Look at response codes

2. **Check Webhook URL:**
   - Should be: `https://secure.streamstickpro.com/api/stripe/webhook`
   - Verify it's enabled
   - Verify events are selected

3. **Check Cloudflare Logs:**
   - Look for webhook processing errors
   - Check signature verification errors

---

## 📊 Testing Results Template

```
Date: ___________
Tester: ___________
Email Used: evandelamarter@gmail.com

1. Health Check:
   Status: [ ] OK [ ] Failed

2. Debug Endpoint:
   Supabase: [ ] Connected [ ] Failed
   Stripe: [ ] Connected [ ] Failed
   Email: [ ] Configured [ ] Missing

3. Test Purchase:
   Order Confirmation Email: [ ] Received [ ] Not received
   Credentials Email: [ ] Received [ ] Not received
   Owner Notification: [ ] Received [ ] Not received
   
4. Stripe:
   Payment Recorded: [ ] Yes [ ] No
   Shows Shadow Product: [ ] Yes [ ] No
   Webhook Delivery: [ ] Success [ ] Failed

5. Cloudflare Logs:
   Email Logs Present: [ ] Yes [ ] No
   Errors Found: [ ] None [ ] Yes (list below)
   
6. Issues Found:
   ___________
   ___________
```

---

## 🎯 Next Steps After Testing

1. **If Everything Works:**
   - ✅ System is fully operational
   - ✅ Monitor first few real purchases
   - ✅ Clean up duplicate webhooks (optional)

2. **If Issues Found:**
   - Check Cloudflare logs for specific errors
   - Verify environment variables
   - Test Resend API directly
   - Check Stripe webhook logs

---

## ✅ Summary

**What Was Fixed:**
- ✅ Email validation and fallback in webhook handler
- ✅ Better error logging
- ✅ Prevents sending emails to null/undefined addresses

**System Status:**
- ✅ Deployed to GitHub, Cloudflare, Supabase
- ✅ Ready for testing
- ✅ All configurations verified

**Test with:** `evandelamarter@gmail.com`

Let me know the test results! 🚀

