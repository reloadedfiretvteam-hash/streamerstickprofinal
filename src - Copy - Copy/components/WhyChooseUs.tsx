import { X, Check, AlertTriangle } from 'lucide-react';

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Don't Be Fooled By <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">Other Websites</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Many websites claim to sell "fully loaded" Fire Sticks with hundreds of apps. Here's the truth about what you're really getting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-red-500/10 backdrop-blur-md rounded-2xl p-8 border-2 border-red-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold">Other Fire Stick Websites</h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">Hundreds of apps that fail on a daily basis</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">Broken links and dead streams constantly</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">Apps don't update themselves - manual maintenance required</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">Confusing interfaces that aren't user-friendly</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">Long, complicated tutorials just to get started</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">Poor or no customer support when things break</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">You end up frustrated with a bad product</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-500/10 backdrop-blur-md rounded-2xl p-8 border-2 border-green-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold">Stream Stick Pro Experience</h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200"><strong>ONE app does it all</strong> - no confusion, no hassle</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">Daily automatic updates - always fresh content</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">User-friendly interface - even grandma can use it</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">No broken links - premium, stable streams</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">Plug in and watch - ready in 5 minutes</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200">Full 24/7 customer support - we're always here</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-blue-200"><strong>You won't be disappointed</strong> - this is the future of streaming</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-2xl p-8 border border-orange-400/30 text-center">
            <h3 className="text-3xl font-bold mb-4">The Stream Stick Pro Difference</h3>
            <p className="text-xl text-blue-100 mb-6">
              Don't get frustrated over a bad product. Try ours - you won't be disappointed. When your subscription ends on your Fire Stick, you can easily reach out for one of our flexible IPTV subscription plans anytime.
            </p>
            <p className="text-lg text-orange-300 font-semibold">
              This is the future of streaming. Simple. Reliable. User-Friendly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
