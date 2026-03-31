import { useEffect, useMemo } from "react";
import { Link, useRoute } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { Check, X, Gift, ShieldCheck, TrendingUp } from "lucide-react";
import { competitorDisplayName } from "@/data/crushCompetitors";
import { setPageMeta } from "@/lib/seo";
import { SEOSchema } from "@/components/SEOSchema";

type ComparisonRow = {
  feature: string;
  ours: string;
  theirs: string;
  theirsStrong?: boolean;
};

type VsStrategy = {
  segmentLabel: string;
  intro: string;
  switchReasons: string[];
  bestForThem: string;
  rows: ComparisonRow[];
  faq: { question: string; answer: string }[];
  relatedLinks: { href: string; label: string }[];
};

const STREAMING_SERVICE_SLUGS = new Set([
  "youtube-tv",
  "hulu-live",
  "fubo-tv",
  "sling-tv",
  "directv-stream",
  "philo",
  "peacock",
  "paramount-plus",
  "espn-plus",
  "dazn",
]);

const PLAYER_SLUGS = new Set([
  "kodi",
  "plex",
  "emby",
  "vlc",
  "perfect-player",
  "stbemu",
  "xciptv",
  "iptvsmarters",
  "tivimate",
]);

const DEVICE_SLUGS = new Set([
  "roku",
  "chromecast",
  "apple-tv",
  "nvidia-shield",
  "tivo-stream",
  "xiaomi-mi-box",
]);

const TOOL_SLUGS = new Set([
  "troypoint",
  "downloader-app",
  "apktime",
  "aptoide",
  "unlinked",
  "applinked",
  "filelinked",
]);

