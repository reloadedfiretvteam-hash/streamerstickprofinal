import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { SEOSchema } from "@/components/SEOSchema";
import { Check } from "lucide-react";
import { setPageMeta } from "@/lib/seo";

export const CATALOG_DATA = {
  channels: { usa: 847, france: 623, mexico: 456, india: 1247, total: 18000 },
  movies: 60237,
  series: 15423,
  languages: 89,
  countries: 195,
  devices: 7,
};

const SITE = "https://streamstickpro.com";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Ultimate IPTV Catalog 2026", href: "/ultimate-iptv-catalog-2026" },
];

const faq = [
  { question: "How many channels does the catalog include?", answer: `The StreamStickPro catalog includes ${CATALOG_DATA.channels.total.toLocaleString()} live TV channels, ${CATALOG_DATA.movies.toLocaleString()} movies, and ${CATALOG_DATA.series.toLocaleString()} series across ${CATALOG_DATA.countries} countries and ${CATALOG_DATA.languages} languages.` },
  { question: "Does the catalog work on ONN Google TV?", answer: "Yes. The catalog is optimized for ONN 4K and ONN 4K Pro. Channel compatibility and device scores are shown per country." },
  { question: "Does the catalog work on Fire Stick?", answer: "Yes. Fire Stick HD, 4K, and 4K Max are fully supported. Device scores and compatibility are listed in the catalog." },
  { question: "What is the subscription ROI?", answer: "At $14.99/mo you get access to 93K+ items (18K channels, 60K movies, 15K series). That equals thousands of hours of content per dollar." },
  { question: "Can I export the catalog for my app?", answer: "The catalog data is available for subscribers. Use IPTV Smarters Pro, TiviMate, or other apps with your M3U or Xtream credentials." },
];

