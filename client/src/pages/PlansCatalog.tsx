import { useEffect, useState } from "react";
import { Link } from "wouter";
import { StorefrontChrome } from "@/components/StorefrontChrome";
import { setPageMeta } from "@/lib/seo";

function formatUsd(cents?: number | null) {
  if (cents == null || !Number.isFinite(cents)) return null;
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export default function PlansCatalog() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPageMeta({
      title: "Plans for Devices You Already Own | StreamStickPro",
      description:
        "Streaming plans for Fire TV, Google TV, ONN, and other devices you already own. Hardware is included only when the plan says so.",
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
    <div className="bg-[#f4f6f8]">
      <div className="bg-[#0b1220] text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-sm uppercase tracking-[0.2em] text-teal-300">Plans &amp; Services</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Plans for devices you already own</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            These plans are for Fire TV, Google TV, ONN, and other compatible equipment you already have.
            A plan does not include a new device unless that plan says it does.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        {loading && <p>Loading plans…</p>}
        {!loading && !plans.length && (
          <div className="rounded-2xl border bg-white p-8">
            <p className="text-slate-600">
              Published plans will appear here from the owner CMS. See{" "}
              <Link href="/pricing" className="text-blue-700 underline">
                Pricing
              </Link>{" "}
              or{" "}
              <Link href="/shop" className="text-blue-700 underline">
                Shop
              </Link>{" "}
              meanwhile.
            </p>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <Link
              key={p.code}
              href={`/plans/${encodeURIComponent(p.code)}`}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              {p.sale_label ? (
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{p.sale_label}</span>
              ) : null}
              <h2 className="mt-2 text-xl font-semibold">{p.public_title}</h2>
              <p className="mt-2 text-sm text-slate-600 line-clamp-3">{p.short_description}</p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{formatUsd(p.public_display_price_cents)}</span>
                {p.public_compare_at_cents ? (
                  <span className="text-sm text-slate-400 line-through">
                    {formatUsd(p.public_compare_at_cents)}
                  </span>
                ) : null}
              </div>
              {p.billing_term ? <p className="mt-1 text-xs text-slate-500">{p.billing_term}</p> : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
    </StorefrontChrome>
  );
}
