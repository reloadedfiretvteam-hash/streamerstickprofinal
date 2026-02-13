/**
 * SEO meta helpers – enforce Google/Bing best practice lengths to fix GSC errors.
 * Title: 50–60 chars. Meta description: 140–160 chars.
 */
const TITLE_MIN = 50;
const TITLE_MAX = 60;
const DESC_MIN = 140;
const DESC_MAX = 160;

export function truncateTitle(title: string, max = TITLE_MAX): string {
  const t = (title || "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1).replace(/\s+\S*$/, "");
  return cut.length >= TITLE_MIN ? cut : t.slice(0, max - 3) + "...";
}

export function truncateDescription(desc: string, max = DESC_MAX): string {
  const d = (desc || "").trim();
  if (d.length <= max) return d;
  const cut = d.slice(0, max - 1).replace(/\s+\S*$/, "");
  return cut.length >= DESC_MIN ? cut : d.slice(0, max - 3) + "...";
}

/** Truncate description to 140–160 chars to fix GSC "too long" errors. */
export function normalizeDescription(desc: string): string {
  const d = (desc || "").trim();
  if (d.length <= DESC_MAX) return d;
  return truncateDescription(d);
}

export function normalizeTitle(title: string): string {
  const t = (title || "").trim();
  if (t.length > TITLE_MAX) return truncateTitle(t);
  return t;
}
