import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("orders_payment_intent_idx").on(table.stripePaymentIntentId),
  uniqueIndex("orders_checkout_session_idx").on(table.stripeCheckoutSessionId),
  index("orders_customer_email_idx").on(table.customerEmail),
  index("orders_fulfillment_status_idx").on(table.fulfillmentStatus),
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
});

export type CheckoutItem = z.infer<typeof checkoutItemSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

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
});

export type UpdateOrderRequest = z.infer<typeof updateOrderRequestSchema>;

export const visitors = pgTable("visitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  pageUrl: text("page_url").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("visitors_session_idx").on(table.sessionId),
  index("visitors_created_at_idx").on(table.createdAt),
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
