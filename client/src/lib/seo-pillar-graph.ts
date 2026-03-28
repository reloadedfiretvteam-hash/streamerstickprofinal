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
    path: "/iptv-services",
    title: "IPTV Services Guide",
    primaryKeyword: "best iptv service",
    supportKeywords: [
      "iptv subscription",
      "cheap iptv subscription",
      "live tv streaming",
      "iptv plans",
      "cord cutting guide",
      "iptv channels",
    ],
    intent: "commercial",
    linksTo: ["/iptv-firestick", "/iptv-media-players", "/pricing", "/trial", "/blog", "/shop"],
  },
  {
    path: "/iptv-firestick",
    title: "IPTV for Fire Stick",
    primaryKeyword: "iptv fire stick",
    supportKeywords: [
      "best iptv for firestick",
      "fire stick iptv setup",
      "firestick iptv apps",
      "tivimate firestick",
      "iptv smarters firestick",
    ],
    intent: "commercial",
    linksTo: ["/firestick-devices", "/best-iptv-firestick", "/jailbroken-fire-sticks", "/iptv-services", "/trial", "/shop"],
  },
  {
    path: "/jailbroken-fire-sticks",
    title: "Jailbroken Fire Stick Guide",
    primaryKeyword: "jailbroken fire stick",
    supportKeywords: [
      "fire tv jailbreak guide",
      "firestick setup help",
      "fire stick options",
      "fire stick with iptv",
      "streaming device guide",
    ],
    intent: "commercial",
    linksTo: ["/firestick-devices", "/iptv-firestick", "/onn-google-tv", "/iptv-services", "/shop"],
  },
  {
    path: "/onn-google-tv",
    title: "ONN Google TV Setup",
    primaryKeyword: "onn google tv iptv",
    supportKeywords: [
      "onn 4k setup",
      "google tv iptv apps",
      "onn streaming setup",
      "iptv on onn device",
      "onn tv guide",
    ],
    intent: "commercial",
    linksTo: ["/iptv-media-players", "/iptv-services", "/iptv-firestick", "/trial", "/shop"],
  },
  {
    path: "/iptv-media-players",
    title: "IPTV Media Players",
    primaryKeyword: "best iptv player",
    supportKeywords: [
      "tivimate review",
      "iptv smarters pro",
      "perfect player iptv",
      "vlc iptv",
      "m3u player",
    ],
    intent: "informational",
    linksTo: ["/tivimate", "/iptv-smarters-pro", "/iptv-firestick", "/iptv-services", "/tutorials"],
  },
  {
    path: "/tivimate",
    title: "TiviMate Guide",
    primaryKeyword: "tivimate setup",
    supportKeywords: [
      "tivimate iptv",
      "tivimate firestick",
      "tivimate epg",
      "tivimate subscription setup",
      "best player for iptv",
    ],
    intent: "informational",
    linksTo: ["/iptv-media-players", "/iptv-firestick", "/iptv-services", "/blog"],
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
      "iptv app tutorial",
    ],
    intent: "informational",
    linksTo: ["/iptv-media-players", "/iptv-firestick", "/iptv-services", "/tutorials", "/blog"],
  },
  {
    path: "/firestick-devices",
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
    linksTo: ["/shop", "/trial", "/iptv-firestick", "/jailbroken-fire-sticks", "/best-iptv-firestick"],
  },
  {
    path: "/best-iptv-firestick",
    title: "Best IPTV Firestick Options",
    primaryKeyword: "best iptv firestick",
    supportKeywords: [
      "firestick iptv bundle",
      "best firestick for iptv",
      "iptv streaming setup",
      "firestick live tv guide",
      "fire tv iptv options",
    ],
    intent: "transactional",
    linksTo: ["/shop", "/trial", "/iptv-firestick", "/firestick-devices", "/iptv-services"],
  },
  {
    path: "/resources",
    title: "IPTV Resources",
    primaryKeyword: "iptv resources",
    supportKeywords: [
      "iptv setup guide",
      "fire stick tutorials",
      "streaming tools",
      "iptv catalog",
      "iptv reference",
    ],
    intent: "informational",
    linksTo: ["/tools/catalog", "/tutorials", "/blog", "/iptv-services", "/locations"],
  },
  {
    path: "/tutorials",
    title: "IPTV Tutorials",
    primaryKeyword: "iptv tutorial",
    supportKeywords: [
      "fire stick tutorial",
      "google tv setup",
      "iptv app walkthrough",
      "streaming setup steps",
      "tivimate tutorial",
    ],
    intent: "informational",
    linksTo: ["/iptv-firestick", "/onn-google-tv", "/iptv-media-players", "/blog", "/trial"],
  },
  {
    path: "/trial",
    title: "36hr Trial",
    primaryKeyword: "iptv free trial",
    supportKeywords: [
      "36 hour trial",
      "test iptv service",
      "free trial fire stick",
      "trial live tv streaming",
      "iptv demo access",
    ],
    intent: "transactional",
    linksTo: ["/shop", "/iptv-services", "/iptv-firestick", "/onn-google-tv", "/pricing"],
  },
  {
    path: "/pricing",
    title: "IPTV Pricing",
    primaryKeyword: "iptv pricing",
    supportKeywords: [
      "iptv plans cost",
      "iptv monthly plan",
      "iptv yearly plan",
      "cheap iptv plan",
      "multi device pricing",
    ],
    intent: "transactional",
    linksTo: ["/shop", "/trial", "/iptv-services", "/iptv-firestick"],
  },
  {
    path: "/shop",
    title: "Stream Stick Pro Shop",
    primaryKeyword: "buy iptv subscription",
    supportKeywords: [
      "iptv buy online",
      "fire stick iptv bundle",
      "iptv subscription usa",
      "buy fire stick with iptv",
      "streaming device store",
      "iptv plan checkout",
    ],
    intent: "transactional",
    linksTo: ["/pricing", "/trial", "/iptv-services", "/firestick-devices", "/onn-google-tv"],
  },
  {
    path: "/blog",
    title: "IPTV Blog & Guides",
    primaryKeyword: "iptv blog",
    supportKeywords: [
      "cord cutting blog",
      "streaming news",
      "fire stick tips",
      "iptv setup guides",
      "live tv streaming blog",
      "jailbreak tutorials",
    ],
    intent: "informational",
    linksTo: ["/iptv-services", "/iptv-firestick", "/tutorials", "/resources", "/iptv-media-players"],
  },
  {
    path: "/ultimate-iptv-catalog-2026",
    title: "Ultimate IPTV Channel Catalog",
    primaryKeyword: "iptv channel list",
    supportKeywords: [
      "iptv channels 2026",
      "live tv channel list",
      "sports channels iptv",
      "usa iptv channels",
      "iptv m3u channel list",
      "ppv channels iptv",
    ],
    intent: "informational",
    linksTo: ["/iptv-services", "/shop", "/trial", "/pricing", "/blog"],
  },
  {
    path: "/36hr-trial",
    title: "36-Hour Free Trial",
    primaryKeyword: "iptv free trial",
    supportKeywords: [
      "try iptv free",
      "iptv test before buy",
      "free iptv trial no credit card",
      "36 hour iptv trial",
      "iptv demo",
      "test live tv streaming",
    ],
    intent: "transactional",
    linksTo: ["/shop", "/iptv-services", "/pricing", "/iptv-firestick", "/onn-google-tv"],
  },
];

