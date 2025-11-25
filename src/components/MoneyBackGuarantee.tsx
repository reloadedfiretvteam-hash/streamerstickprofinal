import { Shield, Clock, ThumbsUp } from 'lucide-react';

export default function MoneyBackGuarantee() {
  return (
    <section className="py-16 bg-gradient-to-br from-green-600 to-emerald-700">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1 text-center md:text-left">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-4 mx-auto md:mx-0">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                100% Risk-Free Guarantee
              </h2>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <Clock className="w-8 h-8 text-white flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">36-Hour Free Trial</h3>
                    <p className="text-white/90">
                      Try our service completely free for 36 hours. Experience all premium features with full access - no credit card required, no commitment, no hidden fees.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <ThumbsUp className="w-8 h-8 text-white flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Why We Offer This</h3>
                    <p className="text-white/90">
                      We're confident you'll love our service. With 2,700+ happy customers and a 4.9/5 rating, we stand behind our product with this guarantee.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => window.location.href = '/shop'}
                  className="px-10 py-4 bg-white text-green-600 font-bold text-lg rounded-xl shadow-2xl hover:shadow-white/50 transition-all transform hover:scale-105"
                >
                  Try Risk-Free Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
