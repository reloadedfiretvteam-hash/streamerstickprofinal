import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { apiCall } from "@/lib/api";
import { iptvRealProductId, type IptvDurationKey } from "@/lib/iptv-sku";
import { useCart, type Product } from "@/lib/store";
import { setPageMeta } from "@/lib/seo";
import { V4Footer, V4Header } from "@/components/v4/V4Chrome";
import { dollarsFromCatalog, HD_ID, HD_IMG, IPTV_IMG, K4_ID, K4_IMG, packageImage } from "@/lib/package-art";
import "@/styles/v4.css";

const DURATIONS: { key: IptvDurationKey; label: string; note: string }[] = [
  { key: "1mo", label: "1 Month", note: "Try a full month of live TV, movies, and sports." },
  { key: "3mo", label: "3 Months", note: "Same library. Better price than paying month by month." },
  { key: "6mo", label: "6 Months", note: "Half a year of live TV on the devices you already own." },
  { key: "1yr", label: "1 Year", note: "The usual full-year live TV plan." },
  { key: "2yr", label: "2 Years", note: "Longest plan. Same login, same library, two years." },
];

const SERVICE_GETS = [
  { title: "Live TV", text: "18,000+ live channels from around the world. Local, news, sports, kids, and international lineups." },
  { title: "Movies and series", text: "100,000+ on-demand titles. Watch when you want, not only live." },
  { title: "Sports and PPV", text: "NFL, NBA, UFC, and other events that people actually search for." },
  { title: "Your login", text: "After checkout, support emails the tutorial and the login. You put it on the device. No store visit." },
];

function TiltCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    el.style.transform = `perspective(1100px) rotateY(${x * 12}deg) rotateX(${-y * 8}deg) translateY(-8px)`;
  };

  return (
    <div ref={ref} className="v4-tilt" onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </div>
  );
}

function money(n: number) {
  return `$${n}`;
}

