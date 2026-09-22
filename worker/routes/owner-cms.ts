/**
 * Owner CMS APIs — content only.
 * Uses cms_* tables when migrated; otherwise site_settings JSON fallback
 * (live DATABASE_URL secret is currently invalid for Actions DDL).
 * Never creates/updates Stripe prices.
 */
import { Hono } from "hono";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "../index";
import { getSupabaseServiceKey, getSupabaseUrl } from "../helpers";
import { settingsCms, starterSetupGuide, tablesReady } from "../lib/owner-cms-settings-store";

function sb(env: Env): SupabaseClient {
  return createClient(getSupabaseUrl(env), getSupabaseServiceKey(env), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function audit(client: SupabaseClient, action: string, entity_type: string, entity_id: string, detail: Record<string, unknown> = {}) {
  if (await tablesReady(client)) {
    try {
      await client.from("cms_admin_audit_log").insert({ actor: "admin", action, entity_type, entity_id, detail });
      return;
    } catch { /* fall through */ }
  }
  await settingsCms.appendAudit(client, { actor: "admin", action, entity_type, entity_id, detail });
}

function priceWarnings(row: any): string[] {
  if (row?.payment_ref_display && String(row.payment_ref_display).includes("Checkout linked")) {
    return [
      "Public display price is content-only. It does not change protected Stripe checkout amounts.",
    ];
  }
  return [];
}

export function createOwnerCmsPublicRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get("/homepage", async (c) => {
    try {
      const client = sb(c.env);
      if (await tablesReady(client)) {
        const { data, error } = await client.from("cms_homepage").select("*").eq("id", "default").maybeSingle();
        if (!error) return c.json({ data, fallback: !data, store: "table" }, 200);
      }
      const data = await settingsCms.getHomepage(client);
      return c.json({ data, fallback: false, store: "site_settings" }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message || "unavailable", fallback: true }, 200);
    }
  });

  app.get("/banners", async (c) => {
    try {
      const client = sb(c.env);
      const now = new Date().toISOString();
      let rows: any[] = [];
      if (await tablesReady(client)) {
        const { data } = await client.from("cms_banners").select("*").eq("is_active", true).eq("status", "published").order("priority", { ascending: false });
        rows = data || [];
      } else {
        rows = (await settingsCms.listBanners(client)).filter((b) => b.is_active && b.status === "published");
      }
      rows = rows.filter((b) => (!b.starts_at || b.starts_at <= now) && (!b.ends_at || b.ends_at >= now));
      return c.json({ data: rows }, 200);
    } catch (e: any) {
      return c.json({ data: [], error: e?.message }, 200);
    }
  });

  app.get("/devices", async (c) => {
    try {
      const client = sb(c.env);
      let rows: any[] = [];
      if (await tablesReady(client)) {
        const { data } = await client.from("cms_device_content").select("*").eq("status", "published").order("sort_order");
        rows = data || [];
      } else {
        rows = (await settingsCms.listDevices(client)).filter((d) => d.status === "published");
      }
      return c.json({ data: rows }, 200);
    } catch (e: any) {
      return c.json({ data: [], error: e?.message }, 200);
    }
  });

  app.get("/devices/:sku", async (c) => {
    try {
      const client = sb(c.env);
      const sku = c.req.param("sku");
      let data: any = null;
      if (await tablesReady(client)) {
        const res = await client.from("cms_device_content").select("*").eq("sku", sku).eq("status", "published").maybeSingle();
        data = res.data;
      } else {
        data = (await settingsCms.listDevices(client)).find((d) => d.sku === sku && d.status === "published") || null;
      }
      if (!data) return c.json({ data: null, error: "not_found" }, 404);
      return c.json({ data }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message }, 500);
    }
  });

  app.get("/plans", async (c) => {
    try {
      const client = sb(c.env);
      let rows: any[] = [];
      if (await tablesReady(client)) {
        const { data } = await client.from("cms_plan_content").select("*").eq("status", "published").order("sort_order");
        rows = data || [];
      } else {
        rows = (await settingsCms.listPlans(client)).filter((p) => p.status === "published");
      }
      return c.json({ data: rows }, 200);
    } catch (e: any) {
      return c.json({ data: [], error: e?.message }, 200);
    }
  });

  app.get("/plans/:code", async (c) => {
    try {
      const client = sb(c.env);
      const code = c.req.param("code");
      let data: any = null;
      if (await tablesReady(client)) {
        const res = await client.from("cms_plan_content").select("*").eq("code", code).eq("status", "published").maybeSingle();
        data = res.data;
      } else {
        data = (await settingsCms.listPlans(client)).find((p) => p.code === code && p.status === "published") || null;
      }
      if (!data) return c.json({ data: null, error: "not_found" }, 404);
      return c.json({ data }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message }, 500);
    }
  });

  app.get("/guides", async (c) => {
    try {
      const client = sb(c.env);
      let rows: any[] = [];
      if (await tablesReady(client)) {
        const { data } = await client
          .from("cms_guides")
          .select("id,slug,title,summary,category,hero_image_url,image_alt,status,sort_order,published_at")
          .eq("status", "published")
          .order("sort_order");
        rows = data || [];
      } else {
        rows = (await settingsCms.listGuides(client)).filter((g) => g.status === "published");
      }
      if (!rows.length) {
        rows = [
          {
            id: starterSetupGuide.id,
            slug: starterSetupGuide.slug,
            title: starterSetupGuide.title,
            summary: starterSetupGuide.summary,
            category: starterSetupGuide.category,
            status: starterSetupGuide.status,
            sort_order: starterSetupGuide.sort_order,
          },
        ];
      }
      return c.json({ data: rows }, 200);
    } catch (e: any) {
      return c.json({ data: [], error: e?.message }, 200);
    }
  });

  app.get("/guides/:slug", async (c) => {
    try {
      const client = sb(c.env);
      const slug = c.req.param("slug");
      let data: any = null;
      if (await tablesReady(client)) {
        const res = await client.from("cms_guides").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
        data = res.data;
      } else {
        data = (await settingsCms.listGuides(client)).find((g) => g.slug === slug && g.status === "published") || null;
      }
      if (!data && slug === starterSetupGuide.slug) data = starterSetupGuide;
      if (!data) return c.json({ data: null, error: "not_found" }, 404);
      return c.json({ data }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message }, 500);
    }
  });

  app.get("/navigation", async (c) => {
    try {
      const client = sb(c.env);
      if (await tablesReady(client)) {
        const { data } = await client.from("cms_navigation").select("*").eq("id", "main").maybeSingle();
        if (data) return c.json({ data }, 200);
      }
      return c.json({ data: await settingsCms.getNavigation(client) }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message }, 200);
    }
  });

  app.get("/brand", async (c) => {
    try {
      const client = sb(c.env);
      if (await tablesReady(client)) {
        const { data } = await client.from("cms_brand_settings").select("*").eq("id", "default").maybeSingle();
        if (data) return c.json({ data }, 200);
      }
      const data = await settingsCms.getJson(client, settingsCms.KEYS.brand, { id: "default" });
      return c.json({ data }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message }, 200);
    }
  });

  app.get("/merchant-feed.json", async (c) => {
    try {
      const client = sb(c.env);
      const base = new URL(c.req.url).origin;
      let data: any[] = [];
      if (await tablesReady(client)) {
        const res = await client.from("cms_device_content").select("*").eq("status", "published");
        data = res.data || [];
      } else {
        data = (await settingsCms.listDevices(client)).filter((d) => d.status === "published");
      }
      const items = data
        .filter((d) => {
          const sku = String(d.sku || "").toLowerCase();
          const title = String(d.public_title || "").toLowerCase();
          if (sku.includes("firestick") || sku.includes("fire-stick")) return false;
          if (title.includes("fire stick") && !title.includes("compatible")) return false;
          return true;
        })
        .map((d) => {
          const priceCents = d.public_display_price_cents;
          const price =
            typeof priceCents === "number" && priceCents > 0 ? `${(priceCents / 100).toFixed(2)} USD` : null;
          return {
            id: d.sku,
            title: d.public_title,
            description: d.short_description || d.full_description || d.public_title,
            link: `${base}/devices/${encodeURIComponent(d.sku)}`,
            image_link: d.primary_image_url || null,
            additional_image_link: Array.isArray(d.gallery) ? d.gallery.map((g: any) => g?.url || g).filter(Boolean) : [],
            price,
            availability: d.availability === "out_of_stock" ? "out_of_stock" : "in_stock",
            condition: d.condition || "new",
            brand: d.brand || "ONN",
            identifier_exists: false,
          };
        });
      return c.json({ generated_at: new Date().toISOString(), items }, 200);
    } catch (e: any) {
      return c.json({ items: [], error: e?.message }, 200);
    }
  });

  return app;
}

