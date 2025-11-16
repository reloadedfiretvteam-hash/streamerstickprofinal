import { Play, CheckCircle } from 'lucide-react';

export default function WhatYouGetVideo() {
  const benefits = [
    '20,000+ Live TV Channels',
    '60,000+ Movies & TV Series',
    'All Sports & PPV Events',
    '4K/HD Streaming Quality',
    'Multiple Device Support',
    'No Contracts or Hidden Fees',
    '24/7 Customer Support',
    'Regular Content Updates'
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What You Get with Inferno TV
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Everything you need for unlimited entertainment
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          {/* Video Box */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
              {/* Placeholder for actual video */}
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4 cursor-pointer hover:scale-110 transition-transform">
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </div>
                  <p className="text-white font-semibold text-lg">Watch Demo Video</p>
                  <p className="text-gray-400 text-sm mt-2">See how easy it is to get started</p>
                </div>
              </div>

              {/* Video Info Bar */}
              <div className="bg-gray-800/50 px-6 py-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold">Complete Setup Guide</div>
                  <div className="text-orange-400 text-sm">3:45</div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits List */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 hover:border-orange-500/50 transition-all"
              >
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{benefit}</p>
                </div>
              </div>
            ))}

            <div className="mt-8">
              <button
                onClick={() => window.location.href = '/shop'}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 shadow-lg"
              >
                Start Your Free Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
