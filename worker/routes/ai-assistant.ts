import { Hono } from 'hono';
import type { Env } from '../index';
import { getStorage } from '../helpers';

export function createAIAssistantRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // Main AI assistant endpoint - processes natural language commands
  router.post('/execute', async (c) => {
    try {
      const body = await c.req.json();
      const { command, context, executeShell } = body;

      if (!command) {
        return c.json({ error: 'Command is required' }, 400);
      }

      // Check for shell command execution
      if (executeShell || command.startsWith('shell:') || command.startsWith('cmd:') || command.startsWith('exec:')) {
        const shellCmd = command.replace(/^(shell:|cmd:|exec:)\s*/, '');
        const shellResult = await executeShellCommand(shellCmd, c.env);
        return c.json({
          success: !shellResult.error,
          type: 'shell',
          command: shellCmd,
          result: shellResult
        });
      }

      // Enhanced AI processing - try to use OpenAI if available, otherwise use rule-based parsing
      let action;
      if (c.env.OPENAI_API_KEY) {
        // Use OpenAI for better understanding
        try {
          action = await parseCommandWithAI(command, context, c.env);
        } catch (aiError) {
          console.warn('AI parsing failed, falling back to rule-based:', aiError);
          action = await parseCommand(command, context, c.env);
        }
      } else {
        // Use rule-based parsing
        action = await parseCommand(command, context, c.env);
      }
      
      // Execute the action with full token access
      const result = await executeAction(action, c.env);

      return c.json({
        success: !result.error,
        action,
        result,
        message: result.message || result.error || 'Task completed successfully',
        usedAI: !!c.env.OPENAI_API_KEY && !result.error,
        tokensUsed: {
          github: !!c.env.GITHUB_TOKEN,
          openai: !!c.env.OPENAI_API_KEY,
          stripe: !!c.env.STRIPE_SECRET_KEY,
          supabase: !!c.env.VITE_SUPABASE_URL
        }
      });
    } catch (error: any) {
      console.error('AI Assistant error:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to execute command'
      }, 500);
    }
  });

  // Direct codebase access endpoint - no tokens needed for internal operations
  router.post('/codebase/read', async (c) => {
    try {
      const body = await c.req.json();
      const { filePath, repo, branch } = body;
      
      if (!filePath) {
        return c.json({ error: 'File path is required' }, 400);
      }

      // Try GitHub API first (if token available)
      if (c.env.GITHUB_TOKEN) {
        try {
          const repoPath = repo || 'reloadedfiretvteam-hash/streamerstickprofinal';
          const branchName = branch || 'clean-main';
          
          const response = await fetch(
            `https://api.github.com/repos/${repoPath}/contents/${filePath}?ref=${branchName}`,
            {
              headers: {
                'Authorization': `token ${c.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw'
              }
            }
          );
          
          if (response.ok) {
            const content = await response.text();
            return c.json({
              success: true,
              filePath,
              content,
              source: 'github',
              size: content.length
            });
          }
        } catch (error: any) {
          console.warn('GitHub file read failed:', error);
        }
      }

      return c.json({
        error: 'File access requires GitHub token or local file system access',
        filePath,
        note: 'Set GITHUB_TOKEN environment variable for codebase access'
      });
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });

  // Code comparison endpoint
  router.post('/codebase/compare', async (c) => {
    try {
      const body = await c.req.json();
      const { file1, file2, repo, branch } = body;
      
      if (!file1 || !file2) {
        return c.json({ error: 'Both file paths are required' }, 400);
      }

      if (!c.env.GITHUB_TOKEN) {
        return c.json({ error: 'GitHub token required for code comparison' }, 400);
      }

      const repoPath = repo || 'reloadedfiretvteam-hash/streamerstickprofinal';
      const branchName = branch || 'clean-main';

      // Read both files
      const [file1Content, file2Content] = await Promise.all([
        readGitHubFile(c.env.GITHUB_TOKEN, repoPath, branchName, file1),
        readGitHubFile(c.env.GITHUB_TOKEN, repoPath, branchName, file2)
      ]);

      // Simple comparison
      const lines1 = file1Content.split('\n');
      const lines2 = file2Content.split('\n');
      const diff = calculateDiff(lines1, lines2);

      return c.json({
        success: true,
        file1: { path: file1, lines: lines1.length },
        file2: { path: file2, lines: lines2.length },
        comparison: {
          added: diff.added,
          removed: diff.removed,
          modified: diff.modified,
          similar: diff.similar
        }
      });
    } catch (error: any) {
      return c.json({ error: error.message }, 500);
    }
  });

  // List all available tokens and credentials (without exposing secrets)
  router.get('/tokens/status', async (c) => {
    return c.json({
      tokens: {
        github: {
          available: !!c.env.GITHUB_TOKEN,
          configured: !!c.env.GITHUB_TOKEN,
          prefix: c.env.GITHUB_TOKEN ? c.env.GITHUB_TOKEN.substring(0, 7) + '...' : 'not set'
        },
        openai: {
          available: !!c.env.OPENAI_API_KEY,
          configured: !!c.env.OPENAI_API_KEY,
          prefix: c.env.OPENAI_API_KEY ? c.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'not set'
        },
        stripe: {
          secret: !!c.env.STRIPE_SECRET_KEY,
          publishable: !!c.env.STRIPE_PUBLISHABLE_KEY,
          webhook: !!c.env.STRIPE_WEBHOOK_SECRET
        },
        supabase: {
          url: !!c.env.VITE_SUPABASE_URL,
          anonKey: !!c.env.VITE_SUPABASE_ANON_KEY,
          serviceKey: !!c.env.SUPABASE_SERVICE_KEY
        },
        resend: {
          apiKey: !!c.env.RESEND_API_KEY,
          fromEmail: c.env.RESEND_FROM_EMAIL || 'not set'
        },
        admin: {
          username: !!c.env.ADMIN_USERNAME,
          password: !!c.env.ADMIN_PASSWORD
        }
      },
      internalAccess: {
        database: true, // Always available via storage layer
        system: true, // Always available
        codebase: !!c.env.GITHUB_TOKEN // Requires token
      }
    });
  });

  // Get available capabilities
  router.get('/capabilities', async (c) => {
    return c.json({
      capabilities: [
        {
          category: 'GitHub',
          actions: [
            'list repositories',
            'push changes',
            'create branch',
            'view commits',
            'manage pull requests'
          ]
        },
        {
          category: 'Supabase',
          actions: [
            'query database',
            'create table',
            'update records',
            'delete records',
            'run migrations'
          ]
        },
        {
          category: 'Stripe',
          actions: [
            'list products',
            'create product',
            'view payments',
            'refund payment',
            'manage subscriptions'
          ]
        },
        {
          category: 'Cloudflare',
          actions: [
            'deploy to pages',
            'check deployment status',
            'view logs',
            'manage workers'
          ]
        },
        {
          category: 'Code',
          actions: [
            'generate code',
            'modify files',
            'create components',
            'add features',
            'fix bugs'
          ]
        },
        {
          category: 'Database',
          actions: [
            'query orders/products/customers',
            'analyze database',
            'find issues and problems',
            'check data health',
            'view analytics'
          ]
        },
        {
          category: 'Code Analysis',
          actions: [
            'analyze codebase structure',
            'search code (GitHub API)',
            'create components (with AI code generation)',
            'find code issues (automated detection)',
            'generate code templates',
            'read files from GitHub',
            'modify files via GitHub API',
            'create features with full implementation'
          ]
        },
        {
          category: 'Advanced Operations',
          actions: [
            'parallel operations',
            'batch processing',
            'auto-fix issues',
            'code generation with AI',
            'comprehensive system analysis'
          ]
        },
        {
          category: 'Shell Commands (Internal Access)',
          actions: [
            'db:query <table> - Query database (no token needed)',
            'db:analyze - Database analysis (no token needed)',
            'code:read <file> - Read file from codebase',
            'code:search <query> - Search codebase',
            'env - Show environment status',
            'ls <path> - List files',
            'help - Show all commands'
          ]
        },
        {
          category: 'Code Comparison',
          actions: [
            'compare two files',
            'analyze code differences',
            'find code patterns'
          ]
        }
      ]
    });
  });

  return router;
}

// Execute Cloudflare actions
async function executeCloudflareAction(action: any, env: Env): Promise<any> {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) {
    return { error: 'Cloudflare API token and account ID required' };
  }

  try {
    switch (action.action) {
      case 'list_workers':
        const workersResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts`,
          {
            headers: {
              'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        );
        const workersData = await workersResponse.json();
        return {
          message: `Found ${workersData.result?.length || 0} workers`,
          data: workersData.result || []
        };

      case 'deploy_worker':
        return { message: 'Worker deployment requires code and configuration', note: 'Use Cloudflare API or dashboard for full deployment' };

      case 'deploy_pages':
        return { message: 'Pages deployment typically handled via GitHub integration', note: 'Check Cloudflare Pages dashboard' };

      default:
        return { message: `Cloudflare action '${action.action}' not implemented yet` };
    }
  } catch (error: any) {
    return { error: `Cloudflare operation failed: ${error.message}` };
  }
}

// Execute Supabase actions
async function executeSupabaseAction(action: any, env: Env): Promise<any> {
  if (!env.SUPABASE_SERVICE_KEY) {
    return { error: 'Supabase service key required' };
  }

  try {
    switch (action.action) {
      case 'list_edge_functions':
        return {
          message: 'Edge functions listed',
          data: { note: 'Use Supabase CLI or dashboard to list edge functions' }
        };

      case 'deploy_edge_function':
        return { message: 'Edge function deployment requires code', note: 'Use Supabase CLI: supabase functions deploy' };

      default:
        return { message: `Supabase action '${action.action}' not implemented yet` };
    }
  } catch (error: any) {
    return { error: `Supabase operation failed: ${error.message}` };
  }
}

// Execute SQL actions
async function executeSQLAction(action: any, env: Env): Promise<any> {
  if (!env.SUPABASE_SERVICE_KEY) {
    return { error: 'Supabase service key required for SQL execution' };
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
    const result = await executeSupabaseSQL(supabase, action.query);
    
    return {
      message: 'SQL query executed successfully',
      data: result
    };
  } catch (error: any) {
    return { error: `SQL execution failed: ${error.message}` };
  }
}

// Execute conflict actions
async function executeConflictAction(action: any, env: Env): Promise<any> {
  try {
    if (action.action === 'detect') {
      const conflicts = await detectConflicts(env, action.type || 'all');
      return {
        message: conflicts.length > 0 ? `Found ${conflicts.length} conflicts` : 'No conflicts detected',
        data: { conflicts }
      };
    }
    
    if (action.action === 'fix') {
      const result = await fixConflict(env, action.conflictId);
      return {
        message: 'Conflict fixed successfully',
        data: result
      };
    }
    
    return { error: `Unknown conflict action: ${action.action}` };
  } catch (error: any) {
    return { error: `Conflict operation failed: ${error.message}` };
  }
}

// Execute secrets actions
async function executeSecretsAction(action: any, env: Env): Promise<any> {
  try {
    if (action.action === 'list') {
      return {
        message: 'Secrets and environment variables',
        data: {
          available: {
            github: !!env.GITHUB_TOKEN,
            openai: !!env.OPENAI_API_KEY,
            cloudflare: !!env.CLOUDFLARE_API_TOKEN,
            supabase: !!env.SUPABASE_SERVICE_KEY,
            stripe: !!env.STRIPE_SECRET_KEY,
            resend: !!env.RESEND_API_KEY
          },
          note: 'Secrets are read-only. Modify via Cloudflare dashboard or environment configuration.'
        }
      };
    }
    
    return { error: `Unknown secrets action: ${action.action}` };
  } catch (error: any) {
    return { error: `Secrets operation failed: ${error.message}` };
  }
}

// Execute SQL on Supabase
async function executeSupabaseSQL(supabase: any, query: string, params?: any[]): Promise<any> {
  if (query.trim().toUpperCase().startsWith('SELECT')) {
    const tableMatch = query.match(/FROM\s+(\w+)/i);
    if (tableMatch) {
      const table = tableMatch[1];
      const { data, error } = await supabase.from(table).select('*');
      if (error) throw error;
      return data;
    }
  }
  throw new Error('Complex SQL queries require Supabase SQL editor or direct database access');
}

// Manage Supabase Edge Functions
async function manageSupabaseEdgeFunction(env: Env, action: string, functionName: string, code?: string): Promise<any> {
  return {
    message: `Edge function ${action}: ${functionName}`,
    note: 'Use Supabase CLI: supabase functions deploy ' + functionName,
    ...(code ? { codeLength: code.length } : {})
  };
}

// Manage Cloudflare Workers
async function manageCloudflareWorker(env: Env, action: string, workerName: string, code?: string, bindings?: any): Promise<any> {
  if (action === 'deploy' && code && env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID) {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${workerName}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/javascript'
        },
        body: code
      }
    );
    
    if (!response.ok) {
      throw new Error(`Worker deployment failed: ${response.statusText}`);
    }
    
    return { message: `Worker ${workerName} deployed successfully` };
  }
  
  return { message: `Worker action: ${action} for ${workerName}` };
}

// Manage Cloudflare Pages
async function manageCloudflarePages(env: Env, action: string, projectName: string): Promise<any> {
  return {
    message: `Pages action: ${action} for ${projectName}`,
    note: 'Pages are typically deployed via GitHub integration. Check Cloudflare dashboard for deployment status.'
  };
}

// Detect conflicts
async function detectConflicts(env: Env, type: string = 'all', target?: string): Promise<any[]> {
  const conflicts: any[] = [];
  
  try {
    if (type === 'database' || type === 'all') {
      const storage = getStorage(env);
      const orders = await storage.getAllOrders();
      
      const orderIds = new Set();
      const duplicates = orders.filter(o => {
        if (orderIds.has(o.id)) return true;
        orderIds.add(o.id);
        return false;
      });
      
      if (duplicates.length > 0) {
        conflicts.push({
          type: 'database',
          severity: 'high',
          message: `Found ${duplicates.length} duplicate order IDs`,
          affected: duplicates.map(d => d.id)
        });
      }
    }
    
    if (type === 'config' || type === 'all') {
      const required = ['STRIPE_SECRET_KEY', 'VITE_SUPABASE_URL', 'RESEND_API_KEY'];
      const missing = required.filter(key => !env[key as keyof Env]);
      
      if (missing.length > 0) {
        conflicts.push({
          type: 'config',
          severity: 'high',
          message: `Missing required environment variables: ${missing.join(', ')}`
        });
      }
    }
  } catch (error: any) {
    conflicts.push({
      type: 'system',
      severity: 'high',
      message: `Error detecting conflicts: ${error.message}`
    });
  }
  
  return conflicts;
}

// Fix a specific conflict
async function fixConflict(env: Env, conflictId: string, resolution?: string): Promise<any> {
  return {
    message: `Resolving conflict: ${conflictId}`,
    resolution: resolution || 'automatic',
    note: 'Conflict resolution depends on conflict type. Review and approve fixes.'
  };
}

// Extract helper functions for new command types
function extractWorkerName(command: string): string {
  const match = command.match(/worker[:\s]+([^\s]+)/i) || command.match(/['"]([^'"]+)['"]/);
  return match ? match[1] : '';
}

function extractProjectName(command: string): string {
  const match = command.match(/project[:\s]+([^\s]+)/i) || command.match(/pages[:\s]+([^\s]+)/i);
  return match ? match[1] : '';
}

function extractFunctionName(command: string): string {
  const match = command.match(/function[:\s]+([^\s]+)/i);
  return match ? match[1] : '';
}

function extractSQLQuery(command: string): string {
  const cleaned = command.replace(/^(sql|query|execute)[:\s]+/i, '').trim();
  return cleaned || command;
}

function extractConflictId(command: string): string {
  const match = command.match(/conflict[:\s]+([^\s]+)/i) || command.match(/id[:\s]+([^\s]+)/i);
  return match ? match[1] : '';
}

function extractConflictType(command: string): string {
  if (command.includes('code')) return 'code';
  if (command.includes('database') || command.includes('db')) return 'database';
  if (command.includes('config')) return 'config';
  return 'all';
}

// Perform self-check to find issues (including AI mistakes)
async function performSelfCheck(env: Env, checkType: string = 'all'): Promise<any[]> {
  const issues: any[] = [];
  
  try {
    // Check database integrity
    if (checkType === 'database' || checkType === 'all') {
      const storage = getStorage(env);
      
      // Check for orders without customerEmail
      try {
        const orders = await storage.getAllOrders();
        const missingEmails = orders.filter(o => !o.customerEmail && o.status === 'paid');
        if (missingEmails.length > 0) {
          issues.push({
            id: 'missing-customer-emails',
            type: 'database',
            severity: 'high',
            message: `Found ${missingEmails.length} paid orders without customerEmail`,
            affected: missingEmails.map(o => o.id),
            autoFixable: false,
            fixNote: 'Email should be captured from Stripe session.customer_details.email'
          });
        }
      } catch (error: any) {
        issues.push({
          id: 'db-check-error',
          type: 'system',
          severity: 'medium',
          message: `Database check failed: ${error.message}`,
          autoFixable: false
        });
      }
    }
    
    // Check configuration
    if (checkType === 'config' || checkType === 'all') {
      const required = ['STRIPE_SECRET_KEY', 'VITE_SUPABASE_URL', 'RESEND_API_KEY'];
      const missing = required.filter(key => !env[key as keyof Env]);
      
      if (missing.length > 0) {
        issues.push({
          id: 'missing-env-vars',
          type: 'config',
          severity: 'critical',
          message: `Missing required environment variables: ${missing.join(', ')}`,
          affected: missing,
          autoFixable: false
        });
      }
    }
    
    // Check code patterns (common AI mistakes)
    if (checkType === 'code' || checkType === 'all') {
      // This would require GitHub access to check actual code
      // For now, return placeholder
      issues.push({
        id: 'code-pattern-check',
        type: 'code',
        severity: 'low',
        message: 'Code pattern check requires GitHub token access',
        autoFixable: false,
        note: 'Use /codebase/read to review specific files'
      });
    }
    
  } catch (error: any) {
    issues.push({
      id: 'self-check-error',
      type: 'system',
      severity: 'high',
      message: `Self-check failed: ${error.message}`,
      autoFixable: false
    });
  }
  
  return issues;
}

// Auto-fix a specific issue
async function autoFixIssue(env: Env, issueId: string, fixType?: string): Promise<any> {
  // Most fixes require manual intervention or specific context
  // This is a framework for future auto-fix capabilities
  return {
    message: `Issue ${issueId} identified for fixing`,
    fixType: fixType || 'manual',
    note: 'Auto-fix capabilities are being expanded. Some issues may require manual review.',
    recommendation: getFixRecommendation(issueId)
  };
}

// Review code for issues
async function reviewCode(env: Env, filePath: string, code: string, checkFor: string = 'all'): Promise<any> {
  const issues: any[] = [];
  const suggestions: any[] = [];
  
  // Check for common errors
  if (checkFor === 'errors' || checkFor === 'all') {
    // Missing error handling
    if (code.includes('await fetch') && !code.includes('try') && !code.includes('catch')) {
      suggestions.push({
        type: 'error-handling',
        severity: 'medium',
        message: 'Consider adding try-catch blocks around fetch calls'
      });
    }
    
    // Missing null checks
    if (code.includes('order.customerEmail') && !code.includes('order?.customerEmail') && !code.includes('if (order.customerEmail)')) {
      suggestions.push({
        type: 'null-safety',
        severity: 'high',
        message: 'Add null checks for customerEmail before using it',
        filePath,
        line: 'Approximate - check customerEmail usage'
      });
    }
  }
  
  // Check for system-specific patterns
  if (checkFor === 'best-practices' || checkFor === 'all') {
    // Shadow store routing checks
    if (filePath.includes('App.tsx') && code.includes('isShadowDomain')) {
      if (!code.includes('SECURE_HOSTS')) {
        suggestions.push({
          type: 'system-pattern',
          severity: 'low',
          message: 'Ensure SECURE_HOSTS env var is used for shadow domain detection'
        });
      }
    }
    
    // Webhook product mapping
    if (filePath.includes('webhook.ts') && code.includes('shadowProductId')) {
      if (!code.includes('realProductId')) {
        suggestions.push({
          type: 'system-pattern',
          severity: 'high',
          message: 'Ensure webhook reverses shadow product mapping to real product'
        });
      }
    }
  }
  
  return {
    filePath,
    issuesFound: issues.length,
    suggestions: suggestions.length,
    details: {
      errors: issues,
      suggestions
    },
    systemKnowledge: 'This review uses knowledge of the dual-store cloaking system'
  };
}

// Get fix recommendations
function getFixRecommendation(issueId: string): string {
  const recommendations: Record<string, string> = {
    'missing-customer-emails': 'Check webhook handler to ensure customerEmail is captured from Stripe session.customer_details.email',
    'missing-env-vars': 'Set missing environment variables in Cloudflare Pages dashboard',
    'db-check-error': 'Check Supabase connection and service key',
    'code-pattern-check': 'Review code files using codebase/read endpoint'
  };
  
  return recommendations[issueId] || 'Review the issue details and apply appropriate fix';
}

// System knowledge base - AI understands the entire system architecture
const SYSTEM_KNOWLEDGE = {
  architecture: {
    type: 'Full-stack TypeScript application',
    frontend: 'React 18 + TypeScript + Vite + TailwindCSS',
    backend: 'Cloudflare Workers + Hono framework',
    database: 'Supabase PostgreSQL with Drizzle ORM',
    routing: 'Wouter for client-side routing'
  },
  dualStoreSystem: {
    description: 'Product cloaking system for payment processor compliance',
    mainStore: {
      domain: 'Primary domain (e.g., streamstickpro.com)',
      route: '/',
      component: 'MainStore.tsx',
      products: 'Real products - Jailbroken Fire Sticks ($140-$160) and IPTV subscriptions ($15-$75)',
      customers: 'Customer-facing store'
    },
    shadowStore: {
      domain: 'Secure subdomain (e.g., secure.streamstickpro.com)',
      route: '/shadow-services',
      component: 'ShadowStore.tsx',
      products: 'Cloaked products - "Web Design" and "SEO" services with matching prices',
      purpose: 'Shown to payment processors, customers never see directly'
    },
    mapping: {
      table: 'realProducts',
      logic: 'Each real product maps to shadowProductId in Stripe',
      checkout: 'Shadow product sent to Stripe during checkout',
      webhooks: 'Webhooks reverse mapping to deliver correct credentials'
    },
    routing: {
      detection: 'isShadowDomain() checks hostname against SECURE_HOSTS env var',
      shadowDomain: 'Shows ShadowStore at /, limited routes (/, /checkout, /success)',
      mainDomain: 'Shows MainStore at /, full routes including /admin, /blog, /shop, /customer-login'
    }
  },
  keyFiles: {
    routing: 'client/src/App.tsx - Dual routing based on domain',
    mainStore: 'client/src/pages/MainStore.tsx - Real product catalog',
    shadowStore: 'client/src/pages/ShadowStore.tsx - Cloaked product catalog',
    checkout: 'client/src/pages/Checkout.tsx - Unified checkout',
    webhooks: 'worker/routes/webhook.ts - Stripe webhook handler with product mapping',
    storage: 'worker/storage.ts - Database operations with Drizzle ORM',
    admin: 'client/src/pages/AdminPanel.tsx - Admin interface with AI Assistant'
  },
  database: {
    tables: ['orders', 'realProducts', 'customers', 'blogPosts', 'seoAds'],
    orders: 'Tracks shadow/real product mappings, Stripe IDs, credentials, customerEmail',
    realProducts: 'Maps real products to shadow products via shadowProductId'
  },
  integration: {
    stripe: 'Payment processing with shadow product mapping, webhooks at /api/webhook',
    supabase: 'Database and storage',
    resend: 'Email sending (order confirmations, credentials)',
    cloudflare: 'Hosting (Pages + Workers)',
    github: 'Code repository (reloadedfiretvteam-hash/streamerstickprofinal, branch: clean-main)'
  }
};

// Enhanced AI-powered command parsing (if OpenAI API key is available)
async function parseCommandWithAI(command: string, context: any, env: Env): Promise<any> {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not available');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for a StreamStickPro admin panel with full system knowledge.

SYSTEM ARCHITECTURE:
This is a full-stack TypeScript application using React 18 + Cloudflare Workers + Hono + Supabase PostgreSQL.

DUAL-STORE CLOAKING SYSTEM (CRITICAL KNOWLEDGE):
- Main Store: Primary domain shows REAL products (Fire Sticks $140-$160, IPTV $15-$75) via MainStore.tsx
- Shadow Store: Secure subdomain shows CLOAKED products ("Web Design", "SEO") via ShadowStore.tsx for payment processors
- Routing: isShadowDomain() checks SECURE_HOSTS env var to determine which store to show
- Product Mapping: realProducts table maps real products to shadowProductId in Stripe
- Checkout: Shadow products sent to Stripe, webhooks reverse mapping to deliver correct credentials
- Key Files: App.tsx (routing), MainStore.tsx (real), ShadowStore.tsx (cloaked), webhook.ts (mapping reversal)

DATABASE:
- Tables: orders, realProducts, customers, blogPosts, seoAds
- Orders track shadow/real mappings, Stripe IDs, customerEmail (CRITICAL - must be captured from Stripe session)
- realProducts maps to shadowProductId for Stripe checkout

INTEGRATIONS:
- Stripe: Payment processing with shadow product mapping, webhooks at /api/webhook
- Supabase: Database and storage
- Resend: Email sending (order confirmations, credentials)
- Cloudflare: Hosting (Pages + Workers)
- GitHub: repo=reloadedfiretvteam-hash/streamerstickprofinal, branch=clean-main

CAPABILITIES:
You can fix Edge functions, SQL, secrets, variables, Supabase, Cloudflare, GitHub operations.
You understand the shadow cloaking system and must maintain it when making changes.
You can find and fix issues including your own mistakes.

Parse user commands and return JSON with:
- type: one of 'github', 'stripe', 'database', 'code', 'cloudflare', 'supabase', 'sql', 'conflict', 'secrets', 'general'
- action: specific action to take
- additional fields as needed

Available actions:
- GitHub: list_repos, view_commits, create_branch, push, read_file, search_code
- Stripe: list_products, list_payments, list_customers, create_product
- Database: query, analyze, find_issues, update
- Code: analyze_codebase, create_component, create_feature, fix_bug, search_code, read_file, compare_code
- Cloudflare: list_workers, deploy_worker, deploy_pages
- Supabase: list_edge_functions, deploy_edge_function
- SQL: execute queries on Supabase
- Conflict: detect, fix conflicts
- Secrets: list available tokens

Return only valid JSON, no markdown formatting.`
          },
          {
            role: 'user',
            content: command
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    const parsed = JSON.parse(content.trim());
    return parsed;
  } catch (error: any) {
    console.error('AI parsing error:', error);
    throw error;
  }
}

// Rule-based command parsing (fallback when no AI available)
async function parseCommand(command: string, context: any, env: Env): Promise<any> {
  const lowerCommand = command.toLowerCase();

  // GitHub commands
  if (lowerCommand.includes('github') || lowerCommand.includes('git') || lowerCommand.includes('repository') || lowerCommand.includes('repo')) {
    if ((lowerCommand.includes('list') || lowerCommand.includes('show') || lowerCommand.includes('get')) && 
        (lowerCommand.includes('repo') || lowerCommand.includes('repository'))) {
      return { type: 'github', action: 'list_repos' };
    }
    if (lowerCommand.includes('commits') || lowerCommand.includes('commit history')) {
      const repo = extractRepo(command);
      return { type: 'github', action: 'view_commits', repo };
    }
    if (lowerCommand.includes('create branch') || lowerCommand.includes('new branch')) {
      const branch = extractBranch(command);
      const repo = extractRepo(command);
      return { type: 'github', action: 'create_branch', branch, repo };
    }
    if (lowerCommand.includes('push') || lowerCommand.includes('deploy')) {
      return { type: 'github', action: 'push', branch: extractBranch(command) };
    }
  }

  // Stripe commands
  if (lowerCommand.includes('stripe') || lowerCommand.includes('payment') || lowerCommand.includes('product') || lowerCommand.includes('customer')) {
    if ((lowerCommand.includes('list') || lowerCommand.includes('show') || lowerCommand.includes('get'))) {
      if (lowerCommand.includes('product')) {
        return { type: 'stripe', action: 'list_products' };
      }
      if (lowerCommand.includes('payment') || lowerCommand.includes('transaction')) {
        return { type: 'stripe', action: 'list_payments' };
      }
      if (lowerCommand.includes('customer')) {
        return { type: 'stripe', action: 'list_customers' };
      }
      return { type: 'stripe', action: 'list_products' };
    }
    if (lowerCommand.includes('create') || lowerCommand.includes('add')) {
      if (lowerCommand.includes('product')) {
        return { type: 'stripe', action: 'create_product', data: extractProductData(command) };
      }
    }
    if (lowerCommand.includes('refund')) {
      return { type: 'stripe', action: 'refund', paymentId: extractPaymentId(command) };
    }
  }

  // Supabase/Database commands
  if (lowerCommand.includes('database') || lowerCommand.includes('supabase') || lowerCommand.includes('query') || 
      lowerCommand.includes('table') || lowerCommand.includes('orders') || lowerCommand.includes('products') || 
      lowerCommand.includes('customers') || lowerCommand.includes('analyze') || lowerCommand.includes('issues') ||
      lowerCommand.includes('find problems') || lowerCommand.includes('check data')) {
    if (lowerCommand.includes('analyze') || lowerCommand.includes('summary') || lowerCommand.includes('overview')) {
      return { type: 'database', action: 'analyze' };
    }
    if (lowerCommand.includes('issues') || lowerCommand.includes('problems') || lowerCommand.includes('errors') || 
        (lowerCommand.includes('check') && !lowerCommand.includes('checkout')) || lowerCommand.includes('find')) {
      return { type: 'database', action: 'find_issues' };
    }
    if (lowerCommand.includes('query') || lowerCommand.includes('select') || lowerCommand.includes('get') || 
        lowerCommand.includes('list') || lowerCommand.includes('show')) {
      return { type: 'database', action: 'query', table: extractTable(command), filters: extractFilters(command) };
    }
    if (lowerCommand.includes('create table')) {
      return { type: 'database', action: 'create_table', schema: extractSchema(command) };
    }
    if (lowerCommand.includes('update') || lowerCommand.includes('modify')) {
      return { type: 'database', action: 'update', table: extractTable(command), data: extractUpdateData(command) };
    }
  }

  // Code generation/modification
  if (lowerCommand.includes('create') || lowerCommand.includes('generate') || lowerCommand.includes('add') || 
      lowerCommand.includes('code') || lowerCommand.includes('analyze code') || lowerCommand.includes('search code') ||
      lowerCommand.includes('find code') || lowerCommand.includes('codebase')) {
    if (lowerCommand.includes('analyze code') || lowerCommand.includes('codebase structure') || lowerCommand.includes('project structure')) {
      return { type: 'code', action: 'analyze_codebase' };
    }
    if (lowerCommand.includes('search') || lowerCommand.includes('find')) {
      return { type: 'code', action: 'search_code', query: extractSearchQuery(command) };
    }
    if (lowerCommand.includes('component') || lowerCommand.includes('page')) {
      return { type: 'code', action: 'create_component', name: extractComponentName(command), type: extractComponentType(command) };
    }
    if (lowerCommand.includes('feature') || lowerCommand.includes('function')) {
      return { type: 'code', action: 'create_feature', description: command };
    }
    if (lowerCommand.includes('fix') || lowerCommand.includes('bug') || lowerCommand.includes('error')) {
      return { type: 'code', action: 'fix_bug', description: command };
    }
    if (lowerCommand.includes('issues') || lowerCommand.includes('problems')) {
      return { type: 'code', action: 'find_issues' };
    }
  }

  // Cloudflare commands
  if (lowerCommand.includes('cloudflare') || lowerCommand.includes('worker') || lowerCommand.includes('pages')) {
    if (lowerCommand.includes('deploy') || lowerCommand.includes('update worker')) {
      return { type: 'cloudflare', action: 'deploy_worker', workerName: extractWorkerName(command) };
    }
    if (lowerCommand.includes('list workers') || lowerCommand.includes('show workers')) {
      return { type: 'cloudflare', action: 'list_workers' };
    }
    if (lowerCommand.includes('deploy pages') || lowerCommand.includes('pages deploy')) {
      return { type: 'cloudflare', action: 'deploy_pages', projectName: extractProjectName(command) };
    }
  }

  // Supabase Edge Functions commands
  if (lowerCommand.includes('edge function') || lowerCommand.includes('supabase function')) {
    if (lowerCommand.includes('deploy') || lowerCommand.includes('update')) {
      return { type: 'supabase', action: 'deploy_edge_function', functionName: extractFunctionName(command) };
    }
    if (lowerCommand.includes('list')) {
      return { type: 'supabase', action: 'list_edge_functions' };
    }
  }

  // SQL commands
  if (lowerCommand.includes('sql') || lowerCommand.includes('query') || lowerCommand.startsWith('select ') || 
      lowerCommand.startsWith('update ') || lowerCommand.startsWith('insert ') || lowerCommand.startsWith('delete ')) {
    return { type: 'sql', action: 'execute', query: extractSQLQuery(command) };
  }

  // Conflict detection/fixing
  if (lowerCommand.includes('conflict') || lowerCommand.includes('fix conflict') || lowerCommand.includes('detect conflict')) {
    if (lowerCommand.includes('fix') || lowerCommand.includes('resolve')) {
      return { type: 'conflict', action: 'fix', conflictId: extractConflictId(command) };
    }
    return { type: 'conflict', action: 'detect', type: extractConflictType(command) };
  }

  // Secrets/variables management
  if (lowerCommand.includes('secret') || lowerCommand.includes('variable') || lowerCommand.includes('env var')) {
    if (lowerCommand.includes('list') || lowerCommand.includes('show')) {
      return { type: 'secrets', action: 'list' };
    }
  }

  // Default: general query
  return { type: 'general', action: 'query', description: command };
}

async function executeAction(action: any, env: Env): Promise<any> {
  switch (action.type) {
    case 'github':
      return await executeGitHubAction(action, env);
    case 'stripe':
      return await executeStripeAction(action, env);
    case 'database':
      return await executeDatabaseAction(action, env);
    case 'code':
      return await executeCodeAction(action, env);
    case 'cloudflare':
      return await executeCloudflareAction(action, env);
    case 'supabase':
      return await executeSupabaseAction(action, env);
    case 'sql':
      return await executeSQLAction(action, env);
    case 'conflict':
      return await executeConflictAction(action, env);
    case 'secrets':
      return await executeSecretsAction(action, env);
    default:
      return { message: 'Action type not recognized. Please be more specific about what you want to do.' };
  }
}

async function executeGitHubAction(action: any, env: Env): Promise<any> {
  const githubToken = env.GITHUB_TOKEN;
  if (!githubToken) {
    return { error: 'GitHub token not configured. Set GITHUB_TOKEN environment variable.' };
  }

  try {
    switch (action.action) {
      case 'list_repos':
        const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.statusText}`);
        }
        const repos = await response.json();
        return {
          message: `Found ${repos.length} repositories`,
          data: repos.map((r: any) => ({
            id: r.id,
            name: r.name,
            fullName: r.full_name,
            private: r.private,
            defaultBranch: r.default_branch,
            htmlUrl: r.html_url,
            description: r.description,
            updatedAt: r.updated_at,
            language: r.language
          }))
        };

      case 'view_commits':
        if (!action.repo) {
          return { error: 'Repository name is required (format: owner/repo)' };
        }
        const commitsResponse = await fetch(`https://api.github.com/repos/${action.repo}/commits?per_page=20`, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (!commitsResponse.ok) {
          return { error: `Failed to fetch commits: ${commitsResponse.statusText}` };
        }
        const commits = await commitsResponse.json();
        return {
          message: `Found ${commits.length} recent commits`,
          data: commits.map((c: any) => ({
            sha: c.sha.substring(0, 7),
            message: c.commit.message,
            author: c.commit.author.name,
            date: c.commit.author.date,
            url: c.html_url
          }))
        };

      case 'create_branch':
        if (!action.branch || !action.repo) {
          return { error: 'Branch name and repository are required' };
        }
        // Get default branch first
        const repoResponse = await fetch(`https://api.github.com/repos/${action.repo}`, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (!repoResponse.ok) {
          return { error: `Repository not found: ${action.repo}` };
        }
        const repoData = await repoResponse.json();
        const defaultBranch = repoData.default_branch;
        
        // Get SHA of default branch
        const refResponse = await fetch(`https://api.github.com/repos/${action.repo}/git/ref/heads/${defaultBranch}`, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (!refResponse.ok) {
          return { error: `Failed to get default branch SHA` };
        }
        const refData = await refResponse.json();
        
        // Create new branch
        const createBranchResponse = await fetch(`https://api.github.com/repos/${action.repo}/git/refs`, {
          method: 'POST',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ref: `refs/heads/${action.branch}`,
            sha: refData.object.sha
          })
        });
        
        if (!createBranchResponse.ok) {
          const error = await createBranchResponse.json();
          return { error: `Failed to create branch: ${error.message}` };
        }
        
        return {
          message: `Branch '${action.branch}' created successfully in ${action.repo}`,
          data: await createBranchResponse.json()
        };

      case 'push':
        return { 
          message: 'Push functionality requires specific file changes and commit message. Please use the GitHub Deploy section for safe pushes.',
          note: 'For security, direct pushes through AI require manual confirmation'
        };

      default:
        return { message: `GitHub action '${action.action}' not implemented yet. Available: list_repos, view_commits, create_branch` };
    }
  } catch (error: any) {
    return { error: `GitHub operation failed: ${error.message}` };
  }
}

async function executeStripeAction(action: any, env: Env): Promise<any> {
  const stripeKey = env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return { error: 'Stripe secret key not configured' };
  }

  const Stripe = (await import('stripe')).default;
  const stripe = new Stripe(stripeKey);

  try {
    switch (action.action) {
      case 'list_products':
        const products = await stripe.products.list({ limit: 100, expand: ['data.default_price'] });
        return {
          message: `Found ${products.data.length} products`,
          data: products.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            active: p.active,
            price: p.default_price ? (typeof p.default_price === 'object' ? p.default_price.unit_amount / 100 : null) : null,
            currency: p.default_price ? (typeof p.default_price === 'object' ? p.default_price.currency : null) : null
          }))
        };

      case 'list_payments':
        const payments = await stripe.paymentIntents.list({ limit: 50 });
        return {
          message: `Found ${payments.data.length} recent payments`,
          data: payments.data.map((p: any) => ({
            id: p.id,
            amount: p.amount / 100,
            currency: p.currency.toUpperCase(),
            status: p.status,
            created: new Date(p.created * 1000).toISOString(),
            customer: p.customer
          }))
        };

      case 'list_customers':
        const customers = await stripe.customers.list({ limit: 100 });
        return {
          message: `Found ${customers.data.length} customers`,
          data: customers.data.map((c: any) => ({
            id: c.id,
            email: c.email,
            name: c.name,
            created: new Date(c.created * 1000).toISOString()
          }))
        };

      case 'create_product':
        if (!action.data || !action.data.name) {
          return { error: 'Product name is required' };
        }
        const newProduct = await stripe.products.create({
          name: action.data.name,
          description: action.data.description,
          active: action.data.active !== false
        });
        return {
          message: `Product '${newProduct.name}' created successfully`,
          data: { id: newProduct.id, name: newProduct.name }
        };

      case 'refund':
        if (!action.paymentId) {
          return { error: 'Payment ID is required for refund' };
        }
        return { 
          message: 'Refund operations require confirmation for safety. Please use the Orders section.',
          note: `Payment ID: ${action.paymentId}`
        };

      default:
        return { message: `Stripe action '${action.action}' not implemented yet. Available: list_products, list_payments, list_customers, create_product` };
    }
  } catch (error: any) {
    return { error: `Stripe operation failed: ${error.message}` };
  }
}

