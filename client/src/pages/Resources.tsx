/**
 * Phase 11: Link magnet hub — 1,000+ backlink-attraction assets.
 * Complete 18,000+ IPTV Channel Directory, Setup Encyclopedia, App Comparison, Free Resources.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout } from "@/components/PillarLayout";

const SITE_URL = "https://streamstickpro.com";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Resources", href: "/resources" },
];

export default function Resources() {
  useEffect(() => {
    document.title = "IPTV & Fire Stick Resources | 18K+ Channel Directory & Guides | StreamStickPro";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Complete 18,000+ IPTV channel directory, Jailbroken Fire Stick setup encyclopedia, IPTV app comparison matrix, and free streaming resources. StreamStickPro.");
  }, []);

  return (
    <PillarLayout
      title="IPTV & Fire Stick Resources"
      description="Link magnets and free resources: channel directory, setup guides, app comparison, and streaming tools."
      breadcrumbs={breadcrumbs}
    >
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">Complete 18,000+ IPTV Channel Directory</h2>
        <p className="text-gray-300 mb-4">
          StreamStickPro delivers 18,000+ live TV channels including sports, news, entertainment, and international content. Use our channel list with TiviMate, IPTV Smarters, or Perfect Player on Fire Stick and Google TV.
        </p>
        <Link href="/iptv-services">
          <span className="text-orange-400 hover:underline font-medium">View IPTV Services Guide →</span>
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">Jailbroken Fire Stick 2026 Setup Encyclopedia</h2>
        <p className="text-gray-300 mb-4">
          Step-by-step setup for pre-loaded Fire Sticks: Kodi, Stremio, and live TV in 10 minutes. StreamStickPro ships devices ready to stream 18,000+ channels and 100,000+ movies.
        </p>
        <Link href="/jailbroken-fire-sticks">
          <span className="text-orange-400 hover:underline font-medium">Jailbroken Fire Sticks Guide →</span>
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">Google TV IPTV App Comparison Matrix</h2>
        <p className="text-gray-300 mb-4">
          Compare TiviMate, IPTV Smarters, Perfect Player, VLC, and Kodi for IPTV on Google TV and Chromecast. EPG, M3U, recording, and multi-device support.
        </p>
        <Link href="/iptv-media-players">
          <span className="text-orange-400 hover:underline font-medium">IPTV Media Players & Apps →</span>
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">IPTV Catalog API &amp; Data for Webmasters</h2>
        <p className="text-gray-300 mb-4">
          Use our 93K+ catalog stats on your site. Free API, link to us—backlink-friendly. Perfect for streaming guides and tech blogs.
        </p>
        <Link href="/tools/catalog">
          <span className="text-orange-400 hover:underline font-medium">Tools: Catalog API &amp; Link to Us →</span>
        </Link>
      </section>

      <section className="mb-10">
        <h2 id="explore-by-location" className="text-2xl font-bold text-white mb-3">Explore by location</h2>
        <p className="text-gray-300 mb-4">
          IPTV, jailbroken Fire Sticks, unlocked devices, and ONN Google TV by city and region. 40,000+ location guides with unique meta and internal links.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
          {[
            { loc: "Houston", country: "usa", type: "iptv" },
            { loc: "New York", country: "usa", type: "iptv" },
            { loc: "Los Angeles", country: "usa", type: "jailbreak" },
            { loc: "Chicago", country: "usa", type: "google" },
            { loc: "Phoenix", country: "usa", type: "unlocked" },
            { loc: "Philadelphia", country: "usa", type: "onn" },
            { loc: "San Antonio", country: "usa", type: "iptv" },
            { loc: "San Diego", country: "usa", type: "jailbreak" },
            { loc: "Dallas", country: "usa", type: "google" },
            { loc: "Toronto", country: "ca", type: "iptv" },
            { loc: "Vancouver", country: "ca", type: "jailbreak" },
            { loc: "Montreal", country: "ca", type: "google" },
            { loc: "London", country: "uk", type: "iptv" },
            { loc: "Birmingham", country: "uk", type: "jailbreak" },
            { loc: "Houston", country: "usa", type: "unlocked" },
            { loc: "Miami", country: "usa", type: "onn" },
          ].map(({ loc, country, type }) => {
            const slug = loc.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link key={`${country}-${type}-${slug}`} href={`/l/${country}/${type}/${slug}`}>
                <span className="text-orange-400 hover:text-orange-300 hover:underline">{loc} – {type}</span>
              </Link>
            );
          })}
        </div>
        <p className="text-gray-500 text-sm mt-3">
          <Link href="/ultimate-iptv-catalog-2026"><span className="text-orange-400 hover:underline">Explore 93K catalog</span></Link>
          {" · "}
          <Link href="/l/usa/iptv/houston"><span className="text-orange-400 hover:underline">Sample: Houston IPTV</span></Link>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">2,000+ Free IPTV &amp; Streaming Resources</h2>
        <p className="text-gray-300 mb-4">
          Free trials, setup tutorials, cord-cutting guides, and device comparisons. StreamStickPro blog and pillar guides cover Fire Stick, Google TV, and IPTV from A to Z.
        </p>
        <Link href="/blog">
          <span className="text-orange-400 hover:underline font-medium">Blog &amp; Guides →</span>
        </Link>
      </section>

      <section className="mt-12 p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30">
        <h2 className="text-2xl font-bold text-white mb-2">Ready to stream?</h2>
        <p className="text-gray-300 mb-4">
          18,000+ channels, 100,000+ movies. Fire Sticks and IPTV plans. Free trial available.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/"><span className="inline-block px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium">Home</span></Link>
          <Link href="/shop"><span className="inline-block px-4 py-2 border border-white/30 text-white hover:bg-white/10 rounded-lg font-medium">Shop</span></Link>
          <Link href="/iptv-services"><span className="inline-block px-4 py-2 border border-white/30 text-white hover:bg-white/10 rounded-lg font-medium">IPTV Guide</span></Link>
        </div>
      </section>
    </PillarLayout>
  );
}
