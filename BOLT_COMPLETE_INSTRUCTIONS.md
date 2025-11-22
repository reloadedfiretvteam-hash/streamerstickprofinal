# 📋 COMPLETE DETAILED PROMPT FOR BOLT

**Copy everything below and paste it to Bolt:**

---

```
I need comprehensive help fixing my Cloudflare Pages deployment and ensuring all my website updates are live.

CURRENT SITUATION:
- My website is showing the old version, not the new updates
- Code is in GitHub repository: reloadedfiretvteam-hash/streamerstickprofinal
- Cloudflare project: streamerstickprofinal
- My domain is connected to a template project (wrong one) instead of my real project
- Cloudflare deployments are failing or not showing new updates
- GitHub auto-deployment is not working properly

WHAT I NEED YOU TO DO:

1. VERIFY CODE IS IN GITHUB:
   - Check: https://github.com/reloadedfiretvteam-hash/streamerstickprofinal
   - Verify ALL files are there, especially:
     * All files in src/ folder (components, pages, etc.)
     * All files in public/ folder (images, assets)
     * package.json, vite.config.ts, wrangler.toml
     * .nvmrc file (Node version 20)
   - If anything is missing, push it to GitHub

2. FIX CLOUDFLARE DOMAIN CONNECTION:
   - Remove my main domain from the template project (wrong one)
   - Remove my secure subdomain (secure.streamstickpro.com) from template project
   - Connect main domain to "streamerstickprofinal" project (the correct one)
   - Connect secure subdomain to "streamerstickprofinal" project (needed for Square payments)
   - Both domains should point to the same project: streamerstickprofinal

3. TRIGGER CLOUDFLARE DEPLOYMENT:
   - Go to Cloudflare project: streamerstickprofinal
   - Go to Deployments tab
   - Click "Create deployment" → "Deploy latest commit"
   - OR click "Retry deployment" on the latest one
   - Make sure it builds successfully
   - Wait for deployment to complete (3-5 minutes)

4. FIX AUTO-DEPLOYMENT:
   - In Cloudflare project "streamerstickprofinal"
   - Go to Settings → Builds & deployments
   - Make sure "Auto-deploy from Git" is ENABLED
   - Verify build settings:
     * Build command: npm run build
     * Build output directory: dist
     * Root directory: / (or empty)
     * Node version: 20

5. FIX FAILED DEPLOYMENTS:
   - Check GitHub Actions: https://github.com/reloadedfiretvteam-hash/streamerstickprofinal/actions
   - Find any failed workflows
   - Fix the errors
   - Test by making a small change and pushing to verify auto-deployment works

6. VERIFY EVERYTHING WORKS:
   - Check that main domain shows updated website
   - Check that secure subdomain works for Square payments
   - Verify Cloudflare auto-deploys when code is pushed to GitHub
   - Test that new deployments complete successfully

IMPORTANT DETAILS:
- GitHub Repository: reloadedfiretvteam-hash/streamerstickprofinal
- GitHub URL: https://github.com/reloadedfiretvteam-hash/streamerstickprofinal
- Cloudflare Project: streamerstickprofinal
- Cloudflare URL: https://dash.cloudflare.com/f1d6fdedf801e39f184a19ae201e8be1/pages/view/streamerstickprofinal
- Branch: main
- Build command: npm run build
- Build output: dist
- Node version: 20
- Payment processor: Square (requires secure subdomain)

CURRENT PROBLEMS:
- Website showing old version (not updated)
- Domain connected to wrong project (template instead of real one)
- Deployments failing or not triggering automatically
- New files not appearing on live site

I'm not very technical, so please give me very clear, step-by-step instructions for each task. Walk me through each step and verify it's complete before moving to the next one.

Please start by checking what's in GitHub and what's deployed in Cloudflare, then fix the issues one by one.
```

---

**Just copy the text between the ``` marks and paste it to Bolt!**

