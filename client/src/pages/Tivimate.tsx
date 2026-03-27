import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { HowToSchema } from "@/components/SEOSchema";
import { Check } from "lucide-react";
import { setPageMeta } from "@/lib/seo";
import { APP_IMAGES, getImageForSlot, fullImageUrl } from "@/data/seo-images";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "TiviMate", href: "/tivimate" },
];

export default function Tivimate() {
  useEffect(() => {
    const ogImg = fullImageUrl(getImageForSlot(APP_IMAGES, 1).src);
    setPageMeta({
      title: "TiviMate IPTV Setup 2026 | 5 Min Guide | StreamStick Pro",
      description: "TiviMate IPTV setup 2026: use StreamStickPro with TiviMate on Fire Stick, Android, Onn. 18K+ channels, 36hr subscription trial. 5-min guide—best IPTV for TiviMate.",
      path: "/tivimate",
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
    { name: "Get credentials", text: "Sign up for the 36hr subscription trial or a paid subscription at StreamStickPro to get your M3U or Xtream Codes." },
    { name: "Install TiviMate", text: "Install TiviMate on your Fire Stick, Onn Google TV, or Android TV device." },
    { name: "Add playlist", text: "Add your M3U playlist or enter Xtream Codes in TiviMate settings." },
    { name: "Enjoy", text: "Use the premium EPG and DVR features with 18K+ live channels and 100K+ VOD." },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <HowToSchema
        name="TiviMate IPTV Setup 2026"
        description="How to set up TiviMate with StreamStickPro: get credentials, install TiviMate, add playlist, enjoy 18K+ channels."
        steps={howToSteps}
        totalTime="PT5M"
      />
      <PillarLayout
        title="TiviMate – Premium IPTV App Setup"
        description="StreamStickPro works with TiviMate. Premium setup guide for Fire Stick, Onn, Android. 18K+ channels. Start 36hr subscription trial or shop plans."
        breadcrumbs={breadcrumbs}
      >
        <p className="text-gray-200 mb-6">
          <strong className="text-white">TiviMate</strong> is a premium IPTV player with a great EPG and DVR. StreamStickPro is the best IPTV to use with TiviMate: we deliver an optimized stream and full channel list (18K+ live, 100K+ VOD).
        </p>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(APP_IMAGES, 1).src} alt={getImageForSlot(APP_IMAGES, 1).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <h2 id="setup">TiviMate + StreamStickPro Setup</h2>
        <ol className="list-decimal list-inside text-gray-200 space-y-2 mb-6">
          <li>Get your credentials: <Link href="/36hr-trial"><span className="text-orange-400 hover:underline">36hr subscription trial</span></Link> or <Link href="/shop"><span className="text-orange-400 hover:underline">subscription</span></Link>.</li>
          <li>Install TiviMate on your device (Fire Stick, Onn, Android TV).</li>
          <li>Add playlist (M3U) or use Xtream Codes in TiviMate.</li>
          <li>Enjoy premium EPG and recording (where supported).</li>
        </ol>
        <p className="flex items-center gap-2 text-green-300 mb-6"><Check className="w-5 h-5" /> Optimized for TiviMate—no “basic” support; full channel and VOD access.</p>
        <p>
          <Link href="/36hr-trial"><span className="text-orange-400 font-semibold hover:underline">Start 36hr subscription trial →</span></Link>
          {" · "}
          <Link href="/iptv-smarters-pro"><span className="text-orange-400 font-semibold hover:underline">IPTV Smarters Pro guide →</span></Link>
        </p>
      </PillarLayout>
    </>
  );
}
