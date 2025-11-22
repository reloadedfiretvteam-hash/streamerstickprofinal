import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bitcoin, Search, Download, RefreshCw, CheckCircle, Clock, XCircle, Eye, Mail } from 'lucide-react';

interface BitcoinOrder {
  id: string;
  order_code: string;
  customer_email: string;
  customer_name: string;
  total_usd: number;
  total_btc: number;
  btc_price_usd: number;
  bitcoin_address: string;
  payment_status: string;
  products: any[];
  created_at: string;
  expires_at: string;
  paid_at: string;
}

export default function BitcoinOrdersManager() {
  const [orders, setOrders] = useState<BitcoinOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<BitcoinOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<BitcoinOrder | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('bitcoin_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setOrders(data);
    }

    setLoading(false);
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.payment_status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const updateData: any = {
      payment_status: newStatus,
      updated_at: new Date().toISOString()
    };

    if (newStatus === 'completed') {
      updateData.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('bitcoin_orders')
      .update(updateData)
      .eq('id', orderId);

    if (!error) {
      loadOrders();
      alert('Order status updated successfully!');
    } else {
      alert('Error updating order status.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Order Code', 'Customer Name', 'Email', 'Amount USD', 'Amount BTC', 'BTC Price', 'Status', 'Created', 'Paid'];
    const rows = filteredOrders.map(order => [
      order.order_code,
      order.customer_name,
      order.customer_email,
      order.total_usd,
      order.total_btc,
      order.btc_price_usd,
      order.payment_status,
      new Date(order.created_at).toLocaleString(),
      order.paid_at ? new Date(order.paid_at).toLocaleString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitcoin-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'expired':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      expired: 'bg-red-100 text-red-800 border-red-300',
      failed: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.payment_status === 'pending').length,
    completed: orders.filter(o => o.payment_status === 'completed').length,
    totalRevenue: orders.filter(o => o.payment_status === 'completed').reduce((sum, o) => sum + parseFloat(o.total_usd.toString()), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bitcoin className="w-10 h-10" />
            <div>
              <h2 className="text-2xl font-bold">Bitcoin Orders Dashboard</h2>
              <p className="text-sm opacity-90">Track and manage cryptocurrency payments</p>
            </div>
          </div>
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Bitcoin className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <Bitcoin className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order code, email, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            <option value="failed">Failed</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Order Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.payment_status)}
                      <span className="font-mono font-semibold text-gray-900">{order.order_code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">${order.total_usd}</p>
                      <p className="text-sm text-gray-600">{order.total_btc?.toFixed(8)} BTC</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.payment_status)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-600">{new Date(order.created_at).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {order.payment_status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Mark as Completed"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Bitcoin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400 mt-2">Bitcoin orders will appear here once customers make purchases</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Order Code</p>
                  <p className="text-xl font-mono font-bold">{selectedOrder.order_code}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                    <p className="font-semibold">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="font-semibold">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount (USD)</p>
                    <p className="font-semibold">${selectedOrder.total_usd}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount (BTC)</p>
                    <p className="font-semibold">{selectedOrder.total_btc?.toFixed(8)} BTC</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">BTC Price</p>
                    <p className="font-semibold">${selectedOrder.btc_price_usd}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <div>{getStatusBadge(selectedOrder.payment_status)}</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Bitcoin Address</p>
                  <p className="font-mono text-sm bg-gray-50 p-2 rounded break-all">{selectedOrder.bitcoin_address}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Products</p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedOrder.products.map((product: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{product.name} x{product.quantity}</span>
                        <span className="font-semibold">${product.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created</p>
                    <p className="text-sm">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Expires</p>
                    <p className="text-sm">{new Date(selectedOrder.expires_at).toLocaleString()}</p>
                  </div>
                </div>

                {selectedOrder.payment_status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'completed');
                        setSelectedOrder(null);
                      }}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark as Completed
                    </button>
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'failed');
                        setSelectedOrder(null);
                      }}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Mark as Failed
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
