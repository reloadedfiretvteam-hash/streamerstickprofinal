import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { Check, X, Gift } from "lucide-react";
import { competitorDisplayName } from "@/data/crushCompetitors";

export default function VsCompetitor() {
  const [, params] = useRoute("/vs-:competitor");
  const slug = params?.competitor ?? "";
  const name = competitorDisplayName(slug);

  useEffect(() => {
    const title = `StreamStickPro vs ${name} 2026 | Why We Win | StreamStick Pro`;
    document.title = title.length > 60 ? title.slice(0, 57) + "..." : title;
    const meta = document.querySelector('meta[name="description"]');
    const desc = `${name} alternative. StreamStick Pro 36hr trial beats ${name}. Compare trial, channels, Onn TV, Smarters Pro, price. We win.`;
    if (meta) meta.setAttribute("content", desc.length > 160 ? desc.slice(0, 157) + "..." : desc);
  }, [name]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: `vs ${name}`, href: `/vs-${slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <PillarLayout
        title={`StreamStickPro vs ${name} 2026 - Why We WIN`}
        description={`${name} alternative. StreamStickPro 36hr trial beats ${name}. Compare and get the trial ${name} can't match.`}
        breadcrumbs={breadcrumbs}
      >
        <p className="text-gray-200 mb-8">
          Comparing StreamStickPro to {name}. See why customers switch: 36hr trial, 18K+ channels, native Onn/Roku support, IPTV Smarters Pro optimized, best price.
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
          <h2 className="text-xl font-bold text-white mb-2">Get the 36hr trial {name} can't match</h2>
          <Link href="/36hr-trial">
            <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg">
              <Gift className="w-6 h-6" /> Start 36hr Trial
            </span>
          </Link>
        </div>

        <p className="text-gray-400 text-sm">
          <Link href="/">Home</Link> · <Link href="/vs-iptvstronger">vs IPTVStronger</Link> · <Link href="/vs-troypoint">vs TroyPoint</Link> · <Link href="/36hr-trial">36hr Trial</Link>
        </p>
      </PillarLayout>
    </>
  );
}
