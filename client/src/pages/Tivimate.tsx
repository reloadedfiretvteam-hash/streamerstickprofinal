import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { Check } from "lucide-react";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "TiviMate", href: "/tivimate" },
];

export default function Tivimate() {
  useEffect(() => {
    document.title = "TiviMate IPTV Setup 2026 | Premium App Guide | StreamStickPro";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Use TiviMate with StreamStickPro. Premium IPTV app setup for Fire Stick, Android, Onn. 28K+ channels. 36hr trial. Best IPTV for TiviMate.");
  }, []);

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <PillarLayout
        title="TiviMate – Premium IPTV App Setup"
        description="StreamStickPro works with TiviMate. Premium setup guide for Fire Stick, Onn, Android. 28K+ channels. Start 36hr trial or shop plans."
        breadcrumbs={breadcrumbs}
      >
        <p className="text-gray-200 mb-6">
          <strong className="text-white">TiviMate</strong> is a premium IPTV player with a great EPG and DVR. StreamStickPro is the best IPTV to use with TiviMate: we deliver an optimized stream and full channel list (28K+ live, 100K+ VOD).
        </p>
        <h2 id="setup">TiviMate + StreamStickPro Setup</h2>
        <ol className="list-decimal list-inside text-gray-200 space-y-2 mb-6">
          <li>Get your credentials: <Link href="/36hr-trial"><span className="text-orange-400 hover:underline">36hr free trial</span></Link> or <Link href="/shop"><span className="text-orange-400 hover:underline">subscription</span></Link>.</li>
          <li>Install TiviMate on your device (Fire Stick, Onn, Android TV).</li>
          <li>Add playlist (M3U) or use Xtream Codes in TiviMate.</li>
          <li>Enjoy premium EPG and recording (where supported).</li>
        </ol>
        <p className="flex items-center gap-2 text-green-300 mb-6"><Check className="w-5 h-5" /> Optimized for TiviMate—no “basic” support; full channel and VOD access.</p>
        <p>
          <Link href="/36hr-trial"><span className="text-orange-400 font-semibold hover:underline">Start 36hr trial →</span></Link>
          {" · "}
          <Link href="/iptv-smarters-pro"><span className="text-orange-400 font-semibold hover:underline">IPTV Smarters Pro guide →</span></Link>
        </p>
      </PillarLayout>
    </>
  );
}
