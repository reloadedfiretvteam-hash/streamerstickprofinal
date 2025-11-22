import { useState, useEffect } from 'react';
import { MessageCircle, User, Send, Check, Clock, Archive } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ChatMessage {
  id: string;
  customer_name: string;
  customer_email: string;
  message: string;
  reply: string | null;
  status: string;
  created_at: string;
}

export default function LiveChatManager() {
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatMessage | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadChats = async () => {
    try {
      let query = supabase
        .from('live_chat_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selectedChat || !reply.trim()) return;

    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .update({
          reply: reply,
          status: 'replied',
          replied_at: new Date().toISOString()
        })
        .eq('id', selectedChat.id);

      if (error) throw error;

      setReply('');
      loadChats();
      alert('Reply sent!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    }
  };

  const markAsResolved = async (id: string) => {
    try {
      const { error } = await supabase
        .from('live_chat_messages')
        .update({ status: 'resolved' })
        .eq('id', id);

      if (error) throw error;
      loadChats();
    } catch (error) {
      console.error('Error marking as resolved:', error);
    }
  };

  const pendingCount = chats.filter(c => c.status === 'pending').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Chat Support</h1>
          <p className="text-gray-400">Real-time customer support messages</p>
        </div>
        <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold">
          {pendingCount} Pending
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'pending'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Pending
        </button>
        <button
          onClick={() => setFilter('replied')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'replied'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Check className="w-4 h-4 inline mr-2" />
          Replied
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'resolved'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Archive className="w-4 h-4 inline mr-2" />
          Resolved
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            filter === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Messages
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-[600px] overflow-auto">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : chats.length === 0 ? (
            <p className="text-gray-400">No messages</p>
          ) : (
            <div className="space-y-3">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    selectedChat?.id === chat.id
                      ? 'bg-orange-500/20 border-2 border-orange-500'
                      : 'bg-gray-700 hover:bg-gray-600 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-white font-semibold">{chat.customer_name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      chat.status === 'pending' ? 'bg-orange-500 text-white' :
                      chat.status === 'replied' ? 'bg-blue-500 text-white' :
                      'bg-green-500 text-white'
                    }`}>
                      {chat.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{chat.customer_email}</p>
                  <p className="text-sm text-gray-300 line-clamp-2">{chat.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(chat.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">
            {selectedChat ? 'Reply to Message' : 'Select a Message'}
          </h2>

          {selectedChat ? (
            <div>
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-white font-semibold">{selectedChat.customer_name}</p>
                    <p className="text-sm text-gray-400">{selectedChat.customer_email}</p>
                  </div>
                </div>
                <div className="bg-gray-800 rounded p-3 mb-3">
                  <p className="text-sm text-gray-400 mb-1">Customer Message:</p>
                  <p className="text-white">{selectedChat.message}</p>
                </div>
                {selectedChat.reply && (
                  <div className="bg-orange-500/20 rounded p-3 border border-orange-500">
                    <p className="text-sm text-gray-400 mb-1">Your Reply:</p>
                    <p className="text-white">{selectedChat.reply}</p>
                  </div>
                )}
              </div>

              {selectedChat.status === 'pending' && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none h-32"
                    placeholder="Type your reply..."
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={sendReply}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send Reply
                    </button>
                    <button
                      onClick={() => markAsResolved(selectedChat.id)}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {selectedChat.status === 'replied' && (
                <button
                  onClick={() => markAsResolved(selectedChat.id)}
                  className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Mark as Resolved
                </button>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-20">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a message to view and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
