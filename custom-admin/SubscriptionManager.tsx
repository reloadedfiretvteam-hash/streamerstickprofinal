import { useState, useEffect } from 'react';
import { Repeat, AlertCircle, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Subscription {
  id: string;
  customer_name: string;
  customer_email: string;
  plan_name: string;
  amount: number;
  billing_cycle: string;
  status: string;
  start_date: string;
  next_billing_date: string;
  auto_renew: boolean;
  payment_method: string;
}

export default function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    loadSubscriptions();
  }, [filter]);

  const loadSubscriptions = async () => {
    try {
      let query = supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      loadSubscriptions();
      alert('Subscription cancelled');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const reactivateSubscription = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;
      loadSubscriptions();
      alert('Subscription reactivated');
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert('Failed to reactivate subscription');
    }
  };

  const totalMRR = subscriptions
    .filter(s => s.status === 'active' && s.billing_cycle === 'monthly')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalARR = subscriptions
    .filter(s => s.status === 'active' && s.billing_cycle === 'yearly')
    .reduce((sum, s) => sum + s.amount, 0);

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const churnRate = subscriptions.length > 0
    ? ((subscriptions.filter(s => s.status === 'cancelled').length / subscriptions.length) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
        <p className="text-gray-400">Manage recurring IPTV subscriptions</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
          <Repeat className="w-10 h-10 text-green-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{activeCount}</div>
          <div className="text-gray-400">Active Subscriptions</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
          <DollarSign className="w-10 h-10 text-blue-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">${totalMRR.toFixed(2)}</div>
          <div className="text-gray-400">Monthly Recurring Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
          <DollarSign className="w-10 h-10 text-purple-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">${totalARR.toFixed(2)}</div>
          <div className="text-gray-400">Annual Recurring Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
          <AlertCircle className="w-10 h-10 text-orange-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{churnRate}%</div>
          <div className="text-gray-400">Churn Rate</div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'active'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Active
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'cancelled'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <XCircle className="w-4 h-4 inline mr-2" />
          Cancelled
        </button>
        <button
          onClick={() => setFilter('expired')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'expired'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <AlertCircle className="w-4 h-4 inline mr-2" />
          Expired
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Subscriptions
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        {loading ? (
          <p className="text-gray-400">Loading subscriptions...</p>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <Repeat className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No subscriptions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="bg-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1">{sub.customer_name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{sub.customer_email}</p>
                    <div className="flex items-center gap-3">
                      <span className="bg-orange-500 text-white px-3 py-1 rounded text-sm font-bold">
                        {sub.plan_name}
                      </span>
                      <span className="text-gray-400 text-sm">•</span>
                      <span className="text-gray-300 text-sm capitalize">{sub.billing_cycle}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    sub.status === 'active' ? 'bg-green-500 text-white' :
                    sub.status === 'cancelled' ? 'bg-red-500 text-white' :
                    'bg-gray-600 text-gray-300'
                  }`}>
                    {sub.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-sm text-gray-400 mb-1">Amount</div>
                    <div className="text-xl font-bold text-white">${sub.amount.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-sm text-gray-400 mb-1">Start Date</div>
                    <div className="text-white font-semibold">
                      {new Date(sub.start_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-sm text-gray-400 mb-1">Next Billing</div>
                    <div className="text-white font-semibold">
                      {new Date(sub.next_billing_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-sm text-gray-400 mb-1">Payment Method</div>
                    <div className="text-white font-semibold capitalize">{sub.payment_method}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sub.auto_renew ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-400">Auto-renewal enabled</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-gray-400">Auto-renewal disabled</span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {sub.status === 'active' && (
                      <button
                        onClick={() => cancelSubscription(sub.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
                      >
                        Cancel
                      </button>
                    )}
                    {sub.status === 'cancelled' && (
                      <button
                        onClick={() => reactivateSubscription(sub.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