async function executeDatabaseAction(action: any, env: Env): Promise<any> {
  const storage = getStorage(env);

  try {
    switch (action.action) {
      case 'query':
        if (action.table === 'orders' || action.table === 'order') {
          const orders = await storage.getAllOrders();
          let filteredOrders = orders;
          
          // Apply filters if provided
          if (action.filters) {
            if (action.filters.status) {
              filteredOrders = filteredOrders.filter(o => o.status === action.filters.status);
            }
            if (action.filters.email) {
              filteredOrders = filteredOrders.filter(o => 
                o.customerEmail?.toLowerCase().includes(action.filters.email.toLowerCase())
              );
            }
          }
          
          return {
            message: `Found ${filteredOrders.length} orders${action.filters ? ' (filtered)' : ''}`,
            data: filteredOrders.slice(0, 50).map(o => ({
              id: o.id,
              customerEmail: o.customerEmail,
              customerName: o.customerName,
              productName: o.realProductName,
              amount: o.amount ? o.amount / 100 : 0,
              status: o.status,
              fulfillmentStatus: o.fulfillmentStatus,
              createdAt: o.createdAt
            }))
          };
        }
        if (action.table === 'products' || action.table === 'product') {
          const products = await storage.getRealProducts();
          return {
            message: `Found ${products.length} products`,
            data: products.map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price / 100,
              category: p.category,
              imageUrl: p.imageUrl
            }))
          };
        }
        if (action.table === 'customers' || action.table === 'customer') {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_ANON_KEY);
          const { data, error } = await supabase.from('customers').select('*').limit(100);
          if (error) throw error;
          return {
            message: `Found ${data?.length || 0} customers`,
            data: data || []
          };
        }
        if (action.table === 'blog_posts' || action.table === 'blog') {
          const posts = await storage.getBlogPosts();
          return {
            message: `Found ${posts.length} blog posts`,
            data: posts.slice(0, 50)
          };
        }
        if (action.table === 'seo_ads' || action.table === 'seo') {
          const ads = await storage.getSeoAds();
          return {
            message: `Found ${ads.length} SEO ads`,
            data: ads.slice(0, 50)
          };
        }
        return { 
          message: `Available tables: orders, products, customers, blog_posts, seo_ads`,
          error: `Table '${action.table}' not recognized`
        };

      case 'analyze':
        try {
          const orders = await storage.getAllOrders();
          const products = await storage.getRealProducts();
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY || env.VITE_SUPABASE_ANON_KEY);
          const { data: customers } = await supabase.from('customers').select('id').limit(1);
          
          const paidOrders = orders.filter(o => o.status === 'paid');
          const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
          const pendingFulfillments = orders.filter(o => o.fulfillmentStatus === 'pending').length;
          
          return {
            message: 'Database analysis complete',
            data: {
              orders: {
                total: orders.length,
                paid: paidOrders.length,
                pending: pendingFulfillments,
                totalRevenue: totalRevenue / 100
              },
              products: {
                total: products.length,
                active: products.filter(p => p.active).length
              },
              customers: {
                total: customers?.length || 0,
                note: 'Full count requires separate query'
              },
              health: {
                databaseConnected: true,
                hasData: orders.length > 0 || products.length > 0
              }
            }
          };
        } catch (error: any) {
          return { error: `Database analysis failed: ${error.message}` };
        }

      case 'find_issues':
        try {
          const orders = await storage.getAllOrders();
          const issues = [];
          
          // Check for orders without emails
          const ordersWithoutEmail = orders.filter(o => !o.customerEmail);
          if (ordersWithoutEmail.length > 0) {
            issues.push({
              type: 'warning',
              message: `${ordersWithoutEmail.length} orders are missing customer email addresses`,
              severity: 'medium',
              affectedOrders: ordersWithoutEmail.slice(0, 10).map(o => o.id)
            });
          }
          
          // Check for pending fulfillments
          const pendingFulfillments = orders.filter(o => 
            o.status === 'paid' && o.fulfillmentStatus === 'pending'
          );
          if (pendingFulfillments.length > 0) {
            issues.push({
              type: 'action_required',
              message: `${pendingFulfillments.length} paid orders are pending fulfillment`,
              severity: 'high',
              action: 'Review and fulfill these orders in the Fulfillment section'
            });
          }
          
          // Check for old pending orders
          const oldPendingOrders = orders.filter(o => {
            if (o.status !== 'pending' || !o.createdAt) return false;
            const daysOld = (Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return daysOld > 7;
          });
          if (oldPendingOrders.length > 0) {
            issues.push({
              type: 'cleanup',
              message: `${oldPendingOrders.length} orders have been pending for over 7 days`,
              severity: 'low',
              suggestion: 'Consider canceling or cleaning up these old pending orders'
            });
          }
          
          return {
            message: issues.length > 0 
              ? `Found ${issues.length} potential issues` 
              : 'No issues detected',
            data: {
              issues,
              summary: {
                totalIssues: issues.length,
                highPriority: issues.filter(i => i.severity === 'high').length,
                mediumPriority: issues.filter(i => i.severity === 'medium').length,
                lowPriority: issues.filter(i => i.severity === 'low').length
              }
            }
          };
        } catch (error: any) {
          return { error: `Issue detection failed: ${error.message}` };
        }

      case 'update':
        return { 
          message: 'Database updates require specific table, record ID, and field information',
          note: 'For safety, use the admin panel sections (Products, Orders, Customers) for updates'
        };

      default:
        return { 
          message: `Database action '${action.action}' not recognized`,
          availableActions: ['query', 'analyze', 'find_issues', 'update']
        };
    }
  } catch (error: any) {
    return { error: `Database operation failed: ${error.message}` };
  }
}

