import { useEffect, useState } from "react";
import { Link } from "wouter";
import { iptvRealProductId, type IptvDurationKey } from "@/lib/iptv-sku";
import { setPageMeta } from "@/lib/seo";
import { useCart } from "@/lib/store";
import { HD_ID, HD_SLUG, K4_ID, K4_SLUG, publicDevicePath } from "@/lib/device-skus";
import { HD_ALT, HD_IMG, K4_ALT, K4_IMG, packageImage } from "@/lib/package-art";
import { useShopCatalog } from "@/lib/use-shop-catalog";
import { SurfsharkOfferCards } from "@/components/SurfsharkOfferCards";
import { SetupGuideVideos } from "@/components/SetupGuideVideos";
import { StagingFooter, StagingHeader } from "@/components/staging/StagingChrome";
import { PLAN_INCLUDES, publicPlanName } from "@/lib/offer-copy";
import "@/styles/staging.css";

const DURATIONS: { key: IptvDurationKey; label: string; note: string }[] = [
  { key: "1mo", label: "1 Month", note: "Shortest plan" },
  { key: "3mo", label: "3 Months", note: "A season" },
  { key: "6mo", label: "6 Months", note: "Half year" },
  { key: "1yr", label: "1 Year", note: "Most common" },
  { key: "2yr", label: "2 Years", note: "Longest plan" },
];

const PLAN_CARD_POINTS = [
  "Live TV, movies, and sports",
  "Login sent by email",
  "Setup video sent by email",
  "Nothing ships",
];

const FINDER = ["Fire TV", "Google TV", "ONN", "Android TV", "Smart TV", "I’m Not Sure"] as const;
const PREF_KEY = "ssp-device-pref";

