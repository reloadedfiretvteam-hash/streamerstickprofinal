export type SearchIntent = "transactional" | "commercial" | "informational";

export interface SeoPillarNode {
  path: string;
  title: string;
  primaryKeyword: string;
  supportKeywords: string[];
  intent: SearchIntent;
  linksTo: string[];
}

const NODES: SeoPillarNode[] = [
  {
    path: "/iptv",
    title: "Reloaded Fire TV Services Guide",
    primaryKeyword: "best reloaded fire tv service",
    supportKeywords: [
      "reloaded fire tv subscription",
      "cheap reloaded fire tv subscription",
      "live tv streaming",
      "reloaded fire tv plans",
      "cord cutting guide",
      "reloaded fire tv channels",
    ],
    intent: "commercial",
    linksTo: ["/devices", "/bundles", "/setup", "/iptv-firestick", "/iptv-media-players", "/pricing", "/36hr-trial", "/blog", "/shop"],
  },
  {
    path: "/iptv-firestick",
    title: "Reloaded Fire TV for Fire Stick",
    primaryKeyword: "reloaded fire tv fire stick",
    supportKeywords: [
      "best reloaded fire tv for firestick",
      "fire stick reloaded fire tv setup",
      "firestick reloaded fire tv apps",
      "tivimate firestick",
      "iptv smarters firestick",
    ],
    intent: "commercial",
    linksTo: ["/devices", "/best-iptv-firestick", "/jailbroken-fire-sticks", "/iptv", "/36hr-trial", "/shop"],
  },
  {
    path: "/jailbroken-fire-sticks",
    title: "Jailbroken Fire Stick Guide",
    primaryKeyword: "jailbroken fire stick",
    supportKeywords: [
      "fire tv jailbreak guide",
      "firestick setup help",
      "fire stick options",
      "fire stick with reloaded fire tv",
      "streaming device guide",
    ],
    intent: "commercial",
    linksTo: ["/devices", "/iptv-firestick", "/onn-google-tv", "/iptv", "/shop"],
  },
  {
    path: "/onn-google-tv",
    title: "ONN Google TV Setup",
    primaryKeyword: "onn google tv reloaded fire tv",
    supportKeywords: [
      "onn 4k setup",
      "google tv reloaded fire tv apps",
      "onn streaming setup",
      "reloaded fire tv on onn device",
      "onn tv guide",
    ],
    intent: "commercial",
    linksTo: ["/iptv-media-players", "/iptv", "/iptv-firestick", "/36hr-trial", "/shop"],
  },
  {
    path: "/iptv-media-players",
    title: "Reloaded Fire TV Media Players",
    primaryKeyword: "best reloaded fire tv player",
    supportKeywords: [
      "tivimate review",
      "iptv smarters pro",
      "perfect player reloaded fire tv",
      "vlc reloaded fire tv",
      "m3u player",
    ],
    intent: "informational",
    linksTo: ["/tivimate", "/iptv-smarters-pro", "/iptv-firestick", "/iptv", "/setup"],
  },
  {
    path: "/tivimate",
    title: "TiviMate Guide",
    primaryKeyword: "tivimate setup",
    supportKeywords: [
      "tivimate reloaded fire tv",
      "tivimate firestick",
      "tivimate epg",
      "tivimate subscription setup",
      "best player for reloaded fire tv",
    ],
    intent: "informational",
    linksTo: ["/iptv-media-players", "/iptv-firestick", "/iptv", "/blog"],
  },
  {
    path: "/iptv-smarters-pro",
    title: "IPTV Smarters Pro Guide",
    primaryKeyword: "iptv smarters pro setup",
    supportKeywords: [
      "iptv smarters firestick",
      "iptv smarters android",
      "xtream codes setup",
      "m3u login guide",
      "reloaded fire tv app tutorial",
    ],
    intent: "informational",
    linksTo: ["/iptv-media-players", "/iptv-firestick", "/iptv", "/setup", "/blog"],
  },
  {
    path: "/devices",
    title: "Fire Stick Devices",
    primaryKeyword: "fire stick devices",
    supportKeywords: [
      "fire stick 4k max",
      "fire stick hd vs 4k",
      "best streaming device",
      "fire tv buying guide",
      "firestick device options",
    ],
    intent: "transactional",
    linksTo: ["/shop", "/bundles", "/setup", "/iptv", "/36hr-trial", "/iptv-firestick", "/jailbroken-fire-sticks", "/best-iptv-firestick"],
  },
  {
    path: "/best-iptv-firestick",
    title: "Best Reloaded Fire TV Firestick Options",
    primaryKeyword: "best reloaded fire tv firestick",
    supportKeywords: [
      "firestick reloaded fire tv bundle",
      "best firestick for reloaded fire tv",
      "reloaded fire tv streaming setup",
      "firestick live tv guide",
      "fire tv reloaded fire tv options",
    ],
    intent: "transactional",
    linksTo: ["/shop", "/36hr-trial", "/iptv-firestick", "/devices", "/iptv"],
  },
  {
    path: "/resources",
    title: "Reloaded Fire TV Resources",
    primaryKeyword: "reloaded fire tv resources",
    supportKeywords: [
      "reloaded fire tv setup guide",
      "fire stick tutorials",
      "streaming tools",
      "reloaded fire tv catalog",
      "reloaded fire tv reference",
    ],
    intent: "informational",
    linksTo: ["/tools/catalog", "/setup", "/blog", "/iptv", "/locations"],
  },
  {
    path: "/setup",
    title: "Reloaded Fire TV Tutorials",
    primaryKeyword: "reloaded fire tv tutorial",
    supportKeywords: [
      "fire stick tutorial",
      "google tv setup",
      "reloaded fire tv app walkthrough",
      "streaming setup steps",
      "tivimate tutorial",
    ],
    intent: "informational",
    linksTo: ["/iptv-firestick", "/onn-google-tv", "/iptv-media-players", "/blog", "/36hr-trial"],
  },
  {
    path: "/pricing",
    title: "Reloaded Fire TV Pricing",
    primaryKeyword: "reloaded fire tv pricing",
    supportKeywords: [
      "reloaded fire tv plans cost",
      "reloaded fire tv monthly plan",
      "reloaded fire tv yearly plan",
      "cheap reloaded fire tv plan",
      "multi device pricing",
    ],
    intent: "transactional",
    linksTo: ["/shop", "/bundles", "/devices", "/36hr-trial", "/iptv", "/iptv-firestick"],
  },
  {
    path: "/shop",
    title: "Stream Stick Pro Shop",
    primaryKeyword: "buy reloaded fire tv subscription",
    supportKeywords: [
      "reloaded fire tv buy online",
      "fire stick reloaded fire tv bundle",
      "reloaded fire tv subscription usa",
      "buy fire stick with reloaded fire tv",
      "streaming device store",
      "reloaded fire tv plan checkout",
    ],
    intent: "transactional",
    linksTo: ["/pricing", "/bundles", "/36hr-trial", "/iptv", "/devices", "/setup", "/onn-google-tv"],
  },
  {
    path: "/blog",
    title: "Reloaded Fire TV Blog & Guides",
    primaryKeyword: "reloaded fire tv blog",
    supportKeywords: [
      "cord cutting blog",
      "streaming news",
      "fire stick tips",
      "reloaded fire tv setup guides",
      "live tv streaming blog",
      "jailbreak tutorials",
    ],
    intent: "informational",
    linksTo: ["/iptv", "/iptv-firestick", "/setup", "/resources", "/iptv-media-players"],
  },
  {
    path: "/ultimate-iptv-catalog-2026",
    title: "Ultimate Reloaded Fire TV Channel Catalog",
    primaryKeyword: "reloaded fire tv channel list",
    supportKeywords: [
      "reloaded fire tv channels 2026",
      "live tv channel list",
      "sports channels reloaded fire tv",
      "usa reloaded fire tv channels",
      "reloaded fire tv m3u channel list",
      "ppv channels reloaded fire tv",
    ],
    intent: "informational",
    linksTo: ["/iptv", "/shop", "/36hr-trial", "/pricing", "/blog"],
  },
  {
    path: "/36hr-trial",
    title: "36-Hour Free Trial",
    primaryKeyword: "reloaded fire tv free trial",
    supportKeywords: [
      "try reloaded fire tv free",
      "reloaded fire tv test before buy",
      "free reloaded fire tv trial no credit card",
      "36 hour reloaded fire tv trial",
      "reloaded fire tv demo",
      "test live tv streaming",
    ],
    intent: "transactional",
    linksTo: ["/shop", "/iptv", "/bundles", "/setup", "/devices", "/pricing", "/iptv-firestick", "/onn-google-tv"],
  },
];

