import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { analyzeSeo } from "./seoAnalyzer";
import { 
  generateContentOutline, 
  generateFullContent, 
  improveContent, 
  generateSEOSuggestions, 
  expandSection,
  generateFAQ,
  type ContentGenerationRequest,
  type GeneratedContent 
} from "./aiContentService";
import { 
  checkoutRequestSchema, 
  createProductRequestSchema, 
  updateProductRequestSchema,
  mapShadowProductSchema,
  updateOrderRequestSchema,
  createCustomerSchema,
  updateCustomerSchema,
  customerLookupSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import * as crypto from "crypto";
import * as bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || 'streamstickpro-admin-secret-2024';
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;
const CUSTOMER_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000;

function hashPasswordLegacy(password: string): string {
  return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
}

async function hashCustomerPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyCustomerPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function createToken(username: string, role: 'admin' | 'customer' = 'admin'): string {
  const expiry = role === 'customer' ? CUSTOMER_TOKEN_EXPIRY : TOKEN_EXPIRY;
  const payload = { sub: username, role, exp: Date.now() + expiry };
  const payloadStr = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('hex');
  return Buffer.from(payloadStr).toString('base64') + '.' + signature;
}

function verifyToken(token: string): { valid: boolean; payload?: any } {
  try {
    const [payloadB64, signature] = token.split('.');
    const payloadStr = Buffer.from(payloadB64, 'base64').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(payloadStr).digest('hex');
    if (signature !== expectedSig) return { valid: false };
    const payload = JSON.parse(payloadStr);
    if (payload.exp && payload.exp < Date.now()) return { valid: false };
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  const token = authHeader.substring(7);
  const result = verifyToken(token);
  
  if (!result.valid) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  
  next();
}

function customerAuthMiddleware(req: Request & { customer?: any }, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  
  const token = authHeader.substring(7);
  const result = verifyToken(token);
  
  if (!result.valid || result.payload?.role !== 'customer') {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  
  req.customer = result.payload;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.use('/api/admin', adminAuthMiddleware);
  
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getRealProducts();
      res.json({ data: products });
    } catch (error: any) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getRealProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json({ data: product });
    } catch (error: any) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error: any) {
      console.error("Error getting Stripe config:", error);
      res.status(500).json({ error: "Failed to get Stripe configuration" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      const parseResult = checkoutRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      
      const { items, customerEmail, customerName, isRenewal, existingUsername, countryPreference } = parseResult.data;

      let existingCustomer = null;
      if (isRenewal && existingUsername) {
        existingCustomer = await storage.getCustomerByUsername(existingUsername);
        if (!existingCustomer) {
          return res.status(404).json({ 
            error: "Username not found. Please check your username or select 'New Account' instead." 
          });
        }
      }

      const productsWithQuantity: Array<{ product: any; quantity: number }> = [];
      
      for (const item of items) {
        const product = await storage.getRealProduct(item.productId);
        if (!product) {
          return res.status(404).json({ error: `Product not found: ${item.productId}` });
        }
        if (!product.shadowPriceId) {
          return res.status(400).json({ error: `Product not configured for checkout: ${item.productId}` });
        }
        productsWithQuantity.push({ product, quantity: item.quantity });
      }

      const stripe = await getUncachableStripeClient();

      const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'http://localhost:5000';

      const lineItems = productsWithQuantity.map(({ product, quantity }) => ({
        price: product.shadowPriceId,
        quantity,
      }));

      const realProductIds = productsWithQuantity.map(p => p.product.id).join(',');
      const realProductNames = productsWithQuantity.map(p => p.product.name).join(', ');
      const shadowProductIds = productsWithQuantity.map(p => p.product.shadowProductId || '').join(',');

      const hasFireStickProduct = productsWithQuantity.some(({ product }) => {
        const name = (product.name || '').toLowerCase();
        return name.includes('fire') || name.includes('stick') || name.includes('firestick');
      });

      const sessionConfig: any = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
        customer_email: customerEmail,
        metadata: {
          realProductIds,
          realProductNames,
          shadowProductIds,
          isRenewal: isRenewal ? 'true' : 'false',
          existingUsername: existingUsername || '',
          existingCustomerId: existingCustomer?.id || '',
          countryPreference: countryPreference || 'All Countries',
        },
      };

      if (hasFireStickProduct) {
        sessionConfig.shipping_address_collection = {
          allowed_countries: ['US', 'CA'],
        };
        sessionConfig.phone_number_collection = {
          enabled: true,
        };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      const totalAmount = productsWithQuantity.reduce(
        (sum, { product, quantity }) => sum + product.price * quantity, 
        0
      );

      const order = await storage.createOrder({
        customerEmail,
        customerName: customerName || null,
        stripeCheckoutSessionId: session.id,
        shadowProductId: shadowProductIds,
        shadowPriceId: productsWithQuantity.map(p => p.product.shadowPriceId).join(','),
        realProductId: realProductIds,
        realProductName: realProductNames,
        amount: totalAmount,
        status: 'pending',
        credentialsSent: false,
        isRenewal: isRenewal || false,
        existingUsername: existingUsername || null,
        customerId: existingCustomer?.id || null,
        countryPreference: countryPreference || null,
      });

      res.json({ 
        sessionId: session.id,
        url: session.url,
        orderId: order.id,
      });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.get("/api/orders/:email", async (req, res) => {
    try {
      const orders = await storage.getOrdersByEmail(req.params.email);
      res.json({ data: orders });
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/order/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({ data: order });
    } catch (error: any) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/checkout/session/:sessionId", async (req, res) => {
    try {
      const order = await storage.getOrderByCheckoutSession(req.params.sessionId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
      
      res.json({ 
        order,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_details?.email,
      });
    } catch (error: any) {
      console.error("Error fetching checkout session:", error);
      res.status(500).json({ error: "Failed to fetch checkout session" });
    }
  });

  app.get("/api/admin/products", async (req, res) => {
    try {
      const products = await storage.getRealProducts();
      res.json({ data: products });
    } catch (error: any) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", async (req, res) => {
    try {
      const { id, name, description, price, imageUrl, category, shadowProductId, shadowPriceId } = req.body;

      if (!id || !name || !price) {
        return res.status(400).json({ error: "ID, name, and price are required" });
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

      res.json({ data: product });
    } catch (error: any) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", async (req, res) => {
    try {
      const { name, description, price, imageUrl, category, shadowProductId, shadowPriceId } = req.body;

      const existingProduct = await storage.getRealProduct(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const product = await storage.updateRealProduct(req.params.id, {
        name,
        description,
        price,
        imageUrl,
        category,
        shadowProductId,
        shadowPriceId,
      });

      res.json({ data: product });
    } catch (error: any) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    try {
      const existingProduct = await storage.getRealProduct(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const deleted = await storage.deleteRealProduct(req.params.id);
      
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to delete product" });
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.post("/api/admin/products/:id/map-shadow", async (req, res) => {
    try {
      const { shadowProductId, shadowPriceId } = req.body;

      if (!shadowProductId || !shadowPriceId) {
        return res.status(400).json({ error: "Shadow product ID and price ID are required" });
      }

      const existingProduct = await storage.getRealProduct(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const product = await storage.updateRealProduct(req.params.id, {
        shadowProductId,
        shadowPriceId,
      });

      res.json({ data: product });
    } catch (error: any) {
      console.error("Error mapping shadow product:", error);
      res.status(500).json({ error: "Failed to map shadow product" });
    }
  });

  app.post("/api/admin/products/:id/sync-stripe-price", async (req, res) => {
    try {
      const { price, shadowName } = req.body;

      if (!price || price <= 0) {
        return res.status(400).json({ error: "Valid price is required" });
      }

      const existingProduct = await storage.getRealProduct(req.params.id);
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      const stripe = await getUncachableStripeClient();

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

      const updatedProduct = await storage.updateRealProduct(req.params.id, {
        price: priceInCents,
        shadowProductId,
        shadowPriceId: stripePrice.id,
      });

      res.json({ 
        data: updatedProduct,
        stripeProductId: shadowProductId,
        stripePriceId: stripePrice.id,
      });
    } catch (error: any) {
      console.error("Error syncing Stripe price:", error);
      res.status(500).json({ error: `Failed to sync Stripe price: ${error.message}` });
    }
  });

  app.post("/api/admin/products/create-with-stripe", async (req, res) => {
    try {
      const { id, name, description, price, imageUrl, category, shadowName } = req.body;

      if (!id || !name || !price) {
        return res.status(400).json({ error: "ID, name, and price are required" });
      }

      const stripe = await getUncachableStripeClient();

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

      res.json({ 
        data: product,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      });
    } catch (error: any) {
      console.error("Error creating product with Stripe:", error);
      res.status(500).json({ error: `Failed to create product: ${error.message}` });
    }
  });

  app.get("/api/admin/orders", async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json({ data: orders });
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/orders/stats", async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(todayStart);
      weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const ordersToday = allOrders.filter(o => o.createdAt && new Date(o.createdAt) >= todayStart);
      const ordersThisWeek = allOrders.filter(o => o.createdAt && new Date(o.createdAt) >= weekStart);
      const ordersThisMonth = allOrders.filter(o => o.createdAt && new Date(o.createdAt) >= monthStart);
      
      const paidOrders = allOrders.filter(o => o.status === 'paid');
      const paidOrdersToday = ordersToday.filter(o => o.status === 'paid');
      const paidOrdersThisWeek = ordersThisWeek.filter(o => o.status === 'paid');
      const paidOrdersThisMonth = ordersThisMonth.filter(o => o.status === 'paid');
      
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      const revenueToday = paidOrdersToday.reduce((sum, o) => sum + (o.amount || 0), 0);
      const revenueThisWeek = paidOrdersThisWeek.reduce((sum, o) => sum + (o.amount || 0), 0);
      const revenueThisMonth = paidOrdersThisMonth.reduce((sum, o) => sum + (o.amount || 0), 0);
      
      const pendingFulfillments = allOrders.filter(o => 
        o.status === 'paid' && 
        o.fulfillmentStatus === 'pending' &&
        (o.realProductName?.toLowerCase().includes('fire') || o.realProductName?.toLowerCase().includes('stick'))
      ).length;
      
      const recentOrders = allOrders.slice(0, 10).map(o => ({
        id: o.id,
        customerEmail: o.customerEmail,
        customerName: o.customerName,
        productName: o.realProductName,
        amount: o.amount,
        status: o.status,
        fulfillmentStatus: o.fulfillmentStatus,
        createdAt: o.createdAt,
      }));
      
      res.json({
        data: {
          totalOrders: allOrders.length,
          ordersToday: ordersToday.length,
          ordersThisWeek: ordersThisWeek.length,
          ordersThisMonth: ordersThisMonth.length,
          totalRevenue,
          revenueToday,
          revenueThisWeek,
          revenueThisMonth,
          pendingFulfillments,
          recentOrders,
        }
      });
    } catch (error: any) {
      console.error("Error fetching order stats:", error);
      res.status(500).json({ error: "Failed to fetch order statistics" });
    }
  });

  app.put("/api/admin/orders/:id", async (req, res) => {
    try {
      const { status, credentialsSent } = req.body;

      const existingOrder = await storage.getOrder(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      const order = await storage.updateOrder(req.params.id, {
        status,
        credentialsSent,
      });

      res.json({ data: order });
    } catch (error: any) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  app.post("/api/admin/orders/:id/resend-credentials", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const { EmailService } = await import('./emailService');
      await EmailService.sendCredentialsEmail(order);

      res.json({ success: true, message: "Credentials email sent" });
    } catch (error: any) {
      console.error("Error resending credentials:", error);
      res.status(500).json({ error: "Failed to resend credentials" });
    }
  });

  app.get("/api/admin/fulfillment", async (req, res) => {
    try {
      const orders = await storage.getFireStickOrdersForFulfillment();
      res.json({ data: orders });
    } catch (error: any) {
      console.error("Error fetching fulfillment orders:", error);
      res.status(500).json({ error: "Failed to fetch fulfillment orders" });
    }
  });

  app.post("/api/admin/seed-blog", async (req, res) => {
    try {
      const { seedBlogPosts } = await import('./seedBlog');
      const result = await seedBlogPosts();
      res.json({ success: true, message: `Seeded ${result.seededCount} blog posts` });
    } catch (error: any) {
      console.error("Error seeding blog posts:", error);
      res.status(500).json({ error: "Failed to seed blog posts" });
    }
  });

  app.put("/api/admin/fulfillment/:id", async (req, res) => {
    try {
      const { fulfillmentStatus, amazonOrderId } = req.body;

      const existingOrder = await storage.getOrder(req.params.id);
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      const updates: any = {};
      if (fulfillmentStatus !== undefined) {
        updates.fulfillmentStatus = fulfillmentStatus;
      }
      if (amazonOrderId !== undefined) {
        updates.amazonOrderId = amazonOrderId;
      }

      const order = await storage.updateOrder(req.params.id, updates);
      res.json({ data: order });
    } catch (error: any) {
      console.error("Error updating fulfillment:", error);
      res.status(500).json({ error: "Failed to update fulfillment" });
    }
  });

  app.post("/api/free-trial", async (req, res) => {
    try {
      const { email, name } = req.body;

      if (!email || !name) {
        return res.status(400).json({ error: "Email and name are required" });
      }

      if (!email.includes("@")) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }

      const { getUncachableResendClient } = await import('./resendClient');
      const { client, fromEmail } = await getUncachableResendClient();

      const letters = 'abcdefghkmnpqrstuvwxyz';
      const numbers = '23456789';
      const symbols = '@#$%&*!';
      const timestamp = Date.now().toString(36);
      const seed = email.replace(/[^a-zA-Z0-9]/g, '') + timestamp;
      
      const generateChar = (index: number, charset: string): string => {
        const charCode = seed.charCodeAt(index % seed.length) || 65;
        return charset[(charCode + index) % charset.length];
      };
      
      const nameClean = name.replace(/[^a-zA-Z]/g, '').toLowerCase().substring(0, 3);
      let username = nameClean.length >= 2 ? nameClean : 'usr';
      for (let i = 0; username.length < 8; i++) {
        username += generateChar(i, numbers + letters);
      }
      username = username.substring(0, 10);
      
      let password = '';
      password += generateChar(0, letters.toUpperCase());
      password += generateChar(1, letters);
      password += generateChar(2, numbers);
      password += generateChar(3, symbols);
      for (let i = 4; password.length < 10; i++) {
        password += generateChar(i + 5, letters + letters.toUpperCase() + numbers + symbols);
      }
      
      const trialCredentials = {
        username: username,
        password: password.substring(0, 10),
      };

      const IPTV_PORTAL_URL = 'http://ky-tv.cc';
      const SETUP_VIDEO_URL = 'https://youtu.be/DYSOp6mUzDU';

      await client.emails.send({
        from: fromEmail,
        to: email,
        subject: 'Your FREE 36-Hour IPTV Trial Credentials - StreamStickPro',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #9333ea;">🎉 Your Free Trial is Ready!</h1>
            
            <p>Hi ${name},</p>
            
            <p>Thank you for trying StreamStickPro! Here are your <strong>36-hour free trial</strong> credentials:</p>
            
            <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 25px; border-radius: 12px; margin: 20px 0; color: white;">
              <h2 style="margin-top: 0; color: white;">Your Trial Credentials</h2>
              <p style="font-size: 16px;"><strong>Portal URL:</strong> <a href="${IPTV_PORTAL_URL}" style="color: #fef08a;">${IPTV_PORTAL_URL}</a></p>
              <p style="font-size: 18px;"><strong>Username:</strong> ${trialCredentials.username}</p>
              <p style="font-size: 18px;"><strong>Password:</strong> ${trialCredentials.password}</p>
            </div>
            
            <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #7c3aed; margin-top: 0;">Quick Setup Guide:</h3>
              <ol style="color: #4c1d95;">
                <li>Download IPTV Smarters or TiviMate app on your device</li>
                <li>Enter the portal URL: ${IPTV_PORTAL_URL}</li>
                <li>Enter your username and password above</li>
                <li>Enjoy 18,000+ live channels for FREE!</li>
              </ol>
              <p><strong>Watch our setup video:</strong> <a href="${SETUP_VIDEO_URL}" style="color: #7c3aed;">${SETUP_VIDEO_URL}</a></p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <strong>⏰ Remember:</strong> Your trial expires in 36 hours. Upgrade anytime to keep streaming!
            </div>
            
            <p>Love the service? <a href="https://streamstickpro.com" style="color: #9333ea; font-weight: bold;">Visit our shop</a> to get full access!</p>
            
            <p>Questions? Reply to this email or contact us at reloadedfiretvteam@gmail.com</p>
            
            <p>Happy Streaming! 🎬<br>StreamStickPro Team</p>
          </div>
        `,
      });

      await client.emails.send({
        from: fromEmail,
        to: 'reloadedfiretvteam@gmail.com',
        subject: `🆕 New Free Trial Signup - ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #9333ea;">New Free Trial Request</h1>
            
            <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #7c3aed;">Customer Details</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Signed up:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #4338ca;">Trial Credentials Sent</h2>
              <p><strong>Username:</strong> ${trialCredentials.username}</p>
              <p><strong>Password:</strong> ${trialCredentials.password}</p>
              <p><strong>Expires:</strong> 36 hours from signup</p>
            </div>
            
            <p>This customer may convert to a paying customer. Consider following up after their trial expires!</p>
          </div>
        `,
      });

      console.log(`Free trial credentials sent to ${email}, owner notified`);

      res.json({ success: true, message: "Trial credentials sent" });
    } catch (error: any) {
      console.error("Error processing free trial:", error);
      res.status(500).json({ error: "Failed to process trial request. Please try again." });
    }
  });

  app.post("/api/track", async (req, res) => {
    try {
      const { sessionId, pageUrl, referrer, userAgent } = req.body;

      if (!sessionId || !pageUrl) {
        return res.status(400).json({ error: "Session ID and page URL are required" });
      }

      const ipAddress = req.headers['x-forwarded-for']?.toString().split(',')[0] || 
                        req.headers['cf-connecting-ip']?.toString() ||
                        req.socket.remoteAddress || 
                        'unknown';

      const { getGeoLocation } = await import('./geoLocationService');
      const geoData = await getGeoLocation(ipAddress);

      await storage.trackVisitor({
        sessionId,
        pageUrl,
        referrer: referrer || null,
        userAgent: userAgent || req.headers['user-agent'] || null,
        ipAddress,
        country: geoData.country,
        countryCode: geoData.countryCode,
        region: geoData.region,
        regionCode: geoData.regionCode,
        city: geoData.city,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        timezone: geoData.timezone,
        isp: geoData.isp,
        isProxy: geoData.isProxy,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error tracking visitor:", error);
      res.status(500).json({ error: "Failed to track visitor" });
    }
  });

  app.get("/api/admin/visitors/stats", async (req, res) => {
    try {
      const stats = await storage.getVisitorStats();
      const { getGeoStats } = await import('./geoLocationService');
      const geoStats = getGeoStats(stats.recentVisitors);
      res.json({ data: { ...stats, ...geoStats } });
    } catch (error: any) {
      console.error("Error fetching visitor stats:", error);
      res.status(500).json({ error: "Failed to fetch visitor stats" });
    }
  });

  app.get("/api/admin/storage/list", async (req, res) => {
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_KEY;
      
      if (!supabaseUrl || !serviceKey) {
        return res.status(500).json({ error: "Supabase credentials not configured" });
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, serviceKey);

      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        return res.status(500).json({ error: `Failed to list buckets: ${bucketsError.message}` });
      }

      const result: any = { buckets: [] };

      for (const bucket of buckets || []) {
        const { data: files, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list('', { limit: 100 });

        const bucketData: any = {
          name: bucket.name,
          public: bucket.public,
          files: [],
          folders: []
        };

        if (!filesError && files) {
          for (const item of files) {
            if (item.id) {
              bucketData.files.push({
                name: item.name,
                url: `${supabaseUrl}/storage/v1/object/public/${bucket.name}/${item.name}`
              });
            } else {
              const { data: subFiles } = await supabase.storage
                .from(bucket.name)
                .list(item.name, { limit: 100 });
              
              bucketData.folders.push({
                name: item.name,
                files: (subFiles || []).filter(f => f.id).map(f => ({
                  name: f.name,
                  url: `${supabaseUrl}/storage/v1/object/public/${bucket.name}/${item.name}/${f.name}`
                }))
              });
            }
          }
        }

        result.buckets.push(bucketData);
      }

      res.json(result);
    } catch (error: any) {
      console.error("Error listing storage:", error);
      res.status(500).json({ error: "Failed to list storage" });
    }
  });

  app.get("/api/page-edits/:pageId", async (req, res) => {
    try {
      const edits = await storage.getPageEdits(req.params.pageId);
      res.json({ data: edits });
    } catch (error: any) {
      console.error("Error fetching page edits:", error);
      res.status(500).json({ error: "Failed to fetch page edits" });
    }
  });

  app.get("/api/admin/page-edits", async (req, res) => {
    try {
      const edits = await storage.getAllPageEdits();
      res.json({ data: edits });
    } catch (error: any) {
      console.error("Error fetching all page edits:", error);
      res.status(500).json({ error: "Failed to fetch page edits" });
    }
  });

  app.post("/api/admin/page-edits", async (req, res) => {
    try {
      const { pageId, sectionId, elementId, elementType, content, imageUrl, isActive } = req.body;

      if (!pageId || !sectionId || !elementId || !elementType) {
        return res.status(400).json({ error: "Page ID, section ID, element ID, and element type are required" });
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

      res.json({ data: edit });
    } catch (error: any) {
      console.error("Error saving page edit:", error);
      res.status(500).json({ error: "Failed to save page edit" });
    }
  });

  app.delete("/api/admin/page-edits/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePageEdit(req.params.id);
      
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Page edit not found" });
      }
    } catch (error: any) {
      console.error("Error deleting page edit:", error);
      res.status(500).json({ error: "Failed to delete page edit" });
    }
  });

  app.get("/api/admin/customers", async (req, res) => {
    try {
      const { search } = req.query;
      let customersList;
      
      if (search && typeof search === 'string' && search.trim()) {
        customersList = await storage.searchCustomers(search.trim());
      } else {
        customersList = await storage.getAllCustomers();
      }
      
      res.json({ data: customersList });
    } catch (error: any) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/admin/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json({ data: customer });
    } catch (error: any) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.get("/api/admin/customers/:id/orders", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      const customerOrders = await storage.getCustomerOrders(req.params.id);
      res.json({ data: customerOrders });
    } catch (error: any) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ error: "Failed to fetch customer orders" });
    }
  });

  app.post("/api/admin/customers", async (req, res) => {
    try {
      const parseResult = createCustomerSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const existingByUsername = await storage.getCustomerByUsername(parseResult.data.username);
      if (existingByUsername) {
        return res.status(409).json({ error: "A customer with this username already exists" });
      }

      const customer = await storage.createCustomer(parseResult.data);
      res.json({ data: customer });
    } catch (error: any) {
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.put("/api/admin/customers/:id", async (req, res) => {
    try {
      const parseResult = updateCustomerSchema.safeParse(req.body);
      if (!parseResult.success) {
        const validationError = fromZodError(parseResult.error);
        return res.status(400).json({ error: validationError.message });
      }

      const existingCustomer = await storage.getCustomer(req.params.id);
      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      if (parseResult.data.username && parseResult.data.username !== existingCustomer.username) {
        const conflictingCustomer = await storage.getCustomerByUsername(parseResult.data.username);
        if (conflictingCustomer) {
          return res.status(409).json({ error: "A customer with this username already exists" });
        }
      }

      const customer = await storage.updateCustomer(req.params.id, parseResult.data);
      res.json({ data: customer });
    } catch (error: any) {
      console.error("Error updating customer:", error);
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/admin/customers/:id", async (req, res) => {
    try {
      const existingCustomer = await storage.getCustomer(req.params.id);
      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const deleted = await storage.deleteCustomer(req.params.id);
      
      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to delete customer" });
      }
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  app.get("/api/customer/lookup/:username", async (req, res) => {
    try {
      const customer = await storage.getCustomerByUsername(req.params.username);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found", exists: false });
      }
      
      res.json({ 
        exists: true,
        data: {
          id: customer.id,
          username: customer.username,
          email: customer.email,
          fullName: customer.fullName,
          status: customer.status,
          totalOrders: customer.totalOrders,
        }
      });
    } catch (error: any) {
      console.error("Error looking up customer:", error);
      res.status(500).json({ error: "Failed to lookup customer" });
    }
  });

  app.get("/api/admin/iptv-customers", async (req, res) => {
    try {
      const iptvOrders = await storage.getIPTVOrders();
      res.json({ data: iptvOrders });
    } catch (error: any) {
      console.error("Error fetching IPTV orders:", error);
      res.status(500).json({ error: "Failed to fetch IPTV orders" });
    }
  });

  // ===== BLOG API ROUTES =====
  
  // Public blog routes
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const posts = await storage.getBlogPostsPublished();
      res.json({ data: posts });
    } catch (error: any) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/posts/featured", async (req, res) => {
    try {
      const posts = await storage.getFeaturedBlogPosts();
      res.json({ data: posts });
    } catch (error: any) {
      console.error("Error fetching featured blog posts:", error);
      res.status(500).json({ error: "Failed to fetch featured blog posts" });
    }
  });

  app.get("/api/blog/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length === 0) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const posts = await storage.searchBlogPosts(query);
      res.json({ data: posts });
    } catch (error: any) {
      console.error("Error searching blog posts:", error);
      res.status(500).json({ error: "Failed to search blog posts" });
    }
  });

  app.get("/api/blog/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json({ data: post });
    } catch (error: any) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // Admin blog routes
  app.get("/api/admin/blog/posts", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json({ data: posts });
    } catch (error: any) {
      console.error("Error fetching admin blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog/posts", async (req, res) => {
    try {
      const { title, slug, excerpt, content, category, imageUrl, metaTitle, metaDescription, keywords, featured, published, linkedProductIds } = req.body;

      if (!title || !slug || !excerpt || !content || !category) {
        return res.status(400).json({ error: "Title, slug, excerpt, content, and category are required" });
      }

      const seoResult = analyzeSeo({
        title,
        content,
        excerpt,
        metaTitle,
        metaDescription,
        keywords,
      });

      const post = await storage.createBlogPost({
        title,
        slug,
        excerpt,
        content,
        category,
        imageUrl: imageUrl || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywords || [],
        readTime: seoResult.readTime,
        featured: featured || false,
        published: published || false,
        publishedAt: published ? new Date() : null,
        linkedProductIds: linkedProductIds || [],
      });

      const updatedPost = await storage.updateBlogPost(post.id, {
        wordCount: seoResult.wordCount,
        headingScore: seoResult.headingScore,
        keywordDensityScore: seoResult.keywordDensityScore,
        contentLengthScore: seoResult.contentLengthScore,
        metaScore: seoResult.metaScore,
        structureScore: seoResult.structureScore,
        overallSeoScore: seoResult.overallSeoScore,
        seoAnalysis: seoResult.seoAnalysis,
      });

      res.json({ data: updatedPost, seoAnalysis: seoResult });
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  app.get("/api/admin/blog/posts/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      res.json({ data: post });
    } catch (error: any) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.put("/api/admin/blog/posts/:id", async (req, res) => {
    try {
      const existingPost = await storage.getBlogPost(req.params.id);
      if (!existingPost) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      const { title, slug, excerpt, content, category, imageUrl, metaTitle, metaDescription, keywords, featured, published, linkedProductIds } = req.body;

      const finalTitle = title ?? existingPost.title;
      const finalContent = content ?? existingPost.content;
      const finalExcerpt = excerpt ?? existingPost.excerpt;
      const finalMetaTitle = metaTitle ?? existingPost.metaTitle;
      const finalMetaDescription = metaDescription ?? existingPost.metaDescription;
      const finalKeywords = keywords ?? existingPost.keywords;

      const seoResult = analyzeSeo({
        title: finalTitle,
        content: finalContent,
        excerpt: finalExcerpt,
        metaTitle: finalMetaTitle,
        metaDescription: finalMetaDescription,
        keywords: finalKeywords,
      });

      const post = await storage.updateBlogPost(req.params.id, {
        title,
        slug,
        excerpt,
        content,
        category,
        imageUrl,
        metaTitle,
        metaDescription,
        keywords,
        readTime: seoResult.readTime,
        featured,
        published,
        publishedAt: published && !existingPost.publishedAt ? new Date() : existingPost.publishedAt,
        linkedProductIds,
        wordCount: seoResult.wordCount,
        headingScore: seoResult.headingScore,
        keywordDensityScore: seoResult.keywordDensityScore,
        contentLengthScore: seoResult.contentLengthScore,
        metaScore: seoResult.metaScore,
        structureScore: seoResult.structureScore,
        overallSeoScore: seoResult.overallSeoScore,
        seoAnalysis: seoResult.seoAnalysis,
      });

      res.json({ data: post, seoAnalysis: seoResult });
    } catch (error: any) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog/posts/:id", async (req, res) => {
    try {
      const existingPost = await storage.getBlogPost(req.params.id);
      if (!existingPost) {
        return res.status(404).json({ error: "Blog post not found" });
      }

      const deleted = await storage.deleteBlogPost(req.params.id);

      if (deleted) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to delete blog post" });
      }
    } catch (error: any) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  app.get("/api/admin/blog/posts/category/:category", async (req, res) => {
    try {
      const posts = await storage.getBlogPostsByCategory(req.params.category);
      res.json({ data: posts });
    } catch (error: any) {
      console.error("Error fetching posts by category:", error);
      res.status(500).json({ error: "Failed to fetch posts by category" });
    }
  });

  app.post("/api/admin/blog/analyze-seo", async (req, res) => {
    try {
      const { title, content, excerpt, metaTitle, metaDescription, keywords } = req.body;

      if (!title || !content || !excerpt) {
        return res.status(400).json({ error: "Title, content, and excerpt are required for SEO analysis" });
      }

      const seoResult = analyzeSeo({
        title,
        content,
        excerpt,
        metaTitle,
        metaDescription,
        keywords,
      });

      res.json({ data: seoResult });
    } catch (error: any) {
      console.error("Error analyzing SEO:", error);
      res.status(500).json({ error: "Failed to analyze SEO" });
    }
  });

  // AI Content Generation Routes
  app.post("/api/admin/blog/ai/outline", async (req, res) => {
    try {
      const request: ContentGenerationRequest = req.body;
      
      if (!request.topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const outline = await generateContentOutline(request);
      res.json({ data: outline });
    } catch (error: any) {
      console.error("Error generating outline:", error);
      res.status(500).json({ error: `Failed to generate outline: ${error.message}` });
    }
  });

  app.post("/api/admin/blog/ai/generate", async (req, res) => {
    try {
      const request: ContentGenerationRequest = req.body;
      
      if (!request.topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const content = await generateFullContent(request);
      res.json({ data: content });
    } catch (error: any) {
      console.error("Error generating content:", error);
      res.status(500).json({ error: `Failed to generate content: ${error.message}` });
    }
  });

  app.post("/api/admin/blog/ai/improve", async (req, res) => {
    try {
      const { content, instructions } = req.body;
      
      if (!content || !instructions) {
        return res.status(400).json({ error: "Content and instructions are required" });
      }

      const improved = await improveContent(content, instructions);
      res.json({ data: improved });
    } catch (error: any) {
      console.error("Error improving content:", error);
      res.status(500).json({ error: `Failed to improve content: ${error.message}` });
    }
  });

  app.post("/api/admin/blog/ai/seo-suggestions", async (req, res) => {
    try {
      const { title, content, keywords } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }

      const suggestions = await generateSEOSuggestions(title, content, keywords || []);
      res.json({ data: suggestions });
    } catch (error: any) {
      console.error("Error generating SEO suggestions:", error);
      res.status(500).json({ error: `Failed to generate suggestions: ${error.message}` });
    }
  });

  app.post("/api/admin/blog/ai/expand-section", async (req, res) => {
    try {
      const { content, context, targetWords } = req.body;
      
      if (!content || !context) {
        return res.status(400).json({ error: "Content and context are required" });
      }

      const expanded = await expandSection(content, context, targetWords || 300);
      res.json({ data: { content: expanded } });
    } catch (error: any) {
      console.error("Error expanding section:", error);
      res.status(500).json({ error: `Failed to expand section: ${error.message}` });
    }
  });

  app.post("/api/admin/blog/ai/generate-faq", async (req, res) => {
    try {
      const { topic, content, count } = req.body;
      
      if (!topic || !content) {
        return res.status(400).json({ error: "Topic and content are required" });
      }

      const faq = await generateFAQ(topic, content, count || 5);
      res.json({ data: { faq } });
    } catch (error: any) {
      console.error("Error generating FAQ:", error);
      res.status(500).json({ error: `Failed to generate FAQ: ${error.message}` });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

      if (username === adminUsername && password === adminPassword) {
        const token = createToken(username);
        return res.json({ success: true, token });
      }

      res.status(401).json({ error: 'Invalid username or password' });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post("/api/auth/verify", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ valid: false, error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const result = verifyToken(token);
      
      if (result.valid) {
        res.json({ valid: true, user: result.payload?.sub, role: result.payload?.role });
      } else {
        res.status(401).json({ valid: false, error: 'Invalid or expired token' });
      }
    } catch (error: any) {
      console.error('Token verification error:', error);
      res.status(500).json({ valid: false, error: 'Verification failed' });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // ===== CUSTOMER AUTH ROUTES =====
  
  app.post("/api/customer/register", async (req, res) => {
    try {
      const { username, password, email, fullName } = req.body;
      
      if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password, and email are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existingByUsername = await storage.getCustomerByUsername(username);
      if (existingByUsername) {
        return res.status(409).json({ error: 'Username already taken' });
      }

      const existingByEmail = await storage.getCustomerByEmail(email);
      if (existingByEmail) {
        return res.status(409).json({ error: 'Email already registered. Please login instead.' });
      }

      const hashedPassword = await hashCustomerPassword(password);

      const customer = await storage.createCustomer({
        username,
        password: hashedPassword,
        email,
        fullName: fullName || null,
      });

      const token = createToken(customer.id, 'customer');

      res.json({ 
        success: true, 
        token,
        customer: {
          id: customer.id,
          username: customer.username,
          email: customer.email,
          fullName: customer.fullName,
        }
      });
    } catch (error: any) {
      console.error('Customer registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post("/api/customer/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const customer = await storage.getCustomerByUsername(username);
      if (!customer) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      if (customer.status !== 'active') {
        return res.status(403).json({ error: 'Account is not active. Please contact support.' });
      }

      const isValidPassword = await verifyCustomerPassword(password, customer.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = createToken(customer.id, 'customer');

      res.json({ 
        success: true, 
        token,
        customer: {
          id: customer.id,
          username: customer.username,
          email: customer.email,
          fullName: customer.fullName,
        }
      });
    } catch (error: any) {
      console.error('Customer login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get("/api/customer/me", customerAuthMiddleware, async (req: Request & { customer?: any }, res) => {
    try {
      const customerId = req.customer?.sub;
      if (!customerId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json({ 
        data: {
          id: customer.id,
          username: customer.username,
          email: customer.email,
          fullName: customer.fullName,
          totalOrders: customer.totalOrders,
          lastOrderAt: customer.lastOrderAt,
          createdAt: customer.createdAt,
        }
      });
    } catch (error: any) {
      console.error('Error fetching customer profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  });

  app.get("/api/customer/orders", customerAuthMiddleware, async (req: Request & { customer?: any }, res) => {
    try {
      const customerId = req.customer?.sub;
      if (!customerId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const customerOrders = await storage.getCustomerOrders(customerId);
      
      const ordersByEmail = await storage.getOrdersByEmail(customer.email);
      
      const allOrderIds = new Set<string>();
      const allOrders: any[] = [];
      
      for (const order of customerOrders) {
        if (!allOrderIds.has(order.id)) {
          allOrderIds.add(order.id);
          allOrders.push(order);
        }
      }
      
      for (const order of ordersByEmail) {
        if (!allOrderIds.has(order.id)) {
          allOrderIds.add(order.id);
          allOrders.push(order);
        }
      }
      
      allOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      res.json({ data: allOrders });
    } catch (error: any) {
      console.error('Error fetching customer orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.put("/api/customer/profile", customerAuthMiddleware, async (req: Request & { customer?: any }, res) => {
    try {
      const customerId = req.customer?.sub;
      if (!customerId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { fullName, email } = req.body;

      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      if (email && email !== customer.email) {
        const existingByEmail = await storage.getCustomerByEmail(email);
        if (existingByEmail) {
          return res.status(409).json({ error: 'Email already in use' });
        }
      }

      const updated = await storage.updateCustomer(customerId, {
        fullName: fullName !== undefined ? fullName : customer.fullName,
        email: email !== undefined ? email : customer.email,
      });

      res.json({ 
        data: {
          id: updated?.id,
          username: updated?.username,
          email: updated?.email,
          fullName: updated?.fullName,
        }
      });
    } catch (error: any) {
      console.error('Error updating customer profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.put("/api/customer/password", customerAuthMiddleware, async (req: Request & { customer?: any }, res) => {
    try {
      const customerId = req.customer?.sub;
      if (!customerId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }

      const customer = await storage.getCustomer(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const isValidPassword = await verifyCustomerPassword(currentPassword, customer.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hashedPassword = await hashCustomerPassword(newPassword);
      await storage.updateCustomer(customerId, { password: hashedPassword });

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: 'Failed to update password' });
    }
  });

  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://streamstickpro.com";
      const blogPosts = await storage.getAllBlogPosts();
      const products = await storage.getRealProducts();
      
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/blog", priority: "0.9", changefreq: "daily" },
        { url: "/checkout", priority: "0.7", changefreq: "weekly" },
      ];

      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;
      
      for (const page of staticPages) {
        sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
      }

      for (const post of blogPosts) {
        if (post.published) {
          const lastmod = post.updatedAt ? new Date(post.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
        }
      }

      for (const product of products) {
        sitemap += `  <url>
    <loc>${baseUrl}/#product-${product.id}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
      }

      sitemap += `</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error: any) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", (req, res) => {
    const robotsTxt = `User-agent: *
Allow: /
Allow: /blog
Allow: /blog/*

Disallow: /admin
Disallow: /admin/*
Disallow: /api/
Disallow: /shadow-services
Disallow: /checkout

Sitemap: https://streamstickpro.com/sitemap.xml

# Crawl-delay: 1
# Allow search engines to index all public content
`;
    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  app.post("/api/auth/generate-hash", async (req, res) => {
    try {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      const hash = await hashPassword(password);
      res.json({ 
        hash,
        instructions: 'Set this hash as ADMIN_PASSWORD_HASH in your environment variables'
      });
    } catch (error: any) {
      console.error('Hash generation error:', error);
      res.status(500).json({ error: 'Failed to generate hash' });
    }
  });

  app.get("/api/admin/github/status", async (req, res) => {
    try {
      const { getUncachableGitHubClient, getGitHubUser } = await import('./github');
      const user = await getGitHubUser();
      res.json({ 
        connected: true, 
        username: user.login,
        avatarUrl: user.avatar_url 
      });
    } catch (error: any) {
      console.error('GitHub status check error:', error);
      res.json({ connected: false, error: error.message });
    }
  });

  app.get("/api/admin/github/repos", async (req, res) => {
    try {
      const { listGitHubRepos } = await import('./github');
      const repos = await listGitHubRepos(50);
      res.json({ 
        data: repos.map(r => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          private: r.private,
          defaultBranch: r.default_branch,
          htmlUrl: r.html_url
        }))
      });
    } catch (error: any) {
      console.error('GitHub repos fetch error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/github/push", async (req, res) => {
    try {
      const { owner, repo, branch, message } = req.body;
      
      if (!owner || !repo) {
        return res.status(400).json({ error: 'Repository owner and name are required' });
      }

      const { getUncachableGitHubClient } = await import('./github');
      const octokit = await getUncachableGitHubClient();
      
      const targetBranch = branch || 'main';
      const commitMessage = message || `Deploy from StreamStickPro Admin - ${new Date().toISOString()}`;

      let baseSha: string;
      try {
        const { data: ref } = await octokit.git.getRef({
          owner,
          repo,
          ref: `heads/${targetBranch}`
        });
        baseSha = ref.object.sha;
      } catch (error: any) {
        if (error.status === 404) {
          const { data: defaultRef } = await octokit.git.getRef({
            owner,
            repo,
            ref: 'heads/main'
          });
          baseSha = defaultRef.object.sha;
        } else {
          throw error;
        }
      }

      const { data: baseCommit } = await octokit.git.getCommit({
        owner,
        repo,
        commit_sha: baseSha
      });

      const fs = await import('fs');
      const path = await import('path');

      const filesToInclude = [
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.ts',
        'drizzle.config.ts',
        'replit.md'
      ];

      const dirsToInclude = ['client', 'server', 'shared'];

      const getAllFiles = (dir: string, base: string = ''): { path: string; content: string }[] => {
        const files: { path: string; content: string }[] = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          if (item === 'node_modules' || item === '.git' || item === 'dist' || item === '.local') continue;
          
          const fullPath = path.join(dir, item);
          const relativePath = base ? `${base}/${item}` : item;
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            files.push(...getAllFiles(fullPath, relativePath));
          } else {
            try {
              const content = fs.readFileSync(fullPath, 'utf-8');
              files.push({ path: relativePath, content });
            } catch (e) {
            }
          }
        }
        return files;
      };

      const treeItems: Array<{ path: string; mode: '100644'; type: 'blob'; sha: string }> = [];

      for (const file of filesToInclude) {
        const fullPath = path.join(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const { data: blob } = await octokit.git.createBlob({
            owner,
            repo,
            content: Buffer.from(content).toString('base64'),
            encoding: 'base64'
          });
          treeItems.push({
            path: file,
            mode: '100644',
            type: 'blob',
            sha: blob.sha
          });
        }
      }

      for (const dir of dirsToInclude) {
        const dirPath = path.join(process.cwd(), dir);
        if (fs.existsSync(dirPath)) {
          const files = getAllFiles(dirPath, dir);
          for (const file of files) {
            const { data: blob } = await octokit.git.createBlob({
              owner,
              repo,
              content: Buffer.from(file.content).toString('base64'),
              encoding: 'base64'
            });
            treeItems.push({
              path: file.path,
              mode: '100644',
              type: 'blob',
              sha: blob.sha
            });
          }
        }
      }

      const { data: tree } = await octokit.git.createTree({
        owner,
        repo,
        base_tree: baseCommit.tree.sha,
        tree: treeItems
      });

      const { data: newCommit } = await octokit.git.createCommit({
        owner,
        repo,
        message: commitMessage,
        tree: tree.sha,
        parents: [baseSha]
      });

      await octokit.git.updateRef({
        owner,
        repo,
        ref: `heads/${targetBranch}`,
        sha: newCommit.sha
      });

      res.json({ 
        success: true, 
        message: `Successfully pushed ${treeItems.length} files to ${owner}/${repo}`,
        commitSha: newCommit.sha,
        commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}`,
        filesCount: treeItems.length
      });
    } catch (error: any) {
      console.error('GitHub push error:', error);
      res.status(500).json({ error: `Failed to push to GitHub: ${error.message}` });
    }
  });

  return httpServer;
}
