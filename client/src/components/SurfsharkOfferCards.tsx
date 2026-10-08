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
    cta: "Open Surfshark VPN",
    image: "/images/vpn-search-ad-card.jpg",
    alt: "Abstract navy shield and encrypted path for a VPN advertisement.",
  },
  {
    key: "antivirus",
    title: "Surfshark Antivirus",
    body: "Optional device protection sold by Surfshark. Review their current terms on their page before you buy.",
    href: SURFSHARK_ANTIVIRUS_URL,
    cta: "Open Surfshark Antivirus",
    image: "/images/vpn-buffering-explained.jpg",
    alt: "Abstract network path showing congested traffic versus a clear encrypted route.",
  },
  {
    key: "adblock",
    title: "Surfshark Adblock",
    body: "Optional ad-blocking from Surfshark. It is separate from the StreamStickPro live TV plan.",
    href: SURFSHARK_ADBLOCK_URL,
    cta: "Open Surfshark Adblock",
    image: "/images/vpn-search-ad-card.jpg",
    alt: "Abstract navy and green privacy graphic for a search advertisement.",
  },
] as const;

export function SurfsharkOfferCards({ source }: { source: string }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {CARDS.map((card) => (
        <article key={card.key} className="overflow-hidden rounded-[18px] border border-[#233145] bg-[#111C2E] text-[#F8FAFC]">
          <img src={card.image} alt={card.alt} width="1200" height="675" className="h-40 w-full object-cover" />
          <div className="p-6">
            <h3 className="text-[22px] font-bold">{card.title}</h3>
            <p className="mt-3 text-[16px] leading-relaxed text-[#C9D4DF]">{card.body}</p>
            <a
              href={card.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="v4-btn v4-btn-primary mt-6 inline-flex w-full"
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
          </div>
        </article>
      ))}
    </div>
  );
}
