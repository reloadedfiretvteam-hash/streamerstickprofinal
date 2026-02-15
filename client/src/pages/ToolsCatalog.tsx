/**
 * Backlink magnet: IPTV catalog API & channel data for webmasters.
 * Other sites can link here, use our stats, or call the API.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { ExternalLink } from "lucide-react";
import { setPageMeta } from "@/lib/seo";

const SITE_URL = "https://streamstickpro.com";
const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Tools", href: "/tools/catalog" },
  { label: "IPTV Catalog API", href: "/tools/catalog" },
];

export default function ToolsCatalog() {
  useEffect(() => {
    setPageMeta({
      title: "IPTV Catalog API & Channel Data for Webmasters | StreamStickPro",
      description: "Use StreamStick Pro 93K+ IPTV catalog data on your site. Free API, channel counts, embed. Backlink-friendly resource for IPTV and streaming.",
      path: "/tools/catalog",
    });
  }, []);

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: SITE_URL + b.href }))} />
      <PillarLayout
        title="IPTV Catalog API & Channel Data for Webmasters"
        description="Use our 93K+ IPTV catalog stats and channel data on your site. Free API, link to us, or embed—built for backlinks and partnerships."
        breadcrumbs={breadcrumbs}
      >
        <section className="mb-8">
          <h2 id="api" className="text-2xl font-bold text-white mb-3">Catalog summary API</h2>
          <p className="text-gray-300 mb-2">
            JSON endpoint with live channel, movie, and series counts. No key required for read-only stats.
          </p>
          <code className="block p-4 bg-gray-800 rounded-lg text-green-400 text-sm break-all">
            {SITE_URL}/api/catalog-summary
          </code>
          <a
            href={`${SITE_URL}/api/catalog-summary`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 text-orange-400 hover:underline"
          >
            Open in new tab <ExternalLink className="w-4 h-4" />
          </a>
        </section>

        <section className="mb-8">
          <h2 id="link-to-us" className="text-2xl font-bold text-white mb-3">Link to this page</h2>
          <p className="text-gray-300 mb-4">
            We welcome links from streaming guides, cord-cutting blogs, and tech sites. Suggested anchor text:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-1 mb-4">
            <li>StreamStickPro IPTV catalog</li>
            <li>93K+ IPTV channel data</li>
            <li>IPTV catalog API</li>
            <li>Streaming channel list by country</li>
          </ul>
          <p className="text-gray-400 text-sm">
            URL: <code className="bg-gray-800 px-1 rounded">{SITE_URL}/tools/catalog</code>
          </p>
        </section>

        <section className="mb-8">
          <h2 id="data" className="text-2xl font-bold text-white mb-3">What’s in the catalog</h2>
          <p className="text-gray-300 mb-4">
            StreamStickPro’s catalog includes 18,000+ live TV channels, 60,000+ movies, and 15,000+ series—with country and category breakdowns. Use our <Link href="/ultimate-iptv-catalog-2026"><span className="text-orange-400 hover:underline">Ultimate IPTV Catalog 2026</span></Link> page for the full explorer.
          </p>
        </section>

        <section className="border-t border-gray-700 pt-8">
          <p className="text-gray-400 mb-4">
            Back to main site:
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/"><span className="text-orange-400 hover:underline">Home</span></Link>
            <Link href="/shop"><span className="text-orange-400 hover:underline">Shop</span></Link>
            <Link href="/36hr-trial"><span className="text-orange-400 hover:underline">36hr Free Trial</span></Link>
            <Link href="/resources"><span className="text-orange-400 hover:underline">Resources</span></Link>
            <Link href="/ultimate-iptv-catalog-2026"><span className="text-orange-400 hover:underline">93K Catalog</span></Link>
          </div>
        </section>
      </PillarLayout>
    </>
  );
}