export function createOwnerCmsAdminRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get("/status", async (c) => {
    const client = sb(c.env);
    const ready = await tablesReady(client);
    return c.json({
      store: ready ? "cms_tables" : "site_settings_fallback",
      migration_needed: !ready,
      status: ready
        ? { cms_homepage: "ok" }
        : { cms_homepage: "using site_settings cms_homepage_v1 until DATABASE_URL migration succeeds" },
    });
  });

  app.get("/homepage", async (c) => {
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_homepage").select("*").eq("id", "default").maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ data });
    }
    return c.json({ data: await settingsCms.getHomepage(client) });
  });

  app.put("/homepage", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data: existing } = await client.from("cms_homepage").select("*").eq("id", "default").maybeSingle();
      if (existing) {
        await client.from("cms_content_revisions").insert({
          entity_type: "homepage",
          entity_id: "default",
          snapshot: existing,
          created_by: "admin",
        });
      }
      const patch = {
        id: "default",
        status: body.status || existing?.status || "draft",
        scheduled_at: body.scheduled_at ?? existing?.scheduled_at ?? null,
        published_at: body.status === "published" ? new Date().toISOString() : existing?.published_at ?? null,
        version: (existing?.version || 0) + 1,
        document: body.document ?? existing?.document ?? {},
        updated_by: "admin",
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await client.from("cms_homepage").upsert(patch).select().maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      await audit(client, "homepage.save", "homepage", "default", { status: patch.status });
      return c.json({ data, ok: true });
    }
    const existing = await settingsCms.getHomepage(client);
    await settingsCms.appendRevision(client, { entity_type: "homepage", entity_id: "default", snapshot: existing });
    const row = {
      ...existing,
      status: body.status || existing.status || "draft",
      version: (existing.version || 0) + 1,
      document: body.document ?? existing.document,
      published_at: body.status === "published" ? new Date().toISOString() : existing.published_at,
      updated_at: new Date().toISOString(),
    };
    await settingsCms.saveHomepage(client, row);
    await audit(client, "homepage.save", "homepage", "default", { status: row.status, store: "site_settings" });
    return c.json({ data: row, ok: true });
  });

  app.get("/banners", async (c) => {
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_banners").select("*").order("priority", { ascending: false });
      if (error) return c.json({ error: error.message, data: [] }, 200);
      return c.json({ data: data || [] });
    }
    return c.json({ data: await settingsCms.listBanners(client) });
  });

  app.post("/banners", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    const row = {
      id: crypto.randomUUID(),
      campaign_name: String(body.campaign_name || ""),
      headline: String(body.headline || ""),
      subheadline: body.subheadline ?? null,
      background_color: body.background_color || "#0f172a",
      text_color: body.text_color || "#ffffff",
      image_url: body.image_url ?? null,
      button_label: body.button_label ?? null,
      button_href: body.button_href ?? null,
      target_pages: body.target_pages || ["*"],
      priority: Number(body.priority) || 0,
      is_active: Boolean(body.is_active),
      status: body.status || "draft",
      starts_at: body.starts_at ?? null,
      ends_at: body.ends_at ?? null,
      updated_at: new Date().toISOString(),
    };
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_banners").insert(row).select().maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      await audit(client, "banner.create", "banner", data?.id, {});
      return c.json({ data, ok: true });
    }
    const list = await settingsCms.listBanners(client);
    list.unshift(row);
    await settingsCms.saveBanners(client, list);
    await audit(client, "banner.create", "banner", row.id, {});
    return c.json({ data: row, ok: true });
  });

  app.put("/banners/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client
        .from("cms_banners")
        .update({ ...body, id: undefined, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ data, ok: true });
    }
    const list = await settingsCms.listBanners(client);
    const idx = list.findIndex((b) => b.id === id);
    if (idx < 0) return c.json({ error: "not_found" }, 404);
    list[idx] = { ...list[idx], ...body, id, updated_at: new Date().toISOString() };
    await settingsCms.saveBanners(client, list);
    return c.json({ data: list[idx], ok: true });
  });

  app.delete("/banners/:id", async (c) => {
    const id = c.req.param("id");
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { error } = await client.from("cms_banners").delete().eq("id", id);
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ ok: true });
    }
    const list = (await settingsCms.listBanners(client)).filter((b) => b.id !== id);
    await settingsCms.saveBanners(client, list);
    return c.json({ ok: true });
  });

  app.get("/devices", async (c) => {
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_device_content").select("*").order("sort_order");
      if (error) return c.json({ error: error.message, data: [] }, 200);
      return c.json({ data: data || [] });
    }
    return c.json({ data: await settingsCms.listDevices(client) });
  });

  app.put("/devices/:sku", async (c) => {
    const sku = c.req.param("sku");
    const body = await c.req.json();
    const client = sb(c.env);
    const { shadow_price_id: _a, shadowProductId: _b, stripe_price_id: _c, force_stripe_resync: _d, ...safe } = body;
    const row = { ...safe, sku, updated_at: new Date().toISOString() };
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_device_content").upsert(row).select().maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      await audit(client, "device.save", "device", sku, {});
      return c.json({ data, ok: true, warnings: priceWarnings(row) });
    }
    const list = await settingsCms.listDevices(client);
    const idx = list.findIndex((d) => d.sku === sku);
    if (idx >= 0) list[idx] = { ...list[idx], ...row };
    else list.push(row);
    await settingsCms.saveDevices(client, list);
    await audit(client, "device.save", "device", sku, { store: "site_settings" });
    return c.json({ data: row, ok: true, warnings: priceWarnings(row) });
  });

  app.get("/plans", async (c) => {
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_plan_content").select("*").order("sort_order");
      if (error) return c.json({ error: error.message, data: [] }, 200);
      return c.json({ data: data || [] });
    }
    return c.json({ data: await settingsCms.listPlans(client) });
  });

  app.put("/plans/:code", async (c) => {
    const code = c.req.param("code");
    const body = await c.req.json();
    const client = sb(c.env);
    const { shadow_price_id: _a, shadowProductId: _b, stripe_price_id: _c, force_stripe_resync: _d, ...safe } = body;
    const row = { ...safe, code, updated_at: new Date().toISOString() };
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_plan_content").upsert(row).select().maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      await audit(client, "plan.save", "plan", code, {});
      return c.json({ data, ok: true, warnings: priceWarnings(row) });
    }
    const list = await settingsCms.listPlans(client);
    const idx = list.findIndex((p) => p.code === code);
    if (idx >= 0) list[idx] = { ...list[idx], ...row };
    else list.push(row);
    await settingsCms.savePlans(client, list);
    await audit(client, "plan.save", "plan", code, { store: "site_settings" });
    return c.json({ data: row, ok: true, warnings: priceWarnings(row) });
  });

  app.get("/guides", async (c) => {
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_guides").select("*").order("sort_order");
      if (error) return c.json({ error: error.message, data: [] }, 200);
      return c.json({ data: data || [] });
    }
    return c.json({ data: await settingsCms.listGuides(client) });
  });

  app.post("/guides", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    const slug = String(body.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    if (!slug || !body.title) return c.json({ error: "slug and title required" }, 400);
    const row = {
      id: crypto.randomUUID(),
      ...body,
      slug,
      updated_at: new Date().toISOString(),
      published_at: body.status === "published" ? new Date().toISOString() : null,
    };
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_guides").insert(row).select().maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      await audit(client, "guide.create", "guide", data?.id, {});
      return c.json({ data, ok: true });
    }
    const list = await settingsCms.listGuides(client);
    list.unshift(row);
    await settingsCms.saveGuides(client, list);
    await audit(client, "guide.create", "guide", row.id, {});
    return c.json({ data: row, ok: true });
  });

  app.put("/guides/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client
        .from("cms_guides")
        .update({ ...body, id: undefined, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ data, ok: true });
    }
    const list = await settingsCms.listGuides(client);
    const idx = list.findIndex((g) => g.id === id);
    if (idx < 0) return c.json({ error: "not_found" }, 404);
    list[idx] = { ...list[idx], ...body, id, updated_at: new Date().toISOString() };
    await settingsCms.saveGuides(client, list);
    return c.json({ data: list[idx], ok: true });
  });

  app.delete("/guides/:id", async (c) => {
    const id = c.req.param("id");
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { error } = await client.from("cms_guides").delete().eq("id", id);
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ ok: true });
    }
    await settingsCms.saveGuides(client, (await settingsCms.listGuides(client)).filter((g) => g.id !== id));
    return c.json({ ok: true });
  });

  app.get("/navigation", async (c) => {
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_navigation").select("*").eq("id", "main").maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ data });
    }
    return c.json({ data: await settingsCms.getNavigation(client) });
  });

  app.put("/navigation", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    const row = { id: "main", items: body.items || [], footer: body.footer || {}, updated_at: new Date().toISOString() };
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_navigation").upsert(row).select().maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ data, ok: true });
    }
    await settingsCms.saveNavigation(client, row);
    return c.json({ data: row, ok: true });
  });

  app.get("/brand", async (c) => {
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_brand_settings").select("*").eq("id", "default").maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ data });
    }
    return c.json({ data: await settingsCms.getJson(client, settingsCms.KEYS.brand, { id: "default" }) });
  });

  app.put("/brand", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    const row = { id: "default", ...body, updated_at: new Date().toISOString() };
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_brand_settings").upsert(row).select().maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ data, ok: true });
    }
    await settingsCms.setJson(client, settingsCms.KEYS.brand, row);
    return c.json({ data: row, ok: true });
  });

  app.get("/media", async (c) => {
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_media_assets").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) return c.json({ error: error.message, data: [] }, 200);
      return c.json({ data: data || [] });
    }
    return c.json({ data: await settingsCms.getJson(client, settingsCms.KEYS.media, []) });
  });

  app.post("/media", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    if (!body.file_url || !body.file_name) return c.json({ error: "file_name and file_url required" }, 400);
    const row = {
      id: crypto.randomUUID(),
      file_name: body.file_name,
      file_url: body.file_url,
      file_type: body.file_type || null,
      alt_text: body.alt_text || "",
      folder: body.folder || "general",
      usage_refs: body.usage_refs || [],
      created_at: new Date().toISOString(),
    };
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_media_assets").insert(row).select().maybeSingle();
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ data, ok: true });
    }
    const list = await settingsCms.getJson<any[]>(client, settingsCms.KEYS.media, []);
    list.unshift(row);
    await settingsCms.setJson(client, settingsCms.KEYS.media, list);
    return c.json({ data: row, ok: true });
  });

  app.delete("/media/:id", async (c) => {
    const id = c.req.param("id");
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data: existing } = await client.from("cms_media_assets").select("*").eq("id", id).maybeSingle();
      if (!existing) return c.json({ error: "not_found" }, 404);
      const refs = Array.isArray(existing.usage_refs) ? existing.usage_refs : [];
      if (refs.length > 0 && c.req.query("force") !== "1") {
        return c.json({ error: "in_use", usage_refs: refs }, 409);
      }
      const { error } = await client.from("cms_media_assets").delete().eq("id", id);
      if (error) return c.json({ error: error.message }, 500);
      return c.json({ ok: true });
    }
    const list = await settingsCms.getJson<any[]>(client, settingsCms.KEYS.media, []);
    const existing = list.find((m) => m.id === id);
    if (!existing) return c.json({ error: "not_found" }, 404);
    if ((existing.usage_refs || []).length && c.req.query("force") !== "1") {
      return c.json({ error: "in_use", usage_refs: existing.usage_refs }, 409);
    }
    await settingsCms.setJson(client, settingsCms.KEYS.media, list.filter((m) => m.id !== id));
    return c.json({ ok: true });
  });

  app.get("/revisions", async (c) => {
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client
        .from("cms_content_revisions")
        .select("id,entity_type,entity_id,note,created_by,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) return c.json({ error: error.message, data: [] }, 200);
      return c.json({ data: data || [] });
    }
    return c.json({ data: await settingsCms.listRevisions(client) });
  });

  app.post("/revisions/:id/restore", async (c) => {
    return c.json({ error: "Restore from site_settings revisions: re-save snapshot manually via homepage editor for now" }, 501);
  });

  app.get("/audit", async (c) => {
    const client = sb(c.env);
    if (await tablesReady(client)) {
      const { data, error } = await client.from("cms_admin_audit_log").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) return c.json({ error: error.message, data: [] }, 200);
      return c.json({ data: data || [] });
    }
    return c.json({ data: await settingsCms.listAudit(client) });
  });

  app.post("/seed-from-products", async (c) => {
    const client = sb(c.env);
    const { data: products, error } = await client
      .from("real_products")
      .select("id,name,description,price,image_url,category,shadow_price_id");
    if (error) return c.json({ error: error.message }, 500);
    const devices: any[] = [];
    const plans: any[] = [];
    for (const p of products || []) {
      const id = String(p.id || "");
      const cat = String(p.category || "").toLowerCase();
      const isFirestickSku = /firestick|fire-stick/i.test(id);
      const isOnn = /onn|google/i.test(id) || /onn|google/i.test(String(p.name || ""));
      const isPlan = cat === "iptv" || cat === "subscription" || id.startsWith("iptv-");
      if (isPlan) {
        plans.push({
          code: id,
          real_product_id: id,
          public_title: p.name,
          short_description: p.description,
          public_display_price_cents: p.public_display_price_cents ?? p.sale_price ?? p.price,
          public_compare_at_cents: p.public_compare_at_cents ?? (p.sale_price ? p.price : null),
          sale_label: p.card_promo_label,
          primary_image_url: p.image_url,
          status: "published",
          payment_ref_display: p.shadow_price_id ? "Checkout linked (protected)" : "No checkout link",
          updated_at: new Date().toISOString(),
        });
      } else if (isOnn && !isFirestickSku) {
        devices.push({
          sku: id,
          real_product_id: id,
          public_title: p.name,
          brand: "ONN",
          condition: "new",
          category: "google-tv",
          short_description: p.description,
          public_display_price_cents: p.public_display_price_cents ?? p.sale_price ?? p.price,
          public_compare_at_cents: p.public_compare_at_cents ?? (p.sale_price ? p.price : null),
          sale_label: p.card_promo_label,
          primary_image_url: p.image_url,
          status: "published",
          featured: true,
          payment_ref_display: p.shadow_price_id ? "Checkout linked (protected)" : "No checkout link",
          updated_at: new Date().toISOString(),
        });
      }
    }
    if (await tablesReady(client)) {
      for (const d of devices) await client.from("cms_device_content").upsert(d);
      for (const p of plans) await client.from("cms_plan_content").upsert(p);
    } else {
      await settingsCms.saveDevices(client, devices);
      await settingsCms.savePlans(client, plans);
    }
    await audit(client, "seed-from-products", "system", "seed", { devices: devices.length, plans: plans.length });
    return c.json({ ok: true, devices: devices.length, plans: plans.length });
  });

  return app;
}
