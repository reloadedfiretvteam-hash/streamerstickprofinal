# Admin Procedures - Stripe Product Mapping

**Quick reference guide for maintaining Stripe compliance**

---

## 🚀 Quick Start

### Access Admin Panel
1. Go to: `https://your-domain.com/custom-admin`
2. Login with admin credentials
3. Navigate to: **Stripe Product Mapping**

---

## 📋 Daily/Weekly Checks

### Run System Health Check
1. Admin Dashboard → **System Health Check**
2. Click "Run System Health Check"
3. Verify all checks are green/passing
4. Address any warnings immediately

**What to look for:**
- ✅ All products have cloaked names
- ✅ Stripe payment intent API is reachable
- ✅ No missing mappings

### Review Product Mappings
1. Admin Dashboard → **Stripe Product Mapping**
2. Review the issues summary at top
3. If issues found, click "Apply All Suggestions"
4. Verify all products show green checkmark

---

## 🆕 Adding New Products

### When you add a product:
1. Create the product in the admin panel
2. Go to **Stripe Product Mapping**
3. Find your new product in the list
4. Set appropriate cloaked name:
   - Fire Stick products → "Digital Entertainment Service - Hardware Bundle"
   - IPTV/Subscriptions → "Digital Entertainment Service - Subscription"
   - Other digital services → "Digital Entertainment Service"
5. Save changes
6. Run System Health Check to verify

---

## 🔧 Quick Fix: Missing Cloaked Names

### Option 1: Use Admin Panel (Recommended)
1. Admin Dashboard → **Stripe Product Mapping**
2. Click "Apply All Suggestions"
3. Done!

### Option 2: SQL in Supabase Dashboard
```sql
-- Set cloaked names for all products that are missing them
UPDATE real_products 
SET cloaked_name = 
  CASE 
    WHEN (category ILIKE '%fire%' OR category ILIKE '%stick%' OR name ILIKE '%fire stick%') 
      THEN 'Digital Entertainment Service - Hardware Bundle'
    WHEN (category ILIKE '%iptv%' OR category ILIKE '%subscription%' OR name ILIKE '%iptv%')
      THEN 'Digital Entertainment Service - Subscription'
    ELSE 'Digital Entertainment Service'
  END
WHERE cloaked_name IS NULL OR cloaked_name = '';
```

---

## ⚠️ What NOT to Do

❌ **Never put these terms in cloaked names:**
- IPTV
- Fire Stick / Firestick
- Streaming
- Jailbroken
- Hacked
- Piracy
- Any real product names

✅ **Always use generic names:**
- Digital Entertainment Service
- Digital Entertainment Service - Hardware Bundle
- Digital Entertainment Service - Subscription

---

## 🧪 Testing After Changes

### Test a checkout:
1. Add product to cart
2. Go to checkout
3. Complete payment with test card: `4242 4242 4242 4242`
4. **Verify:**
   - Customer sees real product name throughout checkout
   - Check Stripe Dashboard → Payments
   - Stripe should show cloaked name only
   - Order confirmation email shows real product name

---

## 🆘 Common Issues

### Issue: "Product has no cloaked name"
**Fix:** Go to Stripe Product Mapping → Apply suggested name

### Issue: "Cloaked name contains restricted terms"
**Fix:** 
1. Go to Stripe Product Mapping
2. Find the product
3. Replace with generic name from allowed list above
4. Save

### Issue: "Payment intent endpoint not reachable"
**Fix:** 
1. Verify edge function is deployed
2. Check Supabase dashboard → Edge Functions
3. Ensure `stripe-payment-intent` is deployed
4. Check function secrets are set

---

## 📊 Monitoring

### Check these regularly:
- **Stripe Dashboard** → Make sure only cloaked names appear
- **System Health Check** → Run weekly minimum
- **Product Mapping Manager** → Review after adding products
- **Order Emails** → Verify customers see real product names

---

## 🔐 Compliance Checklist

Before going live with new products:
- [ ] Product has cloaked_name set
- [ ] Cloaked name is generic (no restricted terms)
- [ ] System Health Check shows green
- [ ] Test checkout completed successfully
- [ ] Stripe Dashboard shows cloaked name
- [ ] Customer email shows real product name

---

## 📞 Quick Reference

### Cloaked Name Templates
```
Fire Stick products:
→ "Digital Entertainment Service - Hardware Bundle"

IPTV Subscriptions:
→ "Digital Entertainment Service - Subscription"

Other digital products:
→ "Digital Entertainment Service"
```

### Where to Find Things
- **Admin Panel:** `/custom-admin`
- **Health Check:** Admin → System Health Check
- **Mapping Manager:** Admin → Stripe Product Mapping
- **Supabase Dashboard:** `https://supabase.com/dashboard`
- **Stripe Dashboard:** `https://dashboard.stripe.com`

---

**Remember:** 
- Customers = See real product names ✅
- Stripe = Sees cloaked names only ✅
- When in doubt, run System Health Check!

For detailed documentation, see: `STRIPE_PAYMENT_AUDIT.md`
