import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { StorefrontChrome } from "@/components/StorefrontChrome";
import { setPageMeta } from "@/lib/seo";

function formatUsd(cents?: number | null) {
  if (cents == null || !Number.isFinite(cents)) return null;
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export default function PlanDetailPage() {
  const params = useParams<{ code: string }>();
  const code = decodeURIComponent(params.code || "");
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/owner-cms/plans/${encodeURIComponent(code)}`);
        const json = await res.json();
        if (!cancelled) {
          if (!json.data) setError("not_found");
          else setPlan(json.data);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    if (!plan) return;
    setPageMeta({
      title: plan.seo_title || plan.public_title || "Streaming plan",
      description: plan.seo_description || plan.short_description || "Streaming plan for a device you already own.",
      path: `/plans/${encodeURIComponent(plan.code || code)}`,
    });
  }, [plan, code]);

  if (error === "not_found") {
    return (
      <StorefrontChrome>
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-2xl font-semibold">Plan not found</h1>
        <Link href="/plans" className="mt-4 inline-block text-blue-700 underline">
          Back to plans
        </Link>
      </div>
      </StorefrontChrome>
    );
  }
  if (!plan) {
    return (
      <StorefrontChrome>
        <div className="mx-auto max-w-3xl px-4 py-20">Loading…</div>
      </StorefrontChrome>
    );
  }

  const features = Array.isArray(plan.features) ? plan.features : [];
  const faq = Array.isArray(plan.faq) ? plan.faq : [];

  return (
    <StorefrontChrome>
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="text-sm uppercase tracking-wide text-teal-700">Plan / Service</p>
      <h1 className="mt-2 text-4xl font-semibold">{plan.public_title}</h1>
      <p className="mt-4 text-slate-600">{plan.short_description}</p>
      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-3xl font-semibold">{formatUsd(plan.public_display_price_cents)}</span>
        {plan.public_compare_at_cents ? (
          <span className="text-lg text-slate-400 line-through">{formatUsd(plan.public_compare_at_cents)}</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Public display price only — checkout amounts are protected and may differ until a separate payment sync.
      </p>
      {plan.billing_term ? <p className="mt-2 text-sm text-slate-600">{plan.billing_term}</p> : null}
      {plan.eligibility ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Eligibility / compatibility</h2>
          <p className="mt-2 text-slate-700 whitespace-pre-wrap">{plan.eligibility}</p>
        </section>
      ) : null}
      {plan.full_description ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Details</h2>
          <p className="mt-2 whitespace-pre-wrap text-slate-700">{plan.full_description}</p>
        </section>
      ) : null}
      {features.length ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Features</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {features.map((f: any, i: number) => (
              <li key={i}>{typeof f === "string" ? f : f?.label || JSON.stringify(f)}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {plan.support_scope ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Support scope</h2>
          <p className="mt-2 text-slate-700">{plan.support_scope}</p>
        </section>
      ) : null}
      {faq.length ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">FAQ</h2>
          <div className="mt-4 space-y-3">
            {faq.map((f: any, i: number) => (
              <div key={i} className="rounded-xl border p-4">
                <h3 className="font-medium">{f.question || f.q}</h3>
                <p className="mt-1 text-slate-600">{f.answer || f.a}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <div className="mt-10 flex gap-3">
        <Link href="/shop" className="rounded-xl bg-blue-600 px-5 py-3 text-white">
          Continue to shop
        </Link>
        <Link href="/guides" className="rounded-xl border px-5 py-3">
          Setup guides
        </Link>
      </div>
    </div>
    </StorefrontChrome>
  );
}
