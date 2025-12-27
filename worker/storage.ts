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
      return data ? this.mapCustomerFromDb(data) : undefined;
    },

    async getCustomerByUsername(username: string): Promise<Customer | undefined> {
      const { data } = await supabase.from('customers').select('*').eq('username', username).single();
      return data ? this.mapCustomerFromDb(data) : undefined;
    },

    async getCustomerByEmail(email: string): Promise<Customer | undefined> {
      const { data } = await supabase.from('customers').select('*').eq('email', email).single();
      return data ? this.mapCustomerFromDb(data) : undefined;
    },

    async createCustomer(customer: InsertCustomer): Promise<Customer> {
      const dbCustomer = {
        username: customer.username,
        password: customer.password,
        email: customer.email,
        full_name: customer.fullName,
        phone: customer.phone,
        status: customer.status,
        notes: customer.notes,
      };
      const { data, error } = await supabase.from('customers').insert(dbCustomer).select().single();
      if (error) throw error;
      return this.mapCustomerFromDb(data);
    },

    async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
      const dbUpdates: any = {};
      if (updates.username !== undefined) dbUpdates.username = updates.username;
      if (updates.password !== undefined) dbUpdates.password = updates.password;
      if (updates.email !== undefined) dbUpdates.email = updates.email;
      if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      dbUpdates.updated_at = new Date().toISOString();
      
      const { data } = await supabase.from('customers')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      return data ? this.mapCustomerFromDb(data) : undefined;
    },

    async deleteCustomer(id: string): Promise<boolean> {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      return !error;
    },

    async getAllCustomers(): Promise<Customer[]> {
      const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      return (data || []).map((d: any) => this.mapCustomerFromDb(d));
    },

    async searchCustomers(query: string): Promise<Customer[]> {
      const { data } = await supabase.from('customers')
        .select('*')
        .or(`username.ilike.%${query}%,email.ilike.%${query}%,full_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });
      return (data || []).map((d: any) => this.mapCustomerFromDb(d));
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
      return data ? this.mapCustomerFromDb(data) : undefined;
    },

    async getCustomerOrders(customerId: string): Promise<Order[]> {
      const { data } = await supabase.from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      return (data || []).map((d: any) => this.mapOrderFromDb(d));
    },

    async createOrder(order: InsertOrder): Promise<Order> {
      const dbOrder: Record<string, any> = {
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
        shipping_name: order.shippingName,
        shipping_phone: order.shippingPhone,
        shipping_street: order.shippingStreet,
        shipping_city: order.shippingCity,
        shipping_state: order.shippingState,
        shipping_zip: order.shippingZip,
        shipping_country: order.shippingCountry,
        fulfillment_status: order.fulfillmentStatus,
        amazon_order_id: order.amazonOrderId,
        is_renewal: order.isRenewal,
        existing_username: order.existingUsername,
        generated_username: order.generatedUsername,
        generated_password: order.generatedPassword,
        country_preference: order.countryPreference,
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
      if (updates.shippingName !== undefined) dbUpdates.shipping_name = updates.shippingName;
      if (updates.shippingPhone !== undefined) dbUpdates.shipping_phone = updates.shippingPhone;
      if (updates.shippingStreet !== undefined) dbUpdates.shipping_street = updates.shippingStreet;
      if (updates.shippingCity !== undefined) dbUpdates.shipping_city = updates.shippingCity;
      if (updates.shippingState !== undefined) dbUpdates.shipping_state = updates.shippingState;
      if (updates.shippingZip !== undefined) dbUpdates.shipping_zip = updates.shippingZip;
      if (updates.shippingCountry !== undefined) dbUpdates.shipping_country = updates.shippingCountry;
      if (updates.fulfillmentStatus !== undefined) dbUpdates.fulfillment_status = updates.fulfillmentStatus;
      if (updates.amazonOrderId !== undefined) dbUpdates.amazon_order_id = updates.amazonOrderId;
      if (updates.isRenewal !== undefined) dbUpdates.is_renewal = updates.isRenewal;
      if (updates.existingUsername !== undefined) dbUpdates.existing_username = updates.existingUsername;
      if (updates.generatedUsername !== undefined) dbUpdates.generated_username = updates.generatedUsername;
      if (updates.generatedPassword !== undefined) dbUpdates.generated_password = updates.generatedPassword;
      if (updates.countryPreference !== undefined) dbUpdates.country_preference = updates.countryPreference;
      
      const { data } = await supabase.from('orders').update(dbUpdates).eq('id', id).select().single();
      return data ? this.mapOrderFromDb(data) : undefined;
    },

    async getOrdersByEmail(email: string): Promise<Order[]> {
      const { data } = await supabase.from('orders').select('*').eq('customer_email', email);
      return (data || []).map((d: any) => this.mapOrderFromDb(d));
    },

    async getAllOrders(): Promise<Order[]> {
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      return (data || []).map((d: any) => this.mapOrderFromDb(d));
    },

    async getFireStickOrdersForFulfillment(): Promise<Order[]> {
      const { data } = await supabase.from('orders')
        .select('*')
        .eq('status', 'paid')
        .order('created_at', { ascending: false });
      
      return (data || [])
        .map((d: any) => this.mapOrderFromDb(d))
        .filter((order: Order) => {
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
        .map((d: any) => this.mapOrderFromDb(d))
        .filter((order: Order) => {
          const productName = (order.realProductName || '').toLowerCase();
          return productName.includes('iptv') || productName.includes('subscription') || 
                 productName.includes('month') || productName.includes('year');
        });
    },

    async getRealProducts(): Promise<RealProduct[]> {
      const { data } = await supabase.from('real_products').select('*');
      return (data || []).map((d: any) => this.mapProductFromDb(d));
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
        image_url: product.imageUrl,
        shadow_product_id: product.shadowProductId,
        shadow_price_id: product.shadowPriceId,
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
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.shadowProductId !== undefined) dbUpdates.shadow_product_id = updates.shadowProductId;
      if (updates.shadowPriceId !== undefined) dbUpdates.shadow_price_id = updates.shadowPriceId;
      
      const { data } = await supabase.from('real_products').update(dbUpdates).eq('id', id).select().single();
      return data ? this.mapProductFromDb(data) : undefined;
    },

    async deleteRealProduct(id: string): Promise<boolean> {
      const { error } = await supabase.from('real_products').delete().eq('id', id);
      return !error;
    },

    async trackVisitor(visitor: InsertVisitor): Promise<Visitor> {
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.ts:307',message:'trackVisitor called',data:{sessionId:visitor.sessionId,pageUrl:visitor.pageUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'J'})}).catch(()=>{});
      }
      // #endregion
      
      const dbVisitor = {
        session_id: visitor.sessionId,
        page_url: visitor.pageUrl,
        referrer: visitor.referrer,
        user_agent: visitor.userAgent,
        ip_address: visitor.ipAddress,
        country: visitor.country,
        country_code: visitor.countryCode,
        region: visitor.region,
        region_code: visitor.regionCode,
        city: visitor.city,
        latitude: visitor.latitude,
        longitude: visitor.longitude,
        timezone: visitor.timezone,
        isp: visitor.isp,
        is_proxy: visitor.isProxy,
      };

      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.ts:327',message:'About to insert visitor to Supabase',data:{sessionId:dbVisitor.session_id,pageUrl:dbVisitor.page_url},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'K'})}).catch(()=>{});
      }
      // #endregion

      const { data, error } = await supabase.from('visitors').insert(dbVisitor).select().single();
      
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'storage.ts:331',message:'Supabase insert result',data:{success:!error,error:error?.message,hasData:!!data},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'L'})}).catch(()=>{});
      }
      // #endregion
      
      if (error) {
        console.error('Error inserting visitor:', error);
        throw error;
      }
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
      return (data || []).map((d: any) => this.mapVisitorFromDb(d));
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
      
      const visitors = (allVisitors || []).map((d: any) => this.mapVisitorFromDb(d));
      
      const totalVisitors = visitors.length;
      const todayVisitors = visitors.filter((v: Visitor) => v.createdAt && new Date(v.createdAt) >= today).length;
      const weekVisitors = visitors.filter((v: Visitor) => v.createdAt && new Date(v.createdAt) >= weekAgo).length;
      const onlineNow = visitors.filter((v: Visitor) => v.createdAt && new Date(v.createdAt) >= fiveMinutesAgo).length;
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
      return (data || []).map((d: any) => this.mapPageEditFromDb(d));
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
        page_id: edit.pageId,
        section_id: edit.sectionId,
        element_id: edit.elementId,
        content: edit.content,
        image_url: edit.imageUrl,
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
      return (data || []).map((d: any) => this.mapPageEditFromDb(d));
    },

    mapCustomerFromDb(data: any): Customer {
      return {
        id: data.id,
        username: data.username,
        password: data.password,
        email: data.email,
        fullName: data.full_name,
        phone: data.phone,
        status: data.status,
        notes: data.notes,
        totalOrders: data.total_orders,
        lastOrderAt: data.last_order_at ? new Date(data.last_order_at) : null,
        createdAt: data.created_at ? new Date(data.created_at) : null,
        updatedAt: data.updated_at ? new Date(data.updated_at) : null,
      };
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
        shippingName: data.shipping_name,
        shippingPhone: data.shipping_phone,
        shippingStreet: data.shipping_street,
        shippingCity: data.shipping_city,
        shippingState: data.shipping_state,
        shippingZip: data.shipping_zip,
        shippingCountry: data.shipping_country,
        fulfillmentStatus: data.fulfillment_status,
        amazonOrderId: data.amazon_order_id,
        isRenewal: data.is_renewal,
        existingUsername: data.existing_username,
        generatedUsername: data.generated_username,
        generatedPassword: data.generated_password,
        countryPreference: data.country_preference,
        customerMessage: null,
        customerPhone: null,
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
        imageUrl: data.image_url,
        shadowProductId: data.shadow_product_id,
        shadowPriceId: data.shadow_price_id,
      };
    },

    mapVisitorFromDb(data: any): Visitor {
      return {
        id: data.id,
        sessionId: data.session_id,
        pageUrl: data.page_url,
        referrer: data.referrer,
        userAgent: data.user_agent,
        ipAddress: data.ip_address,
        country: data.country,
        countryCode: data.country_code,
        region: data.region,
        regionCode: data.region_code,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        isp: data.isp,
        isProxy: data.is_proxy,
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
        imageUrl: data.image_url,
        elementType: data.element_type,
        isActive: data.is_active,
        createdAt: data.created_at ? new Date(data.created_at) : null,
        updatedAt: data.updated_at ? new Date(data.updated_at) : null,
      };
    },

    async getBlogPosts(): Promise<any[]> {
      const { data } = await supabase.from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      return (data || []).map((d: any) => this.mapBlogPostFromDb(d));
    },

    async getFeaturedBlogPosts(): Promise<any[]> {
      const { data } = await supabase.from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(6);
      return (data || []).map((d: any) => this.mapBlogPostFromDb(d));
    },

    async getBlogPostBySlug(slug: string): Promise<any | undefined> {
      const { data } = await supabase.from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
      return data ? this.mapBlogPostFromDb(data) : undefined;
    },

    async searchBlogPosts(query: string): Promise<any[]> {
      const { data } = await supabase.from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_at', { ascending: false });
      return (data || []).map((d: any) => this.mapBlogPostFromDb(d));
    },

    mapBlogPostFromDb(data: any): any {
      return {
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        featured: data.featured,
        published: data.is_published,
        keywords: data.keywords,
        metaDescription: data.meta_description,
        publishedAt: data.published_at,
      };
    },

    async trackAbandonedCart(cart: {
      email: string;
      customerName?: string | null;
      cartItems: any[];
      totalAmount: number;
    }): Promise<any> {
      const { data: existing } = await supabase.from('abandoned_carts')
        .select('*')
        .eq('email', cart.email)
        .eq('converted', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        const { data, error } = await supabase.from('abandoned_carts')
          .update({
            cart_items: cart.cartItems,
            total_amount: cart.totalAmount,
            customer_name: cart.customerName,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase.from('abandoned_carts')
        .insert({
          email: cart.email,
          customer_name: cart.customerName,
          cart_items: cart.cartItems,
          total_amount: cart.totalAmount,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getAbandonedCartsToRecover(): Promise<any[]> {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const { data } = await supabase.from('abandoned_carts')
        .select('*')
        .eq('recovery_email_sent', false)
        .eq('converted', false)
        .lt('created_at', thirtyMinutesAgo.toISOString())
        .order('created_at', { ascending: false });
      return data || [];
    },

    async markRecoveryEmailSent(id: string): Promise<void> {
      await supabase.from('abandoned_carts')
        .update({
          recovery_email_sent: true,
          recovery_email_sent_at: new Date().toISOString(),
        })
        .eq('id', id);
    },

    async markCartConverted(id: string, orderId: string): Promise<void> {
      await supabase.from('abandoned_carts')
        .update({
          converted: true,
          converted_order_id: orderId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    },
  };
}

export type Storage = ReturnType<typeof createStorage>;
