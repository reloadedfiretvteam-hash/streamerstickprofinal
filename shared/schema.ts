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
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  uniqueIndex("orders_payment_intent_idx").on(table.stripePaymentIntentId),
  uniqueIndex("orders_checkout_session_idx").on(table.stripeCheckoutSessionId),
  index("orders_customer_email_idx").on(table.customerEmail),
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
