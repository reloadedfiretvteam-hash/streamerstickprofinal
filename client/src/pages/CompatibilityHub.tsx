import { useEffect } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { StagingFooter, StagingHeader } from "@/components/staging/StagingChrome";
import "@/styles/staging.css";

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
    <div className="stg min-h-screen">
      <StagingHeader />
      <main id="main-content" className="stg-shell stg-section">
        <p className="text-sm text-[#536275]"><Link href="/">Home</Link> / Compatibility</p>
        <h1 className="mt-6 max-w-[820px] text-[34px] font-bold lg:text-5xl">Check the device you already own.</h1>
        <p className="mt-4 max-w-[680px] text-lg text-[#536275]">Compatibility depends on the exact model, platform, and supported player. Check the details before choosing a plan.</p>
        <ul className="mt-10 space-y-4">
          {[
            ["Fire TV", "/setup/", "/plans/"],
            ["Google TV", "/setup/", "/devices/"],
            ["ONN", "/setup/", "/devices/"],
            ["Android TV", "/setup/", "/plans/"],
            ["Smart TV", "/setup/", "/contact/?topic=compatibility"],
          ].map(([name, guide, extra]) => (
            <li key={name} className="rounded-2xl border border-[#D7DFE7] bg-white p-6">
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="mt-2 text-[#536275]">Status: Check With Support. A category is not a tested model.</p>
              <div className="mt-4 flex gap-4">
                <Link href={guide}><span className="underline">Guide</span></Link>
                <Link href={extra}><span className="underline">Next step</span></Link>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          Don’t see your device? <Link href="/contact/?topic=compatibility"><span className="underline">Send us its model number.</span></Link>
        </p>
      </main>
      <StagingFooter />
    </div>
  );
}
