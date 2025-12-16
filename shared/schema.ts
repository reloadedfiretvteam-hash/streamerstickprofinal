import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, uniqueIndex, index, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  phone: text("phone"),
  status: text("status").default("active"),
  notes: text("notes"),
  totalOrders: integer("total_orders").default(0),
  lastOrderAt: timestamp("last_order_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("customers_username_idx").on(table.username),
  index("customers_email_idx").on(table.email),
  index("customers_status_idx").on(table.status),
]);

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalOrders: true,
  lastOrderAt: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  stripeCustomerId: text("stripe_customer_id"),
  shadowProductId: text("shadow_product_id"),
  shadowPriceId: text("shadow_price_id"),
  realProductId: text("real_product_id"),
  realProductName: text("real_product_name"),
  amount: integer("amount").notNull(),
  status: text("status").default("pending"),
  credentialsSent: boolean("credentials_sent").default(false),
  shippingName: text("shipping_name"),
  shippingPhone: text("shipping_phone"),
  shippingStreet: text("shipping_street"),
  shippingCity: text("shipping_city"),
  shippingState: text("shipping_state"),
  shippingZip: text("shipping_zip"),
  shippingCountry: text("shipping_country"),
  fulfillmentStatus: text("fulfillment_status").default("pending"),
  amazonOrderId: text("amazon_order_id"),
  customerId: text("customer_id"),
  isRenewal: boolean("is_renewal").default(false),
  existingUsername: text("existing_username"),
  generatedUsername: text("generated_username"),
  generatedPassword: text("generated_password"),
  countryPreference: text("country_preference"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("orders_payment_intent_idx").on(table.stripePaymentIntentId),
  uniqueIndex("orders_checkout_session_idx").on(table.stripeCheckoutSessionId),
  index("orders_customer_email_idx").on(table.customerEmail),
  index("orders_fulfillment_status_idx").on(table.fulfillmentStatus),
  index("orders_customer_id_idx").on(table.customerId),
]);

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export const realProducts = pgTable("real_products", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category"),
  shadowProductId: text("shadow_product_id"),
  shadowPriceId: text("shadow_price_id"),
}, (table) => [
  uniqueIndex("real_products_shadow_product_idx").on(table.shadowProductId),
  uniqueIndex("real_products_shadow_price_idx").on(table.shadowPriceId),
  index("real_products_category_idx").on(table.category),
]);

export const insertRealProductSchema = createInsertSchema(realProducts);

export type InsertRealProduct = z.infer<typeof insertRealProductSchema>;
export type RealProduct = typeof realProducts.$inferSelect;

export const checkoutItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
});

export const checkoutRequestSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "At least one item is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  shippingStreet: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingZip: z.string().optional(),
  shippingCountry: z.string().optional(),
  isRenewal: z.boolean().optional(),
  existingUsername: z.string().optional(),
  countryPreference: z.string().optional(),
});

export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export const customerLookupSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

export const createCustomerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  email: z.string().email("Valid email is required"),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  email: z.string().email().optional(),
  fullName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  notes: z.string().nullable().optional(),
});

export type CustomerLookup = z.infer<typeof customerLookupSchema>;
export type CreateCustomer = z.infer<typeof createCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;

export const createProductRequestSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Product name is required"),
  description: z.string().nullable().optional(),
  price: z.number().int().positive("Price must be a positive integer (in cents)"),
  imageUrl: z.string().url().nullable().optional(),
  category: z.string().nullable().optional(),
  shadowProductId: z.string().nullable().optional(),
  shadowPriceId: z.string().nullable().optional(),
});

export type CreateProductRequest = z.infer<typeof createProductRequestSchema>;

export const updateProductRequestSchema = createProductRequestSchema.partial().omit({ id: true });
export type UpdateProductRequest = z.infer<typeof updateProductRequestSchema>;

export const mapShadowProductSchema = z.object({
  shadowProductId: z.string().min(1, "Shadow product ID is required"),
  shadowPriceId: z.string().min(1, "Shadow price ID is required"),
});

export type MapShadowProductRequest = z.infer<typeof mapShadowProductSchema>;