function getVsStrategy(slug: string, name: string): VsStrategy {
  const key = slug.toLowerCase();

  if (STREAMING_SERVICE_SLUGS.has(key)) {
    return {
      segmentLabel: "Live TV streaming service alternatives",
      intro: `${name} is a known option for cord cutters, but buyers comparing monthly cost, channel volume, setup speed, and support consistency often want a broader value-per-dollar solution.`,
      switchReasons: [
        "Lower starting price for users testing IPTV before committing.",
        "Faster setup path with tutorial videos and direct support.",
        "Clear path from trial to paid plan without account complexity.",
      ],
      bestForThem: `${name} can still be a fit for users who only want a fixed mainstream channel lineup and prefer a strict app ecosystem.`,
      rows: [
        { feature: "Entry price / value", ours: "Starts at $11 with 36hr trial", theirs: "Usually higher monthly pricing" },
        { feature: "Channel depth", ours: "18K+ live channels + 100K+ VOD", theirs: "Smaller catalog focus" },
        { feature: "Setup experience", ours: "Guided video + 24/7 help", theirs: "Self-service onboarding" },
        { feature: "Device flexibility", ours: "Fire Stick, ONN, players, more", theirs: "Platform-limited in many cases" },
        { feature: "Trial access", ours: "36-hour trial path", theirs: "Short or no meaningful trial" },
      ],
      faq: [
        { question: `Is StreamStickPro better value than ${name}?`, answer: `For users prioritizing lower entry cost, wider channel depth, and guided setup support, StreamStickPro usually offers better value. ${name} may still fit users who only want a narrower mainstream package.` },
        { question: `Can I test StreamStickPro before switching from ${name}?`, answer: "Yes. You can start with a 36-hour trial so you can validate quality, speed, and device setup before committing to a longer plan." },
        { question: `Will StreamStickPro work on Fire Stick and ONN devices?`, answer: "Yes. StreamStickPro supports Fire Stick and ONN Google TV setups with step-by-step tutorials and 24/7 human support if you get stuck." },
      ],
      relatedLinks: [
        { href: "/vs-youtube-tv", label: "vs YouTube TV" },
        { href: "/vs-hulu-live", label: "vs Hulu Live" },
        { href: "/vs-fubo-tv", label: "vs FuboTV" },
        { href: "/vs-sling-tv", label: "vs Sling TV" },
      ],
    };
  }

  if (PLAYER_SLUGS.has(key)) {
    return {
      segmentLabel: "IPTV player and app comparisons",
      intro: `${name} can be part of a streaming stack, but app-only choices do not solve plan quality, onboarding, and support together. This comparison focuses on full outcome, not just app features.`,
      switchReasons: [
        "One checkout path for plan + setup guidance + support.",
        "No dependency on advanced manual configuration to get started.",
        "Better for non-technical households that need reliability fast.",
      ],
      bestForThem: `${name} is often useful for power users who already know playlist management and prefer manual tuning workflows.`,
      rows: [
        { feature: "Beginner setup speed", ours: "Guided with tutorials", theirs: "Often manual-heavy" },
        { feature: "Support model", ours: "24/7 human support", theirs: "Community/self-support" },
        { feature: "Plan + app fit", ours: "Optimized full flow", theirs: "App-first, plan quality varies" },
        { feature: "Time-to-first-stream", ours: "Fast activation path", theirs: "Can require deeper setup" },
        { feature: "Long-term maintenance", ours: "Lower friction for most users", theirs: "More tuning/maintenance" },
      ],
      faq: [
        { question: `Should I use ${name} or StreamStickPro?`, answer: `If you want a full service path with trial, plan, tutorial, and support in one place, StreamStickPro is usually easier. ${name} can be good for experienced users who prefer manual app-level control.` },
        { question: "Do I still get setup tutorials with StreamStickPro?", answer: "Yes. Every customer gets a setup walkthrough, including player-focused guidance for Fire Stick and ONN devices." },
        { question: "Can advanced users still tune their setup?", answer: "Yes. StreamStickPro works for beginners and advanced users, but it reduces friction so most users can get streams running quickly." },
      ],
      relatedLinks: [
        { href: "/vs-kodi", label: "vs Kodi" },
        { href: "/vs-tivimate", label: "vs TiviMate" },
        { href: "/vs-iptvsmarters", label: "vs IPTV Smarters" },
        { href: "/vs-plex", label: "vs Plex" },
      ],
    };
  }

  if (DEVICE_SLUGS.has(key)) {
    return {
      segmentLabel: "Streaming device buying decisions",
      intro: `${name} is a device/platform decision, while StreamStickPro focuses on the IPTV experience outcome: channels, reliability, setup, and support. Buyers often compare both when planning their full stack.`,
      switchReasons: [
        "Better clarity on total outcome (content + setup + support).",
        "Works across multiple device families and app preferences.",
        "Lower risk path via trial before larger commitment.",
      ],
      bestForThem: `${name} can be ideal if your priority is a specific hardware ecosystem over service flexibility.`,
      rows: [
        { feature: "Content path", ours: "Plan + setup + support bundle", theirs: "Hardware-first experience" },
        { feature: "Cross-device options", ours: "Broad compatibility", theirs: "Ecosystem dependent" },
        { feature: "Getting started", ours: "Trial + guided onboarding", theirs: "Varies by device workflow" },
        { feature: "Support depth", ours: "24/7 human support", theirs: "Vendor support channels" },
        { feature: "Value for cord cutters", ours: "High channel/value ratio", theirs: "Depends on app stack" },
      ],
      faq: [
        { question: `Can I use StreamStickPro if I currently use ${name}?`, answer: "Yes. Many users keep their existing hardware and use StreamStickPro for a broader IPTV content stack with guided setup support." },
        { question: "Do I need to buy new hardware to switch?", answer: "Usually no. Most users can start with current compatible devices and follow the setup tutorial flow." },
        { question: "Is there a way to test first?", answer: "Yes. Start with the 36-hour trial to validate performance and setup on your existing device setup." },
      ],
      relatedLinks: [
        { href: "/vs-roku", label: "vs Roku" },
        { href: "/vs-apple-tv", label: "vs Apple TV" },
        { href: "/vs-chromecast", label: "vs Chromecast" },
        { href: "/vs-nvidia-shield", label: "vs NVIDIA Shield" },
      ],
    };
  }

  if (TOOL_SLUGS.has(key)) {
    return {
      segmentLabel: "Setup tools, sideloading, and guide ecosystems",
      intro: `${name} may help with setup discovery, but many users still need a stable service, clean onboarding, and direct support once they begin streaming.`,
      switchReasons: [
        "From research to working stream in fewer steps.",
        "Lower confusion for non-technical customers.",
        "Clear trial -> plan -> support lifecycle.",
      ],
      bestForThem: `${name} can be helpful for users exploring tool-based setup paths and DIY workflows.`,
      rows: [
        { feature: "From click to stream", ours: "Direct service onboarding", theirs: "Research/tool oriented" },
        { feature: "Beginner clarity", ours: "High (guided)", theirs: "Can vary by guide depth" },
        { feature: "Support after setup", ours: "24/7 human help", theirs: "Mostly content/community" },
        { feature: "Trial-driven confidence", ours: "36-hour trial path", theirs: "Usually indirect" },
        { feature: "Conversion to daily use", ours: "Structured flow", theirs: "Depends on user execution" },
      ],
      faq: [
        { question: `How is StreamStickPro different from ${name}?`, answer: `${name} is often part of the setup research stage, while StreamStickPro is the service and onboarding outcome stage with trial, support, and a direct path to active streaming.` },
        { question: "Is this better for non-technical users?", answer: "Yes. Users who want less trial-and-error usually prefer guided setup with direct support and a clear activation process." },
        { question: "Can advanced users still use this approach?", answer: "Yes. Advanced users can still optimize their setup, but StreamStickPro reduces friction for faster, repeatable results." },
      ],
      relatedLinks: [
        { href: "/vs-troypoint", label: "vs TroyPoint" },
        { href: "/vs-downloader-app", label: "vs Downloader App" },
        { href: "/setup", label: "Setup Tutorials" },
        { href: "/iptv-firestick", label: "IPTV Fire Stick Guide" },
      ],
    };
  }

  return {
    segmentLabel: "IPTV and streaming alternatives",
    intro: `${name} and StreamStickPro target similar buyers, but StreamStickPro is built around faster setup, better support, and stronger price-to-channel value.`,
    switchReasons: [
      "36-hour trial before commitment.",
      "Guided setup workflow with real support.",
      "Broad compatibility across major device types.",
    ],
    bestForThem: `${name} may still fit users with narrow requirements or brand-specific preferences.`,
    rows: [
      { feature: "Trial confidence", ours: "36hr trial", theirs: "Often shorter or unavailable" },
      { feature: "Support availability", ours: "24/7 human support", theirs: "Varies" },
      { feature: "Setup speed", ours: "Guided onboarding", theirs: "Often self-managed" },
      { feature: "Pricing value", ours: "Plans from $11", theirs: "Often higher entry" },
      { feature: "Device flexibility", ours: "Fire Stick, ONN, players", theirs: "Depends on provider" },
    ],
    faq: [
      { question: `Why compare StreamStickPro vs ${name}?`, answer: "Comparison helps buyers evaluate real outcomes: setup speed, support quality, trial confidence, and long-term value instead of marketing claims alone." },
      { question: "Is StreamStickPro beginner friendly?", answer: "Yes. The setup flow is designed for new users with tutorial guidance and live support if you need help at any step." },
      { question: "Where do I start if I want to test first?", answer: "Start with the 36-hour trial to validate quality, then move to the best pricing tier for your device needs." },
    ],
    relatedLinks: [
      { href: "/vs-iptvstronger", label: "vs IPTVStronger" },
      { href: "/vs-troypoint", label: "vs TroyPoint" },
      { href: "/pricing", label: "Pricing" },
      { href: "/36hr-trial", label: "Start 36hr Trial" },
    ],
  };
}

