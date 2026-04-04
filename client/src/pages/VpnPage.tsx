import { useEffect } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { getSurfsharkAffiliateUrl } from "@/lib/surfshark";
import { Button } from "@/components/ui/button";
import { trackVpnClick } from "@/lib/vpn-tracking";
import { ArrowLeft, Check } from "lucide-react";

export default function VpnPage() {
  const surfUrl = getSurfsharkAffiliateUrl();

  useEffect(() => {
    setPageMeta({
      title: "Surfshark VPN IPTV Buffering ISP Throttle Firestick | StreamStickPro",
      description:
        "Stop ISP throttling on IPTV. Surfshark VPN for Firestick and ONN: unlimited devices, camouflage mode, 30-day money-back. Two-minute setup.",
      path: "/vpn",
      keywords:
        "IPTV subscription, loaded Firestick, Onn device, Surfshark VPN IPTV, ISP throttling VPN",
    });
  }, []);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why does my ISP throttle IPTV streaming?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ISPs often detect bandwidth-heavy streaming and cap speeds, which causes buffering. A VPN encrypts traffic so the ISP sees generic data, not streaming activity.",
        },
      },
      {
        "@type": "Question",
        name: "Does Surfshark work on Firestick and ONN Google TV?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Install the Surfshark app from the Amazon Appstore or Google Play on your device, connect to a nearby server, then launch your IPTV app.",
        },
      },
    ],
  };

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Quick Surfshark VPN setup for IPTV on Firestick or ONN",
    totalTime: "PT2M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Install Surfshark",
        text: "Install the Surfshark app on your Firestick or ONN Google TV.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Connect to a server",
        text: "Open Surfshark and connect to the nearest server (US recommended for US viewers).",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Launch IPTV",
        text: "Open your IPTV app and stream with reduced ISP throttling.",
      },
    ],
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Surfshark VPN",
    description:
      "VPN service recommended for IPTV viewers to reduce ISP throttling and improve privacy on Firestick and ONN Google TV.",
    brand: { "@type": "Brand", name: "Surfshark" },
    offers: {
      "@type": "Offer",
      url: surfUrl,
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
      seller: { "@type": "Organization", name: "Surfshark" },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0F] to-[#1A1A22] text-white overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <div className="container mx-auto px-4 pt-8 pb-24 max-w-3xl">
        <Link href="/">
          <span className="inline-flex items-center gap-2 text-[#B0B3B8] hover:text-[#00D4FF] text-sm mb-10 cursor-pointer">
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back to home
          </span>
        </Link>

        <header className="mb-12 md:mb-16">
          <p className="text-[#00D4FF] text-sm font-semibold tracking-wide mb-3">StreamStickPro × Surfshark</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white mb-6">
            Surfshark VPN - Essential IPTV Protection
          </h1>
          <div
            className="rounded-2xl p-6 md:p-8 border border-[#00D4FF]/30 bg-[#0A0A0F]/80 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(0,212,255,0.08)" }}
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
              Your ISP is Throttling You (Here&apos;s Proof)
            </h2>
            <p className="text-[#B0B3B8] leading-relaxed mb-3">
              ISP detects IPTV streaming → deliberately slows HD/4K → constant buffering
            </p>
            <p className="text-[#B0B3B8] leading-relaxed">
              VPN encrypts traffic → ISP sees normal browsing → full speed restored
            </p>
          </div>
        </header>

        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">3 Critical VPN Benefits for IPTV</h2>
          <ol className="space-y-8 list-decimal list-inside marker:text-[#00D4FF] marker:font-bold">
            <li className="pl-1">
              <span className="font-bold text-white">Stop ISP Throttling</span>
              <p className="text-[#B0B3B8] mt-2 ml-6 md:ml-7 leading-relaxed">
                Streaming = bandwidth-heavy. ISPs cap speed. Surfshark disguises as normal traffic.
              </p>
            </li>
            <li className="pl-1">
              <span className="font-bold text-white">Privacy Protection</span>
              <p className="text-[#B0B3B8] mt-2 ml-6 md:ml-7 leading-relaxed">
                Hide activity from ISP, hackers, ISPs logging streams.
              </p>
            </li>
            <li className="pl-1">
              <span className="font-bold text-white">Fix Buffering</span>
              <p className="text-[#B0B3B8] mt-2 ml-6 md:ml-7 leading-relaxed">
                Throttled = buffering wheel. Unthrottled = smooth 4K.
              </p>
            </li>
          </ol>
        </section>

        <section className="mb-12 md:mb-16 rounded-2xl border border-[#0DD9D2]/40 bg-[#0DD9D2]/5 p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <h2 className="text-xl font-bold text-[#0DD9D2] mb-4">Why Surfshark (Not Others)</h2>
          <ul className="space-y-3 text-[#B0B3B8]">
            {[
              "Unlimited devices (protect Firestick + phone + TV)",
              "3,200+ servers (fastest streaming speeds)",
              "Camouflage Mode (hides VPN from ISPs)",
              "Works perfectly Firestick/Onn",
              "30-day money-back",
            ].map((line) => (
              <li key={line} className="flex gap-3 items-start">
                <Check className="w-5 h-5 text-[#0DD9D2] shrink-0 mt-0.5" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 md:mb-16">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Setup (2 Minutes)</h2>
          <ol className="list-decimal space-y-3 text-[#B0B3B8] pl-5">
            <li>Install Surfshark app on Firestick/Onn</li>
            <li>Connect nearest server (US recommended)</li>
            <li>Launch IPTV → No buffering</li>
          </ol>
        </section>

        <section className="mb-12 md:mb-16">
          <h2 className="text-xl font-bold text-white mb-2">Still Buffering?</h2>
          <p className="text-[#B0B3B8]">Upgrade to 50Mbps+ internet or wired Ethernet.</p>
        </section>

        <div className="flex flex-col items-stretch gap-4 mb-12">
          <a
            href={surfUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() =>
              trackVpnClick({
                source: "/vpn",
                placement: "vpn_page_cta",
                target: "vpn_affiliate",
              })
            }
          >
            <Button
              className="w-full min-h-[72px] text-lg font-black rounded-2xl bg-[#0DD9D2] text-[#0A0A0F] hover:bg-[#0DD9D2]/90 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              size="lg"
            >
              GET SURFSHARK VPN
            </Button>
          </a>
          <p className="text-center text-[#FAD02C] text-sm font-semibold">
            StreamStickPro Special: First 2 months 81% off
          </p>
        </div>

        <nav className="border-t border-white/10 pt-8" aria-label="Related pages">
          <p className="text-[#B0B3B8] text-sm mb-3">Related:</p>
          <div className="flex flex-wrap gap-3 text-[#00D4FF]">
            <Link href="/iptv">
              <span className="hover:underline cursor-pointer font-medium">IPTV Subscriptions</span>
            </Link>
            <span className="text-[#B0B3B8]">|</span>
            <Link href="/devices">
              <span className="hover:underline cursor-pointer font-medium">Loaded Devices</span>
            </Link>
            <span className="text-[#B0B3B8]">|</span>
            <Link href="/shop">
              <span className="hover:underline cursor-pointer font-medium">Bundles</span>
            </Link>
          </div>
        </nav>

        <p className="text-xs text-[#B0B3B8]/70 mt-12 leading-relaxed">
          StreamStickPro may earn a commission when you purchase Surfshark through links on this page. Offers and pricing are
          controlled by Surfshark.
        </p>
      </div>
    </div>
  );
}
