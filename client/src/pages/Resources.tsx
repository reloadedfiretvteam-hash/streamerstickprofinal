/**
 * Phase 11: Link magnet hub — 1,000+ backlink-attraction assets.
 * Complete 18,000+ Reloaded Fire TV channel directory, setup encyclopedia, app comparison, free resources.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout } from "@/components/PillarLayout";
import { setPageMeta } from "@/lib/seo";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Resources", href: "/resources" },
];

export default function Resources() {
  useEffect(() => {
    setPageMeta({
      title: "Reloaded Fire TV Resources 2026 | Channel Directory & Setup Guides | StreamStick Pro",
      description: "Complete 18,000+ Reloaded Fire TV channel directory, Fire Stick setup guides, media app comparison, and free streaming resources. StreamStick Pro.",
      path: "/resources",
    });
  }, []);

  return (
    <PillarLayout
      title="Reloaded Fire TV & Fire Stick Resources"
      description="Link magnets and free resources: channel directory, setup guides, app comparison, and streaming tools."
      breadcrumbs={breadcrumbs}
    >
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">Complete 18,000+ Reloaded Fire TV Channel Directory</h2>
        <p className="text-gray-300 mb-4">
          StreamStickPro delivers 18,000+ live TV channels including sports, news, entertainment, and international content. Use our channel list with TiviMate, Smarters, or Perfect Player on Fire Stick and Google TV.
        </p>
        <Link href="/iptv">
          <span className="text-orange-400 hover:underline font-medium">View Reloaded Fire TV Services Guide →</span>
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">Fire Stick 2026 Setup Encyclopedia</h2>
        <p className="text-gray-300 mb-4">
          Step-by-step setup for Fire Stick: Kodi, Stremio, and live TV in about 10 minutes. StreamStickPro provides clear setup guidance for 18,000+ channels and 100,000+ movies.
        </p>
        <Link href="/jailbroken-fire-sticks">
          <span className="text-orange-400 hover:underline font-medium">Jailbroken Fire Sticks Guide →</span>
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">Google TV Media App Comparison Matrix</h2>
        <p className="text-gray-300 mb-4">
          Compare TiviMate, Smarters, Perfect Player, VLC, and Kodi for Reloaded Fire TV on Google TV and Chromecast. EPG, M3U, recording, and multi-device support.
        </p>
        <Link href="/iptv-media-players">
          <span className="text-orange-400 hover:underline font-medium">Reloaded Fire TV Media Players & Apps →</span>
        </Link>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">Reloaded Fire TV Catalog API &amp; Data for Webmasters</h2>
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
          Reloaded Fire TV, Fire Stick options, and ONN Google TV by city and region. 40,000+ location guides with unique meta and internal links.
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
          <Link href="/l/usa/iptv/houston"><span className="text-orange-400 hover:underline">Sample: Houston Reloaded Fire TV</span></Link>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">2,000+ Free Reloaded Fire TV &amp; Streaming Resources</h2>
        <p className="text-gray-300 mb-4">
          Free trials, setup tutorials, cord-cutting guides, and device comparisons. StreamStickPro blog and pillar guides cover Fire Stick, Google TV, and Reloaded Fire TV from A to Z.
        </p>
        <Link href="/blog">
          <span className="text-orange-400 hover:underline font-medium">Blog &amp; Guides →</span>
        </Link>
      </section>

      <section className="mt-12 p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30">
        <h2 className="text-2xl font-bold text-white mb-2">Ready to stream?</h2>
        <p className="text-gray-300 mb-4">
          18,000+ channels, 100,000+ movies. Fire Sticks and Reloaded Fire TV plans. Free trial available.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/"><span className="inline-block px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium">Home</span></Link>
          <Link href="/shop"><span className="inline-block px-4 py-2 border border-white/30 text-white hover:bg-white/10 rounded-lg font-medium">Shop</span></Link>
          <Link href="/iptv"><span className="inline-block px-4 py-2 border border-white/30 text-white hover:bg-white/10 rounded-lg font-medium">Reloaded Fire TV Guide</span></Link>
        </div>
      </section>
    </PillarLayout>
  );
}
