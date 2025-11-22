import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ChatMessage {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export default function FloatingLiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "What are your pricing plans?",
    "How do I get started?",
    "Do you offer free trials?",
    "What channels are included?"
  ];

  useEffect(() => {
    if (chatStarted && sessionId) {
      loadMessages();
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [chatStarted, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const newMessages = data.length;
        const currentMessages = messages.length;

        if (newMessages > currentMessages && !isOpen) {
          setUnreadCount(prev => prev + (newMessages - currentMessages));
        }

        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const startChat = async () => {
    if (!name || !email) {
      alert('Please enter your name and email');
      return;
    }

    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setChatStarted(true);

    await sendWelcomeMessage(newSessionId);
  };

  const sendWelcomeMessage = async (sid: string) => {
    const welcomeMsg = "👋 Welcome! We're here to help. How can we assist you today?";

    try {
      await supabase
        .from('live_chat_messages')
        .insert([{
          session_id: sid,
          customer_name: 'Support Team',
          customer_email: 'reloadedfiretvteam@gmail.com',
          message: welcomeMsg,
          is_admin: true,
          status: 'active'
        }]);

      loadMessages();
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  };

  const sendMessage = async (msg?: string) => {
    const messageToSend = msg || message;
    if (!messageToSend.trim() || !sessionId) return;

    try {
      const { error: insertError } = await supabase
        .from('live_chat_messages')
        .insert([{
          session_id: sessionId,
          customer_name: name,
          customer_email: email,
          message: messageToSend,
          is_admin: false,
          status: 'pending'
        }]);

      if (insertError) throw insertError;

      await supabase.functions.invoke('send-chat-notification', {
        body: {
          customerName: name,
          customerEmail: email,
          message: messageToSend,
          sessionId: sessionId
        }
      }).catch(() => {});

      setMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleQuickReply = (reply: string) => {
    setMessage(reply);
    sendMessage(reply);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      setIsMinimized(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-110 animate-pulse"
          aria-label="Open live chat"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              {unreadCount}
            </div>
          )}
        </button>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border-2 border-orange-500 transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[600px]'
          } w-96 flex flex-col`}
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <MessageCircle className="w-6 h-6" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">Live Chat Support</h3>
                <p className="text-xs text-orange-100">We're online now!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 p-2 rounded-lg transition-all"
                aria-label="Minimize chat"
                title="Minimize"
              >
                <Minimize2 className="w-6 h-6" />
              </button>
              <button
                onClick={toggleChat}
                className="bg-white/10 hover:bg-red-500 p-2 rounded-lg transition-all hover:scale-110"
                aria-label="Close chat window"
                title="Close Chat"
              >
                <X className="w-6 h-6 font-bold" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {!chatStarted ? (
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <MessageCircle className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                      Chat with us!
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Get instant help from our support team
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
                      />
                    </div>

                    <button
                      onClick={startChat}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-bold hover:from-orange-600 hover:to-red-600 transition"
                    >
                      Start Chat
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                      By starting a chat, you agree to our terms and privacy policy
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Send a message to start the conversation</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                                msg.is_admin
                                  ? 'bg-white text-gray-800 border border-gray-200'
                                  : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {quickReplies.length > 0 && messages.length <= 1 && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Quick replies:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((reply, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickReply(reply)}
                            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-orange-100 text-gray-700 rounded-full transition border border-gray-200 hover:border-orange-300"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-white border-t-2 border-gray-200 rounded-b-2xl">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition"
                      />
                      <button
                        onClick={() => sendMessage()}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
