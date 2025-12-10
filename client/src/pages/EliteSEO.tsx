import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  FileText, 
  Check, 
  X, 
  Globe, 
  Zap, 
  Shield,
  Code,
  RefreshCw,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function EliteSEO() {
  const [sitemapStatus, setSitemapStatus] = useState<'checking' | 'found' | 'missing'>('checking');
  const [robotsStatus, setRobotsStatus] = useState<'checking' | 'found' | 'missing'>('checking');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Elite SEO Tools | StreamStickPro";
    const baseUrl = window.location.origin;
    setSitemapUrl(`${baseUrl}/sitemap.xml`);
    
    // Check if sitemap exists
    fetch('/sitemap.xml')
      .then(res => setSitemapStatus(res.ok ? 'found' : 'missing'))
      .catch(() => setSitemapStatus('missing'));
    
    // Check if robots.txt exists
    fetch('/robots.txt')
      .then(res => setRobotsStatus(res.ok ? 'found' : 'missing'))
      .catch(() => setRobotsStatus('missing'));
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const pingBing = () => {
    const url = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    window.open(url, '_blank');
    toast.success('Opening Bing Webmaster Tools...');
  };

  const pingGoogle = () => {
    const url = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    window.open(url, '_blank');
    toast.success('Notifying Google...');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-12">
      {/* Header */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
        <div className="absolute inset-0 opacity-10">
          <Search className="absolute w-32 h-32 top-4 right-8 text-white" />
          <Code className="absolute w-24 h-24 bottom-4 left-12 text-white" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <Zap className="w-12 h-12 text-yellow-400" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              Elite SEO Tools
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-100 text-center max-w-2xl"
          >
            Manage sitemaps, verify indexing, and optimize your site for search engines
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Sitemap Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {sitemapStatus === 'checking' && (
                    <Badge variant="secondary" className="bg-gray-700">
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Checking...
                    </Badge>
                  )}
                  {sitemapStatus === 'found' && (
                    <Badge className="bg-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      Found
                    </Badge>
                  )}
                  {sitemapStatus === 'missing' && (
                    <Badge variant="destructive">
                      <X className="w-3 h-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                </div>
                {sitemapStatus === 'found' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/sitemap.xml', '_blank')}
                    className="border-gray-600"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Button>
                )}
              </div>
              {sitemapStatus === 'missing' && (
                <p className="text-sm text-gray-400 mt-2">
                  Generate sitemap using the instructions below
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                Robots.txt Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {robotsStatus === 'checking' && (
                    <Badge variant="secondary" className="bg-gray-700">
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Checking...
                    </Badge>
                  )}
                  {robotsStatus === 'found' && (
                    <Badge className="bg-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      Found
                    </Badge>
                  )}
                  {robotsStatus === 'missing' && (
                    <Badge variant="destructive">
                      <X className="w-3 h-3 mr-1" />
                      Missing
                    </Badge>
                  )}
                </div>
                {robotsStatus === 'found' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('/robots.txt', '_blank')}
                    className="border-gray-600"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="sitemap" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
            <TabsTrigger value="submission">Submit to Engines</TabsTrigger>
            <TabsTrigger value="meta">Meta & Schema</TabsTrigger>
          </TabsList>

          {/* Sitemap Tab */}
          <TabsContent value="sitemap" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Generate Sitemap</CardTitle>
                <CardDescription className="text-gray-400">
                  Generate a sitemap from your Supabase blog posts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" />
                    Instructions
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                    <li>Set environment variables: SUPABASE_URL, SUPABASE_KEY, SITE_BASE_URL</li>
                    <li>Run: <code className="bg-gray-800 px-2 py-1 rounded">npm run generate-sitemap</code></li>
                    <li>Commit and push the generated sitemap.xml file</li>
                    <li>Deploy triggers automatically on Cloudflare Pages</li>
                  </ol>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Command</h3>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value="SUPABASE_URL=xxx SUPABASE_KEY=xxx SITE_BASE_URL=https://streamstickpro.com npm run generate-sitemap"
                      className="bg-gray-800 border-gray-600 text-sm font-mono"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard('SUPABASE_URL=xxx SUPABASE_KEY=xxx SITE_BASE_URL=https://streamstickpro.com npm run generate-sitemap')}
                      className="border-gray-600"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-yellow-200 mb-1">Security Note</h3>
                      <p className="text-sm text-yellow-200/80">
                        Use SUPABASE_SERVICE_ROLE_KEY for complete access. Rotate keys after use in CI/CD.
                        Never commit secrets to the repository.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submission Tab */}
          <TabsContent value="submission" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Submit to Search Engines</CardTitle>
                <CardDescription className="text-gray-400">
                  Ping Bing and Google to notify them of your sitemap
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Sitemap URL</h3>
                  <div className="flex items-center gap-2">
                    <Input
                      readOnly
                      value={sitemapUrl}
                      className="bg-gray-800 border-gray-600"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(sitemapUrl)}
                      className="border-gray-600"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-400" />
                        Google Search Console
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-gray-400">
                        Submit your sitemap to Google for faster indexing
                      </p>
                      <Button
                        onClick={pingGoogle}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ping Google
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5 text-orange-400" />
                        Bing Webmaster Tools
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-gray-400">
                        Submit your sitemap to Bing for better indexing
                      </p>
                      <Button
                        onClick={pingBing}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ping Bing
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-900/20 border border-blue-700/50 p-4 rounded-lg">
                  <div className="flex gap-2">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-blue-200 mb-1">Manual Submission</h3>
                      <p className="text-sm text-blue-200/80 mb-2">
                        For complete control, submit your sitemap manually:
                      </p>
                      <ul className="text-sm text-blue-200/80 space-y-1 ml-4 list-disc">
                        <li>Google: <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="underline">search.google.com/search-console</a></li>
                        <li>Bing: <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="underline">bing.com/webmasters</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meta & Schema Tab */}
          <TabsContent value="meta" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Meta Tags & JSON-LD Schema</CardTitle>
                <CardDescription className="text-gray-400">
                  Example meta tags and JSON-LD structured data for blog posts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">HTML Meta Tags</h3>
                  <pre className="text-xs text-gray-400 overflow-x-auto">
{`<head>
  <title>Your Blog Post Title | StreamStickPro</title>
  <meta name="description" content="Your post description" />
  <meta property="og:title" content="Your Blog Post Title" />
  <meta property="og:description" content="Your post description" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://streamstickpro.com/blog/your-slug" />
  <meta name="twitter:card" content="summary_large_image" />
</head>`}
                  </pre>
                </div>

                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">JSON-LD Schema</h3>
                  <pre className="text-xs text-gray-400 overflow-x-auto">
{`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Your Blog Post Title",
  "description": "Your post excerpt",
  "datePublished": "2025-01-15T00:00:00Z",
  "author": {
    "@type": "Organization",
    "name": "StreamStickPro"
  },
  "articleBody": "Full article content..."
}
</script>`}
                  </pre>
                </div>

                <div className="bg-green-900/20 border border-green-700/50 p-4 rounded-lg">
                  <div className="flex gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-green-200 mb-1">Already Implemented</h3>
                      <p className="text-sm text-green-200/80">
                        The Blog component already includes JSON-LD structured data for blog posts.
                        Check the Blog.tsx component for implementation details.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Documentation Link */}
        <Card className="mt-8 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">
              For complete step-by-step instructions, including SQL view creation, RLS considerations,
              and key rotation procedures, see the Elite SEO documentation.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open('/docs/ELITE_SEO_README.md', '_blank')}
              className="border-purple-600 hover:bg-purple-600/20"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Full Documentation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
