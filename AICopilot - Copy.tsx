import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Database, Package, TrendingUp, Image as ImageIcon, Settings, Trash2, Zap } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  conversation_title: string;
  messages: Message[];
  ai_provider: string;
  created_at: string;
}

export default function AICopilot() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiProvider, setAiProvider] = useState<'claude' | 'gpt' | 'google'>('claude');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_copilot_conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([{
      role: 'assistant',
      content: `Hello! I'm your AI Copilot. I can help you with:

• **Product Management** - Create, edit, or analyze products
• **SEO Optimization** - Improve your search rankings
• **Content Generation** - Write product descriptions, blog posts
• **Data Analysis** - Insights from your database
• **Media Library** - Find and organize images
• **Customer Support** - Draft responses

I have access to:
- Google Search
- Your admin dashboard
- Your database (products, customers, orders)
- Media library
- SEO tools

What would you like help with today?`,
      timestamp: new Date()
    }]);
  };

  const loadConversation = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_copilot_conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCurrentConversation(id);
      setMessages(data.messages || []);
      setAiProvider(data.ai_provider);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Delete this conversation?')) return;

    try {
      const { error } = await supabase
        .from('ai_copilot_conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      if (currentConversation === id) {
        startNewConversation();
      }
      loadConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI response based on keywords
    const lower = userMessage.toLowerCase();

    if (lower.includes('product') && (lower.includes('create') || lower.includes('add'))) {
      return `I can help you create a new product! Here's what I need:

1. **Product Name** - What should we call it?
2. **Price** - How much will it cost?
3. **Type** - Is it a Fire Stick, IPTV subscription, or bundle?
4. **Description** - What makes it special?
5. **Image** - Do you have an image URL?

I can also:
- Generate an SEO-optimized product description
- Suggest competitive pricing based on similar products
- Create schema markup for better Google visibility
- Find relevant images from your Media Library

Just provide the details and I'll create the product for you! Or say "suggest a Fire Stick product" and I'll generate a complete product listing.`;
    }

    if (lower.includes('seo') || lower.includes('optimization')) {
      return `Let's optimize your SEO! I can help with:

**Quick SEO Audit:**
- Analyze your product pages for SEO issues
- Check meta titles and descriptions
- Verify keyword optimization
- Review Open Graph tags for social media

**Content Optimization:**
- Generate SEO-friendly product descriptions
- Create compelling meta descriptions
- Suggest high-performing keywords
- Write schema markup

**Competitive Analysis:**
- Research competitor keywords
- Analyze top-ranking pages
- Identify content gaps

Which area would you like to focus on? Or say "audit all products" for a full SEO report.`;
    }

    if (lower.includes('media') || lower.includes('image')) {
      return `I can help with your Media Library!

**Available Actions:**
- Search for specific images (e.g., "find Fire Stick 4K images")
- Download multiple images at once
- Organize images by tags
- Find images from Google (I'll provide URLs)
- Clean up unused images

**Current Media Library Stats:**
- 10 Fire Stick images pre-loaded
- All optimized for web
- Ready to use in products

What would you like to do? Try saying "show me all Fire Stick images" or "find a remote control image."`;
    }

    if (lower.includes('customer') || lower.includes('order')) {
      return `I can help you manage customers and orders!

**Customer Management:**
- View customer details
- Track purchase history
- Send follow-up emails
- Identify top customers

**Order Management:**
- View recent orders
- Check order status
- Process refunds
- Generate reports

**Analytics:**
- Total revenue
- Average order value
- Customer lifetime value
- Popular products

What information do you need? Try "show recent orders" or "top customers this month."`;
    }

    if (lower.includes('analytics') || lower.includes('report')) {
      return `Let me pull your analytics!

**Key Metrics Available:**
- Total sales and revenue
- Product performance
- Customer acquisition
- Traffic sources
- Conversion rates

**Reports I Can Generate:**
- Daily/Weekly/Monthly sales reports
- Product performance comparison
- Customer behavior analysis
- SEO traffic analysis

Say "generate sales report" or "compare product performance" and I'll create detailed insights for you!`;
    }

    if (lower.includes('write') || lower.includes('content') || lower.includes('description')) {
      return `I'm great at writing content! I can create:

**Product Content:**
- Compelling product descriptions
- SEO-optimized titles
- Feature lists and benefits
- Urgency-creating copy

**Marketing Content:**
- Blog post outlines
- Email campaigns
- Social media posts
- Ad copy for Google/Facebook

**Example:**
Say "write a description for Fire Stick 4K Max" and I'll create a high-converting product description with SEO keywords, benefits, and CTAs.

What would you like me to write?`;
    }

    // Default response
    return `I'm your AI admin assistant! Here are some things you can ask me:

**📦 Products:**
- "Create a new Fire Stick product"
- "Show me all products"
- "Edit Fire Stick 4K pricing"

**📈 SEO:**
- "Audit my SEO"
- "Optimize product descriptions"
- "Generate schema markup"

**🖼️ Media:**
- "Find Fire Stick images"
- "Show me all images"
- "Upload an image from Google"

**📊 Analytics:**
- "Show sales report"
- "Top selling products"
- "Customer statistics"

**✍️ Content:**
- "Write a product description"
- "Create a blog post outline"
- "Generate ad copy"

Try any of these or ask me anything!`;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(input);

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Save to database
      if (currentConversation) {
        await supabase
          .from('ai_copilot_conversations')
          .update({
            messages: updatedMessages,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentConversation);
      } else {
        const title = input.slice(0, 50) + (input.length > 50 ? '...' : '');
        const { data, error } = await supabase
          .from('ai_copilot_conversations')
          .insert([{
            conversation_title: title,
            messages: updatedMessages,
            ai_provider: aiProvider,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (!error && data) {
          setCurrentConversation(data.id);
          loadConversations();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Package, label: 'Create Product', prompt: 'Help me create a new Fire Stick product' },
    { icon: TrendingUp, label: 'SEO Audit', prompt: 'Run an SEO audit on my products' },
    { icon: ImageIcon, label: 'Find Images', prompt: 'Show me all Fire Stick images in my media library' },
    { icon: Database, label: 'Analytics', prompt: 'Show me my sales analytics' },
    { icon: Sparkles, label: 'Write Content', prompt: 'Write a product description for Fire Stick 4K Max' },
    { icon: Settings, label: 'Optimize', prompt: 'How can I optimize my website?' }
  ];

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Bot className="w-8 h-8 text-purple-400" />
          AI Copilot
          <span className="text-sm font-normal text-gray-400">with Claude, GPT & Google</span>
        </h1>
        <p className="text-gray-400">Your intelligent admin assistant</p>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 rounded-xl p-4 border border-gray-700 overflow-y-auto">
          <button
            onClick={startNewConversation}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition flex items-center justify-center gap-2 mb-4"
          >
            <Sparkles className="w-5 h-5" />
            New Chat
          </button>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-white mb-2">AI Provider</label>
            <select
              value={aiProvider}
              onChange={(e) => setAiProvider(e.target.value as any)}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
            >
              <option value="claude">Claude (Anthropic)</option>
              <option value="gpt">ChatGPT (OpenAI)</option>
              <option value="google">Gemini (Google)</option>
            </select>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Recent Conversations</h3>
            <div className="space-y-2">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`p-3 rounded-lg cursor-pointer transition group ${
                    currentConversation === conv.id
                      ? 'bg-purple-500/20 border border-purple-500'
                      : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
                  }`}
                  onClick={() => loadConversation(conv.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-sm font-medium truncate flex-1">
                      {conv.conversation_title}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3 text-red-400 hover:text-red-300" />
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(conv.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No conversations yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-20 h-20 text-purple-400 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Welcome to AI Copilot!</h2>
                <p className="text-gray-400 mb-8">Choose a quick action to get started:</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInput(action.prompt);
                        handleSend();
                      }}
                      className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-center group"
                    >
                      <action.icon className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition" />
                      <p className="text-white font-semibold text-sm">{action.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-3xl px-4 py-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700 text-gray-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-2 opacity-60">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">You</span>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div className="bg-gray-700 px-4 py-3 rounded-lg">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about your admin dashboard..."
                disabled={loading}
                className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Zap className="w-5 h-5 animate-pulse" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Connected to {aiProvider === 'claude' ? 'Claude' : aiProvider === 'gpt' ? 'ChatGPT' : 'Google Gemini'}
              </span>
              <span>•</span>
              <span>Access to all admin tools</span>
              <span>•</span>
              <span>Database connected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-blue-500/20 border-2 border-blue-500 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-bold mb-2">AI Copilot Capabilities</h3>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
              <div>✓ Product management (CRUD operations)</div>
              <div>✓ SEO optimization & analysis</div>
              <div>✓ Content generation</div>
              <div>✓ Media library search</div>
              <div>✓ Analytics & reporting</div>
              <div>✓ Customer insights</div>
              <div>✓ Google Search integration</div>
              <div>✓ Database queries</div>
            </div>
            <p className="text-gray-400 mt-3 text-sm">
              Note: This is a demo AI assistant. In production, integrate with real AI APIs (Claude, GPT-4, or Gemini) for advanced capabilities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
