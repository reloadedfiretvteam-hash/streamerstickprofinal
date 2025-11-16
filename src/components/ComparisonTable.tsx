import { Check, X } from 'lucide-react';

export default function ComparisonTable() {
  const features = [
    { name: 'Monthly Cost', inferno: '$20/mo', cable: '$180/mo', streaming: '$75/mo' },
    { name: 'Live Channels', inferno: '18,000+', cable: '200', streaming: '85' },
    { name: 'Movies & Shows', inferno: '60,000+', cable: '5,000', streaming: '15,000' },
    { name: 'Sports & PPV', inferno: true, cable: true, streaming: false },
    { name: 'International Channels', inferno: true, cable: false, streaming: false },
    { name: '4K Quality', inferno: true, cable: false, streaming: true },
    { name: 'No Contract', inferno: true, cable: false, streaming: true },
    { name: 'Multiple Devices', inferno: true, cable: false, streaming: true },
    { name: 'DVR Function', inferno: true, cable: true, streaming: false },
    { name: 'Setup Time', inferno: '5 minutes', cable: '2-3 days', streaming: '10 minutes' }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why Choose Inferno TV?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Compare us to traditional cable and streaming services
          </p>
        </div>

        <div className="max-w-6xl mx-auto overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            <thead>
              <tr className="bg-gradient-to-r from-gray-900 to-gray-800">
                <th className="px-6 py-6 text-left text-white font-bold text-lg">Feature</th>
                <th className="px-6 py-6 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                      Inferno TV
                    </div>
                    <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      BEST VALUE
                    </div>
                  </div>
                </th>
                <th className="px-6 py-6 text-center text-gray-400 font-semibold">Cable TV</th>
                <th className="px-6 py-6 text-center text-gray-400 font-semibold">Streaming</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <td className="px-6 py-4 text-white font-medium">{feature.name}</td>
                  <td className="px-6 py-4 text-center">
                    {typeof feature.inferno === 'boolean' ? (
                      feature.inferno ? (
                        <Check className="w-6 h-6 text-green-400 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-red-400 mx-auto" />
                      )
                    ) : (
                      <span className="text-orange-400 font-bold">{feature.inferno}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof feature.cable === 'boolean' ? (
                      feature.cable ? (
                        <Check className="w-6 h-6 text-gray-400 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-gray-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-gray-400">{feature.cable}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {typeof feature.streaming === 'boolean' ? (
                      feature.streaming ? (
                        <Check className="w-6 h-6 text-gray-400 mx-auto" />
                      ) : (
                        <X className="w-6 h-6 text-gray-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-gray-400">{feature.streaming}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-12 py-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xl rounded-xl shadow-2xl hover:shadow-orange-500/50 transition-all transform hover:scale-105"
          >
            Get Started - Save $1,920/Year
          </button>
          <p className="text-gray-400 mt-4 text-sm">
            Join 2,700+ happy customers who switched from cable
          </p>
        </div>
      </div>
    </section>
  );
}
