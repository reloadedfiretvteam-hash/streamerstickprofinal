# Google Search Console Integration

Continuous SEO feedback: pull impressions, clicks, CTR, position per URL; trigger title/meta tests, content upgrades, internal linking boosts.

## Setup

1. **Google Cloud Project**
   - Create a project, enable "Google Search Console API".
   - Create OAuth 2.0 credentials (Desktop or Service Account). For automation, Service Account is preferred.

2. **GSC Property**
   - Add the Service Account email as a user (full permission) in Search Console for `streamstickpro.com`.

3. **Env**
   - `GSC_CLIENT_ID`, `GSC_CLIENT_SECRET`, `GSC_REFRESH_TOKEN` (OAuth), or
   - `GOOGLE_APPLICATION_CREDENTIALS` path to Service Account JSON.

## Data to Pull

- **Search Analytics**: impressions, clicks, CTR, average position per page (URL), per query (optional).
- **URL Inspection** (optional): index status, coverage, mobile usability for specific URLs.

## Triggers (rules)

| Condition | Action |
|----------|--------|
| High impressions, low CTR | Queue title/meta A/B test; use `seo/prompts/title-meta-generation.md`. |
| Good traffic, low conversions | Adjust on-page copy, CTAs, add trust blocks. |
| Strong pages | Increase internal links, add Product/FAQ schema. |
| Low impressions, high intent query | Expand content, add HowTo/FAQ schema. |

## Example Script (Node.js)

```js
// scripts/gsc-fetch.js – example using Google APIs Node client
const { google } = require('googleapis');

async function fetchSearchAnalytics() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  const site = 'sc-domain:streamstickpro.com'; // or https://streamstickpro.com/

  const res = await searchconsole.searchanalytics.query({
    siteUrl: site,
    requestBody: {
      startDate: '2025-12-01',
      endDate: '2026-01-20',
      dimensions: ['page'],
      rowLimit: 500,
    },
  });
  return res.data.rows || [];
}
```

Run on a schedule (e.g. weekly Cron) or after deployments; feed results into your rule engine or prompt pipeline.
