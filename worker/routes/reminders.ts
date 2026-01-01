import { Hono } from 'hono';
import { getStorage } from '../helpers';
import { sendEmail } from '../email-providers';
import type { Env } from '../index';

const SITE_URL = 'https://streamstickpro.com';
const REMINDER_SCHEDULE = {
  // Days after purchase/trial to send reminder
  firstReminder: 7, // 1 week after
  secondReminder: 30, // 1 month after
  thirdReminder: 90, // 3 months after
};

export function createReminderRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  // Send reminder emails to customers who haven't received them
  app.post('/send-reminders', async (c) => {
    try {
      const storage = getStorage(c.env);
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(c.env.VITE_SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY || c.env.VITE_SUPABASE_ANON_KEY);
      
      const now = new Date();
      const results = {
        sent: 0,
        skipped: 0,
        errors: [] as Array<{ email: string; error: string }>,
      };
      
      // Get all orders (paid and trials)
      const allOrders = await storage.getAllOrders();
      
      // Get trial orders
      const { data: trialOrders } = await supabase
        .from('orders')
        .select('*')
        .or('payment_method.eq.free-trial,amount.eq.0')
        .order('created_at', { ascending: false });
      
      // Check which reminders need to be sent
      const ordersToRemind = [];
      
      // Process paid orders
      for (const order of allOrders) {
        if (!order.customerEmail || order.status !== 'paid') continue;
        
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;
        if (!orderDate) continue;
        
        const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if first reminder needed (7 days)
        if (daysSinceOrder >= REMINDER_SCHEDULE.firstReminder && daysSinceOrder < REMINDER_SCHEDULE.secondReminder) {
          // Check if already sent (store in order metadata)
          const remindersSent = (order as any).remindersSent || [];
          if (!remindersSent.includes('first')) {
            ordersToRemind.push({ order, type: 'first', daysSinceOrder });
          }
        }
        // Second reminder (30 days)
        else if (daysSinceOrder >= REMINDER_SCHEDULE.secondReminder && daysSinceOrder < REMINDER_SCHEDULE.thirdReminder) {
          const remindersSent = (order as any).remindersSent || [];
          if (remindersSent.includes('first') && !remindersSent.includes('second')) {
            ordersToRemind.push({ order, type: 'second', daysSinceOrder });
          }
        }
        // Third reminder (90 days)
        else if (daysSinceOrder >= REMINDER_SCHEDULE.thirdReminder) {
          const remindersSent = (order as any).remindersSent || [];
          if (remindersSent.includes('second') && !remindersSent.includes('third')) {
            ordersToRemind.push({ order, type: 'third', daysSinceOrder });
          }
        }
      }
      
      // Process trial orders
      const trialOrdersToUpdate: Array<{ id: string; remindersSent: string[] }> = [];
      
      for (const trialOrder of trialOrders || []) {
        if (!trialOrder.customer_email || trialOrder.payment_status !== 'completed') continue;
        
        const orderDate = trialOrder.created_at ? new Date(trialOrder.created_at) : null;
        if (!orderDate) continue;
        
        const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Only send first reminder for trials (7 days)
        if (daysSinceOrder >= REMINDER_SCHEDULE.firstReminder && daysSinceOrder < REMINDER_SCHEDULE.secondReminder) {
          const remindersSent = trialOrder.metadata?.remindersSent || [];
          if (!remindersSent.includes('first')) {
            const newRemindersSent = [...remindersSent, 'first'];
            trialOrdersToUpdate.push({ id: trialOrder.id, remindersSent: newRemindersSent });
            
            ordersToRemind.push({ 
              order: {
                id: trialOrder.id,
                customerEmail: trialOrder.customer_email,
                customerName: trialOrder.customer_name,
                realProductName: 'Free Trial - 36 Hours',
                amount: 0,
                createdAt: trialOrder.created_at,
              },
              type: 'first',
              daysSinceOrder,
              isTrial: true,
              trialOrderId: trialOrder.id,
            });
          }
        }
      }
      
      // Send reminder emails
      const fromEmail = c.env.RESEND_FROM_EMAIL || 'noreply@streamstickpro.com';
      
      for (const { order, type, daysSinceOrder, isTrial } of ordersToRemind) {
        try {
          let subject = '';
          let html = '';
          
          if (isTrial) {
            // Trial reminder (light and friendly)
            subject = `Your StreamStickPro Trial Experience - What did you think?`;
            html = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1a1a1a;">Hope you enjoyed your free trial! 🎬</h1>
                
                <p>Hi ${order.customerName || 'there'},</p>
                
                <p>We noticed you tried our free 36-hour trial about a week ago. We'd love to hear how your experience went!</p>
                
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
                  <h2 style="margin-top: 0; color: #0369a1;">Ready for More?</h2>
                  <p>If you loved the service and want full access, we have amazing subscription options starting at just $14.99/month!</p>
                  <p style="margin: 15px 0;">
                    <a href="${SITE_URL}/shop" style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                      View Our Plans →
                    </a>
                  </p>
                </div>
                
                <p>Questions or feedback? We're here to help!</p>
                
                <p>Best regards,<br>StreamStickPro Team</p>
              </div>
            `;
          } else {
            // Paid order reminders (light reminder about the service)
            if (type === 'first') {
              subject = `How's your StreamStickPro experience going? 📺`;
              html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #1a1a1a;">Quick Check-in! 👋</h1>
                  
                  <p>Hi ${order.customerName || 'Valued Customer'},</p>
                  
                  <p>It's been about a week since you subscribed to StreamStickPro. We wanted to make sure everything is working smoothly for you!</p>
                  
                  <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                    <h2 style="margin-top: 0; color: #15803d;">Need Help?</h2>
                    <p>If you have any questions or need assistance with setup, we're here to help!</p>
                    <p>📧 Email: reloadedfiretvteam@gmail.com</p>
                  </div>
                  
                  <p>Enjoying the service? <a href="${SITE_URL}">Visit our site</a> to check out new features and updates!</p>
                  
                  <p>Happy Streaming! 🎬<br>StreamStickPro Team</p>
                </div>
              `;
            } else if (type === 'second') {
              subject = `You're a month in - How are you enjoying StreamStickPro? 🎉`;
              html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #1a1a1a;">One Month Celebration! 🎊</h1>
                  
                  <p>Hi ${order.customerName || 'Valued Customer'},</p>
                  
                  <p>You've been enjoying StreamStickPro for a month now! We hope you're loving the unlimited streaming experience.</p>
                  
                  <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <h2 style="margin-top: 0; color: #92400e;">Special Offer Just For You!</h2>
                    <p>As a thank you for being a loyal customer, check out our latest deals and new product offerings!</p>
                    <p style="margin: 15px 0;">
                      <a href="${SITE_URL}/shop" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                        Explore New Products →
                      </a>
                    </p>
                  </div>
                  
                  <p>Thanks for being part of the StreamStickPro family! 🎬</p>
                  
                  <p>Best regards,<br>StreamStickPro Team</p>
                </div>
              `;
            } else {
              subject = `Three months with StreamStickPro - Thank you! 🙏`;
              html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h1 style="color: #1a1a1a;">Three Months & Going Strong! 💪</h1>
                  
                  <p>Hi ${order.customerName || 'Valued Customer'},</p>
                  
                  <p>Wow! You've been with us for 3 months now. Thank you for your continued support and trust in StreamStickPro!</p>
                  
                  <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea;">
                    <h2 style="margin-top: 0; color: #7c3aed;">You're Part of Our Family</h2>
                    <p>We're constantly adding new features, channels, and improvements based on feedback from customers like you!</p>
                  </div>
                  
                  <p>Questions or suggestions? We'd love to hear from you!</p>
                  
                  <p>Thank you for choosing StreamStickPro! 🎬<br>StreamStickPro Team</p>
                </div>
              `;
            }
          }
          
          // Send email
          const result = await sendEmail({
            to: order.customerEmail,
            from: fromEmail,
            subject,
            html,
          }, c.env);
          
          if (result.success) {
            results.sent++;
            
            // Mark reminder as sent (update order metadata)
            if (isTrial) {
              const remindersSent = trialOrder.metadata?.remindersSent || [];
              remindersSent.push(type);
              await supabase
                .from('orders')
                .update({ 
                  metadata: { ...trialOrder.metadata, remindersSent } 
                })
                .eq('id', order.id);
            } else {
              // For paid orders, we'd need to add a reminders_sent column or use metadata
              // For now, log it
              console.log(`[REMINDER] Sent ${type} reminder to ${order.customerEmail} for order ${order.id}`);
            }
          } else {
            results.errors.push({ email: order.customerEmail, error: result.error || 'Unknown error' });
          }
        } catch (error: any) {
          results.errors.push({ email: order.customerEmail, error: error.message });
        }
      }
      
      return c.json({
        success: true,
        results: {
          ...results,
          processed: ordersToRemind.length,
        }
      });
    } catch (error: any) {
      console.error("Error sending reminders:", error);
      return c.json({ error: "Failed to send reminders", details: error.message }, 500);
    }
  });

  return app;
}
