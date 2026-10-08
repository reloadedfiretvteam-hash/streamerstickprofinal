import { useEffect } from "react";
import { Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { SetupGuideVideos } from "@/components/SetupGuideVideos";
import { StagingFooter, StagingHeader } from "@/components/staging/StagingChrome";
import "@/styles/staging.css";

const DESC =
  "Fire Stick and ONN Google TV setup previews. After checkout, the email with your credentials also includes the educational setup video.";

export default function Tutorials() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    setPageMeta({
      title: "Setup guides | StreamStickPro",
      description: DESC,
      path: "/setup",
      ogImage: "https://streamstickpro.com/images/setup-og.webp",
    });
    const id = window.location.hash.replace("#", "");
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="stg min-h-screen">
      <StagingHeader />
      <main id="main-content">
        <section className="stg-hero">
          <div className="stg-shell py-14">
            <p className="text-sm text-[#C9D4DF]">
              <Link href="/">Home</Link> / Setup
            </p>
            <h1 className="mt-4 max-w-3xl">Setup videos for Fire Stick and ONN Google TV</h1>
            <p className="mt-4 max-w-2xl text-[#C9D4DF]">{DESC}</p>
          </div>
        </section>
        <section className="stg-section">
          <div className="stg-shell">
            <SetupGuideVideos />
            <div className="stg-panel mt-8">
              <h2>These are previews</h2>
              <p className="mt-3 text-[#536275]">
                The public videos show the general media-player flow. Your order email has the login and the setup video for that order. If a step looks different, email support@streamstickpro.com with the model and the screen you are on. Do not send passwords in screenshots.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/shop"><span className="stg-btn stg-btn-primary">Shop devices and plans</span></Link>
                <Link href="/support/"><span className="stg-btn stg-btn-secondary-light">Contact support</span></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <StagingFooter />
    </div>
  );
}
