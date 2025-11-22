import { useState } from 'react';
import { Lock, User } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

export default function AdminLogin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple authentication check
    // In production, this should verify against database
    if (username === 'admin' && password === 'streamunlimited2025') {
      setIsAuthenticated(true);
      setError('');
      localStorage.setItem('admin_authenticated', 'true');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  // Check if already authenticated
  if (isAuthenticated || localStorage.getItem('admin_authenticated') === 'true') {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-gray-600">StreamUnlimited.tv Management Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Sign In to Admin Panel
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 font-semibold mb-2">🔐 Default Credentials:</p>
            <p className="text-sm text-blue-800">Username: <code className="bg-white px-2 py-1 rounded">admin</code></p>
            <p className="text-sm text-blue-800">Password: <code className="bg-white px-2 py-1 rounded">streamunlimited2025</code></p>
            <p className="text-xs text-blue-700 mt-2">⚠️ Change these in production!</p>
          </div>

          <div className="mt-6 text-center">
            <a href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              ← Back to Website
            </a>
          </div>
        </div>

        <div className="mt-6 text-center text-white text-sm">
          <p>Need help? Check <code className="bg-white/10 px-2 py-1 rounded">ADMIN_ACCESS.md</code></p>
        </div>
      </div>
    </div>
  );
}
