import { useState, useEffect } from 'react';
import { ShoppingCart, Users, Search, Eye, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface Order {
  id: string;
  customerEmail: string;
  customerName: string;
  realProductName: string;
  amount: number;
  status: string;
  fulfillmentStatus: string;
  createdAt: string;
  stripeCheckoutSessionId?: string;
}

interface Customer {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
  status: string;
  totalOrders?: number;
  createdAt: string;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('custom_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function OrdersCustomersManager() {
  const [activeTab, setActiveTab] = useState<'orders' | 'customers'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else {
      loadCustomers();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch('/api/admin/orders?limit=100', { headers: getAuthHeader() }),
        fetch('/api/admin/orders/stats', { headers: getAuthHeader() }),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json() as { data?: Order[] };
        setOrders(data.data || []);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json() as { data?: any };
        setOrderStats(statsData.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers?limit=100', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json() as { data?: Customer[] };
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'cancelled':
      case 'failed':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order =>
    order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.realProductName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = orderStats?.totalRevenue ?? orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'completed');
  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Orders & Customers</h2>
        <button
          onClick={() => activeTab === 'orders' ? loadOrders() : loadCustomers()}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          Orders {orderStats ? `(${orderStats.totalOrders})` : `(${orders.length})`}
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-6 py-3 font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'customers'
              ? 'border-orange-500 text-orange-500'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          Customers
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
        />
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-white">{orderStats?.totalOrders ?? orders.length}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Paid</div>
              <div className="text-2xl font-bold text-green-400">{paidOrders.length}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-400">{pendingOrders.length}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-green-400">
                ${((totalRevenue || 0) / 100).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-gray-700 rounded-lg p-8 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No orders found</p>
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg divide-y divide-gray-600">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-600 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="text-white font-semibold truncate">{order.customerEmail}</span>
                        <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${getStatusColor(order.status)} text-white shrink-0`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                        {order.fulfillmentStatus && order.fulfillmentStatus !== order.status && (
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-700 text-white shrink-0">
                            {order.fulfillmentStatus}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-300">{order.customerName}</div>
                      <div className="text-sm text-gray-400">Product: {order.realProductName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <div className="text-xl font-bold text-white">
                        ${((order.amount || 0) / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Customers</div>
              <div className="text-2xl font-bold text-white">{customers.length}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Active Customers</div>
              <div className="text-2xl font-bold text-green-400">
                {customers.filter(c => c.status === 'active').length}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-gray-700 rounded-lg p-8 text-center">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No customer accounts yet.</p>
              <p className="text-gray-500 text-sm mt-2">Customers appear here after they register via the customer portal.</p>
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg divide-y divide-gray-600">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-4 hover:bg-gray-600 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold">{customer.fullName || customer.username || 'Unknown'}</div>
                      <div className="text-sm text-gray-400">{customer.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs ${customer.status === 'active' ? 'bg-green-700' : 'bg-gray-600'} text-white`}>
                          {customer.status}
                        </span>
                        {customer.totalOrders !== undefined && (
                          <span className="text-xs text-gray-400">{customer.totalOrders} orders</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Since {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
