import { useState } from 'react';
import { Smartphone, Copy, Check, AlertCircle, CheckCircle, ArrowLeft, Mail, Clock, Shield, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  totalAmount: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  products: Array<{ name: string; price: number; quantity: number }>;
  onOrderComplete: (orderCode: string) => void;
  onBack: () => void;
}

export default function CashAppPaymentFlow({ totalAmount, customerInfo, products, onOrderComplete, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [orderCode, setOrderCode] = useState<string>('');
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCashtag, setCopiedCashtag] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const CASH_APP_TAG = '$StreamStickPro';
  const CONTACT_EMAIL = 'reloadedfiretvteam@gmail.com';

  const generateOrderCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CASH-${timestamp}-${random}`;
  };

  const createCashAppOrder = async () => {
    if (!customerInfo.email || !customerInfo.name) {
      alert('Please ensure all information is filled out');
      return;
    }

    setLoading(true);

    try {
      const code = generateOrderCode();
      setOrderCode(code);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);

      // Store order in database
      const { error } = await supabase
        .from('cashapp_orders')
        .insert({
          order_code: code,
          customer_email: customerInfo.email,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          shipping_address: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`,
          total_usd: totalAmount,
          payment_status: 'pending',
          cashapp_tag: CASH_APP_TAG,
          products: products,
          expires_at: expiresAt.toISOString(),
          payment_instructions: `Send $${totalAmount.toFixed(2)} to ${CASH_APP_TAG} with note: ${code}`
        });

      if (!error) {
        setPaymentCreated(true);

        // Send email notifications
        await sendOrderEmails(code);
      } else {
        console.error('Database error:', error);
        alert('Error creating order. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing payment. Please try again.');
    }

    setLoading(false);
  };

  const sendOrderEmails = async (code: string) => {
    try {
      await supabase.functions.invoke('send-order-emails', {
        body: {
          orderCode: code,
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          totalUsd: totalAmount,
          paymentMethod: 'Cash App',
          cashappTag: CASH_APP_TAG,
          products: products,
          shippingAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`,
          adminEmail: CONTACT_EMAIL
        }
      });

      // Mark emails as sent
      await supabase
        .from('cashapp_orders')
        .update({
          customer_instructions_sent: true,
          admin_notification_sent: true
        })
        .eq('order_code', code);
    } catch (error) {
      console.error('Error sending emails:', error);
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'cashtag' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'cashtag') {
      setCopiedCashtag(true);
      setTimeout(() => setCopiedCashtag(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleComplete = () => {
    onOrderComplete(orderCode);
  };

  const openCashApp = () => {
    const amount = totalAmount.toFixed(2);
    const note = encodeURIComponent(orderCode);
    const cashAppUrl = `https://cash.app/$StreamStickPro/${amount}?note=${note}`;
    window.open(cashAppUrl, '_blank');
  };

  if (!paymentCreated) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Payment Methods
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Cash App Payment</h2>
          <p className="text-gray-600">Fast, secure mobile payment</p>
        </div>

        {/* Amount Display */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-semibold text-lg">Total Amount:</span>
            <span className="text-4xl font-bold text-green-600">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-bold text-green-900 mb-1">Instant Setup</h3>
            <p className="text-xs text-green-700">Create order in seconds</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Shield className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-bold text-blue-900 mb-1">Secure Payment</h3>
            <p className="text-xs text-blue-700">Protected by Cash App</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <Smartphone className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-bold text-purple-900 mb-1">Mobile Friendly</h3>
            <p className="text-xs text-purple-700">Pay from your phone</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <Clock className="w-6 h-6 text-yellow-600 mb-2" />
            <h3 className="font-bold text-yellow-900 mb-1">Quick Verification</h3>
            <p className="text-xs text-yellow-700">Usually instant</p>
          </div>
        </div>

        <button
          onClick={createCashAppOrder}
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg text-lg"
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              Creating Order...
            </>
          ) : (
            <>
              <Smartphone className="w-6 h-6" />
              Create Cash App Order
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Created Successfully!</h2>
          <p className="text-gray-600">Your unique order tracking code:</p>
        </div>

        {/* Order Code Display */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
          <div className="bg-white rounded-lg p-6 border-2 border-green-500 mb-4">
            <p className="text-sm text-gray-600 mb-2 text-center font-semibold">YOUR ORDER CODE</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl md:text-4xl font-bold text-green-600 font-mono">{orderCode}</p>
              <button
                onClick={() => copyToClipboard(orderCode, 'code')}
                className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                title="Copy Order Code"
              >
                {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-green-700">
            <Mail className="w-4 h-4" />
            <span>Confirmation email sent to <strong>{customerInfo.email}</strong></span>
          </div>
        </div>

        {/* Critical Instructions */}
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-2 text-lg">CRITICAL: Save Your Order Code!</h3>
              <ul className="space-y-1 text-sm text-red-800">
                <li>• Your order code <strong className="font-mono bg-white px-2 py-1 rounded">{orderCode}</strong> is REQUIRED to process your payment</li>
                <li>• You MUST include this code in the Cash App payment note</li>
                <li>• Without this code, we cannot match your payment to your order</li>
                <li>• This code has been emailed to <strong>{customerInfo.email}</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Send className="w-7 h-7 text-green-600" />
          Complete Your Payment
        </h3>

        {/* Step-by-Step Instructions */}
        <div className="space-y-6 mb-8">
          {/* Step 1: Open Cash App */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-green-900 text-xl mb-2">Open Cash App</h4>
                <p className="text-green-800 mb-4">Launch the Cash App on your phone or click the button below</p>
                <button
                  onClick={openCashApp}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-5 h-5" />
                  Open Cash App
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Send to Cashtag */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-blue-900 text-xl mb-3">Send Payment To:</h4>
                <div className="bg-white rounded-lg p-4 border-2 border-blue-400 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Cash App Tag:</p>
                      <p className="text-3xl font-bold text-blue-600">{CASH_APP_TAG}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(CASH_APP_TAG, 'cashtag')}
                      className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                    >
                      {copiedCashtag ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-blue-700">Search for this tag in Cash App or tap to copy</p>
              </div>
            </div>
          </div>

          {/* Step 3: Enter Amount */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-purple-900 text-xl mb-3">Enter Exact Amount:</h4>
                <div className="bg-white rounded-lg p-4 border-2 border-purple-400 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Payment Amount:</p>
                      <p className="text-4xl font-bold text-purple-600">${totalAmount.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(totalAmount.toFixed(2), 'amount')}
                      className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                    >
                      {copiedAmount ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-purple-700">Send exactly this amount - do not round</p>
              </div>
            </div>
          </div>

          {/* Step 4: Add Order Code to Note */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-500">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-orange-900 text-xl mb-2">
                  <AlertCircle className="w-5 h-5 inline mr-1" />
                  CRITICAL: Add This to "For" or "Note" Field
                </h4>
                <div className="bg-white rounded-lg p-4 border-2 border-orange-500 mb-3">
                  <p className="text-sm text-gray-600 mb-2">Copy this code to the note field:</p>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-orange-600 font-mono flex-1">{orderCode}</p>
                    <button
                      onClick={() => copyToClipboard(orderCode, 'code')}
                      className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all"
                    >
                      {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                  <p className="text-sm text-red-800 font-semibold">
                    ⚠️ WITHOUT this code in the note, we cannot process your order!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5: Send Payment */}
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">5</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-green-900 text-xl mb-2">Send Payment</h4>
                <p className="text-green-800 mb-3">Review all details and tap "Pay" in Cash App</p>
                <div className="bg-white rounded-lg p-4 border border-green-300">
                  <p className="text-sm text-gray-700 font-semibold mb-2">Payment Summary:</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Send to: <strong className="text-green-700">{CASH_APP_TAG}</strong></li>
                    <li>• Amount: <strong className="text-green-700">${totalAmount.toFixed(2)}</strong></li>
                    <li>• Note: <strong className="text-green-700 font-mono">{orderCode}</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-blue-600" />
          Important Notes
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p><strong>Confirmation Time:</strong> Most Cash App payments are verified instantly</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p><strong>Email Updates:</strong> You'll receive status updates at {customerInfo.email}</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p><strong>Order Tracking:</strong> Use code <span className="font-mono bg-green-100 px-2 py-1 rounded">{orderCode}</span> to track your order anytime</p>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p><strong>Forgot the Note?</strong> Contact us immediately at {CONTACT_EMAIL} with your Cash App receipt and order code</p>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p><strong>Need Help?</strong> Email us at {CONTACT_EMAIL} or call during business hours</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href={`/track-order?code=${orderCode}`}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-all"
        >
          <Clock className="w-5 h-5" />
          Track Order Status
        </a>
        <button
          onClick={handleComplete}
          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-bold transition-all"
        >
          <CheckCircle className="w-5 h-5" />
          I've Sent Payment
        </button>
      </div>
    </div>
  );
}
