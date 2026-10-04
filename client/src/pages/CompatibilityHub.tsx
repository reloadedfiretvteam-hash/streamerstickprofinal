import { useEffect } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { V4Footer, V4Header } from "@/components/v4/V4Chrome";
import "@/styles/v4.css";

export default function CompatibilityHub() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setPageMeta({
      title: "Check device compatibility | StreamStickPro",
      description: "Compatibility depends on the exact model, platform, and supported player.",
      path: "/compatibility",
    });
  }, []);

  return (
    <div className="v4 min-h-screen">
      <V4Header />
      <main id="main-content" className="v4-shell py-12">
        <p className="text-sm text-[#536275]"><Link href="/">Home</Link> / Compatibility</p>
        <h1 className="mt-6 max-w-[820px] text-[34px] font-bold lg:text-5xl">Check the device you already own.</h1>
        <p className="mt-4 max-w-[680px] text-lg text-[#536275]">Compatibility depends on the exact model, platform, and supported player. Check the details before choosing a plan.</p>
        <ul className="mt-10 space-y-4">
          {[
            ["Fire TV", "/jailbroken-fire-sticks", "/setup"],
            ["Google TV / ONN", "/onn-google-tv", "/setup"],
            ["Android TV", "/iptv-media-players", "/setup"],
            ["Plans for a device you own", "/plans", "/36hr-trial"],
          ].map(([name, details, extra]) => (
            <li key={name} className="rounded-2xl border border-[#D7DFE7] bg-white p-6">
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="mt-2 text-[#536275]">Status: Check With Support until your exact model is confirmed.</p>
              <div className="mt-4 flex gap-4">
                <Link href={details}><span className="underline">Details</span></Link>
                <Link href={extra}><span className="underline">Next step</span></Link>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          Don’t see your device? <Link href="/support"><span className="underline">Send us its model number.</span></Link>
        </p>
      </main>
      <V4Footer />
    </div>
  );
}