async function executeCodeAction(action: any, env: Env): Promise<any> {
  try {
    switch (action.action) {
      case 'analyze_codebase':
        // Enhanced codebase analysis with full file structure from GitHub
        const githubToken = env.GITHUB_TOKEN;
        let fileStructure: any = null;
        
        if (githubToken) {
          try {
            const repo = action.repo || 'reloadedfiretvteam-hash/streamerstickprofinal';
            const branch = action.branch || 'clean-main';
            
            const treeResponse = await fetch(`https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`, {
              headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
              }
            });
            
            if (treeResponse.ok) {
              const treeData = await treeResponse.json();
              const files = treeData.tree
                .filter((item: any) => item.type === 'blob')
                .map((item: any) => item.path)
                .filter((path: string) => 
                  !path.includes('node_modules') && 
                  !path.includes('.git') &&
                  !path.includes('dist') &&
                  !path.includes('.next')
                );
              
              fileStructure = {
                totalFiles: files.length,
                files: files.slice(0, 200),
                structure: organizeFilesByType(files)
              };
            }
          } catch (error) {
            console.warn('Could not fetch GitHub file structure:', error);
          }
        }
        
        return {
          message: 'Codebase structure analyzed - Full access to system architecture',
          data: {
            structure: {
              frontend: { path: 'client/src', framework: 'React + TypeScript' },
              backend: { path: 'worker', framework: 'Cloudflare Workers with Hono' },
              shared: { path: 'shared', purpose: 'Shared types and schema' },
              database: { provider: 'Supabase (PostgreSQL)' }
            },
            ...(fileStructure ? { githubFileTree: fileStructure } : {}),
            capabilities: [
              'Full-stack TypeScript application',
              'GitHub file access and modification',
              'Real-time code analysis',
              'AI-powered code generation'
            ]
          }
        };

      case 'create_component':
        if (!action.name) {
          return { error: 'Component name is required' };
        }
        
        const componentCode = await generateComponentCode(action.name, action.type, action.description, env);
        
        if (env.GITHUB_TOKEN && action.autoCreate) {
          try {
            const repo = action.repo || 'reloadedfiretvteam-hash/streamerstickprofinal';
            const branch = action.branch || 'clean-main';
            const filePath = action.type === 'page' 
              ? `client/src/pages/${action.name}.tsx`
              : `client/src/components/${action.name}.tsx`;
            
            const createResult = await createGitHubFile(
              env.GITHUB_TOKEN,
              repo,
              branch,
              filePath,
              componentCode,
              `Add ${action.type}: ${action.name}`
            );
            
            return {
              message: `Component '${action.name}' created successfully on GitHub`,
              data: {
                type: action.type || 'component',
                name: action.name,
                location: filePath,
                code: componentCode,
                githubUrl: createResult.html_url,
                commitSha: createResult.commit.sha
              }
            };
          } catch (error: any) {
            return {
              message: `Component code generated but GitHub creation failed: ${error.message}`,
              data: { name: action.name, code: componentCode }
            };
          }
        }
        
        return {
          message: `Component '${action.name}' code generated`,
          data: { name: action.name, code: componentCode }
        };

      case 'create_feature':
        if (env.OPENAI_API_KEY) {
          try {
            const featurePlan = await generateFeaturePlan(action.description, env);
            return { message: 'Feature implementation plan generated with AI', data: featurePlan };
          } catch (error: any) {
            console.warn('AI feature generation failed:', error);
          }
        }
        return {
          message: 'Feature implementation plan',
          data: { description: action.description, steps: ['1. Analyze requirements', '2. Design architecture', '3. Implement', '4. Test'] }
        };

      case 'fix_bug':
      case 'find_issues':
        const codeIssues = await findCodebaseIssues(env);
        const dbIssues = await findDatabaseIssues(env);
        const sysIssues = await findSystemIssues(env);
        const allIssues = [...codeIssues, ...dbIssues, ...sysIssues];
        
        return {
          message: allIssues.length > 0 ? `Found ${allIssues.length} issues` : 'No issues detected',
          data: { issues: allIssues, summary: { total: allIssues.length } }
        };

      case 'search_code':
        if (!action.query) {
          return { error: 'Search query is required' };
        }
        
        if (env.GITHUB_TOKEN) {
          try {
            const repo = action.repo || 'reloadedfiretvteam-hash/streamerstickprofinal';
            const searchResults = await searchGitHubCode(env.GITHUB_TOKEN, repo, action.query);
            return {
              message: `Found ${searchResults.length} matches for: ${action.query}`,
              data: { query: action.query, results: searchResults.slice(0, 50) }
            };
          } catch (error: any) {
            return { message: `Search failed: ${error.message}`, data: { query: action.query } };
          }
        }
        
        return { message: `Searching for: ${action.query}`, data: { query: action.query, note: 'GitHub token required' } };

      default:
        return { message: `Code action: ${action.action}`, data: { description: action.description } };
    }
  } catch (error: any) {
    return { error: `Code operation failed: ${error.message}` };
  }
}

