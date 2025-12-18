import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Tv, Film, Trophy, Zap } from "lucide-react";

const channels = [
  { name: "ESPN", color: "#d00" },
  { name: "HBO", color: "#000" },
  { name: "NFL Network", color: "#003369" },
  { name: "NBA TV", color: "#c8102e" },
  { name: "Fox Sports", color: "#003087" },
  { name: "CBS Sports", color: "#0d47a1" },
  { name: "NBC Sports", color: "#f37021" },
  { name: "UFC", color: "#d20a0a" },
  { name: "WWE", color: "#000" },
  { name: "Disney+", color: "#113ccf" },
  { name: "Showtime", color: "#ff0000" },
  { name: "Starz", color: "#000" },
  { name: "AMC", color: "#000" },
  { name: "TNT", color: "#e50914" },
  { name: "USA", color: "#003087" },
  { name: "FX", color: "#000" },
  { name: "Paramount+", color: "#0064ff" },
  { name: "Peacock", color: "#000" },
  { name: "MLB Network", color: "#002d72" },
  { name: "NHL Network", color: "#000" },
];

export function ChannelLogos({ className = "" }: { className?: string }) {
  return (
    <section className={`py-12 bg-gradient-to-b from-gray-900 to-gray-800/50 overflow-hidden ${className}`}>
      <div className="container mx-auto px-4 mb-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-4 py-2 mb-4">
            <Tv className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">AVAILABLE CHANNELS</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="text-white">Access Our </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Extensive Channel Library</span>
          </h2>
          <p className="text-gray-300">All your favorite networks included</p>
        </div>
      </div>
      
      {/* Scrolling logos - first row */}
      <div className="relative">
        <div className="flex animate-scroll">
          {[...channels, ...channels].map((channel, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 mx-4 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all"
              data-testid={`channel-logo-${idx}`}
            >
              <span className="text-white font-bold text-sm whitespace-nowrap">{channel.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats below */}
      <div className="container mx-auto px-4 mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <Tv className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">Extensive</div>
            <div className="text-sm text-gray-300">Channel Library</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <Film className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">Thousands</div>
            <div className="text-sm text-gray-300">Movies & Shows</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <Trophy className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">Full Sports</div>
            <div className="text-sm text-gray-300">Coverage</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
            <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">4K/HD</div>
            <div className="text-sm text-gray-300">Quality Streams</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// CSS animation for the scrolling effect
const scrollAnimationCSS = `
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  animation: scroll 30s linear infinite;
}

.animate-scroll:hover {
  animation-play-state: paused;
}
`;

// Inject the CSS (only once)
if (typeof document !== 'undefined' && !document.getElementById('channel-logos-style')) {
  const style = document.createElement('style');
  style.id = 'channel-logos-style';
  style.textContent = scrollAnimationCSS;
  document.head.appendChild(style);
}
