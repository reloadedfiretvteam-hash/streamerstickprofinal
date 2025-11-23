import { useState, useEffect } from 'react';
import { Shield, Lock, Info } from 'lucide-react';
import SquarePaymentForm from '../components/SquarePaymentForm';
import { supabase } from '../lib/supabase';

export default function ConciergeCheckout() {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    // Get product from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product') || localStorage.getItem('selected_product');
    
    if (productId) {
      const { data } = await supabase
        .from('square_products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (data) {
        setSelectedProduct(data);
      }
    }
    
    // Default to AI Page Builder Pro if no product selected
    if (!productId) {
      const { data } = await supabase
        .from('square_products')
        .select('*')
        .eq('name', 'AI Page Builder Pro (1 Month)')
        .single();
      
      if (data) {
        setSelectedProduct(data);
      }
    }
    
    setLoading(false);
  };
  
  const product = selectedProduct || {
    name: "AI Page Builder Pro (1 Month)",
    price: 15.00,
    description: "Create stunning pages with auto-layout, image optimization, built-in site speed booster, and SEO snippet editor. 1 month full access."
  };

  const handlePaymentSubmit = async (token: string) => {
    // Send token to your backend (Supabase Edge Function)
    console.log('Processing payment with token:', token);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStep(2); // Success step
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your secure transaction has been completed.</p>
          <div className="p-4 bg-gray-50 rounded-lg text-left mb-6">
            <p className="text-sm text-gray-500 mb-1">Service</p>
            <p className="font-medium">{product.name}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-black text-white rounded-lg font-bold"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Order Summary */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow-sm h-full">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                </div>
                <span className="font-bold">${product.price}</span>
              </div>
              
              <div className="flex justify-between items-center text-lg font-bold pt-2">
                <span>Total</span>
                <span>${product.price}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                This transaction will appear as "PRO DIGITAL SERVICES" on your statement.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div>
          <SquarePaymentForm 
            amount={product.price} 
            onSubmit={handlePaymentSubmit}
          />
        </div>
      </div>
    </div>
  );
}

