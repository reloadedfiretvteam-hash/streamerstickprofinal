import { eq, desc, gte, and, ilike, or, lt } from "drizzle-orm";
import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Order,
  type InsertOrder,
  type RealProduct,
  type InsertRealProduct,
  type Visitor,
  type InsertVisitor,
  type PageEdit,
  type InsertPageEdit,
  type Customer,
  type InsertCustomer,
  type BlogPost,
  type InsertBlogPost,
  type UpdateBlogPost,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type AbandonedCart,
  type InsertAbandonedCart,
  users,
  orders,
  realProducts,
  visitors,
  pageEdits,
  customers,
  blogPosts,
  passwordResetTokens,
  abandonedCarts,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByUsername(username: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;
  getAllCustomers(): Promise<Customer[]>;
  searchCustomers(query: string): Promise<Customer[]>;
  incrementCustomerOrders(id: string): Promise<Customer | undefined>;
  getCustomerOrders(customerId: string): Promise<Order[]>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByCheckoutSession(sessionId: string): Promise<Order | undefined>;
  getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined>;
  updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined>;
  getOrdersByEmail(email: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getFireStickOrdersForFulfillment(): Promise<Order[]>;
  getIPTVOrders(): Promise<Order[]>;
  
  getRealProducts(): Promise<RealProduct[]>;
  getRealProduct(id: string): Promise<RealProduct | undefined>;
  getRealProductByShadowId(shadowProductId: string): Promise<RealProduct | undefined>;
  createRealProduct(product: InsertRealProduct): Promise<RealProduct>;
  updateRealProduct(id: string, updates: Partial<InsertRealProduct>): Promise<RealProduct | undefined>;
  deleteRealProduct(id: string): Promise<boolean>;
  
  trackVisitor(visitor: InsertVisitor): Promise<Visitor>;
  getVisitors(since?: Date): Promise<Visitor[]>;
  getVisitorStats(): Promise<{
    totalVisitors: number;
    todayVisitors: number;
    weekVisitors: number;
    onlineNow: number;
    recentVisitors: Visitor[];
  }>;
  
  getPageEdits(pageId: string): Promise<PageEdit[]>;
  getPageEdit(pageId: string, sectionId: string, elementId: string): Promise<PageEdit | undefined>;
  upsertPageEdit(edit: InsertPageEdit): Promise<PageEdit>;
  deletePageEdit(id: string): Promise<boolean>;
  getAllPageEdits(): Promise<PageEdit[]>;
  
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getBlogPostsPublished(): Promise<BlogPost[]>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: UpdateBlogPost): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostsByCategory(category: string): Promise<BlogPost[]>;
  getFeaturedBlogPosts(): Promise<BlogPost[]>;
  searchBlogPosts(query: string): Promise<BlogPost[]>;
  
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(id: string): Promise<void>;
  deleteExpiredPasswordResetTokens(): Promise<void>;
  
  createAbandonedCart(cart: InsertAbandonedCart): Promise<AbandonedCart>;
  getAbandonedCart(id: string): Promise<AbandonedCart | undefined>;
  getAbandonedCartByEmail(email: string): Promise<AbandonedCart | undefined>;
  getAbandonedCartsToRecover(): Promise<AbandonedCart[]>;
  markAbandonedCartRecovered(id: string, orderId: string): Promise<void>;
  markAbandonedCartEmailSent(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByUsername(username: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.username, username));
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db.update(customers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id)).returning();
    return result.length > 0;
  }

  async getAllCustomers(): Promise<Customer[]> {
    return db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const searchTerm = `%${query}%`;
    return db.select().from(customers).where(
      or(
        ilike(customers.username, searchTerm),
        ilike(customers.email, searchTerm),
        ilike(customers.fullName, searchTerm)
      )
    ).orderBy(desc(customers.createdAt));
  }

  async incrementCustomerOrders(id: string): Promise<Customer | undefined> {
    const customer = await this.getCustomer(id);
    if (!customer) return undefined;
    
    const [updated] = await db.update(customers)
      .set({ 
        totalOrders: (customer.totalOrders || 0) + 1,
        lastOrderAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return db.select().from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByCheckoutSession(sessionId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.stripeCheckoutSessionId, sessionId));
    return order;
  }

  async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.stripePaymentIntentId, paymentIntentId));
    return order;
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return order;
  }

  async getOrdersByEmail(email: string): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.customerEmail, email));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getFireStickOrdersForFulfillment(): Promise<Order[]> {
    const allOrders = await db.select().from(orders)
      .where(eq(orders.status, 'paid'))
      .orderBy(desc(orders.createdAt));
    
    return allOrders.filter(order => {
      const productName = (order.realProductName || '').toLowerCase();
      return productName.includes('fire') || productName.includes('stick') || productName.includes('firestick');
    });
  }

  async getIPTVOrders(): Promise<Order[]> {
    const allOrders = await db.select().from(orders)
      .where(eq(orders.status, 'paid'))
      .orderBy(desc(orders.createdAt));
    
    return allOrders.filter(order => {
      const productName = (order.realProductName || '').toLowerCase();
      return productName.includes('iptv') || productName.includes('subscription') || 
             productName.includes('month') || productName.includes('year');
    });
  }

  async getRealProducts(): Promise<RealProduct[]> {
    return db.select().from(realProducts);
  }

  async getRealProduct(id: string): Promise<RealProduct | undefined> {
    const [product] = await db.select().from(realProducts).where(eq(realProducts.id, id));
    return product;
  }

  async getRealProductByShadowId(shadowProductId: string): Promise<RealProduct | undefined> {
    const [product] = await db.select().from(realProducts).where(eq(realProducts.shadowProductId, shadowProductId));
    return product;
  }

  async createRealProduct(product: InsertRealProduct): Promise<RealProduct> {
    const [newProduct] = await db.insert(realProducts).values(product).returning();
    return newProduct;
  }

  async updateRealProduct(id: string, updates: Partial<InsertRealProduct>): Promise<RealProduct | undefined> {
    const [product] = await db.update(realProducts).set(updates).where(eq(realProducts.id, id)).returning();
    return product;
  }

  async deleteRealProduct(id: string): Promise<boolean> {
    const result = await db.delete(realProducts).where(eq(realProducts.id, id)).returning();
    return result.length > 0;
  }

  async trackVisitor(visitor: InsertVisitor): Promise<Visitor> {
    const [newVisitor] = await db.insert(visitors).values(visitor).returning();
    return newVisitor;
  }

  async getVisitors(since?: Date): Promise<Visitor[]> {
    if (since) {
      return db.select().from(visitors).where(gte(visitors.createdAt, since)).orderBy(desc(visitors.createdAt));
    }
    return db.select().from(visitors).orderBy(desc(visitors.createdAt)).limit(1000);
  }

  async getVisitorStats(): Promise<{
    totalVisitors: number;
    todayVisitors: number;
    weekVisitors: number;
    monthVisitors: number;
    onlineNow: number;
    recentVisitors: Visitor[];
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const allVisitors = await db.select().from(visitors).orderBy(desc(visitors.createdAt)).limit(5000);
    
    const totalVisitors = allVisitors.length;
    const todayVisitors = allVisitors.filter(v => v.createdAt && new Date(v.createdAt) >= today).length;
    const weekVisitors = allVisitors.filter(v => v.createdAt && new Date(v.createdAt) >= weekAgo).length;
    const monthVisitors = allVisitors.filter(v => v.createdAt && new Date(v.createdAt) >= monthAgo).length;
    const onlineNow = allVisitors.filter(v => v.createdAt && new Date(v.createdAt) >= fiveMinutesAgo).length;
    const recentVisitors = allVisitors.slice(0, 50);

    return {
      totalVisitors,
      todayVisitors,
      weekVisitors,
      monthVisitors,
      onlineNow,
      recentVisitors,
    };
  }

  async getPageEdits(pageId: string): Promise<PageEdit[]> {
    return db.select().from(pageEdits).where(
      and(eq(pageEdits.pageId, pageId), eq(pageEdits.isActive, true))
    );
  }

  async getPageEdit(pageId: string, sectionId: string, elementId: string): Promise<PageEdit | undefined> {
    const [edit] = await db.select().from(pageEdits).where(
      and(
        eq(pageEdits.pageId, pageId),
        eq(pageEdits.sectionId, sectionId),
        eq(pageEdits.elementId, elementId)
      )
    );
    return edit;
  }

  async upsertPageEdit(edit: InsertPageEdit): Promise<PageEdit> {
    const existing = await this.getPageEdit(edit.pageId, edit.sectionId, edit.elementId);
    
    if (existing) {
      const [updated] = await db.update(pageEdits)
        .set({ ...edit, updatedAt: new Date() })
        .where(eq(pageEdits.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newEdit] = await db.insert(pageEdits).values(edit).returning();
      return newEdit;
    }
  }

  async deletePageEdit(id: string): Promise<boolean> {
    const result = await db.delete(pageEdits).where(eq(pageEdits.id, id)).returning();
    return result.length > 0;
  }

  async getAllPageEdits(): Promise<PageEdit[]> {
    return db.select().from(pageEdits).where(eq(pageEdits.isActive, true));
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async getBlogPostsPublished(): Promise<BlogPost[]> {
    return db.select().from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: string, updates: UpdateBlogPost): Promise<BlogPost | undefined> {
    const [post] = await db.update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return post;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return result.length > 0;
  }

  async getAllBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
    return db.select().from(blogPosts)
      .where(eq(blogPosts.category, category))
      .orderBy(desc(blogPosts.createdAt));
  }

  async getFeaturedBlogPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts)
      .where(and(eq(blogPosts.featured, true), eq(blogPosts.published, true)))
      .orderBy(desc(blogPosts.publishedAt));
  }

  async searchBlogPosts(query: string): Promise<BlogPost[]> {
    const searchTerm = `%${query}%`;
    return db.select().from(blogPosts).where(
      or(
        ilike(blogPosts.title, searchTerm),
        ilike(blogPosts.excerpt, searchTerm),
        ilike(blogPosts.content, searchTerm)
      )
    ).orderBy(desc(blogPosts.createdAt));
  }

  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [resetToken] = await db.insert(passwordResetTokens).values(token).returning();
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gte(passwordResetTokens.expiresAt, new Date())
      ));
    return resetToken;
  }

  async markPasswordResetTokenUsed(id: string): Promise<void> {
    await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, id));
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await db.delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, new Date()));
  }

  async createAbandonedCart(cart: InsertAbandonedCart): Promise<AbandonedCart> {
    const [abandonedCart] = await db.insert(abandonedCarts).values(cart).returning();
    return abandonedCart;
  }

  async getAbandonedCart(id: string): Promise<AbandonedCart | undefined> {
    const [cart] = await db.select().from(abandonedCarts).where(eq(abandonedCarts.id, id));
    return cart;
  }

  async getAbandonedCartByEmail(email: string): Promise<AbandonedCart | undefined> {
    const [cart] = await db.select().from(abandonedCarts)
      .where(and(
        eq(abandonedCarts.email, email),
        eq(abandonedCarts.converted, false)
      ))
      .orderBy(desc(abandonedCarts.createdAt));
    return cart;
  }

  async getAbandonedCartsToRecover(): Promise<AbandonedCart[]> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return db.select().from(abandonedCarts)
      .where(and(
        eq(abandonedCarts.recoveryEmailSent, false),
        eq(abandonedCarts.converted, false),
        lt(abandonedCarts.createdAt, thirtyMinutesAgo)
      ))
      .orderBy(desc(abandonedCarts.createdAt));
  }

  async markAbandonedCartRecovered(id: string, orderId: string): Promise<void> {
    await db.update(abandonedCarts)
      .set({ 
        converted: true, 
        convertedOrderId: orderId,
        updatedAt: new Date()
      })
      .where(eq(abandonedCarts.id, id));
  }

  async markAbandonedCartEmailSent(id: string): Promise<void> {
    await db.update(abandonedCarts)
      .set({ 
        recoveryEmailSent: true, 
        recoveryEmailSentAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(abandonedCarts.id, id));
  }
}

export const storage = new DatabaseStorage();
