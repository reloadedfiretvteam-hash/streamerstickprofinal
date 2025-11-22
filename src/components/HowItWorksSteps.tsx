import { ShoppingCart, Package, Plug, Play } from 'lucide-react';

export default function HowItWorksSteps() {
  const steps = [
    {
      icon: ShoppingCart,
      number: '1',
      title: 'Choose Your Plan',
      description: 'Select from our Fire Stick devices or IPTV subscriptions. All plans include premium features.'
    },
    {
      icon: Package,
      number: '2',
      title: 'Fast Delivery',
      description: 'Fire Sticks ship same-day. IPTV subscriptions activate instantly via email.'
    },
    {
      icon: Plug,
      number: '3',
      title: 'Quick Setup',
      description: 'Plug in your device or follow simple setup instructions. Takes less than 5 minutes.'
    },
    {
      icon: Play,
      number: '4',
      title: 'Start Streaming',
      description: 'Enjoy 20,000+ channels, 60,000+ movies, live sports, and PPV events immediately.'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Works</span>
          </h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Get started with Stream Stick Pro in 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-orange-400/50 transition-all hover:transform hover:scale-105"
              >
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-500/50">
                  {step.number}
                </div>

                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center mb-4 border border-orange-400/30">
                  <Icon className="w-8 h-8 text-orange-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <a
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-orange-500/50"
          >
            Get Started Now
          </a>
        </div>
      </div>
    </section>
  );
}
