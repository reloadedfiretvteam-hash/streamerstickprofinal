/**
 * Merge Supabase `page_edits` (pageId=main) on top of WordPress `/api/cms/home` JSON.
 * Admin Visual Editor uses sectionId + elementId; dot paths in elementId also work (e.g. hero.title).
 */

export type HomeCmsOverrideEdit = {
  pageId: string;
  sectionId?: string | null;
  elementId?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  elementType?: string | null;
  isActive?: boolean | null;
};

function deepSet(obj: Record<string, unknown>, path: string[], value: string): void {
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    const next = cur[k];
    if (!next || typeof next !== "object" || Array.isArray(next)) {
      cur[k] = {};
    }
    cur = cur[k] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value;
}

export function applySupabasePageEditsToHomeCms<T extends Record<string, unknown>>(
  cms: T | null,
  edits: HomeCmsOverrideEdit[],
): T | null {
  const active = edits.filter((e) => e.isActive !== false && String(e.pageId || "") === "main");
  if (!active.length) return cms;

  const out = (cms ? (JSON.parse(JSON.stringify(cms)) as T) : ({} as T)) as Record<string, unknown>;

  for (const e of active) {
    const fromImage = e.elementType === "image" && e.imageUrl?.trim();
    const val = (fromImage ? e.imageUrl!.trim() : e.content?.trim()) || "";
    if (!val) continue;

    const sec = String(e.sectionId || "").trim();
    const el = String(e.elementId || "").trim();

    if (!sec && el === "trustBar") {
      out.trustBar = val;
      continue;
    }
    if (!sec && el === "disclaimer") {
      out.disclaimer = val;
      continue;
    }

    if (el.includes(".")) {
      const parts = el.split(".").filter(Boolean);
      if (parts.length >= 2) {
        deepSet(out, parts, val);
        continue;
      }
    }

    if (!el) continue;

    if (sec === "hero") {
      out.hero = (out.hero as Record<string, unknown>) || {};
      const h = out.hero as Record<string, unknown>;
      if (["title", "subtitle", "proofline", "backgroundImageUrl"].includes(el)) {
        h[el] = val;
      }
    } else if (sec === "meta") {
      out.meta = (out.meta as Record<string, unknown>) || {};
      const m = out.meta as Record<string, unknown>;
      if (["title", "description", "path", "keywords"].includes(el)) {
        m[el] = val;
      }
    } else if (sec === "trustBar" && el === "text") {
      out.trustBar = val;
    } else if (sec === "disclaimer" && el === "text") {
      out.disclaimer = val;
    } else if (sec === "support") {
      out.support = (out.support as Record<string, unknown>) || {};
      const s = out.support as Record<string, unknown>;
      if (["email", "availability", "whatsappUrl", "whatsappLabel"].includes(el)) {
        s[el] = val;
      }
    } else if (sec === "faq" && el === "title") {
      out.faq = (out.faq as Record<string, unknown>) || {};
      (out.faq as Record<string, unknown>).title = val;
    } else if (sec === "whyChoose" && el === "title") {
      out.whyChoose = (out.whyChoose as Record<string, unknown>) || {};
      (out.whyChoose as Record<string, unknown>).title = val;
    } else if (sec === "deviceSupport" && el === "title") {
      out.deviceSupport = (out.deviceSupport as Record<string, unknown>) || {};
      (out.deviceSupport as Record<string, unknown>).title = val;
    } else if (sec === "visualBenefits" && (el === "title" || el === "subtitle")) {
      out.visualBenefits = (out.visualBenefits as Record<string, unknown>) || {};
      (out.visualBenefits as Record<string, unknown>)[el] = val;
    }
  }

  return out as T;
}
