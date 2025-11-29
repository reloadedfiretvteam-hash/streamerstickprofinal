import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Lightbulb, ArrowRight, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: Action[];
}

interface Action {
  type: 'navigate' | 'execute' | 'suggest';
  label: string;
  target?: string;
  command?: string;
}

interface AdminFeature {
  id: string;
  name: string;
  description: string;
  category: string;
  actions: string[];
  keywords: string[];
}

export default function SuperAICopilot({ onNavigate, currentView }: { onNavigate?: (view: string) => void; currentView?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Complete knowledge base of all admin panel features
  const adminFeatures: AdminFeature[] = [
    {
      id: 'dashboard',
      name: 'Dashboard Overview',
      description: 'View key metrics, stats, and quick actions',
      category: 'Overview',
      actions: ['View stats', 'Quick actions', 'Recent activity'],
      keywords: ['dashboard', 'overview', 'stats', 'metrics', 'home']
    },
    {
      id: 'homepage-editor',
      name: 'Homepage Editor',
      description: 'Click and edit homepage sections visually',
      category: 'Content',
      actions: ['Edit sections', 'Add components', 'Change layout', 'Update text'],
      keywords: ['homepage', 'editor', 'edit page', 'visual editor', 'frontend']
    },
    {
      id: 'products',
      name: 'Products Manager',
      description: 'Create, edit, delete products with images, pricing, inventory',
      category: 'E-commerce',
      actions: ['Create product', 'Edit product', 'Delete product', 'Upload images', 'Set pricing', 'Manage inventory'],
      keywords: ['product', 'products', 'inventory', 'pricing', 'items', 'catalog']
    },
    {
      id: 'stripe-products',
      name: 'Stripe-Safe Products',
      description: 'Manage products for secure payment domain (secure.streamstickpro.com)',
      category: 'E-commerce',
      actions: ['Create Stripe product', 'Configure payment', 'Secure checkout'],
      keywords: ['stripe', 'payment', 'secure', 'checkout', 'payment gateway']
    },
    {
      id: 'ai-video-generator',
      name: 'AI Video Generator',
      description: 'Create AI-powered videos with talking avatars for TikTok/YouTube',
      category: 'Marketing',
      actions: ['Generate video', 'Create script', 'Schedule posts', 'Auto-post to TikTok/YouTube'],
      keywords: ['video', 'tiktok', 'youtube', 'ai video', 'generate video', 'social media']
    },
    {
      id: 'amazon-automation',
      name: 'Amazon Fire Stick Automation',
      description: 'Automatically process Fire Stick orders and send to Amazon',
      category: 'E-commerce',
      actions: ['Process orders', 'Send to Amazon', 'Track purchases', 'Copy customer info'],
      keywords: ['amazon', 'fire stick', 'orders', 'fulfillment', 'affiliate']
    },
    {
      id: 'blog',
      name: 'Blog Posts Manager',
      description: 'Create, edit blog posts with SEO scores and analytics',
      category: 'Content',
      actions: ['Create post', 'Edit post', 'Publish', 'SEO optimization', 'View analytics'],
      keywords: ['blog', 'post', 'article', 'content', 'seo', 'publish']
    },
    {
      id: 'seo-settings',
      name: 'SEO Settings & Google',
      description: 'Configure Google Search Console, Bing Webmaster, meta tags',
      category: 'SEO',
      actions: ['Configure Google', 'Set meta tags', 'Submit sitemap', 'Verify domains'],
      keywords: ['seo', 'google', 'search console', 'bing', 'meta tags', 'sitemap']
    },
    {
      id: 'seo-manager',
      name: 'SEO Content Manager',
      description: 'Rank Math Pro-like SEO optimization with scores and suggestions',
      category: 'SEO',
      actions: ['Optimize content', 'Check SEO score', 'Get suggestions', 'Fix issues'],
      keywords: ['rank math', 'seo score', 'optimize', 'keywords', 'rankings']
    },
    {
      id: 'orders',
      name: 'Orders & Customers',
      description: 'View all orders, track payments, manage customers',
      category: 'E-commerce',
      actions: ['View orders', 'Update status', 'Track payments', 'Customer data'],
      keywords: ['order', 'orders', 'customer', 'customers', 'sales', 'purchases']
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      description: 'Revenue tracking, visitor analytics, conversion rates',
      category: 'Analytics',
      actions: ['View analytics', 'Generate reports', 'Track performance'],
      keywords: ['analytics', 'reports', 'revenue', 'traffic', 'conversion', 'stats']
    },
    {
      id: 'categories',
      name: 'Categories & Tags',
      description: 'Manage product categories and tags',
      category: 'E-commerce',
      actions: ['Create category', 'Edit tags', 'Organize products'],
      keywords: ['category', 'categories', 'tags', 'taxonomy', 'organize']
    },
    {
      id: 'emails',
      name: 'Email Campaigns',
      description: 'Create and send email campaigns, newsletters',
      category: 'Marketing',
      actions: ['Create campaign', 'Send email', 'View analytics'],
      keywords: ['email', 'campaign', 'newsletter', 'mailing', 'marketing']
    },
    {
      id: 'settings',
      name: 'Site Settings',
      description: 'Configure site-wide settings, branding, integrations',
      category: 'Settings',
      actions: ['Update settings', 'Configure integrations', 'Change branding'],
      keywords: ['settings', 'config', 'setup', 'branding', 'integrations']
    }
  ];

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: generateWelcomeMessage(),
        timestamp: new Date(),
        actions: [
          { type: 'suggest', label: 'Show me all features' },
          { type: 'suggest', label: 'How do I create a product?' },
          { type: 'suggest', label: 'Generate a video for TikTok' }
        ]
      }]);
    }
    generateSuggestions();
  }, [currentView]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateWelcomeMessage = () => {
    return `👋 **Hello! I'm your Super AI Copilot.**

I know **EVERYTHING** about your admin panel and can help you with:

📦 **E-commerce:** Products, Orders, Customers, Payments
📝 **Content:** Blog Posts, Homepage Editor, SEO
🎬 **Marketing:** Video Generator, Email Campaigns, Amazon Automation
📊 **Analytics:** Reports, Performance Tracking
⚙️ **Settings:** Configuration, Integrations

**I can:**
✅ Navigate to any tool
✅ Perform actions for you
✅ Answer questions
✅ Provide suggestions
✅ Help with setup and troubleshooting

**Try asking:**
- "How do I create a product?"
- "Generate a video for my Fire Stick product"
- "Show me my sales analytics"
- "Navigate to blog posts"

What would you like to do?`;
  };

  const generateSuggestions = async () => {
    // Generate contextual suggestions based on current view and data
    const contextSuggestions: string[] = [];

    // Check for pending orders
    try {
      const { count } = await supabase
        .from('customer_orders')
        .select('*', { count: 'exact', head: true })
        .eq('order_status', 'pending');

      if (count && count > 0) {
        contextSuggestions.push(`You have ${count} pending orders to process`);
      }
    } catch (_e) { /* Ignore error */ }

    // Check for low stock
    try {
      const { data } = await supabase
        .from('real_products')
        .select('name')
        .lt('inventory_count', 5)
        .limit(3);

      if (data && data.length > 0) {
        contextSuggestions.push(`${data.length} products are low on stock`);
      }
    } catch (_e) { /* Ignore error */ }

    // Add general suggestions
    contextSuggestions.push('Create a new blog post');
    contextSuggestions.push('Generate a TikTok video');
    contextSuggestions.push('Check SEO scores');

    setSuggestions(contextSuggestions.slice(0, 3));
  };

  const findRelevantFeatures = (query: string): AdminFeature[] => {
    const lower = query.toLowerCase();
    return adminFeatures.filter(feature => 
      feature.keywords.some(kw => lower.includes(kw)) ||
      feature.name.toLowerCase().includes(lower) ||
      feature.description.toLowerCase().includes(lower)
    );
  };

  const generateAIResponse = async (userInput: string): Promise<{ content: string; actions?: Action[] }> => {
    const lower = userInput.toLowerCase();
    const relevantFeatures = findRelevantFeatures(userInput);
    const actions: Action[] = [];

    // Navigation requests
    if (lower.includes('go to') || lower.includes('navigate') || lower.includes('open') || lower.includes('show')) {
      if (relevantFeatures.length > 0) {
        const feature = relevantFeatures[0];
        actions.push({
          type: 'navigate',
          label: `Go to ${feature.name}`,
          target: feature.id
        });
        return {
          content: `I'll take you to **${feature.name}**.\n\n${feature.description}\n\n**Available actions:**\n${feature.actions.map(a => `• ${a}`).join('\n')}`,
          actions
        };
      }
    }

    // Product creation
    if ((lower.includes('create') || lower.includes('add') || lower.includes('make')) && 
        (lower.includes('product') || lower.includes('item'))) {
      actions.push({
        type: 'navigate',
        label: 'Go to Products',
        target: 'products'
      });
      return {
        content: `**Creating a Product:**

1. I'll take you to the Products Manager
2. Click "Add New Product"
3. Fill in:
   - Product name
   - Description
   - Price
   - Images
   - Inventory

**Pro Tips:**
- Use SEO-friendly titles
- Add multiple images
- Set competitive pricing
- Enable inventory tracking

Would you like me to navigate there now?`,
        actions
      };
    }

    // Video generation
    if (lower.includes('video') || lower.includes('tiktok') || lower.includes('youtube')) {
      if (lower.includes('generate') || lower.includes('create') || lower.includes('make')) {
        actions.push({
          type: 'navigate',
          label: 'Go to AI Video Generator',
          target: 'ai-video-generator'
        });
        return {
          content: `**Generate AI Video:**

1. I'll take you to the AI Video Generator
2. Select a product
3. Choose AI person (Professional, Friendly, Energetic, Tech Expert)
4. Generate script (or write your own)
5. Click "Generate Real AI Video"
6. Schedule auto-posts to TikTok/YouTube

**Features:**
- Real video generation (not placeholders!)
- Multiple AI personas
- Auto-posting to TikTok & YouTube
- Schedule multiple posts per day

Ready to create your video?`,
          actions
        };
      }
    }

    // Amazon automation
    if (lower.includes('amazon') || lower.includes('fire stick')) {
      actions.push({
        type: 'navigate',
        label: 'Go to Amazon Automation',
        target: 'amazon-automation'
      });
      return {
        content: `**Amazon Fire Stick Automation:**

This tool automatically:
1. Detects Fire Stick orders
2. Opens Amazon with product in cart
3. Provides customer delivery info (one-click copy)
4. Tracks order status

**Setup:**
- Get Amazon Associates affiliate ID
- Enter it in settings
- When customer orders, click "Send to Amazon"

**AI Assistant:** There's a built-in AI assistant that will guide you through setup!

Would you like me to take you there?`,
        actions
      };
    }

    // SEO optimization
    if (lower.includes('seo') || lower.includes('optimize') || lower.includes('rank')) {
      actions.push({
        type: 'navigate',
        label: 'Go to SEO Manager',
        target: 'seo-manager'
      });
      return {
        content: `**SEO Optimization:**

I can help you:
1. Check SEO scores (Rank Math Pro-like)
2. Optimize content
3. Fix SEO issues
4. Generate meta tags
5. Submit sitemaps

**Available Tools:**
- SEO Settings & Google (configure search engines)
- SEO Content Manager (optimize content with scores)

**Quick Wins:**
- Optimize product descriptions
- Add meta tags to all pages
- Submit sitemap to Google/Bing
- Fix broken links

Let me take you to the SEO Manager!`,
        actions
      };
    }

    // Analytics
    if (lower.includes('analytics') || lower.includes('report') || lower.includes('stats') || lower.includes('sales')) {
      actions.push({
        type: 'navigate',
        label: 'Go to Analytics',
        target: 'analytics'
      });
      return {
        content: `**Analytics & Reports:**

I can show you:
- Total revenue and sales
- Product performance
- Customer analytics
- Traffic sources
- Conversion rates

**Available:**
- Dashboard Overview (quick stats)
- Analytics Dashboard (detailed reports)

Would you like to see your analytics?`,
        actions
      };
    }

    // Blog posts
    if (lower.includes('blog') || lower.includes('post') || lower.includes('article')) {
      actions.push({
        type: 'navigate',
        label: 'Go to Blog Posts',
        target: 'blog'
      });
      return {
        content: `**Blog Posts Manager:**

Create and manage blog posts with:
- SEO scores (Rank Math Pro-like)
- Categories and tags
- Featured images
- Analytics per post
- Schedule publishing

**To Create a Post:**
1. Click "Add New Post"
2. Write content
3. Add images
4. Check SEO score
5. Publish or schedule

Let me take you there!`,
        actions
      };
    }

    // Orders
    if (lower.includes('order') || lower.includes('customer') || lower.includes('sale')) {
      actions.push({
        type: 'navigate',
        label: 'Go to Orders',
        target: 'orders'
      });
      return {
        content: `**Orders & Customers:**

View and manage:
- All customer orders
- Order status
- Payment tracking
- Customer information
- Order history

**Actions:**
- Update order status
- Track payments
- View customer details
- Export order data

Let me show you your orders!`,
        actions
      };
    }

    // List all features
    if (lower.includes('features') || lower.includes('tools') || lower.includes('what can') || lower.includes('help')) {
      const categories = adminFeatures.reduce((acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
      }, {} as Record<string, AdminFeature[]>);

      let content = `**All Admin Panel Features:**\n\n`;
      Object.entries(categories).forEach(([category, features]) => {
        content += `**${category}:**\n`;
        features.forEach(f => {
          content += `• ${f.name} - ${f.description}\n`;
        });
        content += `\n`;
      });

      content += `\n**Ask me to navigate to any of these, or ask "How do I..." for detailed instructions!**`;

      return { content };
    }

    // How-to questions
    if (lower.startsWith('how') || lower.startsWith('what') || lower.includes('?')) {
      if (relevantFeatures.length > 0) {
        const feature = relevantFeatures[0];
        return {
          content: `**How to use ${feature.name}:**\n\n${feature.description}\n\n**Available Actions:**\n${feature.actions.map(a => `• ${a}`).join('\n')}\n\nWould you like me to navigate there?`,
          actions: [{
            type: 'navigate',
            label: `Go to ${feature.name}`,
            target: feature.id
          }]
        };
      }
    }

    // Default: provide helpful response
    return {
      content: `I understand you're asking about: "${userInput}"

**I can help you with:**
- Navigating to any admin tool
- Creating products, blog posts, videos
- SEO optimization
- Analytics and reports
- Amazon automation
- And much more!

**Try asking:**
- "How do I create a product?"
- "Navigate to blog posts"
- "Generate a TikTok video"
- "Show me analytics"
- "What features are available?"

Or be more specific about what you need!`,
      actions: [
        { type: 'suggest', label: 'Show all features' },
        { type: 'suggest', label: 'Create a product' },
        { type: 'suggest', label: 'Generate a video' }
      ]
    };
  };

  const handleAction = (action: Action) => {
    if (action.type === 'navigate' && action.target && onNavigate) {
      onNavigate(action.target);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Navigated to ${action.target}`,
        timestamp: new Date()
      }]);
    } else if (action.type === 'suggest') {
      setInput(action.label);
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await generateAIResponse(input);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        actions: response.actions
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 z-50 flex flex-col max-h-[600px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <div>
            <h3 className="font-bold">Super AI Copilot</h3>
            <p className="text-xs opacity-90">I know everything!</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white hover:bg-white/20 rounded p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 ${
              message.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : message.role === 'system'
                ? 'bg-gray-700 text-gray-300 text-xs'
                : 'bg-gray-800 text-gray-100'
            }`}>
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleAction(action)}
                      className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-xs flex items-center gap-2 transition-colors"
                    >
                      {action.type === 'navigate' && <ArrowRight className="w-3 h-3" />}
                      {action.type === 'suggest' && <Lightbulb className="w-3 h-3" />}
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-gray-400 mb-2">Suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(suggestion);
                  handleSend();
                }}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

