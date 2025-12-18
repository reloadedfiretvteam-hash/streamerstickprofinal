import { eq, desc, and, sql, gte, lte, or, ilike, asc } from "drizzle-orm";
import { db } from "./db";
import {
  seoSettings,
  seoPages,
  seoKeywords,
  seoKeywordHistory,
  seoRedirects,
  seo404Logs,
  seoAudits,
  seoInternalLinks,
  seoImages,
  seoAnalyticsCache,
  seoContentSuggestions,
  seoSchemaTypes,
  seoBreadcrumbs,
  type SeoSetting,
  type SeoPage,
  type SeoKeyword,
  type SeoKeywordHistory,
  type SeoRedirect,
  type Seo404Log,
  type SeoAudit,
  type SeoInternalLink,
  type SeoImage,
  type SeoAnalyticsCache,
  type SeoContentSuggestion,
  type SeoSchemaType,
  type SeoBreadcrumb,
  type InsertSeoSetting,
  type InsertSeoPage,
  type InsertSeoKeyword,
  type InsertSeoRedirect,
  type InsertSeo404Log,
  type InsertSeoAudit,
} from "@shared/schema";

export class SeoStorage {
  // ============ SEO Settings ============
  async getSetting(key: string): Promise<SeoSetting | undefined> {
    const [setting] = await db.select().from(seoSettings).where(eq(seoSettings.settingKey, key));
    return setting;
  }

  async getSettingsByCategory(category: string): Promise<SeoSetting[]> {
    return db.select().from(seoSettings).where(eq(seoSettings.category, category));
  }

  async getAllSettings(): Promise<SeoSetting[]> {
    return db.select().from(seoSettings).orderBy(seoSettings.category, seoSettings.settingKey);
  }

