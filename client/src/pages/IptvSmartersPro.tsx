import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { Check } from "lucide-react";
import { APP_IMAGES, getImageForSlot, fullImageUrl } from "@/data/seo-images";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "IPTV Smarters Pro", href: "/iptv-smarters-pro" },
];

export default function IptvSmartersPro() {
  useEffect(() => {
    document.title = "IPTV Smarters Pro Setup 2026 | 5 Min Guide | StreamStick Pro";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Use IPTV Smarters Pro with StreamStickPro. Optimized M3U, easy setup on Fire Stick, Onn, Smart TV. 36hr trial. Best IPTV for Smarters Pro.");
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(attr, name); document.head.appendChild(tag); }
      tag.setAttribute("content", content);
    };
    setMeta("og:image", fullImageUrl(getImageForSlot(APP_IMAGES, 0).src), true);
    setMeta("twitter:image", fullImageUrl(getImageForSlot(APP_IMAGES, 0).src));
  }, []);

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <PillarLayout
        title="IPTV Smarters Pro - Setup and Best IPTV"
        description="StreamStickPro is optimized for IPTV Smarters Pro. Get your M3U from our 36hr trial or subscription. Fire Stick, Onn, Smart TV supported."
        breadcrumbs={breadcrumbs}
      >
        <p className="text-gray-200 mb-6">
          IPTV Smarters Pro is one of the most popular IPTV apps. StreamStickPro is optimized for it: use your M3U or Xtream codes from our service and you are streaming in minutes.
        </p>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(APP_IMAGES, 0).src} alt={getImageForSlot(APP_IMAGES, 0).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <h2 id="setup">Setup with StreamStickPro</h2>
        <ol className="list-decimal list-inside text-gray-200 space-y-2 mb-6">
          <li>Sign up for a <Link href="/36hr-trial"><span className="text-orange-400 hover:underline">36hr free trial</span></Link> or buy a plan from our <Link href="/shop"><span className="text-orange-400 hover:underline">Shop</span></Link>.</li>
          <li>Install IPTV Smarters Pro on your Fire Stick, Onn Google TV, or Smart TV.</li>
          <li>Add your M3U URL or Xtream login in the app.</li>
          <li>Enjoy 18K+ channels and 100K+ VOD.</li>
        </ol>
        <p className="flex items-center gap-2 text-green-300 mb-6"><Check className="w-5 h-5" /> We support Smarters Pro on all major devices.</p>
        <p>
          <Link href="/36hr-trial"><span className="text-orange-400 font-semibold hover:underline">Start 36hr trial</span></Link>
          {" · "}
          <Link href="/tivimate"><span className="text-orange-400 font-semibold hover:underline">TiviMate guide</span></Link>
        </p>
      </PillarLayout>
    </>
  );
}