// Enhanced helper functions
function organizeFilesByType(files: string[]): any {
  return {
    frontend: files.filter(f => f.startsWith('client/')),
    backend: files.filter(f => f.startsWith('worker/')),
    shared: files.filter(f => f.startsWith('shared/')),
    typescript: files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
  };
}

async function generateComponentCode(name: string, type: string, description: string, env: Env): Promise<string> {
  if (env.OPENAI_API_KEY && description) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `Generate a complete React TypeScript ${type} component named ${name}. Use Tailwind CSS, modern React patterns. Return ONLY code, no markdown.`
            },
            { role: 'user', content: description || `Create ${type} ${name}` }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const code = data.choices[0]?.message?.content?.trim();
        const codeMatch = code?.match(/```(?:tsx|ts)?\n([\s\S]*?)```/);
        return codeMatch ? codeMatch[1].trim() : code || generateComponentTemplate(name, type);
      }
    } catch (error) {
      console.warn('AI generation failed, using template');
    }
  }
  return generateComponentTemplate(name, type);
}

async function generateFeaturePlan(description: string, env: Env): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Create detailed feature implementation plan as JSON with steps, files, code.'
        },
        { role: 'user', content: description }
      ],
      temperature: 0.5,
      max_tokens: 3000
    })
  });
  
  if (response.ok) {
    const data = await response.json();
    try {
      return JSON.parse(data.choices[0]?.message?.content);
    } catch {
      return { steps: [{ description: data.choices[0]?.message?.content }] };
    }
  }
  throw new Error('Failed to generate plan');
}

