/**
 * pSEO Data Models for StreamStickPro.com
 * Maps to site-map-spec, feeds templates and entity-graph schema.
 */

export interface Device {
  id: string;
  name: string;
  brand: string;
  slug: string;
  specs?: {
    resolution?: string;
    ram?: string;
    storage?: string;
    wifi?: string;
    supportedApps?: string[];
  };
  price: number;
  availability: "InStock" | "OutOfStock";
  recommendedPlanId?: string;
  setupDifficulty?: "easy" | "medium" | "advanced";
  images: string[];
  description: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  duration: string;
  durationLabel: string;
  price: number;
  channelsCount?: number;
  sportsCoverage?: boolean;
  vodLibrarySize?: string;
  trialAvailable?: boolean;
  bestFor?: string;
  refundPolicy?: string;
  deviceIds?: string[];
  description: string;
}

export interface Trial {
  id: string;
  length: string;
  deviceRequired?: string;
  limitations?: string[];
  conversionCta: string;
  slug: string;
}

export interface ChannelCategory {
  id: string;
  category: string;
  slug: string;
  regions?: string[];
  flagshipChannels?: string[];
  sportsLeagues?: string[];
  languages?: string[];
}

export interface Location {
  country?: string;
  city?: string;
  timezone?: string;
  legalCaveats?: string;
  latencyNotes?: string;
  popularSports?: string[];
}

/** Map real_products + static data to Device/Plan for pSEO */
export function mapProductToDeviceOrPlan(p: {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  category?: string | null;
}): Device | Plan | null {
  const name = (p.name || "").toLowerCase();
  const isDevice =
    name.includes("fire stick") ||
    name.includes("fire tv") ||
    name.includes("onn") ||
    p.category === "firestick";
  const slug = (p.id || p.name)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const base = {
    id: p.id,
    name: p.name,
    slug,
    price: p.price / 100,
    availability: "InStock" as const,
    description: p.description || "",
    images: p.imageUrl ? [p.imageUrl] : [],
  };

  if (isDevice) {
    return {
      ...base,
      brand: "StreamStickPro",
      setupDifficulty: "easy",
    } as Device;
  }

  const match = name.match(/(\d+)\s*(month|mo|yr|year)/i);
  const duration = match ? `${match[1]} ${match[2]}` : "1 month";
  const durationLabel = duration.replace(/\bmo\b/i, "month").replace(/\byr\b/i, "year");

  return {
    ...base,
    duration,
    durationLabel,
    trialAvailable: true,
    bestFor: "Live TV, sports, movies, premium channels",
  } as Plan;
}
