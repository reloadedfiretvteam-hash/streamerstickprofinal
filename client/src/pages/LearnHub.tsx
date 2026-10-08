import { useEffect } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { StagingFooter, StagingHeader } from "@/components/staging/StagingChrome";
import "@/styles/staging.css";

export default function LearnHub() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setPageMeta({
      title: "Learn setup and device basics | StreamStickPro",
      description: "Guides and articles for Google TV packages and plans for a device you already own.",
      path: "/learn",
    });
  }, []);

  return (
    <div className="stg min-h-screen">
      <StagingHeader />
      <main id="main-content" className="stg-shell stg-section">
        <p className="text-sm text-[#536275]"><Link href="/">Home</Link> / Learn</p>
        <h1 className="mt-6 max-w-[820px] text-[34px] font-bold lg:text-5xl">Learn before you buy.</h1>
        <p className="mt-4 max-w-[680px] text-lg text-[#536275]">Written guides and the blog for Google TV packages, live TV plans, VPN, and compatibility.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-[#D7DFE7] bg-white p-6">
            <h2 className="text-2xl font-bold">Setup guides</h2>
            <p className="mt-2 text-[#536275]">Steps for the device in front of you.</p>
            <Link href="/setup/"><span className="stg-btn stg-btn-primary mt-6">Open setup</span></Link>
          </article>
          <article className="rounded-2xl border border-[#D7DFE7] bg-white p-6">
            <h2 className="text-2xl font-bold">VPN and buffering</h2>
            <p className="mt-2 text-[#536275]">What a VPN is, and how it can stop ISP throttling.</p>
            <Link href="/vpn"><span className="stg-btn stg-btn-primary mt-6">Read the VPN guide</span></Link>
          </article>
          <article className="rounded-2xl border border-[#D7DFE7] bg-white p-6">
            <h2 className="text-2xl font-bold">Compatibility</h2>
            <p className="mt-2 text-[#536275]">Check the device you already own before you buy a plan.</p>
            <Link href="/compatibility/"><span className="stg-btn stg-btn-secondary-light mt-6">Check compatibility</span></Link>
          </article>
          <article className="rounded-2xl border border-[#D7DFE7] bg-white p-6">
            <h2 className="text-2xl font-bold">Articles</h2>
            <p className="mt-2 text-[#536275]">Longer written help from the blog.</p>
            <Link href="/blog"><span className="stg-btn stg-btn-secondary-light mt-6">Open the blog</span></Link>
          </article>
        </div>
      </main>
      <StagingFooter />
    </div>
  );
}
