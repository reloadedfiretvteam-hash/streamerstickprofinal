/**
 * Cloaked / secure storefront (ShadowStore) — defaults + merge WordPress JSON + Supabase page_edits (pageId=shadow).
 * Checkout still uses real_product_id → Stripe; card labels and images are editorial only.
 */
import type { HomeCmsOverrideEdit } from "./merge-home-cms-overrides";

const SUPABASE_SHADOW = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/shadow-store";

export type ShadowDesignProductConfig = {
  name: string;
  shadowName: string;
  description: string;
  image: string;
  features: string[];
  popular?: boolean;
  period: string;
};

export type ShadowCmsState = {
  meta: { title: string };
  brand: { name: string };
  nav: {
    services: string;
    portfolio: string;
    pricing: string;
    testimonials: string;
    contact: string;
    getStarted: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stat1: string;
    stat2: string;
    stat3: string;
    backgroundImageUrl: string;
  };
  services: {
    title: string;
    subtitle: string;
    cards: Array<{ title: string; description: string; bullets: string[] }>;
  };
  portfolio: { title: string; subtitle: string };
  portfolioItems: Array<{ name: string; category: string; description: string }>;
  pricing: {
    title: string;
    subtitle: string;
    designHeading: string;
    seoHeading: string;
    seoSubtitle: string;
  };
  testimonials: { title: string; subtitle: string };
  testimonialCards: Array<{
    name: string;
    company: string;
    text: string;
    rating: number;
    initials: string;
  }>;
  ctaBand: { title: string; subtitle: string; primary: string; secondary: string };
  contact: { title: string; subtitle: string; emailLabel: string; phoneLabel: string; addressLabel: string; email: string; phone: string; address: string };
  footer: { tagline: string; copyright: string };
  designProductIds: string[];
  designProducts: Record<string, ShadowDesignProductConfig>;
};

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

