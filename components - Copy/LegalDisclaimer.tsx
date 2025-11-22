import { AlertTriangle } from 'lucide-react';

interface LegalDisclaimerProps {
  variant?: 'checkout' | 'page' | 'footer';
  className?: string;
}

export default function LegalDisclaimer({ variant = 'page', className = '' }: LegalDisclaimerProps) {
  const disclaimerText = (
    <>
      <strong>Important Notice:</strong> By purchasing and using our services, you acknowledge and agree that:
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>We are <strong>not responsible</strong> for the information that we provide you</li>
        <li>It is <strong>at your own risk</strong> - you use our services at your own risk</li>
        <li>We just provide <strong>information and guide</strong> you towards use</li>
        <li>You are <strong>purchasing at your own risk</strong> - you are solely responsible for your use of any products or services purchased</li>
        <li>We do not guarantee specific outcomes or results</li>
      </ul>
    </>
  );

  if (variant === 'checkout') {
    return (
      <div className={`bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-900">
            {disclaimerText}
            <p className="mt-2 text-xs text-yellow-700">
              By proceeding with your purchase, you agree to these terms.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        <p className="mb-1">
          <strong>Disclaimer:</strong> Information provided is for guidance only. Use at your own risk. 
          We are not responsible for how you use our services.
        </p>
      </div>
    );
  }

  // Default page variant
  return (
    <div className={`bg-gray-50 border border-gray-300 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-700">
          {disclaimerText}
        </div>
      </div>
    </div>
  );
}
