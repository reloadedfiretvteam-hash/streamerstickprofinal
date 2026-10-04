import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { apiCall } from "@/lib/api";
import { iptvRealProductId, type IptvDurationKey } from "@/lib/iptv-sku";
import { useCart, type Product } from "@/lib/store";
import { setPageMeta } from "@/lib/seo";
import { V4Footer, V4Header } from "@/components/v4/V4Chrome";
import { dollarsFromCatalog, HD_ID, HD_IMG, IPTV_IMG, K4_ID, K4_IMG, packageImage } from "@/lib/package-art";
import "@/styles/v4.css";

const DURATIONS: { key: IptvDurationKey; label: string }[] = [
  { key: "1mo", label: "1 Month" },
  { key: "3mo", label: "3 Months" },
  { key: "6mo", label: "6 Months" },
  { key: "1yr", label: "1 Year" },
  { key: "2yr", label: "2 Years" },
];

function money(n: number) {
  return `$${n}`;
}

export default function HomeV4() {
  const [, setLocation] = useLocation();
  const { addItem, openCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [streams, setStreams] = useState(1);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    const inter = document.createElement("link");
    inter.rel = "stylesheet";
    inter.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Sora:wght@600;700&display=swap";
    document.head.appendChild(inter);
    setPageMeta({
      title: "Google TV packages, subscriptions, and a 36-hour trial | StreamStickPro",
      description: "Buy a Google HD or 4K package, choose a live TV subscription for a device you already own, or start a 36-hour trial.",
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
              price: dollarsFromCatalog(p.price),
              image: packageImage(p.id, p.imageUrl),
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
  const packages = [
    { id: HD_ID, product: hd, name: "Google HD Package", price: hd?.price ?? 140, image: HD_IMG, label: "Full HD" },
    { id: K4_ID, product: k4, name: "Google 4K Package", price: k4?.price ?? 150, image: K4_IMG, label: "4K" },
  ];

  const addProduct = (product?: Product) => {
    if (!product) return;
    addItem(product);
    openCart();
  };

  const addPlan = (duration: IptvDurationKey) => {
    const id = iptvRealProductId(duration, streams);
    const plan = products.find((p) => p.id === id);
    if (!plan) return;
    addItem({ ...plan, image: packageImage(plan.id, IPTV_IMG) });
    setLocation("/checkout");
  };

  return (
    <div className="v4 min-h-screen">
      <div id="H01" className="bg-[#040A12] text-[#F8FAFC]">
        <div className="v4-shell flex min-h-10 items-center justify-center py-2 text-center text-sm font-semibold">
          <Link href="/36hr-trial">
            <span className="underline-offset-4 hover:underline">36-hour free trial for a Fire Stick, ONN, or Google TV you already own.</span>
          </Link>
        </div>
      </div>
      <V4Header />

      <main id="main-content">
        <section id="H03" className="bg-[#08111F] text-[#F8FAFC]" aria-labelledby="hero-title">
          <div className="v4-shell grid items-center gap-10 py-12 lg:grid-cols-[52fr_48fr] lg:py-20">
            <div className="max-w-[640px]">
              <p className="text-[13px] font-semibold tracking-[0.12em] text-[#79D5FF]">GOOGLE PACKAGES · SUBSCRIPTIONS · FREE TRIAL</p>
              <h1 id="hero-title" className="mt-4 text-[36px] font-bold leading-[1.12] sm:text-[48px] lg:text-[58px] lg:leading-[1.06]">
                Preloaded ONN Google TV devices.
              </h1>
              <p className="mt-5 max-w-[560px] text-lg leading-relaxed text-[#C9D4DF]">
                This is StreamStickPro. Buy a Google HD or 4K package with the device, tutorial, login, and live TV. Or keep the device you already have and pick a subscription — or start the 36-hour trial.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <a href="#packages" className="v4-btn v4-btn-primary">Shop Google packages</a>
                <a href="#subscriptions" className="v4-btn v4-btn-secondary-dark">See subscriptions</a>
                <Link href="/36hr-trial"><span className="v4-btn v4-btn-secondary-dark sm:col-span-2 w-full">Start the free 36-hour trial</span></Link>
              </div>
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-3">
              {packages.map((pack) => (
                <Link key={pack.id} href={`/devices/${pack.id}`}>
                  <span className="block overflow-hidden rounded-[22px] border border-[#233145] bg-[#111C2E]">
                    <img src={pack.image} alt={pack.name} className="h-44 w-full object-contain bg-[#0B1220] p-3 sm:h-56" />
                    <span className="block p-3">
                      <span className="text-xs font-semibold text-[#79D5FF]">{pack.label}</span>
                      <strong className="mt-1 block text-sm sm:text-base">{pack.name}</strong>
                      <span className="mt-1 block text-xl font-bold">{money(pack.price)}</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="H04" className="bg-[#FCFBF7]" aria-labelledby="paths-title">
          <div className="v4-shell py-14">
            <h2 id="paths-title" className="text-center text-[32px] font-bold lg:text-[40px]">Choose how you want to start</h2>
            <p className="mx-auto mt-4 max-w-[680px] text-center text-lg text-[#536275]">Three clear doors. You do not have to read the whole page.</p>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <article className="rounded-[22px] border border-[#D7DFE7] bg-white p-6">
                <img src={HD_IMG} alt="" className="mb-5 h-40 w-full object-contain" />
                <h3 className="text-2xl font-bold">I need a Google device</h3>
                <p className="mt-3 text-[#536275]">HD $140 or 4K $150. Each package is the ONN Google TV, a web tutorial, login credentials, and live TV service.</p>
                <a href="#packages" className="v4-btn v4-btn-primary mt-6 w-full">See Google packages</a>
              </article>
              <article className="rounded-[22px] border border-[#D7DFE7] bg-white p-6">
                <img src={IPTV_IMG} alt="" className="mb-5 h-40 w-full rounded-xl object-cover" />
                <h3 className="text-2xl font-bold">I already have a device</h3>
                <p className="mt-3 text-[#536275]">Keep your Fire Stick, ONN, or Google TV. Pick a live TV subscription by length and how many screens can play at once.</p>
                <a href="#subscriptions" className="v4-btn v4-btn-secondary-light mt-6 w-full">See subscriptions</a>
              </article>
              <article className="rounded-[22px] border border-[#23C768] bg-[#EAF9F0] p-6">
                <p className="text-xs font-semibold tracking-[0.12em] text-[#08111F]">FREE TO REQUEST</p>
                <h3 className="mt-3 text-2xl font-bold">Try it for 36 hours</h3>
                <p className="mt-3 text-[#536275]">The trial is for a device you already own. It is a request, not instant access. Support confirms the terms before it starts.</p>
                <Link href="/36hr-trial"><span className="v4-btn v4-btn-primary mt-6 w-full">Open the free trial</span></Link>
              </article>
            </div>
          </div>
        </section>

        <section id="packages" className="bg-[#F5F2EA]" aria-labelledby="hardware-title">
          <div className="v4-shell py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#536275]">Google packages</p>
            <h2 id="hardware-title" className="mt-2 text-[32px] font-bold lg:text-[42px]">The HD and 4K devices</h2>
            <p className="mt-4 max-w-[680px] text-lg text-[#536275]">These are the only two hardware choices. Each photo is the package we sell. Fire Stick hardware is not for sale here.</p>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {packages.map((pack) => (
                <article key={pack.id} className="overflow-hidden rounded-[22px] border border-[#D7DFE7] bg-white">
                  <img src={pack.image} alt={`${pack.name} device and box`} className="h-72 w-full bg-[#F0F3F5] object-contain p-6" />
                  <div className="p-6">
                    <p className="text-xs font-semibold tracking-[0.12em] text-[#536275]">{pack.label}</p>
                    <h3 className="mt-2 text-2xl font-bold">{pack.name}</h3>
                    <p className="mt-4 text-[32px] font-bold">{money(pack.price)}</p>
                    <ul className="mt-3 space-y-1 text-[#536275]">
                      <li>Preloaded ONN Google TV device</li>
                      <li>Web tutorial and login by email</li>
                      <li>Live TV service included with the package</li>
                    </ul>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button type="button" className="v4-btn v4-btn-primary" disabled={!pack.product} onClick={() => addProduct(pack.product)}>
                        Add to cart
                      </button>
                      <Link href={`/devices/${pack.id}`}><span className="v4-btn v4-btn-secondary-light">View package</span></Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="subscriptions" className="bg-[#08111F] text-[#F8FAFC]" aria-labelledby="plan-title">
          <div className="v4-shell py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#79D5FF]">Subscriptions</p>
            <h2 id="plan-title" className="mt-2 text-[32px] font-bold lg:text-[42px]">Already have the hardware? Choose a plan.</h2>
            <p className="mt-4 max-w-[720px] text-lg text-[#C9D4DF]">These prices are for live TV on a Fire Stick, ONN, Google TV, or other compatible device you already own. A subscription does not ship a new box.</p>
            <label className="mt-8 block max-w-xs font-semibold">
              Screens playing at the same time
              <select className="mt-2 min-h-[50px] w-full rounded-xl border border-[#233145] bg-[#111C2E] px-3" value={streams} onChange={(event) => setStreams(Number(event.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "screen" : "screens"}</option>
                ))}
              </select>
            </label>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {DURATIONS.map((row) => {
                const id = iptvRealProductId(row.key, streams);
                const plan = products.find((p) => p.id === id);
                return (
                  <article key={row.key} className="flex flex-col rounded-[18px] bg-[#111C2E] p-5">
                    <h3 className="text-lg font-bold">{row.label}</h3>
                    <p className="mt-3 text-3xl font-bold">{plan ? money(plan.price) : "—"}</p>
                    <p className="mt-2 text-sm text-[#A8B6C8]">{streams} simultaneous {streams === 1 ? "stream" : "streams"}</p>
                    <button type="button" className="v4-btn v4-btn-primary mt-6" disabled={!plan} onClick={() => addPlan(row.key)}>
                      {plan ? "Continue to checkout" : "Unavailable"}
                    </button>
                  </article>
                );
              })}
            </div>
            <p className="mt-6 text-sm text-[#A8B6C8]">
              Want to test first? <Link href="/36hr-trial"><span className="underline">Request the 36-hour trial</span></Link>
              {" · "}
              <Link href="/plans"><span className="underline">Open the full subscriptions page</span></Link>
            </p>
          </div>
        </section>

        <section id="trial" className="bg-[#EAF9F0]" aria-labelledby="trial-title">
          <div className="v4-shell grid items-center gap-8 py-16 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em]">Free trial</p>
              <h2 id="trial-title" className="mt-2 text-[32px] font-bold">36 hours on a device you already own</h2>
              <p className="mt-4 text-lg text-[#536275]">Use this if you already have a Fire Stick, ONN, or Google TV and want to try the service before buying a subscription. You send a request. Support replies with the confirmed terms. It is not a new device and it is not instant access.</p>
            </div>
            <div className="rounded-[22px] bg-white p-8">
              <ol className="list-decimal space-y-3 pl-5 text-lg">
                <li>Open the trial page and send the request.</li>
                <li>Check email for the confirmed terms.</li>
                <li>If you like it, come back and pick a subscription.</li>
              </ol>
              <Link href="/36hr-trial"><span className="v4-btn v4-btn-primary mt-8 w-full">Start the free trial</span></Link>
            </div>
          </div>
        </section>

        <section id="H11" className="bg-[#FCFBF7]" aria-labelledby="how-title">
          <div className="v4-shell py-14">
            <h2 id="how-title" className="text-[32px] font-bold">How the two paths work</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div className="rounded-[22px] bg-[#EDF3F7] p-6">
                <h3 className="text-xl font-bold">Google package</h3>
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-[#536275]">
                  <li>Choose HD or 4K and check out.</li>
                  <li>We ship the device in the United States or Canada.</li>
                  <li>You get the tutorial, login, and live TV with the package.</li>
                </ol>
              </div>
              <div className="rounded-[22px] bg-[#EAF9F0] p-6">
                <h3 className="text-xl font-bold">Subscription or trial</h3>
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-[#536275]">
                  <li>Keep the device you already own.</li>
                  <li>Request the 36-hour trial, or pick a plan length and screens.</li>
                  <li>Login and setup help arrive after the order or request is confirmed.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        <section id="H16" className="bg-[#F5F2EA]" aria-labelledby="faq-title">
          <div className="v4-shell max-w-[1000px] py-14">
            <h2 id="faq-title" className="text-[32px] font-bold">Quick answers</h2>
            <div className="mt-8 space-y-3">
              {[
                ["What kind of website is this?", "StreamStickPro sells Google TV device packages and live TV subscriptions. The 36-hour trial is for people who already have a compatible device."],
                ["Do I need a new device?", "Only if you want a Google HD or 4K package. If you already have a Fire Stick, ONN, or Google TV, use a subscription or the trial."],
                ["Is Fire Stick hardware sold here?", "No. Plans and the trial are for a Fire TV you already own."],
                ["What is included with a Google package?", "The device, a tutorial, login credentials, and live TV service. Exact contents are on each product page."],
                ["Is the trial instant?", "No. You request it, then support confirms the terms. That is different from buying a subscription."],
              ].map(([q, a]) => (
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
            <h2 id="final-title" className="mx-auto max-w-[760px] text-[32px] font-bold lg:text-[42px]">Device, subscription, or trial. Pick one and start.</h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#packages" className="v4-btn v4-btn-primary">Google packages</a>
              <a href="#subscriptions" className="v4-btn v4-btn-secondary-dark">Subscriptions</a>
              <Link href="/36hr-trial"><span className="v4-btn v4-btn-secondary-dark">Free trial</span></Link>
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
