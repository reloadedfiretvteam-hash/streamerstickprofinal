import { useState, useEffect } from 'react';
import { Users, Mail, Trash2, Search, Download, DollarSign, ShoppingBag } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
  created_at: string;
}

export default function ComprehensiveCustomerManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [emailCaptures, setEmailCaptures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'buyers' | 'leads'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, emailsRes] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('email_captures').select('*').order('created_at', { ascending: false })
      ]);

      // Process customers from orders
      const orderData = ordersRes.data || [];
      const customerMap = new Map();

      orderData.forEach((order: any) => {
        const email = order.customer_email;
        if (!email) return;

        if (!customerMap.has(email)) {
          customerMap.set(email, {
            id: order.id,
            email: email,
            name: order.customer_name || 'Unknown',
            phone: order.customer_phone,
            total_orders: 0,
            total_spent: 0,
            last_order_date: order.created_at,
            created_at: order.created_at
          });
        }

        const customer = customerMap.get(email);
        customer.total_orders++;
        customer.total_spent += parseFloat(order.total_amount || 0);
        if (new Date(order.created_at) > new Date(customer.last_order_date)) {
          customer.last_order_date = order.created_at;
        }
      });

      setCustomers(Array.from(customerMap.values()));
      setEmailCaptures(emailsRes.data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmail = async (id: string) => {
    if (!confirm('Delete this email capture?')) return;
    try {
      const { error } = await supabase.from('email_captures').delete().eq('id', id);
      if (error) throw error;
      alert('Deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete');
    }
  };

  const exportToCSV = () => {
    const data = activeTab === 'leads' ? emailCaptures : customers;
    const csv = [
      ['Email', 'Name', 'Phone', 'Total Orders', 'Total Spent', 'Last Order', 'Joined'],
      ...data.map((item: any) => [
        item.email,
        item.name || item.source || '',
        item.phone || '',
        item.total_orders || 0,
        `$${item.total_spent?.toFixed(2) || '0.00'}`,
        item.last_order_date || item.created_at || '',
        item.created_at || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${Date.now()}.csv`;
    a.click();
  };

  const filteredCustomers = customers.filter(c =>
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmails = emailCaptures.filter(e =>
    e.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayData = activeTab === 'leads' ? filteredEmails :
                     activeTab === 'buyers' ? filteredCustomers.filter(c => c.total_orders && c.total_orders > 0) :
                     filteredCustomers;

  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const totalOrders = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-400" />
            Customer Management
          </h1>
          <p className="text-gray-400">Manage all customers, orders, and email captures</p>
        </div>
        <button
          onClick={exportToCSV}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <Users className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{customers.length}</div>
          <div className="text-sm opacity-90">Total Customers</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">${totalRevenue.toFixed(0)}</div>
          <div className="text-sm opacity-90">Total Revenue</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <ShoppingBag className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">{totalOrders}</div>
          <div className="text-sm opacity-90">Total Orders</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <div className="text-3xl font-bold">${avgOrderValue.toFixed(2)}</div>
          <div className="text-sm opacity-90">Avg Order Value</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setActiveTab('buyers')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'buyers' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Buyers ({customers.filter(c => c.total_orders && c.total_orders > 0).length})
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'leads' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Email Leads ({emailCaptures.length})
            </button>
          </div>

          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers..."
                className="w-full bg-gray-700 text-white px-10 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading customers...</p>
        ) : displayData.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No customers found</p>
          </div>
        ) : activeTab === 'leads' ? (
          <div className="space-y-2">
            {displayData.map((email: any) => (
              <div key={email.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-semibold">{email.email}</p>
                    <p className="text-gray-400 text-sm">
                      Source: {email.source || 'Unknown'} • {new Date(email.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEmail(email.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-semibold p-3">Customer</th>
                  <th className="text-left text-gray-400 font-semibold p-3">Contact</th>
                  <th className="text-right text-gray-400 font-semibold p-3">Orders</th>
                  <th className="text-right text-gray-400 font-semibold p-3">Total Spent</th>
                  <th className="text-left text-gray-400 font-semibold p-3">Last Order</th>
                  <th className="text-left text-gray-400 font-semibold p-3">Customer Since</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((customer: any) => (
                  <tr key={customer.id} className="border-b border-gray-700 hover:bg-gray-750 transition">
                    <td className="p-3">
                      <div className="text-white font-semibold">{customer.name || 'Unknown'}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-gray-300 text-sm">{customer.email}</div>
                      {customer.phone && <div className="text-gray-400 text-xs">{customer.phone}</div>}
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold">
                        {customer.total_orders || 0}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-green-400 font-bold">${(customer.total_spent || 0).toFixed(2)}</span>
                    </td>
                    <td className="p-3 text-gray-300 text-sm">
                      {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-3 text-gray-400 text-sm">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
