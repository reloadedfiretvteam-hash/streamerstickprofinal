import { useEffect } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { StagingFooter, StagingHeader } from "@/components/staging/StagingChrome";
import "@/styles/staging.css";

export default function UltimateIptvCatalog() {
  useEffect(() => {
    setPageMeta({
      title: "Live TV catalog notes | StreamStickPro",
      description: "Use devices, plans, and setup guides for the current StreamStickPro offer. Channel lists are not invented on this page.",
      path: "/ultimate-iptv-catalog-2026",
      noindex: true,
    });
  }, []);

  return (
    <div className="stg min-h-screen">
      <StagingHeader />
      <main id="main-content" className="stg-shell stg-section">
        <h1>Look at the live catalog instead.</h1>
        <p className="mt-4 max-w-[720px] text-[#536275]">
          This older page used invented channel and movie counts. StreamStickPro does not publish those numbers here. Shop a Google TV package or a live TV plan from the live catalog.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/devices/"><span className="stg-btn stg-btn-primary">Google TV devices</span></Link>
          <Link href="/plans/"><span className="stg-btn stg-btn-secondary-light">Live TV plans</span></Link>
          <Link href="/shop"><span className="stg-btn stg-btn-secondary-light">Shop</span></Link>
        </div>
      </main>
      <StagingFooter />
    </div>
  );
}
