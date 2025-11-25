import { useState } from 'react';
import { Lock, User, Flame, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Admin credentials - in production, these should come from environment variables
const ADMIN_USERNAME = 'starevan11';
const ADMIN_PASSWORD = 'starevan11';
const ADMIN_EMAIL = 'reloadedfiretvteam@gmail.com';

export default function UnifiedAdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First check hardcoded admin credentials for guaranteed access
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('custom_admin_token', 'authenticated');
        localStorage.setItem('custom_admin_user', JSON.stringify({
          id: 'admin-master',
          email: ADMIN_EMAIL,
          role: 'super_admin',
          username: ADMIN_USERNAME
        }));
        window.location.href = '/admin';
        return;
      }

      // Fallback to database check
      const { data: admin, error: dbError } = await supabase
        .from('admin_credentials')
        .select('*')
        .or(`username.eq.${username},email.eq.${username}`)
        .eq('password_hash', password)
        .maybeSingle();

      if (dbError) {
        console.error('Database error:', dbError);
        // If database fails, still allow hardcoded credentials
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          localStorage.setItem('custom_admin_token', 'authenticated');
          localStorage.setItem('custom_admin_user', JSON.stringify({
            id: 'admin-master',
            email: ADMIN_EMAIL,
            role: 'super_admin',
            username: ADMIN_USERNAME
          }));
          window.location.href = '/admin';
          return;
        }
      }

      if (!admin) {
        setError('Invalid credentials. Access denied.');
        setLoading(false);
        return;
      }

      await supabase
        .from('admin_credentials')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id);

      localStorage.setItem('custom_admin_token', 'authenticated');
      localStorage.setItem('custom_admin_user', JSON.stringify({
        id: admin.id,
        email: admin.email,
        role: admin.role
      }));

      window.location.href = '/admin';
    } catch (error: any) {
      // Even on error, allow hardcoded credentials
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('custom_admin_token', 'authenticated');
        localStorage.setItem('custom_admin_user', JSON.stringify({
          id: 'admin-master',
          email: ADMIN_EMAIL,
          role: 'super_admin',
          username: ADMIN_USERNAME
        }));
        window.location.href = '/admin';
        return;
      }
      
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4 shadow-lg">
              <Flame className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Inferno TV</h1>
            <p className="text-gray-300 text-sm">Admin Dashboard Access</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400">Secure Login</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  placeholder="Enter username"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Authenticating...' : 'Login to Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Secure admin access only
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
            ← Back to homepage
          </a>
        </div>
      </div>
    </div>
  );
}
