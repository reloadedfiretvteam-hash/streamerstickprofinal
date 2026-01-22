/**
 * Entity-graph schema generator for StreamStickPro.com
 * Builds linked JSON-LD: Organization → WebSite → WebPage → Product/HowTo/Article.
 */

const SITE = "https://streamstickpro.com";
const ORG = "StreamStickPro";
const PRICE_VALID_UNTIL = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

export interface ProductInput {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  url?: string;
  availability?: string;
  sku?: string;
}

export interface HowToStep {
  name: string;
  text: string;
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG,
    url: `${SITE}/`,
    logo: `${SITE}/favicon.png`,
    sameAs: [] as string[],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@streamstickpro.com",
      availableLanguage: "English",
    },
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG,
    url: `${SITE}/`,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE}/blog?search={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema(p: ProductInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.image || `${SITE}/opengraph.jpg`,
    url: p.url || `${SITE}/#${p.id}`,
    sku: p.sku || p.id,
    brand: { "@type": "Brand", name: ORG },
    offers: {
      "@type": "Offer",
      url: p.url || `${SITE}/#${p.id}`,
      priceCurrency: "USD",
      price: p.price,
      availability: `https://schema.org/${p.availability || "InStock"}`,
      priceValidUntil: PRICE_VALID_UNTIL,
      seller: { "@type": "Organization", name: ORG },
    },
  };
}

export function howToSchema(opts: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  image?: string;
}) {
  const stepList = opts.steps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
  }));
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: stepList,
  };
  if (opts.totalTime) schema.totalTime = opts.totalTime;
  if (opts.image) schema.image = opts.image;
  return schema;
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function itemListSchema(opts: {
  name: string;
  description?: string;
  items: { name: string; url: string; image?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: opts.name,
    ...(opts.description && { description: opts.description }),
    itemListElement: opts.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Thing",
        name: item.name,
        url: item.url,
        ...(item.image && { image: item.image }),
      },
    })),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
