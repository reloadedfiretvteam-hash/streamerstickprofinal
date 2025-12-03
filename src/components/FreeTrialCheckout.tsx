import { useState } from 'react';
import { Gift, Check, Mail, User, Phone, Loader2, ExternalLink, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FreeTrialCheckoutProps {
  productId: string;
  productName: string;
}

export default function FreeTrialCheckout({ productId, productName }: FreeTrialCheckoutProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<{
    username: string;
    password: string;
    serviceUrl: string;
    expiresAt: string;
  } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email) {
      setError('Please enter your name and email');
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }

      // Call free trial signup edge function
      const response = await fetch(`${supabaseUrl}/functions/v1/free-trial-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          customerEmail: email,
          customerName: name,
          customerPhone: phone || undefined,
          productId: productId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to activate free trial');
      }

      // Success!
      setSuccess(true);
      setCredentials(data.credentials);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Free trial signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const formatExpirationDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (success && credentials) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center animate-bounce">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Free Trial Activated!
          </h2>
          <p className="text-gray-600">
            Your 36-hour free trial is now active. Check your email for full details!
          </p>
        </div>

        {/* Credentials Display */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 mb-6 border-2 border-orange-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Gift className="w-6 h-6 text-orange-600" />
            Your Login Credentials
          </h3>

          <div className="space-y-4">
            {/* Service URL */}
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">
                Service URL
              </label>
              <div className="flex items-center gap-2">
                <a 
                  href={credentials.serviceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 font-mono text-lg text-blue-600 hover:text-blue-800 underline"
                >
                  {credentials.serviceUrl}
                </a>
                <button
                  onClick={() => copyToClipboard(credentials.serviceUrl, 'Service URL')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
                <a
                  href={credentials.serviceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                </a>
              </div>
            </div>

            {/* Username */}
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">
                Username
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-lg text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                  {credentials.username}
                </code>
                <button
                  onClick={() => copyToClipboard(credentials.username, 'Username')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Copy username"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <label className="text-xs font-semibold text-gray-600 uppercase mb-1 block">
                Password
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-lg text-gray-900 bg-gray-50 px-3 py-2 rounded border">
                  {credentials.password}
                </code>
                <button
                  onClick={() => copyToClipboard(credentials.password, 'Password')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Copy password"
                >
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Expiration */}
            <div className="bg-orange-100 rounded-lg p-4 border border-orange-300">
              <label className="text-xs font-semibold text-orange-800 uppercase mb-1 block">
                ⏰ Trial Expires
              </label>
              <p className="text-lg font-bold text-orange-900">
                {formatExpirationDate(credentials.expiresAt)}
              </p>
              <p className="text-sm text-orange-700 mt-1">
                That's 36 hours of full access!
              </p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-5 mb-6 border border-blue-200">
          <h4 className="font-bold text-gray-900 mb-3">📧 What's Next?</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Check your email at <strong>{email}</strong> for complete setup instructions</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Use the credentials above to login at the service URL</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Watch the setup video for step-by-step guidance</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>Enjoy 36 hours of unlimited access to all channels!</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={credentials.serviceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-700 transition shadow-lg"
          >
            <ExternalLink className="w-5 h-5" />
            Start Watching Now!
          </a>
          <p className="text-sm text-gray-500 mt-3">
            Need help? Contact support at reloadedfiretvteam@gmail.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <Gift className="w-16 h-16 text-orange-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Start Your Free Trial
        </h2>
        <p className="text-gray-600">
          Get instant access to {productName} - no credit card required!
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition text-gray-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg rounded-lg hover:from-orange-600 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Activating Your Free Trial...
            </>
          ) : (
            <>
              <Gift className="w-5 h-5" />
              Activate Free Trial Now
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By activating your free trial, you'll receive login credentials via email instantly.
          No credit card required. Trial lasts 36 hours.
        </p>
      </form>
    </div>
  );
}

