import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { setPageMeta } from "@/lib/seo";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.documentElement.classList.remove("shadow-theme");
    document.documentElement.classList.add("dark");
    setPageMeta({
      title: "Privacy Policy | StreamStickPro",
      description: "Learn how StreamStickPro collects, uses, and protects your personal information. Our privacy policy covers data collection, payment security, and your rights.",
      path: "/privacy",
    });
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
          <h1 className="text-2xl font-bold" data-testid="heading-privacy">Privacy Policy</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none" data-testid="content-privacy">
          <p className="text-gray-400 mb-8">Last updated: February 2026</p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-gray-300 mb-4">
            We collect information you provide directly, including: name, email address, shipping address (for physical products), and payment information (processed securely by Stripe).
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-300 mb-4">
            We use your information to: process and fulfill orders, send order confirmations and product credentials, provide customer support, and communicate about products and promotions (with your consent).
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Payment Security</h2>
          <p className="text-gray-300 mb-4">
            All payment transactions are processed through Stripe, a PCI-DSS compliant payment processor. We do not store your full credit card details on our servers.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Data Sharing</h2>
          <p className="text-gray-300 mb-4">
            We do not sell your personal information. We may share data with: payment processors (Stripe) to complete transactions, email service providers (Resend) to send order communications, and shipping carriers for physical product delivery.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Cookies and Analytics</h2>
          <p className="text-gray-300 mb-4">
            We use cookies and similar technologies to improve your browsing experience, remember your preferences, and analyze site traffic. You can control cookie settings through your browser.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">6. Data Retention</h2>
          <p className="text-gray-300 mb-4">
            We retain your information for as long as necessary to fulfill orders, provide support, and comply with legal obligations. You may request deletion of your data by contacting us.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Your Rights</h2>
          <p className="text-gray-300 mb-4">
            You have the right to: access your personal data, correct inaccurate information, request deletion of your data, and opt out of marketing communications.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">8. Children's Privacy</h2>
          <p className="text-gray-300 mb-4">
            Our services are not directed to children under 18. We do not knowingly collect information from minors.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">9. Changes to This Policy</h2>
          <p className="text-gray-300 mb-4">
            We may update this Privacy Policy periodically. Changes will be posted on this page with an updated effective date.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-4">10. Contact Us</h2>
          <p className="text-gray-300 mb-4">
            For privacy-related questions or to exercise your rights, please contact our support team through the website.
          </p>
        </div>
      </div>
    </div>
  );
}
