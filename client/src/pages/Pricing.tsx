import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { setPageMeta } from "@/lib/seo";
import { SEOSchema } from "@/components/SEOSchema";
import { Check, ShoppingCart } from "lucide-react";
import { apiCall } from "@/lib/api";

type PricingFaqItem = {
  question?: string;
  answer?: string;
};

type PricingPlan = {
  title?: string;
  badge?: string;
  priceText?: string;
  periodText?: string;
  highlighted?: boolean;
  features?: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

type CmsPricingPayload = {
  meta?: {
    title?: string;
    description?: string;
    path?: string;
  };
  hero?: {
    title?: string;
    description?: string;
    trialCtaLabel?: string;
    trialCtaHref?: string;
  };
  plans?: PricingPlan[];
  faq?: {
    title?: string;
    items?: PricingFaqItem[];
  };
};

const DEFAULT_PRICING: CmsPricingPayload = {
  meta: {
    title: "Reloaded Fire TV Subscription Plans 2026 | Cheapest & Best | StreamStick Pro",
    description:
      "Reloaded Fire TV plans from $11/mo: 18K+ live channels, 4K sports, PPV, 99.9% uptime. Cancel anytime. 36hr trial for subscription plans. StreamStick Pro.",
    path: "/pricing",
  },
  hero: {
    title: "Reloaded Fire TV Pricing",
    description:
      "Plans from $11/mo. 18K+ channels, 100K+ VOD. Fire Stick, Onn, Smart TV, Smarters Pro, TiviMate.",
    trialCtaLabel: "Start 36hr subscription trial",
    trialCtaHref: "/36hr-trial",
  },
  plans: [
    {
      title: "Starter",
      priceText: "$11",
      periodText: "/mo",
      features: ["18K+ channels"],
      ctaLabel: "View Shop",
      ctaHref: "/shop",
      highlighted: false,
    },
    {
      title: "Popular",
      badge: "MOST POPULAR",
      priceText: "$25",
      periodText: "/3 mo",
      features: ["18K+ channels"],
      ctaLabel: "View Shop",
      ctaHref: "/shop",
      highlighted: true,
    },
    {
      title: "Best Value",
      priceText: "$65",
      periodText: "/year",
      features: ["18K+ channels"],
      ctaLabel: "View Shop",
      ctaHref: "/shop",
      highlighted: false,
    },
  ],
  faq: {
    title: "Frequently Asked Questions",
    items: [
      {
        question: "What is the cheapest Reloaded Fire TV plan?",
        answer:
          "The Starter plan is $11/month for 1 device with access to 18,000+ live channels, 100,000+ movies and series, premium sports, and 4K streaming. Multi-month plans reduce the cost even further.",
      },
      {
        question: "Can I try before I buy?",
        answer:
          "Yes. StreamStickPro offers a separate 36-hour trial request for subscription plans so you can test the service before buying a paid plan.",
      },
      {
        question: "What is the best value Reloaded Fire TV plan?",
        answer:
          "The 1-year plan starts at $65 for 1 device and offers the best per-month rate. Multi-device yearly pricing varies by device count, and the live shop pricing is the source of truth.",
      },
      {
        question: "Can I use one plan on multiple devices?",
        answer:
          "Each plan is for 1 device connection at a time. If you need simultaneous streams on multiple TVs or devices, add extra device connections during checkout. Multi-device plans are available for 2, 3, 4, or 5 devices.",
      },
      {
        question: "How do I cancel my Reloaded Fire TV subscription?",
        answer:
          "Plans are one-time payments, not recurring subscriptions. There is nothing to cancel. When your plan expires, simply purchase a new plan if you want to continue.",
      },
    ],
  },
};

const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Pricing", href: "/pricing" }];

export default function Pricing() {
  const [cmsPricing, setCmsPricing] = useState<CmsPricingPayload>(DEFAULT_PRICING);

  useEffect(() => {
    const meta = DEFAULT_PRICING.meta!;
    setPageMeta({
      title: meta.title || "Reloaded Fire TV Subscription Plans 2026 | Cheapest & Best | StreamStick Pro",
      description:
        meta.description ||
        "Reloaded Fire TV plans from $11/mo: 18K+ live channels, 4K sports, PPV, 99.9% uptime. Cancel anytime. 36hr trial for subscription plans. StreamStick Pro.",
      path: meta.path || "/pricing",
    });

    const loadCmsPricing = async () => {
      try {
        const response = await apiCall("/api/cms/pricing");
        if (!response.ok) return;
        const result = await response.json();
        const data = result?.data;
        if (!data || typeof data !== "object") return;

        const nextPricing: CmsPricingPayload = {
          meta: data.meta && typeof data.meta === "object" ? data.meta : DEFAULT_PRICING.meta,
          hero: data.hero && typeof data.hero === "object" ? data.hero : DEFAULT_PRICING.hero,
          plans: Array.isArray(data.plans) && data.plans.length > 0 ? data.plans : DEFAULT_PRICING.plans,
          faq: data.faq && typeof data.faq === "object" ? data.faq : DEFAULT_PRICING.faq,
        };

        setCmsPricing(nextPricing);
        if (nextPricing.meta) {
          setPageMeta({
            title:
              nextPricing.meta.title ||
              "Reloaded Fire TV Subscription Plans 2026 | Cheapest & Best | StreamStick Pro",
            description:
              nextPricing.meta.description ||
              "Reloaded Fire TV plans from $11/mo: 18K+ live channels, 4K sports, PPV, 99.9% uptime. Cancel anytime. 36hr trial for subscription plans. StreamStick Pro.",
            path: nextPricing.meta.path || "/pricing",
          });
        }
      } catch (error) {
        console.warn("Using default pricing CMS content:", error);
      }
    };

    loadCmsPricing();
  }, []);

  const faqItems = useMemo(
    () =>
      (cmsPricing.faq?.items || DEFAULT_PRICING.faq?.items || []).filter(
        (item): item is { question: string; answer: string } =>
          Boolean(item?.question?.trim() && item?.answer?.trim()),
      ),
    [cmsPricing.faq?.items],
  );

  const plans = useMemo(
    () => (cmsPricing.plans && cmsPricing.plans.length > 0 ? cmsPricing.plans : DEFAULT_PRICING.plans || []),
    [cmsPricing.plans],
  );

  const hero = cmsPricing.hero || DEFAULT_PRICING.hero;
  const title = hero?.title || "Reloaded Fire TV Pricing";
  const description = hero?.description || "Subscription tiers. 18K+ channels.";
  const trialCtaLabel = hero?.trialCtaLabel || "Start 36hr subscription trial";
  const trialCtaHref = hero?.trialCtaHref || "/36hr-trial";

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <PillarLayout title={title} description={description} breadcrumbs={breadcrumbs}>
        <p className="text-gray-200 mb-8">{description}</p>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan, index) => {
            const highlighted = plan.highlighted === true;
            const wrapperClass = highlighted
              ? "rounded-2xl border border-orange-400 bg-orange-500/10 p-6"
              : "rounded-2xl border border-white/20 bg-white/5 p-6";

            return (
              <div key={`${plan.title || "plan"}-${index}`} className={wrapperClass}>
                {plan.badge ? <p className="text-orange-400 font-bold text-sm mb-2">{plan.badge}</p> : null}
                <h3 className="text-xl font-bold text-white">{plan.title || "Plan"}</h3>
                <p className="text-3xl font-black text-white mt-2">
                  {plan.priceText || "$0"}
                  {plan.periodText ? <span className="text-lg text-gray-400">{plan.periodText}</span> : null}
                </p>
                <ul className="mt-4 space-y-2 text-gray-200 text-sm">
                  {(plan.features || []).map((feature, featureIndex) => (
                    <li key={`${feature}-${featureIndex}`} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={plan.ctaHref || "/shop"}>
                  <span className="mt-6 inline-flex items-center justify-center w-full py-3 rounded-xl bg-orange-500 text-white font-semibold">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {plan.ctaLabel || "View Shop"}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
        <p className="text-center mb-12">
          <Link href={trialCtaHref}>
            <span className="text-orange-400 font-semibold hover:underline">{trialCtaLabel}</span>
          </Link>
        </p>

        <h2 className="text-2xl font-bold text-white mb-6">{cmsPricing.faq?.title || DEFAULT_PRICING.faq?.title || "Frequently Asked Questions"}</h2>
        <div className="space-y-4 mb-8">
          {faqItems.map((item, i) => (
            <details key={i} className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <summary className="cursor-pointer p-4 font-semibold text-white hover:bg-white/5 transition-colors list-none flex items-center justify-between">
                {item.question}
                <span className="text-orange-400 group-open:rotate-45 transition-transform text-xl ml-2">+</span>
              </summary>
              <div className="px-4 pb-4 text-gray-300 text-sm leading-relaxed">{item.answer}</div>
            </details>
          ))}
        </div>
      </PillarLayout>
      <SEOSchema faq={faqItems} />
    </>
  );
}
