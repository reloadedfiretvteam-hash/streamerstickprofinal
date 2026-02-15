import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { setPageMeta } from "@/lib/seo";
import { Check } from "lucide-react";
import { ONN_IMAGES, getImageForSlot, fullImageUrl } from "@/data/seo-images";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Onn Google TV Setup", href: "/onn-google-tv" },
];

export default function OnnGoogleTv() {
  useEffect(() => {
    const ogImg = fullImageUrl(getImageForSlot(ONN_IMAGES, 0).src);
    setPageMeta({
      title: "IPTV ONN Google TV 2026 | Setup in 5 Min | StreamStick Pro",
      description: "Set up IPTV on Onn Google TV. Native support for Onn 4K and Onn Pro. 36hr trial, then subscribe. StreamStick Pro.",
      path: "/onn-google-tv",
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

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <PillarLayout
        title="Onn Google TV Setup - IPTV and Streaming"
        description="IPTV setup for Onn Google TV. Native support for Onn 4K and Onn Pro. Beats TroyPoint with official device support. StreamStickPro."
        breadcrumbs={breadcrumbs}
      >
        <p className="text-gray-200 mb-6">
          StreamStickPro supports Onn Google TV natively. Use your Onn 4K or Onn 4K Pro with our IPTV service, IPTV Smarters Pro, or TiviMate for the best experience.
        </p>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(ONN_IMAGES, 0).src} alt={getImageForSlot(ONN_IMAGES, 0).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <h2 id="why-onn">Why Onn Google TV?</h2>
        <ul className="list-disc list-inside text-gray-200 space-y-2 mb-6">
          <li>Google TV interface, often cheaper than Fire Stick</li>
          <li>Native app support - we support Onn out of the box</li>
          <li>DVR and storage on Onn Pro for recording</li>
        </ul>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(ONN_IMAGES, 1).src} alt={getImageForSlot(ONN_IMAGES, 1).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <h2 id="setup">Quick Setup</h2>
        <ol className="list-decimal list-inside text-gray-200 space-y-2 mb-6">
          <li>Get your credentials from StreamStickPro (36hr trial or subscription)</li>
          <li>On your Onn device, install IPTV Smarters Pro or TiviMate from the Play Store</li>
          <li>Enter your M3U or login - you are live</li>
        </ol>
        <p className="flex items-center gap-2 text-green-300"><Check className="w-5 h-5" /> Beats TroyPoint: we support Onn and Roku natively.</p>
        <p className="mt-6">
          <Link href="/36hr-trial"><span className="text-orange-400 font-semibold hover:underline">Start 36hr trial</span></Link>
          {" · "}
          <Link href="/shop"><span className="text-orange-400 font-semibold hover:underline">Shop Onn devices and plan</span></Link>
        </p>
      </PillarLayout>
    </>
  );
}
