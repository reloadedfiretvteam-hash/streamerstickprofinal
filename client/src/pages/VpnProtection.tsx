import { useEffect } from "react";
import { Link } from "wouter";
import { ShieldCheck, Wifi, Lock, Gauge } from "lucide-react";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { setPageMeta } from "@/lib/seo";
import { trackCustomEvent } from "@/components/RetargetingPixels";

const VPN_URL = "https://get.surfshark.net/aff_c?offer_id=926&aff_id=44830";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "VPN Protection", href: "/vpn-protection" },
];

function trackVpnOutbound(source: string) {
  trackCustomEvent("vpn_affiliate_click", { placement: "vpn_page" });
  void fetch("/api/track-outbound-click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target: "vpn_affiliate", source }),
    keepalive: true,
  }).catch(() => {});
}

export default function VpnProtection() {
  useEffect(() => {
    setPageMeta({
      title: "VPN Protection for Streaming | StreamStickPro",
      description:
        "Learn what a VPN is, how it helps with privacy and ISP traffic shaping, and why many streaming users add VPN protection.",
      path: "/vpn-protection",
    });
  }, []);

  return (
    <>
      <BreadcrumbSchema
        items={breadcrumbs.map((b) => ({
          name: b.label,
          url: `https://streamstickpro.com${b.href}`,
        }))}
      />
      <PillarLayout
        title="VPN Protection for Streaming"
        description="A simple guide to what VPN protection does, why streaming users use it, and when it helps."
        breadcrumbs={breadcrumbs}
      >
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6">
          <p className="text-sm text-gray-300">
            This page explains VPN basics for streaming households: privacy, network protection, and more stable playback in situations where internet traffic is shaped by the provider.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 via-gray-950 to-gray-900 p-5">
            <h2 className="text-xl font-bold text-white mb-3">What is a VPN?</h2>
            <p className="text-gray-300">
              A VPN (Virtual Private Network) creates an encrypted connection between your device and the internet. It helps mask your public IP and adds a privacy layer while you browse and stream.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-gray-950 to-gray-900 p-5">
            <h2 className="text-xl font-bold text-white mb-3">Why streaming users add one</h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-1 text-green-400" /> Adds privacy on home and public Wi-Fi networks.</li>
              <li className="flex items-start gap-2"><Gauge className="w-4 h-4 mt-1 text-green-400" /> Can reduce slowdowns caused by ISP traffic shaping in some regions.</li>
              <li className="flex items-start gap-2"><Lock className="w-4 h-4 mt-1 text-green-400" /> Helps reduce exposure of your real IP across services.</li>
              <li className="flex items-start gap-2"><Wifi className="w-4 h-4 mt-1 text-green-400" /> Useful for safer streaming while traveling or using shared networks.</li>
            </ul>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-[#2A2A33] bg-[#1A1A22] p-6">
          <h2 className="text-2xl font-bold text-white mb-3">Important notes</h2>
          <ul className="space-y-2 text-gray-300">
            <li>VPNs do not guarantee faster speed in every location; server choice and local network quality still matter.</li>
            <li>Use VPN protection alongside good Wi-Fi setup and device optimization for best streaming stability.</li>
            <li>Always follow local laws, platform terms, and account policies.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={VPN_URL}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => trackVpnOutbound("/vpn-protection")}
              className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[#00D4FF] px-6 py-3 font-semibold text-[#0A0A0F] hover:bg-[#10F7BE] transition-colors"
            >
              Get VPN Protection
            </a>
            <Link href="/setup">
              <span className="inline-flex min-h-[52px] cursor-pointer items-center justify-center rounded-xl border border-[#2A2A33] bg-white/5 px-6 py-3 font-semibold text-white hover:border-[#00D4FF] transition-colors">
                View Setup Guides
              </span>
            </Link>
          </div>
        </section>
      </PillarLayout>
    </>
  );
}