export const updateOrderRequestSchema = z.object({
  status: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  credentialsSent: z.boolean().optional(),
  shippingName: z.string().nullable().optional(),
  shippingPhone: z.string().nullable().optional(),
  shippingStreet: z.string().nullable().optional(),
  shippingCity: z.string().nullable().optional(),
  shippingState: z.string().nullable().optional(),
  shippingZip: z.string().nullable().optional(),
  shippingCountry: z.string().nullable().optional(),
  fulfillmentStatus: z.enum(['pending', 'ordered', 'shipped', 'delivered']).optional(),
  amazonOrderId: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  isRenewal: z.boolean().optional(),
  existingUsername: z.string().nullable().optional(),
  generatedUsername: z.string().nullable().optional(),
  generatedPassword: z.string().nullable().optional(),
  countryPreference: z.string().nullable().optional(),
});

export type UpdateOrderRequest = z.infer<typeof updateOrderRequestSchema>;

export const visitors = pgTable("visitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  pageUrl: text("page_url").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  country: text("country"),
  countryCode: text("country_code"),
  region: text("region"),
  regionCode: text("region_code"),
  city: text("city"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  timezone: text("timezone"),
  isp: text("isp"),
  isProxy: boolean("is_proxy").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("visitors_session_idx").on(table.sessionId),
  index("visitors_created_at_idx").on(table.createdAt),
  index("visitors_country_idx").on(table.country),
  index("visitors_region_idx").on(table.region),
]);

export const insertVisitorSchema = createInsertSchema(visitors).omit({
  id: true,
  createdAt: true,
});

export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;

export const pageEdits = pgTable("page_edits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: text("page_id").notNull(),
  sectionId: text("section_id").notNull(),
  elementId: text("element_id").notNull(),
  elementType: text("element_type").notNull(),
  content: text("content"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("page_edits_page_idx").on(table.pageId),
  uniqueIndex("page_edits_element_unique_idx").on(table.pageId, table.sectionId, table.elementId),
]);

export const insertPageEditSchema = createInsertSchema(pageEdits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPageEdit = z.infer<typeof insertPageEditSchema>;
export type PageEdit = typeof pageEdits.$inferSelect;

export const upsertPageEditSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
  sectionId: z.string().min(1, "Section ID is required"),
  elementId: z.string().min(1, "Element ID is required"),
  elementType: z.enum(["text", "image", "heading", "paragraph", "button"]),
  content: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type UpsertPageEditRequest = z.infer<typeof upsertPageEditSchema>;

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  
  // SEO Fields
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: text("keywords").array(),
  readTime: text("read_time"),
  wordCount: integer("word_count"),
  
  // SEO Scores
  headingScore: integer("heading_score").default(0),
  keywordDensityScore: integer("keyword_density_score").default(0),
  contentLengthScore: integer("content_length_score").default(0),
  metaScore: integer("meta_score").default(0),
  structureScore: integer("structure_score").default(0),
  overallSeoScore: integer("overall_seo_score").default(0),
  seoAnalysis: text("seo_analysis"),
  
  // Publishing
  featured: boolean("featured").default(false),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  
  // Product Linking
  linkedProductIds: text("linked_product_ids").array(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  uniqueIndex("blog_posts_slug_idx").on(table.slug),
  index("blog_posts_category_idx").on(table.category),
  index("blog_posts_published_idx").on(table.published),
  index("blog_posts_featured_idx").on(table.featured),
  index("blog_posts_seo_score_idx").on(table.overallSeoScore),
  index("blog_posts_created_at_idx").on(table.createdAt),
]);

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  wordCount: true,
  headingScore: true,
  keywordDensityScore: true,
  contentLengthScore: true,
  metaScore: true,
  structureScore: true,
  overallSeoScore: true,
  seoAnalysis: true,
});

export const updateBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type UpdateBlogPost = z.infer<typeof updateBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// ============================================
// SEO TOOLKIT TABLES (Rank Math Premium Clone)
// ============================================

// SEO Settings - Global configuration
export const seoSettings = pgTable("seo_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value"),
  settingType: text("setting_type").default("string"), // string, boolean, json, number
  category: text("category").default("general"), // general, sitemap, social, schema, indexing
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSeoSettingSchema = createInsertSchema(seoSettings).omit({ id: true, updatedAt: true });
export type InsertSeoSetting = z.infer<typeof insertSeoSettingSchema>;
export type SeoSetting = typeof seoSettings.$inferSelect;

