import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { SEOSchema } from "@/components/SEOSchema";
import { setPageMeta } from "@/lib/seo";

const TITLE = "Best Value: Device + IPTV Subscription Bundle";
const DESC = "Device with Reloaded Fire TV + IPTV subscription. Everything you need to start streaming.";

const FAQ = [
  {
    question: "What is included in a bundle?",
    answer: "A bundle combines a device with Reloaded Fire TV and IPTV subscription access so you have the hardware and service together in one purchase path.",
  },
  {
    question: "Is a 1-year subscription included with device bundles?",
    answer: "Yes. Device-focused bundle messaging centers on hardware plus included service so customers can start streaming quickly with less setup friction.",
  },
];

export default function Bundles() {
  useEffect(() => {
    setPageMeta({
      title: "IPTV + Device Bundle | StreamStickPro",
      description: DESC,
      path: "/bundles",
      ogImage: "https://streamstickpro.com/images/bundle-og.webp",
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

    setMeta("og:title", "StreamStickPro Device + IPTV Bundle", true);
    setMeta("og:description", "Get the ultimate streaming package: device + IPTV subscription.", true);
    setMeta("og:image", "https://streamstickpro.com/images/bundle-og.webp", true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", "StreamStickPro Device + IPTV Bundle");
    setMeta("twitter:description", "Get the ultimate streaming package: device + IPTV subscription.");
    setMeta("twitter:image", "https://streamstickpro.com/images/bundle-og.webp");
  }, []);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Bundles", href: "/bundles" },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: b.href }))} />
      <SEOSchema faq={FAQ} />
      <PillarLayout title={TITLE} description={DESC} breadcrumbs={breadcrumbs}>
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-3">Everything you need in one path</h2>
          <p className="text-gray-300 mb-4">
            Bundles are designed for customers who want the clearest purchase path: choose a device with Reloaded Fire TV and pair it with IPTV access so you can move from checkout to streaming with less friction.
          </p>
          <ul className="space-y-2 text-gray-200 list-disc pl-5">
            <li>Device + service together</li>
            <li>Built for fast setup and beginner-friendly use</li>
            <li>Clearer value than buying hardware and service separately</li>
          </ul>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/iptv">
            <a className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white hover:border-cyan-400 transition-colors">View IPTV</a>
          </Link>
          <Link href="/devices">
            <a className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white hover:border-cyan-400 transition-colors">View Reloaded Fire TV Devices</a>
          </Link>
          <Link href="/faq">
            <a className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white hover:border-cyan-400 transition-colors">Read FAQ</a>
          </Link>
        </section>

        <section className="mt-4">
          <Link href="/homepage">
            <a className="text-cyan-300 hover:text-cyan-200">Return to /homepage</a>
          </Link>
        </section>
      </PillarLayout>
    </>
  );
}
