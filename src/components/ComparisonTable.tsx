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
    <section className="py-12 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Why Choose Inferno TV?
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Compare us to traditional cable and streaming services
          </p>
        </div>

        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-xl overflow-hidden shadow-xl">
            <thead>
              <tr className="bg-gradient-to-r from-gray-900 to-gray-800">
                <th className="px-4 py-4 text-left text-white font-bold text-sm">Feature</th>
                <th className="px-4 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-1">
                      Inferno TV
                    </div>
                    <div className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      BEST VALUE
                    </div>
                  </div>
                </th>
                <th className="px-4 py-4 text-center text-gray-400 font-semibold text-sm">Cable TV</th>
                <th className="px-4 py-4 text-center text-gray-400 font-semibold text-sm">Streaming</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className="border-t border-gray-700 hover:bg-gray-750 transition-colors"
                >
                  <td className="px-4 py-3 text-white font-medium text-sm">{feature.name}</td>
                  <td className="px-4 py-3 text-center">
                    {typeof feature.inferno === 'boolean' ? (
                      feature.inferno ? (
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )
                    ) : (
                      <span className="text-orange-400 font-bold text-sm">{feature.inferno}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {typeof feature.cable === 'boolean' ? (
                      feature.cable ? (
                        <Check className="w-5 h-5 text-gray-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-gray-400 text-sm">{feature.cable}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {typeof feature.streaming === 'boolean' ? (
                      feature.streaming ? (
                        <Check className="w-5 h-5 text-gray-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-600 mx-auto" />
                      )
                    ) : (
                      <span className="text-gray-400 text-sm">{feature.streaming}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => window.location.href = '/checkout'}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-orange-500/50 transition-all transform hover:scale-105"
          >
            Get Started - Save $1,920/Year
          </button>
          <p className="text-gray-400 mt-3 text-xs">
            Join 2,700+ happy customers who switched from cable
          </p>
        </div>
      </div>
    </section>
  );
}