// SEO Pages - Per-page SEO metadata and scores
export const seoPages = pgTable("seo_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageUrl: text("page_url").notNull().unique(),
  pageType: text("page_type").default("page"), // page, post, product, category
  
  // Focus Keywords (up to 5)
  focusKeyword: text("focus_keyword"),
  secondaryKeywords: text("secondary_keywords").array(),
  
  // Meta Tags
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  canonicalUrl: text("canonical_url"),
  robots: text("robots").default("index, follow"),
  
  // Social Media
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  twitterTitle: text("twitter_title"),
  twitterDescription: text("twitter_description"),
  twitterImage: text("twitter_image"),
  
  // Schema Markup
  schemaType: text("schema_type"), // Article, Product, LocalBusiness, FAQ, HowTo, etc.
  schemaData: text("schema_data"), // JSON string of schema
  
  // SEO Scores (0-100)
  titleScore: integer("title_score").default(0),
  descriptionScore: integer("description_score").default(0),
  contentScore: integer("content_score").default(0),
  readabilityScore: integer("readability_score").default(0),
  keywordScore: integer("keyword_score").default(0),
  linkScore: integer("link_score").default(0),
  imageScore: integer("image_score").default(0),
  overallScore: integer("overall_score").default(0),
  
  // Analysis
  seoIssues: text("seo_issues"), // JSON array of issues
  seoSuggestions: text("seo_suggestions"), // JSON array of suggestions
  lastAnalyzed: timestamp("last_analyzed"),
  
  // Indexing
  indexNowSubmitted: boolean("indexnow_submitted").default(false),
  indexNowLastSubmit: timestamp("indexnow_last_submit"),
  inSitemap: boolean("in_sitemap").default(true),
  sitemapPriority: text("sitemap_priority").default("0.5"),
  sitemapChangefreq: text("sitemap_changefreq").default("weekly"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("seo_pages_url_idx").on(table.pageUrl),
  index("seo_pages_type_idx").on(table.pageType),
  index("seo_pages_score_idx").on(table.overallScore),
]);

export const insertSeoPageSchema = createInsertSchema(seoPages).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSeoPage = z.infer<typeof insertSeoPageSchema>;
export type SeoPage = typeof seoPages.$inferSelect;

// SEO Keywords - Focus keyword tracking and ranking
export const seoKeywords = pgTable("seo_keywords", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyword: text("keyword").notNull(),
  searchVolume: integer("search_volume"),
  difficulty: integer("difficulty"), // 0-100
  cpc: text("cpc"), // Cost per click
  trend: text("trend"), // up, down, stable
  
  // Tracking
  trackingEnabled: boolean("tracking_enabled").default(false),
  targetUrl: text("target_url"),
  currentPosition: integer("current_position"),
  previousPosition: integer("previous_position"),
  bestPosition: integer("best_position"),
  positionChange: integer("position_change"),
  
  // SERP Features
  serpFeatures: text("serp_features").array(), // featured_snippet, people_also_ask, etc.
  serpUrl: text("serp_url"),
  
  // Competition
  competitors: text("competitors"), // JSON array of competitor URLs
  
  lastChecked: timestamp("last_checked"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("seo_keywords_keyword_idx").on(table.keyword),
  index("seo_keywords_position_idx").on(table.currentPosition),
  index("seo_keywords_tracking_idx").on(table.trackingEnabled),
]);

export const insertSeoKeywordSchema = createInsertSchema(seoKeywords).omit({ id: true, createdAt: true });
export type InsertSeoKeyword = z.infer<typeof insertSeoKeywordSchema>;
export type SeoKeyword = typeof seoKeywords.$inferSelect;

// SEO Keyword History - Daily position tracking
export const seoKeywordHistory = pgTable("seo_keyword_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keywordId: text("keyword_id").notNull(),
  position: integer("position"),
  url: text("url"),
  serpFeatures: text("serp_features").array(),
  checkedAt: timestamp("checked_at").defaultNow(),
}, (table) => [
  index("seo_keyword_history_keyword_idx").on(table.keywordId),
  index("seo_keyword_history_date_idx").on(table.checkedAt),
]);

