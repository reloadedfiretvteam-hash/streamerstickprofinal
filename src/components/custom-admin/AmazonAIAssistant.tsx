import { useState } from 'react';
import { Bot, Send, BookOpen, Zap, AlertCircle, ExternalLink } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AmazonAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your Amazon Automation Assistant. I can help you:\n\n1. Set up Amazon Associates (affiliate account)\n2. Configure automatic Fire Stick purchases\n3. Set up auto-posting workflows\n4. Troubleshoot any issues\n\nWhat would you like help with?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (in production, connect to OpenAI or similar)
    setTimeout(() => {
      const response = generateAIResponse(input);
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    // Amazon Associates setup
    if (lowerInput.includes('affiliate') || lowerInput.includes('associate') || lowerInput.includes('tag')) {
      return `**Setting Up Amazon Associates:**

1. **Go to Amazon Associates:**
   - Visit: https://affiliate-program.amazon.com/
   - Click "Join Now for Free"

2. **Sign Up:**
   - Use your existing Amazon account or create one
   - Fill out your website information
   - Wait for approval (usually 1-3 days)

3. **Get Your Associate Tag:**
   - After approval, go to Account Settings
   - Find "Associate Tag" (format: yourname-20)
   - Copy it and paste it in the Amazon Automation settings above

4. **Enable Auto-Purchase:**
   - The system will use your tag for all Fire Stick purchases
   - You'll earn commission on every order!

**Quick Setup:** I can help you enter your tag right now. Just tell me what it is!`;
    }

    // Auto-purchase setup
    if (lowerInput.includes('auto') && (lowerInput.includes('purchase') || lowerInput.includes('buy'))) {
      return `**Automatic Amazon Purchases:**

Unfortunately, Amazon doesn't allow direct API purchases for security reasons. However, I've created the FASTEST possible workflow:

**Current System (Semi-Automated):**
1. ✅ Auto-detects Fire Stick orders
2. ✅ One-click opens Amazon with product in cart
3. ✅ One-click copies customer delivery info
4. ✅ Tracks all orders automatically

**To Make It Even Faster:**
1. **Use Browser Extensions:**
   - Install "AutoFill" extension
   - Save your Amazon payment method
   - The system will open Amazon, you just click "Buy Now"

2. **Use Amazon Business Account:**
   - Faster checkout process
   - Bulk purchase options
   - Better pricing

3. **Set Up Amazon Prime:**
   - Faster shipping
   - One-click ordering enabled

**Future Enhancement:**
I'm working on integrating with browser automation tools that can complete the purchase automatically. This requires:
- Chrome extension installation
- One-time setup
- Then fully automatic!

Would you like me to set up the browser automation integration?`;
    }

    // Troubleshooting
    if (lowerInput.includes('not working') || lowerInput.includes('problem') || lowerInput.includes('error')) {
      return `**Troubleshooting Guide:**

Let me help you fix the issue:

**Common Issues:**

1. **Orders Not Showing:**
   - Check if order contains "Fire Stick" in product name
   - Verify database migration ran successfully
   - Refresh the page

2. **Affiliate Links Not Working:**
   - Verify Amazon Associates account is approved
   - Check affiliate tag format (should be like: yourname-20)
   - Make sure tag is saved in settings

3. **Customer Info Missing:**
   - Check if shipping address is in order data
   - Verify customer filled out checkout form
   - Check order_items structure

**Quick Fix:**
Tell me the specific error message or issue, and I'll give you the exact solution!`;
    }

    // General help
    if (lowerInput.includes('help') || lowerInput.includes('how')) {
      return `**How Amazon Automation Works:**

1. **Customer Orders Fire Stick** → Order appears automatically
2. **You Click "Send to Amazon"** → Opens Amazon with product in cart
3. **You Click "Copy Customer Info"** → Info ready to paste
4. **Paste into Amazon Checkout** → Complete purchase
5. **Enter Amazon Order ID** → System tracks everything

**Time Saved:** What used to take 5-10 minutes now takes 30 seconds!

**Want to make it even faster?** Ask me about:
- Browser automation setup
- Auto-purchase integration
- Bulk order processing

What specific part would you like help with?`;
    }

    // Default response
    return `I understand you're asking about: "${userInput}"

I can help you with:
- Setting up Amazon Associates
- Configuring auto-purchases
- Troubleshooting issues
- Optimizing the workflow

Could you be more specific? For example:
- "How do I set up my affiliate account?"
- "How do I make purchases automatic?"
- "My orders aren't showing up"

Or ask me anything else about the Amazon automation system!`;
  };

  const quickActions = [
    {
      label: 'Setup Amazon Associates',
      prompt: 'How do I set up my Amazon Associates affiliate account?',
      icon: ExternalLink
    },
    {
      label: 'Auto-Purchase Setup',
      prompt: 'How do I set up automatic Amazon purchases?',
      icon: Zap
    },
    {
      label: 'Troubleshooting',
      prompt: 'My orders are not showing up, what should I do?',
      icon: AlertCircle
    },
    {
      label: 'View Guide',
      prompt: 'Show me the complete setup guide',
      icon: BookOpen
    }
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500 rounded-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Amazon AI Assistant</h3>
          <p className="text-xs text-gray-400">Your personal setup guide</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[400px] max-h-[500px]">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={() => {
                setInput(action.prompt);
                handleSend();
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-200 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me anything about Amazon automation..."
          className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

