/**
 * PriceSyncManager Component
 * 
 * Admin UI component for managing price synchronization between
 * real_products and square_products tables.
 * 
 * Features:
 * - Displays current price mismatches
 * - Provides "Sync Prices" button to fix discrepancies
 * - Logs sync results with success/error feedback
 * - Integrates with admin dashboard
 */

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, DollarSign, ArrowRight } from 'lucide-react';
import { getPriceMismatches, syncPrices, PriceMismatch, SyncResult } from '../api/syncPrices';

interface PriceSyncManagerProps {
  onSyncComplete?: (result: SyncResult) => void;
}

export default function PriceSyncManager({ onSyncComplete }: PriceSyncManagerProps) {
  const [mismatches, setMismatches] = useState<PriceMismatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Load mismatches on mount
  const loadMismatches = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPriceMismatches();
      setMismatches(result);
    } catch (error) {
      console.error('Error loading mismatches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMismatches();
  }, [loadMismatches]);

  // Handle sync
  const handleSync = async () => {
    if (!apiKey.trim()) {
      setShowApiKeyInput(true);
      return;
    }

    setSyncing(true);
    setLastSyncResult(null);

    try {
      const result = await syncPrices(apiKey, false);
      setLastSyncResult(result);
      
      if (result.success) {
        // Reload mismatches after successful sync
        await loadMismatches();
      }

      onSyncComplete?.(result);
    } catch (error) {
      const errorResult: SyncResult = {
        success: false,
        message: 'Sync failed unexpectedly',
        mismatches: [],
        synced: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
      setLastSyncResult(errorResult);
      onSyncComplete?.(errorResult);
    } finally {
      setSyncing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Price Sync Manager</h3>
            <p className="text-sm text-gray-400">
              Sync prices between products and Square checkout
            </p>
          </div>
        </div>

        <button
          onClick={loadMismatches}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status Summary */}
      <div className={`p-4 rounded-lg mb-6 ${
        mismatches.length === 0 
          ? 'bg-green-500/10 border border-green-500/30' 
          : 'bg-yellow-500/10 border border-yellow-500/30'
      }`}>
        <div className="flex items-center gap-3">
          {mismatches.length === 0 ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">All prices are in sync</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">
                {mismatches.length} price mismatch{mismatches.length !== 1 ? 'es' : ''} detected
              </span>
            </>
          )}
        </div>
      </div>

      {/* API Key Input (shown when needed) */}
      {showApiKeyInput && (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-600">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Admin API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your admin API key"
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
            />
            <button
              onClick={() => setShowApiKeyInput(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Your API key is required to perform price sync operations.
          </p>
        </div>
      )}

      {/* Mismatches List */}
      {mismatches.length > 0 && (
        <div className="mb-6 space-y-3 max-h-64 overflow-y-auto">
          {mismatches.map((mismatch) => (
            <div
              key={mismatch.productId}
              className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
            >
              <div className="flex-1">
                <p className="text-white font-medium">{mismatch.productName}</p>
                <p className="text-xs text-gray-500">SKU: {mismatch.sku || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Square Price</p>
                  <p className="text-red-400 font-medium">{formatPrice(mismatch.squarePrice)}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500" />
                <div className="text-right">
                  <p className="text-xs text-gray-500">Correct Price</p>
                  <p className="text-green-400 font-medium">{formatPrice(mismatch.realPrice)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sync Button */}
      {mismatches.length > 0 && (
        <button
          onClick={handleSync}
          disabled={syncing || loading}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
        >
          {syncing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Syncing Prices...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Sync All Prices
            </>
          )}
        </button>
      )}

      {/* Last Sync Result */}
      {lastSyncResult && (
        <div className={`mt-4 p-4 rounded-lg ${
          lastSyncResult.success 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-red-500/10 border border-red-500/30'
        }`}>
          <div className="flex items-start gap-3">
            {lastSyncResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={lastSyncResult.success ? 'text-green-400' : 'text-red-400'}>
                {lastSyncResult.message}
              </p>
              {lastSyncResult.synced > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  Synced {lastSyncResult.synced} product{lastSyncResult.synced !== 1 ? 's' : ''}
                </p>
              )}
              {lastSyncResult.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {lastSyncResult.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-300">
                      • {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <p className="text-xs text-gray-500 mt-4 text-center">
        Prices are synced from the authoritative product database to Square checkout.
        <br />
        Square API updates are prepared but require manual upload.
      </p>
    </div>
  );
}
