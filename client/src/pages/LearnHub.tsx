import { useEffect } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { V4Footer, V4Header } from "@/components/v4/V4Chrome";
import "@/styles/v4.css";

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
    <div className="v4 min-h-screen">
      <V4Header />
      <main id="main-content" className="v4-shell py-12">
        <p className="text-sm text-[#536275]"><Link href="/">Home</Link> / Learn</p>
        <h1 className="mt-6 max-w-[820px] text-[34px] font-bold lg:text-5xl">Learn before you buy.</h1>
        <p className="mt-4 max-w-[680px] text-lg text-[#536275]">Written guides and the blog. No invented reviews or unverifiable counts on this page.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-[#D7DFE7] bg-white p-6">
            <h2 className="text-2xl font-bold">Setup guides</h2>
            <p className="mt-2 text-[#536275]">Steps for the device in front of you.</p>
            <Link href="/guides"><span className="v4-btn v4-btn-primary mt-6">Open guides</span></Link>
          </article>
          <article className="rounded-2xl border border-[#D7DFE7] bg-white p-6">
            <h2 className="text-2xl font-bold">Articles</h2>
            <p className="mt-2 text-[#536275]">Longer written help from the blog.</p>
            <Link href="/blog"><span className="v4-btn v4-btn-secondary-light mt-6">Open the blog</span></Link>
          </article>
        </div>
      </main>
      <V4Footer />
    </div>
  );
}
