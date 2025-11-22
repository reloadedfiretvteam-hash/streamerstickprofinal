import { Tv, Smartphone, Wifi, Shield, Clock, Headphones } from 'lucide-react';

export default function FeatureIconRow() {
  const features = [
    {
      icon: Tv,
      title: '20,000+ Channels',
      description: 'All premium channels included'
    },
    {
      icon: Smartphone,
      title: 'All Devices',
      description: 'Works on any device'
    },
    {
      icon: Wifi,
      title: '4K Streaming',
      description: 'Crystal clear quality'
    },
    {
      icon: Shield,
      title: 'Secure & Legal',
      description: '100% safe service'
    },
    {
      icon: Clock,
      title: 'Instant Access',
      description: 'Setup in 5 minutes'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Always here to help'
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-orange-400/50 transition-all hover:transform hover:scale-105"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-orange-500/30">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-white font-bold text-sm mb-1">{feature.title}</h3>
                <p className="text-blue-200 text-xs">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
