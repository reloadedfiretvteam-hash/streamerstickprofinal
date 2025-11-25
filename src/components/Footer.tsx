import { Mail, DollarSign, CreditCard, Flame, Shield, FileText, Truck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-8 h-8 text-orange-500" />
              <span className="text-xl font-bold text-white">Stream Stick Pro</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Premium IPTV streaming with 18,000+ channels and 60,000+ movies & series. Jailbroken Fire Sticks available.
            </p>
            <div className="flex gap-3">
              <a href="mailto:reloadedfiretvteam@gmail.com" className="w-10 h-10 bg-gray-800 hover:bg-orange-600 rounded-lg flex items-center justify-center transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <div className="mt-4">
              <a href="mailto:reloadedfiretvteam@gmail.com" className="text-sm text-orange-400 hover:text-orange-300">
                reloadedfiretvteam@gmail.com
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#shop" onClick={(e) => { e.preventDefault(); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-orange-400 transition-colors cursor-pointer">Shop Products</a></li>
              <li><a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-orange-400 transition-colors cursor-pointer">What is IPTV?</a></li>
              <li><a href="/" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-orange-400 transition-colors cursor-pointer">Home</a></li>
              <li><a href="/faq" className="hover:text-orange-400 transition-colors">Help & FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Payment & Delivery</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Secure Card Payments</span>
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span>Cash App: $starevan11</span>
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-orange-400" />
                <a href="/delivery-activation" className="hover:text-orange-400 transition-colors">Delivery & Activation</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal & Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <a href="/refund-policy" className="hover:text-orange-400 transition-colors">Refund Policy</a>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <a href="/privacy-policy" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <a href="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</a>
              </li>
              <li><a href="/track-order" className="hover:text-orange-400 transition-colors">Track Order</a></li>
              <li><a href="/admin" className="hover:text-orange-400 transition-colors text-gray-500">Admin Portal</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-400">
              © {currentYear} Stream Stick Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-green-400 font-semibold flex items-center gap-1">
                <Shield className="w-4 h-4" /> Secure Payment
              </span>
              <span className="text-orange-400 font-semibold">24/7 Support</span>
              <span className="text-blue-400 font-semibold">Money-Back Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
