import { useState } from 'react';
import { Gift, Check, Mail, User, Phone, Send, Sparkles, MapPin, Globe, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FreeTrialProduct() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('United States');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany',
    'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland',
    'Mexico', 'Brazil', 'Argentina', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !address || !country) {
      alert('Please fill in all required fields (Name, Email, Phone, Address, Country)');
      return;
    }

    setLoading(true);

    try {
      const fullAddress = `${address}, ${city}, ${state} ${zip}`.trim();
      
      // Save to database
      await supabase
        .from('email_captures')
        .insert([{
          email: email,
          name: name,
          phone: phone,
          source: 'free-trial-signup',
          metadata: { 
            product: 'Free Trial - IPTV Subscription',
            country: country,
            address: fullAddress,
            message: message || null
          }
        }]);

      // Send email via backend (Supabase Edge Function)
      const { error: emailError } = await supabase.functions.invoke('send-order-emails', {
        body: {
          orderCode: `TRIAL-${Date.now().toString().slice(-8)}`,
          customerEmail: email,
          customerName: name,
          customerPhone: phone,
          shippingAddress: fullAddress,
          country: country,
          message: message || 'No additional message',
          totalUsd: 0,
          paymentMethod: 'Free Trial',
          products: [{
            name: 'Free Trial - 36 Hours IPTV Access',
            price: 0,
            quantity: 1
          }],
          adminEmail: 'reloadedfiretvteam@gmail.com',
          isTrial: true
        }
      });

      if (emailError) {
        console.error('Email error:', emailError);
        throw emailError;
      }

      setSubmitted(true);

    } catch (error) {
      console.error('Error:', error);
      alert('Submission error. Please try again or email us directly at reloadedfiretvteam@gmail.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-green-900 via-teal-900 to-green-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-2 mb-6 animate-pulse">
            <Gift className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium">LIMITED TIME OFFER</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Try <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">FREE</span> for 36 Hours!
          </h2>

          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            No credit card required. Experience everything our premium IPTV service has to offer completely free.
          </p>
        </div>

        {/* Free Trial Product Box */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border-2 border-green-400 shadow-2xl transform hover:scale-105 transition-all duration-300">
            {/* Badge */}
            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white text-center py-2 font-bold text-base relative">
              <Sparkles className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 animate-spin" />
              100% FREE - NO PAYMENT REQUIRED
              <Sparkles className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-6">
                {/* Product Info */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    36-Hour Free Trial
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold text-sm">22,000+ Live TV Channels</p>
                        <p className="text-green-200 text-xs">All premium channels included</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold text-sm">120,000+ Movies & Shows</p>
                        <p className="text-green-200 text-xs">Full on-demand library</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold text-sm">All Sports & PPV Events</p>
                        <p className="text-green-200 text-xs">NFL, NBA, MLB, NHL, UFC & more</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold text-sm">4K Ultra HD Quality</p>
                        <p className="text-green-200 text-xs">Crystal clear streaming</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold text-sm">Works on All Devices</p>
                        <p className="text-green-200 text-xs">Fire Stick, Smart TV, Phone, Tablet</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold text-sm">24/7 Customer Support</p>
                        <p className="text-green-200 text-xs">We're here to help anytime</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-semibold text-sm">No Credit Card Required</p>
                        <p className="text-green-200 text-xs">Truly free, no hidden fees</p>
                      </div>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/30">
                    <div className="text-center">
                      <p className="text-green-300 text-xs mb-1">Trial Period</p>
                      <p className="text-3xl font-bold text-white mb-1">FREE</p>
                      <p className="text-green-200 text-xs">for 36 hours</p>
                      <div className="my-2 h-px bg-green-400/30"></div>
                      <p className="text-white text-xs">Then only <span className="font-bold text-base">$14.99/month</span></p>
                      <p className="text-green-300 text-xs mt-1">Cancel anytime, no commitment</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div>
                  {!submitted ? (
                    <div className="bg-white rounded-xl p-6 shadow-2xl">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">
                        Start Your Free Trial
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Fill out the form below and we'll send you activation details within 24 hours.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Name */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="John Doe"
                              className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="john@example.com"
                              className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="(555) 123-4567"
                              className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Street Address *
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              required
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="123 Main Street"
                              className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                        </div>

                        {/* City, State, Zip */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              City
                            </label>
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="City"
                              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              State
                            </label>
                            <input
                              type="text"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              placeholder="ST"
                              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            value={zip}
                            onChange={(e) => setZip(e.target.value)}
                            placeholder="12345"
                            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900"
                          />
                        </div>

                        {/* Country */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Country *
                          </label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                              required
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900 appearance-none"
                            >
                              {countries.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Additional Message (Optional)
                          </label>
                          <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Any special requests or questions?"
                              rows={3}
                              className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition text-gray-900 resize-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold text-sm rounded-lg hover:from-green-600 hover:to-teal-600 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                        >
                          {loading ? (
                            'Processing...'
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Start My Free Trial Now
                            </>
                          )}
                        </button>

                        <p className="text-xs text-gray-500 text-center">
                          By clicking the button, we'll send your activation details to your email within 24 hours.
                        </p>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-6 shadow-2xl text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Check className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-3">
                        Request Submitted!
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Thank you {name}! Your free trial request has been received.
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        We'll send your activation details to <strong>{email}</strong> within 24 hours.
                      </p>
                      <button
                        onClick={() => {
                          setSubmitted(false);
                          setName('');
                          setEmail('');
                          setPhone('');
                          setAddress('');
                          setCity('');
                          setState('');
                          setZip('');
                          setCountry('United States');
                          setMessage('');
                        }}
                        className="text-green-600 hover:text-green-700 font-medium text-sm"
                      >
                        Submit Another Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="bg-green-500/10 border-t border-green-400/20 p-3 text-center">
              <p className="text-green-200 text-xs">
                ⚡ <strong>Limited Time:</strong> First 100 signups get a bonus month free after trial ends!
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-green-400">22,000+</p>
            <p className="text-green-200 text-sm">TV Channels</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-400">120,000+</p>
            <p className="text-green-200 text-sm">Movies & Shows</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-400">100%</p>
            <p className="text-green-200 text-sm">Free Trial</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-400">24/7</p>
            <p className="text-green-200 text-sm">Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}
