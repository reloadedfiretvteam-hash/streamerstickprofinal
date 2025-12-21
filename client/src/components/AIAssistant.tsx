import { useState, useRef, useEffect } from "react";
import { apiCall } from "@/lib/api";
import { 
  Bot, 
  Send, 
  Loader2, 
  Sparkles, 
  Code, 
  Database, 
  CreditCard, 
  Github, 
  Cloud,
  CheckCircle,
  AlertCircle,
  Terminal,
  Copy,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: any;
  result?: any;
  error?: string;
}

interface AIAssistantProps {
  authFetch: (url: string, options?: any) => Promise<Response>;
  showToast: (message: string, type: 'success' | 'error') => void;
}

export default function AIAssistant({ authFetch, showToast }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Hello! I\'m your AI Assistant. I can help you manage GitHub, Stripe, Supabase, Cloudflare, and your codebase. What would you like me to do?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCapabilities();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const loadCapabilities = async () => {
    try {
      const response = await authFetch('/api/ai-assistant/capabilities');
      const data = await response.json();
      if (data.capabilities) {
        setCapabilities(data.capabilities);
      }
    } catch (error) {
      console.error('Failed to load capabilities:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await authFetch('/api/ai-assistant/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: input,
          context: {
            timestamp: new Date().toISOString(),
            previousMessages: messages.slice(-5).map(m => ({ role: m.role, content: m.content }))
          }
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || (data.success ? 'Task completed successfully' : 'Task failed'),
        timestamp: new Date(),
        action: data.action,
        result: data.result,
        error: data.error
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.success) {
        showToast(data.message || 'Task completed successfully', 'success');
      } else {
        showToast(data.error || 'Task failed', 'error');
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message || 'Failed to execute command'}`,
        timestamp: new Date(),
        error: error.message
      };
      setMessages(prev => [...prev, errorMessage]);
      showToast('Failed to execute command', 'error');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatResult = (result: any): string => {
    if (!result) return '';
    if (typeof result === 'string') return result;
    if (result.message) return result.message;
    if (result.data) {
      if (Array.isArray(result.data)) {
        return `Found ${result.data.length} items`;
      }
      return JSON.stringify(result.data, null, 2);
    }
    return JSON.stringify(result, null, 2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-500" />
            AI Assistant
          </h2>
          <p className="text-gray-400">Natural language interface for managing your entire stack</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowCapabilities(!showCapabilities)}
          className="border-purple-500/30 text-purple-400"
        >
          <Terminal className="w-4 h-4 mr-2" />
          {showCapabilities ? 'Hide' : 'Show'} Capabilities
        </Button>
      </div>

      {showCapabilities && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Available Capabilities</CardTitle>
            <CardDescription className="text-gray-400">
              Examples of what I can help you with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {capabilities.map((cap, idx) => (
                <div key={idx} className="p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    {cap.category === 'GitHub' && <Github className="w-5 h-5 text-gray-400" />}
                    {cap.category === 'Stripe' && <CreditCard className="w-5 h-5 text-gray-400" />}
                    {cap.category === 'Supabase' && <Database className="w-5 h-5 text-gray-400" />}
                    {cap.category === 'Cloudflare' && <Cloud className="w-5 h-5 text-gray-400" />}
                    {cap.category === 'Code' && <Code className="w-5 h-5 text-gray-400" />}
                    {cap.category === 'Database' && <Database className="w-5 h-5 text-gray-400" />}
                    <h3 className="font-semibold text-white">{cap.category}</h3>
                  </div>
                  <ul className="space-y-1">
                    {cap.actions.map((action: string, actionIdx: number) => (
                      <li key={actionIdx} className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-purple-500/20 text-white'
                        : message.error
                        ? 'bg-red-500/20 text-red-200'
                        : 'bg-gray-700/50 text-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {message.role === 'user' ? (
                        <Terminal className="w-4 h-4 mt-1 text-purple-400" />
                      ) : message.error ? (
                        <AlertCircle className="w-4 h-4 mt-1 text-red-400" />
                      ) : (
                        <Bot className="w-4 h-4 mt-1 text-purple-400" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium mb-1">{message.content}</div>
                        {message.result && (
                          <div className="mt-3 p-3 bg-gray-900/50 rounded text-sm font-mono overflow-x-auto">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-green-400 text-xs">Result</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(formatResult(message.result))}
                                className="h-6 px-2 text-xs"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <pre className="text-xs">{formatResult(message.result)}</pre>
                          </div>
                        )}
                        {message.action && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {message.action.type} / {message.action.action}
                            </Badge>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to do something... (e.g., 'list all Stripe products', 'show recent orders', 'push changes to GitHub')"
                className="bg-gray-700 border-gray-600 text-white flex-1"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


