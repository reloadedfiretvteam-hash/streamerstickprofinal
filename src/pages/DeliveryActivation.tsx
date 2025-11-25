/**
 * DeliveryActivation Page
 * 
 * Displays delivery and activation information for products.
 */

import { ArrowLeft, Package, Zap, Clock, CheckCircle, Truck, Mail, HelpCircle } from 'lucide-react';

export default function DeliveryActivation() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <a
            href="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Delivery & Activation</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Overview */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Fast & Easy Delivery</h2>
              <p className="text-gray-500">Get started within minutes</p>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">
            We strive to deliver your purchases as quickly as possible. Below you'll find 
            detailed information about delivery times and activation procedures for each 
            product type.
          </p>
        </div>

        {/* Digital Products */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Digital Products (IPTV Subscriptions)
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <Clock className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800">Instant Delivery</p>
                <p className="text-green-700">
                  IPTV subscriptions are delivered within minutes of payment confirmation.
                </p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-800 mt-6 mb-3">Activation Steps:</h4>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                <div>
                  <p className="font-medium text-gray-800">Check Your Email</p>
                  <p className="text-gray-600">Look for an email with your activation details (check spam folder too).</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                <div>
                  <p className="font-medium text-gray-800">Download the App</p>
                  <p className="text-gray-600">Download the IPTV player app as instructed in your email.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span>
                <div>
                  <p className="font-medium text-gray-800">Enter Your Credentials</p>
                  <p className="text-gray-600">Log in with the username and password provided in your email.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</span>
                <div>
                  <p className="font-medium text-gray-800">Start Streaming!</p>
                  <p className="text-gray-600">Enjoy 18,000+ channels, movies, and shows.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Physical Products */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" />
            Physical Products (Fire Stick Devices)
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-800">Processing Time</p>
                <p className="text-blue-700">1-2 business days</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-800">Shipping Time</p>
                <p className="text-blue-700">3-7 business days (US)</p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-800 mt-6 mb-3">Shipping Details:</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>FREE shipping on all orders</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Tracking number provided via email</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Signature may be required for delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Discreet packaging for privacy</span>
              </li>
            </ul>

            <h4 className="font-semibold text-gray-800 mt-6 mb-3">Setup Instructions:</h4>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                <div>
                  <p className="font-medium text-gray-800">Connect to TV</p>
                  <p className="text-gray-600">Plug the Fire Stick into your TV's HDMI port.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                <div>
                  <p className="font-medium text-gray-800">Power On</p>
                  <p className="text-gray-600">Connect the USB power cable to the Fire Stick.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span>
                <div>
                  <p className="font-medium text-gray-800">Connect to WiFi</p>
                  <p className="text-gray-600">Follow the on-screen instructions to connect to your WiFi.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</span>
                <div>
                  <p className="font-medium text-gray-800">Ready to Use</p>
                  <p className="text-gray-600">All apps are pre-installed and ready to use!</p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Website Design */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-500" />
            Website Design Services
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="font-semibold text-purple-800">Basic Package</p>
                <p className="text-purple-700">3-5 business days</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="font-semibold text-purple-800">Standard Package</p>
                <p className="text-purple-700">5-7 business days</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="font-semibold text-purple-800">Premium Package</p>
                <p className="text-purple-700">7-14 business days</p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-800 mt-6 mb-3">Delivery Process:</h4>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
                <span>Initial consultation and requirements gathering</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
                <span>Design mockup presentation for approval</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
                <span>Development and revisions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">4</span>
                <span>Final delivery with source files and documentation</span>
              </li>
            </ol>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-gray-500" />
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium text-gray-800">What if I don't receive my confirmation email?</p>
              <p className="text-gray-600 mt-1">
                Check your spam/junk folder first. If you still don't see it, contact us with 
                your order number and we'll resend it immediately.
              </p>
            </div>
            
            <div>
              <p className="font-medium text-gray-800">Can I track my Fire Stick shipment?</p>
              <p className="text-gray-600 mt-1">
                Yes! You'll receive a tracking number via email once your order ships. You can 
                also check your order status on our order tracking page.
              </p>
            </div>
            
            <div>
              <p className="font-medium text-gray-800">What if my IPTV subscription doesn't work?</p>
              <p className="text-gray-600 mt-1">
                Contact our support team and we'll help troubleshoot. Most issues are resolved 
                within minutes. If we can't fix it, you're entitled to a full refund.
              </p>
            </div>
            
            <div>
              <p className="font-medium text-gray-800">Do you ship internationally?</p>
              <p className="text-gray-600 mt-1">
                Currently, we only ship physical products within the United States. Digital 
                products (IPTV) are available worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Need Help?
          </h3>
          
          <p className="mb-4">
            If you have any questions about delivery or activation, our support team is here to help.
          </p>
          
          <a
            href="mailto:reloadedfiretvteam@gmail.com?subject=Delivery/Activation Question"
            className="inline-block px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Email: reloadedfiretvteam@gmail.com
          </a>
          
          <p className="text-sm text-white/80 mt-4">
            Response time: Usually within 2-4 hours during business hours
          </p>
        </div>

        {/* Last Updated */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Last updated: November 2024
        </p>
      </main>
    </div>
  );
}
