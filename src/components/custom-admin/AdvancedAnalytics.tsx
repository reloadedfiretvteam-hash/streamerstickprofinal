import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Users, ShoppingCart, Eye, Activity, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdvancedAnalytics() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    todayOrders: 0,
    weekOrders: 0,
    monthOrders: 0,
    todayVisitors: 0,
    weekVisitors: 0,
    monthVisitors: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('today');

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [ordersData, visitorsData] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('website_visitors').select('*')
      ]);

      const orders = ordersData.data || [];
      const visitors = visitorsData.data || [];

      const todayOrders = orders.filter(o => new Date(o.created_at) >= today);
      const weekOrders = orders.filter(o => new Date(o.created_at) >= weekAgo);
      const monthOrders = orders.filter(o => new Date(o.created_at) >= monthAgo);

      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      const todayVisitors = visitors.filter(v => new Date(v.visit_date) >= today).length;
      const weekVisitors = visitors.filter(v => new Date(v.visit_date) >= weekAgo).length;
      const monthVisitors = visitors.filter(v => new Date(v.visit_date) >= monthAgo).length;

      const conversionRate = weekVisitors > 0 ? ((weekOrders.length / weekVisitors) * 100).toFixed(2) : 0;
      const avgOrderValue = weekOrders.length > 0 ? (weekRevenue / weekOrders.length).toFixed(2) : 0;

      setStats({
        todayRevenue,
        weekRevenue,
        monthRevenue,
        todayOrders: todayOrders.length,
        weekOrders: weekOrders.length,
        monthOrders: monthOrders.length,
        todayVisitors,
        weekVisitors,
        monthVisitors,
        conversionRate: parseFloat(String(conversionRate || 0)),
        avgOrderValue: parseFloat(String(avgOrderValue || 0)),
        topProducts: []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStats = () => {
    switch (timeframe) {
      case 'today':
        return {
          revenue: stats.todayRevenue,
          orders: stats.todayOrders,
          visitors: stats.todayVisitors
        };
      case 'week':
        return {
          revenue: stats.weekRevenue,
          orders: stats.weekOrders,
          visitors: stats.weekVisitors
        };
      case 'month':
        return {
          revenue: stats.monthRevenue,
          orders: stats.monthOrders,
          visitors: stats.monthVisitors
        };
      default:
        return {
          revenue: stats.todayRevenue,
          orders: stats.todayOrders,
          visitors: stats.todayVisitors
        };
    }
  };

  const currentStats = getCurrentStats();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Advanced Analytics</h1>
          <p className="text-gray-400">Real-time business metrics and insights</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              timeframe === 'today'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              timeframe === 'week'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              timeframe === 'month'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10 text-green-400" />
            <Activity className="w-5 h-5 text-green-400 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            ${currentStats.revenue.toFixed(2)}
          </div>
          <div className="text-gray-400 text-sm">Revenue</div>
          <div className="mt-3 pt-3 border-t border-green-500/30">
            <div className="text-xs text-gray-400">
              Week: <span className="text-green-400 font-bold">${stats.weekRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-10 h-10 text-blue-400" />
            <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {currentStats.orders}
          </div>
          <div className="text-gray-400 text-sm">Orders</div>
          <div className="mt-3 pt-3 border-t border-blue-500/30">
            <div className="text-xs text-gray-400">
              Week: <span className="text-blue-400 font-bold">{stats.weekOrders}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <Eye className="w-10 h-10 text-purple-400" />
            <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {currentStats.visitors}
          </div>
          <div className="text-gray-400 text-sm">Visitors</div>
          <div className="mt-3 pt-3 border-t border-purple-500/30">
            <div className="text-xs text-gray-400">
              Week: <span className="text-purple-400 font-bold">{stats.weekVisitors}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 text-orange-400" />
            <Activity className="w-5 h-5 text-orange-400 animate-pulse" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {stats.conversionRate}%
          </div>
          <div className="text-gray-400 text-sm">Conversion Rate</div>
          <div className="mt-3 pt-3 border-t border-orange-500/30">
            <div className="text-xs text-gray-400">
              Avg Order: <span className="text-orange-400 font-bold">${stats.avgOrderValue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-400" />
            Revenue Breakdown
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <div className="text-gray-400 text-sm">Today</div>
                <div className="text-2xl font-bold text-white">${stats.todayRevenue.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">{stats.todayOrders} orders</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <div className="text-gray-400 text-sm">Last 7 Days</div>
                <div className="text-2xl font-bold text-white">${stats.weekRevenue.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">{stats.weekOrders} orders</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <div className="text-gray-400 text-sm">Last 30 Days</div>
                <div className="text-2xl font-bold text-white">${stats.monthRevenue.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">{stats.monthOrders} orders</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Traffic Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <div className="text-gray-400 text-sm">Today's Visitors</div>
                <div className="text-2xl font-bold text-white">{stats.todayVisitors}</div>
              </div>
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <div className="text-gray-400 text-sm">Weekly Visitors</div>
                <div className="text-2xl font-bold text-white">{stats.weekVisitors}</div>
              </div>
              <Eye className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div>
                <div className="text-gray-400 text-sm">Monthly Visitors</div>
                <div className="text-2xl font-bold text-white">{stats.monthVisitors}</div>
              </div>
              <Eye className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Key Performance Metrics</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Average Order Value</div>
            <div className="text-3xl font-bold text-green-400">${stats.avgOrderValue}</div>
            <div className="text-xs text-gray-500 mt-2">Per transaction (7 days)</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Conversion Rate</div>
            <div className="text-3xl font-bold text-orange-400">{stats.conversionRate}%</div>
            <div className="text-xs text-gray-500 mt-2">Visitors to customers (7 days)</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-2">Revenue per Visitor</div>
            <div className="text-3xl font-bold text-blue-400">
              ${stats.weekVisitors > 0 ? (stats.weekRevenue / stats.weekVisitors).toFixed(2) : '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-2">Total revenue / visitors (7 days)</div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700">
          <Activity className="w-4 h-4 inline mr-2 animate-spin" />
          Refreshing data...
        </div>
      )}
    </div>
  );
}