  async upsertSetting(key: string, value: string, type: string = "string", category: string = "general", description?: string): Promise<SeoSetting> {
    const existing = await this.getSetting(key);
    if (existing) {
      const [updated] = await db.update(seoSettings)
        .set({ settingValue: value, settingType: type, category, description, updatedAt: new Date() })
        .where(eq(seoSettings.settingKey, key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(seoSettings).values({
      settingKey: key,
      settingValue: value,
      settingType: type,
      category,
      description,
    }).returning();
    return created;
  }

  async deleteSetting(key: string): Promise<boolean> {
    const result = await db.delete(seoSettings).where(eq(seoSettings.settingKey, key));
    return true;
  }

  // ============ SEO Pages ============
  async getPage(url: string): Promise<SeoPage | undefined> {
    const [page] = await db.select().from(seoPages).where(eq(seoPages.pageUrl, url));
    return page;
  }

  async getPageById(id: string): Promise<SeoPage | undefined> {
    const [page] = await db.select().from(seoPages).where(eq(seoPages.id, id));
    return page;
  }

  async getAllPages(): Promise<SeoPage[]> {
    return db.select().from(seoPages).orderBy(desc(seoPages.updatedAt));
  }

  async getPagesByType(pageType: string): Promise<SeoPage[]> {
    return db.select().from(seoPages).where(eq(seoPages.pageType, pageType));
  }

  async getPagesByScore(minScore: number): Promise<SeoPage[]> {
    return db.select().from(seoPages).where(gte(seoPages.overallScore, minScore)).orderBy(desc(seoPages.overallScore));
  }

  async upsertPage(pageUrl: string, data: Partial<InsertSeoPage>): Promise<SeoPage> {
    const existing = await this.getPage(pageUrl);
    if (existing) {
      const [updated] = await db.update(seoPages)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(seoPages.pageUrl, pageUrl))
        .returning();
      return updated;
    }
    const [created] = await db.insert(seoPages).values({
      pageUrl,
      ...data,
    }).returning();
    return created;
  }

  async deletePage(id: string): Promise<boolean> {
    await db.delete(seoPages).where(eq(seoPages.id, id));
    return true;
  }

  async updatePageScores(pageUrl: string, scores: {
    titleScore?: number;
    descriptionScore?: number;
    contentScore?: number;
    readabilityScore?: number;
    keywordScore?: number;
    linkScore?: number;
    imageScore?: number;
    overallScore?: number;
    seoIssues?: string;
    seoSuggestions?: string;
  }): Promise<SeoPage | undefined> {
    const [updated] = await db.update(seoPages)
      .set({ ...scores, lastAnalyzed: new Date(), updatedAt: new Date() })
      .where(eq(seoPages.pageUrl, pageUrl))
      .returning();
    return updated;
  }

  // ============ SEO Keywords ============
  async getKeyword(id: string): Promise<SeoKeyword | undefined> {
    const [keyword] = await db.select().from(seoKeywords).where(eq(seoKeywords.id, id));
    return keyword;
  }

  async getKeywordByName(keyword: string): Promise<SeoKeyword | undefined> {
    const [found] = await db.select().from(seoKeywords).where(eq(seoKeywords.keyword, keyword));
    return found;
  }

  async getAllKeywords(): Promise<SeoKeyword[]> {
    return db.select().from(seoKeywords).orderBy(desc(seoKeywords.createdAt));
  }

  async getTrackedKeywords(): Promise<SeoKeyword[]> {
    return db.select().from(seoKeywords).where(eq(seoKeywords.trackingEnabled, true)).orderBy(seoKeywords.currentPosition);
  }

  async createKeyword(data: InsertSeoKeyword): Promise<SeoKeyword> {
    const [created] = await db.insert(seoKeywords).values(data).returning();
    return created;
  }

  async updateKeyword(id: string, data: Partial<InsertSeoKeyword>): Promise<SeoKeyword | undefined> {
    const [updated] = await db.update(seoKeywords).set(data).where(eq(seoKeywords.id, id)).returning();
    return updated;
  }

  async deleteKeyword(id: string): Promise<boolean> {
    await db.delete(seoKeywords).where(eq(seoKeywords.id, id));
    return true;
  }

  async recordKeywordPosition(keywordId: string, position: number, url?: string, serpFeatures?: string[]): Promise<void> {
    await db.insert(seoKeywordHistory).values({
      keywordId,
      position,
      url,
      serpFeatures,
    });
    
    const keyword = await this.getKeyword(keywordId);
    if (keyword) {
      const positionChange = keyword.currentPosition ? keyword.currentPosition - position : 0;
      await this.updateKeyword(keywordId, {
        previousPosition: keyword.currentPosition,
        currentPosition: position,
        positionChange,
        bestPosition: keyword.bestPosition ? Math.min(keyword.bestPosition, position) : position,
        lastChecked: new Date(),
      });
    }
  }

  async getKeywordHistory(keywordId: string, days: number = 30): Promise<SeoKeywordHistory[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return db.select().from(seoKeywordHistory)
      .where(and(eq(seoKeywordHistory.keywordId, keywordId), gte(seoKeywordHistory.checkedAt, since)))
      .orderBy(asc(seoKeywordHistory.checkedAt));
  }

  // ============ SEO Redirects ============
  async getRedirect(id: string): Promise<SeoRedirect | undefined> {
    const [redirect] = await db.select().from(seoRedirects).where(eq(seoRedirects.id, id));
    return redirect;
  }

  async getRedirectBySource(sourceUrl: string): Promise<SeoRedirect | undefined> {
    const [redirect] = await db.select().from(seoRedirects)
      .where(and(eq(seoRedirects.sourceUrl, sourceUrl), eq(seoRedirects.isActive, true)));
    return redirect;
  }

  async getAllRedirects(): Promise<SeoRedirect[]> {
    return db.select().from(seoRedirects).orderBy(desc(seoRedirects.createdAt));
  }

  async getActiveRedirects(): Promise<SeoRedirect[]> {
    return db.select().from(seoRedirects).where(eq(seoRedirects.isActive, true));
  }

  async createRedirect(data: InsertSeoRedirect): Promise<SeoRedirect> {
    const [created] = await db.insert(seoRedirects).values(data).returning();
    return created;
  }

  async updateRedirect(id: string, data: Partial<InsertSeoRedirect>): Promise<SeoRedirect | undefined> {
    const [updated] = await db.update(seoRedirects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(seoRedirects.id, id))
      .returning();
    return updated;
  }

  async deleteRedirect(id: string): Promise<boolean> {
    await db.delete(seoRedirects).where(eq(seoRedirects.id, id));
    return true;
  }

  async incrementRedirectHit(id: string): Promise<void> {
    await db.update(seoRedirects)
      .set({ 
        hitCount: sql`${seoRedirects.hitCount} + 1`,
        lastHit: new Date(),
      })
      .where(eq(seoRedirects.id, id));
  }

  // ============ SEO 404 Logs ============
  async get404Log(id: string): Promise<Seo404Log | undefined> {
    const [log] = await db.select().from(seo404Logs).where(eq(seo404Logs.id, id));
    return log;
  }

  async get404LogByUrl(url: string): Promise<Seo404Log | undefined> {
    const [log] = await db.select().from(seo404Logs).where(eq(seo404Logs.url, url));
    return log;
  }

  async getAll404Logs(): Promise<Seo404Log[]> {
    return db.select().from(seo404Logs).orderBy(desc(seo404Logs.hitCount));
  }

  async getUnresolved404Logs(): Promise<Seo404Log[]> {
    return db.select().from(seo404Logs)
      .where(and(eq(seo404Logs.resolved, false), eq(seo404Logs.ignored, false)))
      .orderBy(desc(seo404Logs.hitCount));
  }

  async log404(url: string, referrer?: string, userAgent?: string, ipAddress?: string): Promise<Seo404Log> {
    const existing = await this.get404LogByUrl(url);
    if (existing) {
      const [updated] = await db.update(seo404Logs)
        .set({ 
          hitCount: sql`${seo404Logs.hitCount} + 1`,
          lastHit: new Date(),
          referrer: referrer || existing.referrer,
        })
        .where(eq(seo404Logs.url, url))
        .returning();
      return updated;
    }
    const [created] = await db.insert(seo404Logs).values({
      url,
      referrer,
      userAgent,
      ipAddress,
    }).returning();
    return created;
  }

  async resolve404(id: string, redirectId?: string): Promise<Seo404Log | undefined> {
    const [updated] = await db.update(seo404Logs)
      .set({ resolved: true, resolvedRedirectId: redirectId })
      .where(eq(seo404Logs.id, id))
      .returning();
    return updated;
  }

  async ignore404(id: string): Promise<Seo404Log | undefined> {
    const [updated] = await db.update(seo404Logs)
      .set({ ignored: true })
      .where(eq(seo404Logs.id, id))
      .returning();
    return updated;
  }

  async delete404Log(id: string): Promise<boolean> {
    await db.delete(seo404Logs).where(eq(seo404Logs.id, id));
    return true;
  }

  // ============ SEO Audits ============
  async getAudit(id: string): Promise<SeoAudit | undefined> {
    const [audit] = await db.select().from(seoAudits).where(eq(seoAudits.id, id));
    return audit;
  }

  async getAllAudits(): Promise<SeoAudit[]> {
    return db.select().from(seoAudits).orderBy(desc(seoAudits.createdAt));
  }

  async getLatestAudit(): Promise<SeoAudit | undefined> {
    const [audit] = await db.select().from(seoAudits)
      .where(eq(seoAudits.status, "completed"))
      .orderBy(desc(seoAudits.completedAt))
      .limit(1);
    return audit;
  }

  async createAudit(data: InsertSeoAudit): Promise<SeoAudit> {
    const [created] = await db.insert(seoAudits).values(data).returning();
    return created;
  }

  async updateAudit(id: string, data: Partial<InsertSeoAudit>): Promise<SeoAudit | undefined> {
    const [updated] = await db.update(seoAudits).set(data).where(eq(seoAudits.id, id)).returning();
    return updated;
  }

  async deleteAudit(id: string): Promise<boolean> {
    await db.delete(seoAudits).where(eq(seoAudits.id, id));
    return true;
  }

  // ============ SEO Internal Links ============
  async getInternalLinksFromPage(sourceUrl: string): Promise<SeoInternalLink[]> {
    return db.select().from(seoInternalLinks).where(eq(seoInternalLinks.sourceUrl, sourceUrl));
  }

  async getInternalLinksToPage(targetUrl: string): Promise<SeoInternalLink[]> {
    return db.select().from(seoInternalLinks).where(eq(seoInternalLinks.targetUrl, targetUrl));
  }

  async getBrokenLinks(): Promise<SeoInternalLink[]> {
    return db.select().from(seoInternalLinks).where(eq(seoInternalLinks.isBroken, true));
  }

  async upsertInternalLink(sourceUrl: string, targetUrl: string, anchorText?: string, linkType: string = "internal"): Promise<SeoInternalLink> {
    const existing = await db.select().from(seoInternalLinks)
      .where(and(eq(seoInternalLinks.sourceUrl, sourceUrl), eq(seoInternalLinks.targetUrl, targetUrl)));
    
    if (existing.length > 0) {
      const [updated] = await db.update(seoInternalLinks)
        .set({ anchorText, linkType, lastChecked: new Date() })
        .where(and(eq(seoInternalLinks.sourceUrl, sourceUrl), eq(seoInternalLinks.targetUrl, targetUrl)))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(seoInternalLinks).values({
      sourceUrl,
      targetUrl,
      anchorText,
      linkType,
    }).returning();
    return created;
  }

  async markLinkBroken(sourceUrl: string, targetUrl: string, isBroken: boolean): Promise<void> {
    await db.update(seoInternalLinks)
      .set({ isBroken, lastChecked: new Date() })
      .where(and(eq(seoInternalLinks.sourceUrl, sourceUrl), eq(seoInternalLinks.targetUrl, targetUrl)));
  }

  async getAllInternalLinks(): Promise<SeoInternalLink[]> {
    return db.select().from(seoInternalLinks).orderBy(seoInternalLinks.sourceUrl);
  }

  async deleteAllInternalLinks(): Promise<void> {
    await db.delete(seoInternalLinks);
  }

  async getInternalLinkStats(): Promise<{
    totalLinks: number;
    uniqueSourcePages: number;
    uniqueTargetPages: number;
    brokenLinks: number;
    externalLinks: number;
  }> {
    const allLinks = await db.select().from(seoInternalLinks);
    const sourcePages = new Set(allLinks.map(l => l.sourceUrl));
    const targetPages = new Set(allLinks.map(l => l.targetUrl));
    const brokenCount = allLinks.filter(l => l.isBroken).length;
    const externalCount = allLinks.filter(l => l.linkType === 'external').length;
    
    return {
      totalLinks: allLinks.length,
      uniqueSourcePages: sourcePages.size,
      uniqueTargetPages: targetPages.size,
      brokenLinks: brokenCount,
      externalLinks: externalCount,
    };
  }

  async getOrphanPages(): Promise<string[]> {
    const pages = await this.getAllPages();
    const allLinks = await db.select().from(seoInternalLinks);
    const targetUrls = new Set(allLinks.map(l => l.targetUrl));
    
    return pages
      .filter(p => !targetUrls.has(p.pageUrl) && p.pageUrl !== '/')
      .map(p => p.pageUrl);
  }

  async getPagesWithFewLinks(threshold: number = 2): Promise<Array<{ pageUrl: string; inboundCount: number }>> {
    const pages = await this.getAllPages();
    const allLinks = await db.select().from(seoInternalLinks);
    
    const inboundCounts: Record<string, number> = {};
    for (const link of allLinks) {
      inboundCounts[link.targetUrl] = (inboundCounts[link.targetUrl] || 0) + 1;
    }
    
    return pages
      .map(p => ({ pageUrl: p.pageUrl, inboundCount: inboundCounts[p.pageUrl] || 0 }))
      .filter(p => p.inboundCount < threshold && p.pageUrl !== '/')
      .sort((a, b) => a.inboundCount - b.inboundCount);
  }

  async getLinkSuggestions(): Promise<Array<{ sourceUrl: string; targetUrl: string; reason: string }>> {
    const pages = await this.getAllPages();
    const allLinks = await db.select().from(seoInternalLinks);
    const existingPairs = new Set(allLinks.map(l => `${l.sourceUrl}|${l.targetUrl}`));
    
    const suggestions: Array<{ sourceUrl: string; targetUrl: string; reason: string }> = [];
    
    for (const sourcePage of pages) {
      if (!sourcePage.focusKeyword) continue;
      
      for (const targetPage of pages) {
        if (sourcePage.pageUrl === targetPage.pageUrl) continue;
        if (existingPairs.has(`${sourcePage.pageUrl}|${targetPage.pageUrl}`)) continue;
        
        const sourceKeyword = sourcePage.focusKeyword?.toLowerCase() || '';
        const targetTitle = targetPage.metaTitle?.toLowerCase() || '';
        const targetDesc = targetPage.metaDescription?.toLowerCase() || '';
        const targetKeyword = targetPage.focusKeyword?.toLowerCase() || '';
        
        if (sourceKeyword && (targetTitle.includes(sourceKeyword) || targetDesc.includes(sourceKeyword) || targetKeyword.includes(sourceKeyword))) {
          suggestions.push({
            sourceUrl: sourcePage.pageUrl,
            targetUrl: targetPage.pageUrl,
            reason: `"${sourcePage.focusKeyword}" keyword matches target page content`
          });
        }
      }
    }
    
    return suggestions.slice(0, 20);
  }

  // ============ SEO Images ============
  async getImage(id: string): Promise<SeoImage | undefined> {
    const [image] = await db.select().from(seoImages).where(eq(seoImages.id, id));
    return image;
  }

  async getImagesByPage(pageUrl: string): Promise<SeoImage[]> {
    return db.select().from(seoImages).where(eq(seoImages.pageUrl, pageUrl));
  }

  async getImagesWithoutAlt(): Promise<SeoImage[]> {
    return db.select().from(seoImages).where(or(eq(seoImages.altText, ""), sql`${seoImages.altText} IS NULL`));
  }

  async upsertImage(imageUrl: string, data: Partial<SeoImage>): Promise<SeoImage> {
    const existing = await db.select().from(seoImages).where(eq(seoImages.imageUrl, imageUrl));
    if (existing.length > 0) {
      const [updated] = await db.update(seoImages).set(data).where(eq(seoImages.imageUrl, imageUrl)).returning();
      return updated;
    }
    const [created] = await db.insert(seoImages).values({ imageUrl, ...data }).returning();
    return created;
  }

  // ============ SEO Analytics Cache ============
  async getCachedAnalytics(dataType: string, dateRange: string, source: string = "gsc"): Promise<SeoAnalyticsCache | undefined> {
    const [cached] = await db.select().from(seoAnalyticsCache)
      .where(and(
        eq(seoAnalyticsCache.dataType, dataType),
        eq(seoAnalyticsCache.dateRange, dateRange),
        eq(seoAnalyticsCache.source, source)
      ));
    return cached;
  }

  async upsertAnalyticsCache(dataType: string, dateRange: string, data: string, source: string = "gsc"): Promise<SeoAnalyticsCache> {
    const existing = await this.getCachedAnalytics(dataType, dateRange, source);
    if (existing) {
      const [updated] = await db.update(seoAnalyticsCache)
        .set({ data, fetchedAt: new Date() })
        .where(eq(seoAnalyticsCache.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(seoAnalyticsCache).values({
      dataType,
      dateRange,
      data,
      source,
    }).returning();
    return created;
  }

  // ============ SEO Content Suggestions ============
  async getSuggestionsByPage(pageUrl: string): Promise<SeoContentSuggestion[]> {
    return db.select().from(seoContentSuggestions)
      .where(eq(seoContentSuggestions.pageUrl, pageUrl))
      .orderBy(desc(seoContentSuggestions.createdAt));
  }

  async getPendingSuggestions(): Promise<SeoContentSuggestion[]> {
    return db.select().from(seoContentSuggestions)
      .where(eq(seoContentSuggestions.status, "pending"))
      .orderBy(seoContentSuggestions.priority);
  }

  async createSuggestion(data: { pageUrl?: string; suggestionType: string; suggestion: string; reasoning?: string; priority?: string }): Promise<SeoContentSuggestion> {
    const [created] = await db.insert(seoContentSuggestions).values(data).returning();
    return created;
  }

  async updateSuggestionStatus(id: string, status: string): Promise<void> {
    await db.update(seoContentSuggestions).set({ status }).where(eq(seoContentSuggestions.id, id));
  }

  // ============ SEO Schema Types ============
  async getAllSchemaTypes(): Promise<SeoSchemaType[]> {
    return db.select().from(seoSchemaTypes);
  }

  async getEnabledSchemaTypes(): Promise<SeoSchemaType[]> {
    return db.select().from(seoSchemaTypes).where(eq(seoSchemaTypes.isEnabled, true));
  }

  async upsertSchemaType(schemaType: string, data: Partial<SeoSchemaType>): Promise<SeoSchemaType> {
    const existing = await db.select().from(seoSchemaTypes).where(eq(seoSchemaTypes.schemaType, schemaType));
    if (existing.length > 0) {
      const [updated] = await db.update(seoSchemaTypes).set(data).where(eq(seoSchemaTypes.schemaType, schemaType)).returning();
      return updated;
    }
    const [created] = await db.insert(seoSchemaTypes).values({ schemaType, ...data }).returning();
    return created;
  }

  // ============ SEO Breadcrumbs ============
  async getBreadcrumb(pageUrl: string): Promise<SeoBreadcrumb | undefined> {
    const [breadcrumb] = await db.select().from(seoBreadcrumbs).where(eq(seoBreadcrumbs.pageUrl, pageUrl));
    return breadcrumb;
  }

  async upsertBreadcrumb(pageUrl: string, breadcrumbPath: string, customLabels?: string): Promise<SeoBreadcrumb> {
    const existing = await this.getBreadcrumb(pageUrl);
    if (existing) {
      const [updated] = await db.update(seoBreadcrumbs)
        .set({ breadcrumbPath, customLabels, updatedAt: new Date() })
        .where(eq(seoBreadcrumbs.pageUrl, pageUrl))
        .returning();
      return updated;
    }
    const [created] = await db.insert(seoBreadcrumbs).values({
      pageUrl,
      breadcrumbPath,
      customLabels,
    }).returning();
    return created;
  }

  // ============ Dashboard Stats ============
  async getSeoStats(): Promise<{
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
  }> {
    const pages = await this.getAllPages();
    const redirects = await this.getAllRedirects();
    const logs404 = await this.getAll404Logs();
    const unresolved404s = await this.getUnresolved404Logs();
    const keywords = await this.getTrackedKeywords();
    const latestAudit = await this.getLatestAudit();

    const totalPages = pages.length;
    const averageScore = totalPages > 0 
      ? Math.round(pages.reduce((sum, p) => sum + (p.overallScore || 0), 0) / totalPages)
      : 0;
    const pagesNeedingImprovement = pages.filter(p => (p.overallScore || 0) < 70).length;
    const keywordsInTop10 = keywords.filter(k => k.currentPosition && k.currentPosition <= 10).length;

    return {
      totalPages,
      averageScore,
      pagesNeedingImprovement,
      totalRedirects: redirects.length,
      total404s: logs404.length,
      unresolved404s: unresolved404s.length,
      trackedKeywords: keywords.length,
      keywordsInTop10,
      lastAuditScore: latestAudit?.overallScore || null,
      criticalIssues: latestAudit?.criticalIssues || 0,
    };
  }
}

export const seoStorage = new SeoStorage();
