/** Tier 1 competitor crush pages - slug is URL segment after /vs- */
export const TIER_1_CRUSH_SLUGS = [
  "iptvstronger",
  "troypoint",
  "iptvproviders",
  "hypotv",
  "tvworldwide",
  "xtremehd",
  "iptvgreat",
  "shoroc",
  "iptvencoder",
  "iptvsmarters",
  "tivimate",
  "vaderstreams",
  "helix",
  "sportz",
  "beast",
  "nitro",
  "prime",
  "king",
  "eternal",
  "cosmos",
] as const;

export function competitorDisplayName(slug: string): string {
  const map: Record<string, string> = {
    iptvstronger: "IPTVStronger",
    troypoint: "TroyPoint",
    iptvproviders: "IPTV Providers",
    hypotv: "HypoTV",
    tvworldwide: "TV Worldwide",
    xtremehd: "XtremeHD",
    iptvgreat: "IPTVGreat",
    shoroc: "Shoroc",
    iptvencoder: "IPTV Encoder",
    iptvsmarters: "IPTV Smarters",
    tivimate: "TiviMate",
    vaderstreams: "Vader Streams",
    helix: "Helix",
    sportz: "Sportz",
    beast: "Beast",
    nitro: "Nitro",
    prime: "Prime",
    king: "King",
    eternal: "Eternal",
    cosmos: "Cosmos",
  };
  return map[slug.toLowerCase()] || slug.replace(/-/g, " ");
}

export function isTier1Crush(slug: string): boolean {
  return TIER_1_CRUSH_SLUGS.includes(slug.toLowerCase() as (typeof TIER_1_CRUSH_SLUGS)[number]);
}
