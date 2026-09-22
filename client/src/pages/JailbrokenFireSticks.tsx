import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { SEOSchema } from "@/components/SEOSchema";
import { setPageMeta } from "@/lib/seo";
import { NicheProductOffers } from "@/components/NicheProductOffers";
import { JAILBREAK_IMAGES, getImageForSlot, fullImageUrl } from "@/data/seo-images";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Jailbroken Fire Sticks", href: "/jailbroken-fire-sticks" },
];

export default function JailbrokenFireSticks() {
  useEffect(() => {
    const ogImg = fullImageUrl(getImageForSlot(JAILBREAK_IMAGES, 0).src);
    setPageMeta({
      title: "Jailbroken Fire Stick Search? Buy ONN Google TV",
      description: "Searching jailbroken, unlocked, or loaded Fire Stick? Order an ONN Google TV kit with live price, photo, and checkout instead of Fire Stick hardware.",
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
    { question: "What is a jailbroken Fire Stick?", answer: "A jailbroken Fire Stick usually means a Fire TV device that can run apps outside the Amazon store (sideloading). Many users use this term when they want a simpler setup experience with live TV apps like TiviMate or Smarters." },
    { question: "Should I buy a device kit or set it up myself?", answer: "If you want a ready box, order an ONN Google TV kit with a live price, photo, and checkout link. If you already own a Fire Stick, use a StreamStickPro plan and the setup guide instead of buying new Fire Stick hardware." },
    { question: "Are jailbroken Fire Sticks sold here?", answer: "No. StreamStickPro does not sell jailbroken, unlocked, or loaded Fire Stick hardware. Those searches are matched to ONN Google TV kits and plans for equipment you already own." },
    { question: "What is included with a Google TV kit?", answer: "Each listed ONN Google TV kit shows the current price, product photo, and an order link. Kits are new Google TV devices with setup guidance and the plan stated on the product page." },
    { question: "I searched Downloader, IPTV, or unlocked Fire Stick. What should I buy?", answer: "Buy the ONN Google TV kit shown on this page if you need hardware. If you already have a Fire Stick, open Plans and follow the Fire Stick setup guide." },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map(b => ({ name: b.label, url: b.href }))} />
      <SEOSchema faq={faq} />
      <PillarLayout
        title="Jailbroken or Unlocked Fire Stick Search? Get a Google TV Kit"
        description="People searching jailbroken, unlocked, downloader, or IPTV Fire Stick usually want a ready streaming box. We sell ONN Google TV kits with price, picture, and an order link."
        breadcrumbs={breadcrumbs}
      >
        <NicheProductOffers title="Order the Google TV kits that show up for this search" />
        <h2 id="what-are-jailbroken-fire-sticks">What Is a Jailbroken Fire Stick?</h2>
        <p>“Jailbroken” Fire Stick usually refers to a Fire TV device that can run apps from outside the Amazon Appstore (sideloading). In practice, most buyers want an easier way to watch Reloaded Fire TV with clear setup steps, an all-in-one app flow, and reliable support—without broken APKs or Kodi rebuilds.</p>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(JAILBREAK_IMAGES, 0).src} alt={getImageForSlot(JAILBREAK_IMAGES, 0).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <p>At StreamStickPro we sell <Link href="/devices">ONN Google TV kits</Link> and <Link href="/plans">plans for equipment you already own</Link>. If you searched jailbroken, unlocked, downloader, or IPTV Fire Stick, order a Google TV kit below.</p>

        <h2 id="fully-loaded-vs-diy">Setup Support vs Doing It Yourself</h2>
        <p>Doing it yourself means using a Fire Stick you already own, installing a player app, and adding a subscription. A guided hardware option is an <Link href="/devices">ONN Google TV kit</Link> with a live price and photo. Plans remain available for <Link href="/iptv-firestick">Reloaded Fire TV on Fire Stick</Link> you already have.</p>

        <h2 id="which-devices">Which Fire Stick Models Work Best?</h2>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(JAILBREAK_IMAGES, 1).src} alt={getImageForSlot(JAILBREAK_IMAGES, 1).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <p>Fire Stick HD, Fire Stick 4K, and Fire Stick 4K Max all work with Reloaded Fire TV if you already own one. Hardware for sale is ONN Google TV. Compare live kits on <Link href="/shop">Shop</Link> and <Link href="/devices">Google TV devices</Link>.</p>

        <h2 id="what-you-get">What You Get With a Fire Stick Option</h2>
        <figure className="my-6 rounded-lg overflow-hidden max-w-xl">
          <img src={getImageForSlot(JAILBREAK_IMAGES, 2).src} alt={getImageForSlot(JAILBREAK_IMAGES, 2).alt} className="w-full h-auto" width={600} height={340} loading="lazy" />
        </figure>
        <p>Google TV kits list the current price, photo, and checkout link on each product page. Plans for a Fire Stick you already own include credentials and setup help. Fire Stick hardware is not sold on this site.</p>

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
