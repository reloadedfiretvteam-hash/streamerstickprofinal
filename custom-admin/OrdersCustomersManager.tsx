import { useState, useEffect } from 'react';
import { ShoppingCart, Users, Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Order {
  id: string;
  user_email: string;
  product_id: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export default function OrdersCustomersManager() {
  const [activeTab, setActiveTab] = useState<'orders' | 'customers'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
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
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCustomers(data || []);
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
    order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Orders & Customers</h2>
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
          Orders
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-white">{orders.length}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Completed</div>
              <div className="text-2xl font-bold text-green-400">
                {orders.filter(o => o.status === 'completed').length}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-400">
                {orders.filter(o => o.status === 'pending').length}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-green-400">
                ${orders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)}
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
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-white font-semibold">{order.user_email}</span>
                        <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(order.status)} text-white`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">Product: {order.product_id}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        ${order.amount?.toFixed(2) || '0.00'}
                      </div>
                      <button className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
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
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total Customers</div>
              <div className="text-2xl font-bold text-white">{customers.length}</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Avg Orders/Customer</div>
              <div className="text-2xl font-bold text-blue-400">
                {customers.length > 0
                  ? (customers.reduce((sum, c) => sum + (c.total_orders || 0), 0) / customers.length).toFixed(1)
                  : '0'}
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total CLV</div>
              <div className="text-2xl font-bold text-green-400">
                ${customers.reduce((sum, c) => sum + (c.total_spent || 0), 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Customers List */}
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-gray-700 rounded-lg p-8 text-center">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No customers found</p>
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg divide-y divide-gray-600">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-4 hover:bg-gray-600 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-white font-semibold mb-1">{customer.name}</div>
                      <div className="text-sm text-gray-400">{customer.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Member since {new Date(customer.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-400 mb-1">
                        {customer.total_orders || 0} orders
                      </div>
                      <div className="text-lg font-bold text-white">
                        ${customer.total_spent?.toFixed(2) || '0.00'}
                      </div>
                      <button className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </div>
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
