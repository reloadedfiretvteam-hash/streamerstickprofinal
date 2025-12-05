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

  return httpServer;
}
