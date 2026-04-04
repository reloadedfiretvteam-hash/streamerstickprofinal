/**
 * real_products.id in Supabase may use short SKUs (fs-4k) or legacy slugs (firestick-4k).
 * Checkout / cart may send either; storage resolves to whichever row exists.
 */
const EQUIV_CLASSES: readonly (readonly string[])[] = [
  ["fs-hd", "firestick-hd"],
  ["fs-4k", "firestick-4k"],
  ["fs-max", "firestick-4k-max"],
];

export function variantsForRealProductId(id: string): string[] {
  const trimmed = id.trim();
  for (const group of EQUIV_CLASSES) {
    if (group.includes(trimmed)) return [...group];
  }
  return [trimmed];
}
