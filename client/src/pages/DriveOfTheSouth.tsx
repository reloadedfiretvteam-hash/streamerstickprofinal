import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout, BreadcrumbSchema } from "@/components/PillarLayout";
import { setPageMeta } from "@/lib/seo";
import { Check, Radio, MapPin, Trophy, Tv } from "lucide-react";

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Drive of the South", href: "/drive-of-the-south" },
];

export default function DriveOfTheSouth() {
  useEffect(() => {
    setPageMeta({
      title: "Drive of the South | Southern Live TV & Streaming | StreamStick Pro",
      description:
        "The Drive of the South is our promise to Southern households: reliable Reloaded Fire TV, regional sports and news coverage, simple device setup, and support that answers. ONN Google TV kits, IPTV plans, and a 36-hour trial.",
      path: "/drive-of-the-south",
    });
  }, []);

  return (
    <>
      <BreadcrumbSchema
        items={breadcrumbs.map((b) => ({ name: b.label, url: "https://streamstickpro.com" + b.href }))}
      />
      <PillarLayout
        title="Drive of the South"
        description="Live TV built for the South—clear setup, strong channel lineup, and human support when you need it."
        breadcrumbs={breadcrumbs}
      >
        <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-br from-amber-950/40 via-gray-900/80 to-orange-950/30 p-5 sm:p-6 mb-8">
          <div className="flex flex-wrap items-center gap-3 text-amber-200/95">
            <Radio className="w-6 h-6 shrink-0" aria-hidden />
            <p className="text-sm sm:text-base font-semibold leading-snug">
              <strong className="text-white">Drive of the South</strong> is StreamStick Pro&apos;s line in the sand: the same premium Reloaded Fire TV experience,
              tuned for fans and families who want college sports, pro games, regional news, and everyday channels—without cable nonsense.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-orange-400" aria-hidden />
          Why it matters down here
        </h2>
        <ul className="list-disc list-inside text-gray-200 space-y-2 mb-8">
          <li>ISP throttling and peak-time buffering hit harder when everyone&apos;s watching the same big game—we pair your plan with a clear VPN guide when you need it.</li>
          <li>Southern households often mix devices: smart TVs, ONN Google TV, phones—we support that whole mix with one credential flow.</li>
          <li>You get tutorial video, email delivery, and 24/7 help—not a forum thread and a prayer.</li>
        </ul>

        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" aria-hidden />
          What fans actually watch
        </h2>
        <p className="text-gray-200 mb-4">
          Your lineup includes thousands of live channels and a deep on-demand library—college and pro football, basketball, motorsports, wrestling, and the regional
          news and entertainment channels people expect at home. Exact channels vary by package; use the{" "}
          <Link href="/36hr-trial">
            <span className="text-orange-400 font-semibold hover:underline">36-hour trial</span>
          </Link>{" "}
          to judge quality on your own network.
        </p>

        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Tv className="w-6 h-6 text-cyan-400" aria-hidden />
          Hardware that fits Southern living rooms
        </h2>
        <p className="text-gray-200 mb-4">
          Our{" "}
          <Link href="/shop">
            <span className="text-orange-400 font-semibold hover:underline">ONN Google TV kits</span>
          </Link>{" "}
          ship with guided Reloaded Fire TV setup—Full HD or 4K, voice remote, and a year of access included on kit orders so you&apos;re not piecing it together from
          random apps.
        </p>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5 my-8">
          <p className="text-sm font-bold uppercase tracking-wider text-amber-300/90 mb-3">The promise</p>
          <ul className="space-y-2 text-gray-200">
            {[
              "Straightforward setup in about ten minutes on supported devices",
              "Credentials and tutorial after checkout—resend available from support if an email lands in spam",
              "Shop plans scale from one screen up to five simultaneous streams",
            ].map((line) => (
              <li key={line} className="flex gap-2 items-start">
                <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-gray-300 mb-6">
          Ready to roll?{" "}
          <Link href="/shop">
            <span className="text-orange-400 font-semibold hover:underline">Shop plans and ONN kits</span>
          </Link>
          , or start the{" "}
          <Link href="/36hr-trial">
            <span className="text-orange-400 font-semibold hover:underline">free 36-hour trial</span>
          </Link>{" "}
          first—no credit card.
        </p>
      </PillarLayout>
    </>
  );
}
