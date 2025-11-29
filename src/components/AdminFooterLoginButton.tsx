import { useState } from 'react';
import { Lock } from 'lucide-react';

export default function AdminFooterLoginButton() {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check environment-based credentials (with fallback)
      const ADMIN_DEFAULT_USER = import.meta.env.VITE_ADMIN_DEFAULT_USER || 'admin';
      const ADMIN_DEFAULT_PASSWORD = import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD || 'admin123';
      const ADMIN_DEFAULT_EMAIL = import.meta.env.VITE_ADMIN_DEFAULT_EMAIL || 'reloadedfirestvteam@gmail.com';

      // Hardcoded fallback for immediate use
      const FALLBACK_USER = 'admin';
      const FALLBACK_PASSWORD = 'admin123';

      // Try environment variables first, then fallback
      if ((username === ADMIN_DEFAULT_USER && password === ADMIN_DEFAULT_PASSWORD) ||
          (username === FALLBACK_USER && password === FALLBACK_PASSWORD)) {
        localStorage.setItem('custom_admin_token', 'authenticated');
        localStorage.setItem('custom_admin_user', JSON.stringify({
          id: 'admin-env',
          email: ADMIN_DEFAULT_EMAIL,
          role: 'super_admin',
          username: ADMIN_DEFAULT_USER
        }));
        window.location.href = '/admin/dashboard';
        return;
      }

      // Fallback to database check
      const { supabase } = await import('../lib/supabase');
      
      const { data: admin, error: dbError } = await supabase
        .from('admin_credentials')
        .select('*')
        .or(`username.eq.${username},email.eq.${username}`)
        .eq('password_hash', password)
        .maybeSingle();

      if (dbError) {
        console.error('Database error:', dbError);
        setError('Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      if (!admin) {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('custom_admin_token', 'authenticated');
      localStorage.setItem('custom_admin_user', JSON.stringify({
        id: admin.id,
        email: admin.email,
        role: admin.role,
        username: admin.username
      }));

      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  if (!showLogin) {
    return (
      <button
        onClick={() => setShowLogin(true)}
        className="hover:text-orange-400 transition-colors text-sm flex items-center gap-1"
      >
        <Lock className="w-3 h-3" />
        Admin Login
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full border border-gray-700">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Lock className="w-6 h-6 text-orange-500" />
          <h3 className="text-xl font-bold text-white">Admin Login</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
              disabled={loading}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

