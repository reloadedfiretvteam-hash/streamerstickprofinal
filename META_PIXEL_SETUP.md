# 🎯 Meta Pixel & Retargeting Setup Guide

## What This Does

This implementation enables **retargeting** - showing ads to visitors after they leave your website. When someone visits your site, the Meta Pixel (Facebook Pixel) tracks them, and then you can show them ads on Facebook, Instagram, and across the internet to remind them about your website.

## ✅ What's Already Implemented

1. **Meta Pixel (Facebook Pixel)** - Tracks all visitors
2. **Google Ads Pixel** - For Google retargeting
3. **Exit Intent Popup** - Shows a popup when users try to leave
4. **Conversion Tracking** - Tracks purchases, trials, signups
5. **Page View Tracking** - Tracks all page visits automatically

## 🔧 Setup Instructions

### Step 1: Get Your Meta Pixel ID

1. Go to [Facebook Business Manager](https://business.facebook.com/)
2. Navigate to **Events Manager**
3. Click **Connect Data Sources** → **Web**
4. Select **Meta Pixel**
5. Click **Set up Pixel**
6. Copy your **Pixel ID** (looks like: `123456789012345`)

### Step 2: Add Pixel ID to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to your project: **Workers & Pages** → **streamerstickpro-live**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
VITE_META_PIXEL_ID=your_pixel_id_here
VITE_FACEBOOK_PIXEL_ID=your_pixel_id_here (optional, same as above)
VITE_GOOGLE_ADS_ID=AW-XXXXXXXXX (optional, for Google retargeting)
```

### Step 3: Verify It's Working

1. Install [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc) Chrome extension
2. Visit your website
3. Click the extension icon
4. You should see "Pixel ID: XXXXX" - this means it's working!

## 🎨 Exit Intent Popup

The exit intent popup automatically shows when:
- User moves mouse toward the top of the browser (to close tab)
- User tries to close the window/tab
- Only shows once per day per user

The popup:
- Reminds visitors about your website
- Encourages them to shop
- Tracks the interaction for retargeting
- Can be customized in `client/src/components/ExitIntentPopup.tsx`

## 📊 Conversion Tracking

Conversions are automatically tracked when:
- **Purchase**: User completes checkout
- **Trial**: User signs up for free trial
- **Add to Cart**: User adds item to cart
- **Initiate Checkout**: User starts checkout process

## 🚀 How Retargeting Works

1. **Visitor comes to your site** → Meta Pixel tracks them
2. **Visitor leaves** → They're added to your retargeting audience
3. **They browse the internet** → Your ads appear on Facebook, Instagram, websites
4. **They see your ad** → Reminds them about your website
5. **They click and return** → Higher chance of conversion!

## 📈 Creating Retargeting Campaigns

### Facebook/Instagram Retargeting:

1. Go to [Facebook Ads Manager](https://business.facebook.com/adsmanager/)
2. Click **Create** → **Campaign**
3. Choose objective: **Traffic** or **Conversions**
4. Under **Audiences**, select **Custom Audiences**
5. Choose **Website Traffic** → **People who visited your website**
6. Set time frame: **Last 30 days** or **Last 90 days**
7. Create your ad and launch!

### Google Ads Retargeting:

1. Go to [Google Ads](https://ads.google.com/)
2. Navigate to **Tools & Settings** → **Audience Manager**
3. Click **+** → **Website visitors**
4. Set up your remarketing tag
5. Create campaign targeting this audience

## 🎯 Best Practices

1. **Don't Overwhelm**: Set frequency caps (max 3-5 ads per day per user)
2. **Create Compelling Ads**: Use images/videos of your products
3. **Offer Incentives**: "Come back and get 10% off!"
4. **Test Different Messages**: See what works best
5. **Track Performance**: Monitor click-through rates and conversions

## 🔍 Testing

To test if everything is working:

1. Visit your website
2. Open browser console (F12)
3. Type: `fbq('track', 'PageView')`
4. Check Facebook Events Manager - you should see the event

## 📝 Custom Events

You can track custom events:

```typescript
import { trackCustomEvent } from '@/components/RetargetingPixels';

// Track when user views a product
trackCustomEvent('ViewProduct', {
  product_name: 'IPTV Premium',
  product_price: 29.99
});

// Track when user watches video
trackCustomEvent('WatchVideo', {
  video_title: 'How to Setup IPTV'
});
```

## ⚠️ Privacy Compliance

Make sure to:
- Add a Privacy Policy mentioning retargeting
- Comply with GDPR/CCPA if applicable
- Give users option to opt-out (Facebook has built-in controls)

## 🎉 That's It!

Once you add your Meta Pixel ID, retargeting will start working automatically. Visitors will see your ads after they leave, keeping your brand top-of-mind!

---

**Need Help?**
- [Meta Pixel Documentation](https://www.facebook.com/business/help/952192354843755)
- [Facebook Retargeting Guide](https://www.facebook.com/business/learn/facebook-ads-retargeting)
