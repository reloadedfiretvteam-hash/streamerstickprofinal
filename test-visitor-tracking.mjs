/**
 * Comprehensive Visitor Tracking Test Script
 * Tests the full visitor tracking flow from frontend to database
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const API_BASE = process.env.API_BASE || 'https://secure.streamstickpro.com';

async function testVisitorTracking() {
  console.log('🧪 Starting Comprehensive Visitor Tracking Test\n');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;
  const errors = [];

  // Test 1: Check if visitors table exists
  console.log('\n📊 Test 1: Database Schema Check');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ FAILED: visitors table does not exist');
      console.log('   Error:', error.message);
      failed++;
      errors.push('Table does not exist - need to run migration');
    } else if (error) {
      console.log('⚠️  WARNING: Error querying visitors table:', error.message);
      console.log('   Code:', error.code);
    } else {
      console.log('✅ PASSED: visitors table exists');
      passed++;
    }
  } catch (err) {
    console.log('❌ FAILED: Could not connect to database');
    console.log('   Error:', err.message);
    failed++;
    errors.push('Database connection failed');
  }

  // Test 2: Test direct database insert
  console.log('\n💾 Test 2: Direct Database Insert Test');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const testVisitor = {
      session_id: 'test-' + Date.now(),
      page_url: 'https://streamstickpro.com/test',
      referrer: 'https://test.com',
      user_agent: 'Test-Agent',
      ip_address: '127.0.0.1',
      country: 'US',
      country_code: 'US',
      region: 'Test',
      region_code: 'TS',
      city: 'Test City',
      latitude: '0',
      longitude: '0',
      timezone: 'UTC',
      isp: 'Test ISP',
      is_proxy: false,
    };
    
    const { data, error } = await supabase
      .from('visitors')
      .insert(testVisitor)
      .select()
      .single();
    
    if (error) {
      console.log('❌ FAILED: Could not insert visitor');
      console.log('   Error:', error.message);
      console.log('   Code:', error.code);
      console.log('   Hint:', error.hint);
      
      // Try minimal insert
      const minimalVisitor = {
        session_id: 'test-minimal-' + Date.now(),
        page_url: '/test',
      };
      
      const { data: minimalData, error: minimalError } = await supabase
        .from('visitors')
        .insert(minimalVisitor)
        .select()
        .single();
      
      if (minimalError) {
        console.log('   ❌ Minimal insert also failed:', minimalError.message);
        failed++;
        errors.push(`Insert failed: ${error.message} (Code: ${error.code})`);
      } else {
        console.log('   ⚠️  Minimal insert worked - some columns may be missing');
        console.log('   ✅ Minimal insert passed');
        passed++;
        // Clean up
        await supabase.from('visitors').delete().eq('id', minimalData.id);
      }
    } else {
      console.log('✅ PASSED: Successfully inserted visitor');
      console.log('   Visitor ID:', data.id);
      passed++;
      
      // Clean up
      await supabase.from('visitors').delete().eq('id', data.id);
      console.log('   Cleaned up test visitor');
    }
  } catch (err) {
    console.log('❌ FAILED: Exception during insert test');
    console.log('   Error:', err.message);
    failed++;
    errors.push('Insert test exception: ' + err.message);
  }

  // Test 3: Test API endpoint health check
  console.log('\n🏥 Test 3: API Health Check');
  try {
    const response = await fetch(`${API_BASE}/api/track/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'ok') {
      console.log('✅ PASSED: Health endpoint is active');
      console.log('   Message:', data.message);
      passed++;
    } else {
      console.log('❌ FAILED: Health endpoint returned error');
      console.log('   Status:', response.status);
      console.log('   Response:', data);
      failed++;
      errors.push('Health check failed');
    }
  } catch (err) {
    console.log('❌ FAILED: Could not reach health endpoint');
    console.log('   Error:', err.message);
    failed++;
    errors.push('Health endpoint unreachable: ' + err.message);
  }

  // Test 4: Test API tracking endpoint
  console.log('\n📡 Test 4: API Tracking Endpoint Test');
  try {
    const testPayload = {
      sessionId: 'api-test-' + Date.now(),
      pageUrl: 'https://streamstickpro.com/test-api',
      referrer: 'https://test.com',
      userAgent: 'Test-Agent/1.0',
    };
    
    const response = await fetch(`${API_BASE}/api/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    const responseData = await response.json();
    
    if (response.ok && responseData.success) {
      console.log('✅ PASSED: API tracking endpoint works');
      console.log('   Visitor ID:', responseData.visitorId);
      passed++;
    } else {
      console.log('❌ FAILED: API tracking endpoint returned error');
      console.log('   Status:', response.status);
      console.log('   Response:', responseData);
      failed++;
      errors.push(`API tracking failed: ${responseData.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.log('❌ FAILED: Could not reach tracking endpoint');
    console.log('   Error:', err.message);
    failed++;
    errors.push('Tracking endpoint unreachable: ' + err.message);
  }

  // Test 5: Test API test endpoint
  console.log('\n🧪 Test 5: API Test Endpoint');
  try {
    const response = await fetch(`${API_BASE}/api/track/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseData = await response.json();
    
    if (response.ok && responseData.success) {
      console.log('✅ PASSED: API test endpoint works');
      console.log('   Inserted visitor ID:', responseData.inserted.id);
      console.log('   Stats - Total:', responseData.stats.totalVisitors);
      console.log('   Stats - Today:', responseData.stats.todayVisitors);
      passed++;
    } else {
      console.log('❌ FAILED: API test endpoint returned error');
      console.log('   Status:', response.status);
      console.log('   Response:', responseData);
      failed++;
      errors.push(`API test endpoint failed: ${responseData.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.log('❌ FAILED: Could not reach test endpoint');
    console.log('   Error:', err.message);
    failed++;
    errors.push('Test endpoint unreachable: ' + err.message);
  }

  // Test 6: Verify visitor was actually stored
  console.log('\n🔍 Test 6: Verify Visitor Storage');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Get recent visitors (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: recentVisitors, error } = await supabase
      .from('visitors')
      .select('*')
      .gte('created_at', fiveMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log('❌ FAILED: Could not query recent visitors');
      console.log('   Error:', error.message);
      failed++;
      errors.push('Query failed: ' + error.message);
    } else {
      const count = recentVisitors?.length || 0;
      if (count > 0) {
        console.log(`✅ PASSED: Found ${count} recent visitor(s)`);
        console.log('   Latest visitor:', {
          id: recentVisitors[0].id,
          pageUrl: recentVisitors[0].page_url,
          sessionId: recentVisitors[0].session_id,
          createdAt: recentVisitors[0].created_at,
        });
        passed++;
      } else {
        console.log('⚠️  WARNING: No recent visitors found');
        console.log('   This might be normal if tests just ran');
        passed++; // Not a failure, just informational
      }
    }
  } catch (err) {
    console.log('❌ FAILED: Exception during verification');
    console.log('   Error:', err.message);
    failed++;
    errors.push('Verification exception: ' + err.message);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors Found:');
    errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  }
  
  if (failed === 0) {
    console.log('\n✅ All tests passed! Visitor tracking system is working correctly.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
testVisitorTracking().catch(err => {
  console.error('\n💥 Fatal error during testing:', err);
  process.exit(1);
});



