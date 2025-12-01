import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader, RefreshCw, CreditCard, Database, Globe } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function StripeConnectionTest() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    const testResults: TestResult[] = [];

    // Test 1: Check Environment Variables
    testResults.push({
      name: 'Frontend Environment Variables',
      status: 'loading',
      message: 'Checking...',
    });
    setResults([...testResults]);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    testResults[0].status = (supabaseUrl && supabaseKey && stripeKey) ? 'success' : 'error';
    testResults[0].message = (supabaseUrl && supabaseKey && stripeKey) 
      ? 'All frontend environment variables found'
      : `Missing: ${!supabaseUrl ? 'VITE_SUPABASE_URL ' : ''}${!supabaseKey ? 'VITE_SUPABASE_ANON_KEY ' : ''}${!stripeKey ? 'VITE_STRIPE_PUBLISHABLE_KEY' : ''}`;
    testResults[0].details = {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasStripeKey: !!stripeKey,
      stripeKeyPrefix: stripeKey ? stripeKey.substring(0, 7) : 'missing',
    };

    setResults([...testResults]);

    // Test 2: Check Supabase Connection
    testResults.push({
      name: 'Supabase Connection',
      status: 'loading',
      message: 'Testing...',
    });
    setResults([...testResults]);

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey || '',
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });
      
      testResults[1].status = response.ok ? 'success' : 'error';
      testResults[1].message = response.ok 
        ? 'Successfully connected to Supabase'
        : `Connection failed: ${response.status} ${response.statusText}`;
    } catch (error) {
      testResults[1].status = 'error';
      testResults[1].message = `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    setResults([...testResults]);

    // Test 3: Check Stripe API (via Edge Function)
    testResults.push({
      name: 'Stripe Payment Intent Creation',
      status: 'loading',
      message: 'Testing Stripe connection...',
    });
    setResults([...testResults]);

    try {
      const testResponse = await fetch(`${supabaseUrl}/functions/v1/stripe-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey || '',
        },
        body: JSON.stringify({
          customerEmail: 'test@example.com',
          customerName: 'Test Customer',
          amount: 100, // $1.00 test amount
          currency: 'usd',
          metadata: {
            test: 'true',
            source: 'connection_test',
          },
        }),
      });

      const testData = await testResponse.json();

      if (testResponse.ok && testData.clientSecret) {
        testResults[2].status = 'success';
        testResults[2].message = 'Successfully created test payment intent with Stripe!';
        testResults[2].details = {
          paymentIntentId: testData.paymentIntentId,
          amount: testData.amount,
          hasClientSecret: !!testData.clientSecret,
        };
      } else {
        testResults[2].status = 'error';
        testResults[2].message = `Failed: ${testData.error || 'Unknown error'}`;
        testResults[2].details = testData;
      }
    } catch (error) {
      testResults[2].status = 'error';
      testResults[2].message = `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    setResults([...testResults]);

    // Test 4: Check Stripe.js Loading
    testResults.push({
      name: 'Stripe.js Library',
      status: 'loading',
      message: 'Checking Stripe.js...',
    });
    setResults([...testResults]);

    // Load Stripe script if not already loaded
    if (!document.getElementById('stripe-script')) {
      const script = document.createElement('script');
      script.id = 'stripe-script';
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.body.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
        script.onerror = () => resolve(null);
        setTimeout(resolve, 5000); // Timeout after 5 seconds
      });
    }

    if (window.Stripe && stripeKey) {
      try {
        const stripe = window.Stripe(stripeKey);
        testResults[3].status = 'success';
        testResults[3].message = 'Stripe.js loaded and initialized successfully';
      } catch (error) {
        testResults[3].status = 'error';
        testResults[3].message = `Stripe initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    } else {
      testResults[3].status = 'error';
      testResults[3].message = 'Stripe.js failed to load or publishable key missing';
    }

    setResults([...testResults]);

    // Test 5: Check Edge Function Availability
    testResults.push({
      name: 'Edge Function Endpoint',
      status: 'loading',
      message: 'Checking edge function...',
    });
    setResults([...testResults]);

    try {
      const funcResponse = await fetch(`${supabaseUrl}/functions/v1/stripe-payment-intent`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey || '',
        },
      });

      testResults[4].status = funcResponse.ok ? 'success' : 'error';
      testResults[4].message = funcResponse.ok
        ? 'Edge function endpoint is accessible'
        : `Endpoint returned: ${funcResponse.status}`;
    } catch (error) {
      testResults[4].status = 'error';
      testResults[4].message = `Cannot reach edge function: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    setResults([...testResults]);

    setTesting(false);
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const allPassed = results.length > 0 && errorCount === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-blue-600" />
                Stripe Connection Test
              </h1>
              <p className="text-gray-600 mt-2">Verify your Stripe payment processor connection</p>
            </div>
            <button
              onClick={runTests}
              disabled={testing}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {testing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Run Tests
                </>
              )}
            </button>
          </div>

          {results.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-700">{successCount} Passed</span>
                </div>
                {errorCount > 0 && (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-700">{errorCount} Failed</span>
                  </div>
                )}
                {allPassed && (
                  <div className="ml-auto px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold">
                    ✅ All Tests Passed!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  result.status === 'success'
                    ? 'border-green-500'
                    : result.status === 'error'
                    ? 'border-red-500'
                    : 'border-yellow-500'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {result.status === 'loading' && <Loader className="w-5 h-5 text-yellow-500 animate-spin" />}
                    {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {result.status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                    <h3 className="text-lg font-semibold text-gray-900">{result.name}</h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      result.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : result.status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {result.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-700 mb-2">{result.message}</p>

                {result.details && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                      View Details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        {results.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900">What This Test Does</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <Database className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Frontend Environment Variables:</strong> Checks if all required environment variables are present
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Supabase Connection:</strong> Verifies connection to your Supabase database
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Stripe Payment Intent:</strong> Creates a test payment intent to verify Stripe API connection
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Stripe.js Library:</strong> Tests if Stripe.js loads correctly in the browser
                </div>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Edge Function Endpoint:</strong> Verifies the payment intent edge function is accessible
                </div>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900 font-semibold mb-2">⚠️ Important:</p>
              <p className="text-blue-800 text-sm">
                This test creates a <strong>real payment intent</strong> in Stripe (test mode if using test keys).
                The payment intent is not charged, but it will appear in your Stripe dashboard.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




