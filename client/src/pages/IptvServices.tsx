import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { SEOSchema } from "@/components/SEOSchema";
import { setPageMeta } from "@/lib/seo";
import { IPTV_IMAGES, getImageForSlot, fullImageUrl } from "@/data/seo-images";

const TITLE = "IPTV Subscription - 18K Channels, 60K Movies";
const DESC = "Instant IPTV access - 18,000+ live channels, 60K+ movies, sports, international. 36hr free trial.";

export default function IptvServices() {
  useEffect(() => {
    const ogImg = fullImageUrl(getImageForSlot(IPTV_IMAGES, 0).src);
    setPageMeta({
      title: "IPTV Subscription 18K+ Channels | StreamStickPro",
      description: DESC,
      path: "/iptv",
      ogImage: ogImg,
    });
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(attr, name); document.head.appendChild(tag); }
      tag.setAttribute("content", content);
    };
    setMeta("og:title", "StreamStickPro IPTV – 18K Channels, 60K Movies", true);
    setMeta("og:description", "Instant access to IPTV with 36hr free trial. Over 18K live channels and 60K movies on Fire TV, Onn, Roku.", true);
    setMeta("og:image", "https://streamstickpro.com/images/iptv-og.webp", true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", "StreamStickPro IPTV – 18K Channels, 60K Movies");
    setMeta("twitter:description", "Instant access to IPTV with 36hr free trial. Over 18K live channels and 60K movies on Fire TV, Onn, Roku.");
    setMeta("twitter:image", "https://streamstickpro.com/images/iptv-og.webp");
  }, []);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "IPTV Subscription", href: "/iptv" },
  ];

  const faq = [
    { question: "What is IPTV?", answer: "IPTV (Internet Protocol Television) delivers live TV and on-demand content over the internet. Unlike cable, IPTV works on Fire Sticks, Android devices, Smart TVs, and phones. You get thousands of channels and VOD for a fraction of cable cost." },
    { question: "What is the best IPTV service in 2026?", answer: "The best IPTV service offers 18,000+ live channels, 100,000+ movies and series, stable streams, multi-device support, and 24/7 support. StreamStickPro provides instant credentials, works with TiviMate and IPTV Smarters, and offers a subscription trial." },
    { question: "Is IPTV legal?", answer: "IPTV technology is legal. Using licensed content depends on your provider and region. Choose providers that operate within legal frameworks. StreamStickPro focuses on reliable delivery and customer support for streaming devices." },
    { question: "How much does a cheap IPTV subscription cost?", answer: "Cheap IPTV subscriptions typically start around $11/month for one device. Longer plans (3, 6, or 12 months) offer better value. StreamStickPro plans range from $11/month to yearly options with multi-device support." },
    { question: "Can I use IPTV on Fire Stick?", answer: "Yes. IPTV works great on Fire Stick. You can use apps like TiviMate, IPTV Smarters Pro, or Perfect Player. StreamStickPro offers Fire Stick device options, setup guidance, and instant credentials so you can stream in minutes." },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map(b => ({ name: b.label, url: b.href }))} />
      <SEOSchema faq={faq} />
      <PillarLayout
        title={TITLE}
        description={DESC}
        breadcrumbs={breadcrumbs}
      >
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/devices"><span className="block rounded-xl border border-white/10 bg-white/5 p-4 text-white hover:border-cyan-400 transition-colors">/devices</span></Link>
          <Link href="/bundles"><span className="block rounded-xl border border-white/10 bg-white/5 p-4 text-white hover:border-cyan-400 transition-colors">/bundles</span></Link>
          <Link href="/setup-firestick"><span className="block rounded-xl border border-white/10 bg-white/5 p-4 text-white hover:border-cyan-400 transition-colors">/setup-firestick</span></Link>
          <Link href="/homepage"><span className="block rounded-xl border border-white/10 bg-white/5 p-4 text-white hover:border-cyan-400 transition-colors">/homepage</span></Link>
        </div>
        <h2 id="what-is-iptv">What Is IPTV and How Does Live TV Streaming Work?</h2>
        <p>IPTV (Internet Protocol Television) is a way to watch live TV and on-demand content over the internet. Instead of cable or satellite, your TV signal comes through your broadband connection. That means you can watch on <Link href="/iptv-firestick">Fire Stick</Link>, Android boxes, Smart TVs, phones, and tablets—anywhere you have internet—without hunting through broken app lists.</p>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(IPTV_IMAGES, 0).src} alt={getImageForSlot(IPTV_IMAGES, 0).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <p>Live TV streaming via IPTV typically uses an app (like TiviMate or IPTV Smarters) and a subscription that gives you access to channel lists (M3U or Xtream Codes). You get thousands of channels, sports, PPV, and VOD for much less than cable.</p>

        <h2 id="best-iptv-service-2026">Best IPTV Service 2026: What to Look For</h2>
        <p>When choosing the best IPTV service for 2026, look for:</p>
        <ul>
          <li><strong>Channel count and quality</strong> — 18,000+ live channels and 100,000+ movies/series is a strong offering.</li>
          <li><strong>Compatibility</strong> — Works on <Link href="/firestick-devices">Fire Stick</Link>, Android, and Smart TV.</li>
          <li><strong>Stability</strong> — Reliable playback, strong uptime, and EPG (TV guide) support without dead links.</li>
          <li><strong>Multi-device</strong> — Plans that allow 2–5 devices are ideal for families.</li>
          <li><strong>Support</strong> — 24/7 support, instant delivery of credentials, and a quick tutorial to avoid trial-and-error installs.</li>
        </ul>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(IPTV_IMAGES, 1).src} alt={getImageForSlot(IPTV_IMAGES, 1).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <p>StreamStickPro meets these with instant M3U delivery, TiviMate-friendly setup, an educational tutorial, and 24/7 support. Try the <Link href="/36hr-trial">36-hour subscription trial</Link> before committing. For the best <Link href="/iptv-media-players">IPTV media players</Link> (TiviMate, IPTV Smarters, VLC), see our full guide.</p>

        <h2 id="cheap-iptv-subscription">Cheap IPTV Subscription vs Cable</h2>
        <p>A cheap IPTV subscription often starts at $11/month. Cable usually runs $100–200+/month. With IPTV you get more channels, on-demand libraries, and the flexibility to use <Link href="/jailbroken-fire-sticks">streaming devices</Link> like Fire Stick and ONN Google TV. Yearly plans bring the per-month cost down further.</p>

        <h2 id="iptv-channels">IPTV Channels and Content</h2>
        <p>Quality IPTV services offer local and international channels, sports (NFL, NBA, UFC, soccer), news, movies, and series. Look for services that include catch-up TV and a solid VOD library. StreamStickPro provides 18,000+ live channels and 100,000+ movies and series with regular updates.</p>

        <h2 id="faq">IPTV Services FAQ</h2>
        <p>Common questions about IPTV, live TV streaming, and the best IPTV service are answered below. For more guides, see our <Link href="/blog">blog</Link> and <Link href="/iptv-firestick">IPTV for Firestick</Link> pillar.</p>
        <ul>
          {faq.map((item, i) => (
            <li key={i}><strong>{item.question}</strong> — {item.answer}</li>
          ))}
        </ul>
      </PillarLayout>
    </>
  );
}
