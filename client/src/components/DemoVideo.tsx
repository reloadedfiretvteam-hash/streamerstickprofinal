import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Tv, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";
import demoVideoSrc from "@assets/reloadedfiretv-online-video-cutter.com__1764979030482.mp4";
import iptvCoverImg from "@assets/OIF_1764979270800.jpg";

export function DemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

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
          <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full px-6 py-2 mb-6">
            <Tv className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">SEE WHAT YOU GET</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
              Experience Stream Stick Pro
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Watch what's included with every Fire Stick purchase - premium channels, sports, movies & more!
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
            className="relative aspect-video rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 bg-black group cursor-pointer"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onClick={togglePlay}
            data-testid="demo-video-container"
          >
            <video
              ref={videoRef}
              src={demoVideoSrc}
              poster={iptvCoverImg}
              className="w-full h-full object-cover"
              onEnded={() => setIsPlaying(false)}
              playsInline
              data-testid="demo-video"
            />
            
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-purple-900/60 via-black/40 to-orange-900/40">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-30"></div>
                
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative z-10"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse">
                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                  </div>
                </motion.div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold text-lg">Stream Stick Pro - What You Get</p>
                      <p className="text-sm text-gray-300">Setup Guide & Live Demo</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      4.9 Rating
                    </span>
                    <span>•</span>
                    <span>2,700+ Happy Customers</span>
                    <span>•</span>
                    <span>24/7 Support</span>
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
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">18,000+</div>
              <div className="text-sm text-gray-400">Live Channels</div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">60,000+</div>
              <div className="text-sm text-gray-400">Movies & Shows</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">All Sports</div>
              <div className="text-sm text-gray-400">& PPV Events</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
