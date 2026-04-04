import { trackCustomEvent } from "@/components/RetargetingPixels";

type VpnClickTarget = "vpn_interest" | "vpn_affiliate";

interface TrackVpnClickOptions {
  source: string;
  placement: string;
  target?: VpnClickTarget;
}

/**
 * Records VPN intent/outbound clicks for the admin dashboard.
 * Uses sendBeacon when possible so navigation doesn't cancel the request.
 */
export function trackVpnClick({
  source,
  placement,
  target = "vpn_interest",
}: TrackVpnClickOptions): void {
  const eventName = target === "vpn_affiliate" ? "vpn_affiliate_click" : "vpn_interest_click";
  trackCustomEvent(eventName, { placement, source });

  const payload = JSON.stringify({ target, source, placement });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const ok = navigator.sendBeacon(
        "/api/track-outbound-click",
        new Blob([payload], { type: "application/json" })
      );
      if (ok) return;
    }
  } catch {
    // Fallback to fetch below.
  }

  void fetch("/api/track-outbound-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {});
}
