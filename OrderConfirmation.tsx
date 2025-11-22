import { useState } from 'react';
import { Check, Copy, Mail, DollarSign, Wallet } from 'lucide-react';

interface OrderItem {
  product_name: string;
  quantity: number;
  total_price: number;
}

interface OrderConfirmationProps {
  orderNumber: string;
  purchaseCode: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  customerEmail: string;
  btcAmount?: string | null;
  btcAddress?: string | null;
  cashAppTag?: string | null;
  onClose: () => void;
}

export default function OrderConfirmation({
  orderNumber,
  purchaseCode,
  items,
  total,
  paymentMethod,
  customerEmail,
  btcAmount,
  btcAddress,
  cashAppTag,
  onClose
}: OrderConfirmationProps) {
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
            <p className="text-gray-400">Thank you for your purchase</p>
          </div>

          {/* Purchase Code - PROMINENTLY DISPLAYED */}
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500 rounded-xl p-6 mb-6">
            <div className="text-center">
              <h3 className="text-orange-400 font-bold text-lg mb-2">🔑 YOUR UNIQUE PURCHASE CODE</h3>
              <div className="bg-black/40 rounded-lg p-4 mb-4">
                <div className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-wider break-all">
                  {purchaseCode}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(purchaseCode, 'purchaseCode')}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold text-white"
              >
                {copied === 'purchaseCode' ? (
                  <><Check className="w-5 h-5" /><span>Copied!</span></>
                ) : (
                  <><Copy className="w-5 h-5" /><span>Copy Purchase Code</span></>
                )}
              </button>
              <p className="text-gray-300 text-sm mt-3">
                ⚠️ Save this code! You'll need it to complete your payment and track your order.
              </p>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-400">Order Number</p>
                <p className="text-xl font-bold text-white">{orderNumber}</p>
              </div>
              <button
                onClick={() => copyToClipboard(orderNumber, 'orderNumber')}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                {copied === 'orderNumber' ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>

            <div className="space-y-2 text-sm border-t border-gray-700 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-white">{customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-white capitalize">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Amount</span>
                <span className="text-orange-400 font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions Based on Method */}
          {paymentMethod === 'cashapp' && cashAppTag && (
            <div className="bg-green-500/10 border-2 border-green-500/40 rounded-xl p-6 mb-6">
              <h4 className="text-green-400 font-bold text-lg mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                Cash App Payment Instructions
              </h4>

              <div className="bg-black/40 rounded-lg p-4 mb-4">
                <div className="text-gray-400 text-sm mb-2">Send payment to:</div>
                <div className="text-green-400 text-2xl font-bold mb-3">{cashAppTag}</div>
                <div className="text-white text-lg mb-3">Amount: ${total.toFixed(2)}</div>
                <button
                  onClick={() => copyToClipboard(cashAppTag, 'cashAppTag')}
                  className="w-full py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  {copied === 'cashAppTag' ? (
                    <><Check className="w-4 h-4" /><span>Copied!</span></>
                  ) : (
                    <><Copy className="w-4 h-4" /><span>Copy Cash App Tag</span></>
                  )}
                </button>
              </div>

              <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                <li>Open your Cash App</li>
                <li>Send ${total.toFixed(2)} to {cashAppTag}</li>
                <li><strong className="text-white">In the "What's it for" field, paste: {purchaseCode}</strong></li>
                <li>Complete the payment</li>
              </ol>
              <p className="text-gray-400 text-xs mt-3">
                💡 If needed, email a screenshot to reloadedfiretvteam@gmail.com with your purchase code.
              </p>
            </div>
          )}

          {paymentMethod === 'bitcoin' && btcAmount && btcAddress && (
            <div className="bg-orange-500/10 border-2 border-orange-500/40 rounded-xl p-6 mb-6">
              <h4 className="text-orange-400 font-bold text-lg mb-4 flex items-center gap-2">
                <Wallet className="w-6 h-6" />
                Bitcoin Payment Instructions
              </h4>

              <div className="space-y-4">
                <div className="bg-black/40 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Bitcoin Amount:</div>
                  <div className="text-orange-400 text-xl font-bold mb-2">{btcAmount} BTC</div>
                  <button
                    onClick={() => copyToClipboard(btcAmount, 'btcAmount')}
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold text-sm"
                  >
                    {copied === 'btcAmount' ? (
                      <><Check className="w-4 h-4" /><span>Copied!</span></>
                    ) : (
                      <><Copy className="w-4 h-4" /><span>Copy Amount</span></>
                    )}
                  </button>
                </div>

                <div className="bg-black/40 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-2">Bitcoin Address:</div>
                  <div className="text-white text-xs font-mono break-all mb-2">{btcAddress}</div>
                  <button
                    onClick={() => copyToClipboard(btcAddress, 'btcAddress')}
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold text-sm"
                  >
                    {copied === 'btcAddress' ? (
                      <><Check className="w-4 h-4" /><span>Copied!</span></>
                    ) : (
                      <><Copy className="w-4 h-4" /><span>Copy Address</span></>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-4 bg-red-500/10 border border-red-500/40 rounded-lg p-4">
                <p className="text-red-400 text-sm font-semibold mb-2">⚠️ IMPORTANT STEPS:</p>
                <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                  <li>Send {btcAmount} BTC to the address above</li>
                  <li><strong className="text-white">Email a screenshot of your payment to reloadedfiretvteam@gmail.com</strong></li>
                  <li><strong className="text-white">Include your purchase code in the email: {purchaseCode}</strong></li>
                </ol>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Order Items</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-300">
                    {item.product_name} <span className="text-gray-500">x{item.quantity}</span>
                  </span>
                  <span className="text-white font-semibold">
                    ${item.total_price.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-700 flex justify-between text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-orange-400">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Email Confirmation Notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-blue-400 font-semibold mb-1">Confirmation Email Sent</h4>
                <p className="text-gray-300 text-sm">
                  We've sent a confirmation email to <strong className="text-white">{customerEmail}</strong> with your purchase code, order details, and complete payment instructions.
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Check your inbox (and spam folder) for the email.
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
