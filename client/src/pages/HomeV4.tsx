import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { apiCall } from "@/lib/api";
import { iptvRealProductId, type IptvDurationKey } from "@/lib/iptv-sku";
import { useCart, type Product } from "@/lib/store";
import { setPageMeta } from "@/lib/seo";
import { V4Footer, V4Header } from "@/components/v4/V4Chrome";
import "@/styles/v4.css";

const HD_ID = "android-onn-4k";
const K4_ID = "android-onn-pro";
const HD_IMG = "/images/google-hd-package.webp";
const K4_IMG = "/images/google-4k-package.webp";

const FINDER = [
  { id: "fire-tv", label: "Fire TV" },
  { id: "google-tv", label: "Google TV" },
  { id: "onn", label: "ONN" },
  { id: "android-tv", label: "Android TV" },
  { id: "smart-tv", label: "Smart TV" },
  { id: "not-sure", label: "I’m Not Sure" },
] as const;

const FAQ = [
  ["Do I need a new device?", "Only if you want a Google TV package. If you already have a compatible device, start with a plan and a setup guide."],
  ["Is Fire Stick hardware sold here?", "No. Plans and guides are for a Fire TV you already own."],
  ["What do the Google packages include?", "The device, a tutorial, login credentials, and live TV service. Exact contents are on each product page."],
  ["Where can I check out?", "Checkout stays on the existing Stripe-hosted payment page. Hardware ships to the United States and Canada."],
  ["Is there a trial?", "A 36-hour trial is available for plans. It is a request, not instant access, until support confirms it."],
];

function money(n: number) {
  return `$${n}`;
}

