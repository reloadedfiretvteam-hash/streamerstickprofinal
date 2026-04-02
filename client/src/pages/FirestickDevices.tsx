import { useEffect } from "react";
import { Check, ShieldCheck, Sparkles, Clock3, Plug, Wifi, BookOpen, Headphones, Zap, Timer, Award } from "lucide-react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { SEOSchema } from "@/components/SEOSchema";
import { setPageMeta } from "@/lib/seo";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Reloaded Fire TV Devices", href: "/devices" },
];

export default function FirestickDevices() {
  useEffect(() => {
    setPageMeta({
      title: "Reloaded Fire TV Devices | Fire Stick, Onn Google TV",
      description: "Fire Stick and Onn Google TV device options with easy setup, guided onboarding, and a 1-year Reloaded Fire TV plan.",
      path: "/devices",
      ogImage: "https://streamstickpro.com/images/devices-og.webp",
    });

    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setMeta("og:title", "StreamStickPro Reloaded Fire TV Devices", true);
    setMeta("og:description", "Fire Stick and Onn device options with easy setup, guided onboarding, and a 1-year Reloaded Fire TV plan.", true);
    setMeta("og:image", "https://streamstickpro.com/images/devices-og.webp", true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", "StreamStickPro Reloaded Fire TV Devices");
    setMeta("twitter:description", "Fire Stick and Onn device options with easy setup, guided onboarding, and a 1-year Reloaded Fire TV plan.");
    setMeta("twitter:image", "https://streamstickpro.com/images/devices-og.webp");
  }, []);

  const faq = [
    { question: "What is the best streaming device in 2026?", answer: "For most homes, Fire Stick 4K or 4K Max gives the best speed/value. ONN 4K with Google TV is a strong alternative. Stream Stick Pro bundles both with Reloaded Fire TV all-in-one setup and educational tutorials." },
    { question: "Fire Stick 4K vs 4K Max: which should I get?", answer: "4K Max adds Wi‑Fi 6E and faster performance. If you have a 4K TV and want the smoothest experience, choose 4K Max. For 1080p or lighter use, Fire Stick 4K or HD works great. All include our guided setup." },
    { question: "Do you sell Fire Stick options?", answer: "Yes. Stream Stick Pro offers Fire Stick HD, 4K, and 4K Max bundles with Reloaded Fire TV all-in-one access, educational setup guidance, and a 1-year plan." },
    { question: "What are Android streaming devices for Reloaded Fire TV?", answer: "Android streaming devices (e.g. ONN 4K, ONN 4K Pro) run Google TV and support the same player setup path. We bundle ONN devices with Reloaded Fire TV, guided setup, and a 1-year plan." },
    { question: "Can I use my Fire Stick for Reloaded Fire TV only?", answer: "Yes. Many customers use Fire Stick or ONN primarily for Reloaded Fire TV. Stream Stick Pro plans support multiple devices, so you can share across Fire Sticks and other devices with one subscription." },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map(b => ({ name: b.label, url: b.href }))} />
      <SEOSchema faq={faq} />
      <PillarLayout
        title="Reloaded Fire TV Devices + Easy Setup"
        description="Fire Stick and Onn Google TV device options with guided setup and a 1-year Reloaded Fire TV plan."
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-12">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/iptv"><span className="block rounded-xl border border-white/10 bg-white/5 p-4 text-white hover:border-cyan-400 transition-colors">Reloaded Fire TV access &amp; plans</span></Link>
            <Link href="/bundles"><span className="block rounded-xl border border-white/10 bg-white/5 p-4 text-white hover:border-cyan-400 transition-colors">Reloaded Fire TV &amp; device bundles</span></Link>
            <Link href="/setup"><span className="block rounded-xl border border-white/10 bg-white/5 p-4 text-white hover:border-cyan-400 transition-colors">ONN &amp; Google TV setup</span></Link>
            <Link href="/"><span className="block rounded-xl border border-white/10 bg-white/5 p-4 text-white hover:border-cyan-400 transition-colors">Home</span></Link>
          </section>
          <p className="text-sm text-gray-300">
            This page includes all Fire Stick and ONN device options, what ships in the box, what you receive digitally, and setup expectations before checkout.
          </p>
          <section className="rounded-3xl border border-orange-500/25 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-8 shadow-2xl shadow-orange-500/15">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-5 max-w-3xl">
                <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-400/30 text-orange-100 px-4 py-1.5 rounded-full text-sm font-semibold">
                  <Sparkles className="w-4 h-4" />
                  Reloaded Fire TV + Stream Stick Pro
                </div>
                <h2 id="best-streaming-devices" className="text-4xl md:text-5xl font-black text-white leading-tight">
                  Built for households that want streaming without broken-link scavenger hunts.
                </h2>
                <p className="text-lg text-gray-200">
                  Many “jailbroken” sites dump hundreds of apps that fail or force constant Kodi rebuilds. We deliver an all-in-one Reloaded Fire TV experience with easy setup guidance, instant credentials, and a 1-year plan on every Fire Stick or ONN bundle—plus 24/7 help if anything blocks playback.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { icon: BookOpen, label: "Educational tutorial", desc: "Step-by-step walkthrough for first-time users." },
                    { icon: Check, label: "All-in-one app", desc: "No hunting through random apps or dead links." },
                    { icon: ShieldCheck, label: "1-year access plan", desc: "Every device order includes guided activation." },
                    { icon: Headphones, label: "24/7 support", desc: "Real humans so you never get stuck." },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start rounded-2xl border border-white/5 bg-white/5 p-4">
                      <item.icon className="w-5 h-5 text-orange-200 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold">{item.label}</p>
                        <p className="text-gray-300 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/shop">
                    <a className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-orange-500/40 hover:translate-y-[-1px] transition-transform">
                      <Zap className="w-5 h-5" /> Shop Fire Stick & ONN Bundles
                    </a>
                  </Link>
                  <Link href="/iptv">
                    <a className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-3 rounded-xl font-semibold border border-white/15 hover:bg-white/15 transition-colors">
                      Explore Reloaded Fire TV plans
                    </a>
                  </Link>
                </div>
              </div>
              <div className="w-full lg:w-[420px] space-y-4">
                <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-600/15 via-indigo-900/15 to-cyan-500/10 p-6 shadow-lg shadow-blue-500/15">
                  <p className="text-sm uppercase tracking-wide text-blue-100 font-semibold mb-3">Why customers switch</p>
                  <ul className="space-y-3 text-gray-100">
                    <li className="flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-200 mt-0.5" />
                      <span>Other sites: giant app lists, broken links, wasted time.</span>
                    </li>
                    <li className="flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-200 mt-0.5" />
                      <span>Stream Stick Pro: Reloaded Fire TV all-in-one flow with instant credentials.</span>
                    </li>
                    <li className="flex gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-200 mt-0.5" />
                      <span>Guided onboarding + 24/7 support so households finish setup the same day.</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-600/10 via-emerald-900/15 to-gray-900/20 p-5 shadow-lg shadow-emerald-500/15">
                  <div className="flex items-center gap-3 mb-3">
                    <Timer className="w-5 h-5 text-emerald-200" />
                    <p className="text-white font-semibold">Setup timeline</p>
                  </div>
                  <ul className="space-y-2 text-gray-100 text-sm">
                    <li>• Order now → instant login credentials issued.</li>
                    <li>• Follow the educational tutorial (minutes, not hours).</li>
                    <li>• Stream with the all-in-one app—no extra app hunt.</li>
                    <li>• Need help? Support stays with you after activation.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-purple-400/30 bg-gradient-to-br from-purple-600/15 via-purple-900/10 to-indigo-900/20 p-6 shadow-xl shadow-purple-500/20">
              <h3 id="device-bundles" className="text-2xl font-bold text-white mb-3">Device bundle options</h3>
              <p className="text-gray-200 mb-4">Pick the device that fits your TV and Wi‑Fi, then pair it with the same all-in-one Reloaded Fire TV setup.</p>
              <div className="space-y-3 text-gray-100">
                <div className="flex items-start gap-3">
                  <Wifi className="w-5 h-5 text-purple-200 mt-0.5" />
                  <div>
                    <strong className="text-white">Fire Stick HD</strong> — best for 1080p TVs; easy starter option.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wifi className="w-5 h-5 text-purple-200 mt-0.5" />
                  <div>
                    <strong className="text-white">Fire Stick 4K</strong> — Dolby Vision, great value for 4K TVs.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wifi className="w-5 h-5 text-purple-200 mt-0.5" />
                  <div>
                    <strong className="text-white">Fire Stick 4K Max</strong> — fastest option with Wi‑Fi 6E for busy homes.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wifi className="w-5 h-5 text-purple-200 mt-0.5" />
                  <div>
                    <strong className="text-white">ONN 4K / ONN 4K Pro</strong> — Google TV experience with more storage headroom.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-400/25 bg-gradient-to-br from-emerald-600/10 via-emerald-900/15 to-gray-900/20 p-6 shadow-xl shadow-emerald-500/15">
              <h3 id="setup-and-delivery" className="text-2xl font-bold text-white mb-3">Setup and delivery flow</h3>
              <ul className="space-y-3 text-gray-100">
                {[
                  { icon: Plug, text: "Place your order—instant credentials and steps issued right away." },
                  { icon: BookOpen, text: "Follow the educational tutorial to finish setup in minutes." },
                  { icon: Check, text: "Start streaming with the all-in-one app; no extra app hunt required." },
                  { icon: Clock3, text: "Need help? 24/7 support stays with you after activation." },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <item.icon className="w-5 h-5 text-emerald-200 mt-0.5" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 via-gray-950 to-gray-900 p-6 shadow-xl shadow-cyan-500/10">
              <h3 className="text-2xl font-bold text-white mb-3">What ships in your order</h3>
              <ul className="space-y-2 text-gray-100">
                <li>• 1x selected device (Fire Stick HD, Fire Stick 4K, Fire Stick 4K Max, or ONN model).</li>
                <li>• Power cable + power adapter.</li>
                <li>• Remote and standard in-box accessories from the device manufacturer.</li>
                <li>• Quick-start setup instructions from StreamStickPro.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-gray-950 to-gray-900 p-6 shadow-xl shadow-black/20">
              <h3 className="text-2xl font-bold text-white mb-3">What you receive digitally</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>Reloaded Fire TV access credentials by email.</p>
                <p>Separate step-by-step setup tutorial video.</p>
                <p>Support contact details for activation help.</p>
              </div>
              <h3 className="text-xl font-bold text-white mt-6 mb-3">Shipping and delivery</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Processing begins after payment confirmation.</p>
                <p>Shipping timelines vary by carrier and destination.</p>
                <p>Tracking is sent when your order is packed and shipped.</p>
                <p>Please confirm shipping address and email during checkout.</p>
              </div>
              <h3 className="text-xl font-bold text-white mt-6 mb-3">Important information</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Streaming quality depends on internet speed, Wi-Fi strength, and device model.</p>
                <p>Third-party app interfaces can change over time.</p>
                <p>Manufacturer OS updates may require minor setup adjustments.</p>
                <p>We provide setup guidance and support; customers are responsible for local compliance and account use.</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-7 space-y-6">
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-white px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide">
                Research-backed reasons
              </div>
              <h3 className="text-2xl font-bold text-white">Why this works better than “app dump” jailbreak kits</h3>
              <p className="text-gray-300">
                We cut friction that usually breaks streaming: fewer moving parts, one curated app flow, and human support. That keeps streams stable and households happy instead of hunting for a working link every weekend.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Single workflow", desc: "All-in-one Reloaded Fire TV path reduces failed installs and dead links." },
                { title: "Fast activation", desc: "Instant credentials + guided tutorial means first stream in minutes, not hours." },
                { title: "Stays working", desc: "Curated app stack, regular updates, and 24/7 support reduce outages." },
              ].map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-white font-semibold mb-2">{item.title}</p>
                  <p className="text-gray-300 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 p-7 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center">
                <Check className="w-5 h-5 text-orange-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Best Streaming Devices for Reloaded Fire TV in 2026</h3>
                <p className="text-gray-300">Fire Stick (HD, 4K, 4K Max) and ONN 4K are the top picks. The difference is setup: we deliver a guided, all-in-one experience that works on day one.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-5">
                <h4 className="text-white font-semibold mb-2">Reloaded Fire TV + Stream Stick Pro bundles (what you get)</h4>
                <ul className="space-y-2 text-gray-100">
                  <li>Educational tutorial and onboarding walkthrough for first-time users.</li>
                  <li>1-year access plan with every Fire Stick or ONN device order.</li>
                  <li>All-in-one app workflow—no hunting through hundreds of random apps or dead links.</li>
                  <li>Instant login credentials after purchase and clear setup steps.</li>
                  <li>Support for Fire Stick HD, 4K, 4K Max, and ONN 4K/Pro options.</li>
                  <li>24/7 support so you are never stuck during setup.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-blue-400/25 bg-blue-500/10 p-5">
                <h4 className="text-white font-semibold mb-2">Why customers switch to Stream Stick Pro</h4>
                <ul className="space-y-2 text-gray-100">
                  <li>Other jailbroken sites send giant app lists with broken links; we deliver a curated, reliable all-in-one experience.</li>
                  <li>Faster activation with guided steps instead of trial-and-error installs.</li>
                  <li>Consistent live TV and VOD access without searching for replacement links.</li>
                  <li>Beginner-friendly flow that works for households, not just power users.</li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-fuchsia-300/25 bg-gradient-to-br from-fuchsia-700/20 via-purple-900/30 to-gray-950/40 p-6 shadow-xl shadow-fuchsia-500/20">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-fuchsia-500/15 border border-fuchsia-400/30 text-fuchsia-100 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Elite Upgrade Path
                  </div>
                  <h4 className="text-2xl font-bold text-white">Fire Stick Max vs ONN Pro—pick your elite daily driver</h4>
                  <p className="text-gray-200">
                    Choose the platform that matches your Wi‑Fi and household load. Both ship with easy setup guidance, the all-in-one app flow, educational tutorial, a 1-year access plan, and 24/7 support—no scavenger hunts for dead links.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-5 h-5 text-fuchsia-200" />
                        <p className="text-white font-semibold">Fire Stick 4K Max</p>
                      </div>
                      <ul className="space-y-1 text-gray-100 text-sm">
                        <li>Wi‑Fi 6E for busier homes.</li>
                        <li>Dolby Vision + Atmos for premium TVs.</li>
                        <li>Fastest Fire OS experience with our guided flow.</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-fuchsia-200" />
                        <p className="text-white font-semibold">ONN 4K / ONN Pro</p>
                      </div>
                      <ul className="space-y-1 text-gray-100 text-sm">
                        <li>Google TV experience, easy app installs.</li>
                        <li>More storage headroom for recordings/caches.</li>
                        <li>Same all-in-one Reloaded Fire TV workflow.</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-80 rounded-xl border border-white/10 bg-black/40 p-5 space-y-3">
                  <p className="text-white font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-amber-200" /> Elite bundle checklist</p>
                  <ul className="space-y-2 text-gray-100 text-sm">
                    <li>Guided onboarding with educational tutorial.</li>
                    <li>1-year access plan + instant credentials.</li>
                    <li>All-in-one app, no “hundreds of apps” chaos.</li>
                    <li>24/7 support and aftercare.</li>
                  </ul>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <Link href="/shop">
                      <a className="inline-flex items-center gap-2 bg-fuchsia-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg shadow-fuchsia-500/40 hover:translate-y-[-1px] transition-transform">
                        Shop Elite Bundles
                      </a>
                    </Link>
                    <Link href="/iptv">
                      <a className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg font-semibold border border-white/15 hover:bg-white/15 transition-colors">
                        View Reloaded Fire TV plans
                      </a>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-300/25 bg-gradient-to-br from-amber-600/10 via-amber-900/15 to-gray-900/20 p-6 shadow-lg shadow-amber-500/15">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-5 h-5 text-amber-200" />
                <p className="text-white font-semibold">Guarantee & aftercare</p>
              </div>
              <ul className="space-y-2 text-gray-100 text-sm">
                <li>Quality-first build: curated app stack, no bloatware.</li>
                <li>1-year access plan with your device bundle.</li>
                <li>24/7 support plus guided onboarding for non-technical households.</li>
                <li>Stream securely with an all-in-one flow—fewer moving parts to break.</li>
              </ul>
            </div>
          </section>
        </div>

        <h2 id="fire-stick-models">Fire Stick HD vs 4K vs 4K Max</h2>
        <p><strong>Fire Stick HD</strong> — 1080p, most affordable. Good for standard TVs and basic streaming.<br />
        <strong>Fire Stick 4K</strong> — 4K, HDR, Dolby Vision. Best value for 4K TVs.<br />
        <strong>Fire Stick 4K Max</strong> — 4K, Wi-Fi 6E, fastest. Best for 4K and heavy use.</p>
        <p>Stream Stick Pro supports all three with Reloaded Fire TV all-in-one access, educational tutorials, and a 1-year access plan so you can start quickly.</p>

        <h2 id="android-devices">Android TV & ONN 4K Devices</h2>
        <p>Android streaming devices (e.g. ONN 4K, ONN 4K Pro) run Google TV and support the same player apps. They’re a strong alternative to Fire Stick, often with more storage for DVR-style use. We offer ONN 4K and ONN 4K Pro bundles with Reloaded Fire TV all-in-one setup—see our <Link href="/shop">Shop</Link>.</p>

        <h2 id="pre-configured">Why Choose a Guided Device Option?</h2>
        <p>A guided device option means fewer setup steps and faster activation. You get educational tutorials, easier onboarding, and 24/7 support. Ideal if you want to avoid technical friction and go straight to a cleaner streaming setup.</p>

        <h2 id="faq">Fire Stick & Streaming Devices FAQ</h2>
        <ul>
          {faq.map((item, i) => (
            <li key={i}><strong>{item.question}</strong> — {item.answer}</li>
          ))}
        </ul>
      </PillarLayout>
    </>
  );
}
