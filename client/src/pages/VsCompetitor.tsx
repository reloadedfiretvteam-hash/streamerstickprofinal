import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { Check, X, Gift } from "lucide-react";
import { competitorDisplayName } from "@/data/crushCompetitors";
import { setPageMeta } from "@/lib/seo";

export default function VsCompetitor() {
  const [, params] = useRoute("/vs-:competitor");
  const slug = params?.competitor ?? "";
  const name = competitorDisplayName(slug);

  useEffect(() => {
    setPageMeta({
      title: `StreamStickPro vs ${name} 2026 | Why We Win | StreamStick Pro`,
      description: `${name} alternative. StreamStick Pro 36hr subscription trial beats ${name}. Compare trial, channels, Onn TV, Smarters Pro, price. We win.`,
      path: `/vs-${slug}`,
    });
  }, [name, slug]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: `vs ${name}`, href: `/vs-${slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <PillarLayout
        title={`StreamStickPro vs ${name} 2026 - Why We WIN`}
        description={`${name} alternative. StreamStickPro 36hr subscription trial beats ${name}. Compare and get the trial ${name} can't match.`}
        breadcrumbs={breadcrumbs}
      >
        <p className="text-gray-200 mb-8">
          Comparing StreamStickPro to {name}. See why customers switch: 36hr subscription trial, 18K+ channels, native Onn/Roku support, IPTV Smarters Pro optimized, best price.
        </p>

        <div className="overflow-x-auto mb-10">
          <table className="w-full border border-white/20 rounded-xl text-left">
            <thead>
              <tr className="bg-white/10">
                <th className="p-3 text-white font-bold">Feature</th>
                <th className="p-3 text-green-400 font-bold">StreamStickPro</th>
                <th className="p-3 text-gray-400 font-bold">{name}</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              <tr className="border-t border-white/10"><td className="p-3">Free Trial</td><td className="p-3 text-green-300"><Check className="w-5 h-5 inline" /> 36hr</td><td className="p-3 text-red-300"><X className="w-5 h-5 inline" /> 24hr or less</td></tr>
              <tr className="border-t border-white/10"><td className="p-3">Channels</td><td className="p-3 text-green-300"><Check className="w-5 h-5 inline" /> 18K+</td><td className="p-3 text-red-300"><X className="w-5 h-5 inline" /> Fewer</td></tr>
              <tr className="border-t border-white/10"><td className="p-3">Onn Google TV</td><td className="p-3 text-green-300"><Check className="w-5 h-5 inline" /> Native</td><td className="p-3 text-red-300"><X className="w-5 h-5 inline" /> Limited</td></tr>
              <tr className="border-t border-white/10"><td className="p-3">Roku</td><td className="p-3 text-green-300"><Check className="w-5 h-5 inline" /> Native</td><td className="p-3 text-red-300"><X className="w-5 h-5 inline" /> Hacky</td></tr>
              <tr className="border-t border-white/10"><td className="p-3">IPTV Smarters Pro</td><td className="p-3 text-green-300"><Check className="w-5 h-5 inline" /> Optimized</td><td className="p-3 text-red-300"><X className="w-5 h-5 inline" /> Basic</td></tr>
              <tr className="border-t border-white/10"><td className="p-3">Price</td><td className="p-3 text-green-300"><Check className="w-5 h-5 inline" /> Cheapest</td><td className="p-3 text-red-300"><X className="w-5 h-5 inline" /> Expensive</td></tr>
            </tbody>
          </table>
        </div>

        <div className="p-6 rounded-2xl bg-orange-500/20 border border-orange-400/30 text-center mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Get the 36hr subscription trial {name} can't match</h2>
          <Link href="/36hr-trial">
            <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg">
              <Gift className="w-6 h-6" /> Start 36hr Subscription Trial
            </span>
          </Link>
        </div>

        <div className="text-gray-400 text-sm space-y-2">
          <p className="font-medium text-gray-300">Compare us to others:</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <Link href="/vs-troypoint"><span className="hover:text-orange-400">vs TroyPoint</span></Link>·
            <Link href="/vs-youtube-tv"><span className="hover:text-orange-400">vs YouTube TV</span></Link>·
            <Link href="/vs-hulu-live"><span className="hover:text-orange-400">vs Hulu Live</span></Link>·
            <Link href="/vs-fubo-tv"><span className="hover:text-orange-400">vs FuboTV</span></Link>·
            <Link href="/vs-sling-tv"><span className="hover:text-orange-400">vs Sling TV</span></Link>·
            <Link href="/vs-kodi"><span className="hover:text-orange-400">vs Kodi</span></Link>·
            <Link href="/vs-roku"><span className="hover:text-orange-400">vs Roku</span></Link>·
            <Link href="/vs-iptvstronger"><span className="hover:text-orange-400">vs IPTVStronger</span></Link>·
            <Link href="/vs-downloader-app"><span className="hover:text-orange-400">vs Downloader App</span></Link>·
            <Link href="/vs-nvidia-shield"><span className="hover:text-orange-400">vs NVIDIA Shield</span></Link>·
            <Link href="/36hr-trial"><span className="text-orange-400 font-semibold">Start 36hr Trial</span></Link>
          </div>
        </div>
      </PillarLayout>
    </>
  );
}
