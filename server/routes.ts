import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { 
  checkoutRequestSchema, 
  createProductRequestSchema, 
  updateProductRequestSchema,
  mapShadowProductSchema,
  updateOrderRequestSchema 
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
      
      const { productId, customerEmail, customerName } = parseResult.data;

      const product = await storage.getRealProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (!product.shadowPriceId) {
        return res.status(400).json({ error: "Product not configured for checkout" });
      }

      const stripe = await getUncachableStripeClient();

      const baseUrl = process.env.REPLIT_DOMAINS?.split(',')[0] 
        ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
        : 'http://localhost:5000';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: product.shadowPriceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
        customer_email: customerEmail,
        metadata: {
          realProductId: product.id,
          realProductName: product.name,
          shadowProductId: product.shadowProductId || '',
        },
      });

      const order = await storage.createOrder({
        customerEmail,
        customerName: customerName || null,
        stripeCheckoutSessionId: session.id,
        shadowProductId: product.shadowProductId || null,
        shadowPriceId: product.shadowPriceId,
        realProductId: product.id,
        realProductName: product.name,
        amount: product.price,
        status: 'pending',
        credentialsSent: false,
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

      const timestamp = Date.now().toString(36);
      const random = Math.random().toString(36).substring(2, 8);
      const trialCredentials = {
        username: `trial_${timestamp}`,
        password: `TRIAL_${random.toUpperCase()}`,
      };

      const IPTV_PORTAL_URL = 'http://ky-tv.cc';
      const SETUP_VIDEO_URL = 'https://www.youtube.com/watch?v=XXXXX';

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

  return httpServer;
}