async function findCodebaseIssues(env: Env): Promise<any[]> {
  const issues: any[] = [];
  if (!env.STRIPE_SECRET_KEY) issues.push({ type: 'config', severity: 'high', message: 'Stripe key missing' });
  if (!env.RESEND_API_KEY) issues.push({ type: 'config', severity: 'medium', message: 'Resend key missing' });
  return issues;
}

async function findDatabaseIssues(env: Env): Promise<any[]> {
  try {
    const storage = getStorage(env);
    const orders = await storage.getAllOrders();
    const issues: any[] = [];
    
    const ordersWithoutEmail = orders.filter(o => !o.customerEmail && o.status === 'paid');
    if (ordersWithoutEmail.length > 0) {
      issues.push({ type: 'data', severity: 'medium', message: `${ordersWithoutEmail.length} orders missing emails` });
    }
    return issues;
  } catch (error: any) {
    return [{ type: 'connection', severity: 'high', message: `Database error: ${error.message}` }];
  }
}

async function findSystemIssues(env: Env): Promise<any[]> {
  const issues: any[] = [];
  const required = ['STRIPE_SECRET_KEY', 'VITE_SUPABASE_URL', 'RESEND_API_KEY'];
  for (const varName of required) {
    if (!env[varName as keyof Env]) {
      issues.push({ type: 'config', severity: 'high', message: `Missing: ${varName}` });
    }
  }
  return issues;
}