export default function VsCompetitor() {
  const [, params] = useRoute("/vs-:competitor");
  const slug = params?.competitor ?? "";
  const name = competitorDisplayName(slug);
  const strategy = useMemo(() => getVsStrategy(slug, name), [slug, name]);

  useEffect(() => {
    setPageMeta({
      title: `StreamStickPro vs ${name} 2026 | Why We Win | StreamStick Pro`,
      description: `${name} vs StreamStickPro for ${strategy.segmentLabel}. Compare setup speed, support, trial confidence, pricing value, and compatibility before you choose.`,
      path: `/vs-${slug}`,
    });
  }, [name, slug, strategy.segmentLabel]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: `vs ${name}`, href: `/vs-${slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))} />
      <SEOSchema faq={strategy.faq} />
      <PillarLayout
        title={`StreamStickPro vs ${name} 2026 - Why We WIN`}
        description={`${name} alternative for ${strategy.segmentLabel}. Compare real setup outcomes, support quality, and value before you buy.`}
        breadcrumbs={breadcrumbs}
      >
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5 md:p-6 mb-8">
          <p className="text-gray-100 text-base leading-relaxed">
            {strategy.intro}
          </p>
        </div>

        <div className="overflow-x-auto mb-10">
          <table className="w-full border border-white/20 rounded-xl text-left">
            <thead>
              <tr className="bg-white/10">
                <th className="p-3 text-white font-bold">Feature</th>
                <th className="p-3 text-green-400 font-bold">StreamStickPro</th>
                <th className="p-3 text-gray-400 font-bold">{name}</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {strategy.rows.map((row) => (
                <tr key={row.feature} className="border-t border-white/10">
                  <td className="p-3">{row.feature}</td>
                  <td className="p-3 text-green-300">
                    <Check className="w-5 h-5 inline" /> {row.ours}
                  </td>
                  <td className={row.theirsStrong ? "p-3 text-green-300" : "p-3 text-red-300"}>
                    {row.theirsStrong ? <Check className="w-5 h-5 inline" /> : <X className="w-5 h-5 inline" />} {row.theirs}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
            <h2 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Why users switch to StreamStickPro
            </h2>
            <ul className="space-y-2 text-gray-100 text-sm">
              {strategy.switchReasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-5">
            <h2 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              When {name} may still fit
            </h2>
            <p className="text-gray-100 text-sm leading-relaxed">{strategy.bestForThem}</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-orange-500/20 border border-orange-400/30 text-center mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Get the 36hr subscription trial {name} can't match</h2>
          <Link href="/36hr-trial">
            <span className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg">
              <Gift className="w-6 h-6" /> Start 36hr Subscription Trial
            </span>
          </Link>
        </div>

        <div className="text-gray-400 text-sm space-y-2">
          <p className="font-medium text-gray-300">Related comparisons and buyer guides:</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {strategy.relatedLinks.map((link, idx) => (
              <span key={link.href} className="inline-flex items-center gap-2">
                <Link href={link.href}><span className="hover:text-orange-400">{link.label}</span></Link>
                {idx < strategy.relatedLinks.length - 1 && <span className="text-gray-600">·</span>}
              </span>
            ))}
            <span className="text-gray-600">·</span>
            <Link href="/pricing"><span className="hover:text-orange-400">Pricing</span></Link>
            <span className="text-gray-600">·</span>
            <Link href="/setup"><span className="hover:text-orange-400">Tutorials</span></Link>
            <span className="text-gray-600">·</span>
            <Link href="/shop"><span className="hover:text-orange-400">Shop</span></Link>
            <span className="text-gray-600">·</span>
            <Link href="/36hr-trial"><span className="text-orange-400 font-semibold">Start 36hr Trial</span></Link>
            <span className="text-gray-600">·</span>
            <Link href="/blog"><span className="hover:text-orange-400">Blog Guides</span></Link>
          </div>
        </div>
      </PillarLayout>
    </>
  );
}
