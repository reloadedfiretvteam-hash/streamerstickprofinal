# 🎯 EXACT STEPS: How to ADD Events to Stripe Webhook

## ❌ WHERE YOU ARE NOW:

You're on the **"Event Log"** page - this shows PAST events that were sent.

**You're seeing:**
- List of events (product.updated, payment_link.created, etc.)
- This is the HISTORY/LOG of events

**This is NOT where you add events!**

---

## ✅ WHERE YOU NEED TO GO:

You need to go to the **"Webhook Configuration"** page to add events.

---

## 🚀 STEP-BY-STEP: Get to the Right Page

### STEP 1: Leave the Event Log Page

1. You're currently on a page showing event logs
2. Look at the **top of the page** for navigation
3. You should see tabs or links like:
   - "Webhooks"
   - "Events"
   - "Endpoints"
   - "API"

### STEP 2: Go to Webhooks Page

**Option A: Look for navigation menu**
1. Click on **"Webhooks"** in the left sidebar or top menu
2. OR click the **back button** in your browser
3. You should see a list of webhook endpoints

**Option B: Direct URL**
1. Go to: **https://dashboard.stripe.com/webhooks**
2. This will take you directly to the webhooks list

### STEP 3: Find Your Webhook

You should see a list of webhooks. Look for:
- **Endpoint URL:** `https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook`
- **Description:** "Supabase Stripe Webhook" or similar

### STEP 4: Click on Your Webhook

1. **Click on the webhook endpoint** (click on the URL or name)
2. This will open the **webhook configuration/details page**

### STEP 5: Find "Events to send" Section

On the webhook configuration page, you'll see sections like:
- Endpoint URL
- Status
- API version
- **"Events to send"** ← THIS IS WHAT YOU NEED!

### STEP 6: Add Events

1. In the **"Events to send"** section, look for:
   - **"Add events"** button, OR
   - **"Select events"** button, OR
   - A list with checkboxes
2. Click **"Add events"** or **"Select events"**
3. A popup/modal will appear
4. Search for: `payment_intent`
5. Check these boxes:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
6. Click **"Add events"** or **"Save"**

---

## 🖼️ VISUAL GUIDE:

```
Stripe Dashboard
│
├── Developers (left sidebar)
│   └── Webhooks ← CLICK HERE
│       │
│       ├── [Your Webhook List]
│       │   └── https://emlqlmfzqsnqokrqvmcm.supabase.co/... ← CLICK THIS
│       │
│       └── [Webhook Details Page] ← YOU NEED TO BE HERE
│           ├── Endpoint URL: https://...
│           ├── Status: Enabled
│           ├── API version: 2025-11-17.clover
│           │
│           └── Events to send ← FIND THIS SECTION
│               └── [Add events] ← CLICK THIS BUTTON
```

---

## 🔍 HOW TO GET THERE FROM WHERE YOU ARE:

### From Event Log Page:

1. **Look at the top navigation:**
   - Click **"Webhooks"** link (usually in breadcrumb or left sidebar)
   - OR use browser back button to go back

2. **Or use the URL:**
   - Change URL to: `https://dashboard.stripe.com/webhooks`
   - This takes you directly to webhooks list

3. **Then click your webhook** to edit it

---

## ✅ WHAT YOU'RE LOOKING FOR:

On the webhook CONFIGURATION page, you should see:

```
Endpoint details
├── Endpoint URL: https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook
├── Status: Enabled
├── API version: 2025-11-17.clover
│
└── Events to send              ← THIS SECTION!
    ├── [Add events] [button]   ← CLICK THIS!
    │
    └── Selected events:
        (may be empty, or have some events)
```

---

## 🆘 IF YOU STILL CAN'T FIND IT:

**Try this:**

1. **Direct link:** Go to: `https://dashboard.stripe.com/webhooks`
2. **Look for your webhook** in the list
3. **Click the webhook URL** or the **pencil/edit icon** next to it
4. You should now see the configuration page

**Or:**

1. On the Stripe dashboard, click **"Developers"** (left sidebar)
2. Click **"Webhooks"**
3. Find your webhook endpoint
4. Click on it
5. Look for **"Events to send"** section

---

## 🎯 QUICK SUMMARY:

1. **Leave the events log page** you're currently on
2. **Go to:** `https://dashboard.stripe.com/webhooks` (or click "Webhooks" in menu)
3. **Click your webhook** (the one with Supabase URL)
4. **Find "Events to send"** section
5. **Click "Add events"** button
6. **Select:** `payment_intent.succeeded` and `payment_intent.payment_failed`
7. **Save**

---

## 📝 REMEMBER:

- **Event Log page** = Shows past events (where you are now)
- **Webhook Configuration page** = Where you ADD events (where you need to go)

You need to go from the LOG to the CONFIGURATION page! 🚀