export default function HomeV4() {
  const [, setLocation] = useLocation();
  const { addItem, openCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [devices, setDevices] = useState(1);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setPageMeta({
      title: "Preloaded Google TV packages and live TV plans | StreamStickPro",
      description:
        "Buy a shipped ONN Google TV with live TV, movies, and sports already set up, or buy a live TV plan for a Fire Stick or Google TV you already own.",
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
  }, []);

  const hd = products.find((p) => p.id === HD_ID);
  const k4 = products.find((p) => p.id === K4_ID);
  const packages = [
    {
      id: HD_ID,
      product: hd,
      name: "Google HD Package",
      price: hd?.price ?? 140,
      image: HD_IMG,
      label: "Full HD · shipped",
      pitch:
        "ONN Google TV stick and voice remote, already loaded with the player. Plug it into HDMI, join Wi-Fi, enter the login we email you, and watch live TV, movies, and sports in Full HD.",
    },
    {
      id: K4_ID,
      product: k4,
      name: "Google 4K Package",
      price: k4?.price ?? 150,
      image: K4_IMG,
      label: "4K · shipped",
      pitch:
        "ONN 4K Google TV with HDR and Dolby Audio, already loaded. Same live TV, movies, and sports as HD, in 4K on a 4K television.",
    },
  ];

  const addProduct = (product?: Product) => {
    if (!product) return;
    addItem(product);
    openCart();
  };

  const addPlan = (duration: IptvDurationKey) => {
    const id = iptvRealProductId(duration, devices);
    const plan = products.find((p) => p.id === id);
    if (!plan) return;
    addItem({ ...plan, image: packageImage(plan.id, IPTV_IMG) });
    setLocation("/checkout");
  };

  return (
    <div className="v4 min-h-screen">
      <div id="H01" className="bg-[#040A12] text-[#F8FAFC]">
        <div className="v4-shell py-3 text-center text-base font-semibold">
          <Link href="/36hr-trial">
            <span className="underline-offset-4 hover:underline">Already own a Fire Stick or Google TV? Request the free 36-hour trial of the live TV service.</span>
          </Link>
        </div>
      </div>
      <V4Header />

      <main id="main-content">
        <section className="bg-[#08111F] text-[#F8FAFC]" aria-labelledby="hero-title">
          <div className="v4-shell grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:py-20">
            <div>
              <p className="text-base font-semibold text-[#79D5FF]">StreamStickPro · United States and Canada</p>
              <h1 id="hero-title" className="mt-4 max-w-4xl text-[40px] font-bold leading-[1.12] sm:text-[54px] lg:text-[60px]">
                Watch live TV, movies, and sports on a preloaded Google TV — or on the stick you already own.
              </h1>
              <p className="mt-6 max-w-3xl text-[20px] leading-relaxed text-[#D5DEE8] sm:text-[22px]">
                This is a live television service. You either buy a preloaded ONN Google TV and we ship it, or you buy a live TV plan and we email a login for a Fire Stick, ONN, or Google TV you already have.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#packages" className="v4-btn v4-btn-primary">See preloaded devices</a>
                <a href="#subscriptions" className="v4-btn v4-btn-secondary-dark">See live TV plans</a>
              </div>
            </div>
            <div className="v4-hero-photos">
              <img src={HD_IMG} alt="Google HD package device and box" width="640" height="480" fetchPriority="high" decoding="async" />
              <img src={K4_IMG} alt="Google 4K package device and box" width="640" height="480" decoding="async" />
            </div>
          </div>
        </section>

        <section className="bg-[#F5F2EA]" aria-labelledby="offer-title">
          <div className="v4-shell py-14">
            <h2 id="offer-title" className="text-[34px] font-bold leading-tight lg:text-[42px]">What you are actually buying</h2>
            <p className="mt-4 max-w-3xl text-[20px] text-[#536275]">
              Not a blank streaming stick. Not cable. A login to live TV, a huge on-demand library, and sports — with or without new hardware.
            </p>
            <div className="v4-offer-grid mt-10">
              {SERVICE_GETS.map((item) => (
                <article key={item.title} className="v4-offer-card">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="bg-[#FCFBF7]" aria-labelledby="paths-title">
          <div className="v4-shell py-14 lg:py-16">
            <h2 id="paths-title" className="text-[34px] font-bold leading-tight lg:text-[44px]">Pick the path that matches what you own</h2>
            <div className="mt-10 grid gap-5">
              <article className="v4-path">
                <div className="v4-path-num" aria-hidden>1</div>
                <div>
                  <h3 className="text-[28px] font-bold leading-tight lg:text-[32px]">I need a device shipped to me</h3>
                  <p className="mt-2 max-w-3xl text-[20px] text-[#536275]">
                    HD is $140. 4K is $150. The box includes the ONN Google TV, the remote, one year of live TV service, the tutorial, and the login. We ship to the United States and Canada.
                  </p>
                </div>
                <a href="#packages" className="v4-btn v4-btn-primary w-full min-w-[220px] lg:w-auto">See the devices</a>
              </article>
              <article className="v4-path">
                <div className="v4-path-num" aria-hidden>2</div>
                <div>
                  <h3 className="text-[28px] font-bold leading-tight lg:text-[32px]">I already have a Fire Stick or Google TV</h3>
                  <p className="mt-2 max-w-3xl text-[20px] text-[#536275]">
                    Buy a live TV plan. Nothing is shipped. You get the same channels, movies, and sports on the device sitting on your TV. Plans start at $11 for one month on one device.
                  </p>
                </div>
                <a href="#subscriptions" className="v4-btn v4-btn-secondary-light w-full min-w-[220px] lg:w-auto">See live TV plans</a>
              </article>
              <article className="v4-path border-[#23C768] bg-[#EAF9F0]">
                <div className="v4-path-num bg-[#23C768]" aria-hidden>3</div>
                <div>
                  <h3 className="text-[28px] font-bold leading-tight lg:text-[32px]">I want to try the live TV first</h3>
                  <p className="mt-2 max-w-3xl text-[20px] text-[#536275]">
                    36-hour free trial of the same live TV service. Only if you already own a compatible device. You request it. Support writes back. It is not instant and it is not a new box.
                  </p>
                </div>
                <Link href="/36hr-trial"><span className="v4-btn v4-btn-primary w-full min-w-[220px] lg:w-auto">Start the trial</span></Link>
              </article>
            </div>
          </div>
        </section>

        <section id="packages" className="bg-[#F5F2EA]" aria-labelledby="hardware-title">
          <div className="v4-shell py-16">
            <h2 id="hardware-title" className="text-[34px] font-bold leading-tight lg:text-[44px]">Preloaded Google TV packages</h2>
            <p className="mt-4 max-w-3xl text-[20px] text-[#536275]">
              We sell ONN Google TV hardware, not Fire Stick hardware. The player is already on the device. After you order, the box ships and the login comes by email.
            </p>
            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              {packages.map((pack) => (
                <TiltCard key={pack.id}>
                  <article className="v4-tilt-inner">
                    <img src={pack.image} alt={`${pack.name} device and box`} width="800" height="640" decoding="async" className="h-80 w-full bg-[#F0F3F5] object-contain p-8" />
                    <div className="p-8">
                      <p className="text-base font-semibold text-[#536275]">{pack.label}</p>
                      <h3 className="mt-2 text-[30px] font-bold">{pack.name}</h3>
                      <p className="mt-4 text-[40px] font-bold leading-none">{money(pack.price)}</p>
                      <p className="mt-5 text-[18px] leading-relaxed text-[#3A4658]">{pack.pitch}</p>
                      <ul className="v4-include-list mt-5">
                        <li>ONN Google TV + voice remote in the box</li>
                        <li>Player already installed — plug into HDMI</li>
                        <li>1 year of live TV, movies, and sports</li>
                        <li>Tutorial and login emailed after purchase</li>
                        <li>Ships to the United States and Canada</li>
                        <li>24/7 support after it arrives</li>
                      </ul>
                      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button type="button" className="v4-btn v4-btn-primary" disabled={!pack.product} onClick={() => addProduct(pack.product)}>
                          Add to cart
                        </button>
                        <Link href={`/devices/${pack.id}`}><span className="v4-btn v4-btn-secondary-light">Open this package</span></Link>
                      </div>
                    </div>
                  </article>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>

        <section id="subscriptions" className="bg-[#08111F] text-[#F8FAFC]" aria-labelledby="plan-title">
          <div className="v4-shell py-16">
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div>
                <p className="text-base font-semibold text-[#79D5FF]">No hardware in this section</p>
                <h2 id="plan-title" className="mt-3 text-[34px] font-bold leading-tight lg:text-[44px]">Live TV plans for a device you already own</h2>
                <p className="mt-4 text-[20px] text-[#C9D4DF]">
                  A plan is the service only. We do not ship a stick. You keep your Fire Stick, ONN, or Google TV. After you pay, you get a tutorial and a login. That login unlocks live channels, movies, series, and sports on the devices you activate.
                </p>
                <img src={IPTV_IMG} alt="Live TV plan on a television" width="900" height="600" decoding="async" className="mt-8 w-full rounded-[24px] object-cover" />
                <ul className="v4-include-list v4-include-list-dark mt-6">
                  <li>18,000+ live TV channels</li>
                  <li>100,000+ movies and series</li>
                  <li>Sports and PPV events</li>
                  <li>Login and setup guide by email</li>
                  <li>Nothing shipped. Works on a device you already have</li>
                </ul>
              </div>
              <div>
                <fieldset>
                  <legend className="text-[20px] font-semibold">How many devices do you want to activate?</legend>
                  <p className="mt-2 text-[16px] text-[#A8B6C8]">One device is one Fire Stick, one ONN, or one Google TV in the house.</p>
                  <div className="v4-device-opts">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className="v4-device-opt"
                        aria-pressed={devices === n}
                        onClick={() => setDevices(n)}
                      >
                        {n} {n === 1 ? "device" : "devices"}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-8 grid gap-3">
                  {DURATIONS.map((row) => {
                    const id = iptvRealProductId(row.key, devices);
                    const plan = products.find((p) => p.id === id);
                    return (
                      <article key={row.key} className="v4-plan-row">
                        <div>
                          <h3 className="text-[24px] font-bold">{row.label}</h3>
                          <p className="mt-1 text-[16px] text-[#A8B6C8]">{row.note}</p>
                        </div>
                        <p className="text-[32px] font-bold">{plan ? money(plan.price) : "—"}</p>
                        <button type="button" className="v4-btn v4-btn-primary w-full min-w-[160px] lg:w-auto" disabled={!plan} onClick={() => addPlan(row.key)}>
                          {plan ? "Choose this plan" : "Unavailable"}
                        </button>
                      </article>
                    );
                  })}
                </div>
                <p className="mt-6 text-[18px] text-[#A8B6C8]">
                  Not sure yet? <Link href="/36hr-trial"><span className="underline">Request the 36-hour trial</span></Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#EDF3F7]" aria-labelledby="how-title">
          <div className="v4-shell py-16">
            <h2 id="how-title" className="text-[34px] font-bold leading-tight lg:text-[42px]">What happens after you order</h2>
            <div className="v4-steps mt-10">
              {[
                ["Pay here", "Secure checkout for United States and Canada. Prices on the cards are the prices you pay."],
                ["We email the login", "The tutorial and credentials come by email. A Google package also ships the physical device."],
                ["Plug in or open the app", "HDMI for a new ONN. On a Fire Stick you already own, open the player and sign in."],
                ["Watch", "Live TV, movies, series, and sports on the devices you paid to activate."],
              ].map(([title, text], index) => (
                <article key={title} className="v4-step">
                  <p className="v4-step-num">{index + 1}</p>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="trial" className="bg-[#EAF9F0]" aria-labelledby="trial-title">
          <div className="v4-shell py-16">
            <h2 id="trial-title" className="max-w-4xl text-[34px] font-bold leading-tight lg:text-[44px]">The free trial is 36 hours of the live TV service, not a free device.</h2>
            <p className="mt-5 max-w-3xl text-[20px] text-[#3A4658]">
              Use it only if you already own a Fire Stick, ONN, or Google TV. You send a request. Support emails the confirmed terms. Then you can buy a live TV plan if you like what you watched.
            </p>
            <Link href="/36hr-trial"><span className="v4-btn v4-btn-primary mt-8">Request the 36-hour trial</span></Link>
          </div>
        </section>

        <section className="bg-[#FCFBF7]" aria-labelledby="faq-title">
          <div className="v4-shell py-16">
            <h2 id="faq-title" className="text-[34px] font-bold">Straight answers</h2>
            <div className="mt-8 space-y-4">
              {[
                ["What am I getting with a live TV plan?", "A login. That login puts 18,000+ live channels, 100,000+ movies and series, and sports on a Fire Stick, ONN, or Google TV you already own. No box is shipped."],
                ["What am I getting with a Google package?", "The ONN device, the remote, the player already on it, one year of the same live TV service, the tutorial, the login, and shipping to the US or Canada."],
                ["Is the device delivered?", "Yes. Google packages ship. Live TV plans do not ship anything."],
                ["Do you sell Fire Stick hardware?", "No. If you already have a Fire Stick, buy a live TV plan or request the trial."],
                ["Is the trial instant?", "No. You request it. Support confirms it."],
              ].map(([q, a]) => (
                <details key={q} className="rounded-2xl border border-[#D7DFE7] bg-white px-6 py-5">
                  <summary className="cursor-pointer text-[20px] font-semibold">{q}</summary>
                  <p className="mt-3 text-[18px] text-[#536275]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <V4Footer />
    </div>
  );
}
