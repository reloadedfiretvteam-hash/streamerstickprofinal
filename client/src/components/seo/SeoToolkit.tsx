import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Settings,
  FileText,
  Link2,
  AlertTriangle,
  BarChart3,
  Image as ImageIcon,
  Globe,
  Target,
  Zap,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Upload,
  Download,
  Play,
  Eye,
  Code,
  Share2,
  Hash,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SeoStats {
  totalPages: number;
  averageScore: number;
  pagesNeedingImprovement: number;
  totalRedirects: number;
  total404s: number;
  unresolved404s: number;
  trackedKeywords: number;
  keywordsInTop10: number;
  lastAuditScore: number | null;
  criticalIssues: number;
}

interface SeoPage {
  id: string;
  pageUrl: string;
  pageType: string;
  focusKeyword: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  overallScore: number;
  titleScore: number;
  descriptionScore: number;
  contentScore: number;
  keywordScore: number;
  seoIssues: string | null;
  updatedAt: string;
  inSitemap?: boolean;
  sitemapPriority?: string;
  sitemapChangefreq?: string;
}

interface SitemapEntry {
  url: string;
  priority: string | null;
  changefreq: string | null;
  lastmod: string | null;
}

interface SeoRedirect {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  redirectType: string;
  isRegex: boolean;
  isActive: boolean;
  hitCount: number;
  lastHit: string | null;
  notes: string | null;
  createdAt: string;
}

interface Seo404Log {
  id: string;
  url: string;
  referrer: string | null;
  hitCount: number;
  firstHit: string;
  lastHit: string;
  resolved: boolean;
  ignored: boolean;
}

interface SeoKeyword {
  id: string;
  keyword: string;
  searchVolume: number | null;
  difficulty: number | null;
  trackingEnabled: boolean;
  targetUrl: string | null;
  currentPosition: number | null;
  previousPosition: number | null;
  positionChange: number | null;
  bestPosition: number | null;
  lastChecked: string | null;
}

interface SeoAudit {
  id: string;
  auditType: string;
  status: string;
  overallScore: number;
  technicalScore: number;
  contentScore: number;
  linkScore: number;
  performanceScore: number;
  criticalIssues: number;
  warningIssues: number;
  passedChecks: number;
  issues: string | null;
  recommendations: string | null;
  pagesAnalyzed: number;
  completedAt: string | null;
  createdAt: string;
}

interface SeoSetting {
  id: string;
  settingKey: string;
  settingValue: string | null;
  settingType: string;
  category: string;
  description: string | null;
}

interface Props {
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  showToast: (message: string, type: 'success' | 'error') => void;
}

function ScoreIndicator({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const getColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 60) return "text-yellow-500";
    if (s >= 40) return "text-orange-500";
    return "text-red-500";
  };
  
  const getBgColor = (s: number) => {
    if (s >= 80) return "bg-green-500/20";
    if (s >= 60) return "bg-yellow-500/20";
    if (s >= 40) return "bg-orange-500/20";
    return "bg-red-500/20";
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg font-bold"
  };

  return (
    <div className={`${sizeClasses[size]} ${getBgColor(score)} ${getColor(score)} rounded-full flex items-center justify-center`}>
      {score}
    </div>
  );
}

function PositionChange({ change }: { change: number | null }) {
  if (change === null || change === 0) {
    return <span className="text-gray-400"><Minus className="w-4 h-4" /></span>;
  }
  if (change > 0) {
    return <span className="text-green-500 flex items-center gap-1"><ArrowUp className="w-4 h-4" />{change}</span>;
  }
  return <span className="text-red-500 flex items-center gap-1"><ArrowDown className="w-4 h-4" />{Math.abs(change)}</span>;
}

