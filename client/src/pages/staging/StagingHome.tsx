import { useEffect, useState } from "react";
import { Link } from "wouter";
import { iptvRealProductId, type IptvDurationKey } from "@/lib/iptv-sku";
import { setPageMeta } from "@/lib/seo";
import { useCart } from "@/lib/store";
import { HD_ID, HD_SLUG, K4_ID, K4_SLUG, publicDevicePath } from "@/lib/device-skus";
import { HD_ALT, HD_IMG, K4_ALT, K4_IMG, packageImage } from "@/lib/package-art";
import { useShopCatalog } from "@/lib/use-shop-catalog";
import { SurfsharkOfferCards } from "@/components/SurfsharkOfferCards";
import { PackageIncludes, PlanIncludes } from "@/components/PlanIncludes";
import { SetupGuideVideos } from "@/components/SetupGuideVideos";
import { StagingFooter, StagingHeader } from "@/components/staging/StagingChrome";
import { publicPlanName } from "@/lib/offer-copy";
import "@/styles/staging.css";

const DURATIONS: { key: IptvDurationKey; label: string }[] = [
  { key: "1mo", label: "1 Month" },
  { key: "3mo", label: "3 Months" },
  { key: "6mo", label: "6 Months" },
  { key: "1yr", label: "1 Year" },
  { key: "2yr", label: "2 Years" },
];

const FINDER = ["Fire TV", "Google TV", "ONN", "Android TV", "Smart TV", "I’m Not Sure"] as const;
const PREF_KEY = "ssp-device-pref";

