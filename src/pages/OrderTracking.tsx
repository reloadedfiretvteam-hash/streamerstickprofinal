import { useState } from 'react';
import { Search, Package, CheckCircle, Clock, Mail, ArrowLeft, AlertCircle, Zap, ExternalLink } from 'lucide-react';
import Footer from '../components/Footer';

interface OrderData {
  id: string;
  purchaseCode?: string;
  status: string;
  productName: string;
  amount: number;
  customerEmail: string;
  createdAt: string;
  generatedUsername?: string;
  generatedPassword?: string;
  serviceUrl?: string;
  setupVideoUrl?: string;
}

export default function OrderTracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchTerm.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/track?q=${encodeURIComponent(q)}`);
      const result = await response.json() as { data?: OrderData; error?: string };

      if (response.ok && result.data) {
        setOrder(result.data);
      } else {
        setError(result.error || 'Order not found. Check your purchase code or email address.');
      }
    } catch {
      setError('Unable to connect. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return { icon: <CheckCircle className="w-6 h-6" />, label: 'Payment Confirmed', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' };
      case 'processing':
        return { icon: <Zap className="w-6 h-6" />, label: 'Processing', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
      case 'pending':
        return { icon: <Clock className="w-6 h-6" />, label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' };
      default:
        return { icon: <Package className="w-6 h-6" />, label: status || 'Unknown', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' };
    }
  };

  const isIPTVOrder = !order?.productName?.toLowerCase().includes('fire') && !order?.productName?.toLowerCase().includes('stick');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
      {/* Header */}
      <div className="bg-black/40 border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </a>
          <span className="text-white font-semibold text-lg">Order Tracking</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {/* Search Form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Track Your Order</h1>
          <p className="text-gray-400 text-sm mb-4">Enter your purchase code (PC-XXXXX) or email address</p>

          <form onSubmit={searchOrder} className="flex gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Purchase code or email..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/50"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-medium">{error}</p>
              <p className="text-red-400/70 text-sm mt-1">
                Need help? Email <a href="mailto:support@streamstickpro.com" className="underline">support@streamstickpro.com</a>
              </p>
            </div>
          </div>
        )}

        {/* Order Found */}
        {order && (() => {
          const statusConfig = getStatusConfig(order.status);
          return (
            <div className="space-y-4">
              {/* Status Card */}
              <div className={`border rounded-2xl p-5 ${statusConfig.bg}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={statusConfig.color}>{statusConfig.icon}</span>
                  <div>
                    <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
                    {order.purchaseCode && <p className="text-gray-400 text-xs">Code: {order.purchaseCode}</p>}
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-400" />
                  Order Details
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Product</span>
                    <span className="text-white font-medium">{order.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-white">${(order.amount / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email</span>
                    <span className="text-white">{order.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ordered</span>
                    <span className="text-white">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Credentials (if completed) */}
              {order.generatedUsername && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
                  <h2 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Your IPTV Credentials
                  </h2>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex justify-between bg-black/30 rounded-lg px-3 py-2">
                      <span className="text-gray-400">Username</span>
                      <span className="text-green-300 select-all">{order.generatedUsername}</span>
                    </div>
                    {order.generatedPassword && (
                      <div className="flex justify-between bg-black/30 rounded-lg px-3 py-2">
                        <span className="text-gray-400">Password</span>
                        <span className="text-green-300 select-all">{order.generatedPassword}</span>
                      </div>
                    )}
                    {order.serviceUrl && (
                      <div className="flex justify-between bg-black/30 rounded-lg px-3 py-2">
                        <span className="text-gray-400">Server</span>
                        <span className="text-green-300 select-all">{order.serviceUrl}</span>
                      </div>
                    )}
                  </div>
                  {order.setupVideoUrl && (
                    <a
                      href={order.setupVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Watch Setup Video
                    </a>
                  )}
                </div>
              )}

              {/* Pending order message */}
              {(order.status === 'pending' || order.status === 'processing') && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5">
                  <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {isIPTVOrder ? 'Account Setup In Progress' : 'Order Processing'}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {isIPTVOrder
                      ? 'Your IPTV account is being set up. You\'ll receive your login credentials via email within 1 business hour (5 AM – 11 PM EST).'
                      : 'Your order is being processed. You\'ll receive updates via email shortly.'}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>Need help? <a href="mailto:support@streamstickpro.com" className="text-orange-400 hover:text-orange-300 transition-colors">support@streamstickpro.com</a></span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Default state */}
        {!order && !error && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Enter your purchase code or email to track your order</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
