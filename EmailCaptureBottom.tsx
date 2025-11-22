import { Tv, Globe, Shield } from 'lucide-react';
import { useState } from 'react';

interface EmailCaptureBottomProps {
  onEmailCapture: (email: string) => void;
}

export default function EmailCaptureBottom({ onEmailCapture }: EmailCaptureBottomProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onEmailCapture(email);
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">Exclusive Deals</span>
          </h2>

          <p className="text-xl text-blue-100 mb-8">
            Join thousands of satisfied customers and get special offers delivered to your inbox
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <Tv className="w-5 h-5 text-blue-400" />
              <span className="font-medium">All Devices</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <Globe className="w-5 h-5 text-green-400" />
              <span className="font-medium">Worldwide Access</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
              <Shield className="w-5 h-5 text-orange-400" />
              <span className="font-medium">Secure & Reliable</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for exclusive deals"
                className="flex-1 px-6 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-semibold transition-all transform hover:scale-105 hover:shadow-xl shadow-orange-500/50"
              >
                Get Started
              </button>
            </div>
          </form>

          <p className="text-sm text-blue-200 mt-6">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
