import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { StorefrontChrome } from "@/components/StorefrontChrome";
import { setPageMeta } from "@/lib/seo";
import { useCart } from "@/lib/store";

function formatUsd(cents?: number | null) {
  if (cents == null || !Number.isFinite(cents)) return null;
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export default function DeviceDetailPage() {
  const params = useParams<{ sku: string }>();
  const sku = decodeURIComponent(params.sku || "");
  const [device, setDevice] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/owner-cms/devices/${encodeURIComponent(sku)}`);
        const json = await res.json();
        if (!cancelled) {
          if (!json.data) setError("not_found");
          else setDevice(json.data);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sku]);

  useEffect(() => {
    if (!device) return;
    const price = device.public_display_price_cents;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: device.public_title,
      description: device.short_description || device.full_description || device.public_title,
      sku: device.sku,
      brand: device.brand ? { "@type": "Brand", name: device.brand } : undefined,
      model: device.model || undefined,
      image: [
        device.primary_image_url,
        ...(Array.isArray(device.gallery) ? device.gallery.map((g: any) => g?.url || g) : []),
      ].filter(Boolean),
      offers: {
        "@type": "Offer",
        url: typeof window !== "undefined" ? window.location.href : undefined,
        priceCurrency: "USD",
        price: typeof price === "number" ? (price / 100).toFixed(2) : undefined,
        availability:
          device.availability === "out_of_stock"
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
        itemCondition:
          device.condition === "refurbished"
            ? "https://schema.org/RefurbishedCondition"
            : device.condition === "used"
              ? "https://schema.org/UsedCondition"
              : "https://schema.org/NewCondition",
      },
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "device-jsonld";
    script.text = JSON.stringify(jsonLd);
    document.getElementById("device-jsonld")?.remove();
    document.head.appendChild(script);
    if (device.seo_title) document.title = device.seo_title;
    setPageMeta({
      title: device.seo_title || device.public_title || "Google TV device",
      description: device.seo_description || device.short_description || "ONN or Google TV device details, price, and setup.",
      path: `/devices/${encodeURIComponent(device.sku || "")}`,
    });
    return () => {
      document.getElementById("device-jsonld")?.remove();
    };
  }, [device]);

  if (error === "not_found") {
    return (
      <StorefrontChrome>
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-2xl font-semibold">Device not found</h1>
        <Link href="/devices" className="mt-4 inline-block text-blue-700 underline">
          Back to devices
        </Link>
      </div>
      </StorefrontChrome>
    );
  }

  if (!device) {
    return (
      <StorefrontChrome>
        <div className="mx-auto max-w-3xl px-4 py-20 text-slate-600">Loading…</div>
      </StorefrontChrome>
    );
  }

  const price = formatUsd(device.public_display_price_cents);
  const compare = formatUsd(device.public_compare_at_cents);
  const included = Array.isArray(device.included_items) ? device.included_items : [];
  const faq = Array.isArray(device.faq) ? device.faq : [];

  return (
    <StorefrontChrome>
    <div className="bg-white text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-slate-100">
          {device.primary_image_url ? (
            <img
              src={device.primary_image_url}
              alt={device.image_alt || device.public_title}
              className="w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-slate-400">No image</div>
          )}
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-blue-700">
            {device.brand || "Google TV"} · {device.condition || "new"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{device.public_title}</h1>
          <p className="mt-4 text-slate-600">{device.short_description}</p>
          <div className="mt-6 flex items-baseline gap-3">
            {price ? <span className="text-3xl font-semibold">{price}</span> : null}
            {compare ? <span className="text-lg text-slate-400 line-through">{compare}</span> : null}
            {device.sale_label ? (
              <span className="rounded-md bg-amber-100 px-2 py-1 text-sm text-amber-800">{device.sale_label}</span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-slate-500">Public display price · Availability: {device.availability}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500"
              onClick={() => {
                addItem({
                  id: device.real_product_id || device.sku,
                  name: device.public_title,
                  price: (device.public_display_price_cents || 0) / 100,
                  image: device.primary_image_url || "",
                  category: "firestick",
                  description: device.short_description || "",
                });
                openCart();
              }}
            >
              Add to cart
            </button>
            <Link
              href="/shop"
              className="rounded-xl border px-5 py-3 text-sm font-medium"
            >
              View all products
            </Link>
            {device.setup_guide_link ? (
              <a href={device.setup_guide_link} className="rounded-xl border px-5 py-3 text-sm font-medium">
                Setup guide
              </a>
            ) : (
              <Link href="/guides" className="rounded-xl border px-5 py-3 text-sm font-medium">
                Setup guides
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-4 pb-16">
        {device.full_description ? (
          <section>
            <h2 className="text-xl font-semibold">About this device</h2>
            <p className="mt-3 whitespace-pre-wrap text-slate-700">{device.full_description}</p>
          </section>
        ) : null}
        {included.length ? (
          <section>
            <h2 className="text-xl font-semibold">What&apos;s included</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
              {included.map((item: any, i: number) => (
                <li key={i}>{typeof item === "string" ? item : item?.label || JSON.stringify(item)}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {device.compatibility ? (
          <section>
            <h2 className="text-xl font-semibold">Compatibility</h2>
            <p className="mt-3 text-slate-700">{device.compatibility}</p>
          </section>
        ) : null}
        {device.shipping_returns_text ? (
          <section>
            <h2 className="text-xl font-semibold">Shipping &amp; returns</h2>
            <p className="mt-3 text-slate-700">{device.shipping_returns_text}</p>
          </section>
        ) : null}
        {faq.length ? (
          <section>
            <h2 className="text-xl font-semibold">FAQ</h2>
            <div className="mt-4 space-y-4">
              {faq.map((f: any, i: number) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4">
                  <h3 className="font-medium">{f.question || f.q}</h3>
                  <p className="mt-2 text-slate-600">{f.answer || f.a}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
    </StorefrontChrome>
  );
}
