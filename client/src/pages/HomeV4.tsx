import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
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
    const inter = document.createElement("link");
    inter.rel = "stylesheet";
    inter.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Sora:wght@600;700&display=swap";
    document.head.appendChild(inter);
    setPageMeta({
      title: "Google TV packages, subscriptions, and a 36-hour trial | StreamStickPro",
      description: "Need a device? Buy a Google HD or 4K package. Already have a Fire Stick or Google TV? Pick a subscription or request the 36-hour trial.",
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
    { id: HD_ID, product: hd, name: "Google HD Package", price: hd?.price ?? 140, image: HD_IMG, label: "Full HD TV" },
    { id: K4_ID, product: k4, name: "Google 4K Package", price: k4?.price ?? 150, image: K4_IMG, label: "4K TV" },
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
            <span className="underline-offset-4 hover:underline">Already own a device? Request the free 36-hour trial.</span>
          </Link>
        </div>
      </div>
      <V4Header />

      <main id="main-content">
        <section className="bg-[#08111F] text-[#F8FAFC]" aria-labelledby="hero-title">
          <div className="v4-shell py-16 lg:py-20">
            <p className="text-base font-semibold text-[#79D5FF]">StreamStickPro</p>
            <h1 id="hero-title" className="mt-4 max-w-4xl text-[42px] font-bold leading-[1.12] sm:text-[56px] lg:text-[64px]">
              Need a device, or do you already have one?
            </h1>
            <p className="mt-6 max-w-3xl text-[20px] leading-relaxed text-[#D5DEE8] sm:text-[22px]">
              This website sells two things. A Google TV package if you need the hardware. A live TV subscription if you already have a Fire Stick, ONN, or Google TV.
            </p>
            <div className="v4-trial-banner mt-10">
              <div>
                <p className="text-[15px] font-bold uppercase tracking-[0.12em]">Free 36-hour trial</p>
                <p className="mt-2 text-[22px] font-bold leading-tight sm:text-[26px]">Already own a Fire Stick or Google TV? Try the service first.</p>
                <p className="mt-2 text-[18px]">You send a request. Support writes back. It is not a new device and it is not instant.</p>
              </div>
              <Link href="/36hr-trial"><span className="v4-btn v4-btn-secondary-light bg-[#08111F] text-[#F8FAFC]">Start the free trial</span></Link>
            </div>
          </div>
        </section>

        <section id="start" className="bg-[#FCFBF7]" aria-labelledby="paths-title">
          <div className="v4-shell py-14 lg:py-16">
            <h2 id="paths-title" className="text-[34px] font-bold leading-tight lg:text-[44px]">Pick one. That is the whole site.</h2>
            <div className="mt-10 grid gap-5">
              <article className="v4-path">
                <div className="v4-path-num" aria-hidden>1</div>
                <div>
                  <h3 className="text-[28px] font-bold leading-tight lg:text-[32px]">I need a Google TV device</h3>
                  <p className="mt-2 max-w-2xl text-[20px] text-[#536275]">HD package is $140. 4K package is $150. You get the stick, a tutorial, a login, and live TV.</p>
                </div>
                <a href="#packages" className="v4-btn v4-btn-primary w-full min-w-[220px] lg:w-auto">See the devices</a>
              </article>
              <article className="v4-path">
                <div className="v4-path-num" aria-hidden>2</div>
                <div>
                  <h3 className="text-[28px] font-bold leading-tight lg:text-[32px]">I already have a device</h3>
                  <p className="mt-2 max-w-2xl text-[20px] text-[#536275]">Keep your Fire Stick or Google TV. Buy a subscription. Plans start at $11 for one month on one device.</p>
                </div>
                <a href="#subscriptions" className="v4-btn v4-btn-secondary-light w-full min-w-[220px] lg:w-auto">See the plans</a>
              </article>
              <article className="v4-path border-[#23C768] bg-[#EAF9F0]">
                <div className="v4-path-num bg-[#23C768]" aria-hidden>3</div>
                <div>
                  <h3 className="text-[28px] font-bold leading-tight lg:text-[32px]">I want to try it first</h3>
                  <p className="mt-2 max-w-2xl text-[20px] text-[#536275]">36-hour free trial. Only if you already own a device. You request it. Support writes back. It is not instant.</p>
                </div>
                <Link href="/36hr-trial"><span className="v4-btn v4-btn-primary w-full min-w-[220px] lg:w-auto">Start the trial</span></Link>
              </article>
            </div>
          </div>
        </section>

        <section id="packages" className="bg-[#F5F2EA]" aria-labelledby="hardware-title">
          <div className="v4-shell py-16">
            <h2 id="hardware-title" className="text-[34px] font-bold leading-tight lg:text-[44px]">The two Google packages</h2>
            <p className="mt-4 max-w-3xl text-[20px] text-[#536275]">These photos are the products. We do not sell Fire Stick hardware.</p>
            <div className="mt-10 grid gap-8 lg:grid-cols-2">
              {packages.map((pack) => (
                <TiltCard key={pack.id}>
                  <article className="v4-tilt-inner">
                    <img src={pack.image} alt={`${pack.name} device and box`} className="h-80 w-full bg-[#F0F3F5] object-contain p-8" />
                    <div className="p-8">
                      <p className="text-base font-semibold text-[#536275]">{pack.label}</p>
                      <h3 className="mt-2 text-[30px] font-bold">{pack.name}</h3>
                      <p className="mt-4 text-[40px] font-bold leading-none">{money(pack.price)}</p>
                      <ul className="mt-5 space-y-2 text-[18px] text-[#536275]">
                        <li>ONN Google TV device, preloaded</li>
                        <li>Tutorial and login sent by email</li>
                        <li>Live TV included with the package</li>
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
            <h2 id="plan-title" className="text-[34px] font-bold leading-tight lg:text-[44px]">Subscriptions for a device you already own</h2>
            <p className="mt-4 max-w-3xl text-[20px] text-[#C9D4DF]">No new box is shipped. First pick how many devices you want to activate, then pick the plan length.</p>
            <fieldset className="mt-8">
              <legend className="text-[20px] font-semibold">How many devices do you want to activate?</legend>
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
                    <h3 className="text-[24px] font-bold">{row.label}</h3>
                    <p className="text-[32px] font-bold">{plan ? money(plan.price) : "—"}</p>
                    <button type="button" className="v4-btn v4-btn-primary w-full min-w-[160px] lg:w-auto" disabled={!plan} onClick={() => addPlan(row.key)}>
                      {plan ? "Choose" : "Unavailable"}
                    </button>
                  </article>
                );
              })}
            </div>
            <p className="mt-6 text-[18px] text-[#A8B6C8]">
              Not sure yet? <Link href="/36hr-trial"><span className="underline">Request the 36-hour trial</span></Link>
            </p>
          </div>
        </section>

        <section id="trial" className="bg-[#EAF9F0]" aria-labelledby="trial-title">
          <div className="v4-shell py-16">
            <h2 id="trial-title" className="max-w-4xl text-[34px] font-bold leading-tight lg:text-[44px]">The free trial is for people who already have a device.</h2>
            <p className="mt-5 max-w-3xl text-[20px] text-[#3A4658]">It does not include a new Google TV. You send a request. Support emails the confirmed terms. Then you can buy a subscription if you like it.</p>
            <Link href="/36hr-trial"><span className="v4-btn v4-btn-primary mt-8">Request the 36-hour trial</span></Link>
          </div>
        </section>

        <section className="bg-[#FCFBF7]" aria-labelledby="faq-title">
          <div className="v4-shell py-16">
            <h2 id="faq-title" className="text-[34px] font-bold">If you are still unsure</h2>
            <div className="mt-8 space-y-4">
              {[
                ["What is this website?", "StreamStickPro. We sell Google TV packages and live TV subscriptions."],
                ["Do I buy a Fire Stick here?", "No. If you already have one, buy a subscription or request the trial."],
                ["What is in a Google package?", "The device, a tutorial, a login, and live TV."],
                ["How many devices do I pick on a subscription?", "That is how many devices you want to activate on the plan. One device is one Fire Stick, ONN, or Google TV."],
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
