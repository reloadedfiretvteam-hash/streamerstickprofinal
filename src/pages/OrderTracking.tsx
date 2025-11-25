import { useState } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, Mail, X, ArrowLeft, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Footer from '../components/Footer';

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  total: number;
  items: any[];
  created_at: string;
  notes?: string;
}

export default function OrderTracking() {
  const [searchTerm, setSearchTerm] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      // First try orders table - search by email or order number
      const { data: customerOrder, error: customerError } = await supabase
        .from('orders')
        .select('*')
        .or(`order_number.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (customerOrder) {
        setOrder(customerOrder);
        return;
      }

      // If not found, try bitcoin_orders
      const { data: bitcoinOrder, error: bitcoinError } = await supabase
        .from('bitcoin_orders')
        .select('*')
        .or(`order_code.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bitcoinOrder) {
        // Convert bitcoin order to match order format
        setOrder({
          ...bitcoinOrder,
          order_number: bitcoinOrder.order_code,
          order_status: bitcoinOrder.payment_status || 'pending'
        });
      } else {
        setError('Order not found. Please check your order number/code or email address.');
      }
    } catch (err: any) {
      setError('Error searching for order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine if order contains Fire Stick products
  const isFirestickOrder = order?.items?.some((item: any) => {
    const name = (item.product_name || item.name || '').toLowerCase();
    return name.includes('fire stick') || name.includes('firestick') || name.includes('fire tv');
  });

  // Calculate expected delivery based on product type
  const getExpectedDelivery = () => {
    if (!order) return null;
    
    const orderDate = new Date(order.created_at);
    
    if (isFirestickOrder) {
      // Fire Stick: 4-6 business days
      const minDate = new Date(orderDate);
      const maxDate = new Date(orderDate);
      minDate.setDate(minDate.getDate() + 4);
      maxDate.setDate(maxDate.getDate() + 6);
      return {
        type: 'Fire Stick',
        estimate: '4-6 Business Days',
        minDate: minDate.toLocaleDateString(),
        maxDate: maxDate.toLocaleDateString()
      };
    } else {
      // IPTV Subscription: 1-24 hours
      const deliveryDate = new Date(orderDate);
      deliveryDate.setHours(deliveryDate.getHours() + 24);
      return {
        type: 'IPTV Subscription',
        estimate: '1-24 Hours',
        expectedBy: deliveryDate.toLocaleString()
      };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-400" />;
      case 'processing':
        return <Package className="w-6 h-6 text-blue-400" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-purple-400" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      default:
        return <Package className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleReset = () => {
    setOrder(null);
    setError('');
    setSearchTerm('');
  };

  const deliveryInfo = getExpectedDelivery();

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all font-semibold border border-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </a>
          {order && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all font-semibold border border-red-500/50"
            >
              <X className="w-5 h-5" />
              Clear Results
            </button>
          )}
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Track Your Order</h1>
          <p className="text-gray-400 text-lg">
            Enter your order number or email to check your order status
          </p>
        </div>

        <form onSubmit={searchOrder} className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter order number (e.g., ORD-...) or email"
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:hover:scale-100"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 mb-8">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Order #{order.order_number}
                  </h2>
                  <p className="text-gray-400">
                    Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(order.order_status)}`}>
                  {getStatusIcon(order.order_status)}
                  <span className="font-semibold capitalize">{order.order_status}</span>
                </div>
              </div>

              {/* Expected Delivery Section */}
              {deliveryInfo && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    {isFirestickOrder ? (
                      <Truck className="w-8 h-8 text-purple-400" />
                    ) : (
                      <Zap className="w-8 h-8 text-blue-400" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white">Expected Delivery</h3>
                      <p className="text-gray-400">{deliveryInfo.type}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-1">Delivery Estimate</p>
                      <p className="text-2xl font-bold text-white">{deliveryInfo.estimate}</p>
                    </div>
                    {isFirestickOrder ? (
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-1">Expected Between</p>
                        <p className="text-lg font-semibold text-white">
                          {deliveryInfo.minDate} - {deliveryInfo.maxDate}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white/5 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-1">Credentials Expected By</p>
                        <p className="text-lg font-semibold text-white">{deliveryInfo.expectedBy}</p>
                      </div>
                    )}
                  </div>

                  {isFirestickOrder && (
                    <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        📦 <strong>Physical Shipment:</strong> Your Fire Stick will be shipped to your address. 
                        You'll receive tracking information once shipped.
                      </p>
                    </div>
                  )}
                  {!isFirestickOrder && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-300 text-sm">
                        ⚡ <strong>Digital Delivery:</strong> Your IPTV subscription credentials will be sent 
                        to your email address within 1-24 hours of payment confirmation.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Customer Email</h3>
                  <p className="text-white flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {order.customer_email}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Payment Method</h3>
                  <p className="text-white capitalize">{order.payment_method}</p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Payment Status</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Total Amount</h3>
                  <p className="text-2xl font-bold text-orange-400">${(order.total || 0).toFixed(2)}</p>
                </div>
              </div>

              {order.notes && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <h3 className="text-blue-400 font-semibold mb-1">Order Notes</h3>
                  <p className="text-gray-300 text-sm">{order.notes}</p>
                </div>
              )}

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-gray-900 rounded-lg p-4">
                      <div>
                        <p className="text-white font-semibold">{item.product_name || item.name}</p>
                        <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-orange-400 font-bold">
                        ${(item.total_price || item.price || 0).toFixed(2)}
                      </p>
                    </div>
                  )) || (
                    <p className="text-gray-400">No items found</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6">
              <h3 className="text-white font-bold mb-3">Need Help?</h3>
              <p className="text-gray-300 mb-4">
                If you have any questions about your order or need assistance, please contact us:
              </p>
              <a
                href="mailto:reloadedfiretvteam@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </a>
            </div>
          </div>
        )}

        {!order && !error && !loading && (
          <div className="text-center py-20">
            <Package className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Enter your order details above to track your order
            </p>
          </div>
        )}
      </div>

      {/* Unified Footer */}
      <Footer />
    </div>
  );
}
