/**
 * Payment Logging Utilities
 * 
 * This module provides logging utilities for payment operations including:
 * - Stripe payment events
 * - Supabase payment records
 * - Frontend payment debugging
 */

import { supabase } from '../lib/supabase';

export type PaymentLogLevel = 'debug' | 'info' | 'warning' | 'error';

export interface PaymentLogEntry {
  timestamp: string;
  level: PaymentLogLevel;
  event_type: string;
  payment_method: string;
  message: string;
  data?: Record<string, unknown>;
  is_test_mode?: boolean;
}

// Local storage key for payment logs
const PAYMENT_LOGS_KEY = 'payment_debug_logs';
const MAX_LOCAL_LOGS = 200;

/**
 * Log a payment event
 */
export function logPaymentEvent(
  level: PaymentLogLevel,
  eventType: string,
  paymentMethod: string,
  message: string,
  data?: Record<string, unknown>,
  isTestMode?: boolean
): void {
  const timestamp = new Date().toISOString();
  const prefix = isTestMode ? '[TEST]' : '[LIVE]';
  
  // Console log with appropriate level
  const consoleMsg = `${prefix} [${paymentMethod.toUpperCase()}] ${eventType}: ${message}`;
  switch (level) {
    case 'error':
      console.error(consoleMsg, data || '');
      break;
    case 'warning':
      console.warn(consoleMsg, data || '');
      break;
    case 'debug':
      console.debug(consoleMsg, data || '');
      break;
    default:
      console.log(consoleMsg, data || '');
  }

  // Store in localStorage for debugging
  const logEntry: PaymentLogEntry = {
    timestamp,
    level,
    event_type: eventType,
    payment_method: paymentMethod,
    message,
    data,
    is_test_mode: isTestMode,
  };

  try {
    const logs = getLocalPaymentLogs();
    logs.unshift(logEntry);
    if (logs.length > MAX_LOCAL_LOGS) {
      logs.pop();
    }
    localStorage.setItem(PAYMENT_LOGS_KEY, JSON.stringify(logs));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get local payment logs
 */
export function getLocalPaymentLogs(): PaymentLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(PAYMENT_LOGS_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Clear local payment logs
 */
export function clearLocalPaymentLogs(): void {
  localStorage.removeItem(PAYMENT_LOGS_KEY);
  console.log('[PAYMENT_LOG] Local logs cleared');
}

/**
 * Log Stripe-specific events
 */
export const StripeLogger = {
  paymentCreated: (paymentIntentId: string, amount: number, currency: string, isTest = false) => {
    logPaymentEvent('info', 'payment_created', 'stripe', 
      `Payment intent created: ${paymentIntentId}`,
      { paymentIntentId, amount, currency },
      isTest
    );
  },

  paymentSucceeded: (paymentIntentId: string, amount: number, isTest = false) => {
    logPaymentEvent('info', 'payment_succeeded', 'stripe',
      `Payment succeeded: $${(amount / 100).toFixed(2)}`,
      { paymentIntentId, amount },
      isTest
    );
  },

  paymentFailed: (paymentIntentId: string, error: string, isTest = false) => {
    logPaymentEvent('error', 'payment_failed', 'stripe',
      `Payment failed: ${error}`,
      { paymentIntentId, error },
      isTest
    );
  },

  paymentProcessing: (paymentIntentId: string, isTest = false) => {
    logPaymentEvent('info', 'payment_processing', 'stripe',
      `Payment processing: ${paymentIntentId}`,
      { paymentIntentId },
      isTest
    );
  },

  webhookReceived: (eventType: string, eventId: string, isTest = false) => {
    logPaymentEvent('debug', 'webhook_received', 'stripe',
      `Webhook: ${eventType}`,
      { eventType, eventId },
      isTest
    );
  },

  error: (context: string, error: unknown, isTest = false) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logPaymentEvent('error', 'stripe_error', 'stripe',
      `${context}: ${errorMessage}`,
      { context, error: errorMessage },
      isTest
    );
  },
};

/**
 * Log Bitcoin payment events
 */
export const BitcoinLogger = {
  orderCreated: (orderCode: string, amount: number, btcAmount: number) => {
    logPaymentEvent('info', 'order_created', 'bitcoin',
      `Order created: ${orderCode}`,
      { orderCode, amountUsd: amount, amountBtc: btcAmount }
    );
  },

  paymentDetected: (orderCode: string, txHash: string) => {
    logPaymentEvent('info', 'payment_detected', 'bitcoin',
      `Payment detected for ${orderCode}`,
      { orderCode, transactionHash: txHash }
    );
  },

  paymentConfirmed: (orderCode: string, confirmations: number) => {
    logPaymentEvent('info', 'payment_confirmed', 'bitcoin',
      `Payment confirmed for ${orderCode} (${confirmations} confirmations)`,
      { orderCode, confirmations }
    );
  },

  paymentExpired: (orderCode: string) => {
    logPaymentEvent('warning', 'payment_expired', 'bitcoin',
      `Payment expired for ${orderCode}`,
      { orderCode }
    );
  },

  error: (context: string, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logPaymentEvent('error', 'bitcoin_error', 'bitcoin',
      `${context}: ${errorMessage}`,
      { context, error: errorMessage }
    );
  },
};

/**
 * Log CashApp payment events
 */
export const CashAppLogger = {
  orderCreated: (orderCode: string, amount: number, cashAppTag: string) => {
    logPaymentEvent('info', 'order_created', 'cashapp',
      `Order created: ${orderCode}`,
      { orderCode, amount, cashAppTag }
    );
  },

  paymentConfirmed: (orderCode: string) => {
    logPaymentEvent('info', 'payment_confirmed', 'cashapp',
      `Payment confirmed for ${orderCode}`,
      { orderCode }
    );
  },

  error: (context: string, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logPaymentEvent('error', 'cashapp_error', 'cashapp',
      `${context}: ${errorMessage}`,
      { context, error: errorMessage }
    );
  },
};

/**
 * Supabase operations logger
 */
export const SupabaseLogger = {
  querySuccess: (table: string, operation: string, count?: number) => {
    logPaymentEvent('debug', 'db_query', 'supabase',
      `${operation} on ${table} successful`,
      { table, operation, recordCount: count }
    );
  },

  queryError: (table: string, operation: string, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logPaymentEvent('error', 'db_error', 'supabase',
      `${operation} on ${table} failed: ${errorMessage}`,
      { table, operation, error: errorMessage }
    );
  },

  functionInvoked: (functionName: string) => {
    logPaymentEvent('debug', 'function_invoked', 'supabase',
      `Edge function invoked: ${functionName}`,
      { functionName }
    );
  },

  functionError: (functionName: string, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logPaymentEvent('error', 'function_error', 'supabase',
      `Edge function failed: ${functionName}`,
      { functionName, error: errorMessage }
    );
  },
};

/**
 * Fetch Stripe payment logs from the database (for admin use)
 */
export async function fetchStripePaymentLogs(options?: {
  limit?: number;
  offset?: number;
  isTestMode?: boolean;
  eventType?: string;
  logLevel?: PaymentLogLevel;
  startDate?: string;
  endDate?: string;
}): Promise<{ data: unknown[] | null; error: unknown }> {
  let query = supabase
    .from('stripe_payment_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  if (options?.isTestMode !== undefined) {
    query = query.eq('is_test_mode', options.isTestMode);
  }

  if (options?.eventType) {
    query = query.eq('event_type', options.eventType);
  }

  if (options?.logLevel) {
    query = query.eq('log_level', options.logLevel);
  }

  if (options?.startDate) {
    query = query.gte('created_at', options.startDate);
  }

  if (options?.endDate) {
    query = query.lte('created_at', options.endDate);
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Get payment summary statistics from database
 */
export async function getPaymentSummary(includeTest = false): Promise<{
  totalSuccessful: number;
  totalFailed: number;
  totalAmount: number;
  avgAmount: number;
} | null> {
  const { data, error } = await supabase
    .rpc('get_stripe_payment_summary', {
      p_start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      p_end_date: new Date().toISOString(),
      p_include_test: includeTest,
    });

  if (error || !data?.[0]) {
    console.error('Error fetching payment summary:', error);
    return null;
  }

  return {
    totalSuccessful: data[0].total_successful_payments || 0,
    totalFailed: data[0].total_failed_payments || 0,
    totalAmount: parseFloat(data[0].total_amount) || 0,
    avgAmount: parseFloat(data[0].avg_payment_amount) || 0,
  };
}

/**
 * Export logs for debugging
 */
export function exportLogsToJson(): string {
  const logs = getLocalPaymentLogs();
  return JSON.stringify(logs, null, 2);
}

/**
 * Download logs as a file
 */
export function downloadLogs(): void {
  const logs = exportLogsToJson();
  const blob = new Blob([logs], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payment-logs-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
