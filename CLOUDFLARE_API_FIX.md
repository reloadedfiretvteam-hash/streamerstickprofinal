# 🔧 Cloudflare API: Add Stripe Key Programmatically

## Option 1: I Can Guide You (Recommended)

I can walk you through step-by-step using your browser. Just tell me:
- Are you logged into Cloudflare now?
- Can you navigate to Pages → Your Project → Settings → Environment Variables?

## Option 2: Use Cloudflare API Directly

If you want to add it via API, here's the command:

**You'll need:**
1. Cloudflare Account ID
2. Pages Project Name
3. Cloudflare API Token

**API Call:**
```bash
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/{account_id}/pages/projects/{project_name}/environment_variables" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "VITE_STRIPE_PUBLISHABLE_KEY": {
        "value": "pk_live_51SXXh4HBw27Y92Ci4r7de3JTz13uAz7EF04b2ZpW8KhtDQYaa2mh1ayE8RiCKSRxRYtn3o7VNMINWJd9f7oGYsxT002VVUcvC8",
        "type": "secret",
        "environments": ["production"]
      }
    }
  }'
```

But the **easiest way** is through the Cloudflare Dashboard UI!




