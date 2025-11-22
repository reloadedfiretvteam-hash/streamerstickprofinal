import { Play } from 'lucide-react';

export default function DemoVideo() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              See <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Inferno TV</span> in Action
            </h2>
            <p className="text-xl text-gray-300">
              Watch our quick walkthrough - from setup to streaming in under 5 minutes
            </p>
          </div>

          {/* Video Container */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
            {/* Placeholder - Replace with actual video embed from watchonFireTV.com */}
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              {/*
                TO UPDATE THIS VIDEO:
                1. Go to watchonFireTV.com
                2. Get the video embed code or YouTube link
                3. Replace this div with:
                   <iframe
                     src="YOUR_VIDEO_URL"
                     className="w-full h-full"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                   />
              */}
              <div className="text-center">
                <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 group-hover:scale-110 cursor-pointer">
                  <Play className="w-12 h-12 text-white" fill="white" />
                </div>
                <p className="text-white text-2xl font-bold mb-2">What You Get Demo Video</p>
                <p className="text-gray-400">Click to watch the full walkthrough</p>
                <p className="text-sm text-gray-500 mt-4">
                  (Video from watchonFireTV.com - to be embedded)
                </p>
              </div>
            </div>

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Video Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="text-lg font-bold text-white mb-2">Unboxing</h3>
              <p className="text-gray-400">See what's included in the package</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-white mb-2">5-Minute Setup</h3>
              <p className="text-gray-400">Watch the easy setup process</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📺</div>
              <h3 className="text-lg font-bold text-white mb-2">Start Streaming</h3>
              <p className="text-gray-400">See all 18,000 channels live</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
