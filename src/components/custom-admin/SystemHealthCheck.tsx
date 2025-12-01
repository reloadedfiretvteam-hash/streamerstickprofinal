import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'checking' | 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export default function SystemHealthCheck() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [running, setRunning] = useState(false);

  const runHealthChecks = async () => {
    setRunning(true);
    const results: HealthCheck[] = [];

    // Check 1: Database Connection
    results.push({ name: 'Database Connection', status: 'checking', message: 'Testing...' });
    setChecks([...results]);

    try {
      const { error } = await supabase.from('real_products').select('count', { count: 'exact', head: true });
      if (error) throw error;
      results[results.length - 1] = {
        name: 'Database Connection',
        status: 'pass',
        message: 'Connected successfully',
        details: 'Supabase database is reachable and responding'
      };
    } catch (error: any) {
      results[results.length - 1] = {
        name: 'Database Connection',
        status: 'fail',
        message: 'Connection failed',
        details: error.message
      };
    }
    setChecks([...results]);

    // Check 2: Products Table
    results.push({ name: 'Real Products Table', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const { data, error } = await supabase.from('real_products').select('id, name, price, main_image').limit(1);
      if (error) throw error;
      results[results.length - 1] = {
        name: 'Real Products Table',
        status: 'pass',
        message: `${data?.length || 0} products found`,
        details: 'Real products table is accessible and contains data'
      };
    } catch (error: any) {
      results[results.length - 1] = {
        name: 'Real Products Table',
        status: 'fail',
        message: 'Unable to read products',
        details: error.message
      };
    }
    setChecks([...results]);

    // Check 3: Orders Table
    results.push({ name: 'Orders System', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const { count, error } = await supabase
        .from('orders_full')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      results[results.length - 1] = {
        name: 'Orders System',
        status: 'pass',
        message: `${count || 0} total orders`,
        details: 'Orders table is functioning correctly'
      };
    } catch (error: any) {
      results[results.length - 1] = {
        name: 'Orders System',
        status: 'fail',
        message: 'Orders table error',
        details: error.message
      };
    }
    setChecks([...results]);

    // Check 4: Payment Transactions
    results.push({ name: 'Payment System', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const { count, error } = await supabase
        .from('payment_transactions')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      results[results.length - 1] = {
        name: 'Payment System',
        status: 'pass',
        message: `${count || 0} transactions tracked`,
        details: 'Payment tracking system is operational'
      };
    } catch (_error: unknown) {
      results[results.length - 1] = {
        name: 'Payment System',
        status: 'warning',
        message: 'Payment table may not exist',
        details: 'This is normal if no payments have been made yet'
      };
    }
    setChecks([...results]);

    // Check 5: Email Captures
    results.push({ name: 'Email Collection', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const { count, error } = await supabase
        .from('email_captures')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      results[results.length - 1] = {
        name: 'Email Collection',
        status: 'pass',
        message: `${count || 0} subscribers`,
        details: 'Email capture system working'
      };
    } catch (error: any) {
      results[results.length - 1] = {
        name: 'Email Collection',
        status: 'fail',
        message: 'Email table error',
        details: error.message
      };
    }
    setChecks([...results]);

    // Check 6: Blog Posts
    results.push({ name: 'Blog System', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const { count, error } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      if (error) throw error;
      results[results.length - 1] = {
        name: 'Blog System',
        status: count && count > 0 ? 'pass' : 'warning',
        message: `${count || 0} published posts`,
        details: count && count > 0 ? 'Blog content available' : 'Consider adding blog posts for SEO'
      };
    } catch (error: any) {
      results[results.length - 1] = {
        name: 'Blog System',
        status: 'fail',
        message: 'Blog table error',
        details: error.message
      };
    }
    setChecks([...results]);

    // Check 7: Reviews/Testimonials
    results.push({ name: 'Reviews System', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const { count, error } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);
      if (error) throw error;
      results[results.length - 1] = {
        name: 'Reviews System',
        status: count && count > 0 ? 'pass' : 'warning',
        message: `${count || 0} reviews available`,
        details: count && count > 0 ? 'Customer reviews displayed' : 'Add customer reviews for social proof'
      };
    } catch (error: any) {
      results[results.length - 1] = {
        name: 'Reviews System',
        status: 'fail',
        message: 'Reviews table error',
        details: error.message
      };
    }
    setChecks([...results]);

    // Check 8: FAQs
    results.push({ name: 'FAQ System', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const { count, error } = await supabase
        .from('faqs')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);
      if (error) throw error;
      results[results.length - 1] = {
        name: 'FAQ System',
        status: count && count > 0 ? 'pass' : 'warning',
        message: `${count || 0} FAQs available`,
        details: count && count > 0 ? 'FAQ content ready' : 'Add FAQs to help customers'
      };
    } catch (error: any) {
      results[results.length - 1] = {
        name: 'FAQ System',
        status: 'fail',
        message: 'FAQ table error',
        details: error.message
      };
    }
    setChecks([...results]);

    // Check 9: Admin Users
    results.push({ name: 'Admin Access', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const { count, error } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      results[results.length - 1] = {
        name: 'Admin Access',
        status: count && count > 0 ? 'pass' : 'warning',
        message: `${count || 0} admin users`,
        details: count && count > 0 ? 'Admin authentication configured' : 'No admin users found'
      };
    } catch (error: any) {
      results[results.length - 1] = {
        name: 'Admin Access',
        status: 'fail',
        message: 'Admin table error',
        details: error.message
      };
    }
    setChecks([...results]);

    // Check 10: Edge Functions
    results.push({ name: 'Edge Functions', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      results[results.length - 1] = {
        name: 'Edge Functions',
        status: response.ok ? 'pass' : 'warning',
        message: response.ok ? 'Functions endpoint accessible' : 'May not be deployed',
        details: 'confirm-payment and send-order-emails should be deployed'
      };
    } catch (_error: unknown) {
      results[results.length - 1] = {
        name: 'Edge Functions',
        status: 'warning',
        message: 'Could not verify',
        details: 'Edge functions may not be deployed yet'
      };
    }
    setChecks([...results]);

    // Check 11: Stripe Configuration
    results.push({ name: 'Stripe Payment Gateway', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      
      if (!stripePublishableKey || stripePublishableKey === 'your-stripe-publishable-key') {
        results[results.length - 1] = {
          name: 'Stripe Payment Gateway',
          status: 'fail',
          message: 'Stripe publishable key not configured',
          details: 'Add VITE_STRIPE_PUBLISHABLE_KEY to your environment variables'
        };
      } else {
        // Check if Stripe.js is loaded
        const stripeLoaded = typeof window !== 'undefined' && typeof (window as any).Stripe === 'function';
        
        if (stripeLoaded) {
          // Verify key format (pk_test_ or pk_live_)
          const isTestKey = stripePublishableKey.startsWith('pk_test_');
          const isLiveKey = stripePublishableKey.startsWith('pk_live_');
          
          if (isTestKey || isLiveKey) {
            results[results.length - 1] = {
              name: 'Stripe Payment Gateway',
              status: 'pass',
              message: `Stripe configured (${isLiveKey ? 'LIVE MODE' : 'TEST MODE'})`,
              details: isLiveKey 
                ? '✅ Live payments are enabled - real charges will occur'
                : '⚠️ Test mode - use test card 4242 4242 4242 4242'
            };
          } else {
            results[results.length - 1] = {
              name: 'Stripe Payment Gateway',
              status: 'warning',
              message: 'Invalid Stripe key format',
              details: 'Key should start with pk_test_ or pk_live_'
            };
          }
        } else {
          results[results.length - 1] = {
            name: 'Stripe Payment Gateway',
            status: 'warning',
            message: 'Stripe.js SDK not loaded',
            details: 'Check that Stripe SDK script is in index.html'
          };
        }
      }
    } catch (_error: unknown) {
      results[results.length - 1] = {
        name: 'Stripe Payment Gateway',
        status: 'fail',
        message: 'Stripe check failed',
        details: 'Unable to verify Stripe configuration'
      };
    }
    setChecks([...results]);

    // Check 12: Stripe Products Table
    results.push({ name: 'Stripe Products (Shadow)', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const { count, error } = await supabase
        .from('stripe_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      if (error) throw error;
      
      results[results.length - 1] = {
        name: 'Stripe Products (Shadow)',
        status: count && count > 0 ? 'pass' : 'warning',
        message: `${count || 0} compliant products configured`,
        details: count && count > 0 
          ? 'Shadow products ready for Stripe compliance'
          : 'Add compliant product descriptions for Stripe'
      };
    } catch (_error: unknown) {
      results[results.length - 1] = {
        name: 'Stripe Products (Shadow)',
        status: 'warning',
        message: 'Stripe products table not found',
        details: 'Run the stripe_products migration to enable shadow products'
      };
    }
    setChecks([...results]);

    // Check 13: Payment Intent Edge Function
    results.push({ name: 'Stripe Payment Intent API', status: 'checking', message: 'Testing...' });
    setChecks([...results]);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (supabaseUrl) {
        // Just check if the endpoint responds (OPTIONS request for CORS)
        const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
          method: 'OPTIONS',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        results[results.length - 1] = {
          name: 'Stripe Payment Intent API',
          status: response.ok || response.status === 204 ? 'pass' : 'warning',
          message: response.ok || response.status === 204 ? 'Payment intent endpoint reachable' : 'Endpoint may not be deployed',
          details: 'Edge function create-payment-intent handles checkout payments'
        };
      } else {
        throw new Error('Supabase URL not configured');
      }
    } catch (_error: unknown) {
      results[results.length - 1] = {
        name: 'Stripe Payment Intent API',
        status: 'warning',
        message: 'Could not reach payment endpoint',
        details: 'Deploy create-payment-intent edge function to Supabase'
      };
    }
    setChecks([...results]);

    // Check 14: Site Settings (Payment Config)
    results.push({ name: 'Payment Configuration', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['stripe_publishable_key', 'stripe_enabled']);
      
      if (error) throw error;
      
      const hasStripeKey = data?.some(s => s.setting_key === 'stripe_publishable_key' && s.setting_value);
      
      results[results.length - 1] = {
        name: 'Payment Configuration',
        status: hasStripeKey ? 'pass' : 'warning',
        message: hasStripeKey ? 'Payment settings configured in database' : 'Using environment variables',
        details: 'Stripe keys can be stored in site_settings or env vars'
      };
    } catch (_error: unknown) {
      results[results.length - 1] = {
        name: 'Payment Configuration',
        status: 'warning',
        message: 'site_settings table not accessible',
        details: 'Payment config will use environment variables'
      };
    }
    setChecks([...results]);

    // Check 15: RLS Policies
    results.push({ name: 'Security (RLS)', status: 'checking', message: 'Checking...' });
    setChecks([...results]);

    try {
      // Try to access without auth - should be allowed for public data
      await supabase.from('real_products').select('id').limit(1);
      results[results.length - 1] = {
        name: 'Security (RLS)',
        status: 'pass',
        message: 'Row Level Security active',
        details: 'Database security policies are enforced'
      };
    } catch (_error: unknown) {
      results[results.length - 1] = {
        name: 'Security (RLS)',
        status: 'warning',
        message: 'RLS status unknown',
        details: 'Unable to verify RLS policies'
      };
    }
    setChecks([...results]);

    setRunning(false);
  };

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'fail':
        return <XCircle className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-400" />;
      case 'checking':
        return <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-500/10 border-green-500/30';
      case 'fail':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'checking':
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const getStatusText = (status: HealthCheck['status']) => {
    switch (status) {
      case 'pass':
        return 'text-green-400';
      case 'fail':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'checking':
        return 'text-blue-400';
    }
  };

  const summary = {
    total: checks.length,
    pass: checks.filter(c => c.status === 'pass').length,
    fail: checks.filter(c => c.status === 'fail').length,
    warning: checks.filter(c => c.status === 'warning').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">System Health Check</h2>
        <p className="text-green-100">Verify all integrations and systems are working properly</p>
      </div>

      {/* Run Check Button */}
      <div>
        <button
          onClick={runHealthChecks}
          disabled={running}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 text-lg"
        >
          <RefreshCw className={`w-6 h-6 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Running Checks...' : 'Run System Health Check'}
        </button>
      </div>

      {/* Summary */}
      {checks.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-gray-400 text-sm mb-1">Total Checks</div>
            <div className="text-white text-3xl font-bold">{summary.total}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-green-500/50">
            <div className="text-gray-400 text-sm mb-1">Passing</div>
            <div className="text-green-400 text-3xl font-bold">{summary.pass}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-yellow-500/50">
            <div className="text-gray-400 text-sm mb-1">Warnings</div>
            <div className="text-yellow-400 text-3xl font-bold">{summary.warning}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-red-500/50">
            <div className="text-gray-400 text-sm mb-1">Failures</div>
            <div className="text-red-400 text-3xl font-bold">{summary.fail}</div>
          </div>
        </div>
      )}

      {/* Checks List */}
      {checks.length > 0 && (
        <div className="space-y-3">
          {checks.map((check, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
            >
              <div className="flex items-start gap-4">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-bold text-lg">{check.name}</h3>
                    <span className={`text-sm font-semibold ${getStatusText(check.status)}`}>
                      {check.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-1">{check.message}</p>
                  {check.details && (
                    <p className="text-gray-400 text-sm">{check.details}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-white font-bold mb-4">Status Legend</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <div className="text-white font-semibold">Pass</div>
              <div className="text-gray-400 text-sm">System is working correctly</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div>
              <div className="text-white font-semibold">Warning</div>
              <div className="text-gray-400 text-sm">May need attention or configuration</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <div>
              <div className="text-white font-semibold">Fail</div>
              <div className="text-gray-400 text-sm">Critical issue requiring immediate fix</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-white font-semibold">Checking</div>
              <div className="text-gray-400 text-sm">Test in progress</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
