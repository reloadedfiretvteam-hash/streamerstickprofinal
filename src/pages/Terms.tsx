/**
 * Terms Page
 * 
 * Displays the terms of service for the store.
 */

import { ArrowLeft, FileText, Shield, AlertTriangle, Scale, Mail } from 'lucide-react';

export default function Terms() {
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
          <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Overview */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Terms of Service</h2>
              <p className="text-gray-500">Effective Date: November 2024</p>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">
            Welcome to Stream Stick Pro. By accessing or using our website and services, you agree 
            to be bound by these Terms of Service. Please read them carefully before making any purchase.
          </p>
        </div>

        {/* Acceptance */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Acceptance of Terms
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <p>
              By placing an order or using our services, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms. If you do not agree, please 
              do not use our services.
            </p>
            <p>
              We reserve the right to update these terms at any time. Continued use of our 
              services after changes constitutes acceptance of the new terms.
            </p>
          </div>
        </div>

        {/* Products and Services */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Products and Services</h3>
          
          <div className="space-y-6 text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Fire Stick Devices</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Devices are shipped as described on the product page</li>
                <li>Pre-installed software configurations are for convenience only</li>
                <li>We provide technical support for device setup and usage</li>
                <li>Warranty covers manufacturing defects for 30 days</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">IPTV Subscriptions</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Subscriptions provide access to streaming content as described</li>
                <li>Channel availability may vary and is subject to change</li>
                <li>Service quality depends on your internet connection</li>
                <li>One subscription is for personal, non-commercial use only</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Website Design Services</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Services are delivered as specified in the package description</li>
                <li>Client is responsible for providing content and feedback</li>
                <li>Revisions are included as specified in the package</li>
                <li>Final delivery includes all source files upon full payment</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Prohibited Uses */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Prohibited Uses
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <p>You agree NOT to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Share your subscription credentials with others</li>
              <li>Resell or redistribute our products or services</li>
              <li>Use our services for any illegal purpose</li>
              <li>Attempt to circumvent security measures</li>
              <li>Use automated systems to access our services</li>
              <li>Misrepresent your identity or affiliation</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
            <p className="font-semibold text-gray-800 mt-4">
              Violation of these terms may result in immediate termination of services 
              without refund.
            </p>
          </div>
        </div>

        {/* Payment Terms */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Terms</h3>
          
          <div className="space-y-4 text-gray-600">
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>All prices are in USD unless otherwise stated</li>
              <li>Payment is required at the time of purchase</li>
              <li>We accept credit/debit cards through Square</li>
              <li>Prices are subject to change without notice</li>
              <li>Sales tax may apply based on your location</li>
            </ul>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Intellectual Property</h3>
          
          <div className="space-y-4 text-gray-600">
            <p>
              All content on our website, including logos, text, images, and software, is the 
              property of Stream Stick Pro or its licensors and is protected by intellectual 
              property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, or create derivative works without 
              our express written permission.
            </p>
          </div>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-500" />
            Limitation of Liability
          </h3>
          
          <div className="space-y-4 text-gray-600">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, STREAM STICK PRO SHALL NOT BE LIABLE 
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING 
              FROM YOUR USE OF OUR SERVICES.
            </p>
            <p>
              Our total liability for any claim shall not exceed the amount you paid for the 
              specific product or service giving rise to the claim.
            </p>
            <p>
              We do not guarantee uninterrupted or error-free service. Services are provided 
              "as is" without warranties of any kind.
            </p>
          </div>
        </div>

        {/* Dispute Resolution */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Dispute Resolution</h3>
          
          <div className="space-y-4 text-gray-600">
            <p>
              Any disputes arising from these Terms or your use of our services shall be 
              resolved through:
            </p>
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                <strong>Informal Resolution:</strong> Contact us first to resolve the issue
              </li>
              <li>
                <strong>Mediation:</strong> If informal resolution fails, parties agree to 
                attempt mediation
              </li>
              <li>
                <strong>Binding Arbitration:</strong> Disputes not resolved through mediation 
                shall be settled by binding arbitration
              </li>
            </ol>
            <p>
              Class action lawsuits and class-wide arbitrations are not permitted.
            </p>
          </div>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Termination</h3>
          
          <div className="space-y-4 text-gray-600">
            <p>
              We reserve the right to terminate or suspend your access to our services at 
              any time, with or without cause, and with or without notice.
            </p>
            <p>
              Upon termination, your right to use our services ceases immediately. Provisions 
              that by their nature should survive termination shall remain in effect.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Questions About These Terms?
          </h3>
          
          <p className="mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          
          <a
            href="mailto:reloadedfiretvteam@gmail.com?subject=Terms Question"
            className="inline-block px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
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
