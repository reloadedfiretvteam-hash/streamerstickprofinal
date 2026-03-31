import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { SEOSchema } from "@/components/SEOSchema";
import { setPageMeta } from "@/lib/seo";
import { JAILBREAK_IMAGES, getImageForSlot, fullImageUrl } from "@/data/seo-images";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Jailbroken Fire Sticks", href: "/jailbroken-fire-sticks" },
];

export default function JailbrokenFireSticks() {
  useEffect(() => {
    const ogImg = fullImageUrl(getImageForSlot(JAILBREAK_IMAGES, 0).src);
    setPageMeta({
      title: "IPTV Fire Stick 2026 | Jailbroken Fire Stick Guide | StreamStick Pro",
      description: "Jailbroken Fire Stick guide for 2026: 18K+ channels, fast setup, and Fire Stick HD, 4K, 4K Max options. Shop now with StreamStick Pro.",
      path: "/jailbroken-fire-sticks",
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

  const faq = [
    { question: "What is a jailbroken Fire Stick?", answer: "A jailbroken Fire Stick usually means a Fire TV device that can run apps outside the Amazon store (sideloading). Many users use this term when they want a simpler setup experience with IPTV apps." },
    { question: "Should I buy a device option or set it up myself?", answer: "If you want to save time, a device option with setup guidance is easiest. If you prefer full control, you can set up your own Fire Stick with StreamStickPro credentials." },
    { question: "Are jailbroken Fire Sticks legal?", answer: "Sideloading apps on Fire Stick is allowed by Amazon. What you watch must comply with local laws. StreamStickPro provides devices and IPTV subscriptions that are ready to use; we recommend using the device within the terms of your subscription." },
    { question: "What’s included with a Fire Stick purchase option?", answer: "Fire Stick purchase options include the device, instant login credentials, a 1-year IPTV plan (18,000+ channels, 100,000+ movies/series), an educational tutorial, and 24/7 support—no dead-end app lists or Kodi rebuilds." },
    { question: "Can I get a Fire Stick 4K Max option?", answer: "Yes. StreamStickPro offers Fire Stick 4K Max options with IPTV and a 1-year plan. You get Wi-Fi 6E, 4K, and Dolby Vision support." },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map(b => ({ name: b.label, url: b.href }))} />
      <SEOSchema faq={faq} />
      <PillarLayout
        title="Jailbroken Fire Sticks & Fire TV Device Guide 2026"
        description="Guide to jailbroken Fire Sticks and Fire TV device options. Compare Fire Stick HD, 4K, and 4K Max with StreamStickPro."
        breadcrumbs={breadcrumbs}
      >
        <h2 id="what-are-jailbroken-fire-sticks">What Is a Jailbroken Fire Stick?</h2>
        <p>“Jailbroken” Fire Stick usually refers to a Fire TV device that can run apps from outside the Amazon Appstore (sideloading). In practice, most buyers want an easier way to watch IPTV with clear setup steps, an all-in-one app flow, and reliable support—without broken APKs or Kodi rebuilds.</p>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(JAILBREAK_IMAGES, 0).src} alt={getImageForSlot(JAILBREAK_IMAGES, 0).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <p>At StreamStickPro we focus on <Link href="/devices">Fire Stick device options</Link> and <Link href="/iptv">IPTV plans</Link> so you can start quickly with less setup time.</p>

        <h2 id="fully-loaded-vs-diy">Setup Support vs Doing It Yourself</h2>
        <p>Doing it yourself means buying a Fire Stick, installing an IPTV app, and adding a subscription. A guided option means you get instant credentials, an educational tutorial, and 24/7 help. That is ideal if you want to skip trial-and-error and get straight to <Link href="/iptv-firestick">IPTV on Fire Stick</Link> without dead links.</p>

        <h2 id="which-devices">Which Fire Stick Models Work Best?</h2>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(JAILBREAK_IMAGES, 1).src} alt={getImageForSlot(JAILBREAK_IMAGES, 1).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <p>Fire Stick HD, Fire Stick 4K, and Fire Stick 4K Max all work well for IPTV. 4K and 4K Max support 4K and HDR/Dolby Vision. We also offer ONN 4K streaming devices with Google TV. Compare options on our <Link href="/shop">Shop</Link> and <Link href="/devices">Fire Stick devices</Link> page.</p>

        <h2 id="what-you-get">What You Get With a Fire Stick Option</h2>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(JAILBREAK_IMAGES, 2).src} alt={getImageForSlot(JAILBREAK_IMAGES, 2).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <p>You get the physical device, instant login credentials, and typically a 1-year IPTV plan (18,000+ live channels, 100,000+ movies and series). A quick educational tutorial and 24/7 support are included—no scavenger hunts for broken apps.</p>

        <h2 id="faq">Jailbroken Fire Stick FAQ</h2>
        <ul>
          {faq.map((item, i) => (
            <li key={i}><strong>{item.question}</strong> — {item.answer}</li>
          ))}
        </ul>
      </PillarLayout>
    </>
  );
}
