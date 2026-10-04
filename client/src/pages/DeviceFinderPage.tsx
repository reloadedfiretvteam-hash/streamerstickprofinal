import { useEffect } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { V4Footer, V4Header } from "@/components/v4/V4Chrome";
import "@/styles/v4.css";

export default function DeviceFinderPage() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setPageMeta({
      title: "Find your setup | StreamStickPro",
      description: "Pick your device to find compatibility information and the right setup guide.",
      path: "/device-finder",
    });
  }, []);

  return (
    <div className="v4 min-h-screen">
      <V4Header />
      <main id="main-content" className="v4-shell py-12">
        <p className="text-sm text-[#536275]"><Link href="/">Home</Link> / Device Finder</p>
        <h1 className="mt-6 max-w-[820px] text-[34px] font-bold lg:text-5xl">What are you watching on?</h1>
        <p className="mt-4 max-w-[680px] text-lg text-[#536275]">Use the homepage finder, or jump to a category. We do not infer compatibility from a category alone.</p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {[
            ["Fire TV", "/jailbroken-fire-sticks"],
            ["Google TV", "/onn-google-tv"],
            ["ONN", "/onn-google-tv"],
            ["Android TV", "/iptv-media-players"],
            ["Plans", "/plans"],
            ["Support", "/support"],
          ].map(([label, href]) => (
            <li key={label}>
              <Link href={href}><span className="v4-btn v4-btn-secondary-light w-full">{label}</span></Link>
            </li>
          ))}
        </ul>
        <p className="mt-8">
          <Link href="/#H05"><span className="underline">Use the homepage Device Finder</span></Link>
        </p>
      </main>
      <V4Footer />
    </div>
  );
}
