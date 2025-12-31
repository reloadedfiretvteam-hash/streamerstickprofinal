import { Hono } from 'hono';
import Stripe from 'stripe';
import { getStorage } from '../helpers';
import { sendCredentialsEmail } from '../email';
import { createCustomerSchema, updateCustomerSchema } from '../../shared/schema';
import type { Env } from '../index';

export function createAdminRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/orders', async (c) => {
    try {
      const storage = getStorage(c.env);
      const orders = await storage.getAllOrders();
      return c.json({ data: orders });
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      return c.json({ error: "Failed to fetch orders" }, 500);
    }
  });

  app.get('/orders/stats', async (c) => {
    try {
      const storage = getStorage(c.env);
      const allOrders = await storage.getAllOrders();
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      
      const paidOrders = allOrders.filter(o => o.status === 'paid');
      const pendingOrders = allOrders.filter(o => o.status === 'pending');
      
      const ordersToday = allOrders.filter(o => o.createdAt && new Date(o.createdAt) >= today);
      const ordersThisWeek = allOrders.filter(o => o.createdAt && new Date(o.createdAt) >= weekAgo);
      const ordersThisMonth = allOrders.filter(o => o.createdAt && new Date(o.createdAt) >= monthAgo);
      
      const revenueToday = ordersToday
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + (o.amount || 0), 0);
      const revenueThisWeek = ordersThisWeek
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + (o.amount || 0), 0);
      const revenueThisMonth = ordersThisMonth
        .filter(o => o.status === 'paid')
        .reduce((sum, o) => sum + (o.amount || 0), 0);
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      
      const firestickOrders = allOrders.filter(o => 
        o.realProductId?.includes('firestick') || o.realProductName?.toLowerCase().includes('fire stick')
      );
      const pendingFulfillments = firestickOrders.filter(o => 
        o.status === 'paid' && (!o.fulfillmentStatus || o.fulfillmentStatus === 'pending')
      );
      
      const recentOrders = allOrders
        .filter(o => o.createdAt)
        .sort((a, b) => {
          const dateA = new Date(a.createdAt!).getTime();
          const dateB = new Date(b.createdAt!).getTime();
          return dateB - dateA;
        })
        .slice(0, 10)
        .map(o => ({
          id: o.id,
          customerEmail: o.customerEmail,
          customerName: o.customerName,
          productName: o.realProductName,
          amount: o.amount,
          status: o.status,
          fulfillmentStatus: o.fulfillmentStatus,
          createdAt: o.createdAt,
        }));
      
      return c.json({
        data: {
          totalOrders: allOrders.length,
          ordersToday: ordersToday.length,
          ordersThisWeek: ordersThisWeek.length,
          ordersThisMonth: ordersThisMonth.length,
          totalRevenue,
          revenueToday,
          revenueThisWeek,
          revenueThisMonth,
          pendingFulfillments: pendingFulfillments.length,
          recentOrders,
        }
      });
    } catch (error: any) {
      console.error("Error fetching order stats:", error);
      return c.json({ error: "Failed to fetch order statistics" }, 500);
    }
  });

  app.put('/orders/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { status, credentialsSent } = body;

      const existingOrder = await storage.getOrder(c.req.param('id'));
      if (!existingOrder) {
        return c.json({ error: "Order not found" }, 404);
      }

      const order = await storage.updateOrder(c.req.param('id'), {
        status,
        credentialsSent,
      });

      return c.json({ data: order });
    } catch (error: any) {
      console.error("Error updating order:", error);
      return c.json({ error: "Failed to update order" }, 500);
    }
  });

  app.post('/orders/:id/resend-credentials', async (c) => {
    try {
      const storage = getStorage(c.env);
      const order = await storage.getOrder(c.req.param('id'));
      if (!order) {
        return c.json({ error: "Order not found" }, 404);
      }

      await sendCredentialsEmail(order, c.env, storage);

      return c.json({ success: true, message: "Credentials email sent" });
    } catch (error: any) {
      console.error("Error resending credentials:", error);
      return c.json({ error: "Failed to resend credentials" }, 500);
    }
  });

  app.get('/fulfillment', async (c) => {
    try {
      const storage = getStorage(c.env);
      const orders = await storage.getFireStickOrdersForFulfillment();
      return c.json({ data: orders });
    } catch (error: any) {
      console.error("Error fetching fulfillment orders:", error);
      return c.json({ error: "Failed to fetch fulfillment orders" }, 500);
    }
  });

  app.put('/fulfillment/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { fulfillmentStatus, amazonOrderId } = body;

      const existingOrder = await storage.getOrder(c.req.param('id'));
      if (!existingOrder) {
        return c.json({ error: "Order not found" }, 404);
      }

      const updates: any = {};
      if (fulfillmentStatus !== undefined) {
        updates.fulfillmentStatus = fulfillmentStatus;
      }
      if (amazonOrderId !== undefined) {
        updates.amazonOrderId = amazonOrderId;
      }

      const order = await storage.updateOrder(c.req.param('id'), updates);
      return c.json({ data: order });
    } catch (error: any) {
      console.error("Error updating fulfillment:", error);
      return c.json({ error: "Failed to update fulfillment" }, 500);
    }
  });

  app.get('/products', async (c) => {
    try {
      const storage = getStorage(c.env);
      const products = await storage.getRealProducts();
      return c.json({ data: products });
    } catch (error: any) {
      console.error("Error fetching products:", error);
      return c.json({ error: "Failed to fetch products" }, 500);
    }
  });

  app.post('/products', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { id, name, description, price, imageUrl, category, shadowProductId, shadowPriceId } = body;

      if (!id || !name || !price) {
        return c.json({ error: "ID, name, and price are required" }, 400);
      }

      const product = await storage.createRealProduct({
        id,
        name,
        description: description || null,
        price,
        imageUrl: imageUrl || null,
        category: category || null,
        shadowProductId: shadowProductId || null,
        shadowPriceId: shadowPriceId || null,
      });

      return c.json({ data: product });
    } catch (error: any) {
      console.error("Error creating product:", error);
      return c.json({ error: "Failed to create product" }, 500);
    }
  });

  app.put('/products/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { name, description, price, imageUrl, category, shadowProductId, shadowPriceId } = body;

      const existingProduct = await storage.getRealProduct(c.req.param('id'));
      if (!existingProduct) {
        return c.json({ error: "Product not found" }, 404);
      }

      const product = await storage.updateRealProduct(c.req.param('id'), {
        name,
        description,
        price,
        imageUrl,
        category,
        shadowProductId,
        shadowPriceId,
      });

      return c.json({ data: product });
    } catch (error: any) {
      console.error("Error updating product:", error);
      return c.json({ error: "Failed to update product" }, 500);
    }
  });

  app.delete('/products/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const existingProduct = await storage.getRealProduct(c.req.param('id'));
      if (!existingProduct) {
        return c.json({ error: "Product not found" }, 404);
      }

      const deleted = await storage.deleteRealProduct(c.req.param('id'));
      
      if (deleted) {
        return c.json({ success: true });
      } else {
        return c.json({ error: "Failed to delete product" }, 500);
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      return c.json({ error: "Failed to delete product" }, 500);
    }
  });

  app.post('/products/:id/sync-stripe-price', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { price, shadowName } = body;

      if (!price || price <= 0) {
        return c.json({ error: "Valid price is required" }, 400);
      }

      const existingProduct = await storage.getRealProduct(c.req.param('id'));
      if (!existingProduct) {
        return c.json({ error: "Product not found" }, 404);
      }

      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);

      let shadowProductId = existingProduct.shadowProductId;
      
      if (!shadowProductId) {
        const productName = shadowName || `Service ${existingProduct.id}`;
        const stripeProduct = await stripe.products.create({
          name: productName,
          description: `Shadow product for ${existingProduct.name}`,
          metadata: {
            realProductId: existingProduct.id,
          },
        });
        shadowProductId = stripeProduct.id;
      }

      const priceInCents = Math.round(price);

      const stripePrice = await stripe.prices.create({
        product: shadowProductId,
        unit_amount: priceInCents,
        currency: 'usd',
        metadata: {
          realProductId: existingProduct.id,
        },
      });

      const updatedProduct = await storage.updateRealProduct(c.req.param('id'), {
        price: priceInCents,
        shadowProductId,
        shadowPriceId: stripePrice.id,
      });

      return c.json({ 
        data: updatedProduct,
        stripeProductId: shadowProductId,
        stripePriceId: stripePrice.id,
      });
    } catch (error: any) {
      console.error("Error syncing Stripe price:", error);
      return c.json({ error: `Failed to sync Stripe price: ${error.message}` }, 500);
    }
  });

  app.post('/products/create-with-stripe', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { id, name, description, price, imageUrl, category, shadowName } = body;

      if (!id || !name || !price) {
        return c.json({ error: "ID, name, and price are required" }, 400);
      }

      const stripe = new Stripe(c.env.STRIPE_SECRET_KEY);

      const productName = shadowName || `Service ${id}`;
      const stripeProduct = await stripe.products.create({
        name: productName,
        description: `Shadow product`,
        metadata: {
          realProductId: id,
        },
      });

      const priceInCents = Math.round(price);

      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: priceInCents,
        currency: 'usd',
        metadata: {
          realProductId: id,
        },
      });

      const product = await storage.createRealProduct({
        id,
        name,
        description: description || null,
        price: priceInCents,
        imageUrl: imageUrl || null,
        category: category || null,
        shadowProductId: stripeProduct.id,
        shadowPriceId: stripePrice.id,
      });

      return c.json({ 
        data: product,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      });
    } catch (error: any) {
      console.error("Error creating product with Stripe:", error);
      return c.json({ error: `Failed to create product: ${error.message}` }, 500);
    }
  });

  app.get('/visitors/stats', async (c) => {
    try {
      const storage = getStorage(c.env);
      const stats = await storage.getVisitorStats();
      
      // Enhance with additional analytics
      // Use service key explicitly to bypass RLS
      const serviceKey = c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY;
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, serviceKey);
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      // Get detailed visitor data - service key should bypass RLS
      const { data: allVisitors, error: visitorsError } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);
      
      if (visitorsError) {
        console.error('[ADMIN_VISITOR_STATS] Error fetching visitors:', visitorsError);
        // Return basic stats even if detailed query fails
        return c.json({
          data: {
            ...stats,
            countryBreakdown: [],
            regionBreakdown: [],
            cityBreakdown: [],
            pageBreakdown: [],
            deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0, bot: 0 },
            hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
            liveVisitors: [],
            monthVisitors: 0,
            error: visitorsError.message,
            errorCode: visitorsError.code,
          }
        });
      }
      
      const visitors = allVisitors || [];
      
      // Country breakdown
      const countryCounts: Record<string, number> = {};
      const regionCounts: Record<string, number> = {};
      const cityCounts: Record<string, number> = {};
      const pageCounts: Record<string, number> = {};
      
      visitors.forEach((v: any) => {
        if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
        if (v.region) regionCounts[v.region] = (regionCounts[v.region] || 0) + 1;
        if (v.city) cityCounts[v.city] = (cityCounts[v.city] || 0) + 1;
        if (v.page_url) {
          const page = new URL(v.page_url, 'https://streamstickpro.com').pathname;
          pageCounts[page] = (pageCounts[page] || 0) + 1;
        }
      });
      
      // Device type detection - improved logic
      const deviceBreakdown = { desktop: 0, mobile: 0, tablet: 0, bot: 0 };
      visitors.forEach((v: any) => {
        const ua = (v.user_agent || '').toLowerCase();
        
        // Check for bots first
        if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider') || 
            ua.includes('googlebot') || ua.includes('bingbot') || ua.includes('slurp')) {
          deviceBreakdown.bot++;
        } 
        // Check for tablets (iPad, Android tablets, etc.)
        else if (ua.includes('ipad') || 
                 (ua.includes('android') && !ua.includes('mobile')) ||
                 ua.includes('tablet') ||
                 ua.includes('playbook') ||
                 ua.includes('kindle')) {
          deviceBreakdown.tablet++;
        } 
        // Check for mobile devices (iPhone, Android phones, etc.)
        else if (ua.includes('mobile') || 
                 ua.includes('iphone') || 
                 ua.includes('ipod') ||
                 (ua.includes('android') && ua.includes('mobile')) ||
                 ua.includes('blackberry') ||
                 ua.includes('windows phone') ||
                 ua.includes('opera mini') ||
                 ua.includes('iemobile')) {
          deviceBreakdown.mobile++;
        } 
        // Default to desktop
        else {
          deviceBreakdown.desktop++;
        }
      });
      
      // Hourly distribution (last 24 hours)
      const hourlyDistribution: Record<number, number> = {};
      for (let i = 0; i < 24; i++) hourlyDistribution[i] = 0;
      
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      visitors
        .filter((v: any) => v.created_at && new Date(v.created_at) >= last24Hours)
        .forEach((v: any) => {
          const hour = new Date(v.created_at).getHours();
          hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
        });
      
      // Live visitors (active in last 5 minutes)
      const liveVisitors = visitors
        .filter((v: any) => v.created_at && new Date(v.created_at) >= fiveMinutesAgo)
        .slice(0, 20)
        .map((v: any) => ({
          id: v.id,
          pageUrl: v.page_url,
          country: v.country,
          city: v.city,
          region: v.region,
          userAgent: v.user_agent,
          createdAt: v.created_at,
          referrer: v.referrer,
        }));
      
      return c.json({
        data: {
          ...stats,
          countryBreakdown: Object.entries(countryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([name, count]) => ({ name, count })),
          regionBreakdown: Object.entries(regionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([name, count]) => ({ name, count })),
          cityBreakdown: Object.entries(cityCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([name, count]) => ({ name, count })),
          pageBreakdown: Object.entries(pageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([name, count]) => ({ name, count })),
          deviceBreakdown,
          hourlyDistribution: Object.entries(hourlyDistribution).map(([hour, count]) => ({
            hour: parseInt(hour),
            count,
          })),
          liveVisitors,
          monthVisitors: stats.monthVisitors || visitors.filter((v: any) => 
            v.created_at && new Date(v.created_at) >= monthAgo
          ).length,
          // Ensure topCountries matches original format from server/geoLocationService.ts
          // Original returns {name, count}, keep that format for compatibility
        }
      });
    } catch (error: any) {
      console.error("Error fetching visitor stats:", error);
      return c.json({ error: "Failed to fetch visitor stats" }, 500);
    }
  });

  // Enhanced customer orders endpoint (including free trials)
  app.get('/customers/orders-comprehensive', async (c) => {
    try {
      const storage = getStorage(c.env);
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY);
      
      // Get all paid orders
      const allOrders = await storage.getAllOrders();
      
      // Get free trials from orders table (where payment_method = 'free-trial' or amount = 0)
      const { data: trialOrders, error: trialError } = await supabase
        .from('orders')
        .select('*')
        .or('payment_method.eq.free-trial,amount.eq.0')
        .order('created_at', { ascending: false });
      
      // Combine and format
      const paidOrdersFormatted = allOrders.map(order => ({
        id: order.id,
        type: 'paid',
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        productName: order.realProductName,
        amount: order.amount / 100,
        status: order.status,
        createdAt: order.createdAt,
        credentialsSent: order.credentialsSent,
        generatedUsername: order.generatedUsername,
        isRenewal: order.isRenewal,
      }));
      
      const trialOrdersFormatted = (trialOrders || []).map((order: any) => ({
        id: order.id,
        type: 'free-trial',
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        productName: 'Free Trial - 36 Hours',
        amount: 0,
        status: order.payment_status === 'completed' ? 'completed' : 'pending',
        createdAt: order.created_at,
        credentialsSent: !!order.iptv_credentials,
        generatedUsername: order.iptv_credentials?.username || null,
        expiresAt: order.iptv_credentials?.expires_at || null,
        isRenewal: false,
      }));
      
      // Combine and sort by date
      const allCustomerOrders = [...paidOrdersFormatted, ...trialOrdersFormatted]
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
      
      // Statistics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      
      const ordersToday = allCustomerOrders.filter(o => 
        o.createdAt && new Date(o.createdAt) >= today
      );
      const ordersThisWeek = allCustomerOrders.filter(o => 
        o.createdAt && new Date(o.createdAt) >= weekAgo
      );
      const ordersThisMonth = allCustomerOrders.filter(o => 
        o.createdAt && new Date(o.createdAt) >= monthAgo
      );
      
      const revenueThisMonth = allCustomerOrders
        .filter(o => o.type === 'paid' && o.status === 'paid' && o.createdAt && new Date(o.createdAt) >= monthAgo)
        .reduce((sum, o) => sum + o.amount, 0);
      
      const totalRevenue = allCustomerOrders
        .filter(o => o.type === 'paid' && o.status === 'paid')
        .reduce((sum, o) => sum + o.amount, 0);
      
      const paidCount = allCustomerOrders.filter(o => o.type === 'paid').length;
      const trialCount = allCustomerOrders.filter(o => o.type === 'free-trial').length;
      const conversionRate = trialCount > 0 
        ? ((paidCount / (paidCount + trialCount)) * 100).toFixed(1)
        : '0.0';
      
      return c.json({
        data: {
          orders: allCustomerOrders,
          statistics: {
            totalOrders: allCustomerOrders.length,
            paidOrders: paidCount,
            freeTrials: trialCount,
            ordersToday: ordersToday.length,
            ordersThisWeek: ordersThisWeek.length,
            ordersThisMonth: ordersThisMonth.length,
            revenueThisMonth: revenueThisMonth,
            totalRevenue: totalRevenue,
            conversionRate: parseFloat(conversionRate),
            pendingCredentials: allCustomerOrders.filter(o => 
              o.status === 'paid' || o.status === 'completed' && !o.credentialsSent
            ).length,
          },
        }
      });
    } catch (error: any) {
      console.error("Error fetching comprehensive customer orders:", error);
      return c.json({ error: "Failed to fetch customer orders" }, 500);
    }
  });

  app.get('/page-edits', async (c) => {
    try {
      const storage = getStorage(c.env);
      const edits = await storage.getAllPageEdits();
      return c.json({ data: edits });
    } catch (error: any) {
      console.error("Error fetching all page edits:", error);
      return c.json({ error: "Failed to fetch page edits" }, 500);
    }
  });

  app.post('/page-edits', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const { pageId, sectionId, elementId, elementType, content, imageUrl, isActive } = body;

      if (!pageId || !sectionId || !elementId || !elementType) {
        return c.json({ error: "Page ID, section ID, element ID, and element type are required" }, 400);
      }

      const edit = await storage.upsertPageEdit({
        pageId,
        sectionId,
        elementId,
        elementType,
        content: content || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
      });

      return c.json({ data: edit });
    } catch (error: any) {
      console.error("Error saving page edit:", error);
      return c.json({ error: "Failed to save page edit" }, 500);
    }
  });

  app.delete('/page-edits/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const deleted = await storage.deletePageEdit(c.req.param('id'));
      
      if (deleted) {
        return c.json({ success: true });
      } else {
        return c.json({ error: "Page edit not found" }, 404);
      }
    } catch (error: any) {
      console.error("Error deleting page edit:", error);
      return c.json({ error: "Failed to delete page edit" }, 500);
    }
  });

  app.get('/customers', async (c) => {
    try {
      const storage = getStorage(c.env);
      const search = c.req.query('search');
      let customersList;
      
      if (search && search.trim()) {
        customersList = await storage.searchCustomers(search.trim());
      } else {
        customersList = await storage.getAllCustomers();
      }
      
      return c.json({ data: customersList });
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      return c.json({ error: "Failed to fetch customers" }, 500);
    }
  });

  app.get('/customers/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const customer = await storage.getCustomer(c.req.param('id'));
      if (!customer) {
        return c.json({ error: "Customer not found" }, 404);
      }
      return c.json({ data: customer });
    } catch (error: any) {
      console.error("Error fetching customer:", error);
      return c.json({ error: "Failed to fetch customer" }, 500);
    }
  });

  app.get('/customers/:id/orders', async (c) => {
    try {
      const storage = getStorage(c.env);
      const customer = await storage.getCustomer(c.req.param('id'));
      if (!customer) {
        return c.json({ error: "Customer not found" }, 404);
      }
      
      const customerOrders = await storage.getCustomerOrders(c.req.param('id'));
      return c.json({ data: customerOrders });
    } catch (error: any) {
      console.error("Error fetching customer orders:", error);
      return c.json({ error: "Failed to fetch customer orders" }, 500);
    }
  });

  app.post('/customers', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const parseResult = createCustomerSchema.safeParse(body);
      if (!parseResult.success) {
        return c.json({ error: parseResult.error.message }, 400);
      }

      const existingByUsername = await storage.getCustomerByUsername(parseResult.data.username);
      if (existingByUsername) {
        return c.json({ error: "A customer with this username already exists" }, 409);
      }

      const customer = await storage.createCustomer(parseResult.data);
      return c.json({ data: customer });
    } catch (error: any) {
      console.error("Error creating customer:", error);
      return c.json({ error: "Failed to create customer" }, 500);
    }
  });

  app.put('/customers/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const body = await c.req.json();
      const parseResult = updateCustomerSchema.safeParse(body);
      if (!parseResult.success) {
        return c.json({ error: parseResult.error.message }, 400);
      }

      const existingCustomer = await storage.getCustomer(c.req.param('id'));
      if (!existingCustomer) {
        return c.json({ error: "Customer not found" }, 404);
      }

      if (parseResult.data.username && parseResult.data.username !== existingCustomer.username) {
        const conflictingCustomer = await storage.getCustomerByUsername(parseResult.data.username);
        if (conflictingCustomer) {
          return c.json({ error: "A customer with this username already exists" }, 409);
        }
      }

      const customer = await storage.updateCustomer(c.req.param('id'), parseResult.data);
      return c.json({ data: customer });
    } catch (error: any) {
      console.error("Error updating customer:", error);
      return c.json({ error: "Failed to update customer" }, 500);
    }
  });

  app.delete('/customers/:id', async (c) => {
    try {
      const storage = getStorage(c.env);
      const existingCustomer = await storage.getCustomer(c.req.param('id'));
      if (!existingCustomer) {
        return c.json({ error: "Customer not found" }, 404);
      }

      const deleted = await storage.deleteCustomer(c.req.param('id'));
      
      if (deleted) {
        return c.json({ success: true });
      } else {
        return c.json({ error: "Failed to delete customer" }, 500);
      }
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      return c.json({ error: "Failed to delete customer" }, 500);
    }
  });

  app.get('/iptv-customers', async (c) => {
    try {
      const storage = getStorage(c.env);
      const iptvOrders = await storage.getIPTVOrders();
      return c.json({ data: iptvOrders });
    } catch (error: any) {
      console.error("Error fetching IPTV orders:", error);
      return c.json({ error: "Failed to fetch IPTV orders" }, 500);
    }
  });

  // Payment status dashboard - shows all payment health info
  app.get('/payment-status', async (c) => {
    try {
      const storage = getStorage(c.env);
      const allOrders = await storage.getAllOrders();
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const paidOrders = allOrders.filter(o => o.status === 'paid');
      const pendingOrders = allOrders.filter(o => o.status === 'pending');
      const failedOrders = allOrders.filter(o => o.status === 'failed');
      
      // Orders paid but credentials not sent
      const missingCredentials = paidOrders.filter(o => !o.credentialsSent);
      
      // Orders in last 7 days
      const recentOrders = allOrders.filter(o => 
        o.createdAt && new Date(o.createdAt) >= weekAgo
      );
      const recentPaid = paidOrders.filter(o => 
        o.createdAt && new Date(o.createdAt) >= weekAgo
      );
      
      // Revenue calculation
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      const weekRevenue = recentPaid.reduce((sum, o) => sum + (o.amount || 0), 0);
      
      return c.json({
        data: {
          summary: {
            totalOrders: allOrders.length,
            paidOrders: paidOrders.length,
            pendingOrders: pendingOrders.length,
            failedOrders: failedOrders.length,
            missingCredentials: missingCredentials.length,
            totalRevenue: totalRevenue / 100,
            weekRevenue: weekRevenue / 100,
            recentOrdersCount: recentOrders.length,
          },
          // Orders that need attention (paid but no credentials sent)
          ordersNeedingAttention: missingCredentials.map(o => ({
            id: o.id,
            customerEmail: o.customerEmail,
            customerName: o.customerName,
            productName: o.realProductName,
            amount: (o.amount || 0) / 100,
            createdAt: o.createdAt,
            status: o.status,
            credentialsSent: o.credentialsSent,
            generatedUsername: o.generatedUsername,
          })),
          // Recent failed orders
          recentFailures: failedOrders.slice(0, 10).map(o => ({
            id: o.id,
            customerEmail: o.customerEmail,
            productName: o.realProductName,
            amount: (o.amount || 0) / 100,
            createdAt: o.createdAt,
          })),
          // Pending orders (might be abandoned checkouts)
          pendingOrdersList: pendingOrders.slice(0, 10).map(o => ({
            id: o.id,
            customerEmail: o.customerEmail,
            productName: o.realProductName,
            amount: (o.amount || 0) / 100,
            createdAt: o.createdAt,
          })),
        }
      });
    } catch (error: any) {
      console.error("Error fetching payment status:", error);
      return c.json({ error: "Failed to fetch payment status" }, 500);
    }
  });

  // Resend credentials to all orders missing them
  app.post('/fix-missing-credentials', async (c) => {
    try {
      const storage = getStorage(c.env);
      const allOrders = await storage.getAllOrders();
      const paidOrders = allOrders.filter(o => o.status === 'paid' && !o.credentialsSent);
      
      const results: Array<{ orderId: string; email: string; success: boolean; error?: string }> = [];
      
      for (const order of paidOrders) {
        try {
          await sendCredentialsEmail(order, c.env, storage);
          results.push({ orderId: order.id, email: order.customerEmail, success: true });
        } catch (error: any) {
          results.push({ orderId: order.id, email: order.customerEmail, success: false, error: error.message });
        }
      }
      
      return c.json({ 
        data: {
          processed: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results
        }
      });
    } catch (error: any) {
      console.error("Error fixing missing credentials:", error);
      return c.json({ error: "Failed to fix missing credentials" }, 500);
    }
  });

  // Blog admin endpoints
  app.get('/blog/posts', async (c) => {
    try {
      const storage = getStorage(c.env);
      // For admin, we need all posts (published and unpublished)
      // Use service key to bypass RLS and get all posts
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY);
      const { data, error } = await supabase.from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const posts = (data || []).map((d: any) => ({
        id: d.id,
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt,
        content: d.content,
        category: d.category,
        featured: d.featured || false,
        published: d.is_published || false,
        keywords: d.keywords,
        metaDescription: d.meta_description,
        publishedAt: d.published_at,
        createdAt: d.created_at,
      }));
      
      return c.json({ data: posts });
    } catch (error: any) {
      console.error("Error fetching blog posts:", error);
      return c.json({ error: `Failed to fetch blog posts: ${error.message}` }, 500);
    }
  });

  app.post('/blog/posts', async (c) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY);
      const body = await c.req.json();
      
      // Generate slug from title if not provided
      const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const { data, error } = await supabase.from('blog_posts').insert({
        title: body.title,
        slug: slug,
        excerpt: body.excerpt || '',
        content: body.content || '',
        category: body.category || 'Guides',
        featured: body.featured || false,
        is_published: body.published !== undefined ? body.published : false,
        keywords: body.keywords || '',
        meta_description: body.metaDescription || '',
        published_at: body.published ? new Date().toISOString() : null,
      }).select().single();
      
      if (error) throw error;
      
      return c.json({ 
        data: {
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
        }
      });
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      return c.json({ error: `Failed to create blog post: ${error.message}` }, 500);
    }
  });

  app.put('/blog/posts/:id', async (c) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY);
      const body = await c.req.json();
      const id = c.req.param('id');
      
      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.slug !== undefined) updateData.slug = body.slug;
      if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
      if (body.content !== undefined) updateData.content = body.content;
      if (body.category !== undefined) updateData.category = body.category;
      if (body.featured !== undefined) updateData.featured = body.featured;
      if (body.published !== undefined) {
        updateData.is_published = body.published;
        if (body.published && !updateData.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }
      if (body.keywords !== undefined) updateData.keywords = body.keywords;
      if (body.metaDescription !== undefined) updateData.meta_description = body.metaDescription;
      
      const { data, error } = await supabase.from('blog_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return c.json({ 
        data: {
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
        }
      });
    } catch (error: any) {
      console.error("Error updating blog post:", error);
      return c.json({ error: `Failed to update blog post: ${error.message}` }, 500);
    }
  });

  app.delete('/blog/posts/:id', async (c) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY);
      const id = c.req.param('id');
      
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      
      if (error) throw error;
      
      return c.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting blog post:", error);
      return c.json({ error: `Failed to delete blog post: ${error.message}` }, 500);
    }
  });

  app.post('/blog/ai/generate', async (c) => {
    try {
      // For now, return an error since AI generation requires external API
      // This endpoint should be implemented with actual AI service integration
      return c.json({ 
        error: "AI content generation not yet implemented. Please create posts manually." 
      }, 501);
    } catch (error: any) {
      console.error("Error generating AI content:", error);
      return c.json({ error: "Failed to generate AI content" }, 500);
    }
  });

  // GitHub endpoints (placeholder - requires GitHub token configuration)
  app.get('/github/status', async (c) => {
    return c.json({ 
      connected: false, 
      error: "GitHub integration requires GITHUB_TOKEN environment variable" 
    });
  });

  app.get('/github/repos', async (c) => {
    return c.json({ 
      data: [],
      error: "GitHub integration requires GITHUB_TOKEN environment variable" 
    });
  });

  app.post('/github/push', async (c) => {
    return c.json({ 
      success: false,
      error: "GitHub push requires GITHUB_TOKEN environment variable" 
    }, 501);
  });

  return app;
}