const byPath = new Map(NODES.map((node) => [node.path, node]));

export function normalizeSeoPath(rawPath: string): string {
  const input = String(rawPath || "").trim();
  if (!input) return "/";
  const LEGACY_PATH_ALIASES: Record<string, string> = {
    "/trial": "/36hr-trial",
    "/free-trial": "/36hr-trial",
    "/homepage": "/",
    "/iptv-services": "/iptv",
    "/firestick-devices": "/devices",
    "/live-tv": "/iptv",
    "/streaming": "/iptv",
    "/tutorial": "/setup",
    "/tutorials": "/setup",
    "/setup-firestick": "/setup",
    "/setup-onn": "/setup",
  };
  if (input.startsWith("http://") || input.startsWith("https://")) {
    try {
      const parsed = new URL(input);
      const p = parsed.pathname || "/";
      const normalized = p === "/" ? "/" : p.replace(/\/+$/, "");
      return LEGACY_PATH_ALIASES[normalized] || normalized;
    } catch {
      return "/";
    }
  }
  const normalized = input === "/" ? "/" : `/${input.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  return LEGACY_PATH_ALIASES[normalized] || normalized;
}

export function getPillarNode(path: string): SeoPillarNode | null {
  const normalized = normalizeSeoPath(path);
  return byPath.get(normalized) || null;
}

export function getRelatedPillarNodes(path: string, max = 6): SeoPillarNode[] {
  const node = getPillarNode(path);
  if (!node) return [];
  return node.linksTo
    .map((linkPath) => byPath.get(linkPath))
    .filter((value): value is SeoPillarNode => Boolean(value))
    .slice(0, max);
}

export const CORE_INTERNAL_LINKS = [
  { path: "/iptv", label: "Best Reloaded Fire TV Service Guide", keyword: "best reloaded fire tv service" },
  { path: "/iptv-firestick", label: "Reloaded Fire TV for Fire Stick", keyword: "reloaded fire tv fire stick" },
  { path: "/jailbroken-fire-sticks", label: "Jailbroken Fire Stick Guide", keyword: "jailbroken fire stick" },
  { path: "/onn-google-tv", label: "ONN Google TV Reloaded Fire TV Setup", keyword: "onn google tv reloaded fire tv" },
  { path: "/iptv-media-players", label: "Best Reloaded Fire TV Media Players", keyword: "best reloaded fire tv player" },
  { path: "/36hr-trial", label: "Start 36hr Trial", keyword: "reloaded fire tv free trial" },
  { path: "/tivimate", label: "TiviMate Reloaded Fire TV Setup", keyword: "tivimate setup" },
  { path: "/iptv-smarters-pro", label: "IPTV Smarters Pro Guide", keyword: "iptv smarters pro" },
  { path: "/devices", label: "Fire Stick Devices", keyword: "fire stick devices" },
  { path: "/bundles", label: "Reloaded Fire TV & Device Bundles", keyword: "reloaded fire tv fire stick bundle" },
  { path: "/pricing", label: "Reloaded Fire TV Plans & Pricing", keyword: "reloaded fire tv pricing" },
  { path: "/setup", label: "Setup Tutorial Videos", keyword: "reloaded fire tv setup tutorial" },
  { path: "/shop", label: "Shop Reloaded Fire TV & Devices", keyword: "buy reloaded fire tv subscription" },
];
