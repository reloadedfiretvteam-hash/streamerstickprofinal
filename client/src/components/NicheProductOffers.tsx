import { useEffect, useState } from "react";
import { Link } from "wouter";

type Device = {
  sku: string;
  public_title: string;
  short_description?: string;
  public_display_price_cents?: number | null;
  primary_image_url?: string | null;
};

function money(cents?: number | null) {
  if (cents == null || !Number.isFinite(cents)) return null;
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function NicheProductOffers({
  title = "The Google TV kits that match this search",
}: {
  title?: string;
}) {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/owner-cms/devices");
        const json = await res.json();
        if (!cancelled) setDevices(Array.isArray(json.data) ? json.data : []);
      } catch {
        if (!cancelled) setDevices([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!devices.length) return null;

  return (
    <section className="my-10 rounded-2xl border border-white/10 bg-[#121826] p-5 text-white">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-slate-300">
        These are the live ONN Google TV SKUs with current price, photo, and an order link. Fire Stick hardware is not sold on this site.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {devices.map((device) => (
          <Link
            key={device.sku}
            href={`/devices/${encodeURIComponent(device.sku)}`}
            className="overflow-hidden rounded-xl border border-white/10 bg-black/20 hover:border-blue-400/50"
          >
            {device.primary_image_url ? (
              <img src={device.primary_image_url} alt={device.public_title} className="h-40 w-full object-cover" />
            ) : null}
            <div className="space-y-1 p-4">
              <h3 className="font-semibold">{device.public_title}</h3>
              <p className="text-sm text-slate-300 line-clamp-2">{device.short_description}</p>
              <p className="pt-1 text-lg font-semibold text-teal-300">{money(device.public_display_price_cents)}</p>
              <p className="text-sm text-blue-300">View price, photo, and order →</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
