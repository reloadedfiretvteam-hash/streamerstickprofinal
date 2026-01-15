/**
 * Support Message Box Component
 * Opens a modal that allows customers to send messages directly to the website owner
 */

import { useState } from 'react';
import { X, Send, Mail, MessageCircle, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SupportMessageBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportMessageBox({ isOpen, onClose }: SupportMessageBoxProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    orderNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Validate form
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Prepare email data
      const emailSubject = formData.subject || 
        `Support Request: ${formData.category}${formData.orderNumber ? ` - Order ${formData.orderNumber}` : ''}`;
      
      const emailBody = `
New Support Message from StreamStickPro Website

Customer Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Category: ${formData.category}
${formData.orderNumber ? `- Order Number: ${formData.orderNumber}` : ''}

Message:
${formData.message}

---
This message was sent from the StreamStickPro website support form.
Time: ${new Date().toLocaleString()}
      `.trim();

      // Send email via Supabase Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          to: 'reloadedfiretvteam@gmail.com',
          from: 'support@streamstickpro.com',
          subject: emailSubject,
          html: emailBody.replace(/\n/g, '<br>'),
          text: emailBody,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send message. Please try again.');
      }

      // Also send confirmation to customer
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-resend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            to: formData.email,
            from: 'support@streamstickpro.com',
            subject: 'We received your support request - StreamStickPro',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff6b35;">Thank you for contacting StreamStickPro!</h2>
                <p>Hi ${formData.name},</p>
                <p>We've received your support request and will get back to you as soon as possible, usually within 24 hours.</p>
                <p><strong>Your message:</strong></p>
                <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${formData.message}</p>
                <p>If you have any urgent questions, please reply to this email or contact us at reloadedfiretvteam@gmail.com</p>
                <p>Best regards,<br>StreamStickPro Support Team</p>
              </div>
            `,
            text: `Thank you for contacting StreamStickPro! We've received your support request and will get back to you soon.`,
          }),
        });
      } catch (confirmationError) {
        console.warn('Failed to send confirmation email:', confirmationError);
        // Don't fail the whole request if confirmation fails
      }

      setSubmitStatus('success');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'general',
          message: '',
          orderNumber: '',
        });
        setSubmitStatus('idle');
        onClose();
      }, 3000);

    } catch (error: any) {
      console.error('Support message error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <MessageCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Contact Support</h2>
              <p className="text-sm text-gray-400">We're here to help! Send us a message.</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success Message */}
          {submitStatus === 'success' && (
            <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-green-500 font-semibold">Message sent successfully!</p>
                <p className="text-green-400 text-sm">We'll get back to you within 24 hours.</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-500 font-semibold">Failed to send message</p>
                <p className="text-red-400 text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Your Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Your Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-white">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="general" className="text-white hover:bg-gray-700">General Question</SelectItem>
                <SelectItem value="order" className="text-white hover:bg-gray-700">Order Issue</SelectItem>
                <SelectItem value="technical" className="text-white hover:bg-gray-700">Technical Support</SelectItem>
                <SelectItem value="billing" className="text-white hover:bg-gray-700">Billing Question</SelectItem>
                <SelectItem value="setup" className="text-white hover:bg-gray-700">Setup Help</SelectItem>
                <SelectItem value="refund" className="text-white hover:bg-gray-700">Refund Request</SelectItem>
                <SelectItem value="other" className="text-white hover:bg-gray-700">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Order Number (optional) */}
          <div className="space-y-2">
            <Label htmlFor="orderNumber" className="text-white">
              Order Number (if applicable)
            </Label>
            <Input
              id="orderNumber"
              type="text"
              value={formData.orderNumber}
              onChange={(e) => handleChange('orderNumber', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Enter your order number"
            />
          </div>

          {/* Subject (optional) */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-white">
              Subject (optional)
            </Label>
            <Input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              placeholder="Brief description of your issue"
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-white">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              required
              rows={6}
              className="bg-gray-800 border-gray-700 text-white resize-none"
              placeholder="Tell us how we can help you..."
            />
            <p className="text-xs text-gray-400">
              {formData.message.length} characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              disabled={isSubmitting || submitStatus === 'success'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : submitStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sent!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>

          {/* Contact Info */}
          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              Or email us directly at{' '}
              <a
                href="mailto:reloadedfiretvteam@gmail.com"
                className="text-orange-500 hover:text-orange-400 underline"
              >
                reloadedfiretvteam@gmail.com
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
