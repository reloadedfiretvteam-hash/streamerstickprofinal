import { Lock } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface AdminFooterLoginProps {
  onLogin: () => void;
}

export default function AdminFooterLogin({ onLogin }: AdminFooterLoginProps) {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check credentials in database
      const { data: admin, error: dbError } = await supabase
        .from('admin_credentials')
        .select('*')
        .or(`username.eq.${email},email.eq.${email}`)
        .eq('password_hash', password)
        .maybeSingle();

      if (dbError) {
        console.error('Database error:', dbError);
        setError('Login error. Please try again.');
        setLoading(false);
        return;
      }

      if (!admin) {
        setError('Invalid username or password');
        setLoading(false);
        return;
      }

      // Update last login
      await supabase
        .from('admin_credentials')
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id);

      // Set authentication tokens
      localStorage.setItem('custom_admin_token', 'authenticated');
      localStorage.setItem('custom_admin_user', JSON.stringify({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role || 'admin'
      }));

      // Redirect to admin dashboard
      window.location.href = '/admin/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!showLogin) {
    return (
      <div className="text-center py-4 border-t border-gray-800">
        <button
          onClick={() => setShowLogin(true)}
          className="text-gray-500 hover:text-gray-400 text-xs flex items-center gap-1 mx-auto transition-colors"
        >
          <Lock className="w-3 h-3" />
          Admin
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-8">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Lock className="w-6 h-6 text-orange-500" />
            <h3 className="text-xl font-bold text-white">Admin Login</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-sm mb-2">Username</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter username"
                required
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter password"
                required
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold text-white transition-all"
              >
                Cancel
              </button>
            </div>
          </form>

          <p className="text-gray-500 text-xs text-center mt-4">
            Secure admin access only
          </p>
        </div>
      </div>
    </div>
  );
}
