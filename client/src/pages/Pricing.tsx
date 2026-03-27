import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { setPageMeta } from "@/lib/seo";
import { Check, ShoppingCart } from "lucide-react";

const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Pricing", href: "/pricing" }];

export default function Pricing() {
  useEffect(() => {
    setPageMeta({
      title: "IPTV Subscription Plans 2026 | Cheapest & Best | StreamStick Pro",
      description: "IPTV plans from $15/mo: 18K+ live channels, 4K sports, PPV, 99.9% uptime. Cancel anytime. 36hr trial for subscription plans. StreamStick Pro.",
      path: "/pricing",
    });
  }, []);

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <PillarLayout title="IPTV Pricing" description="Subscription tiers. 18K+ channels." breadcrumbs={breadcrumbs}>
        <p className="text-gray-200 mb-8">Plans from $15/mo. 18K+ channels, 100K+ VOD. Fire Stick, Onn, Smart TV, Smarters Pro, TiviMate.</p>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
            <h3 className="text-xl font-bold text-white">Starter</h3>
            <p className="text-3xl font-black text-white mt-2">$15<span className="text-lg text-gray-400">/mo</span></p>
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
        <p className="text-center"><Link href="/36hr-trial"><span className="text-orange-400 font-semibold hover:underline">Start 36hr subscription trial</span></Link></p>
      </PillarLayout>
    </>
  );
}
