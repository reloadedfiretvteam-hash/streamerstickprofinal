/**
 * Owner CMS APIs — content only.
 * Public GETs for published content. Admin writes require JWT (mounted under /api/admin/cms).
 * Never creates/updates Stripe prices or touches checkout/orders/provisioning.
 */
import { Hono } from "hono";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Env } from "../index";
import { getSupabaseServiceKey, getSupabaseUrl } from "../helpers";

function sb(env: Env): SupabaseClient {
  return createClient(getSupabaseUrl(env), getSupabaseServiceKey(env), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function audit(
  client: SupabaseClient,
  actor: string | undefined,
  action: string,
  entity_type: string,
  entity_id: string,
  detail: Record<string, unknown> = {},
) {
  try {
    await client.from("cms_admin_audit_log").insert({
      actor: actor || "admin",
      action,
      entity_type,
      entity_id,
      detail,
    });
  } catch {
    /* table may not exist yet */
  }
}

async function revise(
  client: SupabaseClient,
  entity_type: string,
  entity_id: string,
  snapshot: unknown,
  created_by?: string,
  note?: string,
) {
  try {
    await client.from("cms_content_revisions").insert({
      entity_type,
      entity_id,
      snapshot,
      created_by: created_by || "admin",
      note: note || null,
    });
  } catch {
    /* optional until migration applied */
  }
}

/** Public CMS reads */
export function createOwnerCmsPublicRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get("/homepage", async (c) => {
    try {
      const client = sb(c.env);
      const { data, error } = await client.from("cms_homepage").select("*").eq("id", "default").maybeSingle();
      if (error) return c.json({ data: null, error: error.message, fallback: true }, 200);
      return c.json({ data, fallback: !data }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message || "unavailable", fallback: true }, 200);
    }
  });

  app.get("/banners", async (c) => {
    try {
      const client = sb(c.env);
      const now = new Date().toISOString();
      const { data, error } = await client
        .from("cms_banners")
        .select("*")
        .eq("is_active", true)
        .eq("status", "published")
        .order("priority", { ascending: false });
      if (error) return c.json({ data: [], error: error.message }, 200);
      const filtered = (data || []).filter((b: any) => {
        if (b.starts_at && b.starts_at > now) return false;
        if (b.ends_at && b.ends_at < now) return false;
        return true;
      });
      return c.json({ data: filtered }, 200);
    } catch (e: any) {
      return c.json({ data: [], error: e?.message }, 200);
    }
  });

  app.get("/devices", async (c) => {
    try {
      const client = sb(c.env);
      const { data, error } = await client
        .from("cms_device_content")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (error) return c.json({ data: [], error: error.message }, 200);
      return c.json({ data: data || [] }, 200);
    } catch (e: any) {
      return c.json({ data: [], error: e?.message }, 200);
    }
  });

  app.get("/devices/:sku", async (c) => {
    try {
      const client = sb(c.env);
      const sku = c.req.param("sku");
      const { data, error } = await client
        .from("cms_device_content")
        .select("*")
        .eq("sku", sku)
        .eq("status", "published")
        .maybeSingle();
      if (error) return c.json({ data: null, error: error.message }, 200);
      if (!data) return c.json({ data: null, error: "not_found" }, 404);
      return c.json({ data }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message }, 500);
    }
  });

  app.get("/plans", async (c) => {
    try {
      const client = sb(c.env);
      const { data, error } = await client
        .from("cms_plan_content")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (error) return c.json({ data: [], error: error.message }, 200);
      return c.json({ data: data || [] }, 200);
    } catch (e: any) {
      return c.json({ data: [], error: e?.message }, 200);
    }
  });

  app.get("/plans/:code", async (c) => {
    try {
      const client = sb(c.env);
      const code = c.req.param("code");
      const { data, error } = await client
        .from("cms_plan_content")
        .select("*")
        .eq("code", code)
        .eq("status", "published")
        .maybeSingle();
      if (error) return c.json({ data: null, error: error.message }, 200);
      if (!data) return c.json({ data: null, error: "not_found" }, 404);
      return c.json({ data }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message }, 500);
    }
  });

  app.get("/guides", async (c) => {
    try {
      const client = sb(c.env);
      const { data, error } = await client
        .from("cms_guides")
        .select("id,slug,title,summary,category,hero_image_url,image_alt,status,sort_order,published_at")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      if (error) return c.json({ data: [], error: error.message }, 200);
      return c.json({ data: data || [] }, 200);
    } catch (e: any) {
      return c.json({ data: [], error: e?.message }, 200);
    }
  });

  app.get("/guides/:slug", async (c) => {
    try {
      const client = sb(c.env);
      const slug = c.req.param("slug");
      const { data, error } = await client
        .from("cms_guides")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) return c.json({ data: null, error: error.message }, 200);
      if (!data) return c.json({ data: null, error: "not_found" }, 404);
      return c.json({ data }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message }, 500);
    }
  });

  app.get("/navigation", async (c) => {
    try {
      const client = sb(c.env);
      const { data, error } = await client.from("cms_navigation").select("*").eq("id", "main").maybeSingle();
      if (error) return c.json({ data: null, error: error.message }, 200);
      return c.json({ data }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message }, 200);
    }
  });

  app.get("/brand", async (c) => {
    try {
      const client = sb(c.env);
      const { data, error } = await client.from("cms_brand_settings").select("*").eq("id", "default").maybeSingle();
      if (error) return c.json({ data: null, error: error.message }, 200);
      return c.json({ data }, 200);
    } catch (e: any) {
      return c.json({ data: null, error: e?.message }, 200);
    }
  });

  /** Merchant Center–ready feed (published devices only). No secrets. */
  app.get("/merchant-feed.json", async (c) => {
    try {
      const client = sb(c.env);
      const base = new URL(c.req.url).origin;
      const { data, error } = await client
        .from("cms_device_content")
        .select("*")
        .eq("status", "published");
      if (error) return c.json({ items: [], error: error.message }, 200);
      const items = (data || [])
        .filter((d: any) => {
          const sku = String(d.sku || "").toLowerCase();
          const title = String(d.public_title || "").toLowerCase();
          if (sku.includes("firestick") || sku.includes("fire-stick")) return false;
          if (title.includes("fire stick") && !title.includes("compatible")) return false;
          return true;
        })
        .map((d: any) => {
          const priceCents = d.public_display_price_cents;
          const price =
            typeof priceCents === "number" && priceCents > 0
              ? `${(priceCents / 100).toFixed(2)} USD`
              : null;
          const availability =
            d.availability === "out_of_stock"
              ? "out_of_stock"
              : d.availability === "preorder"
                ? "preorder"
                : "in_stock";
          return {
            id: d.sku,
            title: d.public_title,
            description: d.short_description || d.full_description || d.public_title,
            link: `${base}/devices/${encodeURIComponent(d.sku)}`,
            image_link: d.primary_image_url || null,
            additional_image_link: Array.isArray(d.gallery)
              ? d.gallery.map((g: any) => g?.url || g).filter(Boolean)
              : [],
            price,
            availability,
            condition: d.condition || "new",
            brand: d.brand || "ONN",
            gtin: d.merchant_feed_extra?.gtin || undefined,
            mpn: d.merchant_feed_extra?.mpn || undefined,
            identifier_exists:
              d.merchant_feed_extra?.gtin || d.merchant_feed_extra?.mpn ? true : false,
          };
        });
      return c.json({ generated_at: new Date().toISOString(), items }, 200);
    } catch (e: any) {
      return c.json({ items: [], error: e?.message }, 200);
    }
  });

  return app;
}

