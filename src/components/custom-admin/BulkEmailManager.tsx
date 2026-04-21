import { useState, useEffect } from 'react';
import { Mail, Send, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('custom_admin_token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export default function BulkEmailManager() {
  const [contactCount, setContactCount] = useState(0);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'all' | 'customers' | 'trials'>('all');

  useEffect(() => {
    loadContacts();
    loadCampaigns();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await fetch('/api/admin/marketing/contacts?limit=1', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json() as { contacts?: any[]; total?: number };
        setContactCount(data.total ?? data.contacts?.length ?? 0);
      }
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  };

  const loadCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/marketing/campaigns', { headers: getAuthHeader() });
      if (res.ok) {
        const data = await res.json() as { data?: any[] };
        setCampaigns(data.data || []);
      }
    } catch (err) {
      console.error('Error loading campaigns:', err);
    }
  };

  const sendCampaign = async () => {
    if (!campaignName || !subject || !body) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/marketing/send', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          name: campaignName,
          subject,
          body,
          audience,
          testMode: false,
        }),
      });

      const result = await res.json() as { success?: boolean; sent?: number; error?: string; message?: string };

      if (!res.ok) {
        throw new Error(result.error || result.message || 'Failed to send campaign');
      }

      alert(`Campaign sent to ${result.sent ?? 0} recipients!`);

      setCampaignName('');
      setSubject('');
      setBody('');
      loadCampaigns();
    } catch (error: any) {
      console.error('Error sending campaign:', error);
      alert('Error sending campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{contactCount}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Campaigns Sent</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns.filter(c => c.status === 'sent').length}</p>
            </div>
            <Mail className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + (c.total_recipients || c.totalRecipients || 0), 0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Create Campaign Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Send className="w-6 h-6" />
          Create Email Campaign
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Summer Sale 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audience
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Contacts ({contactCount})</option>
              <option value="customers">Paying Customers Only</option>
              <option value="trials">Free Trial Users</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="🔥 50% OFF Fire Sticks - Limited Time!"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Body
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Hi there!\n\nWe have an amazing deal for you...\n\nUse code SAVE20 for 20% off your order!\n\nShop now: https://streamerstickpro.com\n\nBest regards,\nStreamStick Pro Team`}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={sendCampaign}
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Campaign
              </>
            )}
          </button>
        </div>
      </div>

      {/* Campaign History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign History</h2>

        {campaigns.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No campaigns sent yet</p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{campaign.subject}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {campaign.total_recipients ?? campaign.totalRecipients ?? 0} recipients
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(campaign.sent_at || campaign.sentAt || campaign.created_at || campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    campaign.status === 'sent'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {campaign.status}
                    </div>
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
