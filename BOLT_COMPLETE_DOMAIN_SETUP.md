# 🌐 COMPLETE DOMAIN SETUP FOR BOLT

**Important:** User needs BOTH main domain AND secure subdomain connected

---

## 🎯 DOMAINS TO CONNECT

### 1. Main Domain:
- **Domain:** `streamstickpro.com` (or whatever the user's main domain is)
- **Project:** `streamerstickprofinal`
- **Shows:** Main website

### 2. Secure Subdomain (FOR SQUARE PAYMENTS):
- **Domain:** `secure.streamstickpro.com` (or similar)
- **Project:** Same `streamerstickprofinal` project
- **Shows:** Concierge/Secure payment page for Square
- **Why:** Required for Square payment processor compliance

---

## 📋 STEP-BY-STEP FOR BOLT

### Step 1: Ask User for Domains
**Say to user:**
"What is your main domain name? (e.g., streamstickpro.com)"
"What is your secure subdomain for Square payments? (e.g., secure.streamstickpro.com)"

### Step 2: Remove Domains from Template Project
1. Go to template project → Domains tab
2. Remove BOTH domains:
   - Main domain
   - Secure subdomain (if it's there)

### Step 3: Add Main Domain to Real Project
1. Go to `streamerstickprofinal` project
2. Domains tab → Add custom domain
3. Enter main domain (e.g., `streamstickpro.com`)

### Step 4: Add Secure Subdomain to Real Project
1. In the SAME `streamerstickprofinal` project
2. Domains tab → Add custom domain
3. Enter secure subdomain (e.g., `secure.streamstickpro.com`)
4. **This is critical for Square payments to work!**

---

## ⚠️ WHY BOTH DOMAINS ARE NEEDED

- **Main domain:** Shows the regular website
- **Secure subdomain:** Shows the Square payment/concierge page
- **Both point to same project** but serve different pages via routing
- **Square requires secure subdomain** for payment processing compliance

---

## ✅ VERIFICATION

After setup:
- Main domain works ✅
- Secure subdomain works ✅
- Square checkout works on secure domain ✅

---

**BOLT: Make sure to connect BOTH the main domain AND the secure subdomain!**

