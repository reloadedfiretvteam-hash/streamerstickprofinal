import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout } from "@/components/PillarLayout";
import { Button } from "@/components/ui/button";
import { Play, Home, Check, ShieldCheck, Zap } from "lucide-react";
import { setPageMeta } from "@/lib/seo";
import { SEOSchema } from "@/components/SEOSchema";

const TITLE = "StreamStickPro setup guides for Fire TV and ONN";
const DESC = "Written and video setup previews for Fire TV and ONN Google TV. Your order email has the login and the steps for your package or plan.";

const VIDEOS = [
  {
    id: "9pZOoS-1NHg",
    title: "Install Media Player on Fire Stick",
    label: "How to set up a Fire Stick you already own",
    description: "Preview the Fire Stick setup flow before buying. After purchase, customers receive a separate device-specific tutorial video by email with the exact steps for their order.",
  },
  {
    id: "w6s_Tcnnbpo",
    title: "Install Media Player on ONN Google Device",
    label: "How to set up an ONN Google TV",
    description: "Preview the ONN Google TV setup flow before buying. After purchase, customers receive a separate device-specific tutorial video by email with the exact steps for their order.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Are these the same tutorials sent after purchase?",
    answer: "No. These are public preview videos. After purchase, customers receive a separate tutorial video by email with the exact setup steps for the specific device they ordered."
  },
  {
    question: "Do I need technical skills to follow these tutorials?",
    answer: "The public videos are meant for a first look. Follow the matching written guide, and email support if a step looks different from the screen in front of you."
  },
  {
    question: "What devices do these tutorials cover?",
    answer: "Public preview videos cover Fire Stick and ONN Google TV. Use the guide that matches the device in front of you. Do not assume a Pro or Plus model is the same product."
  },
  {
    question: "Can I contact support if I get stuck during setup?",
    answer: "Email support@streamstickpro.com with the model and the screen you are on. Do not send passwords in screenshots."
  },
];

export default function Tutorials() {
  useEffect(() => {
    setPageMeta({
      title: "Setup guides | StreamStickPro",
      description: DESC,
      path: "/setup",
      ogImage: "https://streamstickpro.com/images/setup-og.webp",
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

    setMeta("og:title", "StreamStickPro Setup Guides", true);
    setMeta("og:description", "Setup previews for Fire TV and ONN Google TV. Order email has your login.", true);
    setMeta("og:image", "https://streamstickpro.com/images/setup-og.webp", true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", "StreamStickPro Setup Guides");
    setMeta("twitter:description", "Setup previews for Fire TV and ONN Google TV. Order email has your login.");
    setMeta("twitter:image", "https://streamstickpro.com/images/setup-og.webp");
  }, []);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Setup Guides", href: "/setup" },
  ];

  return (
    <>
      <SEOSchema faq={FAQ_ITEMS} />
      <PillarLayout title={TITLE} description={DESC} breadcrumbs={breadcrumbs}>
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
              <Home className="w-4 h-4" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mb-10 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-400/30 p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            Setup Preview Before Purchase
          </h2>
          <p className="text-gray-200 mb-4">
            These videos show the general setup flow before purchase. After checkout, customers receive a separate device-specific tutorial video by email, along with their credentials and support details.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            {[
              "Guided step-by-step walkthrough",
              "No technical skills needed",
              "Support email if a step looks different",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-green-300">
                <Check className="w-4 h-4 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <section aria-labelledby="tutorial-videos-heading" className="space-y-12">
          <h2 id="tutorial-videos-heading" className="text-2xl font-bold text-white sr-only">
            Video tutorials
          </h2>

          {VIDEOS.map((video) => (
            <article key={video.id} className="rounded-2xl bg-gray-800/50 border border-white/10 overflow-hidden">
              <div className="p-4 md:p-6">
                <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                  <Play className="w-5 h-5 text-orange-400" aria-hidden="true" />
                  {video.label}
                </h3>
                <p className="text-gray-300 text-sm mb-4">{video.description}</p>
                <div className="aspect-video w-full max-w-3xl rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="rounded-xl bg-gray-800/50 border border-white/10 p-5">
                <h3 className="text-white font-semibold mb-2">{faq.question}</h3>
                <p className="text-gray-300 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Home className="w-4 h-4" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
          <Link href="/shop">
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white gap-2">
              <Zap className="w-4 h-4" aria-hidden="true" />
              Shop Devices & Plans
            </Button>
          </Link>
        </div>
      </PillarLayout>
    </>
  );
}