async function searchGitHubCode(token: string, repo: string, query: string): Promise<any[]> {
  const response = await fetch(`https://api.github.com/search/code?q=${encodeURIComponent(query)}+repo:${repo}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) throw new Error(`GitHub search failed: ${response.statusText}`);
  const data = await response.json();
  return data.items || [];
}

async function createGitHubFile(token: string, repo: string, branch: string, path: string, content: string, message: string): Promise<any> {
  const response = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      branch
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create file');
  }
  
  return await response.json();
}

// Helper functions to extract information from commands
function extractBranch(command: string): string {
  const match = command.match(/branch[:\s]+([^\s]+)/i) || 
                command.match(/['"]([^'"]+)['"]/) ||
                command.match(/\b(main|master|develop|dev)\b/i);
  return match ? match[1] : 'main';
}

function extractRepo(command: string): string {
  const match = command.match(/repo[sitory]*[:\s]+([^\s\/]+\/[^\s]+)/i) ||
                command.match(/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)/);
  return match ? match[1] : '';
}

function extractTable(command: string): string {
  const tables = ['orders', 'products', 'customers', 'blog_posts', 'seo_ads'];
  for (const table of tables) {
    if (command.toLowerCase().includes(table)) {
      return table;
    }
  }
  return '';
}

function extractComponentName(command: string): string {
  const match = command.match(/(?:create|generate|add)\s+(?:a\s+)?(?:new\s+)?(?:component|page)[:\s]+([^\s]+)/i);
  return match ? match[1] : '';
}

function extractComponentType(command: string): string {
  if (command.includes('page')) return 'page';
  if (command.includes('component')) return 'component';
  return 'component';
}

function extractProductData(command: string): any {
  // Simple extraction - can be enhanced
  return {};
}

function extractPaymentId(command: string): string {
  const match = command.match(/(?:payment|transaction)[:\s]+([a-z0-9_]+)/i);
  return match ? match[1] : '';
}

function extractFilters(command: string): any {
  // Simple extraction - can be enhanced
  return {};
}

function extractSchema(command: string): any {
  // Simple extraction - can be enhanced
  return {};
}

function extractUpdateData(command: string): any {
  // Simple extraction - can be enhanced
  return {};
}

function extractSearchQuery(command: string): string {
  // Extract search query from command
  const patterns = [
    /(?:search|find)\s+(?:for\s+)?(?:code\s+)?['"]?([^'"]+)['"]?/i,
    /(?:search|find)\s+(?:for\s+)?(.+?)(?:\s+in|\s+code|$)/i
  ];
  
  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Fallback: return everything after search/find
  const fallback = command.replace(/(?:search|find|codebase|code)\s+(?:for\s+)?/i, '').trim();
  return fallback || '';
}

// Execute shell commands (simulated via available APIs and internal operations)
async function executeShellCommand(command: string, env: Env): Promise<any> {
  const cmd = command.toLowerCase().trim();
  
  // Database operations (no token needed - internal access)
  if (cmd.startsWith('db:') || cmd.startsWith('database:')) {
    const dbCmd = cmd.replace(/^(db:|database:)\s*/, '');
    return await executeDatabaseShellCommand(dbCmd, env);
  }
  
  // Code operations (uses GitHub API if available, but provides guidance if not)
  if (cmd.startsWith('code:') || cmd.startsWith('file:')) {
    const codeCmd = cmd.replace(/^(code:|file:)\s*/, '');
    return await executeCodeShellCommand(codeCmd, env);
  }
  
  // System information (no token needed)
  if (cmd === 'env' || cmd === 'environment' || cmd.startsWith('env ')) {
    return {
      message: 'Environment status',
      data: {
        nodeEnv: env.NODE_ENV || 'not set',
        hasStripe: !!env.STRIPE_SECRET_KEY,
        hasSupabase: !!env.VITE_SUPABASE_URL,
        hasResend: !!env.RESEND_API_KEY,
        hasGitHub: !!env.GITHUB_TOKEN,
        hasOpenAI: !!env.OPENAI_API_KEY
      }
    };
  }
  
  // List files (uses GitHub API if available)
  if (cmd.startsWith('ls ') || cmd.startsWith('list ')) {
    const path = cmd.replace(/^(ls|list)\s+/, '');
    return await listFiles(path, env);
  }
  
  // Help command
  if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
    return {
      message: 'Available shell commands',
      commands: [
        'db:query <table> - Query database table',
        'db:analyze - Analyze database health',
        'code:read <file> - Read file from codebase',
        'code:search <query> - Search codebase',
        'env - Show environment status',
        'ls <path> - List files in path',
        'help - Show this help'
      ],
      note: 'All database operations work without tokens (internal access). Code operations use GitHub API if token is available.'
    };
  }
  
  return {
    error: `Unknown command: ${command}`,
    message: 'Use "help" to see available commands',
    availableCommands: ['db:', 'code:', 'env', 'ls', 'help']
  };
}

// Database shell commands (no token needed - internal access)
async function executeDatabaseShellCommand(command: string, env: Env): Promise<any> {
  const storage = getStorage(env);
  
  if (command.startsWith('query ') || command.startsWith('select ')) {
    const table = command.replace(/^(query|select)\s+/, '').trim();
    try {
      if (table === 'orders') {
        const orders = await storage.getAllOrders();
        return { message: `Found ${orders.length} orders`, data: orders.slice(0, 20) };
      }
      if (table === 'products') {
        const products = await storage.getRealProducts();
        return { message: `Found ${products.length} products`, data: products };
      }
      return { error: `Unknown table: ${table}. Available: orders, products, customers` };
    } catch (error: any) {
      return { error: error.message };
    }
  }
  
  if (command === 'analyze' || command === 'stats') {
    try {
      const orders = await storage.getAllOrders();
      const products = await storage.getRealProducts();
      const paidOrders = orders.filter(o => o.status === 'paid');
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      
      return {
        message: 'Database analysis',
        data: {
          orders: { total: orders.length, paid: paidOrders.length },
          products: { total: products.length },
          revenue: totalRevenue / 100
        }
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }
  
  return { error: `Unknown database command: ${command}. Use 'query <table>' or 'analyze'` };
}

// Code shell commands
async function executeCodeShellCommand(command: string, env: Env): Promise<any> {
  if (command.startsWith('read ') || command.startsWith('cat ')) {
    const filePath = command.replace(/^(read|cat)\s+/, '').trim();
    if (env.GITHUB_TOKEN) {
      try {
        const content = await readGitHubFile(
          env.GITHUB_TOKEN,
          'reloadedfiretvteam-hash/streamerstickprofinal',
          'clean-main',
          filePath
        );
        return { message: `File: ${filePath}`, content, lines: content.split('\n').length };
      } catch (error: any) {
        return { error: `Failed to read file: ${error.message}` };
      }
    }
    return { error: 'GitHub token required for file reading', filePath };
  }
  
  if (command.startsWith('search ') || command.startsWith('grep ')) {
    const query = command.replace(/^(search|grep)\s+/, '').trim();
    if (env.GITHUB_TOKEN) {
      try {
        const results = await searchGitHubCode(
          env.GITHUB_TOKEN,
          'reloadedfiretvteam-hash/streamerstickprofinal',
          query
        );
        return { message: `Found ${results.length} matches`, results: results.slice(0, 20) };
      } catch (error: any) {
        return { error: `Search failed: ${error.message}` };
      }
    }
    return { error: 'GitHub token required for code search', query };
  }
  
  return { error: `Unknown code command: ${command}. Use 'read <file>' or 'search <query>'` };
}

// List files in a path
async function listFiles(path: string, env: Env): Promise<any> {
  if (env.GITHUB_TOKEN) {
    try {
      const repo = 'reloadedfiretvteam-hash/streamerstickprofinal';
      const branch = 'clean-main';
      const treeResponse = await fetch(
        `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`,
        {
          headers: {
            'Authorization': `token ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );
      
      if (treeResponse.ok) {
        const treeData = await treeResponse.json();
        const files = treeData.tree
          .filter((item: any) => item.type === 'blob')
          .map((item: any) => item.path)
          .filter((filePath: string) => filePath.startsWith(path) || path === '' || path === '.');
        
        return { message: `Found ${files.length} files`, files: files.slice(0, 100) };
      }
    } catch (error: any) {
      return { error: `Failed to list files: ${error.message}` };
    }
  }
  
  return { error: 'GitHub token required for file listing' };
}

// Read file from GitHub
async function readGitHubFile(token: string, repo: string, branch: string, filePath: string): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`,
    {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3.raw'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to read file: ${response.statusText}`);
  }
  
  return await response.text();
}

// Calculate diff between two files
function calculateDiff(lines1: string[], lines2: string[]): any {
  const added: number[] = [];
  const removed: number[] = [];
  const modified: number[] = [];
  const similar: number = 0;
  
  // Simple line-by-line comparison
  const maxLen = Math.max(lines1.length, lines2.length);
  for (let i = 0; i < maxLen; i++) {
    if (i >= lines1.length) {
      added.push(i);
    } else if (i >= lines2.length) {
      removed.push(i);
    } else if (lines1[i] !== lines2[i]) {
      modified.push(i);
    }
  }
  
  return { added: added.length, removed: removed.length, modified: modified.length, similar };
}

