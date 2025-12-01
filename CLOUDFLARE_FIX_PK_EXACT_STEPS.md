# ✅ CLOUDFLARE: Fix Stripe PK - Exact Steps with Screenshots Guide

## 🎯 YOUR STRIPE KEY:

```
pk_live_51SXXh4HBw27Y92Ci4r7de3JTz13uAz7EF04b2ZpW8KhtDQYaa2mh1ayE8RiCKSRxRYtn3o7VNMINWJd9f7oGYsxT002VVUcvC8
```

**Variable Name Needed:** `VITE_STRIPE_PUBLISHABLE_KEY`

---

## 📋 EXACT STEP-BY-STEP:

### STEP 1: Go to Cloudflare Pages

1. Open browser
2. Go to: **https://dash.cloudflare.com**
3. Log in with your credentials
4. **Left sidebar** → Click **"Pages"**

### STEP 2: Find Your Project

1. You'll see a list of projects
2. Find your project (might be called "streamerstickprofinal" or similar)
3. **Click on the project name** (click anywhere on that project card/row)

### STEP 3: Go to Settings

1. After clicking your project, you'll see tabs at the top:
   - Overview
   - Deployments
   - **Settings** ← CLICK THIS
   - Custom domains
   - etc.

2. Click **"Settings"** tab

### STEP 4: Find Environment Variables

1. In the Settings page, look at the **LEFT SIDEBAR** or **top menu**
2. You'll see sections like:
   - General
   - Custom domains
   - **Environment variables** ← CLICK THIS
   - Builds & deployments
   - Functions
   - etc.

3. Click **"Environment variables"**

### STEP 5: Add New Variable

1. You'll see a list of existing variables (might be empty or have some)
2. Look for a button that says:
   - **"Add variable"** OR
   - **"New variable"** OR
   - **"+"** button
3. Click that button

### STEP 6: Fill in the Form

A form/popup will appear. Fill it in:

1. **Variable name:** Type exactly:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY
   ```

2. **Variable value:** Paste:
   ```
   pk_live_51SXXh4HBw27Y92Ci4r7de3JTz13uAz7EF04b2ZpW8KhtDQYaa2mh1ayE8RiCKSRxRYtn3o7VNMINWJd9f7oGYsxT002VVUcvC8
   ```

3. **Environment checkboxes:** Look for checkboxes or toggles that say:
   - **"Production"** ← Check this box
   - **"Preview"** (optional, but recommended)
   - **"Branch previews"** (optional)

   **If you don't see "Production" checkbox:**
   - Some Cloudflare interfaces show it differently
   - Look for: "Apply to", "Environment", "Scope", or dropdown menu
   - OR it might automatically apply to Production by default

4. Click **"Save"** or **"Add"** button

---

## 🔍 IF YOU DON'T SEE "PRODUCTION" CHECKBOX:

**Option A: It might be a dropdown**
- Look for a dropdown menu that says "Environment" or "Apply to"
- Select "Production" from the dropdown

**Option B: It might be automatic**
- Some Cloudflare setups automatically apply to Production
- Just add the variable and it will work

**Option C: It might be in the variable list**
- After adding, you might see columns: "Name | Value | Production | Preview"
- You can edit after creation to add Production

---

## ✅ AFTER ADDING THE VARIABLE:

### STEP 7: Trigger Rebuild

1. Go to **"Deployments"** tab (top menu)
2. You'll see a list of deployments
3. Find the **latest deployment**
4. On the right side, click the **three dots (⋯)** or **menu icon**
5. Click **"Retry deployment"** or **"Rebuild"**
6. OR click **"Create deployment"** button at top

### STEP 8: Wait

1. Wait **2-5 minutes** for Cloudflare to rebuild
2. You can watch the deployment progress
3. When it says **"Success"** or **"Published"**, it's done

---

## 🖼️ WHAT THE PAGE LOOKS LIKE:

```
Cloudflare Dashboard
│
├── Pages (left sidebar)
│   └── [Your Project] ← Click this
│       │
│       ├── Overview (tab)
│       ├── Deployments (tab)
│       ├── Settings (tab) ← Click this
│       │   │
│       │   ├── General (left menu)
│       │   ├── Custom domains (left menu)
│       │   ├── Environment variables ← Click this
│       │   │   │
│       │   │   └── [List of variables]
│       │   │       └── [Add variable] button ← Click this
│       │   │
│       │   │   Form appears:
│       │   │   ┌─────────────────────────┐
│       │   │   │ Variable name:          │
│       │   │   │ VITE_STRIPE_PUBLISH... │
│       │   │   │                         │
│       │   │   │ Variable value:         │
│       │   │   │ pk_live_51SXXh...      │
│       │   │   │                         │
│       │   │   │ ☑ Production            │
│       │   │   │ ☐ Preview               │
│       │   │   │                         │
│       │   │   │ [Save] button           │
│       │   │   └─────────────────────────┘
```

---

## 📝 VARIABLE INFO TO ADD:

**Variable Name:**
```
VITE_STRIPE_PUBLISHABLE_KEY
```

**Variable Value:**
```
pk_live_51SXXh4HBw27Y92Ci4r7de3JTz13uAz7EF04b2ZpW8KhtDQYaa2mh1ayE8RiCKSRxRYtn3o7VNMINWJd9f7oGYsxT002VVUcvC8
```

---

## 🆘 STILL CAN'T FIND IT?

**Tell me:**
1. What do you see when you click "Settings"?
2. What options are in the left menu?
3. Do you see "Environment variables" anywhere?
4. What does the page look like?

**Alternative locations to check:**
- Settings → General → Environment variables
- Settings → Builds & deployments → Environment variables
- Project root → Environment variables

---

## ✅ QUICK CHECKLIST:

- [ ] Logged into Cloudflare
- [ ] Clicked "Pages" in left sidebar
- [ ] Clicked your project name
- [ ] Clicked "Settings" tab
- [ ] Clicked "Environment variables" (in left menu or page)
- [ ] Clicked "Add variable" button
- [ ] Entered name: `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] Entered value: `pk_live_51SXXh...`
- [ ] Selected Production (if checkbox exists)
- [ ] Clicked "Save"
- [ ] Triggered rebuild in Deployments tab
- [ ] Waited 2-5 minutes

---

**Once you add the variable, the checkout will work!** 🚀




