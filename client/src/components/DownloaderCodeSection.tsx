import { motion } from "framer-motion";
import { Code, Download, ExternalLink, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloaderCodeSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-gray-800/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-full px-6 py-2 mb-6">
              <Code className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">DOWNLOADER CODES & COMMUNITY</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Trusted by Reddit & Fire Stick Communities
              </span>
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Recommended on r/firetvstick, r/IPTV, and r/Addons4Kodi. Thousands of users find us through downloader codes and community recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Downloader Code Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-transparent backdrop-blur-2xl rounded-3xl p-8 border-2 border-purple-400/30 shadow-2xl shadow-purple-500/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Downloader App Setup</h3>
              </div>
              <p className="text-gray-200 mb-6 leading-relaxed">
                Many customers find us through the <strong className="text-purple-300">Downloader app</strong> on Fire Stick. 
                Our pre-configured devices eliminate the need for downloader codes - everything is already installed and ready to use!
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">No downloader codes needed - all apps pre-installed</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">No manual setup required - plug and play</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-200">Instant credentials - start streaming in minutes</span>
                </div>
              </div>
            </motion.div>

            {/* Reddit & Community Proof */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent backdrop-blur-2xl rounded-3xl p-8 border-2 border-orange-400/30 shadow-2xl shadow-orange-500/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Reddit Recommended</h3>
              </div>
              <p className="text-gray-200 mb-6 leading-relaxed">
                StreamStickPro is frequently recommended in Reddit communities like <strong className="text-orange-300">r/firetvstick</strong>, 
                <strong className="text-orange-300"> r/IPTV</strong>, and <strong className="text-orange-300">r/Addons4Kodi</strong> for our 
                reliable service and excellent customer support.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-200">
                  <ExternalLink className="w-4 h-4 text-orange-400" />
                  <span>r/firetvstick - "Best pre-loaded Fire Stick"</span>
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <ExternalLink className="w-4 h-4 text-orange-400" />
                  <span>r/IPTV - "Reliable IPTV service"</span>
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <ExternalLink className="w-4 h-4 text-orange-400" />
                  <span>r/Addons4Kodi - "Great customer support"</span>
                </div>
              </div>
              <Button
                onClick={() => window.open("https://www.reddit.com/r/firetvstick", "_blank")}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit r/firetvstick
              </Button>
            </motion.div>
          </div>

          {/* Trust Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-gray-800/80 via-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                  2,700+
                </div>
                <div className="text-gray-300 text-sm">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
                  4.9/5
                </div>
                <div className="text-gray-300 text-sm">Reddit Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
                  98%
                </div>
                <div className="text-gray-300 text-sm">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                  24/7
                </div>
                <div className="text-gray-300 text-sm">Support Available</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
