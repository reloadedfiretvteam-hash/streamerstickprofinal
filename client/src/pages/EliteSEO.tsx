import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Code,
  FileText,
  Zap,
  Globe,
  Shield,
  TrendingUp,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface SitemapCheck {
  exists: boolean;
  url: string;
  status?: number;
}

interface RobotsCheck {
  exists: boolean;
  url: string;
  hasSitemap: boolean;
  content?: string;
}

export default function EliteSEO() {
  const [sitemapCheck, setSitemapCheck] = useState<SitemapCheck | null>(null);
  const [robotsCheck, setRobotsCheck] = useState<RobotsCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [copiedMeta, setCopiedMeta] = useState(false);
  const [copiedJsonLd, setCopiedJsonLd] = useState(false);

  const siteBaseUrl = window.location.origin;

  useEffect(() => {
    document.title = "Elite SEO Tools | StreamStickPro";
    return () => {
      document.title = "StreamStickPro - Jailbroken Fire Sticks & IPTV";
    };
  }, []);

  const checkSitemap = async () => {
    setChecking(true);
    const sitemapUrl = `${siteBaseUrl}/sitemap.xml`;
    
    try {
      const response = await fetch(sitemapUrl, { method: 'HEAD' });
      setSitemapCheck({
        exists: response.ok,
        url: sitemapUrl,
        status: response.status
      });
    } catch (error) {
      setSitemapCheck({
        exists: false,
        url: sitemapUrl,
        status: 0
      });
    }
    
    setChecking(false);
  };

  const checkRobots = async () => {
    setChecking(true);
    const robotsUrl = `${siteBaseUrl}/robots.txt`;
    
    try {
      const response = await fetch(robotsUrl);
      if (response.ok) {
        const content = await response.text();
        setRobotsCheck({
          exists: true,
          url: robotsUrl,
          hasSitemap: content.toLowerCase().includes('sitemap'),
          content: content.substring(0, 500)
        });
      } else {
        setRobotsCheck({
          exists: false,
          url: robotsUrl,
          hasSitemap: false
        });
      }
    } catch (error) {
      setRobotsCheck({
        exists: false,
        url: robotsUrl,
        hasSitemap: false
      });
    }
    
    setChecking(false);
  };

  const pingGoogle = () => {
    const sitemapUrl = encodeURIComponent(`${siteBaseUrl}/sitemap.xml`);
    const pingUrl = `https://www.google.com/ping?sitemap=${sitemapUrl}`;
    window.open(pingUrl, '_blank');
    toast.success("Opened Google ping URL. Check the new tab for results.");
  };

  const pingBing = () => {
    const sitemapUrl = encodeURIComponent(`${siteBaseUrl}/sitemap.xml`);
    const pingUrl = `https://www.bing.com/ping?sitemap=${sitemapUrl}`;
    window.open(pingUrl, '_blank');
    toast.success("Opened Bing ping URL. Check the new tab for results.");
  };

  const openGoogleSearchConsole = () => {
    window.open('https://search.google.com/search-console', '_blank');
  };

  const openBingWebmasterTools = () => {
    window.open('https://www.bing.com/webmasters', '_blank');
  };

  const metaTagsExample = `<!-- Essential SEO Meta Tags -->
<meta name="description" content="Your page description here (150-160 chars)" />
<meta name="keywords" content="fire stick, iptv, streaming, cord cutting" />
<meta name="author" content="StreamStickPro" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${siteBaseUrl}/" />
<meta property="og:title" content="Your Page Title" />
<meta property="og:description" content="Your page description" />
<meta property="og:image" content="${siteBaseUrl}/opengraph.jpg" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="${siteBaseUrl}/" />
<meta name="twitter:title" content="Your Page Title" />
<meta name="twitter:description" content="Your page description" />
<meta name="twitter:image" content="${siteBaseUrl}/opengraph.jpg" />`;

  const jsonLdExample = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "StreamStickPro",
  "url": "${siteBaseUrl}",
  "logo": "${siteBaseUrl}/opengraph.jpg",
  "description": "Premium jailbroken Fire Sticks and IPTV services",
  "sameAs": [
    "https://facebook.com/streamstickpro",
    "https://twitter.com/streamstickpro"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "support@streamstickpro.com"
  }
}
</script>`;

  const copyToClipboard = (text: string, type: 'meta' | 'jsonld') => {
    navigator.clipboard.writeText(text);
    if (type === 'meta') {
      setCopiedMeta(true);
      setTimeout(() => setCopiedMeta(false), 2000);
    } else {
      setCopiedJsonLd(true);
      setTimeout(() => setCopiedJsonLd(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-12">
      {/* Header */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
        <div className="absolute inset-0 opacity-10">
          <TrendingUp className="absolute w-32 h-32 top-4 right-8 text-white" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center px-4">
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold text-white text-center mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Zap className="inline-block w-10 h-10 mr-2 mb-2" />
            Elite SEO Tools
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-100 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Manage sitemaps, meta tags, and search engine optimization
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="checks" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="checks">Health Checks</TabsTrigger>
            <TabsTrigger value="submit">Submit</TabsTrigger>
            <TabsTrigger value="meta">Meta Tags</TabsTrigger>
            <TabsTrigger value="guide">Guide</TabsTrigger>
          </TabsList>

          {/* Health Checks Tab */}
          <TabsContent value="checks">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Sitemap Check */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Sitemap.xml Check
                  </CardTitle>
                  <CardDescription>Verify your sitemap is accessible</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={checkSitemap} 
                    disabled={checking}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Check Sitemap
                  </Button>
                  
                  {sitemapCheck && (
                    <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        {sitemapCheck.exists ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-green-400 font-medium">Sitemap Found</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-400 font-medium">Sitemap Not Found</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 break-all">{sitemapCheck.url}</p>
                      <p className="text-xs text-gray-500 mt-1">Status: {sitemapCheck.status || 'Unknown'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Robots.txt Check */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Robots.txt Check
                  </CardTitle>
                  <CardDescription>Verify robots.txt configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={checkRobots} 
                    disabled={checking}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Check Robots.txt
                  </Button>
                  
                  {robotsCheck && (
                    <div className="p-4 rounded-lg bg-gray-900 border border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        {robotsCheck.exists ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-green-400 font-medium">Robots.txt Found</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-400 font-medium">Robots.txt Not Found</span>
                          </>
                        )}
                      </div>
                      {robotsCheck.exists && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            {robotsCheck.hasSitemap ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-400">Contains sitemap reference</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-yellow-400">No sitemap reference</span>
                              </>
                            )}
                          </div>
                          {robotsCheck.content && (
                            <pre className="text-xs text-gray-400 mt-2 p-2 bg-gray-950 rounded overflow-auto max-h-32">
{robotsCheck.content}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Submit Tab */}
          <TabsContent value="submit">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Google */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    Google Search
                  </CardTitle>
                  <CardDescription>Submit sitemap to Google</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={pingGoogle}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Ping Google
                  </Button>
                  <Button 
                    onClick={openGoogleSearchConsole}
                    variant="outline"
                    className="w-full border-gray-600"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Search Console
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    Use Search Console for full sitemap management and indexing insights
                  </p>
                </CardContent>
              </Card>

              {/* Bing */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    Bing Search
                  </CardTitle>
                  <CardDescription>Submit sitemap to Bing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={pingBing}
                    className="w-full bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Ping Bing
                  </Button>
                  <Button 
                    onClick={openBingWebmasterTools}
                    variant="outline"
                    className="w-full border-gray-600"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Webmaster Tools
                  </Button>
                  <p className="text-xs text-gray-400 mt-2">
                    Bing Webmaster Tools provides detailed crawl and ranking data
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Meta Tags Tab */}
          <TabsContent value="meta">
            <div className="space-y-6">
              {/* Meta Tags */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-purple-400" />
                      Essential Meta Tags
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(metaTagsExample, 'meta')}
                      className="border-gray-600"
                    >
                      {copiedMeta ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copiedMeta ? 'Copied!' : 'Copy'}
                    </Button>
                  </CardTitle>
                  <CardDescription>Include these in your HTML head section</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-gray-300 p-4 bg-gray-950 rounded overflow-auto">
{metaTagsExample}
                  </pre>
                </CardContent>
              </Card>

              {/* JSON-LD Schema */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-orange-400" />
                      JSON-LD Schema Markup
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(jsonLdExample, 'jsonld')}
                      className="border-gray-600"
                    >
                      {copiedJsonLd ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copiedJsonLd ? 'Copied!' : 'Copy'}
                    </Button>
                  </CardTitle>
                  <CardDescription>Structured data for search engines</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-gray-300 p-4 bg-gray-950 rounded overflow-auto">
{jsonLdExample}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-400" />
                  Sitemap Generation Guide
                </CardTitle>
                <CardDescription>Step-by-step instructions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Badge variant="secondary">1</Badge>
                      Set Environment Variables
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      Configure your Supabase credentials (keep these secret!):
                    </p>
                    <pre className="text-xs text-gray-300 p-3 bg-gray-950 rounded">
export SUPABASE_URL="your-project-url"
export SUPABASE_KEY="your-anon-or-service-key"
export SITE_BASE_URL="https://streamstickpro.com"
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Badge variant="secondary">2</Badge>
                      Run Sitemap Generator
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      Execute the script to generate sitemap.xml:
                    </p>
                    <pre className="text-xs text-gray-300 p-3 bg-gray-950 rounded">
npm run generate-sitemap
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Badge variant="secondary">3</Badge>
                      Review Generated File
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      Check the output at:
                    </p>
                    <pre className="text-xs text-gray-300 p-3 bg-gray-950 rounded">
client/public/sitemap.xml
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Badge variant="secondary">4</Badge>
                      Deploy to Cloudflare Pages
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      Commit and push the sitemap to trigger deployment:
                    </p>
                    <pre className="text-xs text-gray-300 p-3 bg-gray-950 rounded">
git add client/public/sitemap.xml
git commit -m "Update sitemap"
git push
                    </pre>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                      <Badge variant="secondary">5</Badge>
                      Submit to Search Engines
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">
                      Use the Submit tab to ping Google and Bing, or manually submit via their consoles.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg">
                    <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Important Notes
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                      <li>Never commit credentials to version control</li>
                      <li>Run SQL script in Supabase SQL Editor (see docs/ELITE_SEO_README.md)</li>
                      <li>Regenerate sitemap when adding new blog posts</li>
                      <li>Verify robots.txt references your sitemap</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
