import { useState, useEffect } from 'react';
import { Bitcoin, CreditCard, Copy, Check, AlertCircle, ExternalLink, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BitcoinCheckoutProps {
  totalAmount: number;
  customerEmail: string;
  customerName: string;
  products: { id: string; name: string; price: number; quantity: number }[];
  onOrderCreated?: (orderCode: string) => void;
}

interface NOWPaymentsConfig {
  api_key: string;
  ipn_secret: string;
  public_key: string;
  api_url: string;
}

export default function BitcoinCheckout({
  totalAmount,
  customerEmail,
  customerName,
  products,
  onOrderCreated
}: BitcoinCheckoutProps) {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [totalBtc, setTotalBtc] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderCode, setOrderCode] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [paymentAddress, setPaymentAddress] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [nowPaymentsConfig, setNowPaymentsConfig] = useState<NOWPaymentsConfig | null>(null);
  const [gatewayEnabled, setGatewayEnabled] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(false);

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
      .select('api_key, is_enabled, config')
      .eq('gateway_name', 'nowpayments')
      .maybeSingle();

    if (data?.is_enabled && data?.api_key) {
      setGatewayEnabled(true);
      setNowPaymentsConfig({
        api_key: data.api_key,
        ipn_secret: data.config.ipn_secret,
        public_key: data.config.public_key,
        api_url: data.config.api_url
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
    }
  };

  const generateOrderCode = async () => {
    const { data } = await supabase.rpc('generate_order_code');
    if (data) return data;
    return 'BTC-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const createNOWPayment = async () => {
    if (!nowPaymentsConfig || !customerEmail || !customerName || !totalBtc) return;

    setLoading(true);

    try {
      const code = await generateOrderCode();
      setOrderCode(code);

      // Create payment with NOWPayments API
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

      const paymentData = await paymentResponse.json();

      if (paymentData.payment_id) {
        // Store order in database
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        const { error } = await supabase
          .from('bitcoin_orders')
          .insert({
            order_code: code,
            customer_email: customerEmail,
            customer_name: customerName,
            total_usd: totalAmount,
            total_btc: paymentData.pay_amount || totalBtc,
            btc_price_usd: btcPrice,
            bitcoin_address: paymentData.pay_address,
            payment_status: 'pending',
            nowpayments_invoice_id: paymentData.payment_id,
            nowpayments_payment_url: paymentData.invoice_url,
            products: products,
            expires_at: expiresAt.toISOString()
          });

        if (!error) {
          setPaymentUrl(paymentData.invoice_url);
          setPaymentAddress(paymentData.pay_address);
          setPaymentAmount(paymentData.pay_amount);
          setPaymentCreated(true);

          // Send email notifications
          await sendOrderEmails(code, paymentData.pay_address, paymentData.pay_amount);

          onOrderCreated?.(code);
        } else {
          console.error('Database error:', error);
          alert('Error saving order. Please try again.');
        }
      } else {
        console.error('NOWPayments error:', paymentData);
        alert('Error creating payment. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing payment. Please try again.');
    }

    setLoading(false);
  };

  const sendOrderEmails = async (code: string, address: string, amount: string) => {
    try {
      await supabase.functions.invoke('send-bitcoin-order-email', {
        body: {
          orderCode: code,
          customerEmail: customerEmail,
          customerName: customerName,
          totalUsd: totalAmount,
          totalBtc: amount,
          btcPrice: btcPrice,
          bitcoinAddress: address,
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

  const copyToClipboard = (text: string, type: 'address' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'address') {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  if (!gatewayEnabled) {
    return (
      <div className="bg-gray-100 rounded-xl p-6 text-center">
        <Bitcoin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Bitcoin payments are currently unavailable</p>
      </div>
    );
  }

  if (!btcPrice) {
    return (
      <div className="bg-white rounded-xl p-6 text-center">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-3" />
        <p className="text-gray-600">Loading Bitcoin price...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bitcoin Payment Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Bitcoin className="w-10 h-10" />
          <div>
            <h3 className="text-2xl font-bold">Pay with Bitcoin</h3>
            <p className="text-sm opacity-90">Powered by NOWPayments - Secure & Fast</p>
          </div>
        </div>

        {/* Price Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm opacity-90">Total in USD:</span>
            <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-90">Total in BTC:</span>
            <span className="text-2xl font-bold">{totalBtc?.toFixed(8)} BTC</span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/20">
            <p className="text-xs opacity-75">1 BTC = ${btcPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {!paymentCreated ? (
        /* Initial Payment Button */
        <button
          onClick={createNOWPayment}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Creating Secure Payment...
            </>
          ) : (
            <>
              <Bitcoin className="w-6 h-6" />
              Create Bitcoin Payment with NOWPayments
            </>
          )}
        </button>
      ) : (
        /* Payment Instructions */
        <div className="space-y-4">
          {/* Order Success */}
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h4 className="font-bold text-green-900">Payment Created Successfully!</h4>
            </div>
            <p className="text-sm text-green-800 mb-3">Your unique tracking code:</p>
            <div className="bg-white rounded-lg p-4 font-mono text-xl font-bold text-center text-green-900">
              {orderCode}
            </div>
            <p className="text-xs text-green-700 mt-2">
              ✅ Email sent to {customerEmail} and reloadedfiretvteam@gmail.com
            </p>
          </div>

          {/* Option 1: Buy Bitcoin with Card via NOWPayments */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6">
            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              Option 1: Buy Bitcoin Instantly with Credit/Debit Card
            </h4>
            <div className="bg-white/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-800 mb-3">
                <strong>New to crypto?</strong> No problem! Click the button below to:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                <li>Purchase Bitcoin instantly with your credit/debit card</li>
                <li>NOWPayments handles everything automatically</li>
                <li>Bitcoin is sent directly to complete your order</li>
                <li>No wallet or crypto experience needed!</li>
              </ol>
            </div>
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <CreditCard className="w-6 h-6" />
              Pay with Card via NOWPayments
              <ExternalLink className="w-5 h-5" />
            </a>
            <p className="text-xs text-center text-gray-600 mt-2">
              🔒 Secure payment powered by NOWPayments
            </p>
          </div>

          {/* Option 2: Already Have Bitcoin */}
          <div className="bg-white border-2 border-gray-300 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Bitcoin className="w-6 h-6 text-orange-500" />
              Option 2: Already Have Bitcoin? Send Payment Directly
            </h4>

            {/* Bitcoin Address */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Send Bitcoin to this address:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={paymentAddress}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(paymentAddress, 'address')}
                  className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center gap-2"
                  title="Copy Address"
                >
                  {copiedAddress ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* BTC Amount */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exact amount to send:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${paymentAmount} BTC`}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg font-mono text-lg font-bold"
                />
                <button
                  onClick={() => copyToClipboard(paymentAmount, 'amount')}
                  className="px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all flex items-center gap-2"
                  title="Copy Amount"
                >
                  {copiedAmount ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Important Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Send <strong>exactly {paymentAmount} BTC</strong> to the address above</li>
                    <li>Payment will be automatically detected and verified</li>
                    <li>Your order code: <strong className="font-mono">{orderCode}</strong></li>
                    <li>Payment expires in 60 minutes</li>
                    <li>Check your email for confirmation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code Option */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-300 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-700 mb-3">
              <strong>Prefer to scan a QR code?</strong>
            </p>
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
            >
              <Bitcoin className="w-5 h-5" />
              Open Payment Page with QR Code
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Track Order */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Need help or want to track your order?</p>
            <a
              href={`/track-order?code=${orderCode}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Track Your Order with Code: {orderCode}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <h4 className="font-bold text-green-900 mb-3">Why Pay with Bitcoin?</h4>
        <ul className="space-y-2 text-sm text-gray-800">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span><strong>Instant:</strong> Payment processed in minutes</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span><strong>Secure:</strong> Blockchain-verified transactions</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span><strong>Easy:</strong> Buy Bitcoin with card or use existing wallet</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span><strong>Tracked:</strong> Real-time updates via email</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
