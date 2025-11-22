import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Calendar, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RevenueData {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  allTime: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  avgOrderValue: number;
  topProducts: Array<{ name: string; revenue: number; orders: number }>;
}

export default function RevenueDashboard() {
  const [data, setData] = useState<RevenueData>({
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    allTime: 0,
    ordersToday: 0,
    ordersThisWeek: 0,
    ordersThisMonth: 0,
    avgOrderValue: 0,
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('today');

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterdayStart = new Date(todayStart);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);
      const lastWeekStart = new Date(weekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(monthStart);
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

      let today = 0, yesterday = 0, thisWeek = 0, lastWeek = 0;
      let thisMonth = 0, lastMonth = 0, allTime = 0;
      let ordersToday = 0, ordersThisWeek = 0, ordersThisMonth = 0;
      const productRevenue = new Map();

      orders?.forEach((order: any) => {
        const orderDate = new Date(order.created_at);
        const amount = parseFloat(order.total_amount || 0);
        allTime += amount;

        if (orderDate >= todayStart) {
          today += amount;
          ordersToday++;
        }
        if (orderDate >= yesterdayStart && orderDate < todayStart) {
          yesterday += amount;
        }
        if (orderDate >= weekStart) {
          thisWeek += amount;
          ordersThisWeek++;
        }
        if (orderDate >= lastWeekStart && orderDate < weekStart) {
          lastWeek += amount;
        }
        if (orderDate >= monthStart) {
          thisMonth += amount;
          ordersThisMonth++;
        }
        if (orderDate >= lastMonthStart && orderDate < monthStart) {
          lastMonth += amount;
        }

        // Track product revenue
        order.order_items?.forEach((item: any) => {
          const productName = item.product_name || 'Unknown';
          if (!productRevenue.has(productName)) {
            productRevenue.set(productName, { revenue: 0, orders: 0 });
          }
          const product = productRevenue.get(productName);
          product.revenue += parseFloat(item.price || 0) * (item.quantity || 1);
          product.orders++;
        });
      });

      const topProducts = Array.from(productRevenue.entries())
        .map(([name, stats]) => ({ name, revenue: stats.revenue, orders: stats.orders }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const avgOrderValue = ordersToday > 0 ? today / ordersToday : 0;

      setData({
        today,
        yesterday,
        thisWeek,
        lastWeek,
        thisMonth,
        lastMonth,
        allTime,
        ordersToday,
        ordersThisWeek,
        ordersThisMonth,
        avgOrderValue,
        topProducts
      });
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const todayChange = getPercentageChange(data.today, data.yesterday);
  const weekChange = getPercentageChange(data.thisWeek, data.lastWeek);
  const monthChange = getPercentageChange(data.thisMonth, data.lastMonth);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-400" />
          Revenue Dashboard
        </h1>
        <p className="text-gray-400">Real-time financial performance tracking</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'This Week' },
          { key: 'month', label: 'This Month' },
          { key: 'all', label: 'All Time' }
        ].map((tf) => (
          <button
            key={tf.key}
            onClick={() => setTimeframe(tf.key as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              timeframe === tf.key ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading revenue data...</p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10">
                <DollarSign className="w-32 h-32" />
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 opacity-80" />
                  <span className="text-sm opacity-90">Today's Revenue</span>
                </div>
                <div className="text-4xl font-bold mb-2">${data.today.toFixed(2)}</div>
                <div className="flex items-center gap-2">
                  {todayChange >= 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-200" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-200" />
                  )}
                  <span className="text-sm">
                    {Math.abs(todayChange).toFixed(1)}% vs yesterday
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-90">This Week</span>
              </div>
              <div className="text-4xl font-bold mb-2">${data.thisWeek.toFixed(2)}</div>
              <div className="flex items-center gap-2">
                {weekChange >= 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {Math.abs(weekChange).toFixed(1)}% vs last week
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-90">This Month</span>
              </div>
              <div className="text-4xl font-bold mb-2">${data.thisMonth.toFixed(2)}</div>
              <div className="flex items-center gap-2">
                {monthChange >= 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {Math.abs(monthChange).toFixed(1)}% vs last month
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-90">All Time Revenue</span>
              </div>
              <div className="text-4xl font-bold mb-2">${data.allTime.toFixed(2)}</div>
              <div className="text-sm opacity-90">
                Total lifetime revenue
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Orders Today</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{data.ordersToday}</div>
              <p className="text-gray-400 text-sm">Total orders received today</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-bold text-white">Avg Order Value</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-1">${data.avgOrderValue.toFixed(2)}</div>
              <p className="text-gray-400 text-sm">Average per transaction today</p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Weekly Orders</h3>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{data.ordersThisWeek}</div>
              <p className="text-gray-400 text-sm">Orders this week</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              Top 5 Products by Revenue
            </h3>
            {data.topProducts.length === 0 ? (
              <p className="text-gray-400">No product data available</p>
            ) : (
              <div className="space-y-3">
                {data.topProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-500">#{idx + 1}</div>
                      <div>
                        <div className="text-white font-semibold">{product.name}</div>
                        <div className="text-gray-400 text-sm">{product.orders} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-xl">${product.revenue.toFixed(2)}</div>
                      <div className="text-gray-400 text-sm">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-500/20 border-2 border-blue-500 rounded-xl p-6">
            <h3 className="text-white font-bold mb-3">Financial Performance Summary</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <span className="font-semibold text-white">Today:</span> ${data.today.toFixed(2)} ({data.ordersToday} orders)
              </div>
              <div>
                <span className="font-semibold text-white">This Week:</span> ${data.thisWeek.toFixed(2)} ({data.ordersThisWeek} orders)
              </div>
              <div>
                <span className="font-semibold text-white">This Month:</span> ${data.thisMonth.toFixed(2)} ({data.ordersThisMonth} orders)
              </div>
              <div>
                <span className="font-semibold text-white">All Time:</span> ${data.allTime.toFixed(2)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
