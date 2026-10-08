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

const DURATIONS: { key: IptvDurationKey; label: string; note: string; months: number }[] = [
  { key: "1mo", label: "1 Month", note: "Shortest plan", months: 1 },
  { key: "3mo", label: "3 Months", note: "A season", months: 3 },
  { key: "6mo", label: "6 Months", note: "Half year", months: 6 },
  { key: "1yr", label: "1 Year", note: "Most common", months: 12 },
  { key: "2yr", label: "2 Years", note: "Longest plan", months: 24 },
];

const WORKS_ON = ["Fire TV", "Google TV", "ONN", "Android TV", "Smart TV"] as const;

function householdHint(count: number): string {
  if (count === 1) return "One TV you want us to activate.";
  if (count <= 3) return "A living room plus one or two more TVs.";
  return "A larger household. Pick one card for every device you want activated.";
}

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
      featured: true,
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
              <h1 id="hero-title" className="mt-4">A Google TV package, or a live TV plan for the TV you already have.</h1>
              <p className="mt-5 text-[#F8FAFC]">
                Take home an ONN Google TV with a 1-year live TV plan. Or keep the Fire Stick, Google TV, or smart TV you own and start with 36 hours before you buy.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#trial"><span className="stg-btn stg-btn-primary">Request the 36-hour trial</span></a>
                <a href="#packages"><span className="stg-btn stg-btn-secondary">Shop Google TV packages</span></a>
                <a href="#plans"><span className="stg-btn stg-btn-secondary">Shop live TV plans</span></a>
              </div>
            </div>
            <div className="stg-product-panel mt-8 lg:mt-0">
              <img src={K4_IMG} alt={K4_ALT} width="800" height="640" />
              <p className="mt-3 text-sm text-[#0B1220]">ONN Google TV 4K. App logos on the box are Google TV apps. Those apps can need their own subscriptions.</p>
            </div>
          </div>
        </section>

        <section className="stg-section" aria-labelledby="after-title">
          <div className="stg-shell">
            <article className="stg-glass">
              <h2 id="after-title">What happens after you order</h2>
              <p className="mt-4 max-w-3xl text-[#3A4658]">
                You check out for the United States or Canada. We email your login and the Fire Stick setup video, the same one we send with a trial. You follow that video, then watch live TV on the plan you bought. If a screen does not match, email support@streamstickpro.com and tell us the model.
              </p>
              <p className="stg-works-label mt-6">A plan is for a device you already own</p>
              <ul className="stg-works-list">
                {WORKS_ON.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="stg-section" aria-labelledby="start-title">
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
                <p className="mt-2 text-[#536275]">Tell us the device. We will point you to the Fire Stick video or the ONN Google TV video.</p>
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
                    <p className="mt-2 text-[#536275]">Open the matching setup video, or email the model number and we will confirm the plan fits.</p>
                    <div className="mt-3 flex flex-wrap gap-4">
                      <Link href="/setup/#firestick"><span className="underline">Fire Stick video</span></Link>
                      <Link href="/setup/#onn-google"><span className="underline">ONN Google TV video</span></Link>
                      <Link href="/contact/?topic=compatibility"><span className="underline">Send model number</span></Link>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="stg-table-wrap mt-8" aria-labelledby="compare-title">
              <h2 id="compare-title" className="mb-4">Package or plan</h2>
              <table className="stg-table">
                <caption className="sr-only">What ships with a Google TV package versus a live TV plan</caption>
                <thead>
                  <tr>
                    <th scope="col">You get</th>
                    <th scope="col">Google TV package</th>
                    <th scope="col">Live TV plan</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Hardware", "ONN stick or 4K box plus voice remote", "Nothing ships"],
                    ["Live TV", "1-year plan in the order email", "The length you pick on the cards"],
                    ["Login and video", "Credentials plus educational setup video", "Credentials plus educational setup video"],
                    ["Best if", "You need a player for the TV", "You already own Fire Stick, Google TV, ONN, Android TV, or a smart TV"],
                  ].map(([row, pack, plan]) => (
                    <tr key={row}>
                      <th scope="row">{row}</th>
                      <td>{pack}</td>
                      <td>{plan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="stg-compare-stack mt-8" aria-labelledby="compare-title-m">
              <h2 id="compare-title-m">Package or plan</h2>
              <article className="stg-panel">
                <h3>Google TV package</h3>
                <p className="mt-2 text-[#536275]">ONN hardware ships. Email has login, setup video, and a 1-year live TV plan.</p>
              </article>
              <article className="stg-panel">
                <h3>Live TV plan</h3>
                <p className="mt-2 text-[#536275]">Nothing ships. You pick length and how many devices to activate. Same login and setup video by email.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="packages" className="stg-section" aria-labelledby="hardware-title">
          <div className="stg-shell">
            <h2 id="hardware-title">Google TV packages</h2>
            <p className="mt-3 max-w-3xl text-[#F8FAFC]">Same contents. Different picture. Choose HD or 4K for the TV you have.</p>
            <div className="stg-device-grid mt-8">
              {packages.map((item) => (
                <article key={item.id} className="stg-device-card">
                  <div className="stg-story-media">
                    {"featured" in item && item.featured ? <p className="stg-badge">Best for a 4K TV</p> : null}
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

        <section id="trial" className="stg-section" aria-labelledby="trial-title">
          <div className="stg-shell">
            <article className="stg-trial">
              <div>
                <p className="text-sm font-semibold tracking-[0.14em] text-[#23C768]">TRY IT BEFORE A PLAN</p>
                <h2 id="trial-title" className="mt-3">36-hour live TV trial</h2>
                <p className="mt-4 max-w-xl text-[#F8FAFC]">
                  Already own a Fire Stick, Google TV, ONN, or smart TV? Request 36 hours of live TV before you choose a subscription. We email you back. No device ships with the trial.
                </p>
              </div>
              <div>
                <Link href="/36hr-trial"><span className="stg-btn stg-btn-primary w-full">Request the 36-hour trial</span></Link>
                <a href="#plans"><span className="stg-btn stg-btn-secondary mt-3 w-full">Or see the plans</span></a>
              </div>
            </article>
          </div>
        </section>

        <section id="plans" className="stg-section" aria-labelledby="plan-title">
          <div className="stg-shell">
            <h2 id="plan-title">Live TV plans</h2>
            <p className="mt-3 max-w-3xl text-[#F8FAFC]">
              Same live TV on every card. Pick the length and how many devices to activate. Nothing ships.
            </p>
            <fieldset className="mt-6">
              <legend className="font-semibold">How many TVs should this plan cover?</legend>
              <p className="mt-2 max-w-3xl text-sm text-[#D5DEE8]">
                Pick a number for this order. One card covers that many devices.
              </p>
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
              <p className="mt-3 text-sm text-[#C9D4DF]" aria-live="polite">{householdHint(devices)}</p>
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
                const recommended = row.key === "1yr";
                return (
                  <article key={row.key} className="stg-plan-card" data-on={duration === row.key || recommended ? "true" : "false"} data-featured={recommended ? "true" : "false"}>
                    {recommended ? <p className="stg-badge stg-badge-dark">Most common</p> : null}
                    <p className="text-sm text-[#A8B6C8]">{row.note}</p>
                    <h3 className="mt-1 text-[20px]">{row.label}</h3>
                    <p className="mt-2 text-[28px] font-bold">
                      {status === "loading" ? "…" : plan ? money(plan.price) : "—"}
                    </p>
                    <p className="mt-1 text-sm text-[#A8B6C8]">
                      {devices} device{devices === 1 ? "" : "s"}
                      {plan && row.months > 1 ? ` · ${money(Math.round(plan.price / row.months))} / mo` : ""}
                    </p>
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
              <article className="rounded-[16px] border border-[#233145] bg-[#111c2e] p-5">
                <h3>What you watch</h3>
                <ul className="mt-3 space-y-2 text-[#C9D4DF]">
                  {PLAN_INCLUDES.watch.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="rounded-[16px] border border-[#233145] bg-[#111c2e] p-5">
                <h3>What arrives after you pay</h3>
                <ul className="mt-3 space-y-2 text-[#C9D4DF]">
                  {PLAN_INCLUDES.afterOrder.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
            <p className="mt-6 text-sm text-[#D5DEE8]">
              Still deciding? <a href="#trial" className="underline">The 36-hour trial is above these plans.</a>{" "}
              <Link href="/terms"><span className="underline">Terms</span></Link>
            </p>
          </div>
        </section>

        <section id="vpn" className="stg-section" aria-labelledby="vpn-title">
          <div className="stg-shell">
            <h2 id="vpn-title">VPN products</h2>
            <p className="mt-3 max-w-3xl text-[#F8FAFC]">
              Surfshark VPN, Antivirus, and Adblock are products on this site. Open a card here first. You only leave for Surfshark if you decide to buy one.
            </p>
            <div className="mt-8">
              <SurfsharkOfferCards source="/" mode="inbound" />
            </div>
          </div>
        </section>

        <section className="stg-section" aria-labelledby="how-title">
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

        <section className="stg-section" aria-labelledby="setup-title">
          <div className="stg-shell">
            <h2 id="setup-title">Setup videos</h2>
            <p className="mt-3 max-w-3xl text-[#F8FAFC]">
              The Fire Stick box is the video we email with trials and subscriptions. The ONN box is a walkthrough for putting a media player on an ONN Google TV.
            </p>
            <div className="mt-8">
              <SetupGuideVideos compact />
            </div>
          </div>
        </section>

        <section className="stg-section" aria-labelledby="faq-title">
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
                ["Is the price on the card the price I pay?", "Yes. Package and plan totals come from the live catalog. Longer plans also show that total divided by the months on the card."],
                ["What if I already own a Fire Stick?", "Buy a live TV plan. Use the Fire Stick setup video. We do not sell jailbroken or loaded Fire Stick hardware."],
                ["How do refunds work?", "Read the refund page before you pay. Support is support@streamstickpro.com."],
              ].map(([q, a]) => (
                <details key={q} className="stg-panel">
                  <summary className="cursor-pointer font-semibold">{q}</summary>
                  <p className="mt-3 text-[#536275]">
                    {q === "How do refunds work?" ? (
                      <>
                        Read the <Link href="/refund"><span className="underline">refund page</span></Link> before you pay. Support is support@streamstickpro.com.
                      </>
                    ) : (
                      a
                    )}
                  </p>
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