const byPath = new Map(NODES.map((node) => [node.path, node]));

export function normalizeSeoPath(rawPath: string): string {
  const input = String(rawPath || "").trim();
  if (!input) return "/";
  if (input.startsWith("http://") || input.startsWith("https://")) {
    try {
      const parsed = new URL(input);
      const p = parsed.pathname || "/";
      return p === "/" ? "/" : p.replace(/\/+$/, "");
    } catch {
      return "/";
    }
  }
  return input === "/" ? "/" : `/${input.replace(/^\/+/, "").replace(/\/+$/, "")}`;
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
  { path: "/iptv-services", label: "Best IPTV Service Guide", keyword: "best iptv service" },
  { path: "/iptv-firestick", label: "IPTV for Fire Stick", keyword: "iptv fire stick" },
  { path: "/jailbroken-fire-sticks", label: "Jailbroken Fire Stick Guide", keyword: "jailbroken fire stick" },
  { path: "/onn-google-tv", label: "ONN Google TV IPTV Setup", keyword: "onn google tv iptv" },
  { path: "/iptv-media-players", label: "Best IPTV Media Players", keyword: "best iptv player" },
  { path: "/36hr-trial", label: "Start 36hr Trial", keyword: "iptv free trial" },
  { path: "/tivimate", label: "TiviMate IPTV Setup", keyword: "tivimate setup" },
  { path: "/iptv-smarters-pro", label: "IPTV Smarters Pro Guide", keyword: "iptv smarters pro" },
  { path: "/firestick-devices", label: "Fire Stick Devices", keyword: "fire stick devices" },
  { path: "/pricing", label: "IPTV Plans & Pricing", keyword: "iptv pricing" },
  { path: "/tutorials", label: "Setup Tutorial Videos", keyword: "iptv setup tutorial" },
  { path: "/shop", label: "Shop IPTV & Devices", keyword: "buy iptv subscription" },
];
