import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
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
      
      const { items, customerEmail, customerName, isRenewal, existingUsername } = parseResult.data;

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
                        req.socket.remoteAddress || 
                        'unknown';

      await storage.trackVisitor({
        sessionId,
        pageUrl,
        referrer: referrer || null,
        userAgent: userAgent || req.headers['user-agent'] || null,
        ipAddress,
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
      res.json({ data: stats });
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

  return httpServer;
}
