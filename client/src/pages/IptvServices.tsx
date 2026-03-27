import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { SEOSchema } from "@/components/SEOSchema";
import { setPageMeta } from "@/lib/seo";
import { IPTV_IMAGES, getImageForSlot, fullImageUrl } from "@/data/seo-images";

const TITLE = "Ultimate IPTV Guide 2026: Best IPTV Service & Live TV Streaming";
const DESC = "Complete guide to the best IPTV service for 2026. Compare live TV streaming, cheap IPTV subscriptions, and cord-cutting. 18,000+ channels, Fire Stick & Android.";

export default function IptvServices() {
  useEffect(() => {
    const ogImg = fullImageUrl(getImageForSlot(IPTV_IMAGES, 0).src);
    setPageMeta({
      title: "IPTV Subscription Plans 2026 | Cheapest & Best | StreamStick Pro",
      description: "IPTV plans from $15/mo: 18K+ live channels, 4K sports, PPV, 99.9% uptime. Fire Stick and Android. Cancel anytime. 36hr trial for subscription plans. StreamStick Pro.",
      path: "/iptv-services",
      ogImage: ogImg,
    });
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute(attr, name); document.head.appendChild(tag); }
      tag.setAttribute("content", content);
    };
    setMeta("og:image", ogImg, true);
    setMeta("twitter:image", ogImg);
  }, []);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "IPTV Services", href: "/iptv-services" },
  ];

  const faq = [
    { question: "What is IPTV?", answer: "IPTV (Internet Protocol Television) delivers live TV and on-demand content over the internet. Unlike cable, IPTV works on Fire Sticks, Android devices, Smart TVs, and phones. You get thousands of channels and VOD for a fraction of cable cost." },
    { question: "What is the best IPTV service in 2026?", answer: "The best IPTV service offers 18,000+ live channels, 100,000+ movies and series, stable streams, multi-device support, and 24/7 support. StreamStickPro provides instant credentials, works with TiviMate and IPTV Smarters, and offers a subscription trial." },
    { question: "Is IPTV legal?", answer: "IPTV technology is legal. Using licensed content depends on your provider and region. Choose providers that operate within legal frameworks. StreamStickPro focuses on reliable delivery and customer support for streaming devices." },
    { question: "How much does a cheap IPTV subscription cost?", answer: "Cheap IPTV subscriptions typically start around $15/month for one device. Longer plans (3, 6, or 12 months) offer better value. StreamStickPro plans range from $15/month to yearly options with multi-device support." },
    { question: "Can I use IPTV on Fire Stick?", answer: "Yes. IPTV works great on Fire Stick. You can use apps like TiviMate, IPTV Smarters Pro, or Perfect Player. StreamStickPro offers Fire Stick device options, setup guidance, and instant credentials so you can stream in minutes." },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map(b => ({ name: b.label, url: b.href }))} />
      <SEOSchema faq={faq} />
      <PillarLayout
        title={TITLE}
        description="Your complete guide to the best IPTV service and live TV streaming in 2026. Compare options, learn how IPTV works, and find the right plan for Fire Stick and Android."
        breadcrumbs={breadcrumbs}
      >
        <h2 id="what-is-iptv">What Is IPTV and How Does Live TV Streaming Work?</h2>
        <p>IPTV (Internet Protocol Television) is a way to watch live TV and on-demand content over the internet. Instead of cable or satellite, your TV signal comes through your broadband connection. That means you can watch on <Link href="/iptv-firestick">Fire Stick</Link>, Android boxes, Smart TVs, phones, and tablets—anywhere you have internet.</p>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(IPTV_IMAGES, 0).src} alt={getImageForSlot(IPTV_IMAGES, 0).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <p>Live TV streaming via IPTV typically uses an app (like TiviMate or IPTV Smarters) and a subscription that gives you access to channel lists (M3U or Xtream Codes). You get thousands of channels, sports, PPV, and VOD for much less than cable.</p>

        <h2 id="best-iptv-service-2026">Best IPTV Service 2026: What to Look For</h2>
        <p>When choosing the best IPTV service for 2026, look for:</p>
        <ul>
          <li><strong>Channel count and quality</strong> — 18,000+ live channels and 100,000+ movies/series is a strong offering.</li>
          <li><strong>Compatibility</strong> — Works on <Link href="/firestick-devices">Fire Stick</Link>, Android, and Smart TV.</li>
          <li><strong>Stability</strong> — Reliable playback, strong uptime, and EPG (TV guide) support.</li>
          <li><strong>Multi-device</strong> — Plans that allow 2–5 devices are ideal for families.</li>
          <li><strong>Support</strong> — 24/7 support and instant delivery of credentials.</li>
        </ul>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(IPTV_IMAGES, 1).src} alt={getImageForSlot(IPTV_IMAGES, 1).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <p>StreamStickPro meets these with instant M3U delivery, TiviMate-friendly setup, and a <Link href="/36hr-trial">36-hour subscription trial</Link> so you can test before committing. For the best <Link href="/iptv-media-players">IPTV media players</Link> (TiviMate, IPTV Smarters, VLC), see our full guide.</p>

        <h2 id="cheap-iptv-subscription">Cheap IPTV Subscription vs Cable</h2>
        <p>A cheap IPTV subscription often starts at $15–25/month. Cable usually runs $100–200+/month. With IPTV you get more channels, on-demand libraries, and the flexibility to use <Link href="/jailbroken-fire-sticks">streaming devices</Link> like Fire Stick and ONN Google TV. Yearly plans bring the per-month cost down further.</p>

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
