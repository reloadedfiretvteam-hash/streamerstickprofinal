# EMAIL SYSTEM TESTING GUIDE

## ✅ What's Been Fixed

1. **Free Trial Form**
   - ✅ Generates username/password
   - ✅ Sends `http://ky-tv.cc` URL
   - ✅ Includes YouTube tutorial
   - ✅ Captures country, message, address
   - ✅ Backend email (no more mailto delays)

2. **Product Purchases**
   - ✅ Generates username/password
   - ✅ Sends `http://ky-tv.cc` URL
   - ✅ Includes YouTube tutorial
   - ✅ Complete customer data

3. **Admin Notifications**
   - ✅ Receives all customer info
   - ✅ Gets generated credentials
   - ✅ Country and message included

---

## 🧪 Testing Instructions

### Step 1: Verify Supabase Environment Variables

Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets

**Required variables:**
```
RESEND_API_KEY = re_xxxxxxxxxxxx
FROM_EMAIL = noreply@streamstickpro.com
ADMIN_EMAIL = reloadedfiretvteam@gmail.com
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJxxxx...
```

---

### Step 2: Test Free Trial

1. Navigate to your website's free trial section
2. Fill out the form:
   ```
   Name: Test User
   Email: your_test_email@gmail.com
   Phone: (555) 123-4567
   Address: 123 Test Street
   City: Test City
   State: CA
   ZIP: 12345
   Country: United States
   Message: Testing free trial system
   ```

3. Submit the form

4. **Check for 2 emails:**
   - **Customer email** should include:
     - Thank you message
     - Username (8-10 characters)
     - Password (8-10 characters)
     - Service URL: http://ky-tv.cc
     - YouTube tutorial link
   
   - **Admin email** (reloadedfiretvteam@gmail.com) should include:
     - Customer name, email, phone
     - Address and country
     - Customer message
     - Generated username/password

---

### Step 3: Test Fire Stick Purchase

1. Add a Fire Stick product to cart
2. Go to checkout page
3. Fill in customer info:
   ```
   Name: Test Buyer
   Email: your_test_email@gmail.com
   Phone: (555) 987-6543
   Address: 456 Purchase Ave
   City: Buyer City
   State: NY
   ZIP: 54321
   ```

4. Select payment method (Bitcoin or Cash App for testing)
5. Complete order

6. **Check for 3 emails:**
   - **Email 1 (Immediate):** Order confirmation
   - **Email 2 (5 min later):** 
     - Username/Password
     - Service URL: http://ky-tv.cc
     - YouTube tutorial
   - **Email 3 (Admin):**
     - Order details
     - Customer info
     - Generated credentials

---

### Step 4: Test TV Service Purchase

1. Add IPTV service to cart
2. Checkout with different test info
3. Verify same email flow as Fire Stick test

---

## ✅ Expected Email Contents

### Customer Confirmation Email
```
Subject: Order Confirmation - ORDER-XXXXX

Hi [Customer Name],

Thank you for your order! Your payment has been confirmed.

Order Details:
- Order Code: ORDER-XXXXX
- Product: [Product Name]
- Total: $XX.XX
- Payment Method: [Method]

What's Next?
Your login information and setup instructions will be sent 
to this email address momentarily.
```

### Customer Credentials Email (5 min later)
```
Subject: 🔐 Your Login Credentials - Order ORDER-XXXXX

Hi [Customer Name],

Your account is ready! Here are your login credentials:

🔐 Account Login
Username: [Generated Username]
Password: [Generated Password]
Service URL: http://ky-tv.cc

📺 Watch Setup Tutorial
[YouTube Link Button]

Questions? Reply to this email.
```

### Admin Notification Email
```
Subject: 🔥 New Order: ORDER-XXXXX - [Customer Name]

Customer: [Name] ([Email])
Phone: [Phone]
Payment Method: [Method]
Total: $XX.XX

Products:
- [Product Name] - $XX.XX x 1

Shipping: [Full Address]
Country: [Country]

Customer Message:
[Message if provided]

Login Credentials Created:
- Username: [username]
- Password: [password]
```

---

## 🐛 Troubleshooting

### No Emails Received?

1. **Check Supabase Logs:**
   - Go to Supabase → Edge Functions → Logs
   - Look for errors in:
     - `create-order-with-credentials`
     - `send-credentials-email`
     - `send-order-emails`

2. **Verify RESEND_API_KEY:**
   - Must start with `re_`
   - Check it's active at resend.com

3. **Check Spam Folder:**
   - Emails might be filtered

4. **Verify FROM_EMAIL:**
   - Must be verified domain in Resend
   - Or use default resend domain

### Credentials Not Generated?

1. Check database has functions:
   - `generate_username`
   - `generate_password`

2. Verify service role key has permissions

### Wrong URL Sent?

- Default is: `http://ky-tv.cc`
- Check database `real_products` table for `service_url` column
- Default overrides if database is empty

---

## 📊 Success Criteria

✅ Free trial sends credentials immediately
✅ Purchases send 2 emails (confirmation + credentials)
✅ Admin receives all order notifications
✅ All emails include username/password/URL
✅ YouTube tutorial link works
✅ Service URL is http://ky-tv.cc
✅ Country and message captured in admin email

---

## 🚀 Ready to Go Live?

Once all tests pass:
1. ✅ Verify on production site
2. ✅ Test with real email addresses
3. ✅ Confirm credentials work at http://ky-tv.cc
4. ✅ Verify YouTube tutorial plays

**System is production-ready!** 🎉

