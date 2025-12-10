import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  FileText, 
  Globe, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Send,
  Copy,
  RefreshCw,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function EliteSEO() {
  const { toast } = useToast();
  const [sitemapExists, setSitemapExists] = useState<boolean | null>(null);
  const [robotsExists, setRobotsExists] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  
  const siteBaseUrl = window.location.origin;
  const sitemapUrl = `${siteBaseUrl}/sitemap.xml`;
  const robotsUrl = `${siteBaseUrl}/robots.txt`;
  
  // Search engine submission URLs
  const bingSubmitUrl = `https://www.bing.com/webmasters/ping.aspx?siteMap=${encodeURIComponent(sitemapUrl)}`;
  const googleSubmitUrl = `https://search.google.com/search-console`;
  
  const checkFiles = async () => {
    setChecking(true);
    
    try {
      // Check sitemap.xml with timeout
      const sitemapController = new AbortController();
      const sitemapTimeout = setTimeout(() => sitemapController.abort(), 5000);
      
      try {
        const sitemapResponse = await fetch(sitemapUrl, { 
          method: 'HEAD',
          signal: sitemapController.signal 
        });
        setSitemapExists(sitemapResponse.ok);
      } catch {
        setSitemapExists(false);
      } finally {
        clearTimeout(sitemapTimeout);
      }
      
      // Check robots.txt with timeout
      const robotsController = new AbortController();
      const robotsTimeout = setTimeout(() => robotsController.abort(), 5000);
      
      try {
        const robotsResponse = await fetch(robotsUrl, { 
          method: 'HEAD',
          signal: robotsController.signal 
        });
        setRobotsExists(robotsResponse.ok);
      } catch {
        setRobotsExists(false);
      } finally {
        clearTimeout(robotsTimeout);
      }
      
      toast({
        title: "Check Complete",
        description: "SEO files status updated",
      });
    } catch (err) {
      toast({
        title: "Check Failed",
        description: "Could not check SEO files",
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };
  
  useEffect(() => {
    checkFiles();
  }, []);
  
  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      // Fallback for browsers without clipboard API
      toast({
        title: "Copy Not Supported",
        description: "Please manually select and copy the text",
        variant: "destructive"
      });
    }
  };
  
  const pingBing = () => {
    window.open(bingSubmitUrl, '_blank');
    toast({
      title: "Opening Bing Webmaster Tools",
      description: "Submit your sitemap to Bing",
    });
  };
  
  const openGoogleConsole = () => {
    window.open(googleSubmitUrl, '_blank');
    toast({
      title: "Opening Google Search Console",
      description: "Submit your sitemap to Google",
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Search className="w-10 h-10 text-purple-400" />
              Elite SEO Tools
            </h1>
            <p className="text-slate-300 mt-2">
              Monitor and optimize your site's search engine visibility
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Status Checks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    SEO Files Status
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Check if required SEO files are deployed
                  </CardDescription>
                </div>
                <Button
                  onClick={checkFiles}
                  disabled={checking}
                  variant="outline"
                  className="border-purple-500/50 hover:bg-purple-500/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sitemap Check */}
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  {sitemapExists === null ? (
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : sitemapExists ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-white font-medium">sitemap.xml</p>
                    <p className="text-sm text-slate-400">{sitemapUrl}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(sitemapUrl, "Sitemap URL")}
                    className="hover:bg-purple-500/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(sitemapUrl, '_blank')}
                    className="hover:bg-purple-500/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Robots.txt Check */}
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  {robotsExists === null ? (
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : robotsExists ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-white font-medium">robots.txt</p>
                    <p className="text-sm text-slate-400">{robotsUrl}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(robotsUrl, "Robots.txt URL")}
                    className="hover:bg-purple-500/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(robotsUrl, '_blank')}
                    className="hover:bg-purple-500/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Search Engine Submission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Search Engine Submission
              </CardTitle>
              <CardDescription className="text-slate-400">
                Submit your sitemap to major search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Bing */}
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Bing Webmaster</h3>
                      <p className="text-xs text-slate-400">Submit via ping</p>
                    </div>
                  </div>
                  <Button
                    onClick={pingBing}
                    disabled={!sitemapExists}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Ping Bing
                  </Button>
                </div>
                
                {/* Google */}
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Google Search Console</h3>
                      <p className="text-xs text-slate-400">Manual submission</p>
                    </div>
                  </div>
                  <Button
                    onClick={openGoogleConsole}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Console
                  </Button>
                </div>
              </div>
              
              {!sitemapExists && (
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-1">Sitemap not found</p>
                    <p>Run <code className="bg-black/30 px-2 py-0.5 rounded">npm run generate-sitemap</code> to create the sitemap, then commit and deploy it.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Meta Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-purple-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="w-5 h-5" />
                SEO Metadata
              </CardTitle>
              <CardDescription className="text-slate-400">
                Structured data for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* JSON-LD */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">JSON-LD Schema</label>
                  <Badge variant="outline" className="border-green-500/50 text-green-400">
                    Active
                  </Badge>
                </div>
                <pre className="bg-black/30 p-4 rounded-lg text-xs text-slate-300 overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "StreamStickPro",
  "url": "${siteBaseUrl}",
  "description": "Premium streaming solutions and IPTV services",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "${siteBaseUrl}/blog?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}`}
                </pre>
              </div>
              
              {/* Meta Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Essential Meta Tags</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(
                      `<meta name="description" content="Premium streaming solutions and IPTV services" />\n<meta property="og:title" content="StreamStickPro" />\n<meta property="og:description" content="Premium streaming solutions and IPTV services" />\n<meta property="og:url" content="${siteBaseUrl}" />`,
                      "Meta tags"
                    )}
                    className="hover:bg-purple-500/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-black/30 p-4 rounded-lg text-xs text-slate-300 overflow-x-auto">
{`<meta name="description" content="Premium streaming solutions" />
<meta property="og:title" content="StreamStickPro" />
<meta property="og:description" content="Premium streaming solutions" />
<meta property="og:url" content="${siteBaseUrl}" />`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