export type SeoKeywordHistory = typeof seoKeywordHistory.$inferSelect;

// SEO Redirects - 301/302 redirect management
export const seoRedirects = pgTable("seo_redirects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceUrl: text("source_url").notNull(),
  targetUrl: text("target_url").notNull(),
  redirectType: text("redirect_type").default("301"), // 301, 302, 307
  isRegex: boolean("is_regex").default(false),
  isActive: boolean("is_active").default(true),
  hitCount: integer("hit_count").default(0),
  lastHit: timestamp("last_hit"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("seo_redirects_source_idx").on(table.sourceUrl),
  index("seo_redirects_active_idx").on(table.isActive),
]);

export const insertSeoRedirectSchema = createInsertSchema(seoRedirects).omit({ id: true, createdAt: true, updatedAt: true, hitCount: true, lastHit: true });
export type InsertSeoRedirect = z.infer<typeof insertSeoRedirectSchema>;
export type SeoRedirect = typeof seoRedirects.$inferSelect;

// SEO 404 Logs - Track broken links
export const seo404Logs = pgTable("seo_404_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  hitCount: integer("hit_count").default(1),
  firstHit: timestamp("first_hit").defaultNow(),
  lastHit: timestamp("last_hit").defaultNow(),
  resolved: boolean("resolved").default(false),
  resolvedRedirectId: text("resolved_redirect_id"),
  ignored: boolean("ignored").default(false),
}, (table) => [
  index("seo_404_url_idx").on(table.url),
  index("seo_404_resolved_idx").on(table.resolved),
  index("seo_404_hits_idx").on(table.hitCount),
]);

export const insertSeo404LogSchema = createInsertSchema(seo404Logs).omit({ id: true, firstHit: true, lastHit: true });
export type InsertSeo404Log = z.infer<typeof insertSeo404LogSchema>;
export type Seo404Log = typeof seo404Logs.$inferSelect;

// SEO Audits - Site-wide SEO health checks
export const seoAudits = pgTable("seo_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  auditType: text("audit_type").default("full"), // full, quick, custom
  status: text("status").default("pending"), // pending, running, completed, failed
  
  // Overall Scores
  overallScore: integer("overall_score").default(0),
  technicalScore: integer("technical_score").default(0),
  contentScore: integer("content_score").default(0),
  linkScore: integer("link_score").default(0),
  performanceScore: integer("performance_score").default(0),
  
  // Issue Counts
  criticalIssues: integer("critical_issues").default(0),
  warningIssues: integer("warning_issues").default(0),
  passedChecks: integer("passed_checks").default(0),
  
  // Results
  issues: text("issues"), // JSON array of issues
  recommendations: text("recommendations"), // JSON array
  pagesAnalyzed: integer("pages_analyzed").default(0),
  
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("seo_audits_status_idx").on(table.status),
  index("seo_audits_created_idx").on(table.createdAt),
]);

export const insertSeoAuditSchema = createInsertSchema(seoAudits).omit({ id: true, createdAt: true });
export type InsertSeoAudit = z.infer<typeof insertSeoAuditSchema>;
export type SeoAudit = typeof seoAudits.$inferSelect;

// SEO Internal Links - Link structure analysis
export const seoInternalLinks = pgTable("seo_internal_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sourceUrl: text("source_url").notNull(),
  targetUrl: text("target_url").notNull(),
  anchorText: text("anchor_text"),
  linkType: text("link_type").default("internal"), // internal, external, nofollow
  isFollowed: boolean("is_followed").default(true),
  isBroken: boolean("is_broken").default(false),
  lastChecked: timestamp("last_checked").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("seo_links_source_idx").on(table.sourceUrl),
  index("seo_links_target_idx").on(table.targetUrl),
  index("seo_links_broken_idx").on(table.isBroken),
]);

export type SeoInternalLink = typeof seoInternalLinks.$inferSelect;

// SEO Images - Image optimization tracking
export const seoImages = pgTable("seo_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  pageUrl: text("page_url"),
  originalFilename: text("original_filename"),
  altText: text("alt_text"),
  altTextGenerated: boolean("alt_text_generated").default(false),
  title: text("title"),
  fileSize: integer("file_size"),
  width: integer("width"),
  height: integer("height"),
  format: text("format"),
  isOptimized: boolean("is_optimized").default(false),
  hasLazyLoading: boolean("has_lazy_loading").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("seo_images_url_idx").on(table.imageUrl),
  index("seo_images_page_idx").on(table.pageUrl),
  index("seo_images_optimized_idx").on(table.isOptimized),
]);

