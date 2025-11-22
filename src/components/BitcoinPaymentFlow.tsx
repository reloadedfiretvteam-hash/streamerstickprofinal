import { useState, useEffect } from 'react';
import { Bitcoin, Copy, Check, AlertCircle, ExternalLink, RefreshCw, CheckCircle, CreditCard, QrCode, ArrowLeft, Mail, Clock, Shield } from 'lucide-react';
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

export default function BitcoinPaymentFlow({ totalAmount, customerInfo, products, onOrderComplete, onBack }: Props) {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [totalBtc, setTotalBtc] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderCode, setOrderCode] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [paymentAddress, setPaymentAddress] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedOrderCode, setCopiedOrderCode] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [gatewayEnabled, setGatewayEnabled] = useState(false);
  const [nowPaymentsConfig, setNowPaymentsConfig] = useState<any>(null);

  useEffect(() => {
    loadGatewayConfig();
    fetchBtcPrice();
  }, []);

  useEffect(() => {
    if (btcPrice) {
      setTotalBtc(totalAmount / btcPrice);
    }
  }, [btcPrice, totalAmount]);

  const loadGatewayConfig = async () => {
    const { data } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('gateway_name', 'nowpayments')
      .maybeSingle();

    if (data?.is_enabled && data?.api_key) {
      setGatewayEnabled(true);
      setNowPaymentsConfig({
        api_key: data.api_key,
        api_url: data.config?.api_url || 'https://api.nowpayments.io/v1',
        ipn_secret: data.config?.ipn_secret || '',
      });
    }
  };

  const fetchBtcPrice = async () => {
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
      const data = await response.json();
      if (data?.data?.rates?.USD) {
        setBtcPrice(parseFloat(data.data.rates.USD));
      }
    } catch (error) {
      console.error('Error fetching BTC price:', error);
      setBtcPrice(95000); // Fallback price
    }
  };

  const generateOrderCode = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BTC-${timestamp}-${random}`;
  };

  const createBitcoinPayment = async () => {
    if (!customerInfo.email || !customerInfo.name || !totalBtc) {
      alert('Please ensure all information is filled out');
      return;
    }

    setLoading(true);

    try {
      const code = generateOrderCode();
      setOrderCode(code);

      let paymentData: any = {};

      // Try NOWPayments if configured
      if (gatewayEnabled && nowPaymentsConfig?.api_key) {
        try {
          const paymentResponse = await fetch(`${nowPaymentsConfig.api_url}/payment`, {
            method: 'POST',
            headers: {
              'x-api-key': nowPaymentsConfig.api_key,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              price_amount: totalAmount,
              price_currency: 'usd',
              pay_currency: 'btc',
              ipn_callback_url: `${window.location.origin}/api/nowpayments-webhook`,
              order_id: code,
              order_description: `Stream Stick Pro Order ${code}`,
              success_url: `${window.location.origin}/order-success?code=${code}`,
              cancel_url: `${window.location.origin}/checkout`
            })
          });

          if (paymentResponse.ok) {
            paymentData = await paymentResponse.json();
          }
        } catch (error) {
          console.error('NOWPayments error:', error);
        }
      }

      // Fallback: Create manual payment instructions
      if (!paymentData.payment_id) {
        paymentData = {
          payment_id: code,
          pay_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Placeholder - replace with real address
          pay_amount: totalBtc?.toFixed(8),
          invoice_url: `${window.location.origin}/track-order?code=${code}`
        };
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Store order in database
      const { error } = await supabase
        .from('bitcoin_orders')
        .insert({
          order_code: code,
          customer_email: customerInfo.email,
          customer_name: customerInfo.name,
          total_usd: totalAmount,
          total_btc: parseFloat(paymentData.pay_amount || totalBtc?.toFixed(8) || '0'),
          btc_price_usd: btcPrice,
          bitcoin_address: paymentData.pay_address,
          payment_status: 'pending',
          nowpayments_invoice_id: paymentData.payment_id,
          nowpayments_payment_url: paymentData.invoice_url,
          products: products,
          expires_at: expiresAt.toISOString()
        });

      if (!error) {
        setPaymentUrl(paymentData.invoice_url || '');
        setPaymentAddress(paymentData.pay_address || '');
        setPaymentAmount(paymentData.pay_amount || totalBtc?.toFixed(8) || '0');
        setPaymentCreated(true);

        // Send email notifications
        await sendOrderEmails(code, paymentData.pay_address, paymentData.pay_amount);
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

  const sendOrderEmails = async (code: string, address: string, amount: string) => {
    try {
      // Send customer email
      await supabase.functions.invoke('send-order-emails', {
        body: {
          orderCode: code,
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
          totalUsd: totalAmount,
          totalBtc: amount,
          btcPrice: btcPrice,
          bitcoinAddress: address,
          paymentMethod: 'Bitcoin',
          products: products,
          shippingAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zip}`,
          adminEmail: 'reloadedfiretvteam@gmail.com'
        }
      });

      // Mark emails as sent
      await supabase
        .from('bitcoin_orders')
        .update({
          customer_instructions_sent: true,
          admin_notification_sent: true
        })
        .eq('order_code', code);
    } catch (error) {
      console.error('Error sending emails:', error);
    }
  };

  const copyToClipboard = (text: string, type: 'address' | 'amount' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'address') {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } else if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else {
      setCopiedOrderCode(true);
      setTimeout(() => setCopiedOrderCode(false), 2000);
    }
  };

  const handleComplete = () => {
    onOrderComplete(orderCode);
  };

  if (!btcPrice) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <RefreshCw className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Loading Bitcoin price...</p>
      </div>
    );
  }

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
          <Bitcoin className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bitcoin Payment</h2>
          <p className="text-gray-600">Powered by NOWPayments - Secure & Fast</p>
        </div>

        {/* Price Display */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-700 font-semibold">Total in USD:</span>
            <span className="text-3xl font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-700 font-semibold">Total in BTC:</span>
            <span className="text-3xl font-bold text-orange-600">{totalBtc?.toFixed(8)} BTC</span>
          </div>
          <div className="pt-3 border-t border-orange-200">
            <p className="text-sm text-gray-600">1 BTC = ${btcPrice.toLocaleString()} USD</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
            <h3 className="font-bold text-green-900 mb-1">Instant Setup</h3>
            <p className="text-xs text-green-700">Create payment in seconds</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Shield className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-bold text-blue-900 mb-1">Secure Payment</h3>
            <p className="text-xs text-blue-700">Blockchain verified</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <CreditCard className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-bold text-purple-900 mb-1">Buy with Card</h3>
            <p className="text-xs text-purple-700">No crypto experience needed</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <Clock className="w-6 h-6 text-yellow-600 mb-2" />
            <h3 className="font-bold text-yellow-900 mb-1">Quick Confirmation</h3>
            <p className="text-xs text-yellow-700">10-30 minutes average</p>
          </div>
        </div>

        <button
          onClick={createBitcoinPayment}
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg text-lg"
        >
          {loading ? (
            <>
              <RefreshCw className="w-6 h-6 animate-spin" />
              Creating Secure Payment...
            </>
          ) : (
            <>
              <Bitcoin className="w-6 h-6" />
              Create Bitcoin Payment
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Created Successfully!</h2>
          <p className="text-gray-600">Your unique order tracking code:</p>
        </div>

        {/* Order Code Display */}
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl p-6 mb-6">
          <div className="bg-white rounded-lg p-6 border-2 border-orange-500 mb-4">
            <p className="text-sm text-gray-600 mb-2 text-center font-semibold">YOUR ORDER CODE</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl md:text-4xl font-bold text-orange-600 font-mono">{orderCode}</p>
              <button
                onClick={() => copyToClipboard(orderCode, 'code')}
                className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all"
                title="Copy Order Code"
              >
                {copiedOrderCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-green-700">
            <Mail className="w-4 h-4" />
            <span>Confirmation email sent to <strong>{customerInfo.email}</strong></span>
          </div>
        </div>

        {/* Critical Instructions */}
        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 mb-2 text-lg">CRITICAL: Save Your Order Code!</h3>
              <ul className="space-y-1 text-sm text-red-800">
                <li>• Your order code <strong className="font-mono bg-white px-2 py-1 rounded">{orderCode}</strong> is required to track your order</li>
                <li>• This code has been emailed to you at <strong>{customerInfo.email}</strong></li>
                <li>• Without this code, we cannot locate your order or payment</li>
                <li>• Screenshot or write down this code before proceeding</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose How to Pay</h3>

        {/* Option 1: Buy Bitcoin with Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-400 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-900 text-xl mb-2">
                Option 1: Buy Bitcoin with Credit/Debit Card (Recommended)
              </h4>
              <p className="text-sm text-blue-800 mb-4">
                <strong>Don't have Bitcoin? No problem!</strong> This is the easiest way to complete your purchase.
              </p>
            </div>
          </div>

          <div className="bg-white/70 rounded-lg p-5 mb-4">
            <p className="font-semibold text-gray-900 mb-3">How it works:</p>
            <ol className="space-y-2 text-sm text-gray-700 pl-5 list-decimal">
              <li>Click the button below to open NOWPayments secure checkout</li>
              <li>Select "Buy Crypto" and enter your credit/debit card details</li>
              <li>NOWPayments will convert your USD to Bitcoin automatically</li>
              <li>Bitcoin is sent directly to complete your order - all automatic!</li>
              <li>Get confirmation within 10-30 minutes</li>
            </ol>
          </div>

          {paymentUrl && (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg text-lg"
            >
              <CreditCard className="w-6 h-6" />
              Pay with Card via NOWPayments
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>

        {/* Option 2: Send Bitcoin Directly */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-400 rounded-xl p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bitcoin className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-orange-900 text-xl mb-2">
                Option 2: Already Have Bitcoin? Send Payment Directly
              </h4>
              <p className="text-sm text-orange-800">
                If you have a Bitcoin wallet, send payment directly to the address below.
              </p>
            </div>
          </div>

          {/* Bitcoin Address */}
          {paymentAddress && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bitcoin Address:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentAddress}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white border-2 border-orange-300 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(paymentAddress, 'address')}
                    className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all flex items-center gap-2"
                  >
                    {copiedAddress ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Exact Amount (BTC):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`${paymentAmount} BTC`}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white border-2 border-orange-300 rounded-lg font-mono text-lg font-bold"
                  />
                  <button
                    onClick={() => copyToClipboard(paymentAmount, 'amount')}
                    className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all flex items-center gap-2"
                  >
                    {copiedAmount ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    Copy
                  </button>
                </div>
              </div>

              {paymentUrl && (
                <div className="text-center">
                  <p className="text-sm text-gray-700 mb-3">
                    <QrCode className="w-4 h-4 inline mr-1" />
                    <strong>Prefer to scan a QR code?</strong>
                  </p>
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all"
                  >
                    <QrCode className="w-5 h-5" />
                    Open QR Code
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Important Instructions */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Important Payment Instructions</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-bold text-xs">1</span>
            </div>
            <p><strong>Order Code:</strong> Your code <span className="font-mono bg-orange-100 px-2 py-1 rounded text-orange-700">{orderCode}</span> has been emailed to you. Save it!</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-bold text-xs">2</span>
            </div>
            <p><strong>Payment Amount:</strong> Send exactly <strong>{paymentAmount} BTC</strong> (sending wrong amount will delay processing)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-bold text-xs">3</span>
            </div>
            <p><strong>Confirmation Time:</strong> Payment typically confirms in 10-30 minutes</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-bold text-xs">4</span>
            </div>
            <p><strong>Order Tracking:</strong> Use your order code to track status anytime</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 font-bold text-xs">5</span>
            </div>
            <p><strong>Email Confirmation:</strong> You'll receive updates at {customerInfo.email}</p>
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
          I've Completed Payment
        </button>
      </div>
    </div>
  );
}