export default function StagingHome() {
  const { addItem, openCart } = useCart();
  const { products, status, retry, hd, k4, byId, money, stockLabel } = useShopCatalog();
  const [devices, setDevices] = useState(1);
  const [duration, setDuration] = useState<IptvDurationKey>("1yr");
  const [finder, setFinder] = useState("");
  const [finderShown, setFinderShown] = useState(false);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setPageMeta({
      title: "Google TV packages and live TV plans | StreamStickPro",
      description:
        "Shop ONN Google TV HD and 4K packages, or a live TV plan for a device you already own. United States and Canada checkout.",
      path: "/",
      ogImage: "https://streamstickpro.com/images/onn-4k-official-reference.png",
    });
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || "null");
      if (saved?.choice && saved.until > Date.now()) setFinder(saved.choice);
    } catch {
      /* ignore */
    }
  }, []);

  const selectedPlan = byId(iptvRealProductId(duration, devices));

  const onRemember = (checked: boolean) => {
    setRemember(checked);
    if (!checked) localStorage.removeItem(PREF_KEY);
  };

  const showFinder = () => {
    setFinderShown(true);
    if (remember && finder) {
      localStorage.setItem(PREF_KEY, JSON.stringify({ choice: finder, until: Date.now() + 30 * 24 * 60 * 60 * 1000 }));
    }
  };

  const addPlan = () => {
    if (!selectedPlan) return;
    addItem({
      id: selectedPlan.id,
      name: selectedPlan.name,
      price: selectedPlan.price,
      image: packageImage(selectedPlan.id, selectedPlan.image),
      category: "iptv",
      description: selectedPlan.description,
    });
    openCart();
  };

  const stories = [
    {
      id: HD_ID,
      slug: HD_SLUG,
      product: hd,
      eyebrow: "FOR AN HD SETUP",
      name: "ONN Google TV HD Package",
      body: "An ONN Full HD Google TV stick and voice remote, plus an educational setup video, login credentials, and a 1-year live TV plan.",
      image: HD_IMG,
      alt: HD_ALT,
      cta: "View HD Package",
      reverse: false,
    },
    {
      id: K4_ID,
      slug: K4_SLUG,
      product: k4,
      eyebrow: "FOR A 4K SETUP",
      name: "ONN Google TV 4K Package",
      body: "A 2023 ONN 4K Google TV box and voice remote, plus an educational setup video, login credentials, and a 1-year live TV plan.",
      image: K4_IMG,
      alt: K4_ALT,
      cta: "View 4K Package",
      reverse: true,
    },
  ];

  return (
    <div className="stg min-h-screen">
      <div className="bg-[#08111F] text-[#F8FAFC]">
        <div className="stg-shell py-3 text-center text-[15px] font-semibold">
          Need help choosing? <Link href="/device-finder/"><span className="text-[#79D5FF] underline-offset-4 hover:underline">Find your setup.</span></Link>
        </div>
      </div>
      <StagingHeader />

      <main id="main-content">
        <section className="stg-hero" aria-labelledby="hero-title">
          <div className="stg-shell stg-hero-grid py-14">
            <div className="stg-hero-copy">
              <p className="text-sm font-semibold tracking-[0.14em] text-[#79D5FF]">STREAMING MADE SIMPLER</p>
              <h1 id="hero-title" className="mt-4">Streaming setup without the setup headache.</h1>
              <p className="mt-5 text-[#D5DEE8]">
                Choose an ONN Google TV package or a live TV plan for a compatible device you already own. Explore live TV, movies, series, and sports, with a guide for your setup.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/devices/"><span className="stg-btn stg-btn-primary">Shop Google TV Devices</span></Link>
                <Link href="/plans/"><span className="stg-btn stg-btn-secondary">I Already Have a Device</span></Link>
              </div>
              <p className="mt-5">
                <Link href="/device-finder/"><span className="text-[#79D5FF] underline">Not sure what you need? Find my setup.</span></Link>
              </p>
            </div>
            <div className="stg-product-panel mt-8 lg:mt-0">
              <img src={K4_IMG} alt={K4_ALT} width="800" height="640" />
              <p className="mt-3 text-sm text-[#536275]">App logos on the retail packaging identify available apps. Separate subscriptions may be required.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#FCFBF7] stg-section" aria-labelledby="paths-title">
          <div className="stg-shell">
            <h2 id="paths-title">What are you starting with?</h2>
            <p className="mt-4 max-w-3xl text-[#536275]">Choose the path that matches the equipment in your home.</p>
            <div className="stg-two mt-10">
              <article className="stg-panel">
                <h3>I need a streaming device.</h3>
                <p className="mt-3 text-[#536275]">Compare Google TV device packages and see exactly what comes with each one.</p>
                <Link href="/devices/"><span className="stg-btn stg-btn-primary mt-6">Explore Device Packages</span></Link>
              </article>
              <article className="stg-panel">
                <h3>I already have a device.</h3>
                <p className="mt-3 text-[#536275]">Check your device, choose a plan, and follow the matching setup guide.</p>
                <Link href="/compatibility/"><span className="stg-btn stg-btn-secondary-light mt-6">Check My Device</span></Link>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-[#F5F2EA] stg-section" aria-labelledby="finder-title">
          <div className="stg-shell">
            <h2 id="finder-title">What are you watching on?</h2>
            <p className="mt-4 max-w-3xl text-[#536275]">Pick your device to find compatibility information and the right setup guide.</p>
            <fieldset className="mt-8">
              <legend className="font-semibold">Device type</legend>
              <div className="stg-finder mt-4">
                {FINDER.map((label) => (
                  <label key={label}>
                    <input type="radio" name="stg-device" value={label} checked={finder === label} onChange={() => setFinder(label)} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="button" className="stg-btn stg-btn-primary mt-6" onClick={showFinder}>
              Show My Options
            </button>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={remember} onChange={(e) => onRemember(e.target.checked)} />
              Remember this device on this browser
            </label>
            {remember ? (
              <button type="button" className="ml-2 text-sm underline" onClick={() => { onRemember(false); setFinder(""); }}>
                Forget saved device
              </button>
            ) : null}
            <div className="mt-6 rounded-2xl border border-[#D7DFE7] bg-white p-6" aria-live="polite">
              {!finderShown ? (
                  <p>Choose a device type, then select Show My Options.</p>
              ) : (
                <>
                  <p className="font-semibold">Next step for {finder}</p>
                  <p className="mt-2 text-[#536275]">
                    A device type is a starting point. Send the exact model number so support can confirm compatibility before a plan is activated.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <Link href="/compatibility/"><span className="underline">Check Compatibility</span></Link>
                    <Link href="/setup/#firestick"><span className="underline">Fire Stick setup</span></Link>
                    <Link href="/setup/#onn-google"><span className="underline">ONN setup</span></Link>
                    <Link href="/contact/?topic=compatibility"><span className="underline">Contact with model number</span></Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="bg-[#08111F] stg-section" aria-labelledby="rail-title">
          <div className="stg-shell">
            <h2 id="rail-title" className="sr-only">Next steps</h2>
            <div className="stg-rail">
              <Link href="/compatibility/">
                <span>
                  <strong className="block text-[#79D5FF]">Check before you buy.</strong>
                  Confirm compatibility for your exact device.
                </span>
              </Link>
              <Link href="/devices/">
                <span>
                  <strong className="block text-[#79D5FF]">See the package details.</strong>
                  Review hardware, plan terms, and price together.
                </span>
              </Link>
              <Link href="/setup/">
                <span>
                  <strong className="block text-[#79D5FF]">Know your setup path.</strong>
                  Start with the guide for your equipment.
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-[#FCFBF7] stg-section" aria-labelledby="hardware-title">
          <div className="stg-shell">
            <h2 id="hardware-title">Google TV packages, side by side</h2>
            <p className="mt-3 max-w-3xl text-[#536275]">Two ONN devices. Same package contents. Pick HD or 4K for the TV you have.</p>
            <div className="stg-device-grid mt-8">
              {stories.map((story) => (
                <article key={story.id} className="stg-device-card">
                  <div className="stg-story-media">
                    <img src={story.image} alt={story.alt} width="800" height="640" />
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-semibold tracking-[0.12em] text-[#536275]">{story.eyebrow}</p>
                    <h3 className="mt-2">{story.product?.name || story.name}</h3>
                    <p className="mt-2 text-[#536275]">{story.body}</p>
                    <p className="mt-3 text-[32px] font-bold">
                      {status === "loading" ? "Loading current price…" : story.product ? money(story.product.price) : "Price not in catalog"}
                    </p>
                    <p className="mt-1 text-sm text-[#536275]">{stockLabel(story.product?.availability)}</p>
                    <Link href={publicDevicePath(story.slug)}><span className="stg-btn stg-btn-primary mt-4">{story.cta}</span></Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="stg-panel mt-6">
              <h3 className="mb-4">What every Google TV package includes</h3>
              <PackageIncludes />
              <p className="mt-4 text-sm text-[#536275]">
                4K is the hardware’s maximum output. Photos are the Full HD stick and the 2023 4K box, not Pro or Plus.{" "}
                <Link href="/plans/"><span className="underline">Already own a device? View plans.</span></Link>
              </p>
            </div>
          </div>
        </section>

        <section className="bg-[#08111F] text-[#F8FAFC] stg-section" aria-labelledby="plan-title">
          <div className="stg-shell">
            <h2 id="plan-title">Keep your device. Choose your plan.</h2>
            <p className="mt-4 max-w-3xl text-[#C9D4DF]">
              Choose a live TV plan for a supported device you already own. No hardware is shipped. Review the device allowance, service duration, and total before checkout.
            </p>
            {status === "loading" ? <p className="mt-6">Loading current plans…</p> : null}
            {status === "error" ? (
              <p className="mt-6">
                Plans could not be loaded. <button type="button" className="stg-btn stg-btn-primary ml-2" onClick={retry}>Retry</button>
              </p>
            ) : null}
            {status === "ready" ? (
              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <div>
                  <p className="font-semibold">Customer’s device</p>
                  <p className="mt-2 text-[#C9D4DF]">Check compatibility for the exact model, then pick a plan length and device allowance here.</p>
                  <fieldset className="mt-6">
                    <legend className="font-semibold">How many devices do you want to activate?</legend>
                    <p className="mt-2 text-sm text-[#A8B6C8]">Device allowance is how many devices you want to activate. It is not the same as how many people can watch at the same time.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <label key={n} className="stg-opt">
                          <input type="radio" name="stg-devices" className="mr-2" checked={devices === n} onChange={() => setDevices(n)} />
                          {n}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="mt-6">
                    <legend className="font-semibold">Plan duration</legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {DURATIONS.map((row) => (
                        <label key={row.key} className="stg-opt">
                          <input type="radio" name="stg-duration" className="mr-2" checked={duration === row.key} onChange={() => setDuration(row.key)} />
                          {row.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <div className="rounded-[18px] bg-[#111C2E] p-6">
                  <h3>Your plan</h3>
                  {selectedPlan ? (
                    <>
                      <p className="mt-3">{publicPlanName(selectedPlan.name)}</p>
                      <p className="mt-2 text-[32px] font-bold">{money(selectedPlan.price)}</p>
                      <p className="mt-2 text-sm text-[#A8B6C8]">
                        {devices} device{devices === 1 ? "" : "s"} · {DURATIONS.find((d) => d.key === duration)?.label}
                      </p>
                      <button type="button" className="stg-btn stg-btn-primary mt-6 w-full" onClick={addPlan}>
                        Add this plan
                      </button>
                    </>
                  ) : (
                    <p className="mt-3">This duration and device count is not in the live catalog.</p>
                  )}
                </div>
              </div>
            ) : null}
            <div className="stg-panel mt-8 bg-[#111C2E] text-[#F8FAFC]">
              <h3 className="mb-4">What this subscription includes</h3>
              <PlanIncludes tone="dark" />
              <p className="mt-4 text-sm text-[#A8B6C8]">
                <Link href="/setup/#firestick"><span className="underline">Fire Stick setup</span></Link>
                {" · "}
                <Link href="/setup/#onn-google"><span className="underline">ONN Google TV setup</span></Link>
                {" · "}
                <Link href="/terms"><span className="underline">Terms</span></Link>
              </p>
            </div>
            <p className="mt-6 text-sm text-[#A8B6C8]">
              <Link href="/36hr-trial"><span className="underline">Review trial terms</span></Link> if you already own a compatible device. Eligibility is confirmed by support, not at this step.
            </p>
          </div>
        </section>

        <section className="bg-[#F5F2EA] stg-section" aria-labelledby="setup-title">
          <div className="stg-shell">
            <h2 id="setup-title">Setup guides: Fire Stick and ONN Google TV</h2>
            <p className="mt-3 max-w-3xl text-[#536275]">
              Watch the matching preview here. After checkout, the email with your credentials also includes the educational setup video for your order.
            </p>
            <div className="mt-8">
              <SetupGuideVideos compact />
            </div>
            <div className="stg-two mt-6">
              <article className="stg-panel">
                <h3>I need a device</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-[#536275]">
                  <li>Choose the HD or 4K package.</li>
                  <li>Pay. The device ships. The email has the video, login, and 1-year plan.</li>
                  <li>Follow the ONN Google TV setup video.</li>
                </ol>
              </article>
              <article className="stg-panel">
                <h3>I already have a device</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-[#536275]">
                  <li>Check compatibility for the exact model.</li>
                  <li>Choose duration and device allowance.</li>
                  <li>Follow the Fire Stick or ONN guide that matches what you own.</li>
                </ol>
              </article>
            </div>
            <p className="mt-6 text-sm text-[#536275]">
              Keep passwords out of screenshots.{" "}
              <Link href="/setup/"><span className="underline">Open the full setup page</span></Link>
              {" · "}
              <Link href="/support/"><span className="underline">Get setup help</span></Link>
              {" · "}
              <Link href="/compatibility/"><span className="underline">Check compatibility</span></Link>
            </p>
          </div>
        </section>

        <section className="bg-[#08111F] text-[#F8FAFC] stg-section" aria-labelledby="vpn-title">
          <div className="stg-shell">
            <h2 id="vpn-title">VPN product cards for a smoother stream</h2>
            <p className="mt-4 max-w-3xl text-[#C9D4DF]">
              A VPN is optional and separate from the 1-year live TV plan. These cards stay on StreamStickPro first so you can read the guide, then continue to Surfshark if you want the add-on.
            </p>
            <div className="mt-10">
              <SurfsharkOfferCards source="/" mode="inbound" />
            </div>
            <Link href="/vpn"><span className="stg-btn stg-btn-secondary mt-8">Read the full VPN guide</span></Link>
          </div>
        </section>

        <section className="bg-[#F5F2EA] stg-section" aria-labelledby="faq-title">
          <div className="stg-shell">
            <h2 id="faq-title">Questions people ask before they buy</h2>
            <div className="mt-8 max-w-[720px] space-y-4">
              {[
                ["Do you sell Fire Stick hardware?", "No. If you already have a Fire Stick, check compatibility and a live TV plan."],
                ["Is a plan the same as a device package?", "No. A plan is the service only. A package includes the ONN hardware listed on that product page."],
                ["Is the trial instant?", "No. You request it. Support confirms whether your device can be set up."],
              ].map(([q, a]) => (
                <details key={q} className="stg-panel">
                  <summary className="cursor-pointer font-semibold">{q}</summary>
                  <p className="mt-3 text-[#536275]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#08111F] text-[#F8FAFC] stg-section">
          <div className="stg-shell stg-two">
            <div>
              <h2>Shop a Google TV package</h2>
              <Link href="/devices/"><span className="stg-btn stg-btn-primary mt-6">Shop Google TV Devices</span></Link>
            </div>
            <div>
              <h2>Keep the device you own</h2>
              <Link href="/plans/"><span className="stg-btn stg-btn-secondary mt-6">I Already Have a Device</span></Link>
            </div>
          </div>
        </section>
      </main>
      <StagingFooter />
    </div>
  );
}
