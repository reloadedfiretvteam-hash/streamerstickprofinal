import { Check, X, Info } from 'lucide-react';
import { useState } from 'react';

interface ComparisonFeature {
  feature: string;
  jailbroken: boolean | string;
  stock: boolean | string;
  description?: string;
}

export default function FireStickComparisonTable() {
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const features: ComparisonFeature[] = [
    {
      feature: 'Free Live TV (18,000+ Channels)',
      jailbroken: true,
      stock: false,
      description: 'Access thousands of live TV channels from around the world including sports, news, entertainment, and international content.'
    },
    {
      feature: 'Free Movies & TV Shows (60,000+)',
      jailbroken: true,
      stock: false,
      description: 'Stream the latest movies and complete TV series without any monthly subscription fees.'
    },
    {
      feature: 'Sports & PPV Events',
      jailbroken: true,
      stock: 'Extra Cost',
      description: 'Watch all major sporting events including NFL, NBA, UFC, boxing, soccer, and more - included free.'
    },
    {
      feature: 'Third-Party App Installation',
      jailbroken: true,
      stock: false,
      description: 'Install apps outside the Amazon App Store for expanded functionality and content access.'
    },
    {
      feature: 'No Monthly Subscription Required',
      jailbroken: true,
      stock: false,
      description: 'One-time purchase gives you access to content without recurring cable or streaming fees.'
    },
    {
      feature: 'International Channels',
      jailbroken: true,
      stock: false,
      description: 'Access channels from multiple countries and in various languages.'
    },
    {
      feature: 'Pre-Configured Apps',
      jailbroken: 'Yes - Ready to Use',
      stock: 'Manual Setup',
      description: 'Device comes with all essential apps installed and configured - just plug in and start streaming.'
    },
    {
      feature: '4K Ultra HD Support',
      jailbroken: true,
      stock: true,
      description: 'Both versions support 4K streaming when using compatible models.'
    },
    {
      feature: 'Alexa Voice Control',
      jailbroken: true,
      stock: true,
      description: 'Use voice commands to control your device and search for content.'
    },
    {
      feature: 'Amazon Prime Video',
      jailbroken: true,
      stock: true,
      description: 'Access Amazon Prime Video on both versions (Prime subscription required).'
    },
    {
      feature: 'Netflix, Hulu, Disney+',
      jailbroken: true,
      stock: true,
      description: 'Popular streaming apps work on both versions (subscriptions required for these services).'
    },
    {
      feature: 'Average Monthly Cost',
      jailbroken: '$0 (After IPTV)',
      stock: '$150+/month',
      description: 'With cable TV averaging $150+/month, a jailbroken Fire Stick can save thousands yearly.'
    },
    {
      feature: 'DVR/Recording Capability',
      jailbroken: true,
      stock: false,
      description: 'Record your favorite shows and watch them later at your convenience.'
    },
    {
      feature: 'Ad-Free Experience',
      jailbroken: 'Mostly Yes',
      stock: 'Ads Included',
      description: 'Most third-party apps on jailbroken devices offer ad-free viewing experiences.'
    }
  ];

  const renderValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" aria-label="Available" />
      ) : (
        <X className="w-5 h-5 text-red-400 mx-auto" aria-label="Not available" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <section className="py-16 bg-gray-900" id="firestick-comparison">
      <div className="container mx-auto px-4">
        {/* SEO-Optimized Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Jailbroken vs. Stock FireStick Comparison
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Discover why thousands are choosing jailbroken Fire Stick devices. Compare features and see the difference 
            between a regular Fire Stick and a fully loaded, jailbroken Fire Stick 2025.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-2xl overflow-hidden shadow-2xl" role="table">
            <thead>
              <tr className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
                <th className="px-6 py-5 text-left text-white font-bold text-sm uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-5 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                      Jailbroken Fire Stick
                    </div>
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold uppercase">
                      Best Value 2025
                    </span>
                  </div>
                </th>
                <th className="px-6 py-5 text-center text-gray-400 font-semibold text-sm uppercase tracking-wider">
                  Stock Fire Stick
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((item, index) => (
                <tr
                  key={index}
                  className={`border-t border-gray-700 hover:bg-gray-750 transition-colors ${
                    index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-800'
                  }`}
                >
                  <td className="px-6 py-4 text-white font-medium text-sm">
                    <div className="flex items-center gap-2">
                      {item.feature}
                      {item.description && (
                        <button
                          className="text-gray-400 hover:text-orange-400 transition-colors relative"
                          onMouseEnter={() => setActiveTooltip(index)}
                          onMouseLeave={() => setActiveTooltip(null)}
                          onFocus={() => setActiveTooltip(index)}
                          onBlur={() => setActiveTooltip(null)}
                          aria-label={`More info about ${item.feature}`}
                        >
                          <Info className="w-4 h-4" />
                          {activeTooltip === index && (
                            <div className="absolute left-full ml-2 w-64 p-3 bg-gray-900 text-gray-300 text-xs rounded-lg shadow-xl z-20 border border-gray-700">
                              {item.description}
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-green-400">
                    {renderValue(item.jailbroken)}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-400">
                    {renderValue(item.stock)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Savings Calculator */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-8 border border-orange-500/20">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              Your Annual Savings with Jailbroken Fire Stick
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="text-red-400 text-lg font-semibold mb-2">Cable TV Cost</div>
                <div className="text-3xl font-bold text-white">$2,160</div>
                <div className="text-gray-400 text-sm">per year ($180/month)</div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-6">
                <div className="text-green-400 text-lg font-semibold mb-2">Jailbroken Fire Stick</div>
                <div className="text-3xl font-bold text-white">$150</div>
                <div className="text-gray-400 text-sm">one-time purchase + optional IPTV</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
                <div className="text-orange-400 text-lg font-semibold mb-2">You Save</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">$2,000+</div>
                <div className="text-gray-400 text-sm">in the first year alone!</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <a
            href="/shop"
            className="inline-block px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-orange-500/30 transition-all transform hover:scale-105"
          >
            Get Your Jailbroken Fire Stick Today
          </a>
          <p className="text-gray-400 mt-4 text-sm">
            Join over 2,700+ happy customers who made the switch
          </p>
        </div>
      </div>
    </section>
  );
}
