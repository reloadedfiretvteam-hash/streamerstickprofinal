import { useEffect, useState } from "react";
import { Link } from "wouter";
import { iptvRealProductId, type IptvDurationKey } from "@/lib/iptv-sku";
import { setPageMeta } from "@/lib/seo";
import { useCart } from "@/lib/store";
import { HD_ID, HD_SLUG, K4_ID, K4_SLUG, publicDevicePath } from "@/lib/device-skus";
import { K4_IMG, HD_IMG, packageImage } from "@/lib/package-art";
import { useShopCatalog } from "@/lib/use-shop-catalog";
import { StagingFooter, StagingHeader } from "@/components/staging/StagingChrome";
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

function contentsFromDescription(description: string) {
  const text = description.toLowerCase();
  const items: string[] = [];
  if (/onn|google tv|device/.test(text)) items.push("ONN Google TV hardware named in the catalog description");
  if (/remote/.test(text)) items.push("Voice remote");
  if (/tutorial|guide/.test(text)) items.push("Web tutorial");
  if (/login|credential/.test(text)) items.push("Login credentials");
  if (/live tv|service/.test(text)) items.push("Live TV service as described in the catalog");
  return items.slice(0, 4);
}

function serviceTerm(description: string) {
  const match = description.match(/(\d+[-\s]?(year|yr|month|mo)s?)/i);
  return match ? match[0] : null;
}

