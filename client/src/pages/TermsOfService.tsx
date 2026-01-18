import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const title = "Terms of Service | StreamStickPro";
    const description = "Read the Terms of Service for StreamStickPro. Understand our policies on orders, digital delivery, service availability, and user responsibilities.";
    const url = "https://streamstickpro.com/terms";
    
    document.title = title;
    document.documentElement.classList.remove("shadow-theme");
    document.documentElement.classList.add("dark");
    
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };
    
    // Canonical tag handled by centralized CanonicalTag component
    
    setMetaTag('description', description);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', url, true);
    setMetaTag('og:type', 'website', true);
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="border-b border-gray-800 sticky top-0 z-10 bg-gray-900/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="text-gray-400 hover:text-white"
            data-testid="button-back-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold" data-testid="heading-terms">Terms of Service</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none" data-testid="content-terms">
          <p className="text-gray-400 mb-8">Last updated: December 2025</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-300 mb-4">
            By accessing and using StreamStickPro's website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Products and Services</h2>
          <p className="text-gray-300 mb-4">
            StreamStickPro provides pre-configured streaming devices and IPTV subscription services. Our products are designed for easy setup and come with digital credentials and support.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Orders and Payment</h2>
          <p className="text-gray-300 mb-4">
            All orders are subject to acceptance and availability. Prices are displayed in USD. Payment is processed securely through Stripe. Upon successful payment, you will receive order confirmation and product credentials via email.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Digital Delivery</h2>
          <p className="text-gray-300 mb-4">
            IPTV credentials and setup instructions are delivered digitally via email within minutes of purchase. Physical Fire Stick devices are shipped separately. Digital products are delivered immediately and cannot be returned once credentials are issued.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">5. User Responsibilities</h2>
          <p className="text-gray-300 mb-4">
            You are responsible for maintaining the confidentiality of your account credentials. You agree not to share, resell, or redistribute your subscription credentials to third parties.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Service Availability</h2>
          <p className="text-gray-300 mb-4">
            While we strive to provide uninterrupted service, we do not guarantee 100% uptime. Service may be temporarily unavailable due to maintenance, technical issues, or factors beyond our control.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Limitation of Liability</h2>
          <p className="text-gray-300 mb-4">
            StreamStickPro shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our products or services. Our total liability shall not exceed the amount paid for the specific product or service.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">8. Changes to Terms</h2>
          <p className="text-gray-300 mb-4">
            We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">9. Contact</h2>
          <p className="text-gray-300 mb-4">
            For questions about these Terms of Service, please contact our support team through the website chat or email.
          </p>
        </div>
      </div>
    </div>
  );
}