export function deepMergeRecords(a: Record<string, unknown>, b: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...a };
  for (const [k, v] of Object.entries(b)) {
    if (v === undefined) continue;
    const cur = out[k];
    if (isPlainObject(v) && isPlainObject(cur)) {
      out[k] = deepMergeRecords(cur, v);
    } else if (Array.isArray(v)) {
      out[k] = v.slice();
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** Baseline copy + structure; merged with WordPress / optional JSON patch edits. */
export const SHADOW_CMS_DEFAULTS: ShadowCmsState = {
  meta: { title: "Digital Solutions Agency | Web Design & SEO Services" },
  brand: { name: "WebFlow Design" },
  nav: {
    services: "Services",
    portfolio: "Portfolio",
    pricing: "Pricing",
    testimonials: "Testimonials",
    contact: "Contact",
    getStarted: "Get Started",
  },
  hero: {
    badge: "Award-Winning Web Design Agency 2026",
    titleLine1: "Digital Experiences",
    titleLine2: "That Drive Growth",
    subtitle:
      "We build high-performance websites, SEO strategies, and digital campaigns that transform businesses. Over 500+ successful projects delivered worldwide.",
    ctaPrimary: "View Packages",
    ctaSecondary: "Our Portfolio",
    stat1: "500+ Clients",
    stat2: "Award Winning",
    stat3: "Worldwide Service",
    backgroundImageUrl: `${SUPABASE_SHADOW}/modern_abstract_digi_3506c264.jpg`,
  },
  services: {
    title: "Our Services",
    subtitle:
      "From stunning websites to comprehensive SEO strategies, we provide everything your business needs to succeed online.",
    cards: [
      {
        title: "Web Design",
        description: "Responsive, modern websites built with the latest technologies.",
        bullets: [
          "Custom UI/UX Design",
          "Mobile-First Responsive",
          "SEO Optimized Structure",
          "Fast Loading Performance",
        ],
      },
      {
        title: "SEO & Marketing",
        description: "Rank higher and drive more organic traffic to your site.",
        bullets: [
          "Keyword Research & Strategy",
          "On-Page Optimization",
          "Content Strategy",
          "Monthly Analytics Reports",
        ],
      },
      {
        title: "Custom Development",
        description: "Tailored solutions for complex business requirements.",
        bullets: [
          "Custom Web Applications",
          "API & Integration Development",
          "Database Architecture",
          "Cloud Infrastructure",
        ],
      },
    ],
  },
  portfolio: {
    title: "Our Portfolio",
    subtitle: "A selection of our recent work across various industries.",
  },
  portfolioItems: [
    { name: "E-Commerce Platform", category: "Web Design", description: "Full-featured online store with payment integration" },
    { name: "SaaS Dashboard", category: "Web Application", description: "Analytics dashboard for a tech startup" },
    { name: "Restaurant Website", category: "Web Design", description: "Modern restaurant site with online ordering" },
    { name: "Real Estate Portal", category: "Web Application", description: "Property listing platform with search" },
  ],
  pricing: {
    title: "Transparent Pricing",
    subtitle: "Choose the package that fits your business needs. No hidden fees.",
    designHeading: "Web Design Packages",
    seoHeading: "SEO & Marketing Packages",
    seoSubtitle:
      "Choose your package duration and tier. Higher tiers include more keywords, pages, and dedicated support.",
  },
  testimonials: {
    title: "What Our Clients Say",
    subtitle: "Don't just take our word for it - hear from our satisfied clients.",
  },
  testimonialCards: [
    {
      name: "Sarah Mitchell",
      company: "Mitchell & Co. Law Firm",
      text: "WebFlow Design transformed our outdated website into a modern, professional platform. Our client inquiries increased by 40% within the first month!",
      rating: 5,
      initials: "SM",
    },
    {
      name: "David Chen",
      company: "TechStart Solutions",
      text: "The team delivered exactly what we needed - a sleek, fast website that converts visitors into customers. Highly recommend their Professional package.",
      rating: 5,
      initials: "DC",
    },
    {
      name: "Emily Rodriguez",
      company: "Bloom Wellness Spa",
      text: "From design to launch, the process was seamless. Our new site perfectly captures our brand and our online bookings have doubled.",
      rating: 5,
      initials: "ER",
    },
  ],
  ctaBand: {
    title: "Ready to Transform Your Online Presence?",
    subtitle: "Get started today and see results within weeks.",
    primary: "View Pricing",
    secondary: "Contact Us",
  },
  contact: {
    title: "Get In Touch",
    subtitle: "Have a project in mind? We'd love to hear from you.",
    emailLabel: "Email Us",
    phoneLabel: "Call Us",
    addressLabel: "Visit Us",
    email: "hello@webflowdesign.com",
    phone: "+1 (555) 123-4567",
    address: "123 Design Street, NY 10001",
  },
  footer: {
    tagline: "Creating digital masterpieces for modern brands since 2018.",
    copyright: "© 2026 WebFlow Design Agency. All rights reserved.",
  },
  designProductIds: ["onn-google-hd", "onn-google-4k"],
  designProducts: {
    "onn-google-hd": {
      name: "Basic Web Design",
      shadowName: "Web Design Basic",
      description:
        "Perfect for personal blogs, portfolios, and small business landing pages. Includes responsive design and basic SEO setup.",
      image: `${SUPABASE_SHADOW}/professional_web_des_bf1b8ff3.jpg`,
      features: [
        "5 Custom Pages",
        "Mobile Responsive",
        "Contact Form Integration",
        "Basic SEO Setup",
        "1 Round of Revisions",
        "2 Week Delivery",
      ],
      period: "/project",
    },
    "onn-google-4k": {
      name: "Professional Web Design",
      shadowName: "Web Design Pro",
      description:
        "Ideal for growing businesses. Full-featured website with CMS integration, advanced SEO, and premium support.",
      image: `${SUPABASE_SHADOW}/professional_web_des_596ca65d.jpg`,
      features: [
        "10 Custom Pages",
        "CMS Integration",
        "Advanced SEO Package",
        "Social Media Integration",
        "Analytics Dashboard",
        "3 Rounds of Revisions",
        "Priority Support",
      ],
      popular: true,
      period: "/project",
    },
  },
};

function cloneDefaults(): ShadowCmsState {
  return JSON.parse(JSON.stringify(SHADOW_CMS_DEFAULTS)) as ShadowCmsState;
}

function setPath(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const k = path[i];
    const next = cur[k];
    if (!next || typeof next !== "object" || Array.isArray(next)) {
      cur[k] = {};
    }
    cur = cur[k] as Record<string, unknown>;
  }
  cur[path[path.length - 1]] = value as unknown;
}

/** WordPress JSON may be partial; normalize to ShadowCmsState. */
export function normalizeShadowWpPayload(raw: unknown): Partial<ShadowCmsState> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Partial<ShadowCmsState>;
}

