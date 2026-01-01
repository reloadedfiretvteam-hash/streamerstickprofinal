import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';

export default function FAQPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigateHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={navigateHome}
            className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Important <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Information</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Please read the following information carefully before using your Fire Stick
          </p>
        </div>

        {/* Image 1 - Why This Matters */}
        <div className="mb-12 bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
          <img
            src="/9-1.webp"
            alt="Why This Matters - Fire Stick Registration Information"
            className="w-full h-auto"
          />
        </div>

        {/* Image 2 - Educational Videos & Legal Notice */}
        <div className="mb-12 bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
          <img
            src="/5-1.webp"
            alt="Exclusive Educational Videos and Important Legal Notice"
            className="w-full h-auto"
          />
        </div>

        {/* Summary Section */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-orange-400/30 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
            Key Takeaways
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Why This Matters</h3>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>Pre-loaded Fire Sticks are often registered to seller's private Amazon account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>Changes to seller's Fire Stick can directly impact your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>Your personal information, including credit card details, could be at risk</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>We register your Fire Stick to YOUR own Amazon account for security</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/10 rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-orange-400 mb-4">What You Get</h3>
              <ul className="space-y-3 text-gray-200">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Exclusive educational videos showing how to maximize your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Step-by-step instructions on customizing your Fire Stick experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Transparent information about device registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 font-bold">✓</span>
                  <span>Complete safeguarding of your personal experience</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal Notice Callout */}
        <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
            <span className="text-3xl">⚠️</span>
            Important Legal Notice
          </h3>
          <p className="text-gray-200 leading-relaxed mb-4">
            While our educational videos are designed to help you make the most of your device,
            <strong className="text-white"> we cannot verify the legality of any 3rd party applications mentioned</strong>.
            These apps are developed and maintained by independent entities over which we have no control.
          </p>
          <p className="text-gray-200 leading-relaxed">
            It is crucial that you <strong className="text-white">conduct your own research and due diligence</strong>
            before downloading, installing, and using any 3rd party applications to ensure that they comply with all applicable laws and regulations.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-3xl p-8 border border-orange-400/30">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-gray-200 mb-6 text-lg">
            We're committed to transparency and safeguarding your experience
          </p>
          <button
            onClick={navigateHome}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Shop Our Products
          </button>
        </div>

        {/* Contact Support Form */}
        <div className="mt-12">
          <ContactForm defaultEmail="reloadedfiretvteam@gmail.com" />
        </div>
      </main>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}
