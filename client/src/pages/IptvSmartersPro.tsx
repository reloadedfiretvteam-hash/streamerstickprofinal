import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { HowToSchema } from "@/components/SEOSchema";
import { Check } from "lucide-react";
import { setPageMeta } from "@/lib/seo";
import { APP_IMAGES, getImageForSlot, fullImageUrl } from "@/data/seo-images";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "IPTV Smarters Pro", href: "/iptv-smarters-pro" },
];

export default function IptvSmartersPro() {
  useEffect(() => {
    const ogImg = fullImageUrl(getImageForSlot(APP_IMAGES, 0).src);
    setPageMeta({
      title: "IPTV Smarters Pro Setup 2026 | 5 Min Guide | StreamStick Pro",
      description: "IPTV Smarters Pro setup 2026: use StreamStickPro M3U on Fire Stick, Onn, Smart TV. 5-min guide. 36hr trial—best IPTV for Smarters Pro.",
      path: "/iptv-smarters-pro",
      ogImage: ogImg,
    });
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(attr, name); document.head.appendChild(tag); }
      tag.setAttribute("content", content);
    };
    setMeta("og:image", ogImg, true);
    setMeta("twitter:image", ogImg);
  }, []);

  const howToSteps = [
    { name: "Sign up", text: "Get a 36hr free trial or subscription from StreamStickPro to receive your M3U URL or Xtream Codes." },
    { name: "Install app", text: "Install IPTV Smarters Pro on your Fire Stick, ONN Google TV, or Smart TV from the app store or sideload." },
    { name: "Add credentials", text: "Add your M3U URL or Xtream login in IPTV Smarters Pro settings." },
    { name: "Stream", text: "Enjoy 18K+ live channels and 100K+ VOD with full Smarters Pro support." },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <HowToSchema
        name="IPTV Smarters Pro Setup 2026"
        description="How to set up IPTV Smarters Pro with StreamStickPro: get M3U, install app, add credentials, stream 18K+ channels."
        steps={howToSteps}
        totalTime="PT5M"
      />
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
