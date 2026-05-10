/**
 * real_products.id in Supabase may use short SKUs or legacy slugs.
 * Checkout / cart may send either; storage resolves to whichever row exists.
 */
const EQUIV_CLASSES: readonly (readonly string[])[] = [
  ["onn-google-hd", "android-onn-hd", "fs-hd", "firestick-hd"],
  ["onn-google-4k", "android-onn-4k", "android-onn-pro", "fs-4k", "firestick-4k"],
  ["fs-max", "firestick-4k-max"],
];

export function variantsForRealProductId(id: string): string[] {
  const trimmed = id.trim();
  for (const group of EQUIV_CLASSES) {
    if (group.includes(trimmed)) return [...group];
  }
  return [trimmed];
}
