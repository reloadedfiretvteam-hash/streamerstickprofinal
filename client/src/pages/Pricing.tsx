import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { setPageMeta } from "@/lib/seo";
import { SEOSchema } from "@/components/SEOSchema";
import { Check, ShoppingCart } from "lucide-react";

const PRICING_FAQ = [
  { question: "What is the cheapest Reloaded Fire TV plan?", answer: "The Starter plan is $11/month for 1 device with access to 18,000+ live channels, 100,000+ movies and series, premium sports, and 4K streaming. Multi-month plans reduce the cost even further." },
  { question: "Can I try before I buy?", answer: "Yes. Every Reloaded Fire TV subscription plan includes a free 36-hour trial. No credit card required — just enter your email, receive instant credentials, and test all channels and features before committing." },
  { question: "What is the best value Reloaded Fire TV plan?", answer: "The 1-year plan at $65 per device offers the best per-month rate at roughly $5.42/month. It includes the same 18K+ channels, 4K quality, and 24/7 support as shorter plans." },
  { question: "Can I use one plan on multiple devices?", answer: "Each plan is for 1 device connection at a time. If you need simultaneous streams on multiple TVs or devices, add extra device connections during checkout — multi-device plans are available for 2, 3, 4, or 5 devices." },
  { question: "How do I cancel my Reloaded Fire TV subscription?", answer: "Plans are one-time payments, not recurring subscriptions. There is nothing to cancel. When your plan expires, simply purchase a new plan if you want to continue." },
];

const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Pricing", href: "/pricing" }];

export default function Pricing() {
  useEffect(() => {
    setPageMeta({
      title: "Reloaded Fire TV Subscription Plans 2026 | Cheapest & Best | StreamStick Pro",
      description: "Reloaded Fire TV plans from $11/mo: 18K+ live channels, 4K sports, PPV, 99.9% uptime. Cancel anytime. 36hr trial for subscription plans. StreamStick Pro.",
      path: "/pricing",
    });
  }, []);

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <PillarLayout title="Reloaded Fire TV Pricing" description="Subscription tiers. 18K+ channels." breadcrumbs={breadcrumbs}>
        <p className="text-gray-200 mb-8">Plans from $11/mo. 18K+ channels, 100K+ VOD. Fire Stick, Onn, Smart TV, Smarters Pro, TiviMate.</p>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h3 className="text-xl font-bold text-white">Starter</h3>
            <p className="text-3xl font-black text-white mt-2">$11<span className="text-lg text-gray-400">/mo</span></p>
            <ul className="mt-4 space-y-2 text-gray-200 text-sm">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" /> 18K+ channels</li>
            </ul>
            <Link href="/shop"><span className="mt-6 inline-flex items-center justify-center w-full py-3 rounded-xl bg-orange-500 text-white font-semibold"><ShoppingCart className="w-4 h-4 mr-2" /> View Shop</span></Link>
          </div>
          <div className="rounded-2xl border border-orange-400 bg-orange-500/10 p-6">
            <p className="text-orange-400 font-bold text-sm mb-2">MOST POPULAR</p>
            <h3 className="text-xl font-bold text-white">Popular</h3>
            <p className="text-3xl font-black text-white mt-2">$25<span className="text-lg text-gray-400">/3 mo</span></p>
            <ul className="mt-4 space-y-2 text-gray-200 text-sm">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" /> 18K+ channels</li>
            </ul>
            <Link href="/shop"><span className="mt-6 inline-flex items-center justify-center w-full py-3 rounded-xl bg-orange-500 text-white font-semibold"><ShoppingCart className="w-4 h-4 mr-2" /> View Shop</span></Link>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h3 className="text-xl font-bold text-white">Best Value</h3>
            <p className="text-3xl font-black text-white mt-2">$65<span className="text-lg text-gray-400">/year</span></p>
            <ul className="mt-4 space-y-2 text-gray-200 text-sm">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400 shrink-0" /> 18K+ channels</li>
            </ul>
            <Link href="/shop"><span className="mt-6 inline-flex items-center justify-center w-full py-3 rounded-xl bg-orange-500 text-white font-semibold"><ShoppingCart className="w-4 h-4 mr-2" /> View Shop</span></Link>
          </div>
        </div>
        <p className="text-center mb-12"><Link href="/36hr-trial"><span className="text-orange-400 font-semibold hover:underline">Start 36hr subscription trial</span></Link></p>

        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-8">
          {PRICING_FAQ.map((item, i) => (
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
      <SEOSchema faq={PRICING_FAQ} />
    </>
  );
}
