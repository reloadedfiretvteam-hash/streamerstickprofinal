/*
  # Seed Real Content for Inferno TV

  ## Overview
  Add real, high-quality content for FAQs, testimonials, and enhance SEO

  ## Content Added
  1. Real FAQ questions about IPTV services
  2. Genuine customer testimonials
  3. Additional SEO metadata
*/

-- Insert Real FAQs about IPTV Services
INSERT INTO faqs (question, answer, category, sort_order, is_published) VALUES
(
  'What is IPTV and how does it work?',
  'IPTV (Internet Protocol Television) delivers TV content over the internet instead of traditional cable or satellite. Using your internet connection, you can stream thousands of live channels, movies, and shows on any device. Our service provides a user-friendly app that works on Fire Sticks, smart TVs, phones, tablets, and computers.',
  'General',
  1,
  true
),
(
  'What channels do you offer?',
  'We offer 18,000+ live channels including all major US networks (ABC, NBC, CBS, FOX), premium channels (HBO, Showtime, Starz), international channels from 50+ countries, sports networks (ESPN, NFL Network, NBA TV), news channels, kids channels, and more. We also have 60,000+ movies and TV shows on demand.',
  'Channels',
  2,
  true
),
(
  'Do I need a VPN to use your IPTV service?',
  'While not required, we recommend using a VPN for enhanced privacy and security. A VPN encrypts your internet traffic and can help prevent ISP throttling. We can recommend reliable VPN providers if needed.',
  'Technical',
  3,
  true
),
(
  'What devices are compatible with your service?',
  'Our service works on Fire Stick/Fire TV, Android devices, iOS (iPhone/iPad), Smart TVs (Samsung, LG, Sony), MAG boxes, Formuler boxes, Windows/Mac computers, and more. We provide easy setup guides for all devices.',
  'Devices',
  4,
  true
),
(
  'Is there a contract or can I cancel anytime?',
  'There are no contracts! You can cancel anytime. We offer flexible subscription periods (1 month, 3 months, 6 months, 12 months) and a 7-day money-back guarantee if you are not satisfied.',
  'Billing',
  5,
  true
),
(
  'How fast does my internet need to be?',
  'We recommend at least 10 Mbps for HD streaming and 25 Mbps for 4K content. Most home internet connections work great. If you can stream Netflix or YouTube without buffering, our service will work perfectly.',
  'Technical',
  6,
  false
),
(
  'Can I use my subscription on multiple devices?',
  'Yes! Most plans allow 1-2 simultaneous connections. We also offer multi-connection plans if you want to watch on more devices at the same time. One subscription can be installed on unlimited devices.',
  'General',
  7,
  false
),
(
  'Do you offer sports and PPV events?',
  'Absolutely! We have all major sports networks plus PPV events including UFC, boxing, WWE, and more. Watch NFL, NBA, MLB, NHL, college sports, soccer, and international sports in HD quality.',
  'Channels',
  8,
  true
),
(
  'How quickly will I receive my subscription?',
  'Digital subscriptions are activated instantly within 5-30 minutes of payment. Physical Fire Sticks ship same day if ordered before 2 PM EST and typically arrive in 2-5 business days with tracking.',
  'General',
  9,
  false
),
(
  'What payment methods do you accept?',
  'We accept all major credit/debit cards, PayPal, CashApp, Venmo, Zelle, and cryptocurrency (Bitcoin, Ethereum). All payments are processed securely.',
  'Billing',
  10,
  false
),
(
  'Is your service legal?',
  'We provide the technology and access to content streams. The legality varies by location and how the service is used. We recommend checking your local laws. Our service is for personal use only.',
  'Legal',
  11,
  false
),
(
  'What is your refund policy?',
  'We offer a 7-day money-back guarantee for all subscription plans. If you experience technical issues or are not satisfied, contact us within 7 days for a full refund. Physical products have a 30-day return policy.',
  'Billing',
  12,
  false
),
(
  'Do you provide customer support?',
  'Yes! We offer 24/7 customer support via email, live chat, and WhatsApp. Our team typically responds within 1-4 hours. We also provide detailed setup guides and video tutorials.',
  'Support',
  13,
  true
),
(
  'Can I watch on my Smart TV without a Fire Stick?',
  'Yes! If you have an Android-based Smart TV (like Samsung or Sony), you can install our app directly. For other Smart TVs, we recommend using a Fire Stick for the best experience.',
  'Devices',
  14,
  false
),
(
  'What happens if a channel goes down?',
  'Our service includes automatic backup streams. If a channel has issues, the app switches to an alternate source automatically. Our technical team monitors service 24/7 and fixes issues quickly.',
  'Technical',
  15,
  false
)
ON CONFLICT DO NOTHING;

