import { useState, useEffect } from 'react';
import { User, Package, Mail, LogOut, LogIn, UserPlus, Eye, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navigation from '../components/EnhancedNavigation';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  payment_status: string;
  order_status: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

interface UserData {
  id: string;
  email: string;
}

export default function AccountPage() {
  const { getItemCount } = useCart();
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email || ''
        });
        await loadOrders(currentUser.email || '');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', userEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || ''
        });
        await loadOrders(data.user.email || '');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || ''
        });
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
      case 'processing':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'shipped':
        return 'text-blue-400 bg-blue-400/10';
      case 'failed':
      case 'cancelled':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation cartItemCount={getItemCount()} onCartClick={() => {}} />
        <main className="container mx-auto px-4 py-8 pt-24 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation cartItemCount={getItemCount()} onCartClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {!user ? (
          /* Login/Register Form */
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-orange-500" />
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-gray-400">
                {authMode === 'login' 
                  ? 'Sign in to view your orders' 
                  : 'Register to track your orders'}
              </p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-8">
              <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {authError && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : authMode === 'login' ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create Account
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError(null);
                  }}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {authMode === 'login' 
                    ? "Don't have an account? Register" 
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Account Dashboard */
          <div className="max-w-4xl mx-auto">
            {/* User Info */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">My Account</h1>
                  <p className="text-gray-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* Orders Section */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Order History
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No orders yet</p>
                  <button
                    onClick={() => window.location.href = '/#shop'}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-bold transition-all"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gray-700/50 rounded-xl p-4 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">{order.order_number}</p>
                          <p className="text-sm text-gray-400">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-400">
                            ${order.total?.toFixed(2) || '0.00'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status || 'pending')}`}>
                              {getStatusIcon(order.payment_status || 'pending')}
                              {order.payment_status || 'Pending'}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status || 'pending')}`}>
                              {getStatusIcon(order.order_status || 'pending')}
                              {order.order_status || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      {order.items && order.items.length > 0 && (
                        <div className="border-t border-gray-600 pt-3 mt-3">
                          <div className="space-y-2">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-300">
                                  {item.product_name} x{item.quantity}
                                </span>
                                <span className="text-gray-400">
                                  ${item.total_price?.toFixed(2) || '0.00'}
                                </span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <p className="text-sm text-gray-500">
                                +{order.items.length - 3} more items
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                      </button>

                      {/* Expanded Order Details */}
                      {selectedOrder?.id === order.id && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                          <h4 className="font-semibold mb-3">Order Items</h4>
                          <div className="space-y-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm border-b border-gray-700 pb-2">
                                <div>
                                  <p className="font-medium">{item.product_name}</p>
                                  <p className="text-gray-400">
                                    ${item.unit_price?.toFixed(2)} x {item.quantity}
                                  </p>
                                </div>
                                <span className="font-bold">
                                  ${item.total_price?.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