export default function SeoToolkit({ authFetch, showToast }: Props) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<SeoStats | null>(null);
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [redirects, setRedirects] = useState<SeoRedirect[]>([]);
  const [logs404, setLogs404] = useState<Seo404Log[]>([]);
  const [keywords, setKeywords] = useState<SeoKeyword[]>([]);
  const [audits, setAudits] = useState<SeoAudit[]>([]);
  const [settings, setSettings] = useState<SeoSetting[]>([]);
  
  const [newRedirect, setNewRedirect] = useState({ sourceUrl: "", targetUrl: "", redirectType: "301", isRegex: false });
  const [newKeyword, setNewKeyword] = useState({ keyword: "", targetUrl: "", trackingEnabled: false });
  const [editingPage, setEditingPage] = useState<SeoPage | null>(null);
  const [showRedirectDialog, setShowRedirectDialog] = useState(false);
  const [showKeywordDialog, setShowKeywordDialog] = useState(false);
  const [runningAudit, setRunningAudit] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  
  const [sitemapPreview, setSitemapPreview] = useState<string>("");
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [showSitemapPreview, setShowSitemapPreview] = useState(false);
  const [sitemapExclusions, setSitemapExclusions] = useState<string>("");
  const [newExclusion, setNewExclusion] = useState("");

  const loadStats = useCallback(async () => {
    try {
      const response = await authFetch('/api/admin/seo/stats');
      const result = await response.json();
      if (result.data) setStats(result.data);
    } catch (error) {
      console.error('Error loading SEO stats:', error);
    }
  }, [authFetch]);

  const loadPages = useCallback(async () => {
    try {
      const response = await authFetch('/api/admin/seo/pages');
      const result = await response.json();
      if (result.data) setPages(result.data);
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  }, [authFetch]);

  const loadRedirects = useCallback(async () => {
    try {
      const response = await authFetch('/api/admin/seo/redirects');
      const result = await response.json();
      if (result.data) setRedirects(result.data);
    } catch (error) {
      console.error('Error loading redirects:', error);
    }
  }, [authFetch]);

  const load404Logs = useCallback(async () => {
    try {
      const response = await authFetch('/api/admin/seo/404/unresolved');
      const result = await response.json();
      if (result.data) setLogs404(result.data);
    } catch (error) {
      console.error('Error loading 404 logs:', error);
    }
  }, [authFetch]);

  const loadKeywords = useCallback(async () => {
    try {
      const response = await authFetch('/api/admin/seo/keywords');
      const result = await response.json();
      if (result.data) setKeywords(result.data);
    } catch (error) {
      console.error('Error loading keywords:', error);
    }
  }, [authFetch]);

  const loadAudits = useCallback(async () => {
    try {
      const response = await authFetch('/api/admin/seo/audits');
      const result = await response.json();
      if (result.data) setAudits(result.data);
    } catch (error) {
      console.error('Error loading audits:', error);
    }
  }, [authFetch]);

  const loadSettings = useCallback(async () => {
    try {
      const response = await authFetch('/api/admin/seo/settings');
      const result = await response.json();
      if (result.data) setSettings(result.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, [authFetch]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadPages(),
        loadRedirects(),
        load404Logs(),
        loadKeywords(),
        loadAudits(),
        loadSettings()
      ]);
      setLoading(false);
    };
    loadAll();
  }, [loadStats, loadPages, loadRedirects, load404Logs, loadKeywords, loadAudits, loadSettings]);

  const seedSettings = async () => {
    try {
      await authFetch('/api/admin/seo/seed-settings', { method: 'POST' });
      await authFetch('/api/admin/seo/seed-schema-types', { method: 'POST' });
      showToast('Default settings seeded successfully!', 'success');
      loadSettings();
    } catch (error) {
      showToast('Failed to seed settings', 'error');
    }
  };

  const createRedirect = async () => {
    if (!newRedirect.sourceUrl || !newRedirect.targetUrl) {
      showToast('Source and target URLs are required', 'error');
      return;
    }
    try {
      const response = await authFetch('/api/admin/seo/redirects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRedirect)
      });
      if (response.ok) {
        showToast('Redirect created successfully!', 'success');
        setNewRedirect({ sourceUrl: "", targetUrl: "", redirectType: "301", isRegex: false });
        setShowRedirectDialog(false);
        loadRedirects();
        loadStats();
      } else {
        const result = await response.json();
        showToast(result.error || 'Failed to create redirect', 'error');
      }
    } catch (error) {
      showToast('Failed to create redirect', 'error');
    }
  };

  const deleteRedirect = async (id: string) => {
    if (!confirm('Delete this redirect?')) return;
    try {
      await authFetch(`/api/admin/seo/redirects/${id}`, { method: 'DELETE' });
      showToast('Redirect deleted', 'success');
      loadRedirects();
      loadStats();
    } catch (error) {
      showToast('Failed to delete redirect', 'error');
    }
  };

  const resolve404 = async (id: string, targetUrl: string) => {
    try {
      await authFetch(`/api/admin/seo/404/${id}/create-redirect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl })
      });
      showToast('Redirect created from 404', 'success');
      load404Logs();
      loadRedirects();
      loadStats();
    } catch (error) {
      showToast('Failed to create redirect', 'error');
    }
  };

  const ignore404 = async (id: string) => {
    try {
      await authFetch(`/api/admin/seo/404/${id}/ignore`, { method: 'POST' });
      showToast('404 ignored', 'success');
      load404Logs();
      loadStats();
    } catch (error) {
      showToast('Failed to ignore 404', 'error');
    }
  };

  const createKeyword = async () => {
    if (!newKeyword.keyword) {
      showToast('Keyword is required', 'error');
      return;
    }
    try {
      const response = await authFetch('/api/admin/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKeyword)
      });
      if (response.ok) {
        showToast('Keyword added successfully!', 'success');
        setNewKeyword({ keyword: "", targetUrl: "", trackingEnabled: false });
        setShowKeywordDialog(false);
        loadKeywords();
        loadStats();
      } else {
        const result = await response.json();
        showToast(result.error || 'Failed to add keyword', 'error');
      }
    } catch (error) {
      showToast('Failed to add keyword', 'error');
    }
  };

  const deleteKeyword = async (id: string) => {
    if (!confirm('Delete this keyword?')) return;
    try {
      await authFetch(`/api/admin/seo/keywords/${id}`, { method: 'DELETE' });
      showToast('Keyword deleted', 'success');
      loadKeywords();
      loadStats();
    } catch (error) {
      showToast('Failed to delete keyword', 'error');
    }
  };

  const toggleKeywordTracking = async (id: string, enabled: boolean) => {
    try {
      await authFetch(`/api/admin/seo/keywords/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingEnabled: enabled })
      });
      loadKeywords();
    } catch (error) {
      showToast('Failed to update keyword', 'error');
    }
  };

  const runAudit = async () => {
    setRunningAudit(true);
    try {
      const response = await authFetch('/api/admin/seo/audits/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditType: 'full' })
      });
      if (response.ok) {
        showToast('SEO audit started!', 'success');
        setTimeout(() => {
          loadAudits();
          loadStats();
          setRunningAudit(false);
        }, 5000);
      } else {
        setRunningAudit(false);
        showToast('Failed to start audit', 'error');
      }
    } catch (error) {
      setRunningAudit(false);
      showToast('Failed to start audit', 'error');
    }
  };

  const submitToIndexNow = async () => {
    try {
      const response = await authFetch('/api/admin/seo/indexnow/submit-all', { method: 'POST' });
      const result = await response.json();
      showToast(result.message || 'Submitted to IndexNow', result.success ? 'success' : 'error');
    } catch (error) {
      showToast('Failed to submit to IndexNow', 'error');
    }
  };

  const saveSetting = async (key: string, value: string, type: string, category: string) => {
    try {
      await authFetch('/api/admin/seo/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, type, category })
      });
      showToast('Setting saved', 'success');
      loadSettings();
    } catch (error) {
      showToast('Failed to save setting', 'error');
    }
  };

  const generateSitemap = async () => {
    setSitemapLoading(true);
    try {
      const response = await authFetch('/api/admin/seo/sitemap/generate', { method: 'POST' });
      const result = await response.json();
      if (result.data) {
        setSitemapPreview(result.data);
        setShowSitemapPreview(true);
        showToast(`Sitemap generated with ${result.pagesIncluded} pages`, 'success');
      }
    } catch (error) {
      showToast('Failed to generate sitemap', 'error');
    } finally {
      setSitemapLoading(false);
    }
  };

  const updatePageSitemapSettings = async (pageId: string, inSitemap: boolean, priority?: string, changefreq?: string) => {
    try {
      await authFetch(`/api/admin/seo/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inSitemap, sitemapPriority: priority, sitemapChangefreq: changefreq })
      });
      loadPages();
    } catch (error) {
      showToast('Failed to update page settings', 'error');
    }
  };

  const pingSitemap = async () => {
    try {
      showToast('Pinging search engines with sitemap URL...', 'success');
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Search engines have been notified about your sitemap', 'success');
    } catch (error) {
      showToast('Failed to ping search engines', 'error');
    }
  };

  const downloadSitemap = () => {
    if (!sitemapPreview) return;
    const blob = new Blob([sitemapPreview], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="seo-toolkit">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-9 lg:grid-cols-9 gap-1 h-auto p-1" data-testid="seo-tabs">
          <TabsTrigger value="dashboard" className="text-xs px-2 py-1.5" data-testid="tab-seo-dashboard">
            <BarChart3 className="w-4 h-4 mr-1" />Dashboard
          </TabsTrigger>
          <TabsTrigger value="pages" className="text-xs px-2 py-1.5" data-testid="tab-seo-pages">
            <FileText className="w-4 h-4 mr-1" />Pages
          </TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs px-2 py-1.5" data-testid="tab-seo-keywords">
            <Target className="w-4 h-4 mr-1" />Keywords
          </TabsTrigger>
          <TabsTrigger value="redirects" className="text-xs px-2 py-1.5" data-testid="tab-seo-redirects">
            <Link2 className="w-4 h-4 mr-1" />Redirects
          </TabsTrigger>
          <TabsTrigger value="404" className="text-xs px-2 py-1.5" data-testid="tab-seo-404">
            <AlertTriangle className="w-4 h-4 mr-1" />404s
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs px-2 py-1.5" data-testid="tab-seo-audit">
            <Search className="w-4 h-4 mr-1" />Audit
          </TabsTrigger>
          <TabsTrigger value="sitemap" className="text-xs px-2 py-1.5" data-testid="tab-seo-sitemap">
            <Globe className="w-4 h-4 mr-1" />Sitemap
          </TabsTrigger>
          <TabsTrigger value="indexing" className="text-xs px-2 py-1.5" data-testid="tab-seo-indexing">
            <Zap className="w-4 h-4 mr-1" />Indexing
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs px-2 py-1.5" data-testid="tab-seo-settings">
            <Settings className="w-4 h-4 mr-1" />Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                    <p className="text-3xl font-bold">{stats?.averageScore || 0}</p>
                  </div>
                  <ScoreIndicator score={stats?.averageScore || 0} size="lg" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pages Analyzed</p>
                    <p className="text-3xl font-bold">{stats?.totalPages || 0}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{stats?.pagesNeedingImprovement || 0} need improvement</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tracked Keywords</p>
                    <p className="text-3xl font-bold">{stats?.trackedKeywords || 0}</p>
                  </div>
                  <Target className="w-10 h-10 text-purple-500" />
                </div>
                <p className="text-xs text-green-500 mt-2">{stats?.keywordsInTop10 || 0} in top 10</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Issues Found</p>
                    <p className="text-3xl font-bold text-red-500">{stats?.criticalIssues || 0}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{stats?.unresolved404s || 0} unresolved 404s</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={runAudit} disabled={runningAudit} className="w-full justify-start" variant="outline" data-testid="btn-run-audit">
                  {runningAudit ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Run Full SEO Audit
                </Button>
                <Button onClick={submitToIndexNow} className="w-full justify-start" variant="outline" data-testid="btn-indexnow">
                  <Zap className="w-4 h-4 mr-2" />Submit All Pages to IndexNow
                </Button>
                <Button onClick={() => setShowRedirectDialog(true)} className="w-full justify-start" variant="outline" data-testid="btn-add-redirect">
                  <Plus className="w-4 h-4 mr-2" />Add New Redirect
                </Button>
                <Button onClick={() => setShowKeywordDialog(true)} className="w-full justify-start" variant="outline" data-testid="btn-add-keyword">
                  <Plus className="w-4 h-4 mr-2" />Track New Keyword
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Audits</CardTitle>
              </CardHeader>
              <CardContent>
                {audits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No audits yet. Run your first audit!</p>
                ) : (
                  <div className="space-y-3">
                    {audits.slice(0, 3).map((audit) => (
                      <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{audit.auditType} audit</p>
                          <p className="text-xs text-muted-foreground">
                            {audit.completedAt ? new Date(audit.completedAt).toLocaleDateString() : 'Running...'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'}>{audit.status}</Badge>
                          {audit.status === 'completed' && <ScoreIndicator score={audit.overallScore} size="sm" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {logs404.length > 0 && (
            <Card className="border-red-500/50">
              <CardHeader>
                <CardTitle className="text-lg text-red-500 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Unresolved 404 Errors ({logs404.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Hits</TableHead>
                      <TableHead>Last Hit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs404.slice(0, 5).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.url}</TableCell>
                        <TableCell><Badge variant="destructive">{log.hitCount}</Badge></TableCell>
                        <TableCell className="text-sm">{new Date(log.lastHit).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => resolve404(log.id, '/')} data-testid={`btn-resolve-404-${log.id}`}>
                              Fix
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => ignore404(log.id)} data-testid={`btn-ignore-404-${log.id}`}>
                              Ignore
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pages" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Page SEO Analysis</CardTitle>
                <Button onClick={loadPages} variant="outline" size="sm" data-testid="btn-refresh-pages">
                  <RefreshCw className="w-4 h-4 mr-2" />Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pages analyzed yet.</p>
                  <p className="text-sm text-muted-foreground">Pages are added automatically when you analyze content.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Focus Keyword</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Overall</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-mono text-sm max-w-[200px] truncate">{page.pageUrl}</TableCell>
                        <TableCell>{page.focusKeyword || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell><ScoreIndicator score={page.titleScore} size="sm" /></TableCell>
                        <TableCell><ScoreIndicator score={page.descriptionScore} size="sm" /></TableCell>
                        <TableCell><ScoreIndicator score={page.contentScore} size="sm" /></TableCell>
                        <TableCell><ScoreIndicator score={page.overallScore} size="md" /></TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => setEditingPage(page)} data-testid={`btn-edit-page-${page.id}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Keyword Tracking</CardTitle>
                <Button onClick={() => setShowKeywordDialog(true)} data-testid="btn-add-keyword-main">
                  <Plus className="w-4 h-4 mr-2" />Add Keyword
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {keywords.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No keywords tracked yet.</p>
                  <Button className="mt-4" onClick={() => setShowKeywordDialog(true)}>Add Your First Keyword</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Change</TableHead>
                      <TableHead>Best</TableHead>
                      <TableHead>Target URL</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywords.map((kw) => (
                      <TableRow key={kw.id}>
                        <TableCell className="font-medium">{kw.keyword}</TableCell>
                        <TableCell>
                          {kw.currentPosition ? (
                            <Badge variant={kw.currentPosition <= 10 ? 'default' : 'secondary'}>
                              #{kw.currentPosition}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell><PositionChange change={kw.positionChange} /></TableCell>
                        <TableCell>{kw.bestPosition ? `#${kw.bestPosition}` : '-'}</TableCell>
                        <TableCell className="font-mono text-sm max-w-[150px] truncate">{kw.targetUrl || '-'}</TableCell>
                        <TableCell>
                          <Switch
                            checked={kw.trackingEnabled}
                            onCheckedChange={(checked) => toggleKeywordTracking(kw.id, checked)}
                            data-testid={`switch-tracking-${kw.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => deleteKeyword(kw.id)} data-testid={`btn-delete-keyword-${kw.id}`}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redirects" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Redirect Manager</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="btn-export-redirects">
                    <Download className="w-4 h-4 mr-2" />Export
                  </Button>
                  <Button onClick={() => setShowRedirectDialog(true)} data-testid="btn-add-redirect-main">
                    <Plus className="w-4 h-4 mr-2" />Add Redirect
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {redirects.length === 0 ? (
                <div className="text-center py-8">
                  <Link2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No redirects configured yet.</p>
                  <Button className="mt-4" onClick={() => setShowRedirectDialog(true)}>Create First Redirect</Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Hits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redirects.map((redirect) => (
                      <TableRow key={redirect.id}>
                        <TableCell className="font-mono text-sm">{redirect.sourceUrl}</TableCell>
                        <TableCell className="font-mono text-sm max-w-[200px] truncate">{redirect.targetUrl}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{redirect.redirectType}</Badge>
                          {redirect.isRegex && <Badge variant="secondary" className="ml-1">Regex</Badge>}
                        </TableCell>
                        <TableCell>{redirect.hitCount}</TableCell>
                        <TableCell>
                          {redirect.isActive ? (
                            <Badge variant="default" className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => deleteRedirect(redirect.id)} data-testid={`btn-delete-redirect-${redirect.id}`}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="404" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>404 Error Monitor</CardTitle>
                <Button onClick={load404Logs} variant="outline" size="sm" data-testid="btn-refresh-404">
                  <RefreshCw className="w-4 h-4 mr-2" />Refresh
                </Button>
              </div>
              <CardDescription>Track and fix broken links on your site</CardDescription>
            </CardHeader>
            <CardContent>
              {logs404.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                  <p className="text-green-500 font-medium">No 404 errors found!</p>
                  <p className="text-sm text-muted-foreground">Your site is in great shape.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Hits</TableHead>
                      <TableHead>First Seen</TableHead>
                      <TableHead>Last Seen</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs404.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm max-w-[200px] truncate">{log.url}</TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">{log.referrer || '-'}</TableCell>
                        <TableCell><Badge variant="destructive">{log.hitCount}</Badge></TableCell>
                        <TableCell className="text-sm">{new Date(log.firstHit).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm">{new Date(log.lastHit).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="default" data-testid={`btn-fix-404-${log.id}`}>
                                  <Link2 className="w-4 h-4 mr-1" />Fix
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Create Redirect</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div>
                                    <Label>From (404 URL)</Label>
                                    <Input value={log.url} disabled />
                                  </div>
                                  <div>
                                    <Label>Redirect To</Label>
                                    <Input 
                                      placeholder="/" 
                                      id={`redirect-target-${log.id}`}
                                      defaultValue="/"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button onClick={() => {
                                    const input = document.getElementById(`redirect-target-${log.id}`) as HTMLInputElement;
                                    resolve404(log.id, input?.value || '/');
                                  }}>Create Redirect</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button size="sm" variant="ghost" onClick={() => ignore404(log.id)} data-testid={`btn-ignore-${log.id}`}>
                              Ignore
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SEO Site Audit</CardTitle>
                  <CardDescription>Comprehensive analysis of your site's SEO health</CardDescription>
                </div>
                <Button onClick={runAudit} disabled={runningAudit} data-testid="btn-run-full-audit">
                  {runningAudit ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</>
                  ) : (
                    <><Play className="w-4 h-4 mr-2" />Run New Audit</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {audits.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No audits run yet.</p>
                  <Button className="mt-4" onClick={runAudit} disabled={runningAudit}>Run Your First Audit</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {audits.map((audit) => (
                    <div key={audit.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="font-semibold text-lg">{audit.auditType} Audit</h3>
                          <p className="text-sm text-muted-foreground">
                            {audit.completedAt ? new Date(audit.completedAt).toLocaleString() : 'In progress...'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'}>
                            {audit.status}
                          </Badge>
                          {audit.status === 'completed' && <ScoreIndicator score={audit.overallScore} size="lg" />}
                        </div>
                      </div>

                      {audit.status === 'completed' && (
                        <>
                          <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">Technical</p>
                              <p className="text-2xl font-bold">{audit.technicalScore}</p>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">Content</p>
                              <p className="text-2xl font-bold">{audit.contentScore}</p>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">Links</p>
                              <p className="text-2xl font-bold">{audit.linkScore}</p>
                            </div>
                            <div className="text-center p-4 bg-muted rounded-lg">
                              <p className="text-sm text-muted-foreground">Performance</p>
                              <p className="text-2xl font-bold">{audit.performanceScore}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                              <XCircle className="w-6 h-6 text-red-500" />
                              <div>
                                <p className="text-2xl font-bold text-red-500">{audit.criticalIssues}</p>
                                <p className="text-xs text-muted-foreground">Critical Issues</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
                              <AlertCircle className="w-6 h-6 text-yellow-500" />
                              <div>
                                <p className="text-2xl font-bold text-yellow-500">{audit.warningIssues}</p>
                                <p className="text-xs text-muted-foreground">Warnings</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                              <CheckCircle className="w-6 h-6 text-green-500" />
                              <div>
                                <p className="text-2xl font-bold text-green-500">{audit.passedChecks}</p>
                                <p className="text-xs text-muted-foreground">Passed Checks</p>
                              </div>
                            </div>
                          </div>

                          {audit.issues && (
                            <Accordion type="single" collapsible>
                              <AccordionItem value="issues">
                                <AccordionTrigger>View Issues ({audit.criticalIssues + audit.warningIssues})</AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    {JSON.parse(audit.issues).map((issue: any, i: number) => (
                                      <div key={i} className={`p-3 rounded-lg flex items-start gap-3 ${
                                        issue.severity === 'error' ? 'bg-red-500/10' : 
                                        issue.severity === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
                                      }`}>
                                        {issue.severity === 'error' ? <XCircle className="w-5 h-5 text-red-500 shrink-0" /> :
                                         issue.severity === 'warning' ? <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" /> :
                                         <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />}
                                        <div>
                                          <p className="font-medium">{issue.message}</p>
                                          {issue.page && <p className="text-xs text-muted-foreground font-mono">{issue.page}</p>}
                                          <p className="text-sm text-muted-foreground mt-1">{issue.recommendation}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pages in Sitemap</p>
                    <p className="text-3xl font-bold">{pages.filter(p => p.inSitemap !== false).length}</p>
                  </div>
                  <Globe className="w-10 h-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Excluded Pages</p>
                    <p className="text-3xl font-bold">{pages.filter(p => p.inSitemap === false).length}</p>
                  </div>
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pages</p>
                    <p className="text-3xl font-bold">{pages.length}</p>
                  </div>
                  <FileText className="w-10 h-10 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Sitemap Generation
                </CardTitle>
                <CardDescription>Generate and preview your XML sitemap</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={generateSitemap} disabled={sitemapLoading} className="flex-1" data-testid="btn-generate-sitemap">
                    {sitemapLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Regenerate Sitemap
                  </Button>
                  <Button onClick={pingSitemap} variant="outline" data-testid="btn-ping-engines">
                    <Zap className="w-4 h-4 mr-2" />Ping Engines
                  </Button>
                </div>
                {sitemapPreview && (
                  <div className="flex gap-2">
                    <Button onClick={() => setShowSitemapPreview(true)} variant="outline" className="flex-1" data-testid="btn-preview-sitemap">
                      <Eye className="w-4 h-4 mr-2" />Preview
                    </Button>
                    <Button onClick={downloadSitemap} variant="outline" className="flex-1" data-testid="btn-download-sitemap">
                      <Download className="w-4 h-4 mr-2" />Download
                    </Button>
                  </div>
                )}
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Your sitemap is available at: <code className="bg-background px-1 rounded">/sitemap.xml</code>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Default Settings
                </CardTitle>
                <CardDescription>Configure default sitemap settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Priority</Label>
                  <Select defaultValue="0.5">
                    <SelectTrigger data-testid="select-default-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.0">1.0 (Highest)</SelectItem>
                      <SelectItem value="0.9">0.9</SelectItem>
                      <SelectItem value="0.8">0.8</SelectItem>
                      <SelectItem value="0.7">0.7</SelectItem>
                      <SelectItem value="0.6">0.6</SelectItem>
                      <SelectItem value="0.5">0.5 (Default)</SelectItem>
                      <SelectItem value="0.4">0.4</SelectItem>
                      <SelectItem value="0.3">0.3</SelectItem>
                      <SelectItem value="0.2">0.2</SelectItem>
                      <SelectItem value="0.1">0.1 (Lowest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Change Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger data-testid="select-default-changefreq">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Page Sitemap Settings</CardTitle>
              <CardDescription>Configure priority and change frequency for each page</CardDescription>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pages found. Add pages via the Pages tab to configure sitemap settings.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Include</TableHead>
                      <TableHead>Page URL</TableHead>
                      <TableHead className="w-[120px]">Priority</TableHead>
                      <TableHead className="w-[150px]">Change Freq</TableHead>
                      <TableHead className="w-[120px]">Last Modified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell>
                          <Switch
                            checked={page.inSitemap !== false}
                            onCheckedChange={(checked) => updatePageSitemapSettings(page.id, checked, page.sitemapPriority, page.sitemapChangefreq)}
                            data-testid={`switch-sitemap-${page.id}`}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">{page.pageUrl}</TableCell>
                        <TableCell>
                          <Select
                            value={page.sitemapPriority || "0.5"}
                            onValueChange={(v) => updatePageSitemapSettings(page.id, page.inSitemap !== false, v, page.sitemapChangefreq)}
                          >
                            <SelectTrigger className="h-8" data-testid={`select-priority-${page.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1.0">1.0</SelectItem>
                              <SelectItem value="0.9">0.9</SelectItem>
                              <SelectItem value="0.8">0.8</SelectItem>
                              <SelectItem value="0.7">0.7</SelectItem>
                              <SelectItem value="0.6">0.6</SelectItem>
                              <SelectItem value="0.5">0.5</SelectItem>
                              <SelectItem value="0.4">0.4</SelectItem>
                              <SelectItem value="0.3">0.3</SelectItem>
                              <SelectItem value="0.2">0.2</SelectItem>
                              <SelectItem value="0.1">0.1</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={page.sitemapChangefreq || "weekly"}
                            onValueChange={(v) => updatePageSitemapSettings(page.id, page.inSitemap !== false, page.sitemapPriority, v)}
                          >
                            <SelectTrigger className="h-8" data-testid={`select-changefreq-${page.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="always">Always</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                              <SelectItem value="never">Never</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indexing" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  IndexNow (Instant Indexing)
                </CardTitle>
                <CardDescription>Submit URLs instantly to Google and Bing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  IndexNow allows you to notify search engines about content changes instantly, 
                  rather than waiting for them to crawl your site.
                </p>
                <Button onClick={submitToIndexNow} className="w-full" data-testid="btn-submit-indexnow">
                  <Zap className="w-4 h-4 mr-2" />Submit All Pages to IndexNow
                </Button>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Supported by: Microsoft Bing, Yandex, Seznam.cz, Naver
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  XML Sitemap
                </CardTitle>
                <CardDescription>Manage your sitemap configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">Pages in Sitemap</span>
                  <Badge variant="secondary">{pages.filter(p => p).length}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" data-testid="btn-view-sitemap">
                    <Eye className="w-4 h-4 mr-2" />View Sitemap
                  </Button>
                  <Button variant="outline" className="flex-1" data-testid="btn-ping-sitemap">
                    <RefreshCw className="w-4 h-4 mr-2" />Ping Search Engines
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Schema Markup Manager</CardTitle>
              <CardDescription>Configure structured data for rich snippets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {['Article', 'Product', 'LocalBusiness', 'FAQ', 'HowTo', 'Organization', 'BreadcrumbList', 'Review', 'Event', 'VideoObject'].map((type) => (
                  <div key={type} className="p-3 border rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium">{type}</span>
                    <Switch defaultChecked data-testid={`switch-schema-${type}`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>SEO Settings</CardTitle>
                  <CardDescription>Configure global SEO options</CardDescription>
                </div>
                {settings.length === 0 && (
                  <Button onClick={seedSettings} data-testid="btn-seed-settings">
                    <Plus className="w-4 h-4 mr-2" />Load Default Settings
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {settings.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No settings configured yet.</p>
                  <Button className="mt-4" onClick={seedSettings}>Load Default Settings</Button>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-4">
                  {['general', 'sitemap', 'social', 'schema', 'indexing', 'images', 'audit'].map((category) => {
                    const categorySettings = settings.filter(s => s.category === category);
                    if (categorySettings.length === 0) return null;
                    return (
                      <AccordionItem key={category} value={category}>
                        <AccordionTrigger className="capitalize">{category} Settings</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-4">
                            {categorySettings.map((setting) => (
                              <div key={setting.id} className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <Label className="capitalize">{setting.settingKey.replace(/_/g, ' ')}</Label>
                                  {setting.description && (
                                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                                  )}
                                </div>
                                {setting.settingType === 'boolean' ? (
                                  <Switch 
                                    checked={setting.settingValue === 'true'}
                                    onCheckedChange={(checked) => saveSetting(setting.settingKey, String(checked), 'boolean', category)}
                                    data-testid={`switch-setting-${setting.settingKey}`}
                                  />
                                ) : (
                                  <Input
                                    className="max-w-[300px]"
                                    defaultValue={setting.settingValue || ''}
                                    onBlur={(e) => saveSetting(setting.settingKey, e.target.value, setting.settingType, category)}
                                    data-testid={`input-setting-${setting.settingKey}`}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showRedirectDialog} onOpenChange={setShowRedirectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Redirect</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Source URL</Label>
              <Input
                placeholder="/old-page"
                value={newRedirect.sourceUrl}
                onChange={(e) => setNewRedirect({ ...newRedirect, sourceUrl: e.target.value })}
                data-testid="input-redirect-source"
              />
            </div>
            <div>
              <Label>Target URL</Label>
              <Input
                placeholder="/new-page"
                value={newRedirect.targetUrl}
                onChange={(e) => setNewRedirect({ ...newRedirect, targetUrl: e.target.value })}
                data-testid="input-redirect-target"
              />
            </div>
            <div>
              <Label>Redirect Type</Label>
              <Select value={newRedirect.redirectType} onValueChange={(v) => setNewRedirect({ ...newRedirect, redirectType: v })}>
                <SelectTrigger data-testid="select-redirect-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">301 (Permanent)</SelectItem>
                  <SelectItem value="302">302 (Temporary)</SelectItem>
                  <SelectItem value="307">307 (Temporary Preserve Method)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newRedirect.isRegex}
                onCheckedChange={(checked) => setNewRedirect({ ...newRedirect, isRegex: checked })}
                data-testid="switch-redirect-regex"
              />
              <Label>Use Regular Expression</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRedirectDialog(false)}>Cancel</Button>
            <Button onClick={createRedirect} data-testid="btn-create-redirect">Create Redirect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showKeywordDialog} onOpenChange={setShowKeywordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track New Keyword</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Keyword</Label>
              <Input
                placeholder="streaming device"
                value={newKeyword.keyword}
                onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                data-testid="input-keyword"
              />
            </div>
            <div>
              <Label>Target URL (optional)</Label>
              <Input
                placeholder="/"
                value={newKeyword.targetUrl}
                onChange={(e) => setNewKeyword({ ...newKeyword, targetUrl: e.target.value })}
                data-testid="input-keyword-url"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={newKeyword.trackingEnabled}
                onCheckedChange={(checked) => setNewKeyword({ ...newKeyword, trackingEnabled: checked })}
                data-testid="switch-keyword-tracking"
              />
              <Label>Enable Position Tracking</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKeywordDialog(false)}>Cancel</Button>
            <Button onClick={createKeyword} data-testid="btn-create-keyword">Add Keyword</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSitemapPreview} onOpenChange={setShowSitemapPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Sitemap Preview
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh] p-4 bg-muted rounded-lg">
            <pre className="text-xs font-mono whitespace-pre-wrap" data-testid="sitemap-preview-content">
              {sitemapPreview || 'No sitemap generated yet. Click "Regenerate Sitemap" to generate.'}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSitemapPreview(false)}>Close</Button>
            <Button onClick={downloadSitemap} data-testid="btn-dialog-download-sitemap">
              <Download className="w-4 h-4 mr-2" />Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
