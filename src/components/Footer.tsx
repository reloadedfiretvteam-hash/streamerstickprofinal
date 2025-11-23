import { Mail, DollarSign, CreditCard, Flame } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 via-slate-900 to-black text-gray-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-blue-500/5"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6 group">
              <div className="relative">
                <Flame className="w-10 h-10 text-orange-500 group-hover:animate-pulse" />
                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl"></div>
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 bg-clip-text text-transparent">Stream Stick Pro</span>
            </div>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Premium IPTV streaming with <span className="text-orange-400 font-semibold">20,000+</span> channels and <span className="text-orange-400 font-semibold">60,000+</span> movies & series. Jailbroken Fire Sticks available.
            </p>
            <div className="flex gap-3 mb-5">
              <a href="mailto:reloadedfiretvteam@gmail.com" className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-orange-600 hover:to-red-600 rounded-xl flex items-center justify-center transition-all transform hover:scale-110 shadow-lg">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <div>
              <a href="mailto:reloadedfiretvteam@gmail.com" className="text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors">
                reloadedfiretvteam@gmail.com
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-5">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#shop" onClick={(e) => { e.preventDefault(); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-orange-400 transition-all hover:translate-x-1 inline-block cursor-pointer">→ Shop Products</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-orange-400 transition-all hover:translate-x-1 inline-block cursor-pointer">→ What is IPTV?</a></li>
              <li><a href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-orange-400 transition-all hover:translate-x-1 inline-block cursor-pointer">→ Home</a></li>
              <li><a href="/faq" className="hover:text-orange-400 transition-all hover:translate-x-1 inline-block">→ Help & FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-5">Payment Methods</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-semibold text-white">Cash App</div>
                  <div className="text-gray-400 text-xs">$starevan11</div>
                </div>
              </li>
              <li className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <CreditCard className="w-5 h-5 text-orange-400" />
                <div>
                  <div className="font-semibold text-white">Bitcoin</div>
                  <div className="text-gray-400 text-xs">Accepted</div>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-5">Support & Admin</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/faq" className="hover:text-orange-400 transition-all hover:translate-x-1 inline-block">→ FAQ</a></li>
              <li><a href="/track-order" className="hover:text-orange-400 transition-all hover:translate-x-1 inline-block">→ Track Order</a></li>
              <li><a href="mailto:reloadedfiretvteam@gmail.com" className="hover:text-orange-400 transition-all hover:translate-x-1 inline-block">→ Contact Us</a></li>
              <li><a href="/custom-admin" className="hover:text-orange-400 transition-all hover:translate-x-1 inline-block">→ Admin Portal</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800/50 pt-10 mt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
            <p className="text-gray-400 font-medium">
              © {currentYear} <span className="text-white font-bold">Stream Stick Pro</span>. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6">
              <span className="flex items-center gap-2 text-green-400 font-semibold bg-green-400/10 px-4 py-2 rounded-lg">
                <span className="text-lg">🔒</span> Secure Payment
              </span>
              <span className="flex items-center gap-2 text-orange-400 font-semibold bg-orange-400/10 px-4 py-2 rounded-lg">
                <span className="text-lg">💬</span> 24/7 Support
              </span>
              <span className="flex items-center gap-2 text-blue-400 font-semibold bg-blue-400/10 px-4 py-2 rounded-lg">
                <span className="text-lg">✓</span> Money-Back Guarantee
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
