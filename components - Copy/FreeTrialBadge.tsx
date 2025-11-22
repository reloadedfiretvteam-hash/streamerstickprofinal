import { Clock, Zap } from 'lucide-react';

export default function FreeTrialBadge() {
  return (
    <div className="fixed top-20 right-4 md:right-8 z-40 animate-bounce-slow">
      <div className="relative">
        {/* Pulsing Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
        
        {/* Badge Content */}
        <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 shadow-2xl border-2 border-orange-300/50 max-w-[160px]">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-white" />
            <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
          </div>
          
          <div className="text-white font-bold text-xl leading-tight mb-1">
            36-Hour
          </div>
          <div className="text-white/90 font-semibold text-sm mb-2">
            FREE TRIAL
          </div>
          
          <div className="text-xs text-white/80 leading-tight">
            No commitment, cancel anytime
          </div>

          {/* Arrow Pointer */}
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-orange-500"></div>
        </div>

        {/* Click Action */}
        <button
          onClick={() => {
            const shopSection = document.getElementById('shop');
            if (shopSection) {
              shopSection.scrollIntoView({ behavior: 'smooth' });
            } else {
              window.location.href = '/shop';
            }
          }}
          className="absolute inset-0 cursor-pointer"
          aria-label="Scroll to free trial"
        >
          <span className="sr-only">Get 36-hour free trial</span>
        </button>
      </div>
    </div>
  );
}
