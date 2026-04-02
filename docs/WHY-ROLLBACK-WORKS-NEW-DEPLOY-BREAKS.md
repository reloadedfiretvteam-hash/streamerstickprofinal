# Why rollback works and every new deploy breaks (exact mechanism)

You roll back to **4a86d30c** → trial and checkout work. You deploy again (with SEO or anything) → the **new** deployment is live → trial and checkout break. So the **old** deployment has the right configuration; the **new** one does not. This doc explains what in the system causes that.

---

## What happens on each deploy

1. You push to **clean-main** (or the workflow runs).
2. GitHub Actions runs and executes:
   ```bash
   wrangler pages deploy dist --project-name=streamerstickpro-live --branch=clean-main
   ```
3. Cloudflare creates a **new** deployment and makes it **live** for your custom domain (streamstickpro.com).
4. That new deployment is assigned to **one** of two environments:
   - **Production**
   - **Preview**
5. The Worker on that deployment gets **only** the environment variables that are set for that environment in the Cloudflare project. There are two separate sets: one for Production, one for Preview.
6. If the deployment is **Preview** and you never set variables for **Preview**, the Worker has **no** Stripe/Resend/Supabase → trial and checkout fail.

So the new deploy “switches” your live site to a deployment that is using an environment (Production or Preview) that doesn’t have your variables. The rollback “switches” you back to a deployment that was using the environment that **does** have them.

---

## What determines Production vs Preview

In Cloudflare it’s **one** setting:

**Project → Settings → Builds & deployments → Configure Production deployments → Production branch**

- Only **one** branch is the “production branch” (e.g. **main** or **clean-main**).
- Deployments from **that** branch → **Production** → use **Production** environment variables.
- Deployments from **any other** branch → **Preview** → use **Preview** environment variables.

Your workflow **always** deploys with `--branch=clean-main`. So:

- If the **production branch** in Cloudflare is **clean-main**  
  → every deploy from your workflow is **Production**  
  → it uses **Production** env. If that’s where you set your vars, it works.

- If the **production branch** is **main** (or anything other than **clean-main**)  
  → every deploy from your workflow is **Preview**  
  → it uses **Preview** env. If you only set variables under **Production**, Preview is empty → trial and checkout break.

So the “what in my code or system” is: **the Production branch setting** in Cloudflare. Nothing in your repo code changes that; the same workflow and same `--branch=clean-main` can be Production or Preview depending on that single setting.

---

## Why the old deployment (4a86d30c) still works

When you roll back to **4a86d30c**, you’re serving a deployment that was created earlier (e.g. Feb 18). That deployment was assigned to Production or Preview **according to the same rule**. So either:

- **A)** When 4a86d30c was created, **clean-main** was the production branch, so it got **Production** env (where you have vars). Later the production branch was changed to **main**, so **new** deploys from clean-main became **Preview** and get no vars.  
  **Or**
- **B)** Back then you had set **Preview** env as well, so that deployment had vars. Later Preview was cleared or changed, so **new** Preview deployments no longer have vars.

In both cases, the **new** deployment is the one missing variables; the **old** one was created when the right environment had them.

---

## What to check and fix (no code change)

### 1. See which branch is Production

1. Cloudflare Dashboard → **Workers & Pages** → **streamerstickpro-live**
2. **Settings** → **Builds & deployments**
3. Under **Configure Production deployments**, check **Production branch**.

- If it’s **clean-main**: your deploys are Production and should get Production env. Then confirm **Production** env vars are really set (Settings → Environment variables → Production).
- If it’s **main** (or anything else): your deploys are **Preview**. Then either:
  - Set **Preview** environment variables to the same as Production (Stripe, Resend, Supabase, SESSION_SECRET, etc.), **or**
  - Change **Production branch** to **clean-main** so these deploys use Production env.

### 2. Safest: set both environments

In **Settings → Environment variables** for **streamerstickpro-live**:

- Set all required vars for **Production** (same as you had when 4a86d30c worked).
- Set the **exact same** vars for **Preview**.

Then it doesn’t matter whether the next deploy is Production or Preview; trial and checkout will work.

---

## Whose “fault” and what’s “missing”

- **Not** the SEO or other code: those don’t control which environment a deployment uses or what env vars it gets.
- **Not** “something in the code during deployment”: the workflow just runs `wrangler pages deploy ... --branch=clean-main`; it doesn’t choose Production vs Preview.
- **What’s in the system:** Cloudflare’s **Production branch** setting plus **two** separate env sets (Production and Preview). If the branch we deploy (**clean-main**) is not the production branch, we get Preview. If Preview has no vars, the new deployment has no vars and the site “breaks” (trial/checkout fail) until you roll back to a deployment that had vars (e.g. 4a86d30c).
- **What’s “missing”:** Either the **Production branch** is not **clean-main**, so new deploys use Preview and need **Preview** env vars, or Preview env was never set / was cleared. Fix: set vars for **both** Production and Preview (or set Production branch to **clean-main** and keep Production env set).
ok
No code change fixes this; only Cloudflare project settings and environment variables do.
