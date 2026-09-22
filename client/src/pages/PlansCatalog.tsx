import { useEffect, useState } from "react";
import { Link } from "wouter";
import { StorefrontChrome } from "@/components/StorefrontChrome";
import { setPageMeta } from "@/lib/seo";
import { useCart } from "@/lib/store";

function formatUsd(cents?: number | null) {
  if (cents == null || !Number.isFinite(cents)) return null;
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function readablePlanCopy(text?: string | null) {
  const value = String(text || "").trim();
  if (!value || /real product mapped/i.test(value)) {
    return "Live TV subscription for a Fire Stick, ONN, or Google TV you already own. Includes a web tutorial and login credentials.";
  }
  return value;
}

export default function PlansCatalog() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    setPageMeta({
      title: "Live TV Subscriptions | StreamStickPro",
      description:
        "Live TV subscriptions for a Fire Stick, Google TV, or ONN device you already own. Pick the length and the number of screens, then check out.",
      path: "/plans",
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/owner-cms/plans");
        const json = await res.json();
        if (!cancelled) setPlans(Array.isArray(json.data) ? json.data : []);
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
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm uppercase tracking-[0.2em] text-teal-200">Subscriptions</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Subscriptions for a device you already own</h1>
          <p className="mt-4 max-w-2xl text-lg text-white leading-relaxed">
            These plans are for a Fire Stick, Google TV, ONN, or other compatible device you already have.
            A subscription does not include a new device. New hardware is in the Google packages.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        {loading && <p className="text-slate-700">Loading subscriptions…</p>}
        {!loading && !plans.length && (
          <div className="rounded-2xl border bg-white p-8">
            <p className="text-slate-800">
              Subscriptions will appear here. You can also open the{" "}
              <Link href="/#shop" className="text-blue-700 underline">
                homepage shop
              </Link>
              .
            </p>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => {
            const dollars = (Number(p.public_display_price_cents) || 0) / 100;
            return (
              <article key={p.code} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">
                  <Link href={`/plans/${encodeURIComponent(p.code)}`} className="hover:text-blue-700">
                    {p.public_title}
                  </Link>
                </h2>
                <p className="mt-2 flex-1 text-base leading-relaxed text-slate-700">{readablePlanCopy(p.short_description)}</p>
                <div className="mt-4 text-3xl font-semibold text-slate-900">{formatUsd(p.public_display_price_cents)}</div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl bg-teal-600 px-4 py-3 text-base font-semibold text-white hover:bg-teal-500"
                  onClick={() => {
                    addItem({
                      id: p.real_product_id || p.code,
                      name: p.public_title,
                      price: dollars,
                      image: p.primary_image_url || "",
                      category: "iptv",
                      description: readablePlanCopy(p.short_description),
                    });
                    openCart();
                  }}
                >
                  Add subscription to cart
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </div>
    </StorefrontChrome>
  );
}
