import { useEffect, useMemo, useState } from "react";
import { apiCall } from "@/lib/api";

type CmsBanner = {
  id: string;
  headline?: string;
  subheadline?: string;
  background_color?: string;
  text_color?: string;
  image_url?: string | null;
  button_label?: string | null;
  button_href?: string | null;
  coupon_code?: string | null;
  ends_at?: string | null;
  target_pages?: string[];
};

function countdownLabel(endsAt?: string | null): string {
  if (!endsAt) return "";
  const ms = new Date(endsAt).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return "ended";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function dismissedKey(id: string) {
  return `cms-banner-dismissed:${id}`;
}

export function CmsStoreBanner({ page }: { page: "real" | "cloak" }) {
  const [banners, setBanners] = useState<CmsBanner[]>([]);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [nowTick, setNowTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiCall("/api/owner-cms/banners");
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? (json.data as CmsBanner[]) : [];
        if (!cancelled) setBanners(rows);
      } catch {
        if (!cancelled) setBanners([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const visible = useMemo(
    () =>
      banners.filter((banner) => {
        const targets = Array.isArray(banner.target_pages) ? banner.target_pages : ["*"];
        if (!(targets.includes("*") || targets.includes(page) || targets.includes("homepage"))) return false;
        if (hidden[banner.id] || localStorage.getItem(dismissedKey(banner.id))) return false;
        if (countdownLabel(banner.ends_at) === "ended") return false;
        return true;
      }),
    [banners, hidden, page, nowTick],
  );

  if (!visible.length) return null;

  return (
    <div className="relative z-20">
      {visible.map((banner) => {
        const remain = countdownLabel(banner.ends_at);
        return (
          <div
            key={banner.id}
            className="px-4 py-3"
            style={{
              backgroundColor: banner.background_color || "#0f172a",
              color: banner.text_color || "#ffffff",
            }}
          >
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
              {banner.image_url ? (
                <img src={banner.image_url} alt="" className="h-14 w-20 rounded object-cover" />
              ) : null}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="font-semibold leading-snug">{banner.headline}</p>
                {banner.subheadline ? <p className="text-sm opacity-90">{banner.subheadline}</p> : null}
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold sm:justify-start">
                  {banner.coupon_code ? (
                    <span className="rounded bg-white/15 px-2 py-1">Code {banner.coupon_code}</span>
                  ) : null}
                  {remain && remain !== "ended" ? (
                    <span className="rounded bg-black/20 px-2 py-1">Ends in {remain}</span>
                  ) : null}
                </div>
              </div>
              {banner.button_label && banner.button_href ? (
                <a
                  href={banner.button_href}
                  className="inline-flex min-h-10 items-center rounded-lg bg-white/15 px-4 text-sm font-semibold hover:bg-white/25"
                >
                  {banner.button_label}
                </a>
              ) : null}
              <button
                type="button"
                className="min-h-10 min-w-10 rounded-lg text-lg leading-none opacity-80 hover:bg-white/10"
                aria-label="Dismiss sale banner"
                onClick={() => {
                  localStorage.setItem(dismissedKey(banner.id), "1");
                  setHidden((current) => ({ ...current, [banner.id]: true }));
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
