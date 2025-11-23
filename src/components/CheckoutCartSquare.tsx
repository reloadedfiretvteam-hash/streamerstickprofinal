import { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, CreditCard, Shield, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SquarePaymentForm from './SquarePaymentForm';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart?: () => void;
}

export default function CheckoutCartSquare({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart 
}: Props) {
  const [step, setStep] = useState<'cart' | 'info' | 'payment' | 'success'>(items.length > 0 ? 'cart' : 'cart');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [processing, setProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Calculate total
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax - update based on actual requirements
  const total = subtotal + tax;

  // Reset step when cart opens
  useEffect(() => {
    if (isOpen && items.length > 0 && step === 'success') {
      setStep('cart');
    }
  }, [isOpen, items.length]);

  const validateCustomerInfo = () => {
    const errors: Record<string, string> = {};

    if (!customerName.trim()) errors.name = 'Name is required';
    else if (customerName.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    if (!customerEmail.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) errors.email = 'Invalid email format';

    if (!customerPhone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]{10,}$/.test(customerPhone)) errors.phone = 'Invalid phone number';

    if (!customerAddress.trim()) errors.address = 'Address is required';
    else if (customerAddress.trim().length < 10) errors.address = 'Please enter complete address';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToInfo = () => {
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }
    setStep('info');
  };

  const handleProceedToPayment = () => {
    if (!validateCustomerInfo()) {
      alert('Please fill in all required fields correctly');
      return;
    }
    setStep('payment');
  };

  const handleSquarePayment = async (paymentToken: string) => {
    setProcessing(true);

    try {
      // Generate order number
      const orderNum = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      setOrderNumber(orderNum);

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('square_orders')
        .insert({
          order_number: orderNum,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: customerAddress,
          subtotal: subtotal,
          tax: tax,
          total: total,
          payment_status: 'pending',
          payment_token: paymentToken,
          order_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insert order items
      for (const item of items) {
        await supabase.from('square_order_items').insert({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        });
      }

      // Send confirmation email
      await supabase.from('email_logs').insert({
        recipient: customerEmail,
        template_key: 'square_order_confirmation',
        subject: `Order Confirmation - ${orderNum}`,
        body: generateOrderConfirmationEmail(orderNum),
        status: 'pending'
      });

      // Clear cart and show success
      if (onClearCart) onClearCart();
      setStep('success');
      setProcessing(false);
    } catch (error) {
      console.error('Error processing order:', error);
      alert('There was an error processing your order. Please try again or contact support.');
      setProcessing(false);
    }
  };

  const generateOrderConfirmationEmail = (orderNum: string) => {
    const itemsList = items.map(item =>
      `- ${item.name} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    return `
Thank you for your order!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Order Number: ${orderNum}

Customer: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}
Shipping Address: ${customerAddress}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMS ORDERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${itemsList}

Subtotal: $${subtotal.toFixed(2)}
Tax: $${tax.toFixed(2)}
TOTAL: $${total.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your payment has been processed securely via Square.
We'll send you tracking information once your order ships.

Thank you for choosing us!

Need Support? Email: reloadedfiretvteam@gmail.com
    `.trim();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose}></div>
      
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-orange-500 to-red-500 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {step === 'cart' && <><ShoppingBag className="w-6 h-6" /> Your Cart</>}
              {step === 'info' && <>Customer Information</>}
              {step === 'payment' && <><CreditCard className="w-6 h-6" /> Secure Payment</>}
              {step === 'success' && <>Order Confirmed!</>}
            </h2>
            <p className="text-orange-100 text-sm mt-1">
              {step === 'cart' && `${items.length} item${items.length !== 1 ? 's' : ''}`}
              {step === 'info' && 'Please provide your details'}
              {step === 'payment' && 'Complete your secure payment'}
              {step === 'success' && `Order #${orderNumber}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Cart */}
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <button 
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {items.map(item => (
                      <div key={item.productId} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-orange-600 font-bold">${item.price.toFixed(2)}</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                              className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onRemoveItem(item.productId)}
                              className="ml-auto text-red-500 hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between mb-2">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Tax:</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToInfo}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all"
                  >
                    Proceed to Checkout
                  </button>
                </>
              )}
            </>
          )}

          {/* Step 2: Customer Info */}
          {step === 'info' && (
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="John Doe"
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="john@example.com"
                  />
                  {validationErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="+1 (555) 123-4567"
                  />
                  {validationErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Shipping Address *</label>
                  <textarea
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows={3}
                    placeholder="123 Main St, City, State, ZIP"
                  />
                  {validationErrors.address && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.address}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('cart')}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back to Cart
                </button>
                <button
                  onClick={handleProceedToPayment}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600"
                >
                  Continue to Payment
                </button>
              </div>
            </>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Secure Payment via Square</p>
                  <p>Your payment information is encrypted and secure. We never store your card details.</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <SquarePaymentForm 
                amount={total}
                onSubmit={handleSquarePayment}
              />

              <button
                onClick={() => setStep('info')}
                className="w-full mt-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={processing}
              >
                Back to Information
              </button>
            </>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Order Confirmed!</h3>
              <p className="text-gray-600 mb-4">
                Thank you for your purchase. We've sent a confirmation email to {customerEmail}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <p className="text-sm text-gray-500 mb-1">Order Number</p>
                <p className="font-bold text-lg">{orderNumber}</p>
              </div>
              <button
                onClick={() => {
                  setStep('cart');
                  setCustomerName('');
                  setCustomerEmail('');
                  setCustomerPhone('');
                  setCustomerAddress('');
                  onClose();
                }}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
