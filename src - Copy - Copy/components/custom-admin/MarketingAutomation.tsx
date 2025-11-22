import { useState } from 'react';
import {
  Zap,
  Plus,
  Mail,
  Users,
  ShoppingCart,
  Tag,
  Clock,
  Send,
  Filter,
  BarChart3,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';

export default function MarketingAutomation() {
  const [workflows, setWorkflows] = useState([
    {
      id: '1',
      name: 'Welcome Series',
      trigger: 'New Subscriber',
      status: 'active',
      emails: 3,
      subscribers: 247,
      opened: 68,
      clicked: 32
    },
    {
      id: '2',
      name: 'Cart Abandonment',
      trigger: 'Abandoned Cart',
      status: 'active',
      emails: 2,
      subscribers: 89,
      opened: 54,
      clicked: 28
    },
    {
      id: '3',
      name: 'Post-Purchase Follow-up',
      trigger: 'Order Completed',
      status: 'active',
      emails: 4,
      subscribers: 312,
      opened: 71,
      clicked: 41
    }
  ]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            Marketing Automation
          </h2>
          <p className="text-gray-400 mt-1">Create automated email workflows and customer journeys</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Mail className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-bold text-blue-400">12</span>
          </div>
          <p className="text-gray-300 font-semibold">Active Workflows</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold text-green-400">1,248</span>
          </div>
          <p className="text-gray-300 font-semibold">Active Subscribers</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Send className="w-8 h-8 text-purple-400" />
            <span className="text-3xl font-bold text-purple-400">8,453</span>
          </div>
          <p className="text-gray-300 font-semibold">Emails Sent (30d)</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-orange-400" />
            <span className="text-3xl font-bold text-orange-400">68%</span>
          </div>
          <p className="text-gray-300 font-semibold">Avg Open Rate</p>
        </div>
      </div>

      {/* Workflows */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Your Workflows</h3>
        </div>

        <div className="divide-y divide-gray-700">
          {workflows.map(workflow => (
            <div key={workflow.id} className="p-6 hover:bg-gray-750 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{workflow.name}</h4>
                    <p className="text-gray-400 text-sm">Trigger: {workflow.trigger}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    workflow.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {workflow.status}
                  </span>
                  <button className="p-2 hover:bg-gray-600 rounded-lg transition">
                    <Edit className="w-5 h-5 text-gray-300" />
                  </button>
                  <button className="p-2 hover:bg-gray-600 rounded-lg transition">
                    <Copy className="w-5 h-5 text-gray-300" />
                  </button>
                  <button className="p-2 hover:bg-gray-600 rounded-lg transition">
                    {workflow.status === 'active' ? <Pause className="w-5 h-5 text-gray-300" /> : <Play className="w-5 h-5 text-gray-300" />}
                  </button>
                  <button className="p-2 hover:bg-red-600 rounded-lg transition">
                    <Trash2 className="w-5 h-5 text-gray-300" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{workflow.emails}</div>
                  <div className="text-sm text-gray-400">Emails</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{workflow.subscribers}</div>
                  <div className="text-sm text-gray-400">Subscribers</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{workflow.opened}%</div>
                  <div className="text-sm text-gray-400">Open Rate</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-400">{workflow.clicked}%</div>
                  <div className="text-sm text-gray-400">Click Rate</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">${(workflow.subscribers * 29).toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Revenue</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-built Templates */}
      <div className="mt-6 bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Pre-built Workflow Templates</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'Welcome Series', desc: '3-email welcome sequence for new subscribers', icon: Mail, color: 'blue' },
            { name: 'Birthday Campaign', desc: 'Send birthday wishes with special offers', icon: Tag, color: 'pink' },
            { name: 'Re-engagement', desc: 'Win back inactive customers', icon: Users, color: 'purple' },
            { name: 'Product Launch', desc: 'Announce new products to your list', icon: Zap, color: 'yellow' },
            { name: 'Cross-sell', desc: 'Recommend related products', icon: ShoppingCart, color: 'green' },
            { name: 'Renewal Reminder', desc: 'Remind customers about expiring subscriptions', icon: Clock, color: 'orange' }
          ].map((template, index) => {
            const Icon = template.icon;
            return (
              <div key={index} className="bg-gray-900 rounded-lg p-4 hover:bg-gray-750 transition cursor-pointer border border-gray-700 hover:border-orange-500">
                <div className={`w-12 h-12 bg-${template.color}-500/20 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 text-${template.color}-400`} />
                </div>
                <h4 className="text-white font-semibold mb-1">{template.name}</h4>
                <p className="text-gray-400 text-sm">{template.desc}</p>
                <button className="mt-3 text-sm text-orange-400 hover:text-orange-300 font-semibold">
                  Use Template →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
