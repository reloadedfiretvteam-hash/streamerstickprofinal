/**
 * Owner Content CMS panel — content Save paths never call Stripe.
 */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type AuthFetch = (url: string, init?: RequestInit) => Promise<Response>;

function setDeep(root: Record<string, unknown>, path: string, value: unknown) {
  const parts = path.split(".");
  const next = JSON.parse(JSON.stringify(root || {}));
  let cur: any = next;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const asNum = Number(key);
    const isIndex = key !== "" && Number.isInteger(asNum);
    if (isIndex) {
      if (!Array.isArray(cur)) return next;
      if (!cur[asNum] || typeof cur[asNum] !== "object") cur[asNum] = {};
      cur = cur[asNum];
      continue;
    }
    const upcoming = parts[i + 1];
    const upcomingIndex = upcoming !== "" && Number.isInteger(Number(upcoming));
    if (cur[key] == null || typeof cur[key] !== "object") {
      cur[key] = upcomingIndex ? [] : {};
    }
    cur = cur[key];
  }
  cur[parts[parts.length - 1]] = value;
  return next;
}

const SECTIONS = [
  "dashboard",
  "homepage",
  "banners",
  "emails",
  "visitors",
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
  onUpload: (file: File, path: string) => void;
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
  const cloaked = {
    ...(parsed?.cloaked || {}),
    serviceCards: Array.isArray(parsed?.cloaked?.serviceCards)
      ? parsed.cloaked.serviceCards
      : [
          { title: "Web Design", description: "", imageUrl: "" },
          { title: "SEO & Marketing", description: "", imageUrl: "" },
          { title: "Custom Development", description: "", imageUrl: "" },
        ],
  };
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
  const cloakCards = cloaked.serviceCards;

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
                if (file) onUpload(file, "hero.backgroundImageUrl");
              }}
            />
          </label>
          <Input
            placeholder="Homepage hero video URL"
            value={hero.videoUrl || ""}
            onChange={(e) => setHero({ videoUrl: e.target.value })}
          />
          <label className="text-sm text-slate-300">
            Upload homepage video
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="mt-1 block text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file, "hero.videoUrl");
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
              <Input
                placeholder="Box image URL"
                value={tile.imageUrl || ""}
                onChange={(e) => setTile(index, { imageUrl: e.target.value })}
              />
              <label className="text-sm text-slate-300">
                Upload box image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="mt-1 block text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file, `pathTiles.${index}.imageUrl`);
                  }}
                />
              </label>
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
                if (file) onUpload(file, "cloaked.backgroundImageUrl");
              }}
            />
          </label>
          <Input
            placeholder="Cloaked video URL"
            value={cloaked.videoUrl || ""}
            onChange={(e) => setCloaked({ videoUrl: e.target.value })}
          />
          <label className="text-sm text-slate-300">
            Upload cloaked video
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="mt-1 block text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file, "cloaked.videoUrl");
              }}
            />
          </label>
          <Input
            placeholder="Cloaked badge"
            value={cloaked.badge || ""}
            onChange={(e) => setCloaked({ badge: e.target.value })}
          />
          <Input
            placeholder="Cloaked primary button"
            value={cloaked.ctaPrimary || ""}
            onChange={(e) => setCloaked({ ctaPrimary: e.target.value })}
          />
          <Input
            placeholder="Cloaked secondary button"
            value={cloaked.ctaSecondary || ""}
            onChange={(e) => setCloaked({ ctaSecondary: e.target.value })}
          />
          <p className="pt-2 text-sm font-medium text-white">Colors, FAQ, email offer, footer</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="text-sm text-slate-300">
              Primary color
              <input
                type="color"
                className="mt-1 h-10 w-full rounded border border-slate-600 bg-slate-900"
                value={parsed?.theme?.primaryColor || "#2563eb"}
                onChange={(e) => write({ ...parsed, theme: { ...(parsed.theme || {}), primaryColor: e.target.value } })}
              />
            </label>
            <label className="text-sm text-slate-300">
              Accent color
              <input
                type="color"
                className="mt-1 h-10 w-full rounded border border-slate-600 bg-slate-900"
                value={parsed?.theme?.accentColor || "#14b8a6"}
                onChange={(e) => write({ ...parsed, theme: { ...(parsed.theme || {}), accentColor: e.target.value } })}
              />
            </label>
            <label className="text-sm text-slate-300">
              Background color
              <input
                type="color"
                className="mt-1 h-10 w-full rounded border border-slate-600 bg-slate-900"
                value={parsed?.theme?.backgroundColor || "#0A0A0F"}
                onChange={(e) => write({ ...parsed, theme: { ...(parsed.theme || {}), backgroundColor: e.target.value } })}
              />
            </label>
          </div>
          <Input
            placeholder="Trust bar text"
            value={parsed?.trustBar || ""}
            onChange={(e) => write({ ...parsed, trustBar: e.target.value })}
          />
          <Input
            placeholder="Search / social share image URL"
            value={parsed?.ogImage || meta.ogImage || ""}
            onChange={(e) => write({ ...parsed, ogImage: e.target.value, meta: { ...meta, ogImage: e.target.value } })}
          />
          <label className="text-sm text-slate-300">
            Upload social share image
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="mt-1 block text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file, "ogImage");
              }}
            />
          </label>
          <Input
            placeholder="FAQ section title"
            value={parsed?.faq?.title || ""}
            onChange={(e) => write({ ...parsed, faq: { ...(parsed.faq || {}), title: e.target.value, items: parsed?.faq?.items || [] } })}
          />
          {(Array.isArray(parsed?.faq?.items) && parsed.faq.items.length
            ? parsed.faq.items
            : [
                { question: "", answer: "" },
                { question: "", answer: "" },
                { question: "", answer: "" },
              ]
          ).map((item: any, index: number) => (
            <div key={`faq-${index}`} className="grid gap-2 rounded-lg border border-slate-700 p-3">
              <Input
                placeholder={`FAQ question ${index + 1}`}
                value={item.question || ""}
                onChange={(e) => {
                  const items = [...(parsed?.faq?.items || [{}, {}, {}])];
                  items[index] = { ...items[index], question: e.target.value };
                  write({ ...parsed, faq: { ...(parsed.faq || {}), items } });
                }}
              />
              <Textarea
                placeholder="Answer"
                value={item.answer || ""}
                onChange={(e) => {
                  const items = [...(parsed?.faq?.items || [{}, {}, {}])];
                  items[index] = { ...items[index], answer: e.target.value };
                  write({ ...parsed, faq: { ...(parsed.faq || {}), items } });
                }}
              />
            </div>
          ))}
          <Textarea
            placeholder="Footer tagline"
            value={parsed?.footer?.tagline || ""}
            onChange={(e) => write({ ...parsed, footer: { ...(parsed.footer || {}), tagline: e.target.value } })}
          />
          <Input
            placeholder="Support email shown on the site"
            value={parsed?.footer?.email || parsed?.support?.email || ""}
            onChange={(e) =>
              write({
                ...parsed,
                footer: { ...(parsed.footer || {}), email: e.target.value },
                support: { ...(parsed.support || {}), email: e.target.value },
              })
            }
          />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={Boolean(parsed?.emailPromo?.enabled)}
              onChange={(e) => write({ ...parsed, emailPromo: { ...(parsed.emailPromo || {}), enabled: e.target.checked } })}
            />
            Show email promo popup
          </label>
          <Input
            placeholder="Email popup headline"
            value={parsed?.emailPromo?.headline || ""}
            onChange={(e) => write({ ...parsed, emailPromo: { ...(parsed.emailPromo || {}), headline: e.target.value } })}
          />
          <Input
            placeholder="Email popup supporting text"
            value={parsed?.emailPromo?.subheadline || ""}
            onChange={(e) => write({ ...parsed, emailPromo: { ...(parsed.emailPromo || {}), subheadline: e.target.value } })}
          />
          <Input
            placeholder="Email popup coupon code"
            value={parsed?.emailPromo?.coupon || ""}
            onChange={(e) => write({ ...parsed, emailPromo: { ...(parsed.emailPromo || {}), coupon: e.target.value } })}
          />
          <p className="pt-2 text-sm font-medium text-white">How it works steps</p>
          {(Array.isArray(parsed?.howItWorks?.steps) ? parsed.howItWorks.steps : [{}, {}, {}, {}]).slice(0, 4).map((step: any, index: number) => (
            <div key={`how-${index}`} className="grid gap-2 rounded-lg border border-slate-700 p-3">
              <Input
                placeholder={`Step ${index + 1} title`}
                value={step.title || ""}
                onChange={(e) => {
                  const steps = [...(parsed?.howItWorks?.steps || [{}, {}, {}, {}])];
                  steps[index] = { ...steps[index], step: String(index + 1), title: e.target.value };
                  write({ ...parsed, howItWorks: { ...(parsed.howItWorks || {}), steps } });
                }}
              />
              <Textarea
                placeholder="Step description"
                value={step.description || ""}
                onChange={(e) => {
                  const steps = [...(parsed?.howItWorks?.steps || [{}, {}, {}, {}])];
                  steps[index] = { ...steps[index], step: String(index + 1), description: e.target.value };
                  write({ ...parsed, howItWorks: { ...(parsed.howItWorks || {}), steps } });
                }}
              />
            </div>
          ))}
          <p className="pt-2 text-sm font-medium text-white">Cloaked service boxes</p>
          {cloakCards.map((card: any, index: number) => (
            <div key={`cloak-card-${index}`} className="grid gap-2 rounded-lg border border-slate-700 p-3">
              <Input
                placeholder="Service title"
                value={card.title || ""}
                onChange={(e) => {
                  const next = cloakCards.map((c: any, i: number) =>
                    i === index ? { ...c, title: e.target.value } : c,
                  );
                  setCloaked({ serviceCards: next });
                }}
              />
              <Textarea
                placeholder="Service description"
                value={card.description || ""}
                onChange={(e) => {
                  const next = cloakCards.map((c: any, i: number) =>
                    i === index ? { ...c, description: e.target.value } : c,
                  );
                  setCloaked({ serviceCards: next });
                }}
              />
              <Input
                placeholder="Service image URL"
                value={card.imageUrl || ""}
                onChange={(e) => {
                  const next = cloakCards.map((c: any, i: number) =>
                    i === index ? { ...c, imageUrl: e.target.value } : c,
                  );
                  setCloaked({ serviceCards: next });
                }}
              />
              <label className="text-sm text-slate-300">
                Upload service image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="mt-1 block text-sm"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file, `cloaked.serviceCards.${index}.imageUrl`);
                  }}
                />
              </label>
            </div>
          ))}
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
    subheadline: "",
    background_color: "#0f172a",
    text_color: "#ffffff",
    image_url: "",
    button_label: "",
    button_href: "",
    coupon_code: "",
    starts_at: "",
    ends_at: "",
    show_real: true,
    show_cloak: true,
    is_active: true,
    status: "published",
  });
  const [revisions, setRevisions] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [visitorStats, setVisitorStats] = useState<any>(null);
  const [liveByLocation, setLiveByLocation] = useState<any[]>([]);

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
    const [b, d, p, g, m, n, a, r, s] = await Promise.all([
      authFetch("/api/admin/cms/banners").then((res) => res.json()),
      authFetch("/api/admin/cms/devices").then((res) => res.json()),
      authFetch("/api/admin/cms/plans").then((res) => res.json()),
      authFetch("/api/admin/cms/guides").then((res) => res.json()),
      authFetch("/api/admin/cms/media").then((res) => res.json()),
      authFetch("/api/admin/cms/navigation").then((res) => res.json()),
      authFetch("/api/admin/cms/audit").then((res) => res.json()),
      authFetch("/api/admin/cms/revisions").then((res) => res.json()),
      authFetch("/api/admin/cms/subscribers").then((res) => res.json()),
    ]);
    setBanners(b.data || []);
    setDevices(d.data || []);
    setPlans(p.data || []);
    setGuides(g.data || []);
    setMedia(m.data || []);
    setNavJson(JSON.stringify(n.data?.items || [], null, 2));
    setAudit(a.data || []);
    setRevisions(r.data || []);
    setSubscribers(s.data || []);
  };

  const loadVisitors = async () => {
    const [statsRes, liveRes] = await Promise.all([
      authFetch("/api/admin/visitors/stats"),
      authFetch("/api/admin/visitors/live"),
    ]);
    const statsJson = await statsRes.json().catch(() => ({}));
    const liveJson = await liveRes.json().catch(() => ({}));
    setVisitorStats(statsJson.data || null);
    setLiveByLocation(Array.isArray(liveJson.data) ? liveJson.data : []);
  };

  useEffect(() => {
    loadStatus().catch(() => undefined);
    loadHomepage().catch(() => undefined);
    loadLists().catch(() => undefined);
    loadVisitors().catch(() => undefined);
  }, []);

  const uploadHomepageImage = async (file: File, path: string) => {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await authFetch("/api/admin/cms/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Upload failed");
      if (path === "banner.image_url") {
        setBannerForm((current) => ({ ...current, image_url: json.url }));
        toast({ title: "Banner image uploaded", description: "Click Create banner to publish it." });
        return;
      }
      if (path === "media.library") {
        toast({ title: json.kind === "video" ? "Video uploaded" : "Image uploaded", description: json.url });
        await loadLists();
        return;
      }
      if (path === "ogImage") {
        const parsed = homepageDoc ? JSON.parse(homepageDoc) : {};
        const next = setDeep(parsed, "ogImage", json.url) as any;
        next.meta = { ...(next.meta || {}), ogImage: json.url };
        setHomepageDoc(JSON.stringify(next, null, 2));
        toast({ title: "Image uploaded", description: "Click Save homepage to publish it." });
        return;
      }
      const parsed = homepageDoc ? JSON.parse(homepageDoc) : {};
      setHomepageDoc(JSON.stringify(setDeep(parsed, path, json.url), null, 2));
      toast({ title: json.kind === "video" ? "Video uploaded" : "Image uploaded", description: "Click Save homepage to publish it." });
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
      const target_pages = [
        ...(bannerForm.show_real ? ["real"] : []),
        ...(bannerForm.show_cloak ? ["cloak"] : []),
      ];
      const res = await authFetch("/api/admin/cms/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: bannerForm.campaign_name,
          headline: bannerForm.headline,
          subheadline: bannerForm.subheadline,
          background_color: bannerForm.background_color,
          text_color: bannerForm.text_color,
          image_url: bannerForm.image_url || null,
          button_label: bannerForm.button_label,
          button_href: bannerForm.button_href,
          coupon_code: bannerForm.coupon_code || null,
          starts_at: bannerForm.starts_at ? new Date(bannerForm.starts_at).toISOString() : null,
          ends_at: bannerForm.ends_at ? new Date(bannerForm.ends_at).toISOString() : null,
          target_pages: target_pages.length ? target_pages : ["*"],
          is_active: bannerForm.is_active,
          status: bannerForm.is_active ? "published" : "draft",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Create failed");
      toast({ title: "Banner published", description: "It now shows on the pages you checked." });
      await loadLists();
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const toggleBanner = async (banner: any, on: boolean) => {
    setBusy(true);
    try {
      const res = await authFetch(`/api/admin/cms/banners/${encodeURIComponent(banner.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: on, status: on ? "published" : "draft" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      await loadLists();
    } catch (e: any) {
      toast({ title: "Banner update failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const restoreRevision = async (id: string) => {
    setBusy(true);
    try {
      const res = await authFetch(`/api/admin/cms/revisions/${encodeURIComponent(id)}/restore`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Restore failed");
      toast({ title: "Homepage restored", description: "Refresh the live homepage to see the previous version." });
      await loadHomepage();
      await loadLists();
    } catch (e: any) {
      toast({ title: "Restore failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const sendPromoEmail = async () => {
    setBusy(true);
    try {
      const res = await authFetch("/api/admin/cms/subscribers/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: emailSubject, message: emailMessage }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Send failed");
      toast({ title: "Promo email sent", description: `${json.sent} delivered${json.failed ? `, ${json.failed} failed` : ""}` });
    } catch (e: any) {
      toast({ title: "Send failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const deleteBanner = async (id: string) => {
    setBusy(true);
    try {
      const res = await authFetch(`/api/admin/cms/banners/${encodeURIComponent(id)}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
      await loadLists();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
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
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-400">Online now</p>
              <p className="text-2xl font-semibold text-white">{visitorStats?.onlineNow ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-400">Visitors today</p>
              <p className="text-2xl font-semibold text-white">{visitorStats?.todayVisitors ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-400">Email subscribers</p>
              <p className="text-2xl font-semibold text-white">{subscribers.length}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-white">
              Open real homepage
            </a>
            <a href="https://secure.streamstickpro.com" target="_blank" rel="noreferrer" className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-white">
              Open cloaked page
            </a>
          </div>
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
          <p className="text-sm text-slate-300">
            Sale and promo banners show instantly on the real homepage and/or the cloaked page. This is separate from Stripe sale prices.
          </p>
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
              placeholder="Supporting text"
              value={bannerForm.subheadline}
              onChange={(e) => setBannerForm({ ...bannerForm, subheadline: e.target.value })}
            />
            <Input
              placeholder="Button label"
              value={bannerForm.button_label}
              onChange={(e) => setBannerForm({ ...bannerForm, button_label: e.target.value })}
            />
            <Input
              placeholder="Button link"
              value={bannerForm.button_href}
              onChange={(e) => setBannerForm({ ...bannerForm, button_href: e.target.value })}
            />
            <Input
              placeholder="Banner image URL"
              value={bannerForm.image_url}
              onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
            />
            <label className="text-sm text-slate-300">
              Upload banner image
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="mt-1 block text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadHomepageImage(file, "banner.image_url");
                }}
              />
            </label>
            <Input
              placeholder="Background color"
              value={bannerForm.background_color}
              onChange={(e) => setBannerForm({ ...bannerForm, background_color: e.target.value })}
            />
            <Input
              placeholder="Text color"
              value={bannerForm.text_color}
              onChange={(e) => setBannerForm({ ...bannerForm, text_color: e.target.value })}
            />
            <Input
              placeholder="Sale coupon code"
              value={bannerForm.coupon_code}
              onChange={(e) => setBannerForm({ ...bannerForm, coupon_code: e.target.value })}
            />
            <label className="text-sm text-slate-300">
              Starts
              <input
                type="datetime-local"
                className="mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
                value={bannerForm.starts_at}
                onChange={(e) => setBannerForm({ ...bannerForm, starts_at: e.target.value })}
              />
            </label>
            <label className="text-sm text-slate-300">
              Ends
              <input
                type="datetime-local"
                className="mt-1 w-full rounded border border-slate-600 bg-slate-900 p-2 text-white"
                value={bannerForm.ends_at}
                onChange={(e) => setBannerForm({ ...bannerForm, ends_at: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={bannerForm.show_real}
                onChange={(e) => setBannerForm({ ...bannerForm, show_real: e.target.checked })}
              />
              Show on real homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={bannerForm.show_cloak}
                onChange={(e) => setBannerForm({ ...bannerForm, show_cloak: e.target.checked })}
              />
              Show on cloaked page
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={bannerForm.is_active}
                onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
              />
              Publish now
            </label>
            <Button disabled={busy} onClick={createBanner}>
              Create banner
            </Button>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {banners.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 rounded border border-slate-700 p-3">
                <span>
                  {b.campaign_name || "(unnamed)"} — {b.headline} [{b.status}/{b.is_active ? "on" : "off"}]
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => toggleBanner(b, !b.is_active)}>
                    {b.is_active ? "Turn off" : "Turn on"}
                  </Button>
                  <Button size="sm" variant="outline" disabled={busy} onClick={() => deleteBanner(b.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section === "emails" && (
        <div className="space-y-4 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-300">
            Emails collected from the homepage popup. Sending uses the same store email provider as order mail.
          </p>
          <Input placeholder="Promo subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
          <Textarea placeholder="Promo message" value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} />
          <Button disabled={busy} onClick={sendPromoEmail}>
            Send to subscribers
          </Button>
          <ul className="space-y-2 text-sm text-slate-300">
            {subscribers.length ? (
              subscribers.map((row) => (
                <li key={row.id || row.email} className="rounded border border-slate-700 p-2">
                  {row.email} {row.source ? `· ${row.source}` : ""}
                </li>
              ))
            ) : (
              <li>No subscribers yet.</li>
            )}
          </ul>
        </div>
      )}

      {section === "visitors" && (
        <div className="space-y-4 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-white">Live visitors</h3>
            <Button size="sm" variant="outline" onClick={() => loadVisitors()}>
              Refresh
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Online now", visitorStats?.onlineNow],
              ["Today", visitorStats?.todayVisitors],
              ["This week", visitorStats?.weekVisitors],
              ["This month", visitorStats?.monthVisitors],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-slate-700 p-3">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-2xl font-semibold text-white">{value ?? "—"}</p>
              </div>
            ))}
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {liveByLocation.length ? (
              liveByLocation.slice(0, 20).map((row, index) => (
                <li key={`${row.city}-${row.state}-${index}`}>
                  {row.city || "Unknown city"}, {row.state || row.region || "Unknown"} ·{" "}
                  {row.today_visitors || row.unique_ips || row.count || 1}
                </li>
              ))
            ) : (
              <li>No live locations yet. Open the homepage to create a visit.</li>
            )}
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
            Upload images or videos into the <code>imiges</code> bucket. Uploads are saved here so you can copy the public URL.
          </p>
          <label className="mb-4 block">
            Upload media
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
              className="mt-1 block text-sm"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadHomepageImage(file, "media.library");
              }}
            />
          </label>
          <ul className="space-y-2">
            {media.map((m) => (
              <li key={m.id} className="break-all rounded border border-slate-700 p-2">
                {m.file_name} — {m.file_url || m.url || ""}
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
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-700 p-4">
            <h3 className="mb-3 font-medium text-white">Restore a previous homepage</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {revisions.length ? (
                revisions.map((row) => (
                  <li key={row.id} className="flex items-center justify-between gap-3 rounded border border-slate-700 p-2">
                    <span>
                      {row.created_at} — {row.entity_type} {row.note ? `· ${row.note}` : ""}
                    </span>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => restoreRevision(row.id)}>
                      Restore
                    </Button>
                  </li>
                ))
              ) : (
                <li>No snapshots yet. Save the homepage once to create history.</li>
              )}
            </ul>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {audit.map((a) => (
              <li key={a.id} className="rounded border border-slate-700 p-2">
                {a.created_at} — {a.action} — {a.entity_type}/{a.entity_id}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
