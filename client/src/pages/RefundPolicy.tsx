import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function RefundPolicy() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const title = "Refund Policy | StreamStickPro";
    const description = "Understand our refund policy for digital IPTV subscriptions and Fire Stick devices. Learn about eligibility, processing times, and how to request a refund.";
    const url = "https://streamstickpro.com/refund";
    
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
    
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
    
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
          <h1 className="text-2xl font-bold" data-testid="heading-refund">Refund Policy</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none" data-testid="content-refund">
          <p className="text-gray-400 mb-8">Last updated: December 2025</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Our Commitment</h2>
          <p className="text-gray-300 mb-4">
            At StreamStickPro, we stand behind our products and want you to be completely satisfied with your purchase. Please read our refund policy carefully before making a purchase.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Digital Products (IPTV Subscriptions)</h2>
          <p className="text-gray-300 mb-4">
            Due to the instant delivery nature of digital products, IPTV subscription credentials are non-refundable once delivered. This is because access is granted immediately and cannot be revoked or "returned."
          </p>
          <p className="text-gray-300 mb-4">
            However, if you experience technical issues that prevent the service from working properly, our support team will work with you to resolve the issue. If we cannot resolve the issue within 48 hours, you may be eligible for a refund or credit.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Fire Stick Devices</h2>
          <p className="text-gray-300 mb-4">
            Physical Fire Stick devices may be returned within 7 days of delivery if:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
            <li>The device is defective or damaged on arrival</li>
            <li>The device is unused and in original packaging</li>
            <li>You contact support within 7 days of receiving the device</li>
          </ul>
          <p className="text-gray-300 mb-4">
            Note: The IPTV subscription included with Fire Stick purchases is subject to the digital product policy above and is non-refundable once credentials are delivered.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">How to Request a Refund</h2>
          <p className="text-gray-300 mb-4">
            To request a refund, please contact our support team through the website chat or email with:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
            <li>Your order number or email address used for purchase</li>
            <li>Reason for the refund request</li>
            <li>Any relevant screenshots or documentation</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Refund Processing</h2>
          <p className="text-gray-300 mb-4">
            Approved refunds are processed within 5-7 business days. Refunds are issued to the original payment method. Bank processing times may vary.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Exceptions</h2>
          <p className="text-gray-300 mb-4">
            Refunds will not be provided for:
          </p>
          <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
            <li>Change of mind after digital credentials have been delivered</li>
            <li>Issues caused by customer's internet connection or device compatibility</li>
            <li>Failure to follow setup instructions (we offer 24/7 support to help)</li>
            <li>Requests made more than 7 days after purchase</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">Contact Support</h2>
          <p className="text-gray-300 mb-4">
            Our support team is available 24/7 to help resolve any issues. We encourage you to reach out before requesting a refund - most problems can be resolved quickly with our assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