/**
 * Merge WordPress shadow page JSON + Visual Editor rows (pageId=shadow).
 * Advanced: elementType json, sectionId _config, elementId payload — body is partial ShadowCmsState JSON.
 */
export function buildShadowCmsState(
  wpData: unknown,
  edits: HomeCmsOverrideEdit[],
): ShadowCmsState {
  let base = cloneDefaults();
  const wp = normalizeShadowWpPayload(wpData);
  if (wp) {
    base = deepMergeRecords(base as unknown as Record<string, unknown>, wp as unknown as Record<string, unknown>) as unknown as ShadowCmsState;
  }

  const active = edits.filter((e) => e.isActive !== false && String(e.pageId || "") === "shadow");

  for (const e of active) {
    if (e.elementType === "json" && e.sectionId === "_config" && e.elementId === "payload" && e.content?.trim()) {
      try {
        const patch = JSON.parse(e.content) as Record<string, unknown>;
        base = deepMergeRecords(base as unknown as Record<string, unknown>, patch) as unknown as ShadowCmsState;
      } catch {
        /* ignore invalid json */
      }
      continue;
    }

    const fromImage = e.elementType === "image" && e.imageUrl?.trim();
    const textVal = (fromImage ? e.imageUrl!.trim() : e.content?.trim()) ?? "";
    if (!textVal && e.elementType !== "json") continue;

    const sec = String(e.sectionId || "").trim();
    const el = String(e.elementId || "").trim();
    if (!el && e.elementType !== "json") continue;

    if (el.includes(".") && !sec.startsWith("design") && sec !== "designProducts") {
      const parts = el.split(".").filter(Boolean);
      if (parts.length >= 2) {
        setPath(base as unknown as Record<string, unknown>, parts, textVal);
        continue;
      }
    }

    if (sec === "meta" && el === "title") {
      base.meta.title = textVal;
      continue;
    }
    if (sec === "brand" && el === "name") {
      base.brand.name = textVal;
      continue;
    }
    if (sec === "nav") {
      if (el in base.nav) (base.nav as Record<string, string>)[el] = textVal;
      continue;
    }
    if (sec === "hero") {
      if (el in base.hero) (base.hero as Record<string, string>)[el] = textVal;
      continue;
    }
    if (sec === "services" && el === "title") {
      base.services.title = textVal;
      continue;
    }
    if (sec === "services" && el === "subtitle") {
      base.services.subtitle = textVal;
      continue;
    }
    if (sec === "portfolio" && el === "title") {
      base.portfolio.title = textVal;
      continue;
    }
    if (sec === "portfolio" && el === "subtitle") {
      base.portfolio.subtitle = textVal;
      continue;
    }
    if (sec === "pricing" && el in base.pricing) {
      (base.pricing as Record<string, string>)[el] = textVal;
      continue;
    }
    if (sec === "testimonials" && el === "title") {
      base.testimonials.title = textVal;
      continue;
    }
    if (sec === "testimonials" && el === "subtitle") {
      base.testimonials.subtitle = textVal;
      continue;
    }
    if (sec === "ctaBand" && el in base.ctaBand) {
      (base.ctaBand as Record<string, string>)[el] = textVal;
      continue;
    }
    if (sec === "contact" && el in base.contact) {
      (base.contact as Record<string, string>)[el] = textVal;
      continue;
    }
    if (sec === "footer" && el === "tagline") {
      base.footer.tagline = textVal;
      continue;
    }
    if (sec === "footer" && el === "copyright") {
      base.footer.copyright = textVal;
      continue;
    }
    if (sec === "design" && el.includes(".")) {
      const [pid, field] = el.split(".", 2);
      if (!pid || !field) continue;
      const template = base.designProducts[pid] || SHADOW_CMS_DEFAULTS.designProducts[pid];
      const row: ShadowDesignProductConfig = template
        ? { ...template, features: [...template.features] }
        : {
            name: "Package",
            shadowName: "Package",
            description: "",
            image: "",
            features: [],
            period: "/project",
          };
      base.designProducts[pid] = row;
      if (field === "features") {
        row.features = textVal.split("\n").map((s) => s.trim()).filter(Boolean);
      } else if (field === "image" || field === "imageUrl") {
        row.image = textVal;
      } else if (field === "popular") {
        row.popular = textVal === "true" || textVal === "1";
      } else if (field === "name" || field === "shadowName" || field === "description" || field === "period") {
        (row as unknown as Record<string, string>)[field] = textVal;
      }
      continue;
    }
  }

  return base;
}
