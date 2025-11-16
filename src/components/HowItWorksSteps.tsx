import { Play, Download, Power, Zap } from 'lucide-react';

export default function HowItWorksSteps() {
  const steps = [
    {
      number: 1,
      icon: Download,
      title: 'Order Your Device',
      description: 'Choose from Fire Stick HD, 4K, or 4K Max with pre-configured IPTV'
    },
    {
      number: 2,
      icon: Power,
      title: 'Plug & Play Setup',
      description: 'Simply plug into your TV and connect to WiFi - it\'s that easy!'
    },
    {
      number: 3,
      icon: Play,
      title: 'Start Streaming',
      description: 'Access 20,000+ channels, movies, sports & PPV instantly'
    },
    {
      number: 4,
      icon: Zap,
      title: 'Enjoy Premium Content',
      description: '24/7 support and unlimited streaming with no buffering'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Get started in 4 simple steps and enjoy unlimited streaming today
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              {/* Connector Line - Desktop Only */}
              {step.number < 4 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-orange-500 to-transparent z-0"></div>
              )}
              
              {/* Step Card */}
              <div className="relative bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/50 transition-all text-center">
                {/* Number Badge */}
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4 text-white font-bold text-xl">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-full mb-4">
                  <step.icon className="w-8 h-8 text-orange-400" />
                </div>

                {/* Content */}
                <h3 className="text-white font-bold text-lg mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => window.location.href = '/shop'}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold text-lg text-white transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  );
}
