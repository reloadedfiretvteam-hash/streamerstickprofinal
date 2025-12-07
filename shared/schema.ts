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
