/**
 * RefundPolicy Page
 * 
 * Displays the refund policy for the store.
 */

import { ArrowLeft, Shield, Clock, CheckCircle, HelpCircle, Mail } from 'lucide-react';

export default function RefundPolicy() {
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
          <h1 className="text-2xl font-bold text-gray-900">Refund Policy</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Overview */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">30-Day Money-Back Guarantee</h2>
              <p className="text-gray-500">We stand behind our products and services</p>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">
            Your satisfaction is our priority. If you're not completely satisfied with your purchase, 
            we offer a hassle-free refund process. Please read the following policy to understand 
            how refunds work for different product types.
          </p>
        </div>

        {/* Physical Products */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Fire Stick Devices (Physical Products)
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <p>
              <strong>30-Day Return Window:</strong> You have 30 days from the date of delivery to 
              return your Fire Stick device for a full refund.
            </p>
            
            <p>
              <strong>Condition Requirements:</strong> Items must be returned in their original 
              condition with all accessories and packaging. Devices showing signs of misuse or 
              physical damage may be subject to a restocking fee.
            </p>
            
            <p>
              <strong>Return Shipping:</strong> Return shipping costs are the responsibility of the 
              customer unless the return is due to our error (wrong item shipped, defective product, etc.).
            </p>
            
            <p>
              <strong>Refund Processing:</strong> Once we receive and inspect your return, refunds 
              are processed within 5-7 business days to your original payment method.
            </p>
          </div>
        </div>

        {/* Digital Subscriptions */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            IPTV Subscriptions (Digital Services)
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <p>
              <strong>7-Day Trial Period:</strong> New IPTV subscribers have a 7-day trial period 
              from activation. If you're not satisfied within this period, request a full refund.
            </p>
            
            <p>
              <strong>Pro-Rated Refunds:</strong> After the 7-day trial, refunds are issued on a 
              pro-rated basis for unused subscription time, minus a small administrative fee.
            </p>
            
            <p>
              <strong>Non-Refundable Cases:</strong> Refunds cannot be issued for:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Account sharing violations</li>
              <li>Terms of service violations</li>
              <li>Requests made after 30 days of purchase</li>
            </ul>
            
            <p>
              <strong>Technical Issues:</strong> If you experience persistent technical issues that 
              we cannot resolve, you're entitled to a full refund regardless of the trial period.
            </p>
          </div>
        </div>

        {/* Website Design Services */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-500" />
            Website Design Services
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <p>
              <strong>Before Work Begins:</strong> Full refund available if requested before any 
              design work has commenced.
            </p>
            
            <p>
              <strong>During Development:</strong> Partial refunds are available based on the 
              percentage of work completed. We'll provide a detailed breakdown upon request.
            </p>
            
            <p>
              <strong>After Delivery:</strong> Once the final website is delivered and approved, 
              refunds are not available. We offer unlimited revisions during the development phase 
              to ensure your satisfaction.
            </p>
            
            <p>
              <strong>Satisfaction Guarantee:</strong> We work with you until you're 100% satisfied 
              with your website design. Our goal is your complete satisfaction.
            </p>
          </div>
        </div>

        {/* How to Request */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            How to Request a Refund
          </h3>
          
          <div className="space-y-3 mb-6">
            <p>To request a refund, please contact us with:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Your order number</li>
              <li>Email address used for purchase</li>
              <li>Reason for refund request</li>
              <li>Any relevant screenshots or documentation</li>
            </ul>
          </div>
          
          <a
            href="mailto:reloadedfiretvteam@gmail.com?subject=Refund Request"
            className="inline-block px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Email: reloadedfiretvteam@gmail.com
          </a>
          
          <p className="text-sm text-white/80 mt-4">
            We typically respond within 24-48 hours during business days.
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
