import { useEffect } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { getSurfsharkAffiliateUrl } from "@/lib/surfshark";
import { trackVpnClick } from "@/lib/vpn-tracking";
import { SurfsharkOfferCards } from "@/components/SurfsharkOfferCards";
import { V4Footer, V4Header } from "@/components/v4/V4Chrome";
import "@/styles/v4.css";

export default function VpnPage() {
  const surfUrl = getSurfsharkAffiliateUrl();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setPageMeta({
      title: "What a VPN does for buffering | StreamStickPro",
      description:
        "A VPN encrypts your traffic so your internet provider sees less of what you stream. That can reduce ISP throttling that shows up as buffering. Review Surfshark terms on their page.",
      path: "/vpn",
    });
  }, []);

  return (
    <div className="v4 min-h-screen">
      <V4Header />
      <main id="main-content">
        <section className="bg-[#08111F] text-[#F8FAFC]">
          <div className="v4-shell grid items-center gap-10 py-16 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold tracking-[0.14em] text-[#79D5FF]">OPTIONAL ADD-ON</p>
              <h1 className="mt-4 text-[40px] font-bold leading-tight lg:text-[48px]">What a VPN is, and how it can stop buffering.</h1>
              <p className="mt-5 max-w-xl text-[#C9D4DF]">
                A VPN is not the StreamStickPro live TV plan. It is a separate connection tool. StreamStickPro may earn a commission if you buy Surfshark through these links.
              </p>
              <a
                href={surfUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="v4-btn v4-btn-primary mt-8"
                onClick={() => trackVpnClick({ source: "/vpn", placement: "vpn_hero", target: "vpn_affiliate" })}
              >
                Open Surfshark VPN
              </a>
            </div>
            <img src="/images/vpn-search-ad-card.jpg" alt="Abstract navy shield graphic for a VPN search advertisement." width="1200" height="675" className="w-full rounded-[22px] object-cover" />
          </div>
        </section>

        <section className="bg-[#FCFBF7]">
          <div className="v4-shell py-16">
            <h2 className="text-[34px] font-bold lg:text-[42px]">What a VPN does</h2>
            <div className="mt-8 max-w-[720px] space-y-5 text-[18px] leading-[1.75] text-[#3A4658]">
              <p>VPN means virtual private network. It puts an encrypted tunnel between your device and the internet. Your internet provider then sees that you are connected to a VPN server, not the exact streaming app you opened.</p>
              <p>That privacy layer is the main job. Smoother playback is a side effect when the provider was slowing traffic it recognized as streaming.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#EDF3F7]">
          <div className="v4-shell py-16">
            <h2 className="text-[34px] font-bold lg:text-[42px]">How that can stop buffering</h2>
            <img src="/images/vpn-buffering-explained.jpg" alt="Congested network path versus a clear encrypted route." width="1200" height="675" className="mt-8 max-w-3xl rounded-[22px] object-cover" />
            <ol className="mt-10 max-w-[720px] list-decimal space-y-4 pl-5 text-[18px] leading-relaxed">
              <li>Live TV and 4K video use a lot of data. Some providers slow that kind of traffic on purpose. That slowdown looks like a spinning buffer.</li>
              <li>A VPN wraps the stream so the provider cannot as easily tell it is video. The cap may lift.</li>
              <li>A VPN cannot fix weak Wi-Fi, a slow home plan, or a far-away server. If the picture still stalls after you connect, check the Wi-Fi and try a nearby server.</li>
            </ol>
          </div>
        </section>

        <section className="bg-[#08111F] text-[#F8FAFC]">
          <div className="v4-shell py-16">
            <h2 className="text-[34px] font-bold lg:text-[42px]">Cards for search and social</h2>
            <p className="mt-4 max-w-3xl text-[#C9D4DF]">
              These partner cards use StreamStickPro tracking links. Prices and discounts are set by Surfshark, not by this store.
            </p>
            <div className="mt-10">
              <SurfsharkOfferCards source="/vpn" />
            </div>
          </div>
        </section>

        <section className="bg-[#F5F2EA]">
          <div className="v4-shell py-16">
            <h2 className="text-[34px] font-bold">If you already bought a package</h2>
            <p className="mt-4 max-w-[720px] text-[#536275]">
              A Google TV package includes the ONN hardware, an educational setup video, login credentials, and a 1-year live TV plan. A VPN is extra. Add it only if buffering continues after setup.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/setup/"><span className="v4-btn v4-btn-secondary-light">Open setup</span></Link>
              <Link href="/devices/"><span className="v4-btn v4-btn-primary">View devices</span></Link>
            </div>
          </div>
        </section>
      </main>
      <V4Footer />
    </div>
  );
}
