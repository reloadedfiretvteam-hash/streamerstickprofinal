import { useEffect, useState } from "react";
import { Link } from "wouter";
import { StorefrontChrome } from "@/components/StorefrontChrome";
import { setPageMeta } from "@/lib/seo";

type CmsDevice = {
  sku: string;
  public_title: string;
  brand?: string;
  condition?: string;
  short_description?: string;
  public_display_price_cents?: number | null;
  public_compare_at_cents?: number | null;
  sale_label?: string | null;
  primary_image_url?: string | null;
  availability?: string;
};

function formatUsd(cents?: number | null) {
  if (cents == null || !Number.isFinite(cents)) return null;
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export default function DevicesCatalog() {
  const [devices, setDevices] = useState<CmsDevice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageMeta({
      title: "ONN & Google TV Devices | StreamStickPro",
      description:
        "Shop ONN and Google TV streaming devices with price, condition, and setup details. Fire Stick hardware is not sold on this page.",
      path: "/devices",
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/owner-cms/devices");
        const json = await res.json();
        if (!cancelled) setDevices(Array.isArray(json.data) ? json.data : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load devices");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <StorefrontChrome>
    <div className="bg-[#f4f6f8] text-slate-900">
      <div className="bg-[#0b1220] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-300">Google TV Devices</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            Google HD and 4K packages
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white">
            The HD package is $140. The 4K package is $150. Each one includes the preloaded ONN Google TV device, a web tutorial, login credentials, and live TV service.
            If you already own a device, see{" "}
            <Link href="/plans" className="text-teal-200 underline underline-offset-2">
              subscriptions
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {loading && <p className="text-slate-600">Loading devices…</p>}
        {error && <p className="text-amber-700">Could not load catalog ({error}).</p>}
        {!loading && !devices.length && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold">Catalog is being prepared</h2>
            <p className="mt-2 text-slate-600">
              Published Google TV devices will appear here from the owner CMS. Meanwhile, see{" "}
              <Link href="/onn" className="text-blue-700 underline">
                ONN Google TV
              </Link>{" "}
              or{" "}
              <Link href="/shop" className="text-blue-700 underline">
                Shop
              </Link>
              .
            </p>
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((d) => {
            const price = formatUsd(d.public_display_price_cents);
            const compare = formatUsd(d.public_compare_at_cents);
            return (
              <Link
                key={d.sku}
                href={`/devices/${encodeURIComponent(d.sku)}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  {d.primary_image_url ? (
                    <img
                      src={d.primary_image_url}
                      alt={d.public_title}
                      className="h-full w-full bg-white object-contain p-3"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <div className="space-y-2 p-5">
                  {d.sale_label ? (
                    <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      {d.sale_label}
                    </span>
                  ) : null}
                  <h2 className="text-lg font-semibold group-hover:text-blue-700">{d.public_title}</h2>
                  <p className="text-sm text-slate-600 line-clamp-2">{d.short_description}</p>
                  <div className="flex items-baseline gap-2 pt-1">
                    {price ? <span className="text-xl font-semibold text-slate-900">{price}</span> : null}
                    {compare ? <span className="text-sm text-slate-400 line-through">{compare}</span> : null}
                  </div>
                  <p className="text-sm font-medium text-slate-700">New · In stock</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
    </StorefrontChrome>
  );
}
