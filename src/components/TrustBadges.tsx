import { Shield, Lock, CreditCard, Truck, HeadphonesIcon, RefreshCw } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: 'Secure Checkout',
      description: 'SSL Encrypted'
    },
    {
      icon: Lock,
      title: '100% Safe',
      description: 'Privacy Protected'
    },
    {
      icon: CreditCard,
      title: 'Multiple Payments',
      description: 'All Cards Accepted'
    },
    {
      icon: Truck,
      title: 'Fast Shipping',
      description: 'Same Day Available'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Always Here to Help'
    },
    {
      icon: RefreshCw,
      title: '7-Day Guarantee',
      description: 'Money Back Promise'
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-4 bg-gray-900/50 rounded-xl border border-gray-700/50 hover:border-orange-500/50 transition-all"
            >
              <badge.icon className="w-10 h-10 text-orange-400 mb-3" />
              <h3 className="text-white font-semibold text-sm mb-1">{badge.title}</h3>
              <p className="text-gray-400 text-xs">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
