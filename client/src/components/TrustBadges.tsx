import { Shield, Lock, RefreshCw, Headphones, CreditCard, CheckCircle } from "lucide-react";

interface TrustBadgesProps {
  variant?: "horizontal" | "compact";
  className?: string;
}

export function TrustBadges({ variant = "horizontal", className = "" }: TrustBadgesProps) {
  const badges = [
    {
      icon: Lock,
      label: "SSL Secure",
      sublabel: "256-bit encryption",
      color: "text-green-400"
    },
    {
      icon: RefreshCw,
      label: "Money-Back",
      sublabel: "30-day guarantee",
      color: "text-blue-400"
    },
    {
      icon: Headphones,
      label: "24/7 Support",
      sublabel: "Always here to help",
      color: "text-orange-400"
    },
    {
      icon: Shield,
      label: "Secure Payment",
      sublabel: "Protected checkout",
      color: "text-purple-400"
    }
  ];

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
        {badges.map((badge, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <badge.icon className={`w-4 h-4 ${badge.color}`} />
            <span className="text-gray-300">{badge.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 border-y border-white/10 py-6 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-center gap-3 group"
              data-testid={`trust-badge-${idx}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors`}>
                <badge.icon className={`w-6 h-6 ${badge.color}`} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white text-sm">{badge.label}</div>
                <div className="text-xs text-gray-300">{badge.sublabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <div className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-2">
        <CreditCard className="w-5 h-5 text-blue-400" />
        <span className="text-xs font-medium text-white">Visa</span>
      </div>
      <div className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-2">
        <CreditCard className="w-5 h-5 text-red-400" />
        <span className="text-xs font-medium text-white">Mastercard</span>
      </div>
      <div className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-2">
        <CreditCard className="w-5 h-5 text-blue-500" />
        <span className="text-xs font-medium text-white">PayPal</span>
      </div>
      <div className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-2">
        <CreditCard className="w-5 h-5 text-gray-300" />
        <span className="text-xs font-medium text-white">Apple Pay</span>
      </div>
      <div className="flex items-center gap-2 ml-2">
        <Lock className="w-4 h-4 text-green-400" />
        <span className="text-xs text-green-400 font-medium">Secure Checkout</span>
      </div>
    </div>
  );
}

export function GuaranteeBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
          100%
        </div>
      </div>
      <div className="text-left">
        <div className="text-lg font-bold text-white">Satisfaction Guaranteed</div>
        <div className="text-sm text-gray-300">30-day money-back promise</div>
      </div>
    </div>
  );
}
