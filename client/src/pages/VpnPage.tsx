import { useEffect } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { getSurfsharkAffiliateUrl } from "@/lib/surfshark";
import { trackVpnClick } from "@/lib/vpn-tracking";
import { SurfsharkOfferCards } from "@/components/SurfsharkOfferCards";
import { StagingFooter, StagingHeader } from "@/components/staging/StagingChrome";
import "@/styles/staging.css";

export default function VpnPage() {
  const surfUrl = getSurfsharkAffiliateUrl();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setPageMeta({
      title: "VPN for streaming and buffering | StreamStickPro",
      description:
        "Learn how a VPN can reduce ISP throttling that looks like buffering. Surfshark VPN, Antivirus, and Adblock cards stay on StreamStickPro first.",
      path: "/vpn",
      ogImage: "https://streamstickpro.com/images/vpn-search-ad-card.jpg",
    });
  }, []);

  return (
    <div className="stg min-h-screen">
      <StagingHeader />
      <main id="main-content">
        <section className="stg-hero text-[#F8FAFC]">
          <div className="stg-shell grid items-center gap-10 py-16 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold tracking-[0.14em] text-[#79D5FF]">OPTIONAL ADD-ON</p>
              <h1 className="mt-4">VPN product cards for a smoother stream.</h1>
              <p className="mt-5 max-w-xl text-[#C9D4DF]">
                A VPN is not the StreamStickPro live TV plan. Stay on this page to read the cards, then continue to Surfshark if you want the add-on. StreamStickPro may earn a commission.
              </p>
              <a
                href={surfUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="stg-btn stg-btn-primary mt-8"
                onClick={() => trackVpnClick({ source: "/vpn", placement: "vpn_hero", target: "vpn_affiliate" })}
              >
                Continue to Surfshark VPN
              </a>
            </div>
            <img src="/images/vpn-search-ad-card.jpg" alt="StreamStickPro VPN product card for search and social." width="1200" height="675" className="w-full rounded-[22px] object-cover" />
          </div>
        </section>

        <section className="bg-[#FCFBF7] stg-section">
          <div className="stg-shell">
            <h2>What a VPN does</h2>
            <div className="mt-8 max-w-[720px] space-y-5 text-[#3A4658]">
              <p>VPN means virtual private network. It puts an encrypted tunnel between your device and the internet. Your internet provider then sees that you are connected to a VPN server, not the exact streaming app you opened.</p>
              <p>That privacy layer is the main job. Smoother playback is a side effect when the provider was slowing traffic it recognized as streaming.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#EDF3F7] stg-section">
          <div className="stg-shell">
            <h2>How that can stop buffering</h2>
            <img src="/images/vpn-buffering-explained.jpg" alt="Congested network path versus a clear encrypted route." width="1200" height="675" className="mt-8 max-w-3xl rounded-[22px] object-cover" />
            <ol className="mt-10 max-w-[720px] list-decimal space-y-4 pl-5">
              <li>Live TV and 4K video use a lot of data. Some providers slow that kind of traffic on purpose. That slowdown looks like a spinning buffer.</li>
              <li>A VPN wraps the stream so the provider cannot as easily tell it is video. The cap may lift.</li>
              <li>A VPN cannot fix weak Wi-Fi, a slow home plan, or a far-away server. If the picture still stalls after you connect, check the Wi-Fi and try a nearby server.</li>
            </ol>
          </div>
        </section>

        <section className="bg-[#08111F] text-[#F8FAFC] stg-section">
          <div className="stg-shell">
            <h2>Product cards for Google, Bing, and social</h2>
            <p className="mt-4 max-w-3xl text-[#C9D4DF]">
              These cards live on StreamStickPro so search and ads can send people here. Prices and discounts are set by Surfshark, not by this store.
            </p>
            <div className="mt-10">
              <SurfsharkOfferCards source="/vpn" mode="outbound" />
            </div>
          </div>
        </section>

        <section className="bg-[#F5F2EA] stg-section">
          <div className="stg-shell">
            <h2>If you already bought a package</h2>
            <p className="mt-4 max-w-[720px] text-[#536275]">
              A Google TV package includes the ONN hardware, an educational setup video, login credentials, and a 1-year live TV plan. A VPN is extra. Add it only if buffering continues after setup.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/setup/"><span className="stg-btn stg-btn-secondary-light">Open setup</span></Link>
              <Link href="/devices/"><span className="stg-btn stg-btn-primary">View Google TV devices</span></Link>
            </div>
          </div>
        </section>
      </main>
      <StagingFooter />
    </div>
  );
}
