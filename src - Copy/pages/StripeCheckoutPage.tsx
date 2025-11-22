import { useEffect, useState } from 'react';
import StripeCheckout from '../components/StripeCheckout';

export default function StripeCheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('payment_data');
    if (stored) {
      setCheckoutData(JSON.parse(stored));
    } else {
      window.location.href = '/checkout';
    }
  }, []);

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <StripeCheckout
      items={checkoutData.items}
      total={checkoutData.total}
      customerInfo={checkoutData.customerInfo}
    />
  );
}
