import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Tv, Zap } from "lucide-react";
import { motion } from "framer-motion";

const SUPABASE_BASE = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges";
/** Player / UI art only—avoid retail box shots that show third‑party fee/marketing banners. */
const POSTER_CANDIDATES = [
  `${SUPABASE_BASE}/iptv-subscription.jpg`,
  "/images/iptv-subscription.jpg",
  "/opengraph.jpg",
];
const fallbackPoster = `/opengraph.jpg`;
const demoVideoSrc = `${SUPABASE_BASE}/demo-video.mp4`;

export function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [posterSrc, setPosterSrc] = useState(POSTER_CANDIDATES[0] ?? fallbackPoster);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cancelled = false;
    const pickPoster = async () => {
      for (const src of POSTER_CANDIDATES) {
        if (cancelled) return;
        const ok = await new Promise<boolean>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = src;
        });
        if (cancelled) return;
        if (ok) {
          setPosterSrc(src);
          return;
        }
      }
      if (!cancelled) setPosterSrc(fallbackPoster);
    };
    pickPoster();
    return () => {
      cancelled = true;
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="py-16 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/20 backdrop-blur-sm border border-[#7C3AED]/30 rounded-full px-6 py-2 mb-6">
            <Tv className="w-5 h-5 text-[#00D4FF]" />
            <span className="text-sm font-medium text-[#D9CCFF]">WHAT YOU GET</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#7C3AED] to-[#10F7BE]">
              Example video.
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            This isn&apos;t a generic promo—it&apos;s a real look at what you get: the live TV player, categories, channel list, preview window, and guide-style layout. After you order, you still get a separate device-specific setup tutorial by email for your exact kit.
          </p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto"
        >
          <div 
            className="relative aspect-video rounded-3xl overflow-hidden border-2 border-[#7C3AED]/40 shadow-2xl shadow-cyan-500/15 bg-black group cursor-pointer"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onClick={togglePlay}
            data-testid="demo-video-container"
          >
            <video
              ref={videoRef}
              src={demoVideoSrc}
              poster={posterSrc}
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
              onError={() => setPosterSrc(fallbackPoster)}
              playsInline
              data-testid="demo-video"
            >
              <track kind="captions" src="/captions/demo.vtt" srcLang="en" label="English" default />
            </video>
            
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-[#0A0A0F]/45 via-black/25 to-[#1A1A22]/50">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-25"></div>
                
                <motion.div 
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  className="relative z-10"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] flex items-center justify-center shadow-2xl shadow-cyan-500/30 animate-pulse">
                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                  </div>
                </motion.div>
                
                <div className="absolute top-6 right-6 z-20 bg-black/70 text-white text-xs md:text-sm px-3 py-1.5 rounded-full border border-white/20">
                  Click to Play Video
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#00D4FF] to-[#7C3AED] rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold text-lg">What you get</p>
                      <p className="text-sm text-gray-300">Actual player interface—browse categories, channels, and watch the preview pane</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-300">
                    <span>Live TV player</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Channel guide</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Real interface</span>
                  </div>
                </div>
              </div>
            )}
            
            {showControls && isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      data-testid="button-play-pause"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                      data-testid="button-mute"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                    </button>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                    data-testid="button-fullscreen"
                  >
                    <Maximize className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-r from-[#00D4FF]/15 to-[#7C3AED]/15 border border-[#00D4FF]/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-[#00D4FF]">18,000+</div>
              <div className="text-sm text-gray-300">Live TV Channels</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">60K + 15K</div>
              <div className="text-sm text-gray-300">Movies + Series</div>
            </div>
            <div className="bg-gradient-to-r from-[#7C3AED]/20 to-pink-500/20 border border-[#7C3AED]/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">Sports + News</div>
              <div className="text-sm text-gray-300">International coverage</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
