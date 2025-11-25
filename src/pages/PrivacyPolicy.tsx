/**
 * PrivacyPolicy Page
 * 
 * Displays the privacy policy for the store.
 */

import { ArrowLeft, Shield, Eye, Database, Lock, Mail, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
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
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Overview */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Privacy Matters</h2>
              <p className="text-gray-500">Effective Date: November 2024</p>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">
            Stream Stick Pro ("we," "our," or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your 
            information when you visit our website or make a purchase.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-500" />
            Information We Collect
          </h3>
          
          <div className="space-y-6 text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Personal Information</h4>
              <p>When you make a purchase or create an account, we may collect:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Name and email address</li>
                <li>Phone number (optional)</li>
                <li>Shipping and billing address</li>
                <li>Payment information (processed securely by Square)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Automatically Collected Information</h4>
              <p>When you visit our website, we automatically collect:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Pages visited and time spent on site</li>
                <li>Referring website or source</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Cookies and Tracking</h4>
              <p>
                We use cookies and similar technologies to improve your experience, 
                analyze site traffic, and personalize content. You can control cookie 
                preferences through your browser settings.
              </p>
            </div>
          </div>
        </div>

        {/* How We Use Information */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            How We Use Your Information
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Provide customer support</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>
        </div>

        {/* Information Sharing */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            Information Sharing
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <p>We may share your information with:</p>
            
            <div className="space-y-3">
              <div>
                <strong>Service Providers:</strong> Companies that help us operate our business 
                (payment processors, shipping carriers, email services).
              </div>
              
              <div>
                <strong>Payment Processors:</strong> Square processes all payments. We never 
                store your full credit card information on our servers.
              </div>
              
              <div>
                <strong>Legal Requirements:</strong> When required by law or to protect our 
                rights, property, or safety.
              </div>
            </div>
            
            <p className="font-semibold text-gray-800">
              We DO NOT sell your personal information to third parties.
            </p>
          </div>
        </div>

        {/* Data Security */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-500" />
            Data Security
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <p>We implement appropriate security measures to protect your information:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>SSL/TLS encryption for all data transmission</li>
              <li>Secure payment processing through Square (PCI-DSS compliant)</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal data on a need-to-know basis</li>
            </ul>
            <p>
              While we strive to protect your information, no method of transmission over 
              the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Rights</h3>
          
          <div className="space-y-4 text-gray-600">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability (receive your data in a usable format)</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information below.
            </p>
          </div>
        </div>

        {/* Children's Privacy */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Children's Privacy</h3>
          <p className="text-gray-600">
            Our services are not intended for individuals under 18 years of age. We do not 
            knowingly collect personal information from children. If you believe we have 
            collected information from a child, please contact us immediately.
          </p>
        </div>

        {/* Updates */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Policy Updates</h3>
          <p className="text-gray-600">
            We may update this Privacy Policy from time to time. We will notify you of any 
            changes by posting the new policy on this page and updating the "Effective Date." 
            We encourage you to review this policy periodically.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Contact Us
          </h3>
          
          <p className="mb-4">
            If you have questions about this Privacy Policy or our data practices:
          </p>
          
          <a
            href="mailto:reloadedfiretvteam@gmail.com?subject=Privacy Inquiry"
            className="inline-block px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
          >
            Email: reloadedfiretvteam@gmail.com
          </a>
        </div>

        {/* Last Updated */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Last updated: November 2024
        </p>
      </main>
    </div>
  );
}
