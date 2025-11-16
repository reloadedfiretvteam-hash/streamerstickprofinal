import { Tv, Smartphone, Globe, Zap, Shield, DollarSign } from 'lucide-react';

export default function FeatureIconRow() {
  const features = [
    {
      icon: Tv,
      title: '20,000+ Channels',
      subtitle: 'Live TV'
    },
    {
      icon: Smartphone,
      title: 'All Devices',
      subtitle: 'Any Platform'
    },
    {
      icon: Globe,
      title: 'Worldwide',
      subtitle: 'International'
    },
    {
      icon: Zap,
      title: 'HD/4K Quality',
      subtitle: 'Crystal Clear'
    },
    {
      icon: Shield,
      title: '7-Day Guarantee',
      subtitle: 'Risk Free'
    },
    {
      icon: DollarSign,
      title: 'Best Prices',
      subtitle: 'Save 50%+'
    }
  ];

  return (
    <section className="py-8 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-lg hover:from-orange-600/20 hover:to-red-600/20 transition-all border border-gray-700/50 hover:border-orange-500/50"
            >
              <feature.icon className="w-8 h-8 text-orange-400 mb-2" />
              <h3 className="text-white font-bold text-sm mb-1">{feature.title}</h3>
              <p className="text-gray-400 text-xs">{feature.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
