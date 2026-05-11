/**
 * Merge Supabase `page_edits` (pageId=main) on top of the client homepage base (MainStore defaults).
 * `/api/cms/home` returns no base document (null); merges apply the same shape as before.
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

function mergeDeepTarget(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const [k, v] of Object.entries(source)) {
    if (v === undefined) continue;
    const cur = target[k];
    if (
      v !== null &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      cur !== null &&
      typeof cur === "object" &&
      !Array.isArray(cur)
    ) {
      mergeDeepTarget(cur as Record<string, unknown>, v as Record<string, unknown>);
    } else {
      target[k] = v as unknown;
    }
  }
}

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
    } else if (sec === "productCards" && el === "json") {
      try {
        out.productCards = JSON.parse(val);
      } catch {
        /* ignore */
      }
    } else if (sec === "advantages" && el === "json") {
      try {
        out.advantages = JSON.parse(val);
      } catch {
        /* ignore */
      }
    } else if (sec === "faq" && el === "itemsJson") {
      try {
        out.faq = (out.faq as Record<string, unknown>) || {};
        (out.faq as Record<string, unknown>).items = JSON.parse(val);
      } catch {
        /* ignore */
      }
    } else if (sec === "_config" && el === "homeJson" && e.elementType === "json") {
      try {
        const patch = JSON.parse(val) as Record<string, unknown>;
        mergeDeepTarget(out, patch);
      } catch {
        /* ignore */
      }
    }
  }

  return out as T;
}