/** Admin CMS writes — mount behind authMiddleware */
export function createOwnerCmsAdminRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get("/status", async (c) => {
    const client = sb(c.env);
    const tables = [
      "cms_homepage",
      "cms_banners",
      "cms_device_content",
      "cms_plan_content",
      "cms_guides",
      "cms_navigation",
      "cms_media_assets",
      "cms_content_revisions",
    ];
    const status: Record<string, string> = {};
    for (const t of tables) {
      const { error } = await client.from(t).select("*", { head: true, count: "exact" });
      status[t] = error ? `missing_or_error:${error.message}` : "ok";
    }
    return c.json({ status });
  });

  app.get("/homepage", async (c) => {
    const client = sb(c.env);
    const { data, error } = await client.from("cms_homepage").select("*").eq("id", "default").maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ data });
  });

  app.put("/homepage", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    const { data: existing } = await client.from("cms_homepage").select("*").eq("id", "default").maybeSingle();
    if (existing) await revise(client, "homepage", "default", existing, "admin", "pre-save");
    const patch = {
      id: "default",
      status: body.status || existing?.status || "draft",
      scheduled_at: body.scheduled_at ?? existing?.scheduled_at ?? null,
      published_at:
        body.status === "published" ? new Date().toISOString() : existing?.published_at ?? null,
      version: (existing?.version || 0) + 1,
      document: body.document ?? existing?.document ?? {},
      updated_by: "admin",
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await client.from("cms_homepage").upsert(patch).select().maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "homepage.save", "homepage", "default", {
      status: patch.status,
      version: patch.version,
    });
    return c.json({ data, ok: true });
  });

  app.get("/banners", async (c) => {
    const client = sb(c.env);
    const { data, error } = await client.from("cms_banners").select("*").order("priority", { ascending: false });
    if (error) return c.json({ error: error.message, data: [] }, 200);
    return c.json({ data: data || [] });
  });

  app.post("/banners", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    const row = {
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
    const { data, error } = await client.from("cms_banners").insert(row).select().maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "banner.create", "banner", data?.id, {});
    return c.json({ data, ok: true });
  });

  app.put("/banners/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const client = sb(c.env);
    const { data: existing } = await client.from("cms_banners").select("*").eq("id", id).maybeSingle();
    if (existing) await revise(client, "banner", id, existing, "admin");
    const { data, error } = await client
      .from("cms_banners")
      .update({ ...body, id: undefined, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "banner.update", "banner", id, {});
    return c.json({ data, ok: true });
  });

  app.delete("/banners/:id", async (c) => {
    const id = c.req.param("id");
    const client = sb(c.env);
    const { error } = await client.from("cms_banners").delete().eq("id", id);
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "banner.delete", "banner", id, {});
    return c.json({ ok: true });
  });

  app.get("/devices", async (c) => {
    const client = sb(c.env);
    const { data, error } = await client.from("cms_device_content").select("*").order("sort_order");
    if (error) return c.json({ error: error.message, data: [] }, 200);
    return c.json({ data: data || [] });
  });

  app.put("/devices/:sku", async (c) => {
    const sku = c.req.param("sku");
    const body = await c.req.json();
    const client = sb(c.env);
    const { data: existing } = await client.from("cms_device_content").select("*").eq("sku", sku).maybeSingle();
    if (existing) await revise(client, "device", sku, existing, "admin");
    // Strip any accidental Stripe fields
    const {
      shadow_price_id: _a,
      shadowProductId: _b,
      stripe_price_id: _c,
      force_stripe_resync: _d,
      ...safe
    } = body;
    const row = {
      ...safe,
      sku,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await client.from("cms_device_content").upsert(row).select().maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "device.save", "device", sku, {
      public_display_price_cents: row.public_display_price_cents,
    });
    return c.json({
      data,
      ok: true,
      warnings: buildPriceMismatchWarning(row),
    });
  });

  app.get("/plans", async (c) => {
    const client = sb(c.env);
    const { data, error } = await client.from("cms_plan_content").select("*").order("sort_order");
    if (error) return c.json({ error: error.message, data: [] }, 200);
    return c.json({ data: data || [] });
  });

  app.put("/plans/:code", async (c) => {
    const code = c.req.param("code");
    const body = await c.req.json();
    const client = sb(c.env);
    const { data: existing } = await client.from("cms_plan_content").select("*").eq("code", code).maybeSingle();
    if (existing) await revise(client, "plan", code, existing, "admin");
    const {
      shadow_price_id: _a,
      shadowProductId: _b,
      stripe_price_id: _c,
      force_stripe_resync: _d,
      ...safe
    } = body;
    const row = { ...safe, code, updated_at: new Date().toISOString() };
    const { data, error } = await client.from("cms_plan_content").upsert(row).select().maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "plan.save", "plan", code, {
      public_display_price_cents: row.public_display_price_cents,
    });
    return c.json({ data, ok: true, warnings: buildPriceMismatchWarning(row) });
  });

  app.get("/guides", async (c) => {
    const client = sb(c.env);
    const { data, error } = await client.from("cms_guides").select("*").order("sort_order");
    if (error) return c.json({ error: error.message, data: [] }, 200);
    return c.json({ data: data || [] });
  });

  app.post("/guides", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    const slug = String(body.slug || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-");
    if (!slug || !body.title) return c.json({ error: "slug and title required" }, 400);
    const row = {
      ...body,
      slug,
      updated_at: new Date().toISOString(),
      published_at: body.status === "published" ? new Date().toISOString() : null,
    };
    const { data, error } = await client.from("cms_guides").insert(row).select().maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "guide.create", "guide", data?.id, {});
    return c.json({ data, ok: true });
  });

  app.put("/guides/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    const client = sb(c.env);
    const { data: existing } = await client.from("cms_guides").select("*").eq("id", id).maybeSingle();
    if (existing) await revise(client, "guide", id, existing, "admin");
    const row = {
      ...body,
      id: undefined,
      updated_at: new Date().toISOString(),
      published_at:
        body.status === "published"
          ? existing?.published_at || new Date().toISOString()
          : existing?.published_at ?? null,
    };
    const { data, error } = await client.from("cms_guides").update(row).eq("id", id).select().maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "guide.update", "guide", id, {});
    return c.json({ data, ok: true });
  });

  app.delete("/guides/:id", async (c) => {
    const id = c.req.param("id");
    const client = sb(c.env);
    const { error } = await client.from("cms_guides").delete().eq("id", id);
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "guide.delete", "guide", id, {});
    return c.json({ ok: true });
  });

  app.get("/navigation", async (c) => {
    const client = sb(c.env);
    const { data, error } = await client.from("cms_navigation").select("*").eq("id", "main").maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ data });
  });

  app.put("/navigation", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    const { data: existing } = await client.from("cms_navigation").select("*").eq("id", "main").maybeSingle();
    if (existing) await revise(client, "navigation", "main", existing, "admin");
    const { data, error } = await client
      .from("cms_navigation")
      .upsert({
        id: "main",
        items: body.items ?? existing?.items ?? [],
        footer: body.footer ?? existing?.footer ?? {},
        updated_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "navigation.save", "navigation", "main", {});
    return c.json({ data, ok: true });
  });

  app.get("/brand", async (c) => {
    const client = sb(c.env);
    const { data, error } = await client.from("cms_brand_settings").select("*").eq("id", "default").maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ data });
  });

  app.put("/brand", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    const { data, error } = await client
      .from("cms_brand_settings")
      .upsert({ id: "default", ...body, updated_at: new Date().toISOString() })
      .select()
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "brand.save", "brand", "default", {});
    return c.json({ data, ok: true });
  });

  app.get("/media", async (c) => {
    const client = sb(c.env);
    const q = c.req.query("q") || "";
    let query = client.from("cms_media_assets").select("*").order("created_at", { ascending: false }).limit(200);
    if (q) query = query.ilike("file_name", `%${q}%`);
    const { data, error } = await query;
    if (error) return c.json({ error: error.message, data: [] }, 200);
    return c.json({ data: data || [] });
  });

  app.post("/media", async (c) => {
    const body = await c.req.json();
    const client = sb(c.env);
    if (!body.file_url || !body.file_name) return c.json({ error: "file_name and file_url required" }, 400);
    const { data, error } = await client
      .from("cms_media_assets")
      .insert({
        file_name: body.file_name,
        file_url: body.file_url,
        file_type: body.file_type || null,
        file_size: body.file_size || null,
        width: body.width || null,
        height: body.height || null,
        alt_text: body.alt_text || "",
        folder: body.folder || "general",
        usage_refs: body.usage_refs || [],
      })
      .select()
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "media.create", "media", data?.id, {});
    return c.json({ data, ok: true });
  });

  app.delete("/media/:id", async (c) => {
    const id = c.req.param("id");
    const client = sb(c.env);
    const { data: existing } = await client.from("cms_media_assets").select("*").eq("id", id).maybeSingle();
    if (!existing) return c.json({ error: "not_found" }, 404);
    const refs = Array.isArray(existing.usage_refs) ? existing.usage_refs : [];
    if (refs.length > 0 && c.req.query("force") !== "1") {
      return c.json(
        {
          error: "in_use",
          message: "Image is referenced by live content. Pass force=1 to delete anyway.",
          usage_refs: refs,
        },
        409,
      );
    }
    const { error } = await client.from("cms_media_assets").delete().eq("id", id);
    if (error) return c.json({ error: error.message }, 500);
    await audit(client, "admin", "media.delete", "media", id, { forced: c.req.query("force") === "1" });
    return c.json({ ok: true });
  });

  app.get("/revisions", async (c) => {
    const entity_type = c.req.query("entity_type");
    const entity_id = c.req.query("entity_id");
    const client = sb(c.env);
    let query = client
      .from("cms_content_revisions")
      .select("id,entity_type,entity_id,note,created_by,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (entity_type) query = query.eq("entity_type", entity_type);
    if (entity_id) query = query.eq("entity_id", entity_id);
    const { data, error } = await query;
    if (error) return c.json({ error: error.message, data: [] }, 200);
    return c.json({ data: data || [] });
  });

  app.post("/revisions/:id/restore", async (c) => {
    const id = c.req.param("id");
    const client = sb(c.env);
    const { data: rev, error } = await client.from("cms_content_revisions").select("*").eq("id", id).maybeSingle();
    if (error || !rev) return c.json({ error: error?.message || "not_found" }, 404);
    const table = revisionTable(rev.entity_type);
    if (!table) return c.json({ error: "unsupported_entity" }, 400);
    const snapshot = rev.snapshot;
    const { data, error: upErr } = await client.from(table).upsert(snapshot).select().maybeSingle();
    if (upErr) return c.json({ error: upErr.message }, 500);
    await audit(client, "admin", "revision.restore", rev.entity_type, rev.entity_id, { revision_id: id });
    return c.json({ data, ok: true });
  });

  app.get("/audit", async (c) => {
    const client = sb(c.env);
    const { data, error } = await client
      .from("cms_admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return c.json({ error: error.message, data: [] }, 200);
    return c.json({ data: data || [] });
  });

  /** Seed devices/plans from real_products without Stripe changes */
  app.post("/seed-from-products", async (c) => {
    const client = sb(c.env);
    const { data: products, error } = await client.from("real_products").select("*");
    if (error) return c.json({ error: error.message }, 500);
    let devices = 0;
    let plans = 0;
    for (const p of products || []) {
      const id = String(p.id || "");
      const cat = String(p.category || "").toLowerCase();
      const isFirestickSku = /firestick|fire-stick/i.test(id);
      const isOnn = /onn|google/i.test(id) || /onn|google/i.test(String(p.name || ""));
      const isPlan = cat === "iptv" || cat === "subscription" || id.startsWith("iptv-");
      if (isPlan) {
        const { error: e } = await client.from("cms_plan_content").upsert({
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
        if (!e) plans++;
      } else if (isOnn && !isFirestickSku) {
        const { error: e } = await client.from("cms_device_content").upsert({
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
        if (!e) devices++;
      }
    }
    await audit(client, "admin", "seed-from-products", "system", "seed", { devices, plans });
    return c.json({ ok: true, devices, plans });
  });

  return app;
}

function revisionTable(entity_type: string): string | null {
  switch (entity_type) {
    case "homepage":
      return "cms_homepage";
    case "banner":
      return "cms_banners";
    case "device":
      return "cms_device_content";
    case "plan":
      return "cms_plan_content";
    case "guide":
      return "cms_guides";
    case "navigation":
      return "cms_navigation";
    default:
      return null;
  }
}

function buildPriceMismatchWarning(row: any): string[] {
  const warnings: string[] = [];
  if (row.payment_ref_display && String(row.payment_ref_display).includes("Checkout linked")) {
    warnings.push(
      "Public display price is content-only. It does not change protected Stripe checkout amounts. Use a separate Payment Sync process (owner-approved) to change actual payment prices.",
    );
  }
  return warnings;
}
