import { useState, useEffect } from 'react';
import { Mail, Send, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function BulkEmailManager() {
  const [emails, setEmails] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'customers' | 'abandonment'>('all');

  useEffect(() => {
    loadEmails();
    loadCampaigns();
  }, []);

  const loadEmails = async () => {
    try {
      const { data, error } = await supabase
        .from('email_captures')
        .select('email')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmails(data.map(item => item.email));
    } catch (error) {
      console.error('Error loading emails:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const getRecipientEmails = async () => {
    let recipientEmails: string[] = [];

    switch (recipientType) {
      case 'all':
        recipientEmails = emails;
        break;

      case 'customers': {
        const { data: orderEmails } = await supabase
          .from('orders')
          .select('customer_email')
          .eq('payment_status', 'paid');
        recipientEmails = [...new Set(orderEmails?.map(o => o.customer_email) || [])];
        break;
      }

      case 'abandonment': {
        const { data: abandonedEmails } = await supabase
          .from('cart_abandonments')
          .select('customer_email')
          .is('recovered_at', null);
        recipientEmails = [...new Set(abandonedEmails?.map(a => a.customer_email) || [])];
        break;
      }
    }

    return recipientEmails;
  };

  const sendCampaign = async () => {
    if (!campaignName || !subject || !body) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const recipientEmails = await getRecipientEmails();

      if (recipientEmails.length === 0) {
        alert('No recipients found');
        setLoading(false);
        return;
      }

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          name: campaignName,
          subject,
          body,
          status: 'sent',
          sent_at: new Date().toISOString(),
          total_recipients: recipientEmails.length
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Log each send
      const sends = recipientEmails.map(email => ({
        campaign_id: campaign.id,
        recipient_email: email,
        status: 'sent'
      }));

      const { error: sendsError } = await supabase
        .from('campaign_sends')
        .insert(sends);

      if (sendsError) throw sendsError;

      // Log to email_logs for actual sending
      const emailLogs = recipientEmails.map(email => ({
        recipient: email,
        subject,
        body,
        status: 'pending',
        type: 'campaign'
      }));

      await supabase.from('email_logs').insert(emailLogs);

      alert(`Campaign sent to ${recipientEmails.length} recipients!`);

      // Reset form
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
              <p className="text-sm text-gray-600">Total Emails</p>
              <p className="text-2xl font-bold text-gray-900">{emails.length}</p>
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
                {campaigns.reduce((sum, c) => sum + (c.total_recipients || 0), 0)}
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
              Recipients
            </label>
            <select
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Email Subscribers ({emails.length})</option>
              <option value="customers">Paying Customers Only</option>
              <option value="abandonment">Cart Abandonment (Not Recovered)</option>
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
              placeholder={`Hi there!\n\nWe have an amazing deal for you...\n\nUse code SAVE20 for 20% off your order!\n\nShop now: https://yoursite.com\n\nBest regards,\nYour Team`}
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
                        {campaign.total_recipients} recipients
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(campaign.sent_at || campaign.created_at).toLocaleDateString()}
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
