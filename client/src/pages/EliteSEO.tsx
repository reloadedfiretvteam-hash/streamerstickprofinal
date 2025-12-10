import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Globe,
  FileText,
  Code,
  Sparkles,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface SitemapStatus {
  exists: boolean;
  url: string;
  lastChecked: Date;
}

interface RobotsStatus {
  exists: boolean;
  url: string;
  lastChecked: Date;
}

export default function EliteSEO() {
  const [sitemapStatus, setSitemapStatus] = useState<SitemapStatus | null>(null);
  const [robotsStatus, setRobotsStatus] = useState<RobotsStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const siteUrl = window.location.origin;
  const sitemapUrl = `${siteUrl}/sitemap.xml`;
  const robotsUrl = `${siteUrl}/robots.txt`;

  const checkFiles = async () => {
    setChecking(true);
    
    try {
      // Check sitemap
      const sitemapResponse = await fetch(sitemapUrl, { method: 'HEAD' });
      setSitemapStatus({
        exists: sitemapResponse.ok,
        url: sitemapUrl,
        lastChecked: new Date()
      });

      // Check robots.txt
      const robotsResponse = await fetch(robotsUrl, { method: 'HEAD' });
      setRobotsStatus({
        exists: robotsResponse.ok,
        url: robotsUrl,
        lastChecked: new Date()
      });

      toast({
        title: "Check Complete",
        description: "SEO files have been checked successfully."
      });
    } catch (error) {
      toast({
        title: "Check Failed",
        description: "Failed to check SEO files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setChecking(false);
    }
  };

  const pingSearchEngine = (engine: 'google' | 'bing') => {
    const urls = {
      google: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      bing: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    };

    window.open(urls[engine], '_blank');
    toast({
      title: `${engine === 'google' ? 'Google' : 'Bing'} Notified`,
      description: `Sitemap ping sent to ${engine === 'google' ? 'Google' : 'Bing'}.`
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    checkFiles();
  }, []);

  // JSON-LD schema examples
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "StreamStick Pro",
    "url": siteUrl,
    "logo": `${siteUrl}/favicon.png`,
    "sameAs": [
      // Add your social media URLs here
    ]
    // Note: Add contactPoint with your support email when available
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "StreamStick Pro",
    "url": siteUrl
    // Note: Add SearchAction when search functionality is implemented
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-blue-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Elite SEO Tools
              </h1>
            </div>
            <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
              Manage your sitemap, monitor SEO health, and boost search engine visibility
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-900/50 border-blue-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Sitemap Status
                  </CardTitle>
                  {sitemapStatus && (
                    sitemapStatus.exists ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Status:</span>
                    {sitemapStatus ? (
                      <Badge variant={sitemapStatus.exists ? "default" : "destructive"}>
                        {sitemapStatus.exists ? "Active" : "Not Found"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Checking...</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">URL:</span>
                    <a 
                      href={sitemapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {sitemapStatus && (
                    <div className="text-xs text-slate-500">
                      Last checked: {sitemapStatus.lastChecked.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-900/50 border-blue-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    Robots.txt Status
                  </CardTitle>
                  {robotsStatus && (
                    robotsStatus.exists ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Status:</span>
                    {robotsStatus ? (
                      <Badge variant={robotsStatus.exists ? "default" : "destructive"}>
                        {robotsStatus.exists ? "Active" : "Not Found"}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Checking...</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">URL:</span>
                    <a 
                      href={robotsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {robotsStatus && (
                    <div className="text-xs text-slate-500">
                      Last checked: {robotsStatus.lastChecked.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="bg-slate-900/50 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                Search Engine Tools
              </CardTitle>
              <CardDescription className="text-slate-400">
                Notify search engines about your sitemap updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={checkFiles}
                  disabled={checking}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {checking ? "Checking..." : "Recheck Files"}
                </Button>
                <Button
                  onClick={() => pingSearchEngine('google')}
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Ping Google
                </Button>
                <Button
                  onClick={() => pingSearchEngine('bing')}
                  variant="outline"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Ping Bing
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs for Instructions and Schema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs defaultValue="instructions" className="space-y-4">
            <TabsList className="bg-slate-900/50 border border-blue-500/20">
              <TabsTrigger value="instructions">Generation Instructions</TabsTrigger>
              <TabsTrigger value="schema">JSON-LD Schemas</TabsTrigger>
              <TabsTrigger value="meta">Meta Tags</TabsTrigger>
            </TabsList>

            <TabsContent value="instructions">
              <Card className="bg-slate-900/50 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-400" />
                    Sitemap Generation Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-slate-300">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      Prerequisites
                    </h3>
                    <ul className="list-disc list-inside space-y-1 ml-6 text-sm">
                      <li>SUPABASE_URL environment variable set</li>
                      <li>SUPABASE_KEY (or SUPABASE_ANON_KEY) environment variable set</li>
                      <li>Optional: SITE_BASE_URL (defaults to https://streamstickpro.com)</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Step 1: Run SQL Script (First Time Only)</h3>
                    <p className="text-sm text-slate-400">
                      If your blog posts table is named "blog_posts", run the SQL script in Supabase SQL Editor:
                    </p>
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-blue-500/20 relative">
                      <code className="text-xs text-green-400">scripts/create-blogview.sql</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard('scripts/create-blogview.sql', 'Script path')}
                      >
                        {copied === 'Script path' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Step 2: Generate Sitemap</h3>
                    <p className="text-sm text-slate-400">
                      Run the sitemap generation script:
                    </p>
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-blue-500/20 relative">
                      <code className="text-xs text-green-400">npm run generate-sitemap</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard('npm run generate-sitemap', 'Command')}
                      >
                        {copied === 'Command' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Step 3: Deploy</h3>
                    <ul className="list-decimal list-inside space-y-1 ml-6 text-sm">
                      <li>Commit the generated sitemap.xml file</li>
                      <li>Push to your repository</li>
                      <li>Deploy to Cloudflare Pages</li>
                      <li>Verify at {sitemapUrl}</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white">Step 4: Submit to Search Engines</h3>
                    <ul className="list-disc list-inside space-y-1 ml-6 text-sm">
                      <li>Submit to Google Search Console</li>
                      <li>Submit to Bing Webmaster Tools</li>
                      <li>Use the "Ping" buttons above for quick notifications</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-yellow-400 mb-1">Important Note</p>
                        <p className="text-slate-300">
                          See docs/ELITE_SEO_README.md for detailed instructions including RLS setup and security considerations.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schema">
              <Card className="bg-slate-900/50 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-400" />
                    JSON-LD Structured Data
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Copy these schemas to enhance your SEO
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white">Organization Schema</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(JSON.stringify(organizationSchema, null, 2), 'Organization schema')}
                      >
                        {copied === 'Organization schema' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <pre className="bg-slate-950/50 p-4 rounded-lg border border-blue-500/20 overflow-x-auto text-xs">
                      <code className="text-green-400">{JSON.stringify(organizationSchema, null, 2)}</code>
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-white">Website Schema</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(JSON.stringify(websiteSchema, null, 2), 'Website schema')}
                      >
                        {copied === 'Website schema' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <pre className="bg-slate-950/50 p-4 rounded-lg border border-blue-500/20 overflow-x-auto text-xs">
                      <code className="text-green-400">{JSON.stringify(websiteSchema, null, 2)}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="meta">
              <Card className="bg-slate-900/50 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-400" />
                    Essential Meta Tags
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Recommended meta tags for optimal SEO
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Basic Meta Tags', code: `<meta name="description" content="Your page description">\n<meta name="keywords" content="fire stick, iptv, streaming">` },
                    { name: 'Open Graph', code: `<meta property="og:title" content="StreamStick Pro">\n<meta property="og:description" content="Your description">\n<meta property="og:image" content="${siteUrl}/opengraph.jpg">\n<meta property="og:url" content="${siteUrl}">` },
                    { name: 'Twitter Card', code: `<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="StreamStick Pro">\n<meta name="twitter:description" content="Your description">\n<meta name="twitter:image" content="${siteUrl}/opengraph.jpg">` }
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(item.code, item.name)}
                        >
                          {copied === item.name ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <pre className="bg-slate-950/50 p-4 rounded-lg border border-blue-500/20 overflow-x-auto text-xs">
                        <code className="text-green-400">{item.code}</code>
                      </pre>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
