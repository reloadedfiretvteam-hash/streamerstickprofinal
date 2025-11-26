import { useState } from 'react';
import { Lock, User, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Admin credentials from environment variables for local/dev testing only
// In production, use Supabase admin_credentials table
const ADMIN_DEFAULT_USER = import.meta.env.VITE_ADMIN_DEFAULT_USER;
const ADMIN_DEFAULT_PASSWORD = import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD;
const ADMIN_DEFAULT_EMAIL = import.meta.env.VITE_ADMIN_DEFAULT_EMAIL || '';

export default function CustomAdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // First check environment-based admin credentials for local/dev testing
      if (ADMIN_DEFAULT_USER && ADMIN_DEFAULT_PASSWORD && 
          username === ADMIN_DEFAULT_USER && password === ADMIN_DEFAULT_PASSWORD) {
        localStorage.setItem('custom_admin_token', 'authenticated');
        localStorage.setItem('custom_admin_user', JSON.stringify({
          username: ADMIN_DEFAULT_USER,
          email: ADMIN_DEFAULT_EMAIL
        }));
        window.location.href = '/custom-admin/dashboard';
        return;
      }

      const { data: admin, error } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        // If database fails, check env-based credentials
        if (ADMIN_DEFAULT_USER && ADMIN_DEFAULT_PASSWORD && 
            username === ADMIN_DEFAULT_USER && password === ADMIN_DEFAULT_PASSWORD) {
          localStorage.setItem('custom_admin_token', 'authenticated');
          localStorage.setItem('custom_admin_user', JSON.stringify({
            username: ADMIN_DEFAULT_USER,
            email: ADMIN_DEFAULT_EMAIL
          }));
          window.location.href = '/custom-admin/dashboard';
          return;
        }
        throw error;
      }

      if (!admin) {
        setMessage('Invalid username or password');
        setLoading(false);
        return;
      }

      // Check password - in production this should be properly hashed
      if (password === admin.password_hash) {
        await supabase
          .from('admin_credentials')
          .update({ last_login: new Date().toISOString() })
          .eq('id', admin.id);

        localStorage.setItem('custom_admin_token', 'authenticated');
        localStorage.setItem('custom_admin_user', JSON.stringify({
          username: admin.username,
          email: admin.email
        }));

        window.location.href = '/custom-admin/dashboard';
      } else {
        setMessage('Invalid username or password');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage('Login failed: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data: admin } = await supabase
        .from('admin_credentials')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (admin) {
        setMessage(`Account found!\nUsername: ${admin.username}\n\nContact: reloadedfirestvteam@gmail.com for password reset`);
      } else {
        setMessage('Email not found');
      }
    } catch (error: any) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Custom Admin Panel
            </h1>
            <p className="text-gray-600">
              {showForgot ? 'Recover Your Account' : 'Simple Management System'}
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('failed') || message.includes('Invalid') || message.includes('not found')
                ? 'bg-red-100 border border-red-300 text-red-700'
                : 'bg-blue-100 border border-blue-300 text-blue-700'
            }`}>
              <p className="text-sm whitespace-pre-line">{message}</p>
            </div>
          )}

          {!showForgot ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition text-gray-900"
                    placeholder="Your username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition text-gray-900"
                    placeholder="Your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="w-full text-sm text-gray-600 hover:text-orange-500 transition"
              >
                Forgot username or password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition text-gray-900"
                    placeholder="reloadedfirestvteam@gmail.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-600 transition disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Recover Account'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setMessage('');
                }}
                className="w-full text-sm text-gray-600 hover:text-orange-500 transition"
              >
                Back to login
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Secure Admin Access Only
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Contact: reloadedfirestvteam@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