export default function HomeV4() {
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [device, setDevice] = useState("");
  const [shown, setShown] = useState("");
  const [duration, setDuration] = useState<IptvDurationKey | "">("");
  const [streams, setStreams] = useState(1);
  const [hdIncluded, setHdIncluded] = useState(false);
  const [k4Included, setK4Included] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    const inter = document.createElement("link");
    inter.rel = "stylesheet";
    inter.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Sora:wght@600;700&display=swap";
    document.head.appendChild(inter);
    setPageMeta({
      title: "Streaming setup without the setup headache | StreamStickPro",
      description: "Buy a Google TV device package or choose a streaming plan for a compatible device you already own.",
      path: "/",
    });
    apiCall("/api/products")
      .then((res) => res.json())
      .then((result) => {
        const rows = Array.isArray(result?.data) ? result.data : [];
        setProducts(
          rows
            .filter((p: any) => String(p.category || "").toLowerCase() !== "promotion" && !String(p.id || "").startsWith("iptv-promo-") && p.id !== "promo-hardware-200")
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              price: Number(p.price || 0) >= 1000 ? Number(p.price) / 100 : Number(p.price || 0),
              image: p.imageUrl || (p.id === HD_ID ? HD_IMG : p.id === K4_ID ? K4_IMG : ""),
              category: String(p.id || "").includes("onn") ? "firestick" : "iptv",
              description: p.description || "",
            })),
        );
      })
      .catch(() => undefined);
    return () => {
      inter.remove();
    };
  }, []);

  const hd = products.find((p) => p.id === HD_ID);
  const k4 = products.find((p) => p.id === K4_ID);
  const hdPrice = hd?.price ?? 140;
  const k4Price = k4?.price ?? 150;
  const planId = duration ? iptvRealProductId(duration, streams) : "";
  const plan = products.find((p) => p.id === planId);

  const finderCopy = useMemo(() => {
    if (shown === "fire-tv") {
      return {
        title: "You may not need another streaming box.",
        body: "Confirm your exact Fire TV model, then review the plan and setup path.",
        primary: ["Check Fire TV Compatibility", "/compatibility"],
        secondary: ["Open Fire TV Setup", "/setup"],
      };
    }
    if (shown === "google-tv") {
      return {
        title: "Start with your Google TV model.",
        body: "Confirm the hardware and software before choosing a plan.",
        primary: ["Check Google TV Compatibility", "/onn-google-tv"],
        secondary: ["Open Google TV Setup", "/setup"],
      };
    }
    if (shown === "onn") {
      return {
        title: "Do you already own the ONN device?",
        body: "Use the existing-device path if it is already in your home. Compare packages if you need hardware.",
        primary: ["Check My ONN Device", "/onn-google-tv"],
        secondary: ["Compare Device Packages", "/devices"],
      };
    }
    if (shown === "android-tv") {
      return {
        title: "Confirm your Android TV configuration.",
        body: "The exact model and supported player determine the setup path.",
        primary: ["Check Android TV Compatibility", "/compatibility"],
        secondary: ["Open Android TV Setup", "/setup"],
      };
    }
    if (shown === "smart-tv") {
      return {
        title: "Start with the television’s platform.",
        body: "Send the model number if the platform or supported player is unclear.",
        primary: ["Check Smart TV Compatibility", "/compatibility"],
        secondary: ["Send My Model Number", "/support"],
      };
    }
    return {
      title: "We have not confirmed this setup from a category alone.",
      body: "Send the exact model to support before buying if you are unsure.",
      primary: ["Open Device Finder", "/device-finder"],
      secondary: ["Send My Model Number", "/support"],
    };
  }, [shown]);

  const continuePlan = () => {
    if (!plan) return;
    addItem(plan);
    setLocation("/checkout");
  };

  return (
    <div className="v4 min-h-screen">
      <div id="H01" className="bg-[#040A12] text-[#F8FAFC]">
        <div className="v4-shell flex min-h-10 items-center justify-center py-2 text-center text-sm font-semibold">
          <Link href="/device-finder">
            <span className="underline-offset-4 hover:underline">Need help choosing? Find your setup.</span>
          </Link>
        </div>
      </div>
      <V4Header />

      <main id="main-content">
        <section id="H03" className="bg-[#08111F] text-[#F8FAFC]" aria-labelledby="hero-title">
          <div className="v4-shell grid items-center gap-10 py-12 lg:grid-cols-[56fr_44fr] lg:py-24">
            <div className="max-w-[620px]">
              <p className="text-[13px] font-semibold tracking-[0.12em] text-[#79D5FF]">STREAMING MADE SIMPLER</p>
              <h1 id="hero-title" className="mt-4 text-[40px] font-bold leading-[1.12] sm:text-[52px] lg:text-[64px] lg:leading-[1.06]">
                Streaming setup without the setup headache.
              </h1>
              <p className="mt-5 max-w-[550px] text-lg leading-relaxed text-[#C9D4DF] lg:text-xl">
                Buy a Google TV device package or choose a streaming plan for a compatible device you already own.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/devices"><span className="v4-btn v4-btn-primary">Shop Google TV Devices</span></Link>
                <Link href="/plans"><span className="v4-btn v4-btn-secondary-dark">I Already Have a Device</span></Link>
              </div>
              <p className="mt-4">
                <Link href="/device-finder"><span className="v4-link v4-link-light underline">Not sure what you need? Find my setup.</span></Link>
              </p>
            </div>
            <div className="overflow-hidden rounded-3xl bg-[#111C2E] p-4">
              <img src={K4_IMG} alt="ONN Google TV device and remote" className="mx-auto max-h-[340px] w-full object-contain lg:max-h-[520px]" width={800} height={1000} />
            </div>
          </div>
        </section>

        <section id="H04" className="bg-[#FCFBF7]" aria-labelledby="paths-title">
          <div className="v4-shell py-14 lg:py-22">
            <h2 id="paths-title" className="mx-auto max-w-[720px] text-center text-[32px] font-bold lg:text-[42px]">What are you starting with?</h2>
            <p className="mx-auto mt-4 max-w-[620px] text-center text-lg text-[#536275]">Choose the path that matches the equipment in your home.</p>
            <div className="mt-9 grid gap-6 lg:grid-cols-[57fr_43fr]">
              <article className="rounded-[28px] bg-[#EDF3F7] p-6 lg:p-9">
                <h3 className="text-2xl font-bold">I need a streaming device.</h3>
                <p className="mt-3 text-[#536275]">Compare Google TV device packages and see exactly what comes with each one.</p>
                <img src={HD_IMG} alt="" className="mx-auto my-6 max-h-44 object-contain" />
                <Link href="/devices"><span className="v4-btn v4-btn-primary">Shop Devices</span></Link>
              </article>
              <article className="rounded-[28px] bg-[#EAF9F0] p-6 lg:p-9">
                <h3 className="text-2xl font-bold">I already have a device.</h3>
                <p className="mt-3 text-[#536275]">Check your device, choose a plan, and follow the matching setup guide.</p>
                <div className="mt-8">
                  <Link href="/compatibility"><span className="v4-btn v4-btn-secondary-light">Check My Device</span></Link>
                </div>
                <p className="mt-6 text-sm">
                  Want to test before choosing a plan? <Link href="/36hr-trial"><span className="underline">View Trial Details</span></Link>
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="H05" className="bg-[#F5F2EA]" aria-labelledby="finder-title">
          <span id="device-finder" className="sr-only">Device Finder</span>
          <div className="v4-shell py-16">
            <div className="rounded-[28px] bg-white p-6 lg:grid lg:grid-cols-[34fr_66fr] lg:gap-12 lg:p-10">
              <div>
                <h2 id="finder-title" className="text-[32px] font-bold">What are you watching on?</h2>
                <p className="mt-4 text-lg text-[#536275]">Pick your device to find compatibility information and the right setup guide.</p>
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  if (device) setShown(device);
                }}
              >
                <fieldset>
                  <legend className="sr-only">Device</legend>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {FINDER.map((option) => (
                      <label key={option.id} className={`flex min-h-[64px] cursor-pointer items-center justify-center rounded-xl border px-3 text-center font-semibold ${device === option.id ? "border-[#08111F] bg-[#EDF3F7]" : "border-[#D7DFE7]"}`}>
                        <input type="radio" name="device" className="sr-only" value={option.id} checked={device === option.id} onChange={() => setDevice(option.id)} />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <p className="mt-4 text-sm text-[#536275]">{device ? "Ready to see options." : "Choose a device, then select Show My Options."}</p>
                <button type="submit" className="v4-btn v4-btn-primary mt-4" disabled={!device}>
                  Show My Options
                </button>
                {shown ? (
                  <div className="mt-5 rounded-2xl bg-[#EDF3F7] p-6" aria-live="polite">
                    <h3 className="text-xl font-bold">{finderCopy.title}</h3>
                    <p className="mt-2 text-[#536275]">{finderCopy.body}</p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Link href={finderCopy.primary[1]}><span className="v4-btn v4-btn-primary">{finderCopy.primary[0]}</span></Link>
                      <Link href={finderCopy.secondary[1]}><span className="v4-btn v4-btn-secondary-light">{finderCopy.secondary[0]}</span></Link>
                    </div>
                  </div>
                ) : null}
                <p className="mt-4">
                  <Link href="/device-finder"><span className="underline">Open Full Device Finder</span></Link>
                  {" · "}
                  <button type="button" className="underline" onClick={() => { setDevice(""); setShown(""); }}>Change Device</button>
                </p>
              </form>
            </div>
          </div>
        </section>

        <section id="H06" className="bg-[#08111F] text-[#F8FAFC]" aria-labelledby="rail-title">
          <h2 id="rail-title" className="sr-only">Decision rail</h2>
          <div className="v4-shell grid gap-6 py-7 md:grid-cols-3">
            {[
              ["Check before you buy.", "Confirm compatibility for your exact device.", "/compatibility"],
              ["See the package details.", "Review hardware, plan terms, and price together.", "/devices"],
              ["Know your setup path.", "Start with the guide for your equipment.", "/setup"],
            ].map(([title, body, href]) => (
              <Link key={title} href={href}>
                <span className="block">
                  <strong className="block text-lg">{title}</strong>
                  <span className="mt-1 block text-sm text-[#A8B6C8]">{body}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="H07" className="bg-[#FCFBF7]" aria-labelledby="hardware-title">
          <div className="v4-shell py-16 lg:py-24">
            <h2 id="hardware-title" className="max-w-[620px] text-[32px] font-bold lg:text-[42px]">Need the whole setup? Start here.</h2>
            <p className="mt-4 max-w-[620px] text-lg text-[#536275]">Compare the HD and 4K packages, then review the contents before ordering.</p>
            <div className="mt-9 grid gap-9">
              {[
                { id: HD_ID, product: hd, name: "ONN Google TV HD Package", eyebrow: "FOR AN HD SETUP", body: "Review the HD hardware, included items, and setup path in one place.", image: HD_IMG, included: hdIncluded, setIncluded: setHdIncluded, price: hdPrice, href: `/devices/${HD_ID}` },
                { id: K4_ID, product: k4, name: "ONN Google TV 4K Package", eyebrow: "FOR A 4K SETUP", body: "Review the 4K hardware, included items, and setup path in one place.", image: K4_IMG, included: k4Included, setIncluded: setK4Included, price: k4Price, href: `/devices/${K4_ID}` },
              ].map((pack, index) => (
                <article key={pack.id} className={`grid overflow-hidden rounded-[22px] border border-[#D7DFE7] lg:grid-cols-[52fr_48fr] ${index === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                  <div className="flex min-h-[260px] items-center justify-center bg-[#F0F3F5] p-8">
                    <img src={pack.image} alt={`${pack.name} device`} className="max-h-[360px] w-full object-contain" />
                  </div>
                  <div className="p-6 lg:p-10">
                    <p className="text-xs font-semibold tracking-[0.12em] text-[#536275]">{pack.eyebrow}</p>
                    <h3 className="mt-2 text-2xl font-bold">
                      <Link href={pack.href}><span>{pack.name}</span></Link>
                    </h3>
                    <p className="mt-3 text-[#536275]">{pack.body}</p>
                    <p className="mt-4 text-[32px] font-bold">{money(pack.price)}</p>
                    <ul className="mt-3 space-y-1 text-[#536275]">
                      {(pack.included
                        ? ["Device, remote, and packaging", "Written tutorial", "Login credentials by email", "Live TV service with the package"]
                        : ["Google TV device, preloaded", "Tutorial and login by email", "Live TV service included", "Setup path on the product page"]
                      ).map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <Link href={pack.href}><span className="v4-btn v4-btn-primary">{index === 0 ? "View HD Package" : "View 4K Package"}</span></Link>
                      <button type="button" className="v4-btn v4-btn-secondary-light" aria-pressed={pack.included} onClick={() => pack.setIncluded((value) => !value)}>
                        {pack.included ? "Show Device Photo" : "What’s Included"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-8">
              <Link href="/plans"><span className="underline">Already own a device? View plans.</span></Link>
            </p>
          </div>
        </section>

        <section id="H08" className="bg-[#EDF3F7]" aria-labelledby="compare-title">
          <div className="v4-shell py-16">
            <h2 id="compare-title" className="text-center text-[32px] font-bold lg:text-[42px]">HD or 4K? Pick for the TV you have.</h2>
            <p className="mx-auto mt-4 max-w-[620px] text-center text-lg text-[#536275]">Compare the hardware and package details side by side.</p>
            <div className="mt-9 overflow-x-auto rounded-3xl border border-[#D7DFE7] bg-white">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-[#D7DFE7]">
                    <th scope="col" className="p-5">Feature</th>
                    <th scope="col" className="p-5">HD Package</th>
                    <th scope="col" className="p-5">4K Package</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Maximum device output", "Full HD", "4K"],
                    ["Best fit", "HD televisions", "4K televisions"],
                    ["Exact hardware model", "Shown on the HD product page", "Shown on the 4K product page"],
                    ["Included items", "Device, tutorial, credentials, live TV", "Device, tutorial, credentials, live TV"],
                    ["Current price", money(hdPrice), money(k4Price)],
                    ["Stock status", "In stock", "In stock"],
                  ].map(([feature, hdCell, k4Cell]) => (
                    <tr key={feature} className="border-t border-[#D7DFE7]">
                      <th scope="row" className="p-5 font-semibold">{feature}</th>
                      <td className="p-5">{hdCell}</td>
                      <td className="p-5">{k4Cell}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-[#536275]">Device output and streaming content quality are different. Actual picture quality also depends on your TV, connection, and available content.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/devices"><span className="v4-btn v4-btn-secondary-light">Compare All Details</span></Link>
              <Link href={`/devices/${HD_ID}`}><span className="underline">View HD Package</span></Link>
              <Link href={`/devices/${K4_ID}`}><span className="underline">View 4K Package</span></Link>
            </div>
          </div>
        </section>

        <section id="H09" className="bg-[#08111F] text-[#F8FAFC]" aria-labelledby="plan-title">
          <div className="v4-shell py-16 lg:py-24">
            <h2 id="plan-title" className="max-w-[720px] text-[32px] font-bold lg:text-[42px]">Already have the hardware? Choose your plan.</h2>
            <p className="mt-4 max-w-[720px] text-lg text-[#C9D4DF]">Start with compatibility, then review the duration, simultaneous streams, and total price.</p>
            <div className="mt-9 grid gap-8 lg:grid-cols-[55fr_45fr]">
              <div className="rounded-[18px] bg-[#111C2E] p-6 lg:p-8">
                <fieldset className="space-y-3">
                  <legend className="font-semibold">Your Device</legend>
                  {["Fire TV I already own", "Google TV", "ONN", "Android TV"].map((label) => (
                    <label key={label} className="flex min-h-11 items-center gap-2">
                      <input type="radio" name="plan-device" />
                      {label}
                    </label>
                  ))}
                </fieldset>
                <label className="mt-6 block font-semibold">
                  Plan Duration
                  <select className="mt-2 min-h-[50px] w-full rounded-xl border border-[#233145] bg-[#08111F] px-3" value={duration} onChange={(event) => setDuration(event.target.value as IptvDurationKey)}>
                    <option value="">Choose duration</option>
                    <option value="1mo">1 month</option>
                    <option value="3mo">3 months</option>
                    <option value="6mo">6 months</option>
                    <option value="1yr">1 year</option>
                    <option value="2yr">2 years</option>
                  </select>
                </label>
                <label className="mt-6 block font-semibold">
                  Simultaneous Streams
                  <select className="mt-2 min-h-[50px] w-full rounded-xl border border-[#233145] bg-[#08111F] px-3" value={streams} onChange={(event) => setStreams(Number(event.target.value))}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
                <p className="mt-3 text-sm text-[#A8B6C8]">Simultaneous streams means how many streams can play at the same time. It is separate from the number of devices you own.</p>
              </div>
              <aside className="rounded-[18px] bg-[#18263B] p-6 lg:p-8">
                <h3 className="text-2xl font-bold">Your Plan</h3>
                {plan && duration ? (
                  <dl className="mt-4 space-y-2 text-[#C9D4DF]" aria-live="polite">
                    <div className="flex justify-between gap-4"><dt>Duration</dt><dd>{duration}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Simultaneous Streams</dt><dd>{streams}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Total Price</dt><dd>{money(plan.price)}</dd></div>
                  </dl>
                ) : (
                  <p className="mt-4 text-[#A8B6C8]">Select the options above to see an available plan.</p>
                )}
                <button type="button" className="v4-btn v4-btn-primary mt-6 w-full" disabled={!plan} onClick={continuePlan}>
                  Continue to Checkout
                </button>
                <div className="mt-4 space-y-2 text-sm">
                  <Link href="/compatibility"><span className="underline">Check Compatibility</span></Link>
                  <br />
                  <Link href="/terms"><span className="underline">Read plan terms before checkout.</span></Link>
                  <br />
                  <Link href="/36hr-trial"><span className="underline">Want to test first? Review the trial details.</span></Link>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="H10" className="bg-[#FCFBF7]" aria-labelledby="compat-title">
          <div className="v4-shell py-16">
            <h2 id="compat-title" className="text-[32px] font-bold">Check the device you already own.</h2>
            <p className="mt-4 max-w-[640px] text-lg text-[#536275]">Compatibility depends on the exact model, platform, and supported player. Check the details before choosing a plan.</p>
            <div className="mt-8 divide-y divide-[#D7DFE7]">
              {[
                ["Fire TV", "/jailbroken-fire-sticks", "/setup"],
                ["Google TV", "/onn-google-tv", "/setup"],
                ["ONN", "/onn-google-tv", "/setup"],
                ["Android TV", "/iptv-media-players", "/setup"],
                ["Smart TV", "/compatibility", "/support"],
              ].map(([name, details, guide]) => (
                <div key={name} className="grid gap-2 py-5 md:grid-cols-4 md:items-center">
                  <p className="font-semibold">{name}</p>
                  <p>Check With Support</p>
                  <Link href={guide}><span className="underline">Guide</span></Link>
                  <Link href={details}><span className="underline">{name} Details</span></Link>
                </div>
              ))}
            </div>
            <p className="mt-6">
              Don’t see your device? <Link href="/support"><span className="underline">Send us its model number.</span></Link>
            </p>
          </div>
        </section>

        <section id="H11" className="bg-[#F5F2EA]" aria-labelledby="how-title">
          <div className="v4-shell py-16">
            <h2 id="how-title" className="text-[32px] font-bold">A clear next step, whichever path you choose.</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <ol className="space-y-4">
                <li><strong>I Need a Device.</strong> Choose your package. Review your order. Follow your setup guide.</li>
                <li>Compare the hardware and included items. Confirm the package terms, price, and delivery details. Use the instructions for the device you ordered.</li>
              </ol>
              <ol className="space-y-4">
                <li><strong>I Have a Device.</strong> Check compatibility. Choose your plan. Follow your setup guide.</li>
                <li>Confirm the model and supported setup path. Review the duration, streams, renewal terms, and price.</li>
              </ol>
            </div>
          </div>
        </section>

        <section id="H12" className="bg-[#18263B] text-[#F8FAFC]" aria-labelledby="setup-title">
          <div className="v4-shell py-16">
            <h2 id="setup-title" className="text-[32px] font-bold">The right guide for the device in front of you.</h2>
            <p className="mt-4 max-w-[640px] text-[#C9D4DF]">Open the setup center for written steps. Official manufacturer links sit on the guide pages, not as a substitute for our instructions.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/setup"><span className="v4-btn v4-btn-primary">Open Setup Center</span></Link>
              <Link href="/guides"><span className="v4-btn v4-btn-secondary-dark">Written guides</span></Link>
            </div>
          </div>
        </section>

        <section id="H13" className="bg-[#FCFBF7]" aria-labelledby="demo-title">
          <div className="v4-shell py-16">
            <h2 id="demo-title" className="text-[32px] font-bold">See the steps before you start.</h2>
            <p className="mt-4 max-w-[640px] text-lg text-[#536275]">The walkthrough is a static guide. Video loads only if you choose to play it later on a guide page.</p>
            <Link href="/setup"><span className="v4-btn v4-btn-secondary-light mt-6">Open the setup walkthrough</span></Link>
          </div>
        </section>

        <section id="H14" className="bg-[#EDF3F7]" aria-labelledby="why-title">
          <div className="v4-shell py-16">
            <h2 id="why-title" className="text-[32px] font-bold">Make the setup easier to understand.</h2>
            <p className="mt-4 max-w-[680px] text-lg text-[#536275]">Two paths, one checkout, and a guide that matches the device you actually have. We do not invent reviews, customer counts, or uptime claims here.</p>
          </div>
        </section>

        <section id="H15" className="bg-[#FCFBF7]" aria-labelledby="after-title">
          <div className="v4-shell py-16">
            <h2 id="after-title" className="text-[32px] font-bold">Know what happens after checkout.</h2>
            <ol className="mt-6 max-w-[720px] list-decimal space-y-3 pl-6 text-lg">
              <li>You finish payment on Stripe’s hosted page.</li>
              <li>You receive an order confirmation email.</li>
              <li>Hardware orders collect a United States or Canada shipping address.</li>
              <li>Plan credentials and setup help arrive after the order is confirmed.</li>
            </ol>
          </div>
        </section>

        <section id="H16" className="bg-[#F5F2EA]" aria-labelledby="faq-title">
          <div className="v4-shell max-w-[1000px] py-16">
            <h2 id="faq-title" className="text-[32px] font-bold">Questions before you start?</h2>
            <div className="mt-8 space-y-3">
              {FAQ.map(([q, a]) => (
                <details key={q} className="rounded-xl border border-[#D7DFE7] bg-white px-5 py-4">
                  <summary className="min-h-8 cursor-pointer font-semibold">{q}</summary>
                  <p className="mt-3 text-[#536275]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="H17" className="bg-[#08111F] text-[#F8FAFC]" aria-labelledby="final-title">
          <div className="v4-shell py-16 text-center">
            <h2 id="final-title" className="mx-auto max-w-[760px] text-[32px] font-bold lg:text-[42px]">Start with your device. We’ll show you the next step.</h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/devices"><span className="v4-btn v4-btn-primary">Shop Devices</span></Link>
              <Link href="/device-finder"><span className="v4-btn v4-btn-secondary-dark">Find My Setup</span></Link>
            </div>
          </div>
        </section>
      </main>
      <div id="H18">
        <V4Footer />
      </div>
    </div>
  );
}
