/**
 * Owner Content CMS panel — content Save paths never call Stripe.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type AuthFetch = (url: string, init?: RequestInit) => Promise<Response>;

const SECTIONS = [
  "dashboard",
  "homepage",
  "banners",
  "devices",
  "plans",
  "guides",
  "media",
  "navigation",
  "history",
] as const;

type Section = (typeof SECTIONS)[number];

function HomepageFields({
  homepageDoc,
  homepageStatus,
  setHomepageStatus,
  setHomepageDoc,
  busy,
  onSave,
  onUpload,
}: {
  homepageDoc: string;
  homepageStatus: string;
  setHomepageStatus: (v: string) => void;
  setHomepageDoc: (v: string) => void;
  busy: boolean;
  onSave: () => void;
  onUpload: (file: File, target: "hero" | "cloaked") => void;
}) {
  let parsed: any = {};
  let invalid = false;
  try {
    parsed = homepageDoc ? JSON.parse(homepageDoc) : {};
  } catch {
    invalid = true;
  }
  const hero = parsed?.hero || {};
  const tiles = Array.isArray(parsed?.pathTiles) ? parsed.pathTiles : [];
  const cloaked = parsed?.cloaked || {};
  const meta = parsed?.meta || {};
  const write = (next: Record<string, unknown>) => setHomepageDoc(JSON.stringify(next, null, 2));
  const setHero = (patch: Record<string, unknown>) => {
    write({ ...parsed, hero: { ...hero, ...patch } });
  };
  const setCta = (key: "primaryCta" | "secondaryCta" | "supportCta", field: "label" | "href", value: string) => {
    const current = hero[key] || {};
    setHero({ [key]: { ...current, [field]: value } });
  };
  const setTile = (index: number, patch: Record<string, unknown>) => {
    const nextTiles = tiles.map((t: any, i: number) => (i === index ? { ...t, ...patch } : t));
    write({ ...parsed, pathTiles: nextTiles });
  };
  const setCloaked = (patch: Record<string, unknown>) => write({ ...parsed, cloaked: { ...cloaked, ...patch } });
  const setMeta = (patch: Record<string, unknown>) => write({ ...parsed, meta: { ...meta, ...patch } });

  return (
    <div className="space-y-3 rounded-xl border border-slate-700 p-4">
      <p className="text-sm text-slate-300">
        These fields are the live homepage hero. Saving does not change checkout or Stripe.
      </p>
      <label className="block text-sm text-slate-300">Publish status</label>
      <select
        className="w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
        value={homepageStatus}
        onChange={(e) => setHomepageStatus(e.target.value)}
      >
        <option value="draft">draft</option>
        <option value="published">published</option>
        <option value="scheduled">scheduled</option>
      </select>
      {invalid ? (
        <p className="text-sm text-amber-300">Homepage document is not valid JSON. Fix the advanced box below before using the fields.</p>
      ) : (
        <div className="grid gap-2">
          <Input
            placeholder="Hero headline"
            value={hero.title || ""}
            onChange={(e) => setHero({ title: e.target.value })}
          />
          <Textarea
            placeholder="Hero supporting text"
            value={hero.subtitle || ""}
            onChange={(e) => setHero({ subtitle: e.target.value })}
          />
          <Input
            placeholder="Primary button label"
            value={hero.primaryCta?.label || ""}
            onChange={(e) => setCta("primaryCta", "label", e.target.value)}
          />
          <Input
            placeholder="Primary button link"
            value={hero.primaryCta?.href || ""}
            onChange={(e) => setCta("primaryCta", "href", e.target.value)}
          />
          <Input
            placeholder="Secondary button label"
            value={hero.secondaryCta?.label || ""}
            onChange={(e) => setCta("secondaryCta", "label", e.target.value)}
          />
          <Input
            placeholder="Secondary button link"
            value={hero.secondaryCta?.href || ""}
            onChange={(e) => setCta("secondaryCta", "href", e.target.value)}
          />
          <Input
            placeholder="Setup / support link label"
            value={hero.supportCta?.label || ""}
            onChange={(e) => setCta("supportCta", "label", e.target.value)}
          />
          <Input
            placeholder="Setup / support link"
            value={hero.supportCta?.href || ""}
            onChange={(e) => setCta("supportCta", "href", e.target.value)}
          />
          <Input
            placeholder="Hero proof line"
            value={hero.proofline || ""}
            onChange={(e) => setHero({ proofline: e.target.value })}
          />
          <Input
            placeholder="Homepage background image URL"
            value={hero.backgroundImageUrl || ""}
            onChange={(e) => setHero({ backgroundImageUrl: e.target.value })}
          />
          <label className="text-sm text-slate-300">
            Upload homepage background
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="mt-1 block text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file, "hero");
              }}
            />
          </label>
          <Input
            placeholder="Search title (about 50 to 60 characters)"
            value={meta.title || ""}
            onChange={(e) => setMeta({ title: e.target.value })}
          />
          <Textarea
            placeholder="Search description (about 50 to 160 characters)"
            value={meta.description || ""}
            onChange={(e) => setMeta({ description: e.target.value })}
          />
          <p className="pt-2 text-sm font-medium text-white">Three boxes under the hero</p>
          {tiles.map((tile: any, index: number) => (
            <div key={tile.id || index} className="grid gap-2 rounded-lg border border-slate-700 p-3">
              <Input
                placeholder="Box title"
                value={tile.title || ""}
                onChange={(e) => setTile(index, { title: e.target.value })}
              />
              <Textarea
                placeholder="Box description"
                value={tile.description || ""}
                onChange={(e) => setTile(index, { description: e.target.value })}
              />
              <Input
                placeholder="Button label"
                value={tile.ctaLabel || ""}
                onChange={(e) => setTile(index, { ctaLabel: e.target.value })}
              />
              <Input
                placeholder="Button link"
                value={tile.href || tile.ctaHref || ""}
                onChange={(e) => setTile(index, { href: e.target.value, ctaHref: e.target.value })}
              />
              <select
                className="w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
                value={tile.accent || ["gold", "cyan", "violet"][index] || "gold"}
                onChange={(e) => setTile(index, { accent: e.target.value })}
              >
                <option value="gold">Blue box</option>
                <option value="cyan">Teal box</option>
                <option value="violet">Light box</option>
                <option value="teal">Bright teal box</option>
              </select>
            </div>
          ))}
          <p className="pt-2 text-sm font-medium text-white">Cloaked page</p>
          <Input
            placeholder="Cloaked headline line 1"
            value={cloaked.titleLine1 || ""}
            onChange={(e) => setCloaked({ titleLine1: e.target.value })}
          />
          <Input
            placeholder="Cloaked headline line 2"
            value={cloaked.titleLine2 || ""}
            onChange={(e) => setCloaked({ titleLine2: e.target.value })}
          />
          <Textarea
            placeholder="Cloaked supporting text"
            value={cloaked.subtitle || ""}
            onChange={(e) => setCloaked({ subtitle: e.target.value })}
          />
          <Input
            placeholder="Cloaked background image URL"
            value={cloaked.backgroundImageUrl || ""}
            onChange={(e) => setCloaked({ backgroundImageUrl: e.target.value })}
          />
          <label className="text-sm text-slate-300">
            Upload cloaked background
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="mt-1 block text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file, "cloaked");
              }}
            />
          </label>
        </div>
      )}
      <details className="text-sm text-slate-400">
        <summary className="cursor-pointer">Advanced document</summary>
        <Textarea
          className="mt-2 min-h-[200px] font-mono text-xs"
          value={homepageDoc}
          onChange={(e) => setHomepageDoc(e.target.value)}
        />
      </details>
      <Button disabled={busy} onClick={onSave}>
        Save homepage
      </Button>
    </div>
  );
}

export function OwnerCmsPanel({ authFetch }: { authFetch: AuthFetch }) {
  const { toast } = useToast();
  const [section, setSection] = useState<Section>("dashboard");
  const [status, setStatus] = useState<Record<string, string>>({});
  const [homepageDoc, setHomepageDoc] = useState("");
  const [homepageStatus, setHomepageStatus] = useState("draft");
  const [banners, setBanners] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [navJson, setNavJson] = useState("");
  const [audit, setAudit] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any | null>(null);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [guideForm, setGuideForm] = useState({
    slug: "",
    title: "",
    summary: "",
    written_steps_text: "",
    youtube_url: "",
    status: "draft",
  });
  const [bannerForm, setBannerForm] = useState({
    campaign_name: "",
    headline: "",
    background_color: "#0f172a",
    text_color: "#ffffff",
    button_label: "",
    button_href: "",
    is_active: false,
    status: "draft",
  });

  const loadStatus = async () => {
    const res = await authFetch("/api/admin/cms/status");
    const json = await res.json();
    setStatus(json.status || {});
  };

  const loadHomepage = async () => {
    const res = await authFetch("/api/admin/cms/homepage");
    const json = await res.json();
    if (json.data) {
      setHomepageDoc(JSON.stringify(json.data.document || {}, null, 2));
      setHomepageStatus(json.data.status || "draft");
    }
  };

  const loadLists = async () => {
    const [b, d, p, g, m, n, a] = await Promise.all([
      authFetch("/api/admin/cms/banners").then((r) => r.json()),
      authFetch("/api/admin/cms/devices").then((r) => r.json()),
      authFetch("/api/admin/cms/plans").then((r) => r.json()),
      authFetch("/api/admin/cms/guides").then((r) => r.json()),
      authFetch("/api/admin/cms/media").then((r) => r.json()),
      authFetch("/api/admin/cms/navigation").then((r) => r.json()),
      authFetch("/api/admin/cms/audit").then((r) => r.json()),
    ]);
    setBanners(b.data || []);
    setDevices(d.data || []);
    setPlans(p.data || []);
    setGuides(g.data || []);
    setMedia(m.data || []);
    setNavJson(JSON.stringify(n.data?.items || [], null, 2));
    setAudit(a.data || []);
  };

  useEffect(() => {
    loadStatus().catch(() => undefined);
    loadHomepage().catch(() => undefined);
    loadLists().catch(() => undefined);
  }, []);

  const uploadHomepageImage = async (file: File, target: "hero" | "cloaked") => {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await authFetch("/api/admin/cms/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Upload failed");
      const parsed = homepageDoc ? JSON.parse(homepageDoc) : {};
      const next =
        target === "hero"
          ? { ...parsed, hero: { ...(parsed.hero || {}), backgroundImageUrl: json.url } }
          : { ...parsed, cloaked: { ...(parsed.cloaked || {}), backgroundImageUrl: json.url } };
      setHomepageDoc(JSON.stringify(next, null, 2));
      toast({ title: "Image uploaded", description: "Click Save homepage to publish it." });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const saveHomepage = async () => {
    setBusy(true);
    try {
      const document = JSON.parse(homepageDoc);
      const res = await authFetch("/api/admin/cms/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document, status: homepageStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      toast({ title: "Homepage saved", description: `Status: ${homepageStatus}` });
      await loadHomepage();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const seedFromProducts = async () => {
    setBusy(true);
    try {
      const res = await authFetch("/api/admin/cms/seed-from-products", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Seed failed");
      toast({
        title: "Seeded from products",
        description: `${json.devices} devices, ${json.plans} plans (no Stripe changes)`,
      });
      await loadLists();
    } catch (e: any) {
      toast({ title: "Seed failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const saveDevice = async () => {
    if (!editingDevice?.sku) return;
    setBusy(true);
    try {
      const res = await authFetch(`/api/admin/cms/devices/${encodeURIComponent(editingDevice.sku)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingDevice),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      const warn = (json.warnings || []).join(" ");
      toast({
        title: "Device saved (display only)",
        description: warn || "Public display fields updated. Stripe untouched.",
      });
      setEditingDevice(null);
      await loadLists();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const savePlan = async () => {
    if (!editingPlan?.code) return;
    setBusy(true);
    try {
      const res = await authFetch(`/api/admin/cms/plans/${encodeURIComponent(editingPlan.code)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPlan),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      toast({
        title: "Plan saved (display only)",
        description: (json.warnings || []).join(" ") || "Stripe untouched.",
      });
      setEditingPlan(null);
      await loadLists();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const createGuide = async () => {
    setBusy(true);
    try {
      const written_steps = guideForm.written_steps_text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((body, i) => ({ title: `Step ${i + 1}`, body }));
      const res = await authFetch("/api/admin/cms/guides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: guideForm.slug,
          title: guideForm.title,
          summary: guideForm.summary,
          youtube_url: guideForm.youtube_url || null,
          written_steps,
          status: guideForm.status,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Create failed");
      toast({ title: "Guide created" });
      setGuideForm({
        slug: "",
        title: "",
        summary: "",
        written_steps_text: "",
        youtube_url: "",
        status: "draft",
      });
      await loadLists();
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const createBanner = async () => {
    setBusy(true);
    try {
      const res = await authFetch("/api/admin/cms/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bannerForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Create failed");
      toast({ title: "Banner created (no Stripe)" });
      await loadLists();
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const saveNav = async () => {
    setBusy(true);
    try {
      const items = JSON.parse(navJson);
      const res = await authFetch("/api/admin/cms/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      toast({ title: "Navigation saved" });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Owner Content CMS</h2>
        <p className="mt-1 text-sm text-slate-400">
          Edit public website content. Display prices never change Stripe checkout. Payment sync is a separate
          protected process.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={section === s ? "default" : "outline"}
            onClick={() => setSection(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {section === "dashboard" && (
        <div className="space-y-4 rounded-xl border border-slate-700 p-4">
          <h3 className="font-medium text-white">CMS table status</h3>
          <ul className="space-y-1 text-sm text-slate-300">
            {Object.entries(status).map(([k, v]) => (
              <li key={k}>
                <code className="text-cyan-300">{k}</code>: {v}
              </li>
            ))}
          </ul>
          <Button disabled={busy} onClick={seedFromProducts}>
            Seed devices/plans from real_products (no Stripe)
          </Button>
          <Button variant="outline" disabled={busy} onClick={() => loadStatus()}>
            Refresh status
          </Button>
        </div>
      )}

      {section === "homepage" && (
        <HomepageFields
          homepageDoc={homepageDoc}
          homepageStatus={homepageStatus}
          setHomepageStatus={setHomepageStatus}
          setHomepageDoc={setHomepageDoc}
          busy={busy}
          onSave={saveHomepage}
          onUpload={uploadHomepageImage}
        />
      )}

      {section === "banners" && (
        <div className="space-y-4">
          <div className="grid gap-2 rounded-xl border border-slate-700 p-4 md:grid-cols-2">
            <Input
              placeholder="Campaign name"
              value={bannerForm.campaign_name}
              onChange={(e) => setBannerForm({ ...bannerForm, campaign_name: e.target.value })}
            />
            <Input
              placeholder="Headline"
              value={bannerForm.headline}
              onChange={(e) => setBannerForm({ ...bannerForm, headline: e.target.value })}
            />
            <Input
              placeholder="Button label"
              value={bannerForm.button_label}
              onChange={(e) => setBannerForm({ ...bannerForm, button_label: e.target.value })}
            />
            <Input
              placeholder="Button href"
              value={bannerForm.button_href}
              onChange={(e) => setBannerForm({ ...bannerForm, button_href: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={bannerForm.is_active}
                onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
              />
              Active
            </label>
            <Button disabled={busy} onClick={createBanner}>
              Create banner
            </Button>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {banners.map((b) => (
              <li key={b.id} className="rounded border border-slate-700 p-3">
                {b.campaign_name || "(unnamed)"} — {b.headline} [{b.status}/{b.is_active ? "on" : "off"}]
              </li>
            ))}
          </ul>
        </div>
      )}

      {section === "devices" && (
        <div className="space-y-4">
          <ul className="space-y-2">
            {devices.map((d) => (
              <li key={d.sku} className="flex items-center justify-between rounded border border-slate-700 p-3 text-sm">
                <span className="text-white">
                  {d.sku} — {d.public_title} ({d.status})
                </span>
                <Button size="sm" variant="outline" onClick={() => setEditingDevice({ ...d })}>
                  Edit
                </Button>
              </li>
            ))}
          </ul>
          {editingDevice && (
            <div className="space-y-2 rounded-xl border border-cyan-700 p-4">
              <p className="text-xs text-amber-300">
                Public display price (cents) — does not change Stripe. Protected ref:{" "}
                {editingDevice.payment_ref_display || "n/a"}
              </p>
              <Input
                value={editingDevice.public_title || ""}
                onChange={(e) => setEditingDevice({ ...editingDevice, public_title: e.target.value })}
                placeholder="Public title"
              />
              <Input
                type="number"
                value={editingDevice.public_display_price_cents ?? ""}
                onChange={(e) =>
                  setEditingDevice({
                    ...editingDevice,
                    public_display_price_cents: Number(e.target.value) || null,
                  })
                }
                placeholder="Public display price (cents)"
              />
              <Input
                value={editingDevice.condition || "new"}
                onChange={(e) => setEditingDevice({ ...editingDevice, condition: e.target.value })}
                placeholder="Condition"
              />
              <Textarea
                value={editingDevice.short_description || ""}
                onChange={(e) => setEditingDevice({ ...editingDevice, short_description: e.target.value })}
                placeholder="Short description"
              />
              <select
                className="w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
                value={editingDevice.status || "draft"}
                onChange={(e) => setEditingDevice({ ...editingDevice, status: e.target.value })}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
              <div className="flex gap-2">
                <Button disabled={busy} onClick={saveDevice}>
                  Save device
                </Button>
                <Button variant="outline" onClick={() => setEditingDevice(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {section === "plans" && (
        <div className="space-y-4">
          <ul className="space-y-2">
            {plans.map((p) => (
              <li key={p.code} className="flex items-center justify-between rounded border border-slate-700 p-3 text-sm">
                <span className="text-white">
                  {p.code} — {p.public_title} ({p.status})
                </span>
                <Button size="sm" variant="outline" onClick={() => setEditingPlan({ ...p })}>
                  Edit
                </Button>
              </li>
            ))}
          </ul>
          {editingPlan && (
            <div className="space-y-2 rounded-xl border border-cyan-700 p-4">
              <p className="text-xs text-amber-300">
                Public display price only. Protected payment ref: {editingPlan.payment_ref_display || "n/a"}
              </p>
              <Input
                value={editingPlan.public_title || ""}
                onChange={(e) => setEditingPlan({ ...editingPlan, public_title: e.target.value })}
              />
              <Input
                type="number"
                value={editingPlan.public_display_price_cents ?? ""}
                onChange={(e) =>
                  setEditingPlan({
                    ...editingPlan,
                    public_display_price_cents: Number(e.target.value) || null,
                  })
                }
                placeholder="Public display price (cents)"
              />
              <Textarea
                value={editingPlan.short_description || ""}
                onChange={(e) => setEditingPlan({ ...editingPlan, short_description: e.target.value })}
              />
              <select
                className="w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
                value={editingPlan.status || "draft"}
                onChange={(e) => setEditingPlan({ ...editingPlan, status: e.target.value })}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
              <div className="flex gap-2">
                <Button disabled={busy} onClick={savePlan}>
                  Save plan
                </Button>
                <Button variant="outline" onClick={() => setEditingPlan(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {section === "guides" && (
        <div className="space-y-4">
          <div className="grid gap-2 rounded-xl border border-slate-700 p-4">
            <Input
              placeholder="slug"
              value={guideForm.slug}
              onChange={(e) => setGuideForm({ ...guideForm, slug: e.target.value })}
            />
            <Input
              placeholder="title"
              value={guideForm.title}
              onChange={(e) => setGuideForm({ ...guideForm, title: e.target.value })}
            />
            <Textarea
              placeholder="summary"
              value={guideForm.summary}
              onChange={(e) => setGuideForm({ ...guideForm, summary: e.target.value })}
            />
            <Textarea
              placeholder="Written steps (one per line)"
              value={guideForm.written_steps_text}
              onChange={(e) => setGuideForm({ ...guideForm, written_steps_text: e.target.value })}
            />
            <Input
              placeholder="YouTube URL (optional)"
              value={guideForm.youtube_url}
              onChange={(e) => setGuideForm({ ...guideForm, youtube_url: e.target.value })}
            />
            <select
              className="rounded border border-slate-600 bg-slate-900 p-2 text-white"
              value={guideForm.status}
              onChange={(e) => setGuideForm({ ...guideForm, status: e.target.value })}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
            <Button disabled={busy} onClick={createGuide}>
              Create guide
            </Button>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {guides.map((g) => (
              <li key={g.id} className="rounded border border-slate-700 p-3">
                /guides/{g.slug} — {g.title} [{g.status}]
              </li>
            ))}
          </ul>
        </div>
      )}

      {section === "media" && (
        <div className="rounded-xl border border-slate-700 p-4 text-sm text-slate-300">
          <p className="mb-3">
            Media library rows ({media.length}). Upload via product/page image tools still uses Storage bucket{" "}
            <code>imiges</code>; register URLs here for usage tracking.
          </p>
          <ul className="space-y-2">
            {media.map((m) => (
              <li key={m.id}>
                {m.file_name} — {m.alt_text || "(no alt)"} — refs:{" "}
                {Array.isArray(m.usage_refs) ? m.usage_refs.length : 0}
              </li>
            ))}
          </ul>
        </div>
      )}

      {section === "navigation" && (
        <div className="space-y-3 rounded-xl border border-slate-700 p-4">
          <Textarea className="min-h-[240px] font-mono text-xs" value={navJson} onChange={(e) => setNavJson(e.target.value)} />
          <Button disabled={busy} onClick={saveNav}>
            Save navigation
          </Button>
        </div>
      )}

      {section === "history" && (
        <ul className="space-y-2 text-sm text-slate-300">
          {audit.map((a) => (
            <li key={a.id} className="rounded border border-slate-700 p-2">
              {a.created_at} — {a.action} — {a.entity_type}/{a.entity_id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
