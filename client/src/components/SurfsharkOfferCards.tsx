import { Link } from "wouter";
import { trackVpnClick } from "@/lib/vpn-tracking";
import {
  SURFSHARK_ADBLOCK_URL,
  SURFSHARK_AFFILIATE_URL,
  SURFSHARK_ANTIVIRUS_URL,
} from "@/lib/surfshark";

const CARDS = [
  {
    key: "vpn",
    title: "Surfshark VPN",
    body: "Encrypts your connection so your internet provider sees less of what you stream. That can reduce throttling that shows up as buffering.",
    href: SURFSHARK_AFFILIATE_URL,
    inbound: "/vpn#surfshark-vpn",
    cta: "Continue to Surfshark VPN",
    inboundCta: "View VPN card",
    image: "/images/vpn-search-ad-card.jpg",
    alt: "Navy privacy graphic for the StreamStickPro VPN product card.",
  },
  {
    key: "antivirus",
    title: "Surfshark Antivirus",
    body: "Optional device protection sold by Surfshark. Review their current terms on their page before you buy.",
    href: SURFSHARK_ANTIVIRUS_URL,
    inbound: "/vpn#surfshark-antivirus",
    cta: "Continue to Surfshark Antivirus",
    inboundCta: "View Antivirus card",
    image: "/images/vpn-buffering-explained.jpg",
    alt: "Network path graphic for the StreamStickPro Antivirus product card.",
  },
  {
    key: "adblock",
    title: "Surfshark Adblock",
    body: "Optional ad-blocking from Surfshark. It is separate from the StreamStickPro live TV plan.",
    href: SURFSHARK_ADBLOCK_URL,
    inbound: "/vpn#surfshark-adblock",
    cta: "Continue to Surfshark Adblock",
    inboundCta: "View Adblock card",
    image: "/images/vpn-search-ad-card.jpg",
    alt: "Navy and green graphic for the StreamStickPro Adblock product card.",
  },
] as const;

export function SurfsharkOfferCards({
  source,
  mode = "outbound",
}: {
  source: string;
  mode?: "inbound" | "outbound";
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {CARDS.map((card) => (
        <article
          id={mode === "outbound" ? card.inbound.replace("/vpn#", "") : undefined}
          key={card.key}
          className="overflow-hidden rounded-[18px] border border-[#233145] bg-[#111C2E] text-[#F8FAFC]"
        >
          <img src={card.image} alt={card.alt} width="1200" height="675" className="h-40 w-full object-cover" />
          <div className="p-6">
            <h3 className="text-[22px] font-bold">{card.title}</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-[#C9D4DF]">{card.body}</p>
            {mode === "inbound" ? (
              <Link href={card.inbound}>
                <span
                  className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-xl bg-[#23C768] px-5 font-semibold text-[#08111F]"
                  onClick={() =>
                    trackVpnClick({
                      source,
                      placement: `surfshark_${card.key}_inbound`,
                      target: "vpn_page",
                    })
                  }
                >
                  {card.inboundCta}
                </span>
              </Link>
            ) : (
              <a
                href={card.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-6 inline-flex min-h-[50px] w-full items-center justify-center rounded-xl bg-[#23C768] px-5 font-semibold text-[#08111F]"
                onClick={() =>
                  trackVpnClick({
                    source,
                    placement: `surfshark_${card.key}_card`,
                    target: "vpn_affiliate",
                  })
                }
              >
                {card.cta}
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
