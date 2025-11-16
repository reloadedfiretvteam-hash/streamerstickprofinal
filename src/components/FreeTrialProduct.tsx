import { useState } from 'react';
import { Gift, Check, Mail, User, Phone, Send, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FreeTrialProduct() {
  // const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      alert('Please enter your name and email');
      return;
    }

    setLoading(true);

    try {
      // Generate order number
      const orderNumber = `TRIAL-${Date.now()}`;

      // Create order in orders_full table
      const { data: orderData, error: orderError } = await supabase
        .from('orders_full')
        .insert([{
          order_number: orderNumber,
          customer_email: email,
          customer_name: name,
          customer_phone: phone || null,
          subtotal: 0,
          discount_amount: 0,
          tax_amount: 0,
          shipping_cost: 0,
          total_amount: 0,
          payment_method: 'free_trial',
          payment_status: 'pending',
          order_status: 'pending',
          notes: '36-Hour Free Trial - Awaiting Activation'
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
      }

      // Also save to email_captures for tracking
      await supabase
        .from('email_captures')
        .insert([{
          email: email,
          name: name,
          phone: phone || null,
          source: 'free-trial-signup',
          metadata: {
            product: '36-Hour Free Trial - IPTV Subscription',
            order_number: orderNumber
          }
        }]);

      // Create email body for admin
      const emailBody = `
NEW FREE TRIAL REQUEST - 36 HOURS

Order Number: ${orderNumber}

Customer Details:
- Name: ${name}
- Email: ${email}
- Phone: ${phone || 'Not provided'}
- Date: ${new Date().toLocaleString()}

Product: 36-Hour Free Trial IPTV Subscription
- 22,000+ Live TV Channels
- 120,000+ Movies & Shows
- All Sports & PPV Events
- 4K Ultra HD Quality

ACTION REQUIRED:
Please process this free trial request and send activation details to:
${email}

The customer should receive their trial code within 24 hours.

---
This order has been added to your admin panel at streamstickpro.com/admin
      `.trim();

      // Create mailto link to admin email
      const mailtoLink = `mailto:reloadedfiretvteam@gmail.com?cc=${email}&subject=New 36-Hour Free Trial Request - ${name}&body=${encodeURIComponent(emailBody)}`;

      // Open email client
      window.location.href = mailtoLink;

      setSubmitted(true);

      // Show success message
      setTimeout(() => {
        alert('Email opened! Please send the email to complete your free trial request. You will receive your activation details within 24 hours.');
      }, 500);

    } catch (error) {
      console.error('Error:', error);
      alert('Submission error. Please email us directly at reloadedfiretvteam@gmail.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-10 bg-gradient-to-br from-green-900 via-teal-900 to-green-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-4 py-1 mb-3 animate-pulse">
            <Gift className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium">LIMITED TIME OFFER</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Try <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">FREE</span> for 36 Hours!
          </h2>

          <p className="text-base text-green-100 max-w-2xl mx-auto">
            No credit card required. Experience everything our premium IPTV service has to offer completely free.
          </p>
        </div>

        {/* Free Trial Product Box */}
        <div className="max-w-lg mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border-2 border-green-400 shadow-2xl transform hover:scale-105 transition-all duration-300">
            {/* Badge */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-center py-1.5 font-bold text-sm relative">
              <Sparkles className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 animate-spin" />
              100% FREE - NO PAYMENT REQUIRED
              <Sparkles className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
            </div>

            <div className="p-4">
              <div className="flex flex-col gap-4">
                {/* Product Info */}
                <div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    36-Hour Free Trial
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <p className="text-white text-xs">22,000+ Live TV Channels</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <p className="text-white text-xs">120,000+ Movies & Shows</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <p className="text-white text-xs">All Sports & PPV Events</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <p className="text-white text-xs">4K Ultra HD Quality</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <p className="text-white text-xs">Works on All Devices</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <p className="text-white text-xs">No Credit Card Required</p>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="bg-green-500/20 rounded-lg p-3 border border-green-400/30">
                    <div className="text-center">
                      <p className="text-green-300 text-xs mb-0.5">Trial Period</p>
                      <p className="text-2xl font-bold text-white mb-0.5">FREE</p>
                      <p className="text-green-200 text-xs">for 36 hours</p>
                      <div className="my-1.5 h-px bg-green-400/30"></div>
                      <p className="text-white text-xs">Then only <span className="font-bold text-sm">$14.99/month</span></p>
                      <p className="text-green-300 text-xs mt-0.5">Cancel anytime</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div>
                  {!submitted ? (
                    <div className="bg-white rounded-xl p-4 shadow-2xl">
                      <h4 className="text-base font-bold text-gray-800 mb-1">
                        Start Your Free Trial
                      </h4>
                      <p className="text-gray-600 text-xs mb-3">
                        Fill out the form and we'll send activation details within 24 hours.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-2">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="John Doe"
                              className="w-full pl-8 pr-2.5 py-1.5 text-xs border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="john@example.com"
                              className="w-full pl-8 pr-2.5 py-1.5 text-xs border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-0.5">
                            Phone Number (Optional)
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="(555) 123-4567"
                              className="w-full pl-8 pr-2.5 py-1.5 text-xs border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-xs rounded-lg hover:from-green-600 hover:to-teal-600 transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-lg"
                        >
                          {loading ? (
                            'Processing...'
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              Start My Free Trial
                            </>
                          )}
                        </button>

                        <p className="text-[10px] text-gray-500 text-center">
                          Your email client will open. Simply send to complete.
                        </p>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-4 shadow-2xl text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-base font-bold text-gray-800 mb-2">
                        Request Submitted!
                      </h4>
                      <p className="text-gray-600 text-xs mb-2">
                        Thank you {name}! Please send the email to complete your free trial request.
                      </p>
                      <p className="text-[10px] text-gray-500 mb-3">
                        We'll send activation details to <strong>{email}</strong> within 24 hours.
                      </p>
                      <button
                        onClick={() => {
                          setSubmitted(false);
                          setName('');
                          setEmail('');
                          setPhone('');
                        }}
                        className="text-green-600 hover:text-green-700 font-medium text-xs"
                      >
                        Submit Another Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-green-500/10 border-t border-green-400/20 p-2 text-center">
              <p className="text-green-200 text-[10px]">
                <strong>Limited Time:</strong> First 100 signups get a bonus month free!
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-center">
          <div>
            <p className="text-xl font-bold text-green-400">22,000+</p>
            <p className="text-green-200 text-xs">TV Channels</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-400">120,000+</p>
            <p className="text-green-200 text-xs">Movies & Shows</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-400">36 Hrs</p>
            <p className="text-green-200 text-xs">Free Trial</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-400">24/7</p>
            <p className="text-green-200 text-xs">Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
