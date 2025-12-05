import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  type User,
  type InsertUser,
  type Order,
  type InsertOrder,
  type RealProduct,
  type InsertRealProduct,
  users,
  orders,
  realProducts,
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
  
  getRealProducts(): Promise<RealProduct[]>;
  getRealProduct(id: string): Promise<RealProduct | undefined>;
  getRealProductByShadowId(shadowProductId: string): Promise<RealProduct | undefined>;
  createRealProduct(product: InsertRealProduct): Promise<RealProduct>;
  updateRealProduct(id: string, updates: Partial<InsertRealProduct>): Promise<RealProduct | undefined>;
  deleteRealProduct(id: string): Promise<boolean>;
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
}

export const storage = new DatabaseStorage();
