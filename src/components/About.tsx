import { Flame, Shield, Clock, Award } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-6 py-2 mb-6">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium">ABOUT INFERNO TV</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Inferno TV?</span>
            </h2>
          </div>

          <div className="prose prose-lg prose-invert max-w-none mb-12">
            <p className="text-xl text-blue-100 leading-relaxed mb-6">
              Inferno TV is your premier destination for premium IPTV subscriptions and fully jailbroken Fire Stick devices. We specialize in delivering the ultimate streaming experience with access to over 18,000 live channels and 60,000+ movies and TV shows.
            </p>

            <p className="text-lg text-blue-200 leading-relaxed mb-6">
              Unlike other websites that claim to offer "fully loaded" Fire Sticks with hundreds of apps, we take a different approach. We know you don't want hundreds of apps that fail daily, don't update themselves, and aren't user-friendly. That's why our solution is simple: <strong className="text-orange-400">ONE app does it all</strong>.
            </p>

            <p className="text-lg text-blue-200 leading-relaxed">
              When your subscription period ends, you can easily renew or upgrade to one of our flexible IPTV subscription plans. We're here to support you every step of the way with 24/7 customer service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <Shield className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Secure & Reliable</h3>
              <p className="text-blue-200">
                Premium servers with 99.9% uptime. Your streaming never stops, and your data is always protected.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <Clock className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
              <p className="text-blue-200">
                Our dedicated support team is available around the clock to help you with any questions or issues.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <Flame className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Easy Setup</h3>
              <p className="text-blue-200">
                Pre-configured devices ready in 5 minutes. No technical knowledge required - just plug in and watch.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <Award className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Quality Guarantee</h3>
              <p className="text-blue-200">
                36-hour free trial. If you're not satisfied, we'll refund your purchase - no questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
