import { eq, desc, gte, and } from "drizzle-orm";
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
  users,
  orders,
  realProducts,
  visitors,
  pageEdits,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByCheckoutSession(sessionId: string): Promise<Order | undefined>;
  getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined>;
  updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined>;
  getOrdersByEmail(email: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getFireStickOrdersForFulfillment(): Promise<Order[]>;
  
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
    onlineNow: number;
    recentVisitors: Visitor[];
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const allVisitors = await db.select().from(visitors).orderBy(desc(visitors.createdAt));
    
    const totalVisitors = allVisitors.length;
    const todayVisitors = allVisitors.filter(v => v.createdAt && new Date(v.createdAt) >= today).length;
    const weekVisitors = allVisitors.filter(v => v.createdAt && new Date(v.createdAt) >= weekAgo).length;
    const onlineNow = allVisitors.filter(v => v.createdAt && new Date(v.createdAt) >= fiveMinutesAgo).length;
    const recentVisitors = allVisitors.slice(0, 10);

    return {
      totalVisitors,
      todayVisitors,
      weekVisitors,
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
}

export const storage = new DatabaseStorage();
