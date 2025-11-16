import { AlertCircle, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PaymentInstructionsProps {
  paymentMethod: 'cashapp' | 'bitcoin';
  orderCode: string;
  amount: number;
  btcAmount?: string;
  cashAppTag?: string;
  bitcoinAddress?: string;
}

interface PaymentInstruction {
  instruction_title: string;
  instruction_text: string;
  important_notes: string[];
}

export default function PaymentInstructions({
  paymentMethod,
  orderCode,
  amount,
  btcAmount,
  cashAppTag = '$starstreem1',
  bitcoinAddress = 'bc1q448jm49ypzwsrrk75c974uqla28k0kmnx6w95r'
}: PaymentInstructionsProps) {
  const [instructions, setInstructions] = useState<PaymentInstruction | null>(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    loadInstructions();
  }, [paymentMethod]);

  const loadInstructions = async () => {
    const { data } = await supabase
      .from('payment_instructions')
      .select('*')
      .eq('gateway_name', paymentMethod)
      .eq('is_active', true)
      .single();

    if (data) {
      setInstructions(data);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  if (!instructions) return null;

  const instructionText = instructions.instruction_text.replace('[ORDER_CODE]', orderCode);
  const steps = instructionText.split('\n').filter(line => line.trim());

  return (
    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30 rounded-xl p-6">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <AlertCircle className="w-6 h-6 text-orange-400" />
        {instructions.instruction_title}
      </h3>

      {/* Order Code Display */}
      <div className="bg-red-600 border-2 border-red-400 rounded-lg p-4 mb-6 animate-pulse">
        <div className="text-center">
          <p className="text-white text-sm font-semibold mb-2">YOUR UNIQUE ORDER CODE</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-3xl font-bold text-white tracking-wider">{orderCode}</p>
            <button
              onClick={() => copyToClipboard(orderCode, 'code')}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              {copied === 'code' ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          <p className="text-white text-xs mt-2 font-semibold">
            SAVE THIS CODE - YOU WILL NEED IT TO TRACK YOUR ORDER
          </p>
        </div>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
        <div className="grid gap-4">
          {paymentMethod === 'cashapp' && (
            <>
              <div>
                <p className="text-gray-400 text-sm mb-1">Send Payment To:</p>
                <div className="flex items-center gap-2">
                  <p className="text-white text-xl font-bold">{cashAppTag}</p>
                  <button
                    onClick={() => copyToClipboard(cashAppTag, 'tag')}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                  >
                    {copied === 'tag' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Amount:</p>
                <p className="text-white text-2xl font-bold">${amount.toFixed(2)}</p>
              </div>
            </>
          )}

          {paymentMethod === 'bitcoin' && (
            <>
              <div>
                <p className="text-gray-400 text-sm mb-1">Bitcoin Address:</p>
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-mono break-all">{bitcoinAddress}</p>
                  <button
                    onClick={() => copyToClipboard(bitcoinAddress, 'address')}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex-shrink-0"
                  >
                    {copied === 'address' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Amount in BTC:</p>
                <div className="flex items-center gap-2">
                  <p className="text-white text-xl font-bold font-mono">{btcAmount} BTC</p>
                  <button
                    onClick={() => copyToClipboard(btcAmount || '', 'btc')}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                  >
                    {copied === 'btc' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">≈ ${amount.toFixed(2)} USD</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="mb-6">
        <h4 className="text-white font-bold mb-3">Step-by-Step Instructions:</h4>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <p className="text-gray-300 pt-1">{step.replace(/^\d+\.\s*/, '')}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <h4 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          CRITICAL - Read Before Sending Payment:
        </h4>
        <ul className="space-y-2">
          {instructions.important_notes.map((note, index) => {
            const noteText = note.replace('[ORDER_CODE]', orderCode);
            return (
              <li key={index} className="text-yellow-100 text-sm flex items-start gap-2">
                <span className="text-yellow-400 font-bold flex-shrink-0">•</span>
                <span>{noteText}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
