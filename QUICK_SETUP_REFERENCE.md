# ⚡ QUICK SETUP REFERENCE - ALL TOKENS & SECRETS

## 🔑 YOUR CREDENTIALS (Copy-Paste Ready)

### Supabase
- **URL**: `https://emlqlmfzqsnqokrqvmcm.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHFsbWZ6cXNucW9rcnF2bWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4ODQ0OTIsImV4cCI6MjA3OTQ2MDQ5Mn0.gD54kCrRiqLCpP_p6cEO4-r9GSIAJSuN4PKWx5Dnyeg`

### Stripe
- **Secret Key (Live)**: `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`
- **Publishable Key**: Get from https://dashboard.stripe.com/apikeys

### GitHub (Cloudflare)
- **Token**: `lyXztBK9lozSf2xU4jVydG87gVYtGYE6eHK12J62`

---

## 📋 SETUP CHECKLIST

### 1. Cloudflare Environment Variables
- [ ] `VITE_SUPABASE_URL` = `https://emlqlmfzqsnqokrqvmcm.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = (anon key above)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` = (get from Stripe Dashboard)
- [ ] `VITE_STORAGE_BUCKET_NAME` = `images`

### 2. Supabase Edge Functions Secrets
- [ ] `STRIPE_SECRET_KEY` = (Stripe secret key above)
- [ ] `STRIPE_WEBHOOK_SECRET` = (get after creating webhook)
- [ ] `SUPABASE_URL` = `https://emlqlmfzqsnqokrqvmcm.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = (get from Supabase Dashboard)

### 3. Database Setup
- [ ] Run `DATABASE_SETUP_SQL.sql` in Supabase SQL Editor
- [ ] Verify `cloaked_name` column exists
- [ ] Verify products have cloaked names

### 4. Stripe Webhook
- [ ] Create webhook endpoint: `https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook`
- [ ] Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, etc.
- [ ] Copy webhook signing secret
- [ ] Add to Supabase as `STRIPE_WEBHOOK_SECRET`

### 5. Deploy Edge Functions
- [ ] Deploy `stripe-payment-intent`
- [ ] Deploy `stripe-webhook`

---

## 📚 DETAILED GUIDES

- **Complete Setup**: See `STRIPE_COMPLETE_SETUP_GUIDE.md`
- **Cloudflare Variables**: See `CLOUDFLARE_ENV_VARS_SETUP.md`
- **Supabase Secrets**: See `SUPABASE_EDGE_FUNCTIONS_SECRETS.md`
- **Webhook Setup**: See `STRIPE_WEBHOOK_SETUP.md`
- **Database SQL**: See `DATABASE_SETUP_SQL.sql`

---

## 🎯 HOW IT WORKS

### Shadow/Real Product Flow:
1. **Customers** see REAL product names (e.g., "Fire Stick 4K Max")
2. **Stripe** sees CLOAKED names (e.g., "Digital Entertainment Service")
3. **Database** stores both names
4. **Emails** show real names to customers

### Payment Flow:
1. Customer selects product → Sees real name
2. Checkout → Shows real name
3. Payment → Stripe receives cloaked name
4. Webhook → Updates database
5. Email → Customer receives real name

---

## ✅ VERIFICATION

### Test Payment:
- Card: `4242 4242 4242 4242`
- Expiry: `12/34`
- CVC: `123`

### Verify:
- ✅ Payment in Stripe Dashboard (shows cloaked name)
- ✅ Order in `orders` table
- ✅ Payment in `payment_transactions` table
- ✅ Customer email (shows real name)

---

**Status:** Ready to configure ✅






