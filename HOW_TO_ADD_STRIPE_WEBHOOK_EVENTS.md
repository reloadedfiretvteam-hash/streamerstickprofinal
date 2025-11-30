# 📋 EXACT STEPS: Add Events to Stripe Webhook

## 🎯 WHERE YOU ARE:

You're on: **Stripe Dashboard → Webhooks**

You can see:
- Endpoint URL: `https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook`
- Destination name: Supabase Stripe Webhook
- API version: 2025-11-17.clover

---

## ✅ STEP-BY-STEP: Add Events

### STEP 1: Click on Your Webhook

1. You should see a list of webhooks
2. Find the one with URL: `https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook`
3. **Click on the webhook name/URL** (click anywhere on that row)

### STEP 2: Find "Events to send" Section

After clicking, you'll see the webhook details page. Scroll down to find:

**"Events to send"** section

It might show:
- A list of selected events
- Or say "Select events" or "Add events" button

### STEP 3: Add Events

**Option A: If you see "Add events" or "Select events" button:**
1. Click **"Add events"** or **"Select events"** button
2. A popup/modal will appear
3. In the search box, type: `payment_intent`
4. You'll see events like:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.created`
   - `payment_intent.processing`
   - `payment_intent.canceled`
5. **Check the boxes** next to:
   - ✅ `payment_intent.succeeded` (REQUIRED)
   - ✅ `payment_intent.payment_failed` (REQUIRED)
6. Click **"Add events"** or **"Save"** button

**Option B: If events are already listed:**
1. Look at the list of events
2. Check if these are there:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
3. If they're missing:
   - Click **"Add events"** button (usually at top right of events list)
   - Follow Option A above

**Option C: If you see a dropdown or "Select all" option:**
1. Look for a section that says **"Select events to send"**
2. Use the search/filter to find `payment_intent`
3. Check the boxes for the required events
4. Click **"Save"** or **"Update"**

---

## 🖼️ WHAT IT LOOKS LIKE:

The webhook detail page should show:

```
Webhook Details
├── Endpoint URL: https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook
├── Status: Enabled
├── API version: 2025-11-17.clover
│
└── Events to send
    ├── [Add events] [button]
    │
    └── Selected events:
        ├── payment_intent.succeeded ✅
        └── payment_intent.payment_failed ✅
```

---

## 🔍 IF YOU CAN'T FIND "EVENTS TO SEND":

**Try this:**
1. On the webhook detail page, scroll all the way down
2. Look for tabs/sections like:
   - "Configuration"
   - "Events"
   - "Settings"
   - "Details"
3. Click on **"Events"** or **"Configuration"** tab
4. You should see the events section there

**Or:**
1. Click the **"Edit"** or **pencil icon** (if you see one)
2. This will let you modify the webhook settings
3. Look for events section in the edit form

---

## 📸 ALTERNATIVE: Create New Webhook (If editing doesn't work)

If you absolutely can't edit the existing webhook:

1. Go to: **Stripe Dashboard → Developers → Webhooks**
2. Click **"Add endpoint"** button (top right)
3. Fill in:
   - **Endpoint URL:** `https://emlqlmfzqsnqokrqvmcm.supabase.co/functions/v1/stripe-webhook`
   - **Description:** `Supabase Stripe Webhook`
4. In **"Events to send"** section:
   - Search for: `payment_intent`
   - Select:
     - ✅ `payment_intent.succeeded`
     - ✅ `payment_intent.payment_failed`
5. Click **"Add endpoint"**
6. **Delete the old webhook** (if needed)

---

## ✅ VERIFICATION:

After adding events, you should see:
- ✅ `payment_intent.succeeded` in the events list
- ✅ `payment_intent.payment_failed` in the events list

---

## 🆘 STILL CAN'T FIND IT?

**Tell me what you see:**
1. What page are you on exactly? (URL or page title)
2. What sections/buttons do you see?
3. Can you see the webhook details, or just a list?

**Or try:**
1. Take a screenshot of what you see
2. Look for any button that says:
   - "Edit"
   - "Configure"
   - "Settings"
   - "Modify"
   - "Add events"
   - "Select events"

---

## 🎯 QUICK SUMMARY:

1. **Click on your webhook** (the one with Supabase URL)
2. **Scroll down** to find "Events to send" section
3. **Click "Add events"** button
4. **Search for:** `payment_intent`
5. **Check:** `payment_intent.succeeded` and `payment_intent.payment_failed`
6. **Click "Add"** or "Save"

That's it! 🚀

