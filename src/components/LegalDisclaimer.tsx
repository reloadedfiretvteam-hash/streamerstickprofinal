import { AlertTriangle } from 'lucide-react';

export default function LegalDisclaimer() {
  return (
    <section className="py-12 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-yellow-500 mb-4">
                  Legal Disclaimer
                </h3>
                <div className="text-gray-300 space-y-4 leading-relaxed">
                  <p>
                    <strong className="text-white">Important Notice:</strong> We provide access to IPTV subscription services and Amazon Fire Stick devices. Our service delivers streaming capability only.
                  </p>
                  <p>
                    <strong className="text-white">Third-Party Content:</strong> We are not responsible for content accessed through third-party applications or services. Users are solely responsible for their use of any third-party streaming applications and any content accessed thereby.
                  </p>
                  <p>
                    <strong className="text-white">User Responsibility:</strong> It is the user's responsibility to ensure compliance with all applicable laws in their jurisdiction regarding streaming content. We strongly encourage all users to only access content for which they have proper rights or authorization.
                  </p>
                  <p>
                    <strong className="text-white">Service Provision:</strong> We provide technical access and subscription management. We do not host, produce, or distribute any copyrighted content. All content is provided by third-party services.
                  </p>
                  <p className="text-sm text-gray-400 pt-4 border-t border-gray-700">
                    By purchasing our products or services, you acknowledge that you have read, understood, and agree to this disclaimer. You accept full responsibility for how you use our service and any third-party applications or content you may access.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
