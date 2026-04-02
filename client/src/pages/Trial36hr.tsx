import { useEffect } from "react";
import { Link } from "wouter";
import { FreeTrial } from "@/components/FreeTrial";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { Gift } from "lucide-react";
import { setPageMeta } from "@/lib/seo";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "36hr Free Trial", href: "/36hr-trial" },
];

export default function Trial36hr() {
  useEffect(() => {
    setPageMeta({
      title: "IPTV Free Trial 2026 | 36hr Instant Access | StreamStick Pro",
      description: "Start your 36-hour free IPTV trial. No credit card. Instant M3U. 18K+ channels. Beats IPTVStronger 24hr trial. StreamStick Pro.",
      path: "/36hr-trial",
    });
  }, []);

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <PillarLayout
        title="36 Hour FREE Trial - Instant M3U"
        description="Start your 36-hour IPTV trial. No credit card. Get instant M3U access to 18K+ channels. StreamStickPro beats IPTVStronger (36hr vs 24hr)."
        breadcrumbs={breadcrumbs}
      >
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Gift className="w-8 h-8 text-orange-400" />
            36 HOUR FREE TRIAL - 18K+ Channels Live Now
          </h2>
          <p className="text-gray-200">
            No credit card required. Enter your email and we will send your instant M3U so you can test on IPTV Smarters Pro, TiviMate, or any app. Beats IPTVStronger 24hr trial.
          </p>
        </div>
        <FreeTrial />
        <p className="mt-6 text-center text-gray-400">
          Prefer a device? <Link href="/devices"><span className="text-orange-400 hover:underline">View Firestick & ONN device options</span></Link> or <Link href="/shop"><span className="text-orange-400 hover:underline">view all plans</span></Link>.
        </p>
      </PillarLayout>
    </>
  );
}
