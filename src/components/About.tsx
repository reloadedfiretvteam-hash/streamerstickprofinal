import { Flame, Shield, Clock, Award } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-400/40 rounded-full px-7 py-3 mb-8 shadow-lg shadow-orange-500/20">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-semibold tracking-wide">ABOUT STREAM STICK PRO</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-400">Stream Stick Pro?</span>
            </h2>
          </div>

          <div className="prose prose-lg prose-invert max-w-none mb-16 animate-slide-up">
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-8 font-medium text-center">
              Your premier destination for premium IPTV subscriptions and fully jailbroken Fire Stick devices. Experience ultimate streaming with access to <span className="text-orange-400 font-bold">20,000+ live channels</span> and <span className="text-orange-400 font-bold">60,000+ movies and TV shows</span>.
            </p>

            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-l-4 border-orange-500 rounded-lg p-6 mb-8">
              <p className="text-lg text-blue-200 leading-relaxed mb-0">
                Unlike other websites offering "fully loaded" Fire Sticks with hundreds of failing apps, we take a smarter approach. <strong className="text-orange-400 text-xl">ONE app does it all</strong> - no confusion, no daily failures, no manual updates needed.
              </p>
            </div>

            <p className="text-lg text-blue-200 leading-relaxed text-center">
              Flexible IPTV subscription plans with easy renewals and upgrades. Plus, our <strong className="text-white">24/7 customer service</strong> team is always here to support you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl shadow-lg animate-slide-up">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">
                <Shield className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Secure & Reliable</h3>
              <p className="text-blue-200 leading-relaxed">
                Premium servers with <strong className="text-white">99.9% uptime</strong>. Your streaming never stops, and your data is always protected with enterprise-grade security.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl shadow-lg animate-slide-up animation-delay-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">
                <Clock className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">24/7 Support</h3>
              <p className="text-blue-200 leading-relaxed">
                Our dedicated support team is available <strong className="text-white">around the clock</strong> to help you with any questions, setup assistance, or technical issues.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-orange-400/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl shadow-lg animate-slide-up animation-delay-400">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">
                <Flame className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Easy Setup</h3>
              <p className="text-blue-200 leading-relaxed">
                Pre-configured devices ready in <strong className="text-white">5 minutes</strong>. No technical knowledge required - just plug in, connect to WiFi, and start watching.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl shadow-lg animate-slide-up animation-delay-600">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-5 group-hover:rotate-6 transition-transform">
                <Award className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Quality Guarantee</h3>
              <p className="text-blue-200 leading-relaxed">
                <strong className="text-white">36-hour free trial</strong> available. If you're not satisfied, we offer a full refund - no questions asked. Your satisfaction is our priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
