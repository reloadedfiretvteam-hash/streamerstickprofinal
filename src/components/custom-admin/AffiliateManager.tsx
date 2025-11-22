import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Copy, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Affiliate {
  id: string;
  affiliate_code: string;
  affiliate_name: string;
  affiliate_email: string;
  commission_rate: number;
  total_sales: number;
  total_commission: number;
  status: string;
  created_at: string;
}

export default function AffiliateManager() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [newAffiliate, setNewAffiliate] = useState({
    name: '',
    email: '',
    commission_rate: 20
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadAffiliates();
  }, []);

  const loadAffiliates = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAffiliates(data || []);
    } catch (error) {
      console.error('Error loading affiliates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAffiliate = async () => {
    if (!newAffiliate.name || !newAffiliate.email) {
      alert('Please fill in all fields');
      return;
    }

    const code = newAffiliate.name.toLowerCase().replace(/\s+/g, '') + Math.random().toString(36).substr(2, 6);

    try {
      const { error } = await supabase
        .from('affiliates')
        .insert([{
          affiliate_code: code,
          affiliate_name: newAffiliate.name,
          affiliate_email: newAffiliate.email,
          commission_rate: newAffiliate.commission_rate,
          status: 'active'
        }]);

      if (error) throw error;

      setNewAffiliate({ name: '', email: '', commission_rate: 20 });
      loadAffiliates();
      alert('Affiliate created successfully!');
    } catch (error) {
      console.error('Error creating affiliate:', error);
      alert('Failed to create affiliate');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const totalStats = affiliates.reduce((acc, aff) => ({
    sales: acc.sales + (aff.total_sales || 0),
    commission: acc.commission + (aff.total_commission || 0)
  }), { sales: 0, commission: 0 });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Affiliate Program</h1>
        <p className="text-gray-400">Manage referral partners and track commissions</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
          <Users className="w-10 h-10 text-blue-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">{affiliates.length}</div>
          <div className="text-gray-400">Total Affiliates</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
          <TrendingUp className="w-10 h-10 text-green-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">${totalStats.sales.toFixed(2)}</div>
          <div className="text-gray-400">Total Sales Generated</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
          <DollarSign className="w-10 h-10 text-orange-400 mb-3" />
          <div className="text-3xl font-bold text-white mb-1">${totalStats.commission.toFixed(2)}</div>
          <div className="text-gray-400">Total Commissions Owed</div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Add New Affiliate</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            value={newAffiliate.name}
            onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
            placeholder="Affiliate Name"
            className="bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
          <input
            type="email"
            value={newAffiliate.email}
            onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
            placeholder="Email Address"
            className="bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
          <input
            type="number"
            value={newAffiliate.commission_rate}
            onChange={(e) => setNewAffiliate({ ...newAffiliate, commission_rate: parseInt(e.target.value) })}
            placeholder="Commission %"
            className="bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
          <button
            onClick={createAffiliate}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition"
          >
            Create Affiliate
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">All Affiliates</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : affiliates.length === 0 ? (
          <p className="text-gray-400">No affiliates yet</p>
        ) : (
          <div className="space-y-4">
            {affiliates.map((affiliate) => (
              <div key={affiliate.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">{affiliate.affiliate_name}</h3>
                    <p className="text-sm text-gray-400">{affiliate.affiliate_email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    affiliate.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {affiliate.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Affiliate Link:</span>
                      <button
                        onClick={() => copyToClipboard(`https://firestreamplus.com?ref=${affiliate.affiliate_code}`, affiliate.id)}
                        className="text-orange-400 hover:text-orange-300 transition"
                      >
                        {copied === affiliate.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-white font-mono break-all">
                      https://firestreamplus.com?ref={affiliate.affiliate_code}
                    </p>
                  </div>

                  <div className="bg-gray-800 rounded p-3">
                    <div className="text-sm text-gray-400 mb-1">Affiliate Code:</div>
                    <p className="text-white font-bold">{affiliate.affiliate_code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{affiliate.commission_rate}%</div>
                    <div className="text-xs text-gray-400">Commission Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">${(affiliate.total_sales || 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-400">Total Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">${(affiliate.total_commission || 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-400">Commission Owed</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