export default function StagingHome() {
  const { addItem, openCart } = useCart();
  const { status, retry, hd, k4, byId, money, stockLabel } = useShopCatalog();
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

  const addPlan = (key: IptvDurationKey) => {
    const selectedPlan = byId(iptvRealProductId(key, devices));
    if (!selectedPlan) return;
    setDuration(key);
    addItem({
      id: selectedPlan.id,
      name: publicPlanName(selectedPlan.name),
      price: selectedPlan.price,
      image: packageImage(selectedPlan.id, selectedPlan.image),
      category: "iptv",
      description: selectedPlan.description,
    });
    openCart();
  };

  const addPackage = (product: typeof hd) => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: packageImage(product.id, product.image),
      category: "firestick",
      description: product.description,
    });
    openCart();
  };

  const packages = [
    {
      id: HD_ID,
      slug: HD_SLUG,
      product: hd,
      name: "ONN Google TV HD",
      body: "Full HD stick for everyday TVs.",
      image: HD_IMG,
      alt: HD_ALT,
      chips: ["Full HD stick", "Voice remote", "HDMI"],
    },
    {
      id: K4_ID,
      slug: K4_SLUG,
      product: k4,
      name: "ONN Google TV 4K",
      body: "2023 4K box for a 4K TV.",
      image: K4_IMG,
      alt: K4_ALT,
      chips: ["4K box", "Voice remote", "HDMI"],
    },
  ];

  return (
    <div className="stg min-h-screen">
      <StagingHeader />
      <main id="main-content">
        <section className="stg-hero" aria-labelledby="hero-title">
          <div className="stg-shell stg-hero-grid py-14">
            <div className="stg-hero-copy">
              <p className="text-sm font-semibold tracking-[0.14em] text-[#79D5FF]">TWO WAYS TO WATCH</p>
              <h1 id="hero-title" className="mt-4">A Google TV package, or a plan for the box you already own.</h1>
              <p className="mt-5 text-[#D5DEE8]">
                StreamStickPro sells ONN Google TV hardware with a 1-year live TV plan, or a live TV plan alone. Fire Stick hardware is not sold. Checkout is United States and Canada.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#packages"><span className="stg-btn stg-btn-primary">Shop Google TV packages</span></a>
                <a href="#plans"><span className="stg-btn stg-btn-secondary">Shop live TV plans</span></a>
              </div>
            </div>
            <div className="stg-product-panel mt-8 lg:mt-0">
              <img src={K4_IMG} alt={K4_ALT} width="800" height="640" />
              <p className="mt-3 text-sm text-[#536275]">Retail-box app logos are apps on Google TV. Separate store subscriptions may be required.</p>
            </div>
          </div>
        </section>

        <section className="bg-[#FCFBF7] stg-section">
          <div className="stg-shell">
            <div className="stg-trust">
              {[
                ["Pay here", "Secure checkout for the United States and Canada."],
                ["Email next", "Login credentials and the educational setup video."],
                ["Then watch", "Live TV, movies, series, and sports on the plan you buy."],
                ["Get help", "Setup, billing, and model questions at support@streamstickpro.com."],
              ].map(([title, text]) => (
                <article key={title}>
                  <h3 className="text-[18px]">{title}</h3>
                  <p className="mt-2 text-[15px] text-[#536275]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#F5F2EA] stg-section" aria-labelledby="start-title">
          <div className="stg-shell">
            <h2 id="start-title">Start with what you have at home</h2>
            <div className="stg-two mt-6">
              <article className="stg-panel">
                <h3>I need a streaming device</h3>
                <p className="mt-2 text-[#536275]">An ONN Google TV ships. The email has the video, login, and a 1-year live TV plan.</p>
                <a href="#packages"><span className="stg-btn stg-btn-primary mt-5">See HD and 4K</span></a>
              </article>
              <article className="stg-panel">
                <h3>I already have a device</h3>
                <p className="mt-2 text-[#536275]">Nothing ships. Pick how long you want to watch and how many devices to activate.</p>
                <a href="#plans"><span className="stg-btn stg-btn-secondary-light mt-5">See plan cards</span></a>
              </article>
            </div>
            <div className="stg-panel mt-4">
              <h3 id="finder-title">What are you watching on?</h3>
              <p className="mt-2 text-[#536275]">Pick a type so we can point you to the matching setup video.</p>
              <div className="stg-finder mt-4">
                {FINDER.map((label) => (
                  <label key={label}>
                    <input type="radio" name="stg-device" value={label} checked={finder === label} onChange={() => setFinder(label)} />
                    {label}
                  </label>
                ))}
              </div>
              <button type="button" className="stg-btn stg-btn-primary mt-4" onClick={showFinder}>
                Show my next step
              </button>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={remember} onChange={(e) => onRemember(e.target.checked)} />
                Remember this on this browser
              </label>
              <div className="mt-4 rounded-xl bg-[#FCFBF7] p-4" aria-live="polite">
                {!finderShown ? (
                  <p>Choose a device type, then show your next step.</p>
                ) : (
                  <>
                    <p className="font-semibold">{finder} next step</p>
                    <p className="mt-2 text-[#536275]">A type is not a tested model. Send the exact model number if you want support to confirm a plan.</p>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <Link href="/setup/#firestick"><span className="underline">Fire Stick video</span></Link>
                      <Link href="/setup/#onn-google"><span className="underline">ONN Google TV video</span></Link>
                      <Link href="/contact/?topic=compatibility"><span className="underline">Send model number</span></Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="packages" className="bg-[#FCFBF7] stg-section" aria-labelledby="hardware-title">
          <div className="stg-shell">
            <h2 id="hardware-title">Google TV packages</h2>
            <p className="mt-3 max-w-3xl text-[#536275]">Same contents. Different picture. Choose HD or 4K for the TV you have, the way a device store compares two streamers.</p>
            <div className="stg-device-grid mt-8">
              {packages.map((item) => (
                <article key={item.id} className="stg-device-card">
                  <div className="stg-story-media">
                    <img src={item.image} alt={item.alt} width="800" height="640" />
                  </div>
                  <div className="p-5">
                    <h3>{item.product?.name || item.name}</h3>
                    <p className="mt-2 text-[#536275]">{item.body}</p>
                    <div className="stg-chips">
                      {item.chips.map((chip) => (
                        <span key={chip} className="stg-chip">{chip}</span>
                      ))}
                    </div>
                    <p className="mt-4 text-[32px] font-bold">
                      {status === "loading" ? "Loading…" : item.product ? money(item.product.price) : "See product page"}
                    </p>
                    <p className="text-sm text-[#536275]">{stockLabel(item.product?.availability)}</p>
                    <p className="mt-3 text-sm text-[#536275]">In the box: ONN hardware and voice remote. In the email: setup video, login, 1-year live TV plan.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" className="stg-btn stg-btn-primary" onClick={() => addPackage(item.product)} disabled={!item.product}>
                        Add package
                      </button>
                      <Link href={publicDevicePath(item.slug)}><span className="stg-btn stg-btn-secondary-light">Details</span></Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="plans" className="bg-[#08111F] text-[#F8FAFC] stg-section" aria-labelledby="plan-title">
          <div className="stg-shell">
            <h2 id="plan-title">Live TV plan cards</h2>
            <p className="mt-3 max-w-3xl text-[#C9D4DF]">
              Same service on every card. You only change length and how many devices you activate. No hardware ships.
            </p>
            <fieldset className="mt-6">
              <legend className="font-semibold">How many devices do you want to activate?</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="stg-opt"
                    aria-pressed={devices === n}
                    onClick={() => setDevices(n)}
                  >
                    {n} {n === 1 ? "device" : "devices"}
                  </button>
                ))}
              </div>
            </fieldset>
            {status === "loading" ? <p className="mt-6">Loading current plans…</p> : null}
            {status === "error" ? (
              <p className="mt-6">
                Plans could not load. <button type="button" className="stg-btn stg-btn-primary ml-2" onClick={retry}>Retry</button>
              </p>
            ) : null}
            <div className="stg-plan-grid mt-6">
              {DURATIONS.map((row) => {
                const plan = byId(iptvRealProductId(row.key, devices));
                return (
                  <article key={row.key} className="stg-plan-card" data-on={duration === row.key ? "true" : "false"}>
                    <p className="text-sm text-[#A8B6C8]">{row.note}</p>
                    <h3 className="mt-1 text-[20px]">{row.label}</h3>
                    <p className="mt-2 text-[28px] font-bold">
                      {status === "loading" ? "…" : plan ? money(plan.price) : "—"}
                    </p>
                    <p className="mt-1 text-sm text-[#A8B6C8]">{devices} device{devices === 1 ? "" : "s"}</p>
                    <ul>
                      {PLAN_CARD_POINTS.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="stg-btn stg-btn-primary mt-4 w-full"
                      disabled={!plan}
                      onClick={() => addPlan(row.key)}
                    >
                      {plan ? "Add this plan" : "Not in catalog"}
                    </button>
                  </article>
                );
              })}
            </div>
            <div className="stg-two mt-8">
              <article className="rounded-[16px] border border-[#233145] p-5">
                <h3>What you watch</h3>
                <ul className="mt-3 space-y-2 text-[#C9D4DF]">
                  {PLAN_INCLUDES.watch.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="rounded-[16px] border border-[#233145] p-5">
                <h3>What arrives after you pay</h3>
                <ul className="mt-3 space-y-2 text-[#C9D4DF]">
                  {PLAN_INCLUDES.afterOrder.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
            <p className="mt-6 text-sm text-[#A8B6C8]">
              <Link href="/36hr-trial"><span className="underline">36-hour trial is a request</span></Link>
              , not instant access.{" "}
              <Link href="/terms"><span className="underline">Terms</span></Link>
            </p>
          </div>
        </section>

        <section className="bg-[#FCFBF7] stg-section" aria-labelledby="how-title">
          <div className="stg-shell">
            <h2 id="how-title">How an order works</h2>
            <div className="stg-steps mt-6">
              <article>
                <h3>Choose and pay</h3>
                <p className="mt-2 text-[#536275]">Pick a Google TV package or a live TV plan. Checkout is United States and Canada.</p>
              </article>
              <article>
                <h3>Open the email</h3>
                <p className="mt-2 text-[#536275]">A package email includes the setup video, login, and 1-year plan. A plan email includes the login and setup video. Hardware ships only with a package.</p>
              </article>
              <article>
                <h3>Follow the matching video</h3>
                <p className="mt-2 text-[#536275]">Use the Fire Stick or ONN Google TV guide. If a step looks different, email the model and the screen you are on.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-[#F5F2EA] stg-section" aria-labelledby="setup-title">
          <div className="stg-shell">
            <h2 id="setup-title">Setup videos</h2>
            <p className="mt-3 max-w-3xl text-[#536275]">
              These are the public media-player previews. The email with your credentials also has the educational setup video for that order.
            </p>
            <div className="mt-8">
              <SetupGuideVideos compact />
            </div>
          </div>
        </section>

        <section className="bg-[#08111F] text-[#F8FAFC] stg-section" aria-labelledby="vpn-title">
          <div className="stg-shell">
            <h2 id="vpn-title">Optional VPN cards</h2>
            <p className="mt-3 max-w-3xl text-[#C9D4DF]">
              A VPN is not the live TV plan. Stay on StreamStickPro first, then continue to Surfshark if you want the add-on.
            </p>
            <div className="mt-8">
              <SurfsharkOfferCards source="/" mode="inbound" />
            </div>
            <Link href="/vpn"><span className="stg-btn stg-btn-secondary mt-8">Read the VPN guide</span></Link>
          </div>
        </section>

        <section className="bg-[#F5F2EA] stg-section" aria-labelledby="faq-title">
          <div className="stg-shell">
            <h2 id="faq-title">Before you buy</h2>
            <div className="mt-6 max-w-[800px] space-y-3">
              {[
                ["Do you sell Fire Stick hardware?", "No. Streamers that sell loaded Fire Sticks are a different kind of shop. If you already own a Fire Stick, buy a live TV plan and use the Fire Stick setup video."],
                ["What is in a Google TV package?", "The ONN hardware in the photo, the voice remote, a 1-year live TV plan, login credentials, and an educational setup video by email."],
                ["What is in a live TV plan?", "The service only: live TV, movies, series, and sports on the plan you buy, plus login and the setup video by email. Nothing ships."],
                ["Is the trial instant?", "No. You request 36 hours. Support writes back. It is not a free device."],
                ["Which player do I install?", "Use the player named in your order email. The public videos show the general Fire Stick and ONN Google TV flow."],
                ["Do I need a VPN?", "Only if you want one. It is optional and sold by Surfshark, not as part of the 1-year plan."],
              ].map(([q, a]) => (
                <details key={q} className="stg-panel">
                  <summary className="cursor-pointer font-semibold">{q}</summary>
                  <p className="mt-3 text-[#536275]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <StagingFooter />
    </div>
  );
}
