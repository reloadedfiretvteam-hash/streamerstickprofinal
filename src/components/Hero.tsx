import { ShoppingCart, Play, Sparkles, TrendingUp } from 'lucide-react';

export default function Hero() {
  const goToCheckout = () => {
    window.location.href = '/checkout';
  };

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden min-h-[700px] flex items-center">
      {/* Animated background patterns */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-20"></div>
      
      {/* Gradient orbs for depth */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>

      <div className="container mx-auto px-4 py-20 md:py-24 relative z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Top badge with trending icon */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/40 rounded-full px-6 py-3 shadow-lg shadow-orange-500/20">
              <TrendingUp className="w-5 h-5 text-orange-400 animate-bounce" />
              <span className="text-sm font-semibold text-orange-300 tracking-wide">🔥 #1 PREMIUM IPTV PROVIDER - TRUSTED BY 2,700+ CUSTOMERS</span>
              <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* Main heading with enhanced gradients */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold mb-8 animate-slide-up leading-tight tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 animate-gradient drop-shadow-2xl">
              Stream Stick Pro
            </span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-6xl text-white font-bold drop-shadow-lg">Premium IPTV Subscriptions</span>
            <br />
            <span className="text-2xl sm:text-3xl md:text-5xl bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent font-semibold">& Jailbroken Fire Stick Shop</span>
          </h1>

          {/* Enhanced value proposition */}
          <div className="mb-10 animate-slide-up animation-delay-200">
            <p className="text-xl sm:text-2xl md:text-3xl text-white font-semibold mb-3 drop-shadow-md">
              <span className="text-orange-400">20,000+</span> Live Channels • <span className="text-orange-400">60,000+</span> Movies & Shows
            </p>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-200 font-medium">
              All Sports • PPV Events • 4K Streaming • 24/7 Support
            </p>
          </div>

          {/* CTA Buttons with enhanced styling */}
          <div className="flex flex-col sm:flex-row justify-center gap-5 mb-12 animate-slide-up animation-delay-400">
            <button
              onClick={goToCheckout}
              className="group relative px-10 py-5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 hover:from-orange-600 hover:via-red-600 hover:to-orange-600 rounded-2xl font-bold text-xl transition-all transform hover:scale-110 hover:shadow-2xl shadow-lg shadow-orange-500/50 inline-flex items-center justify-center gap-4 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <ShoppingCart className="w-7 h-7 group-hover:rotate-12 transition-transform" />
              <span className="relative">Shop Now</span>
              <span className="relative bg-white/30 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-bold border border-white/40">Save 50%</span>
            </button>
            <button
              onClick={scrollToAbout}
              className="group px-10 py-5 bg-white/10 backdrop-blur-md hover:bg-white/20 border-2 border-white/30 hover:border-white/50 rounded-2xl font-bold text-xl transition-all transform hover:scale-105 inline-flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              Learn More
            </button>
          </div>

          {/* Enhanced stats cards with icons and better styling */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto animate-slide-up animation-delay-600">
            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl px-6 py-5 border border-white/20 hover:border-orange-400/50 transition-all hover:transform hover:scale-105 hover:shadow-xl shadow-lg">
              <div className="text-orange-400 font-extrabold text-3xl mb-1 group-hover:scale-110 transition-transform">2,700+</div>
              <div className="text-blue-100 font-semibold text-base">Happy Customers</div>
              <div className="text-blue-300/60 text-xs mt-1">Worldwide</div>
            </div>
            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl px-6 py-5 border border-white/20 hover:border-orange-400/50 transition-all hover:transform hover:scale-105 hover:shadow-xl shadow-lg">
              <div className="text-orange-400 font-extrabold text-3xl mb-1 group-hover:scale-110 transition-transform">4.9/5 ⭐</div>
              <div className="text-blue-100 font-semibold text-base">Customer Rating</div>
              <div className="text-blue-300/60 text-xs mt-1">Verified Reviews</div>
            </div>
            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl px-6 py-5 border border-white/20 hover:border-orange-400/50 transition-all hover:transform hover:scale-105 hover:shadow-xl shadow-lg">
              <div className="text-orange-400 font-extrabold text-3xl mb-1 group-hover:scale-110 transition-transform">Same Day</div>
              <div className="text-blue-100 font-semibold text-base">Shipping Available</div>
              <div className="text-blue-300/60 text-xs mt-1">Fast Delivery</div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 animate-fade-in animation-delay-800">
            <p className="text-sm text-blue-300/80 font-medium mb-4">TRUSTED & SECURE</p>
            <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
              <div className="text-xs font-semibold text-white/70">✓ SSL ENCRYPTED</div>
              <div className="text-xs font-semibold text-white/70">✓ 36-HR FREE TRIAL</div>
              <div className="text-xs font-semibold text-white/70">✓ 24/7 SUPPORT</div>
              <div className="text-xs font-semibold text-white/70">✓ MONEY-BACK GUARANTEE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent pointer-events-none"></div>
    </section>
  );
}