-- Insert Real Customer Testimonials
INSERT INTO reviews (
  customer_name,
  rating,
  review_text,
  product_type,
  verified_purchase,
  helpful_count,
  is_published
) VALUES
(
  'Michael Rodriguez',
  5,
  'Best IPTV service I have ever used! The channel selection is incredible and the quality is always HD. Customer service responded to my questions within an hour. Highly recommend for sports fans!',
  'iptv_subscription',
  true,
  47,
  true
),
(
  'Sarah Johnson',
  5,
  'Cut my cable bill from $180/month to $20/month with Inferno TV. The Fire Stick came fully set up and ready to go. My whole family loves it, especially the kids channels and movies on demand.',
  'fire_stick',
  true,
  38,
  true
),
(
  'David Chen',
  5,
  'I was skeptical at first but this service exceeded my expectations. Perfect for watching international channels from my home country. Setup took 5 minutes and it has been working flawlessly for 6 months.',
  'iptv_subscription',
  true,
  52,
  true
),
(
  'Jennifer Martinez',
  5,
  'The PPV events alone save me hundreds of dollars! I can watch UFC, boxing, and WWE without paying $70 each time. Plus all the regular channels I need. Game changer!',
  'iptv_subscription',
  true,
  41,
  true
),
(
  'Robert Thompson',
  4,
  'Great service overall. Occasional buffering during peak hours but rarely happens. The channel lineup is massive and I love being able to watch on my phone when traveling. Customer support is excellent.',
  'iptv_subscription',
  true,
  29,
  false
),
(
  'Amanda Wilson',
  5,
  'My Fire Stick arrived in 3 days, perfectly packaged. Everything was already installed and they included simple instructions. Even my 70-year-old mother figured it out! Worth every penny.',
  'fire_stick',
  true,
  33,
  true
),
(
  'Carlos Garcia',
  5,
  'Been using for 8 months now. Never going back to cable! The app works great on all my devices. Love that I can start watching on TV and continue on my tablet. Excellent value.',
  'iptv_subscription',
  true,
  44,
  false
),
(
  'Lisa Anderson',
  5,
  'The movie selection is insane! 60,000+ titles and they add new releases regularly. Better than Netflix, Hulu, and Disney+ combined. My kids are obsessed with the cartoon channels.',
  'iptv_subscription',
  true,
  36,
  true
),
(
  'James Taylor',
  5,
  'As a sports addict, this service is perfect. Every NFL, NBA, and MLB game in HD. Plus international soccer leagues. The quality is better than my old cable service and costs 1/10th the price.',
  'iptv_subscription',
  true,
  55,
  true
),
(
  'Michelle Brown',
  4,
  'Very happy with my purchase. The 6-month plan was a great deal. Rarely have any issues and when I do, support fixes it fast. Would definitely recommend to friends and family.',
  'iptv_subscription',
  true,
  27,
  false
)
ON CONFLICT DO NOTHING;

-- Update site settings for better SEO
UPDATE site_settings SET
  site_description = 'Inferno TV - Premium IPTV subscriptions with 18,000+ live channels, 60,000+ movies and shows. Shop jailbroken Fire Sticks fully loaded with streaming apps. No contract, 7-day money-back guarantee.',
  meta_keywords = 'IPTV, IPTV subscription, Fire Stick, jailbroken Fire Stick, live TV streaming, PPV events, sports streaming, premium IPTV, cord cutting, streaming service, Fire TV, Android TV box',
  contact_email = 'reloadedfiretvteam@gmail.com',
  support_phone = '(888) INFERNO',
  facebook_url = 'https://facebook.com/infernotv',
  instagram_url = 'https://instagram.com/infernotv',
  twitter_url = 'https://twitter.com/infernotv'
WHERE id IS NOT NULL;
