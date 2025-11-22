import { Wifi, Monitor, DollarSign, Globe2 } from 'lucide-react';

export default function WhatIsIPTV() {
  const benefits = [
    {
      icon: Wifi,
      title: 'Internet-Based Streaming',
      description: 'IPTV delivers television content over the internet rather than traditional cable or satellite, giving you more flexibility and control.',
    },
    {
      icon: Monitor,
      title: 'Watch Anywhere, Anytime',
      description: 'Stream on any device - Smart TVs, phones, tablets, computers, Fire Stick, Android Box, and more. Your entertainment travels with you.',
    },
    {
      icon: DollarSign,
      title: 'Save Money',
      description: 'Get access to thousands of channels and on-demand content for a fraction of what traditional cable companies charge.',
    },
    {
      icon: Globe2,
      title: 'Global Content',
      description: 'Access international channels, sports from around the world, and content in multiple languages - all from one service.',
    },
  ];

  return (
    <section id="learn" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-slide-up">
              What is IPTV?
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed animate-slide-up animation-delay-200">
              IPTV stands for <span className="font-semibold text-blue-600">Internet Protocol Television</span>.
              It's the modern way to watch TV - streaming live channels, movies, and series directly over your
              internet connection instead of through traditional cable or satellite.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 transform transition-transform hover:scale-110 hover:rotate-3">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl p-8 md:p-12 text-white animate-fade-in animation-delay-600 hover:shadow-2xl transition-shadow duration-300">
            <h3 className="text-3xl font-bold mb-6 animate-slide-up">Why Choose Our IPTV Service?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-300 mb-3">Premium Quality</h4>
                <ul className="space-y-2 text-blue-100">
                  <li>• 4K, FHD, and HD streaming options</li>
                  <li>• Anti-freeze technology for smooth playback</li>
                  <li>• 99.9% uptime guarantee</li>
                  <li>• Buffer-free streaming</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-300 mb-3">Unmatched Content</h4>
                <ul className="space-y-2 text-blue-100">
                  <li>• 22,000+ live TV channels</li>
                  <li>• 120,000+ movies and series</li>
                  <li>• All major sports leagues and PPV</li>
                  <li>• International channels worldwide</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-blue-800">
              <p className="text-lg text-blue-100">
                We're not just another IPTV provider - we're committed to delivering the best streaming
                experience with reliable service, premium content, and 24/7 customer support. Join over
                2,700 satisfied customers who have made the switch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