export type SeoImage = typeof seoImages.$inferSelect;

// SEO Analytics Cache - Store GA/GSC data
export const seoAnalyticsCache = pgTable("seo_analytics_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dataType: text("data_type").notNull(), // traffic, search_queries, pages, countries
  dateRange: text("date_range").notNull(), // 7d, 30d, 90d
  data: text("data").notNull(), // JSON
  source: text("source").default("gsc"), // ga4, gsc
  fetchedAt: timestamp("fetched_at").defaultNow(),
}, (table) => [
  index("seo_analytics_type_idx").on(table.dataType),
  index("seo_analytics_source_idx").on(table.source),
]);

export type SeoAnalyticsCache = typeof seoAnalyticsCache.$inferSelect;

// SEO Content AI - AI-powered content suggestions
export const seoContentSuggestions = pgTable("seo_content_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageUrl: text("page_url"),
  suggestionType: text("suggestion_type").notNull(), // keyword, topic, content, title, description
  suggestion: text("suggestion").notNull(),
  reasoning: text("reasoning"),
  priority: text("priority").default("medium"), // low, medium, high
  status: text("status").default("pending"), // pending, applied, dismissed
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("seo_suggestions_page_idx").on(table.pageUrl),
  index("seo_suggestions_type_idx").on(table.suggestionType),
  index("seo_suggestions_status_idx").on(table.status),
]);

export type SeoContentSuggestion = typeof seoContentSuggestions.$inferSelect;

// Schema Types Configuration
export const seoSchemaTypes = pgTable("seo_schema_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schemaType: text("schema_type").notNull().unique(), // Article, Product, FAQ, HowTo, LocalBusiness, etc.
  isEnabled: boolean("is_enabled").default(true),
  defaultTemplate: text("default_template"), // JSON template
  description: text("description"),
  applicablePageTypes: text("applicable_page_types").array(), // page, post, product
}, (table) => [
  index("seo_schema_types_type_idx").on(table.schemaType),
]);

export type SeoSchemaType = typeof seoSchemaTypes.$inferSelect;

// Breadcrumb Settings
export const seoBreadcrumbs = pgTable("seo_breadcrumbs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageUrl: text("page_url").notNull().unique(),
  breadcrumbPath: text("breadcrumb_path").notNull(), // JSON array of {name, url}
  customLabels: text("custom_labels"), // JSON object for custom labels
  isEnabled: boolean("is_enabled").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("seo_breadcrumbs_url_idx").on(table.pageUrl),
]);

export type SeoBreadcrumb = typeof seoBreadcrumbs.$inferSelect;

// Request schemas for API validation
export const createSeoRedirectSchema = z.object({
  sourceUrl: z.string().min(1, "Source URL is required"),
  targetUrl: z.string().min(1, "Target URL is required"),
  redirectType: z.enum(["301", "302", "307"]).default("301"),
  isRegex: z.boolean().default(false),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

export const updateSeoPageSchema = z.object({
  focusKeyword: z.string().optional(),
  secondaryKeywords: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  robots: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  twitterImage: z.string().optional(),
  schemaType: z.string().optional(),
  schemaData: z.string().optional(),
  inSitemap: z.boolean().optional(),
  sitemapPriority: z.string().optional(),
  sitemapChangefreq: z.string().optional(),
});

export const createSeoKeywordSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  targetUrl: z.string().optional(),
  trackingEnabled: z.boolean().default(false),
});

export const runSeoAuditSchema = z.object({
  auditType: z.enum(["full", "quick", "custom"]).default("full"),
  pageUrls: z.array(z.string()).optional(),
});

export type CreateSeoRedirect = z.infer<typeof createSeoRedirectSchema>;
export type UpdateSeoPage = z.infer<typeof updateSeoPageSchema>;
export type CreateSeoKeyword = z.infer<typeof createSeoKeywordSchema>;
export type RunSeoAudit = z.infer<typeof runSeoAuditSchema>;
