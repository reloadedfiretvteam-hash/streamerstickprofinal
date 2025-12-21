import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'What is IPTV and how does it work?',
      answer: 'IPTV (Internet Protocol Television) delivers TV content through your internet connection instead of traditional cable or satellite. You simply need a stable internet connection and a compatible device to start streaming thousands of channels and on-demand content.',
    },
    {
      question: 'What devices are compatible with your service?',
      answer: 'Our IPTV service works on virtually all devices including Smart TVs (Samsung, LG, Sony), Android TV, Fire Stick, Fire TV, Apple TV, iPhone, iPad, Android phones/tablets, Windows PC, Mac, MAG boxes, Formuler, and more. If it connects to the internet, it likely works with our service.',
    },
    {
      question: 'Do I need special equipment or a technician to install?',
      answer: 'No special equipment or technician needed! Setup is simple and takes just a few minutes. We provide easy-to-follow setup guides for all devices. Plus, our customer support is available 24/7 if you need any assistance.',
    },
    {
      question: 'What channels and content do you offer?',
      answer: 'We offer 22,000+ live TV channels from around the world, including all major US, UK, and international channels. Plus 120,000+ movies and series on-demand, all sports channels including NFL, NBA, MLB, NHL, UFC, boxing, soccer, and international sports. Content is available in multiple languages.',
    },
    {
      question: 'What internet speed do I need?',
      answer: 'For SD quality: minimum 5 Mbps, HD quality: minimum 10 Mbps, and 4K quality: minimum 25 Mbps. Most modern internet connections easily meet these requirements. We recommend a stable connection for the best experience.',
    },
    {
      question: 'Is your service legal and safe?',
      answer: 'We operate as a legitimate IPTV service provider. We recommend customers ensure they comply with local regulations regarding streaming services. Our service uses secure connections to protect your privacy and data.',
    },
    {
      question: 'Can I use my subscription on multiple devices?',
      answer: 'Yes! Your subscription allows you to use the service on multiple devices, though the number of simultaneous streams may vary by plan. Contact us to discuss your specific needs for multi-device or multi-connection requirements.',
    },
    {
      question: 'What if I experience buffering or technical issues?',
      answer: 'We use anti-freeze technology and maintain 99.9% uptime. If you experience any issues, our 24/7 customer support team is ready to help. Most issues are quickly resolved through simple troubleshooting steps we\'ll guide you through.',
    },
    {
      question: 'Do you offer a free trial or money-back guarantee?',
      answer: 'Yes! We offer a 36-hour free trial on all plans. Experience our premium IPTV service completely free for 36 hours with full access to all features - no credit card required.',
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel anytime by contacting our customer support team. There are no long-term contracts or cancellation fees. We believe in earning your business every month with great service, not trapping you in contracts.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods for your convenience. Contact our sales team to discuss available payment options for your region and preferences.',
    },
    {
      question: 'Will this work in my country?',
      answer: 'Our service works worldwide as long as you have a stable internet connection. We have customers in over 100 countries enjoying our service. VPN use is compatible if needed for your location.',
    },
  ];

  // Add FAQ Schema to head
  useEffect(() => {
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };

    // Remove existing FAQ schema if present
    const existingScript = document.querySelector('script[data-faq-schema="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new FAQ schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-faq-schema', 'true');
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-faq-schema="true"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-gray-50" id="faq">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* SEO-optimized header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions About IPTV & Fire Stick
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our IPTV subscription service and jailbroken Fire Stick devices
            </p>
          </div>

          <div className="space-y-4" itemScope itemType="https://schema.org/FAQPage">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4" itemProp="name">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-200 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <div className="px-6 pb-5 pt-2">
                    <p className="text-gray-600 leading-relaxed" itemProp="text">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-white rounded-xl p-8 shadow-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h3>
            <p className="text-gray-600 mb-6">
              Our customer support team is available 24/7 to help you with any questions or concerns.
            </p>
            <button
              onClick={() => {
                const event = new CustomEvent('openContactModal');
                window.dispatchEvent(event);
              }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
