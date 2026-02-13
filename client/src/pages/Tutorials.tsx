import { useEffect } from "react";
import { Link } from "wouter";
import { PillarLayout } from "@/components/PillarLayout";
import { Button } from "@/components/ui/button";
import { Play, Home } from "lucide-react";

const TITLE = "Adding IPTV Media Players to Your Devices";
const DESC = "Step-by-step video tutorials: install IPTV media player on Fire Stick and ONN Google TV. Quick setup guides from StreamStickPro.";

const VIDEOS = [
  {
    id: "9pZOoS-1NHg",
    title: "Install IPTV Media Player on Fire Stick",
    label: "Install IPTV Media Player on Fire Stick",
  },
  {
    id: "w6s_Tcnnbpo",
    title: "Install IPTV Media Player on ONN Google Device",
    label: "Install IPTV Media Player on ONN Google Device",
  },
];

export default function Tutorials() {
  useEffect(() => {
    document.title = `${TITLE} | Video Tutorials | StreamStick Pro`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", DESC);
  }, []);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Tutorials", href: "/tutorials" },
  ];

  return (
    <>
      <PillarLayout title={TITLE} description={DESC} breadcrumbs={breadcrumbs}>
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
              <Home className="w-4 h-4" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
        </div>

        <section aria-labelledby="tutorial-videos-heading" className="space-y-12">
          <h2 id="tutorial-videos-heading" className="text-2xl font-bold text-white sr-only">
            Video tutorials
          </h2>

          {VIDEOS.map((video, index) => (
            <article key={video.id} className="rounded-2xl bg-gray-800/50 border border-white/10 overflow-hidden">
              <div className="p-4 md:p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-orange-400" aria-hidden="true" />
                  {video.label}
                </h3>
                <div className="aspect-video w-full max-w-3xl rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Home className="w-4 h-4" aria-hidden="true" />
              Back to Home
            </Button>
          </Link>
        </div>
      </PillarLayout>
    </>
  );
}
