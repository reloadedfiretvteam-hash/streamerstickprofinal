import { motion } from "framer-motion";
import { Play, CheckCircle, Star, Zap, Shield, Smartphone, Tv, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function IPTVMediaPlayersSection() {
  const mediaPlayers = [
    {
      name: "TiviMate",
      description: "Premium IPTV player with EPG support, favorites, and recording",
      features: ["Electronic Program Guide", "Favorites & Playlists", "Recording Support", "Multi-account"],
      icon: "📺",
      compatible: ["Fire Stick", "Android TV", "Smart TV", "Mobile"]
    },
    {
      name: "IPTV Smarters Pro",
      description: "User-friendly IPTV player with modern interface and multi-screen support",
      features: ["Multi-screen Viewing", "Catch-up TV", "VOD Library", "Parental Control"],
      icon: "🎬",
      compatible: ["Fire Stick", "Android", "iOS", "Smart TV"]
    },
    {
      name: "Perfect Player",
      description: "Advanced IPTV player with extensive customization options",
      features: ["Customizable UI", "EPG Integration", "Recording", "Multi-playlist"],
      icon: "⚡",
      compatible: ["Android TV", "Fire Stick", "Smart TV"]
    },
    {
      name: "VLC Media Player",
      description: "Universal media player supporting IPTV streams and M3U playlists",
      features: ["M3U Playlist Support", "Live Streaming", "Cross-platform", "Free & Open Source"],
      icon: "🔷",
      compatible: ["All Platforms", "Fire Stick", "PC", "Mobile"]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-2 mb-6">
              <Play className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">IPTV MEDIA PLAYERS & APPS</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
                Compatible IPTV Players & Apps
              </span>
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Our IPTV service works with all major IPTV media players including TiviMate, IPTV Smarters, Perfect Player, and VLC.
              Fire Stick device options are supported with straightforward setup guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {mediaPlayers.map((player, index) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent backdrop-blur-2xl rounded-3xl p-8 border-2 border-blue-400/30 shadow-2xl shadow-blue-500/20 hover:border-blue-400/60 transition-all"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-5xl">{player.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{player.name}</h3>
                    <p className="text-gray-200 leading-relaxed">{player.description}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {player.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-200">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {player.compatible.map((device, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-sm text-blue-300"
                    >
                      {device}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-gray-800/80 via-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Why Choose Fire Stick Device Options?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Recommended Player Guidance</h4>
                <p className="text-gray-300 text-sm">
                  We recommend the best IPTV player for your device and provide clear setup steps.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Optimized Setup</h4>
                <p className="text-gray-300 text-sm">
                  Follow proven setup guidance and settings for stable, high-quality streaming performance.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Instant Access</h4>
                <p className="text-gray-300 text-sm">
                  Start streaming quickly with instant credentials and step-by-step support.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