export default function UltimateIptvCatalog() {
  useEffect(() => {
    const desc = `Ultimate IPTV catalog 2026: ${CATALOG_DATA.channels.total.toLocaleString()} live channels, ${CATALOG_DATA.movies.toLocaleString()} movies, ${CATALOG_DATA.series.toLocaleString()} series. ONN & Fire Stick. $14.99/mo. StreamStick Pro.`;
    setPageMeta({
      title: "Ultimate IPTV Catalog 2026 | 18K Channels, 60K Movies | StreamStick Pro",
      description: desc,
      path: "/ultimate-iptv-catalog-2026",
    });
  }, []);

  const roiHours = Math.round((CATALOG_DATA.movies + CATALOG_DATA.series * 10) * 1.5 / 1000);
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "StreamStickPro IPTV Catalog 2026",
    "description": `${CATALOG_DATA.channels.total.toLocaleString()} live TV channels, ${CATALOG_DATA.movies.toLocaleString()} movies, ${CATALOG_DATA.series.toLocaleString()} series. ONN and Fire Stick optimized.`,
    "url": `${SITE}/ultimate-iptv-catalog-2026`,
    "license": "https://streamstickpro.com/terms",
    "creator": { "@type": "Organization", "name": "StreamStickPro", "url": SITE },
    "distribution": [{ "@type": "DataDownload", "encodingFormat": "application/json", "contentUrl": `${SITE}/api/catalog-summary` }],
    "includedInDataCatalog": { "@type": "DataCatalog", "name": "StreamStickPro Catalog", "url": SITE },
  };

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: SITE + b.href }))} />
      <SEOSchema faq={faq} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <PillarLayout
        title="18K Live TV + 60K Movies ONN & Fire Stick | Ultimate IPTV Catalog 2026"
        description={`${CATALOG_DATA.channels.total.toLocaleString()} channels, ${CATALOG_DATA.movies.toLocaleString()} movies, ${CATALOG_DATA.series.toLocaleString()} series. ONN & Fire Stick. $14.99/mo 99.9% uptime.`}
        breadcrumbs={breadcrumbs}
      >
        <div className="rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">93K+ content catalog</h2>
          <p className="text-gray-200 mb-4">
            Live TV, movies, and series on ONN Google TV and Fire Stick. One subscription, one catalog.
          </p>
          <Link href="/36hr-trial">
            <span className="inline-flex items-center px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold">Explore 93K Catalog – Start 36hr Trial</span>
          </Link>
        </div>

        <h2 id="catalog-numbers">Catalog at a glance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-white/10 border border-white/20 p-4">
            <div className="text-orange-400 font-bold text-2xl">{CATALOG_DATA.channels.total.toLocaleString()}</div>
            <div className="text-gray-300 text-sm">Live TV channels</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/20 p-4">
            <div className="text-purple-400 font-bold text-2xl">{CATALOG_DATA.movies.toLocaleString()}</div>
            <div className="text-gray-300 text-sm">Movies</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/20 p-4">
            <div className="text-blue-400 font-bold text-2xl">{CATALOG_DATA.series.toLocaleString()}</div>
            <div className="text-gray-300 text-sm">Series</div>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/20 p-4">
            <div className="text-green-400 font-bold text-2xl">{CATALOG_DATA.countries}</div>
            <div className="text-gray-300 text-sm">Countries</div>
          </div>
        </div>

        <h2 id="by-country">Top countries (channel count)</h2>
        <div className="overflow-x-auto mb-8">
          <table className="w-full border border-white/20 rounded-xl text-left">
            <thead><tr className="bg-white/10"><th className="p-3 text-white font-bold">Country</th><th className="p-3 text-white font-bold">Channels</th></tr></thead>
            <tbody className="text-gray-200">
              <tr className="border-t border-white/10"><td className="p-3">USA</td><td className="p-3">{CATALOG_DATA.channels.usa}</td></tr>
              <tr className="border-t border-white/10"><td className="p-3">France</td><td className="p-3">{CATALOG_DATA.channels.france}</td></tr>
              <tr className="border-t border-white/10"><td className="p-3">Mexico</td><td className="p-3">{CATALOG_DATA.channels.mexico}</td></tr>
              <tr className="border-t border-white/10"><td className="p-3">India</td><td className="p-3">{CATALOG_DATA.channels.india}</td></tr>
            </tbody>
          </table>
        </div>

        <h2 id="devices">ONN vs Fire Stick compatibility</h2>
        <p className="text-gray-200 mb-4">All catalog content is available on both ONN Google TV and Fire Stick. Device scores (1–5) indicate optimization.</p>
        <div className="flex flex-wrap gap-3 mb-8">
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white"><Check className="w-5 h-5 text-green-400" /> ONN 4K / 4K Pro</span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white"><Check className="w-5 h-5 text-green-400" /> Fire Stick HD / 4K / 4K Max</span>
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white"><Check className="w-5 h-5 text-green-400" /> Smart TVs</span>
        </div>

        <h2 id="roi">Subscription ROI</h2>
        <p className="text-gray-200 mb-4">
          At $14.99/mo you get access to the full catalog: 18K channels, 60K movies, 15K series. That is over {roiHours}K hours of content for less than the cost of one movie ticket per month.
        </p>

        <h2 id="faq">Catalog FAQ</h2>
        <ul className="space-y-3 text-gray-200">
          {faq.map((item, i) => (
            <li key={i}><strong className="text-white">{item.question}</strong> — {item.answer}</li>
          ))}
        </ul>

        <p className="mt-8">
          <Link href="/36hr-trial"><span className="text-orange-400 font-semibold hover:underline">Start 36hr trial</span></Link>
          {" · "}
          <Link href="/shop"><span className="text-orange-400 font-semibold hover:underline">Shop plans</span></Link>
          {" · "}
          <Link href="/onn-google-tv"><span className="text-orange-400 font-semibold hover:underline">ONN setup</span></Link>
        </p>
      </PillarLayout>
    </>
  );
}
