import type { Express, Request, Response } from "express";
import { seoStorage } from "./seo-storage";
import { 
  createSeoRedirectSchema, 
  updateSeoPageSchema, 
  createSeoKeywordSchema,
  runSeoAuditSchema 
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

interface SeoAnalysisResult {
  titleScore: number;
  descriptionScore: number;
  contentScore: number;
  readabilityScore: number;
  keywordScore: number;
  linkScore: number;
  imageScore: number;
  overallScore: number;
  issues: Array<{ type: string; severity: string; message: string; suggestion: string }>;
  suggestions: string[];
}

function analyzePageSeo(content: {
  title?: string;
  description?: string;
  content?: string;
  focusKeyword?: string;
  images?: { alt: string }[];
  internalLinks?: number;
  externalLinks?: number;
  headings?: { h1: number; h2: number; h3: number };
}): SeoAnalysisResult {
  const issues: Array<{ type: string; severity: string; message: string; suggestion: string }> = [];
  const suggestions: string[] = [];
  
  let titleScore = 0;
  if (content.title) {
    const titleLen = content.title.length;
    if (titleLen >= 50 && titleLen <= 60) titleScore = 100;
    else if (titleLen >= 40 && titleLen <= 70) titleScore = 80;
    else if (titleLen >= 30 && titleLen <= 80) titleScore = 60;
    else titleScore = 40;
    
    if (titleLen < 30) {
      issues.push({ type: 'title', severity: 'warning', message: 'Title is too short', suggestion: 'Add more descriptive words to your title (aim for 50-60 characters)' });
    } else if (titleLen > 70) {
      issues.push({ type: 'title', severity: 'warning', message: 'Title is too long', suggestion: 'Shorten your title to 60 characters or less' });
    }
    
    if (content.focusKeyword && !content.title.toLowerCase().includes(content.focusKeyword.toLowerCase())) {
      issues.push({ type: 'title', severity: 'error', message: 'Focus keyword not in title', suggestion: 'Add your focus keyword to the title' });
      titleScore -= 20;
    }
  } else {
    issues.push({ type: 'title', severity: 'error', message: 'Missing title tag', suggestion: 'Add a title tag to improve SEO' });
  }

  let descriptionScore = 0;
  if (content.description) {
    const descLen = content.description.length;
    if (descLen >= 150 && descLen <= 160) descriptionScore = 100;
    else if (descLen >= 120 && descLen <= 170) descriptionScore = 80;
    else if (descLen >= 100 && descLen <= 200) descriptionScore = 60;
    else descriptionScore = 40;
    
    if (descLen < 100) {
      issues.push({ type: 'description', severity: 'warning', message: 'Meta description is too short', suggestion: 'Expand your description to 150-160 characters' });
    } else if (descLen > 170) {
      issues.push({ type: 'description', severity: 'warning', message: 'Meta description is too long', suggestion: 'Shorten to 160 characters to avoid truncation' });
    }
    
    if (content.focusKeyword && !content.description.toLowerCase().includes(content.focusKeyword.toLowerCase())) {
      issues.push({ type: 'description', severity: 'warning', message: 'Focus keyword not in description', suggestion: 'Include your focus keyword in the meta description' });
      descriptionScore -= 15;
    }
  } else {
    issues.push({ type: 'description', severity: 'error', message: 'Missing meta description', suggestion: 'Add a meta description' });
  }

  let contentScore = 0;
  let readabilityScore = 70;
  let keywordScore = 0;
  
  if (content.content) {
    const wordCount = content.content.split(/\s+/).length;
    if (wordCount >= 1500) contentScore = 100;
    else if (wordCount >= 1000) contentScore = 85;
    else if (wordCount >= 600) contentScore = 70;
    else if (wordCount >= 300) contentScore = 50;
    else contentScore = 30;
    
    if (wordCount < 300) {
      issues.push({ type: 'content', severity: 'error', message: 'Content is too thin', suggestion: 'Add more content (aim for at least 600 words)' });
    }
    
    const avgSentenceLength = content.content.split(/[.!?]+/).filter(s => s.trim()).length;
    const avgWordLength = content.content.length / wordCount;
    
    if (avgWordLength < 5) readabilityScore = 90;
    else if (avgWordLength < 6) readabilityScore = 80;
    else readabilityScore = 60;
    
    if (content.focusKeyword) {
      const keywordRegex = new RegExp(content.focusKeyword, 'gi');
      const keywordCount = (content.content.match(keywordRegex) || []).length;
      const keywordDensity = (keywordCount / wordCount) * 100;
      
      if (keywordDensity >= 0.5 && keywordDensity <= 2.5) keywordScore = 100;
      else if (keywordDensity > 0 && keywordDensity < 0.5) {
        keywordScore = 60;
        issues.push({ type: 'keyword', severity: 'warning', message: 'Keyword density is low', suggestion: 'Use your focus keyword more frequently' });
      } else if (keywordDensity > 2.5) {
        keywordScore = 50;
        issues.push({ type: 'keyword', severity: 'warning', message: 'Keyword stuffing detected', suggestion: 'Reduce keyword usage to avoid penalties' });
      }
      
      const firstParagraph = content.content.substring(0, 300);
      if (!firstParagraph.toLowerCase().includes(content.focusKeyword.toLowerCase())) {
        issues.push({ type: 'keyword', severity: 'warning', message: 'Focus keyword not in first paragraph', suggestion: 'Add focus keyword in the first 100 words' });
        keywordScore -= 10;
      }
    }
  } else {
    issues.push({ type: 'content', severity: 'error', message: 'No content found', suggestion: 'Add content to the page' });
  }

  let linkScore = 50;
  if (content.internalLinks !== undefined) {
    if (content.internalLinks >= 3) linkScore += 25;
    else if (content.internalLinks >= 1) linkScore += 15;
    else {
      issues.push({ type: 'links', severity: 'warning', message: 'No internal links', suggestion: 'Add internal links to related content' });
    }
  }
  if (content.externalLinks !== undefined) {
    if (content.externalLinks >= 1 && content.externalLinks <= 3) linkScore += 25;
    else if (content.externalLinks > 3) linkScore += 15;
  }
  linkScore = Math.min(linkScore, 100);

  let imageScore = 0;
  if (content.images && content.images.length > 0) {
    const imagesWithAlt = content.images.filter(img => img.alt && img.alt.length > 0).length;
    imageScore = Math.round((imagesWithAlt / content.images.length) * 100);
    
    if (imagesWithAlt < content.images.length) {
      issues.push({ type: 'images', severity: 'warning', message: `${content.images.length - imagesWithAlt} images missing alt text`, suggestion: 'Add descriptive alt text to all images' });
    }
  } else {
    issues.push({ type: 'images', severity: 'info', message: 'No images found', suggestion: 'Consider adding relevant images' });
    imageScore = 50;
  }

  if (content.headings) {
    if (content.headings.h1 === 0) {
      issues.push({ type: 'headings', severity: 'error', message: 'Missing H1 heading', suggestion: 'Add exactly one H1 heading' });
    } else if (content.headings.h1 > 1) {
      issues.push({ type: 'headings', severity: 'warning', message: 'Multiple H1 headings', suggestion: 'Use only one H1 heading per page' });
    }
    if (content.headings.h2 === 0) {
      issues.push({ type: 'headings', severity: 'warning', message: 'No H2 headings', suggestion: 'Add H2 headings to structure your content' });
    }
  }

  suggestions.push('Ensure your focus keyword appears in the URL slug');
  suggestions.push('Add schema markup for rich snippets');
  suggestions.push('Optimize images with descriptive filenames');
  suggestions.push('Use short, descriptive URLs');

  const overallScore = Math.round(
    (titleScore * 0.15) +
    (descriptionScore * 0.15) +
    (contentScore * 0.25) +
    (readabilityScore * 0.10) +
    (keywordScore * 0.15) +
    (linkScore * 0.10) +
    (imageScore * 0.10)
  );

  return {
    titleScore: Math.max(0, Math.min(100, titleScore)),
    descriptionScore: Math.max(0, Math.min(100, descriptionScore)),
    contentScore: Math.max(0, Math.min(100, contentScore)),
    readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
    keywordScore: Math.max(0, Math.min(100, keywordScore)),
    linkScore: Math.max(0, Math.min(100, linkScore)),
    imageScore: Math.max(0, Math.min(100, imageScore)),
    overallScore: Math.max(0, Math.min(100, overallScore)),
    issues,
    suggestions,
  };
}

async function runSiteAudit(auditId: string): Promise<void> {
  try {
    await seoStorage.updateAudit(auditId, { status: "running", startedAt: new Date() });
    
    const pages = await seoStorage.getAllPages();
    const redirects = await seoStorage.getActiveRedirects();
    const logs404 = await seoStorage.getUnresolved404Logs();
    const brokenLinks = await seoStorage.getBrokenLinks();
    
    const issues: Array<{ type: string; severity: string; page?: string; message: string; recommendation: string }> = [];
    const recommendations: string[] = [];
    
    let technicalScore = 100;
    let contentScore = 0;
    let linkScore = 100;
    let performanceScore = 80;

    for (const page of pages) {
      contentScore += page.overallScore || 0;
      
      if (!page.metaTitle) {
        issues.push({ type: 'meta', severity: 'error', page: page.pageUrl, message: 'Missing title tag', recommendation: 'Add a title tag' });
        technicalScore -= 5;
      }
      if (!page.metaDescription) {
        issues.push({ type: 'meta', severity: 'warning', page: page.pageUrl, message: 'Missing meta description', recommendation: 'Add a meta description' });
        technicalScore -= 3;
      }
      if (!page.canonicalUrl) {
        issues.push({ type: 'technical', severity: 'info', page: page.pageUrl, message: 'No canonical URL set', recommendation: 'Set a canonical URL' });
      }
      if (!page.schemaType) {
        issues.push({ type: 'schema', severity: 'info', page: page.pageUrl, message: 'No schema markup', recommendation: 'Add structured data' });
      }
    }
    
    contentScore = pages.length > 0 ? Math.round(contentScore / pages.length) : 0;

    if (logs404.length > 0) {
      issues.push({ type: '404', severity: logs404.length > 10 ? 'error' : 'warning', message: `${logs404.length} unresolved 404 errors`, recommendation: 'Create redirects or fix broken links' });
      technicalScore -= Math.min(logs404.length * 2, 20);
    }

    if (brokenLinks.length > 0) {
      issues.push({ type: 'links', severity: 'error', message: `${brokenLinks.length} broken internal links`, recommendation: 'Fix or remove broken links' });
      linkScore -= Math.min(brokenLinks.length * 5, 30);
    }

    if (redirects.length > 20) {
      issues.push({ type: 'redirects', severity: 'info', message: 'Many redirects configured', recommendation: 'Review and consolidate redirect chains' });
    }

    recommendations.push('Regularly monitor 404 errors and create redirects');
    recommendations.push('Ensure all pages have unique meta titles and descriptions');
    recommendations.push('Add schema markup to improve rich snippet eligibility');
    recommendations.push('Keep content fresh and updated');
    recommendations.push('Build quality internal links between related content');

    const criticalIssues = issues.filter(i => i.severity === 'error').length;
    const warningIssues = issues.filter(i => i.severity === 'warning').length;
    
    const overallScore = Math.round(
      (technicalScore * 0.30) +
      (contentScore * 0.35) +
      (linkScore * 0.20) +
      (performanceScore * 0.15)
    );

    await seoStorage.updateAudit(auditId, {
      status: "completed",
      overallScore,
      technicalScore: Math.max(0, technicalScore),
      contentScore,
      linkScore: Math.max(0, linkScore),
      performanceScore,
      criticalIssues,
      warningIssues,
      passedChecks: pages.length * 5 - criticalIssues - warningIssues,
      issues: JSON.stringify(issues),
      recommendations: JSON.stringify(recommendations),
      pagesAnalyzed: pages.length,
      completedAt: new Date(),
    });
  } catch (error) {
    console.error('Audit failed:', error);
    await seoStorage.updateAudit(auditId, { status: "failed" });
  }
}

async function submitToIndexNow(urls: string[]): Promise<{ success: boolean; message: string }> {
  const indexNowKey = process.env.INDEXNOW_KEY;
  const siteUrl = process.env.SITE_URL || 'https://streamstickpro.com';
  
  if (!indexNowKey) {
    return { success: false, message: 'IndexNow API key not configured' };
  }

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: new URL(siteUrl).hostname,
        key: indexNowKey,
        urlList: urls.map(url => url.startsWith('http') ? url : `${siteUrl}${url}`),
      }),
    });

    if (response.ok || response.status === 202) {
      for (const url of urls) {
        await seoStorage.upsertPage(url, {
          indexNowSubmitted: true,
          indexNowLastSubmit: new Date(),
        });
      }
      return { success: true, message: `Submitted ${urls.length} URLs to IndexNow` };
    } else {
      return { success: false, message: `IndexNow returned status ${response.status}` };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export function registerSeoRoutes(app: Express): void {
  
  // ============ SEO Dashboard ============
  app.get("/api/admin/seo/stats", async (req, res) => {
    try {
      const stats = await seoStorage.getSeoStats();
      res.json({ data: stats });
    } catch (error: any) {
      console.error("Error fetching SEO stats:", error);
      res.status(500).json({ error: "Failed to fetch SEO stats" });
    }
  });

  // ============ SEO Settings ============
  app.get("/api/admin/seo/settings", async (req, res) => {
    try {
      const settings = await seoStorage.getAllSettings();
      res.json({ data: settings });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/admin/seo/settings/:category", async (req, res) => {
    try {
      const settings = await seoStorage.getSettingsByCategory(req.params.category);
      res.json({ data: settings });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/seo/settings", async (req, res) => {
    try {
      const { key, value, type, category, description } = req.body;
      const setting = await seoStorage.upsertSetting(key, value, type, category, description);
      res.json({ data: setting });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  app.post("/api/admin/seo/settings/bulk", async (req, res) => {
    try {
      const { settings } = req.body;
      const results = [];
      for (const s of settings) {
        const setting = await seoStorage.upsertSetting(s.key, s.value, s.type, s.category, s.description);
        results.push(setting);
      }
      res.json({ data: results });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // ============ SEO Pages ============
  app.get("/api/admin/seo/pages", async (req, res) => {
    try {
      const pages = await seoStorage.getAllPages();
      res.json({ data: pages });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.get("/api/admin/seo/pages/:id", async (req, res) => {
    try {
      const page = await seoStorage.getPageById(req.params.id);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json({ data: page });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  app.post("/api/admin/seo/pages", async (req, res) => {
    try {
      const result = updateSeoPageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const { pageUrl, ...data } = req.body;
      const page = await seoStorage.upsertPage(pageUrl, data);
      res.json({ data: page });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to save page" });
    }
  });

  app.put("/api/admin/seo/pages/:id", async (req, res) => {
    try {
      const existingPage = await seoStorage.getPageById(req.params.id);
      if (!existingPage) {
        return res.status(404).json({ error: "Page not found" });
      }
      const page = await seoStorage.upsertPage(existingPage.pageUrl, req.body);
      res.json({ data: page });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  app.delete("/api/admin/seo/pages/:id", async (req, res) => {
    try {
      await seoStorage.deletePage(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete page" });
    }
  });

  app.post("/api/admin/seo/pages/analyze", async (req, res) => {
    try {
      const { pageUrl, title, description, content, focusKeyword, images, internalLinks, externalLinks, headings } = req.body;
      
      const analysis = analyzePageSeo({
        title,
        description,
        content,
        focusKeyword,
        images,
        internalLinks,
        externalLinks,
        headings,
      });

      if (pageUrl) {
        await seoStorage.updatePageScores(pageUrl, {
          titleScore: analysis.titleScore,
          descriptionScore: analysis.descriptionScore,
          contentScore: analysis.contentScore,
          readabilityScore: analysis.readabilityScore,
          keywordScore: analysis.keywordScore,
          linkScore: analysis.linkScore,
          imageScore: analysis.imageScore,
          overallScore: analysis.overallScore,
          seoIssues: JSON.stringify(analysis.issues),
          seoSuggestions: JSON.stringify(analysis.suggestions),
        });
      }

      res.json({ data: analysis });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to analyze page" });
    }
  });

  // ============ SEO Keywords ============
  app.get("/api/admin/seo/keywords", async (req, res) => {
    try {
      const keywords = await seoStorage.getAllKeywords();
      res.json({ data: keywords });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch keywords" });
    }
  });

  app.get("/api/admin/seo/keywords/tracked", async (req, res) => {
    try {
      const keywords = await seoStorage.getTrackedKeywords();
      res.json({ data: keywords });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch tracked keywords" });
    }
  });

  app.get("/api/admin/seo/keywords/:id", async (req, res) => {
    try {
      const keyword = await seoStorage.getKeyword(req.params.id);
      if (!keyword) {
        return res.status(404).json({ error: "Keyword not found" });
      }
      const history = await seoStorage.getKeywordHistory(req.params.id, 30);
      res.json({ data: { ...keyword, history } });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch keyword" });
    }
  });

  app.post("/api/admin/seo/keywords", async (req, res) => {
    try {
      const result = createSeoKeywordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const keyword = await seoStorage.createKeyword(result.data);
      res.json({ data: keyword });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create keyword" });
    }
  });

  app.put("/api/admin/seo/keywords/:id", async (req, res) => {
    try {
      const keyword = await seoStorage.updateKeyword(req.params.id, req.body);
      res.json({ data: keyword });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update keyword" });
    }
  });

  app.delete("/api/admin/seo/keywords/:id", async (req, res) => {
    try {
      await seoStorage.deleteKeyword(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete keyword" });
    }
  });

  // ============ SEO Redirects ============
  app.get("/api/admin/seo/redirects", async (req, res) => {
    try {
      const redirects = await seoStorage.getAllRedirects();
      res.json({ data: redirects });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch redirects" });
    }
  });

  app.post("/api/admin/seo/redirects", async (req, res) => {
    try {
      const result = createSeoRedirectSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const redirect = await seoStorage.createRedirect(result.data);
      res.json({ data: redirect });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create redirect" });
    }
  });

  app.put("/api/admin/seo/redirects/:id", async (req, res) => {
    try {
      const redirect = await seoStorage.updateRedirect(req.params.id, req.body);
      res.json({ data: redirect });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update redirect" });
    }
  });

  app.delete("/api/admin/seo/redirects/:id", async (req, res) => {
    try {
      await seoStorage.deleteRedirect(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete redirect" });
    }
  });

  app.post("/api/admin/seo/redirects/import", async (req, res) => {
    try {
      const { redirects } = req.body;
      const results = [];
      for (const r of redirects) {
        const redirect = await seoStorage.createRedirect({
          sourceUrl: r.sourceUrl || r.source,
          targetUrl: r.targetUrl || r.target,
          redirectType: r.redirectType || r.type || "301",
          isRegex: r.isRegex || false,
          isActive: true,
        });
        results.push(redirect);
      }
      res.json({ data: results, imported: results.length });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to import redirects" });
    }
  });

  // ============ SEO 404 Logs ============
  app.get("/api/admin/seo/404", async (req, res) => {
    try {
      const logs = await seoStorage.getAll404Logs();
      res.json({ data: logs });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch 404 logs" });
    }
  });

  app.get("/api/admin/seo/404/unresolved", async (req, res) => {
    try {
      const logs = await seoStorage.getUnresolved404Logs();
      res.json({ data: logs });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch 404 logs" });
    }
  });

  app.post("/api/admin/seo/404/:id/resolve", async (req, res) => {
    try {
      const { redirectId } = req.body;
      const log = await seoStorage.resolve404(req.params.id, redirectId);
      res.json({ data: log });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to resolve 404" });
    }
  });

  app.post("/api/admin/seo/404/:id/ignore", async (req, res) => {
    try {
      const log = await seoStorage.ignore404(req.params.id);
      res.json({ data: log });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to ignore 404" });
    }
  });

  app.post("/api/admin/seo/404/:id/create-redirect", async (req, res) => {
    try {
      const log = await seoStorage.get404Log(req.params.id);
      if (!log) {
        return res.status(404).json({ error: "404 log not found" });
      }
      const { targetUrl } = req.body;
      const redirect = await seoStorage.createRedirect({
        sourceUrl: log.url,
        targetUrl,
        redirectType: "301",
        isActive: true,
      });
      await seoStorage.resolve404(req.params.id, redirect.id);
      res.json({ data: { redirect, log } });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create redirect from 404" });
    }
  });

  app.delete("/api/admin/seo/404/:id", async (req, res) => {
    try {
      await seoStorage.delete404Log(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete 404 log" });
    }
  });

  // ============ SEO Audits ============
  app.get("/api/admin/seo/audits", async (req, res) => {
    try {
      const audits = await seoStorage.getAllAudits();
      res.json({ data: audits });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch audits" });
    }
  });

  app.get("/api/admin/seo/audits/latest", async (req, res) => {
    try {
      const audit = await seoStorage.getLatestAudit();
      res.json({ data: audit });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch latest audit" });
    }
  });

  app.get("/api/admin/seo/audits/:id", async (req, res) => {
    try {
      const audit = await seoStorage.getAudit(req.params.id);
      if (!audit) {
        return res.status(404).json({ error: "Audit not found" });
      }
      res.json({ data: audit });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch audit" });
    }
  });

  app.post("/api/admin/seo/audits/run", async (req, res) => {
    try {
      const result = runSeoAuditSchema.safeParse(req.body);
      const auditType = result.success ? result.data.auditType : "full";
      
      const audit = await seoStorage.createAudit({ auditType, status: "pending" });
      
      runSiteAudit(audit.id).catch(console.error);
      
      res.json({ data: audit, message: "Audit started" });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to start audit" });
    }
  });

  app.delete("/api/admin/seo/audits/:id", async (req, res) => {
    try {
      await seoStorage.deleteAudit(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to delete audit" });
    }
  });

  // ============ SEO Internal Links ============
  app.get("/api/admin/seo/links/broken", async (req, res) => {
    try {
      const links = await seoStorage.getBrokenLinks();
      res.json({ data: links });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch broken links" });
    }
  });

  app.get("/api/admin/seo/links/from/:url", async (req, res) => {
    try {
      const links = await seoStorage.getInternalLinksFromPage(decodeURIComponent(req.params.url));
      res.json({ data: links });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  app.get("/api/admin/seo/links/to/:url", async (req, res) => {
    try {
      const links = await seoStorage.getInternalLinksToPage(decodeURIComponent(req.params.url));
      res.json({ data: links });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch links" });
    }
  });

  // ============ SEO Images ============
  app.get("/api/admin/seo/images", async (req, res) => {
    try {
      const pageUrl = req.query.page as string;
      if (pageUrl) {
        const images = await seoStorage.getImagesByPage(pageUrl);
        res.json({ data: images });
      } else {
        res.json({ data: [] });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  app.get("/api/admin/seo/images/missing-alt", async (req, res) => {
    try {
      const images = await seoStorage.getImagesWithoutAlt();
      res.json({ data: images });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  app.post("/api/admin/seo/images/:id/alt", async (req, res) => {
    try {
      const { altText } = req.body;
      const image = await seoStorage.getImage(req.params.id);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      const updated = await seoStorage.upsertImage(image.imageUrl, { altText, altTextGenerated: false });
      res.json({ data: updated });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to update alt text" });
    }
  });

  // ============ SEO Schema Types ============
  app.get("/api/admin/seo/schema-types", async (req, res) => {
    try {
      const types = await seoStorage.getAllSchemaTypes();
      res.json({ data: types });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch schema types" });
    }
  });

  app.post("/api/admin/seo/schema-types", async (req, res) => {
    try {
      const { schemaType, isEnabled, defaultTemplate, description, applicablePageTypes } = req.body;
      const type = await seoStorage.upsertSchemaType(schemaType, { isEnabled, defaultTemplate, description, applicablePageTypes });
      res.json({ data: type });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to save schema type" });
    }
  });

  // ============ SEO IndexNow ============
  app.post("/api/admin/seo/indexnow/submit", async (req, res) => {
    try {
      const { urls } = req.body;
      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: "URLs array required" });
      }
      const result = await submitToIndexNow(urls);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to submit to IndexNow" });
    }
  });

  app.post("/api/admin/seo/indexnow/submit-all", async (req, res) => {
    try {
      const pages = await seoStorage.getAllPages();
      const urls = pages.filter(p => p.inSitemap).map(p => p.pageUrl);
      if (urls.length === 0) {
        return res.json({ success: false, message: "No pages to submit" });
      }
      const result = await submitToIndexNow(urls);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to submit to IndexNow" });
    }
  });

  // ============ SEO Content Suggestions ============
  app.get("/api/admin/seo/suggestions", async (req, res) => {
    try {
      const pageUrl = req.query.page as string;
      if (pageUrl) {
        const suggestions = await seoStorage.getSuggestionsByPage(pageUrl);
        res.json({ data: suggestions });
      } else {
        const suggestions = await seoStorage.getPendingSuggestions();
        res.json({ data: suggestions });
      }
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch suggestions" });
    }
  });

  app.post("/api/admin/seo/suggestions/:id/apply", async (req, res) => {
    try {
      await seoStorage.updateSuggestionStatus(req.params.id, "applied");
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to apply suggestion" });
    }
  });

  app.post("/api/admin/seo/suggestions/:id/dismiss", async (req, res) => {
    try {
      await seoStorage.updateSuggestionStatus(req.params.id, "dismissed");
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to dismiss suggestion" });
    }
  });

  // ============ SEO Sitemap ============
  app.get("/api/admin/seo/sitemap/config", async (req, res) => {
    try {
      const pages = await seoStorage.getAllPages();
      const sitemapPages = pages.filter(p => p.inSitemap).map(p => ({
        url: p.pageUrl,
        priority: p.sitemapPriority,
        changefreq: p.sitemapChangefreq,
        lastmod: p.updatedAt,
      }));
      res.json({ data: sitemapPages });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch sitemap config" });
    }
  });

  app.post("/api/admin/seo/sitemap/generate", async (req, res) => {
    try {
      const pages = await seoStorage.getAllPages();
      const siteUrl = process.env.SITE_URL || 'https://streamstickpro.com';
      
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      for (const page of pages.filter(p => p.inSitemap)) {
        xml += '  <url>\n';
        xml += `    <loc>${siteUrl}${page.pageUrl}</loc>\n`;
        xml += `    <lastmod>${page.updatedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]}</lastmod>\n`;
        xml += `    <changefreq>${page.sitemapChangefreq || 'weekly'}</changefreq>\n`;
        xml += `    <priority>${page.sitemapPriority || '0.5'}</priority>\n`;
        xml += '  </url>\n';
      }
      
      xml += '</urlset>';
      
      res.json({ data: xml, pagesIncluded: pages.filter(p => p.inSitemap).length });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to generate sitemap" });
    }
  });

  // ============ SEO Breadcrumbs ============
  app.get("/api/admin/seo/breadcrumbs/:url", async (req, res) => {
    try {
      const breadcrumb = await seoStorage.getBreadcrumb(decodeURIComponent(req.params.url));
      res.json({ data: breadcrumb });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch breadcrumb" });
    }
  });

  app.post("/api/admin/seo/breadcrumbs", async (req, res) => {
    try {
      const { pageUrl, breadcrumbPath, customLabels } = req.body;
      const breadcrumb = await seoStorage.upsertBreadcrumb(pageUrl, JSON.stringify(breadcrumbPath), customLabels ? JSON.stringify(customLabels) : undefined);
      res.json({ data: breadcrumb });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to save breadcrumb" });
    }
  });

  // ============ Seed Default Schema Types ============
  app.post("/api/admin/seo/seed-schema-types", async (req, res) => {
    try {
      const schemaTypes = [
        { schemaType: 'Article', description: 'For blog posts and news articles', applicablePageTypes: ['post'] },
        { schemaType: 'Product', description: 'For e-commerce product pages', applicablePageTypes: ['product'] },
        { schemaType: 'LocalBusiness', description: 'For local business information', applicablePageTypes: ['page'] },
        { schemaType: 'Organization', description: 'For company/organization pages', applicablePageTypes: ['page'] },
        { schemaType: 'FAQ', description: 'For FAQ pages and sections', applicablePageTypes: ['page', 'post'] },
        { schemaType: 'HowTo', description: 'For tutorial and how-to content', applicablePageTypes: ['post'] },
        { schemaType: 'Review', description: 'For product/service reviews', applicablePageTypes: ['post', 'product'] },
        { schemaType: 'Event', description: 'For event pages', applicablePageTypes: ['page'] },
        { schemaType: 'VideoObject', description: 'For video content pages', applicablePageTypes: ['page', 'post'] },
        { schemaType: 'BreadcrumbList', description: 'For breadcrumb navigation', applicablePageTypes: ['page', 'post', 'product'] },
      ];

      for (const st of schemaTypes) {
        await seoStorage.upsertSchemaType(st.schemaType, { 
          isEnabled: true, 
          description: st.description, 
          applicablePageTypes: st.applicablePageTypes 
        });
      }

      res.json({ success: true, seeded: schemaTypes.length });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to seed schema types" });
    }
  });

  // ============ Seed Default Settings ============
  app.post("/api/admin/seo/seed-settings", async (req, res) => {
    try {
      const defaultSettings = [
        { key: 'site_title', value: 'StreamStickPro', type: 'string', category: 'general', description: 'Default site title' },
        { key: 'site_description', value: 'Premium Jailbroken Fire Sticks & IPTV Subscriptions', type: 'string', category: 'general', description: 'Default meta description' },
        { key: 'title_separator', value: '|', type: 'string', category: 'general', description: 'Separator between page title and site name' },
        { key: 'robots_default', value: 'index, follow', type: 'string', category: 'general', description: 'Default robots meta tag' },
        { key: 'sitemap_enabled', value: 'true', type: 'boolean', category: 'sitemap', description: 'Enable XML sitemap' },
        { key: 'sitemap_posts', value: 'true', type: 'boolean', category: 'sitemap', description: 'Include posts in sitemap' },
        { key: 'sitemap_products', value: 'true', type: 'boolean', category: 'sitemap', description: 'Include products in sitemap' },
        { key: 'sitemap_default_priority', value: '0.5', type: 'string', category: 'sitemap', description: 'Default sitemap priority' },
        { key: 'sitemap_default_changefreq', value: 'weekly', type: 'string', category: 'sitemap', description: 'Default change frequency' },
        { key: 'og_default_image', value: '', type: 'string', category: 'social', description: 'Default Open Graph image URL' },
        { key: 'twitter_card_type', value: 'summary_large_image', type: 'string', category: 'social', description: 'Twitter card type' },
        { key: 'twitter_site', value: '@streamstickpro', type: 'string', category: 'social', description: 'Twitter site handle' },
        { key: 'schema_organization', value: 'true', type: 'boolean', category: 'schema', description: 'Enable Organization schema on all pages' },
        { key: 'schema_breadcrumbs', value: 'true', type: 'boolean', category: 'schema', description: 'Enable breadcrumb schema' },
        { key: 'indexnow_enabled', value: 'false', type: 'boolean', category: 'indexing', description: 'Enable IndexNow auto-submission' },
        { key: 'auto_generate_alt', value: 'true', type: 'boolean', category: 'images', description: 'Auto-generate alt text for images' },
        { key: 'lazy_loading', value: 'true', type: 'boolean', category: 'images', description: 'Enable lazy loading for images' },
        { key: 'audit_schedule', value: 'weekly', type: 'string', category: 'audit', description: 'Automatic audit frequency' },
      ];

      for (const s of defaultSettings) {
        await seoStorage.upsertSetting(s.key, s.value, s.type, s.category, s.description);
      }

      res.json({ success: true, seeded: defaultSettings.length });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to seed settings" });
    }
  });

  // ============ SEO Internal Links ============
  app.get("/api/admin/seo/internal-links", async (req, res) => {
    try {
      const links = await seoStorage.getAllInternalLinks();
      res.json({ data: links });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch internal links" });
    }
  });

  app.get("/api/admin/seo/internal-links/stats", async (req, res) => {
    try {
      const stats = await seoStorage.getInternalLinkStats();
      res.json({ data: stats });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch link stats" });
    }
  });

  app.get("/api/admin/seo/internal-links/orphans", async (req, res) => {
    try {
      const orphans = await seoStorage.getOrphanPages();
      res.json({ data: orphans });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch orphan pages" });
    }
  });

  app.get("/api/admin/seo/internal-links/few-links", async (req, res) => {
    try {
      const threshold = parseInt(req.query.threshold as string) || 2;
      const pages = await seoStorage.getPagesWithFewLinks(threshold);
      res.json({ data: pages });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch pages with few links" });
    }
  });

  app.get("/api/admin/seo/internal-links/suggestions", async (req, res) => {
    try {
      const suggestions = await seoStorage.getLinkSuggestions();
      res.json({ data: suggestions });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch link suggestions" });
    }
  });

  app.get("/api/admin/seo/internal-links/broken", async (req, res) => {
    try {
      const brokenLinks = await seoStorage.getBrokenLinks();
      res.json({ data: brokenLinks });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch broken links" });
    }
  });

  app.post("/api/admin/seo/internal-links/crawl", async (req, res) => {
    try {
      await seoStorage.deleteAllInternalLinks();
      
      const pages = await seoStorage.getAllPages();
      const blogPosts = await import("./storage").then(m => m.storage.getBlogPosts());
      const products = await import("./storage").then(m => m.storage.getRealProducts());
      
      const sitePages = [
        { url: '/', title: 'Home' },
        { url: '/blog', title: 'Blog' },
        { url: '/checkout', title: 'Checkout' },
        ...blogPosts.filter(p => p.published).map(p => ({ url: `/blog/${p.slug}`, title: p.title })),
        ...products.map(p => ({ url: `/product/${p.id}`, title: p.name })),
      ];
      
      let linksCreated = 0;
      for (const page of sitePages) {
        for (const targetPage of sitePages) {
          if (page.url === targetPage.url) continue;
          if (page.url === '/' && targetPage.url !== '/blog') {
            await seoStorage.upsertInternalLink(page.url, targetPage.url, targetPage.title, 'internal');
            linksCreated++;
          }
          if (page.url === '/blog' && targetPage.url.startsWith('/blog/')) {
            await seoStorage.upsertInternalLink(page.url, targetPage.url, targetPage.title, 'internal');
            linksCreated++;
          }
        }
      }
      
      res.json({ success: true, linksCreated, pagesScanned: sitePages.length });
    } catch (error: any) {
      console.error("Crawl error:", error);
      res.status(500).json({ error: "Failed to crawl internal links" });
    }
  });

  app.post("/api/admin/seo/internal-links", async (req, res) => {
    try {
      const { sourceUrl, targetUrl, anchorText, linkType } = req.body;
      const link = await seoStorage.upsertInternalLink(sourceUrl, targetUrl, anchorText, linkType || 'internal');
      res.json({ data: link });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to create internal link" });
    }
  });

  app.delete("/api/admin/seo/internal-links/clear", async (req, res) => {
    try {
      await seoStorage.deleteAllInternalLinks();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to clear internal links" });
    }
  });
}
