# 🔒 ULTRA DETAILED SECURE CHECKOUT BUILD PROMPT

## Complete Implementation Guide for Square-Safe Checkout System

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Separate Square-Only Checkout Page](#separate-square-only-checkout-page)
3. [Customer Flow Security](#customer-flow-security)
4. [Enhanced Credential Management](#enhanced-credential-management)
5. [Email System Improvements](#email-system-improvements)
6. [Security Logging](#security-logging)
7. [Fire Stick Specific Templates](#fire-stick-specific-templates)
8. [Admin Notifications](#admin-notifications)
9. [Square Webhook Handling](#square-webhook-handling)
10. [Error Handling](#error-handling)
11. [Customer Support System](#customer-support-system)
12. [Audit Trail](#audit-trail)
13. [Backup Credential Storage](#backup-credential-storage)
14. [Technical Improvements](#technical-improvements)
15. [Testing Checklist](#testing-checklist)
16. [Configuration Guide](#configuration-guide)
17. [Deployment Guide](#deployment-guide)

---

## 🎯 OVERVIEW

### Purpose
This document provides a comprehensive implementation guide for creating a secure, Square-compliant checkout system that maintains complete separation between:
- **Square Review Page**: A "safe" page showing generic digital services (what Square sees during application review)
- **Customer Site**: The real website with actual IPTV/Fire Stick products

### Key Principle
Square should ONLY see the secure checkout page with generic "digital services" - never the real customer-facing IPTV products.

---

## 🔐 SEPARATE SQUARE-ONLY CHECKOUT PAGE

### Route Configuration
```
/secure-checkout     → SecureCheckoutPage.tsx (Square sees this)
/checkout            → NewCheckoutPage.tsx (Customers use this)
```

### Domain Setup
```
Main Site:           streamstickpro.com
Square Review Site:  secure.streamstickpro.com
```

### Environment Variables
```bash
# Square-Only Domain Configuration
VITE_SECURE_HOSTS=secure.streamstickpro.com,checkout-secure.streamstickpro.com
VITE_CONCIERGE_HOSTS=concierge.streamstickpro.com

# Square API Keys (Production)
VITE_SQUARE_APP_ID=sq0idp-XXXXXXXXXXXXX
VITE_SQUARE_LOCATION_ID=XXXXXXXXXXXXX
VITE_SQUARE_ACCESS_TOKEN=XXXXXXXXXXXXX

# Square API Keys (Sandbox - for testing)
VITE_SQUARE_SANDBOX_APP_ID=sandbox-sq0idp-XXXXXXXXXXXXX
VITE_SQUARE_SANDBOX_LOCATION_ID=XXXXXXXXXXXXX
```

### Square-Safe Product Mapping

| Real Product | Square-Safe Name | Price |
|-------------|------------------|-------|
| 1 Month IPTV | Content Research & Curation Service - 1 Month | $15.00 |
| 3 Month IPTV | Content Strategy & Research Package - 3 Months | $30.00 |
| 6 Month IPTV | Premium Digital Media Library Access - 6 Months | $50.00 |
| 1 Year IPTV | Enterprise Content Management Platform - 1 Year | $75.00 |
| Fire Stick HD | Professional Website Page Design & Development | $140.00 |
| Fire Stick 4K | Website Page Design + 1 Month SEO Optimization | $150.00 |
| Fire Stick 4K Max | Website Page Design + 6 Months SEO Strategy | $160.00 |

### SecureCheckoutPage Implementation

The `SecureCheckoutPage.tsx` component should:
1. Load products from `square_products` table (not `real_products`)
2. Display generic service names and descriptions
3. Process payments through Square only
4. Never reference IPTV, Fire Stick, or streaming terminology

---

## 🛡️ CUSTOMER FLOW SECURITY

### Flow Diagram
```
Customer Journey:
┌──────────────────────────────────────────────────────────────┐
│  1. Customer visits streamstickpro.com                       │
│  2. Browses real IPTV/Fire Stick products                    │
│  3. Adds to cart                                             │
│  4. Proceeds to checkout (Cash App/Bitcoin/Square)           │
│  5. Payment processed                                         │
│  6. Credentials generated and emailed                        │
└──────────────────────────────────────────────────────────────┘

Square Review Journey:
┌──────────────────────────────────────────────────────────────┐
│  1. Square reviewer visits secure.streamstickpro.com         │
│  2. Sees only generic "digital services"                     │
│  3. Tests payment with test card                             │
│  4. Approves application                                     │
└──────────────────────────────────────────────────────────────┘
```

### Security Measures

1. **Domain Detection**: App.tsx automatically detects hostname and shows appropriate version
2. **No Cross-Linking**: Secure page never links to real products
3. **Separate Database Tables**: `square_products` vs `real_products`
4. **No IPTV Terminology**: All secure page content uses generic service language

---

## 🔑 ENHANCED CREDENTIAL MANAGEMENT

### Admin Dashboard Features

```typescript
// Credential Management Dashboard Components

interface CredentialRecord {
  id: string;
  order_id: string;
  customer_email: string;
  customer_name: string;
  portal_username: string;
  portal_password: string;
  portal_url: string;
  product_type: 'iptv' | 'firestick';
  subscription_duration: string;
  generated_at: string;
  email_sent: boolean;
  email_sent_at: string | null;
  status: 'active' | 'expired' | 'suspended';
}
```

### Database Schema for Credentials

```sql
CREATE TABLE IF NOT EXISTS customer_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  portal_username text NOT NULL,
  portal_password text NOT NULL,
  portal_url text DEFAULT 'http://ky-tv.cc',
  product_type text NOT NULL,
  subscription_duration text,
  generated_at timestamptz DEFAULT now(),
  email_sent boolean DEFAULT false,
  email_sent_at timestamptz,
  status text DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_credentials_email ON customer_credentials(customer_email);
CREATE INDEX idx_credentials_order ON customer_credentials(order_id);
CREATE INDEX idx_credentials_status ON customer_credentials(status);
```

### Credential Generation Algorithm

```typescript
const generateCredential = (baseName: string): string => {
  const cleaned = (baseName || 'user')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  const prefix = cleaned.slice(0, 4) || 'user';
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8 + Math.floor(Math.random() * 2); // 8 or 9 characters
  let suffix = '';
  while ((prefix + suffix).length < length) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return (prefix + suffix).slice(0, length);
};
```

---

## 📧 EMAIL SYSTEM IMPROVEMENTS

### Email Templates

#### 1. IPTV Subscription Welcome Email
```
Subject: 🎉 Your IPTV Subscription is Active! - Order #{orderNumber}

Dear {customerName},

Thank you for your purchase from Stream Stick Pro!

YOUR STREAMING PORTAL ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal URL: http://ky-tv.cc
Username: {portalUsername}
Password: {portalPassword}

WHAT'S INCLUDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ 18,000+ Live TV Channels
✓ 60,000+ Movies & TV Shows  
✓ All Sports Channels & Pay-Per-View Events
✓ 4K/FHD/HD Quality Streaming
✓ Works on Any Device

EXPECTED DELIVERY TIME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Your IPTV subscription credentials are typically delivered within 1-24 hours.

NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: reloadedfiretvteam@gmail.com

Thank you for choosing Stream Stick Pro!
```

#### 2. Fire Stick Purchase Email
```
Subject: 🔥 Your Fire Stick Order Confirmed! - Order #{orderNumber}

Dear {customerName},

Thank you for your Fire Stick purchase from Stream Stick Pro!

YOUR STREAMING PORTAL ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal URL: http://ky-tv.cc
Username: {portalUsername}
Password: {portalPassword}

📦 SHIPPING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Expected Delivery: 4-6 Business Days
Shipping Address: {shippingAddress}

🎥 SETUP TUTORIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Watch our Fire Stick setup video:
https://youtu.be/sO2Id0bXHIY?si=1FBAbzYvUViIpepS

YOUR PACKAGE INCLUDES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Brand New Amazon {fireStickModel}
✓ Pre-Configured & Ready to Use
✓ 1 Year Premium IPTV Subscription
✓ 18,000+ Live TV Channels
✓ 60,000+ Movies & TV Shows
✓ All Sports & Pay-Per-View

NEED HELP?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: reloadedfiretvteam@gmail.com

Thank you for choosing Stream Stick Pro!
```

### Email Logging Table

```sql
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  template_key text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status text DEFAULT 'pending',
  sent_at timestamptz,
  error_message text,
  retry_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

---

## 📊 SECURITY LOGGING

### Audit Events to Track

```typescript
type AuditEventType = 
  | 'credential_generated'
  | 'credential_emailed'
  | 'credential_viewed'
  | 'credential_regenerated'
  | 'admin_login'
  | 'admin_logout'
  | 'order_created'
  | 'order_updated'
  | 'payment_received'
  | 'payment_failed';
```

### Audit Log Table

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  user_email text,
  ip_address text,
  user_agent text,
  resource_type text,
  resource_id text,
  old_value jsonb,
  new_value jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_audit_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_user ON audit_logs(user_email);
```

---

## 🔥 FIRE STICK SPECIFIC TEMPLATES

### Fire Stick Welcome Email Template

Includes:
- Setup tutorial video link: `https://youtu.be/sO2Id0bXHIY?si=1FBAbzYvUViIpepS`
- Shipping tracking information
- Portal credentials
- 4-6 day delivery estimate

### Fire Stick Order Confirmation

```typescript
const isFirestickOrder = items.some(item =>
  item.name.toLowerCase().includes('fire stick') ||
  item.name.toLowerCase().includes('firestick') ||
  item.name.toLowerCase().includes('fire tv')
);

if (isFirestickOrder) {
  // Include YouTube tutorial link
  // Include shipping address
  // Include 4-6 day delivery estimate
}
```

---

## 🔔 ADMIN NOTIFICATIONS

### Notification Events

1. **New Order Received**
   - Email to: reloadedfiretvteam@gmail.com
   - Includes: Order details, customer info, payment method

2. **Credential Generated**
   - Email to: reloadedfiretvteam@gmail.com
   - Includes: Customer credentials, order number

3. **Payment Received**
   - Email to: reloadedfiretvteam@gmail.com
   - Includes: Payment confirmation, amount, method

4. **Failed Transaction**
   - Email to: reloadedfiretvteam@gmail.com
   - Includes: Error details, customer info

---

## 🔄 SQUARE WEBHOOK HANDLING

### Webhook Endpoints

```typescript
// Cloudflare Function: functions/square-webhook.ts

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await request.json();
  const eventType = body.type;

  switch (eventType) {
    case 'payment.completed':
      await handlePaymentCompleted(body.data, env);
      break;
    case 'payment.failed':
      await handlePaymentFailed(body.data, env);
      break;
    case 'order.created':
      await handleOrderCreated(body.data, env);
      break;
    case 'refund.created':
      await handleRefundCreated(body.data, env);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

### Webhook Signature Verification

```typescript
const verifySquareWebhook = (
  signature: string,
  body: string,
  webhookSignatureKey: string
): boolean => {
  const hmac = crypto.createHmac('sha256', webhookSignatureKey);
  const expectedSignature = hmac.update(body).digest('base64');
  return signature === expectedSignature;
};
```

---

## ⚠️ ERROR HANDLING

### Credential Generation Failures

```typescript
try {
  const credentials = await generateCredentials(customerInfo);
  await saveCredentials(credentials);
  await sendCredentialsEmail(credentials);
} catch (error) {
  // Log error to audit trail
  await logAuditEvent('credential_generation_failed', {
    error: error.message,
    customerEmail: customerInfo.email,
    orderId: order.id
  });

  // Store backup credentials
  await storeBackupCredentials(customerInfo, order.id);

  // Notify admin
  await sendAdminNotification('credential_failure', {
    error: error.message,
    customer: customerInfo
  });

  // Queue for retry
  await queueCredentialRetry(order.id);
}
```

### Retry Queue Table

```sql
CREATE TABLE IF NOT EXISTS credential_retry_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  customer_email text NOT NULL,
  retry_count int DEFAULT 0,
  last_error text,
  next_retry_at timestamptz,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
```

---

## 🎧 CUSTOMER SUPPORT SYSTEM

### Support Ticket Table

```sql
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE NOT NULL,
  customer_email text NOT NULL,
  customer_name text,
  order_id uuid REFERENCES orders(id),
  subject text NOT NULL,
  description text,
  category text,
  priority text DEFAULT 'normal',
  status text DEFAULT 'open',
  assigned_to text,
  resolution text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);
```

### Credential Issue Categories

1. **Credentials Not Received** - Resend credentials email
2. **Login Not Working** - Verify and regenerate if needed
3. **Subscription Expired** - Check and extend if valid
4. **Device Limit Reached** - Assist with device management

---

## 📝 AUDIT TRAIL

### What Gets Logged

| Event | Details Logged |
|-------|----------------|
| Order Created | Customer info, items, payment method |
| Payment Received | Amount, method, transaction ID |
| Credentials Generated | Username, password hash, order ID |
| Email Sent | Recipient, template, status |
| Admin Login | User, IP, timestamp |
| Credential Viewed | Who viewed, when |

---

## 💾 BACKUP CREDENTIAL STORAGE

### Backup Strategy

1. **Primary Storage**: `customer_credentials` table in Supabase
2. **Backup Storage**: `credential_backups` table with encrypted passwords
3. **Email Log**: All credentials sent are logged in `email_logs`

### Backup Table

```sql
CREATE TABLE IF NOT EXISTS credential_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid,
  customer_email text NOT NULL,
  encrypted_credentials text NOT NULL,
  backup_source text DEFAULT 'auto',
  created_at timestamptz DEFAULT now()
);
```

---

## 🔧 TECHNICAL IMPROVEMENTS

### Environment Variables Checklist

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Square
VITE_SQUARE_APP_ID=your-app-id
VITE_SQUARE_LOCATION_ID=your-location-id
VITE_SQUARE_ACCESS_TOKEN=your-access-token

# Domain Configuration
VITE_SECURE_HOSTS=secure.streamstickpro.com
VITE_CONCIERGE_HOSTS=concierge.streamstickpro.com

# Service Portal
VITE_SERVICE_PORTAL_URL=http://ky-tv.cc

# Admin
VITE_ADMIN_EMAIL=reloadedfiretvteam@gmail.com
```

### URL Validation

```typescript
const validateServiceURL = (url: string): boolean => {
  try {
    new URL(url);
    return url.includes('ky-tv.cc');
  } catch {
    return false;
  }
};
```

### Mobile Responsiveness

All checkout forms should:
- Use `max-w-xl` or `max-w-2xl` containers
- Use responsive grid: `grid-cols-1 md:grid-cols-2`
- Touch-friendly buttons: minimum 44x44px
- Proper form field sizing on mobile

---

## ✅ TESTING CHECKLIST FOR SQUARE APPROVAL

### Before Submitting to Square

- [ ] Secure domain (secure.streamstickpro.com) shows only generic services
- [ ] No IPTV/Fire Stick terminology on secure domain
- [ ] All product descriptions are generic "digital services"
- [ ] Prices match between secure page and Square catalog
- [ ] Square payment form loads correctly
- [ ] Test transaction completes successfully
- [ ] Order confirmation displays properly
- [ ] SSL certificate is valid
- [ ] Privacy policy exists
- [ ] Terms of service exists
- [ ] Refund policy exists

### Square Application Checklist

1. **Business Information**
   - Business name: Stream Stick Pro (or registered business name)
   - Business type: Digital Services / Consulting
   - Website: secure.streamstickpro.com

2. **Product/Service Description**
   - "Digital content management and consulting services"
   - "Website design and SEO optimization services"
   - Do NOT mention: IPTV, streaming, Fire Stick, jailbroken

3. **Processing Volume**
   - Average transaction: $50-$150
   - Monthly volume estimate: Based on actual business

---

## 📚 CONFIGURATION GUIDE

### Step 1: Set Up Square Account

1. Create Square Developer account at https://developer.squareup.com
2. Create new application
3. Get Sandbox credentials for testing
4. Get Production credentials after approval

### Step 2: Configure Cloudflare Pages

1. Add environment variables to Cloudflare Pages project
2. Add custom domain: secure.streamstickpro.com
3. Enable SSL for custom domain

### Step 3: Database Setup

Run all SQL migrations in Supabase SQL Editor:
- Create `square_products` table
- Create `customer_credentials` table
- Create `audit_logs` table
- Create `email_logs` table

### Step 4: Test Flow

1. Visit secure.streamstickpro.com
2. Add product to cart
3. Complete Square payment with test card
4. Verify order created in database
5. Verify email sent

---

## 🚀 DEPLOYMENT GUIDE

### Production Deployment Steps

1. **Merge Changes**
   ```bash
   git add .
   git commit -m "Add secure checkout system"
   git push origin main
   ```

2. **Verify Cloudflare Build**
   - Check Cloudflare Pages dashboard
   - Verify build succeeds
   - Check deployment preview

3. **Configure Domains**
   - Add secure.streamstickpro.com to Cloudflare Pages
   - Verify SSL certificate
   - Test domain resolves correctly

4. **Final Verification**
   - Test secure checkout flow
   - Test main site checkout flow
   - Verify email sending
   - Test admin dashboard

### Switching Between Environments

**For Square Review:**
- Point Square to: secure.streamstickpro.com
- Ensure only generic services visible

**For Customers:**
- Main site: streamstickpro.com
- Real products with actual checkout

---

## 📞 SUPPORT CONTACT

- **Admin Email**: reloadedfiretvteam@gmail.com
- **Cash App**: $starevan11
- **Bitcoin Wallet**: bc1q448jm49ypzwsrrk75c974uqla28k0kmnx6w95r
- **Service Portal**: http://ky-tv.cc

---

*Document Version: 1.0*
*Last Updated: 2025*
*Author: Stream Stick Pro Development Team*
