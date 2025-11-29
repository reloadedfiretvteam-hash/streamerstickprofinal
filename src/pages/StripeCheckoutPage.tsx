import { useEffect, useState } from 'react';
import StripeCheckout from '../components/StripeCheckout';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CustomerInfo {
  email: string;
  fullName: string;
  address: string;
  city: string;
  zipCode: string;
}

interface CheckoutData {
  items: CartItem[];
  total: number;
  customerInfo: CustomerInfo;
}

export default function StripeCheckoutPage() {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('payment_data');
    if (stored) {
      setCheckoutData(JSON.parse(stored) as CheckoutData);
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