export default function StagingHome() {
  const { addItem, openCart } = useCart();
  const { products, status, retry, hd, k4, byId, money, stockLabel } = useShopCatalog();
  const [devices, setDevices] = useState(1);
  const [duration, setDuration] = useState<IptvDurationKey>("1yr");
  const [finder, setFinder] = useState("");
  const [finderShown, setFinderShown] = useState(false);
  const [remember, setRemember] = useState(false);
  const [openInclude, setOpenInclude] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setPageMeta({
      title: "Staging preview | StreamStickPro",
      description: "Protected staging storefront for StreamStickPro review. Not the public homepage.",
      path: "/staging",
      noindex: true,
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
      body: "An ONN Full HD Google TV stick with a voice remote and setup guidance. Review the included service and package details before ordering.",
      image: HD_IMG,
      alt: "ONN Full HD Google TV streaming stick with voice remote and retail box.",
      cta: "View HD Package",
      reverse: false,
    },
    {
      id: K4_ID,
      slug: K4_SLUG,
      product: k4,
      eyebrow: "FOR A 4K SETUP",
      name: "ONN Google TV 4K Package",
      body: "A 4K-capable ONN Google TV device with a voice remote and setup guidance. Review the included service and package details before ordering.",
      image: K4_IMG,
      alt: "ONN 4K Google TV streaming box with voice remote and retail box.",
      cta: "View 4K Package",
      reverse: true,
    },
  ];

  return (
    <div className="stg min-h-screen">
      <p className="bg-[#18263B] px-4 py-2 text-center text-sm text-[#F8FAFC]">
        Staging preview for review. The public homepage is unchanged. <Link href="/"><span className="underline">View live site</span></Link>
      </p>
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
              <img src={K4_IMG} alt="ONN 4K Google TV streaming box with voice remote and retail box." width="800" height="640" />
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
                <p>Choose a device, then select Show My Options.</p>
              ) : (
                <>
                  <p className="font-semibold">We have not confirmed this setup.</p>
                  <p className="mt-2 text-[#536275]">
                    {finder} is a category, not a tested model. Send the exact model number before ordering a plan.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <Link href="/compatibility/"><span className="underline">Check Compatibility</span></Link>
                    <Link href="/setup/"><span className="underline">Setup guides</span></Link>
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
            <h2 id="hardware-title">Need the whole setup? Start here.</h2>
            <p className="mt-4 max-w-3xl text-[#536275]">Compare the HD and 4K packages, see what each includes, and choose the hardware that fits your TV.</p>
            <div className="mt-10 grid gap-8">
              {stories.map((story) => {
                const included = contentsFromDescription(story.product?.description || "");
                const term = story.product ? serviceTerm(story.product.description) : null;
                return (
                  <article key={story.id} className={`stg-story ${story.reverse ? "stg-story-rev" : ""}`}>
                    <div className="stg-story-media">
                      <img src={story.image} alt={story.alt} width="800" height="640" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-[0.12em] text-[#536275]">{story.eyebrow}</p>
                      <h3 className="mt-2">{story.product?.name || story.name}</h3>
                      <p className="mt-3 text-[#536275]">{story.body}</p>
                      <p className="mt-4 text-[32px] font-bold">
                        {status === "loading" ? "Loading current price…" : story.product ? money(story.product.price) : "Price not in catalog"}
                      </p>
                      <p className="mt-2 text-sm text-[#536275]">Catalog ID: {story.id}</p>
                      {term ? <p className="mt-2">Included service listed as: {term}</p> : <p className="stg-flag">Included service duration is not a separate catalog field. Read the package description before ordering.</p>}
                      {included.length ? (
                        <ul className="mt-4 list-disc pl-5 text-[#536275]">
                          {included.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="stg-flag">No structured contents list is in the catalog yet. Use What’s Included on the product page.</p>
                      )}
                      <button type="button" className="stg-btn stg-btn-secondary-light mt-4" aria-expanded={openInclude === story.id} onClick={() => setOpenInclude(openInclude === story.id ? null : story.id)}>
                        What’s Included
                      </button>
                      {openInclude === story.id ? (
                        <p className="mt-3 text-sm text-[#536275]">
                          {story.product?.description || "The catalog has not published a contents list for this SKU."}
                        </p>
                      ) : null}
                      <div className="mt-6">
                        <Link href={publicDevicePath(story.slug)}><span className="stg-btn stg-btn-primary">{story.cta}</span></Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="mt-8">
              <Link href="/plans/"><span className="underline">Already own a device? View plans.</span></Link>
            </p>
            <p className="mt-4 max-w-3xl text-sm text-[#536275]">
              4K describes the hardware’s supported output. Picture quality depends on the content, TV, app, and internet connection.
            </p>
            <p className="stg-flag">
              The three specified studio/reference photographs were not in the project files. These panels use the existing StreamStickPro package images until the supplied files are added under /images/staging/ and hardware match plus reuse rights are confirmed.
            </p>
          </div>
        </section>

        <section className="bg-[#EDF3F7] stg-section" aria-labelledby="compare-title">
          <div className="stg-shell">
            <h2 id="compare-title">HD or 4K? Pick for the TV you have.</h2>
            <p className="mt-4 max-w-3xl text-[#536275]">Compare the hardware and package details side by side.</p>
            {(() => {
              const rows = [
                ["Maximum device output", hd?.name.includes("HD") ? "Full HD, from the catalog name" : "See catalog name", k4?.name.includes("4K") ? "4K, from the catalog name" : "See catalog name"],
                ["Best fit", "Not a catalog field", "Not a catalog field"],
                ["Exact hardware model", "Not a separate model field in catalog", "Not a separate model field in catalog"],
                ["Included physical items", contentsFromDescription(hd?.description || "").join("; ") || "See description", contentsFromDescription(k4?.description || "").join("; ") || "See description"],
                ["Included service term", serviceTerm(hd?.description || "") || "Not listed as its own field", serviceTerm(k4?.description || "") || "Not listed as its own field"],
                ["Setup guidance", /tutorial|guide/i.test(hd?.description || "") ? "Tutorial mentioned in description" : "See package page", /tutorial|guide/i.test(k4?.description || "") ? "Tutorial mentioned in description" : "See package page"],
                ["Current price", status === "loading" ? "Loading current price…" : hd ? money(hd.price) : "Not in catalog", status === "loading" ? "Loading current price…" : k4 ? money(k4.price) : "Not in catalog"],
                ["Stock status", stockLabel(hd?.availability), stockLabel(k4?.availability)],
              ] as const;
              return (
                <>
                  <div className="stg-compare-stack mt-8">
                    {["HD Package", "4K Package"].map((label, idx) => (
                      <article key={label} className="stg-panel" style={{ borderRadius: 18 }}>
                        <h3>{label}</h3>
                        <dl className="mt-4 space-y-3">
                          {rows.map(([feature, a, b]) => (
                            <div key={feature}>
                              <dt className="font-semibold">{feature}</dt>
                              <dd className="text-[#536275]">{idx === 0 ? a : b}</dd>
                            </div>
                          ))}
                        </dl>
                      </article>
                    ))}
                  </div>
                  <div className="stg-table-wrap mt-8">
                    <table className="stg-table">
                      <thead>
                        <tr>
                          <th>Feature</th>
                          <th>HD Package</th>
                          <th>4K Package</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(([feature, a, b]) => (
                          <tr key={feature}>
                            <th scope="row">{feature}</th>
                            <td>{a}</td>
                            <td>{b}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
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
                  <p className="mt-2 text-[#C9D4DF]">Use compatibility for the exact model. This configurator only selects catalog plans.</p>
                  <fieldset className="mt-6">
                    <legend className="font-semibold">How many devices do you want to activate?</legend>
                    <p className="mt-2 text-sm text-[#A8B6C8]">This catalog uses device allowance. Simultaneous streams means how many streams can play at the same time. It is separate from the number of devices you own. This catalog does not list a simultaneous-stream field.</p>
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
                  <h3>Your Plan</h3>
                  {selectedPlan ? (
                    <>
                      <p className="mt-3">{selectedPlan.name}</p>
                      <p className="mt-2 text-[32px] font-bold">{money(selectedPlan.price)}</p>
                      <p className="mt-2 text-sm text-[#A8B6C8]">Device allowance: {devices}. Duration: {DURATIONS.find((d) => d.key === duration)?.label}.</p>
                      <p className="stg-flag">Renewal arrangement is not a field on this catalog record. Read Terms before checkout.</p>
                      <p className="mt-4">Your order email provides the login and setup instructions.</p>
                      <Link href="/setup/"><span className="mt-3 inline-block underline">Relevant setup guide</span></Link>
                      {" · "}
                      <Link href="/terms"><span className="underline">Terms</span></Link>
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
            <p className="mt-6 text-sm text-[#A8B6C8]">
              <Link href="/36hr-trial"><span className="underline">Review trial terms</span></Link> if you already own a compatible device. Eligibility is confirmed by support, not at this step.
            </p>
          </div>
        </section>

        <section className="bg-[#FCFBF7] stg-section" aria-labelledby="compat-title">
          <div className="stg-shell">
            <h2 id="compat-title">Check the device you already own.</h2>
            <p className="mt-4 max-w-3xl text-[#536275]">Compatibility depends on the exact model, platform, and supported player. Check the details before choosing a plan.</p>
            <ul className="mt-8 space-y-4">
              {["Fire TV", "Google TV", "ONN", "Android TV", "Smart TV"].map((row) => (
                <li key={row} className="stg-panel">
                  <h3>{row}</h3>
                  <p className="mt-2">Status: Check With Support</p>
                  <p className="mt-2 text-[#536275]">No tested model/OS/player record is attached to this category alone.</p>
                  <div className="mt-4 flex gap-4">
                    <Link href="/compatibility/"><span className="underline">Details</span></Link>
                    <Link href="/setup/"><span className="underline">Guide</span></Link>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-8">
              Don’t see your device? <Link href="/contact/?topic=compatibility"><span className="underline">Send us its model number.</span></Link>
            </p>
          </div>
        </section>

        <section className="bg-[#F5F2EA] stg-section" aria-labelledby="how-title">
          <div className="stg-shell">
            <h2 id="how-title">A clear next step, whichever path you choose.</h2>
            <div className="stg-two mt-10">
              <details className="stg-panel" open>
                <summary className="cursor-pointer font-semibold">I Need a Device</summary>
                <ol className="mt-4 list-decimal space-y-3 pl-5">
                  <li><strong>Choose your package.</strong> Compare the hardware and included items.</li>
                  <li><strong>Review your order.</strong> Confirm the package terms, price, and delivery details.</li>
                  <li><strong>Follow your setup guide.</strong> Use the instructions for the device you ordered.</li>
                </ol>
                <p className="mt-4 text-sm text-[#536275]">If a package already includes service, you do not buy a second plan unless you want another device allowance.</p>
              </details>
              <details className="stg-panel" open>
                <summary className="cursor-pointer font-semibold">I Have a Device</summary>
                <ol className="mt-4 list-decimal space-y-3 pl-5">
                  <li><strong>Check compatibility.</strong> Confirm the model and supported setup path.</li>
                  <li><strong>Choose your plan.</strong> Review the duration, device allowance, renewal terms, and price.</li>
                  <li><strong>Follow your setup guide.</strong> Use the instructions for your existing device.</li>
                </ol>
              </details>
            </div>
          </div>
        </section>

        <section className="bg-[#18263B] text-[#F8FAFC] stg-section" aria-labelledby="setup-title">
          <div className="stg-shell">
            <h2 id="setup-title">The right guide for the device in front of you.</h2>
            <p className="mt-4 max-w-3xl text-[#C9D4DF]">Start with your device, then follow the matching instructions. If a step looks different, contact support with the model and the screen you’re on.</p>
            <p className="mt-3 text-sm text-[#A8B6C8]">Keep passwords and account details out of screenshots you share.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/setup/"><span className="stg-btn stg-btn-primary">Open Setup Center</span></Link>
              <Link href="/support/"><span className="stg-btn stg-btn-secondary">Get Setup Help</span></Link>
            </div>
          </div>
        </section>

        <section className="bg-[#FCFBF7] stg-section" aria-labelledby="walk-title">
          <div className="stg-shell">
            <h2 id="walk-title">See the setup steps before you order.</h2>
            <p className="mt-4 max-w-3xl text-[#536275]">These guides explain the general setup process. Your order email provides the instructions and login details for your selected package or plan.</p>
            <ol className="mt-8 max-w-[720px] list-decimal space-y-3 pl-5">
              <li>Identify your device.</li>
              <li>Review your package or plan.</li>
              <li>Open the matching setup guide.</li>
            </ol>
            <Link href="/setup/"><span className="stg-btn stg-btn-primary mt-8">Read the Setup Walkthrough</span></Link>
          </div>
        </section>

        <section className="bg-[#EDF3F7] stg-section" aria-labelledby="why-title">
          <div className="stg-shell">
            <h2 id="why-title">Make the setup easier to understand.</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                ["Start with what you own.", "Check your current equipment before buying another device."],
                ["See what you’re buying.", "Read the hardware, included items, and terms together."],
                ["Find your guide.", "Open the instructions that match your device."],
                ["Keep the price clear.", "Review the total and renewal terms before checkout."],
                ["Get to the right help.", "Choose setup, billing, or account help from one support hub."],
              ].map(([title, text]) => (
                <article key={title} className="stg-panel">
                  <h3>{title}</h3>
                  <p className="mt-2 text-[#536275]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#FCFBF7] stg-section" aria-labelledby="after-title">
          <div className="stg-shell">
            <h2 id="after-title">Know what happens after checkout.</h2>
            <ol className="mt-8 max-w-[720px] list-decimal space-y-4 pl-5">
              <li>You pay through the existing StreamStickPro checkout. United States and Canada only.</li>
              <li>A Google TV package is a shipped device. A live TV plan does not ship hardware.</li>
              <li>Your order email provides the login and setup instructions.</li>
              <li>If a step does not match the screen in front of you, contact support with the model number.</li>
            </ol>
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
