import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  User,
  InsertUser,
  Order,
  InsertOrder,
  RealProduct,
  InsertRealProduct,
  Visitor,
  InsertVisitor,
  PageEdit,
  InsertPageEdit,
  Customer,
  InsertCustomer,
} from "../shared/schema";

export interface StorageConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

export function createStorage(config: StorageConfig) {
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);

  return {
    async getUser(id: string): Promise<User | undefined> {
      const { data } = await supabase.from('users').select('*').eq('id', id).single();
      return data || undefined;
    },

    async getUserByUsername(username: string): Promise<User | undefined> {
      const { data } = await supabase.from('users').select('*').eq('username', username).single();
      return data || undefined;
    },

    async createUser(insertUser: InsertUser): Promise<User> {
      const { data, error } = await supabase.from('users').insert(insertUser).select().single();
      if (error) throw error;
      return data;
    },

    async getCustomer(id: string): Promise<Customer | undefined> {
      const { data } = await supabase.from('customers').select('*').eq('id', id).single();
      return data || undefined;
    },

    async getCustomerByUsername(username: string): Promise<Customer | undefined> {
      const { data } = await supabase.from('customers').select('*').eq('username', username).single();
      return data || undefined;
    },

    async getCustomerByEmail(email: string): Promise<Customer | undefined> {
      const { data } = await supabase.from('customers').select('*').eq('email', email).single();
      return data || undefined;
    },

    async createCustomer(customer: InsertCustomer): Promise<Customer> {
      const { data, error } = await supabase.from('customers').insert(customer).select().single();
      if (error) throw error;
      return data;
    },

    async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
      const { data } = await supabase.from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      return data || undefined;
    },

    async deleteCustomer(id: string): Promise<boolean> {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      return !error;
    },

    async getAllCustomers(): Promise<Customer[]> {
      const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      return data || [];
    },

    async searchCustomers(query: string): Promise<Customer[]> {
      const { data } = await supabase.from('customers')
        .select('*')
        .or(`username.ilike.%${query}%,email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      return data || [];
    },

    async incrementCustomerOrders(id: string): Promise<Customer | undefined> {
      const customer = await this.getCustomer(id);
      if (!customer) return undefined;
      
      const { data } = await supabase.from('customers')
        .update({ 
          total_orders: (customer.totalOrders || 0) + 1,
          last_order_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      return data || undefined;
    },

    async getCustomerOrders(customerId: string): Promise<Order[]> {
      const { data } = await supabase.from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      return data || [];
    },

    async createOrder(order: InsertOrder): Promise<Order> {
      const dbOrder = {
        id: order.id,
        customer_email: order.customerEmail,
        customer_name: order.customerName,
        customer_id: order.customerId,
        stripe_checkout_session_id: order.stripeCheckoutSessionId,
        stripe_payment_intent_id: order.stripePaymentIntentId,
        stripe_customer_id: order.stripeCustomerId,
        shadow_product_id: order.shadowProductId,
        shadow_price_id: order.shadowPriceId,
        real_product_id: order.realProductId,
        real_product_name: order.realProductName,
        amount: order.amount,
        status: order.status,
        credentials_sent: order.credentialsSent,
      };
      const { data, error } = await supabase.from('orders').insert(dbOrder).select().single();
      if (error) throw error;
      return this.mapOrderFromDb(data);
    },

    async getOrder(id: string): Promise<Order | undefined> {
      const { data } = await supabase.from('orders').select('*').eq('id', id).single();
      return data ? this.mapOrderFromDb(data) : undefined;
    },

    async getOrderByCheckoutSession(sessionId: string): Promise<Order | undefined> {
      const { data } = await supabase.from('orders').select('*').eq('stripe_checkout_session_id', sessionId).single();
      return data ? this.mapOrderFromDb(data) : undefined;
    },

    async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | undefined> {
      const { data } = await supabase.from('orders').select('*').eq('stripe_payment_intent_id', paymentIntentId).single();
      return data ? this.mapOrderFromDb(data) : undefined;
    },

    async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
      const dbUpdates: any = {};
      if (updates.customerEmail !== undefined) dbUpdates.customer_email = updates.customerEmail;
      if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
      if (updates.customerId !== undefined) dbUpdates.customer_id = updates.customerId;
      if (updates.stripeCheckoutSessionId !== undefined) dbUpdates.stripe_checkout_session_id = updates.stripeCheckoutSessionId;
      if (updates.stripePaymentIntentId !== undefined) dbUpdates.stripe_payment_intent_id = updates.stripePaymentIntentId;
      if (updates.stripeCustomerId !== undefined) dbUpdates.stripe_customer_id = updates.stripeCustomerId;
      if (updates.shadowProductId !== undefined) dbUpdates.shadow_product_id = updates.shadowProductId;
      if (updates.shadowPriceId !== undefined) dbUpdates.shadow_price_id = updates.shadowPriceId;
      if (updates.realProductId !== undefined) dbUpdates.real_product_id = updates.realProductId;
      if (updates.realProductName !== undefined) dbUpdates.real_product_name = updates.realProductName;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.credentialsSent !== undefined) dbUpdates.credentials_sent = updates.credentialsSent;
      
      const { data } = await supabase.from('orders').update(dbUpdates).eq('id', id).select().single();
      return data ? this.mapOrderFromDb(data) : undefined;
    },

    async getOrdersByEmail(email: string): Promise<Order[]> {
      const { data } = await supabase.from('orders').select('*').eq('customer_email', email);
      return (data || []).map(this.mapOrderFromDb);
    },

    async getAllOrders(): Promise<Order[]> {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      return (data || []).map(this.mapOrderFromDb);
    },

    async getFireStickOrdersForFulfillment(): Promise<Order[]> {
      const { data } = await supabase.from('orders')
        .select('*')
        .eq('status', 'paid')
        .order('created_at', { ascending: false });
      
      return (data || [])
        .map(this.mapOrderFromDb)
        .filter(order => {
          const productName = (order.realProductName || '').toLowerCase();
          return productName.includes('fire') || productName.includes('stick') || productName.includes('firestick');
        });
    },

    async getIPTVOrders(): Promise<Order[]> {
      const { data } = await supabase.from('orders')
        .select('*')
        .eq('status', 'paid')
        .order('created_at', { ascending: false });
      
      return (data || [])
        .map(this.mapOrderFromDb)
        .filter(order => {
          const productName = (order.realProductName || '').toLowerCase();
          return productName.includes('iptv') || productName.includes('subscription') || 
                 productName.includes('month') || productName.includes('year');
        });
    },

    async getRealProducts(): Promise<RealProduct[]> {
      const { data } = await supabase.from('real_products').select('*');
      return (data || []).map(this.mapProductFromDb);
    },

    async getRealProduct(id: string): Promise<RealProduct | undefined> {
      const { data } = await supabase.from('real_products').select('*').eq('id', id).single();
      return data ? this.mapProductFromDb(data) : undefined;
    },

    async getRealProductByShadowId(shadowProductId: string): Promise<RealProduct | undefined> {
      const { data } = await supabase.from('real_products').select('*').eq('shadow_product_id', shadowProductId).single();
      return data ? this.mapProductFromDb(data) : undefined;
    },

    async createRealProduct(product: InsertRealProduct): Promise<RealProduct> {
      const dbProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        features: product.features,
        image_url: product.imageUrl,
        shadow_product_id: product.shadowProductId,
        shadow_price_id: product.shadowPriceId,
        is_active: product.isActive ?? true,
      };
      const { data, error } = await supabase.from('real_products').insert(dbProduct).select().single();
      if (error) throw error;
      return this.mapProductFromDb(data);
    },

    async updateRealProduct(id: string, updates: Partial<InsertRealProduct>): Promise<RealProduct | undefined> {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.features !== undefined) dbUpdates.features = updates.features;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.shadowProductId !== undefined) dbUpdates.shadow_product_id = updates.shadowProductId;
      if (updates.shadowPriceId !== undefined) dbUpdates.shadow_price_id = updates.shadowPriceId;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      
      const { data } = await supabase.from('real_products').update(dbUpdates).eq('id', id).select().single();
      return data ? this.mapProductFromDb(data) : undefined;
    },

    async deleteRealProduct(id: string): Promise<boolean> {
      const { error } = await supabase.from('real_products').delete().eq('id', id);
      return !error;
    },

    async trackVisitor(visitor: InsertVisitor): Promise<Visitor> {
      const dbVisitor = {
        id: visitor.id,
        ip_address: visitor.ipAddress,
        user_agent: visitor.userAgent,
        page: visitor.page,
        referrer: visitor.referrer,
        country: visitor.country,
        city: visitor.city,
      };
      const { data, error } = await supabase.from('visitors').insert(dbVisitor).select().single();
      if (error) throw error;
      return this.mapVisitorFromDb(data);
    },

    async getVisitors(since?: Date): Promise<Visitor[]> {
      let query = supabase.from('visitors').select('*').order('created_at', { ascending: false });
      if (since) {
        query = query.gte('created_at', since.toISOString());
      } else {
        query = query.limit(1000);
      }
      const { data } = await query;
      return (data || []).map(this.mapVisitorFromDb);
    },

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

      const { data: allVisitors } = await supabase.from('visitors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);
      
      const visitors = (allVisitors || []).map(this.mapVisitorFromDb);
      
      const totalVisitors = visitors.length;
      const todayVisitors = visitors.filter(v => v.createdAt && new Date(v.createdAt) >= today).length;
      const weekVisitors = visitors.filter(v => v.createdAt && new Date(v.createdAt) >= weekAgo).length;
      const onlineNow = visitors.filter(v => v.createdAt && new Date(v.createdAt) >= fiveMinutesAgo).length;
      const recentVisitors = visitors.slice(0, 50);

      return {
        totalVisitors,
        todayVisitors,
        weekVisitors,
        onlineNow,
        recentVisitors,
      };
    },

    async getPageEdits(pageId: string): Promise<PageEdit[]> {
      const { data } = await supabase.from('page_edits')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_active', true);
      return (data || []).map(this.mapPageEditFromDb);
    },

    async getPageEdit(pageId: string, sectionId: string, elementId: string): Promise<PageEdit | undefined> {
      const { data } = await supabase.from('page_edits')
        .select('*')
        .eq('page_id', pageId)
        .eq('section_id', sectionId)
        .eq('element_id', elementId)
        .single();
      return data ? this.mapPageEditFromDb(data) : undefined;
    },

    async upsertPageEdit(edit: InsertPageEdit): Promise<PageEdit> {
      const existing = await this.getPageEdit(edit.pageId, edit.sectionId, edit.elementId);
      
      const dbEdit = {
        id: edit.id || existing?.id,
        page_id: edit.pageId,
        section_id: edit.sectionId,
        element_id: edit.elementId,
        content: edit.content,
        element_type: edit.elementType,
        is_active: edit.isActive ?? true,
        updated_at: new Date().toISOString(),
      };
      
      if (existing) {
        const { data, error } = await supabase.from('page_edits')
          .update(dbEdit)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return this.mapPageEditFromDb(data);
      } else {
        const { data, error } = await supabase.from('page_edits').insert(dbEdit).select().single();
        if (error) throw error;
        return this.mapPageEditFromDb(data);
      }
    },

    async deletePageEdit(id: string): Promise<boolean> {
      const { error } = await supabase.from('page_edits').delete().eq('id', id);
      return !error;
    },

    async getAllPageEdits(): Promise<PageEdit[]> {
      const { data } = await supabase.from('page_edits').select('*').eq('is_active', true);
      return (data || []).map(this.mapPageEditFromDb);
    },

    mapOrderFromDb(data: any): Order {
      return {
        id: data.id,
        customerEmail: data.customer_email,
        customerName: data.customer_name,
        customerId: data.customer_id,
        stripeCheckoutSessionId: data.stripe_checkout_session_id,
        stripePaymentIntentId: data.stripe_payment_intent_id,
        stripeCustomerId: data.stripe_customer_id,
        shadowProductId: data.shadow_product_id,
        shadowPriceId: data.shadow_price_id,
        realProductId: data.real_product_id,
        realProductName: data.real_product_name,
        amount: data.amount,
        status: data.status,
        credentialsSent: data.credentials_sent,
        createdAt: data.created_at ? new Date(data.created_at) : null,
      };
    },

    mapProductFromDb(data: any): RealProduct {
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        features: data.features,
        imageUrl: data.image_url,
        shadowProductId: data.shadow_product_id,
        shadowPriceId: data.shadow_price_id,
        isActive: data.is_active,
        createdAt: data.created_at ? new Date(data.created_at) : null,
      };
    },

    mapVisitorFromDb(data: any): Visitor {
      return {
        id: data.id,
        ipAddress: data.ip_address,
        userAgent: data.user_agent,
        page: data.page,
        referrer: data.referrer,
        country: data.country,
        city: data.city,
        createdAt: data.created_at ? new Date(data.created_at) : null,
      };
    },

    mapPageEditFromDb(data: any): PageEdit {
      return {
        id: data.id,
        pageId: data.page_id,
        sectionId: data.section_id,
        elementId: data.element_id,
        content: data.content,
        elementType: data.element_type,
        isActive: data.is_active,
        createdAt: data.created_at ? new Date(data.created_at) : null,
        updatedAt: data.updated_at ? new Date(data.updated_at) : null,
      };
    },
  };
}

export type Storage = ReturnType<typeof createStorage>;
