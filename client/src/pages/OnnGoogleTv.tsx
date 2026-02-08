import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { Check } from "lucide-react";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Onn Google TV Setup", href: "/onn-google-tv" },
];

export default function OnnGoogleTv() {
  useEffect(() => {
    document.title = "Onn Google TV IPTV Setup 2026 | StreamStickPro";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Set up IPTV on Onn Google TV. Native support, no hacky workarounds. StreamStickPro works on Onn 4K and Onn Pro. 36hr trial, then subscribe.");
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
        <h2 id="why-onn">Why Onn Google TV?</h2>
        <ul className="list-disc list-inside text-gray-200 space-y-2 mb-6">
          <li>Google TV interface, often cheaper than Fire Stick</li>
          <li>Native app support - we support Onn out of the box</li>
          <li>DVR and storage on Onn Pro for recording</li>
        </ul>
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
