/** Matches real_products.id pattern built in sync / admin: iptv-{term}-{devices}d */
export type IptvDurationKey = "1mo" | "3mo" | "6mo" | "1yr";

export function iptvRealProductId(duration: IptvDurationKey, deviceCount: number): string {
  return `iptv-${duration}-${deviceCount}d`;
}
