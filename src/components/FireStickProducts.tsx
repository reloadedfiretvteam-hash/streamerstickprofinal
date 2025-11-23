import { Check, Flame, Star, Zap } from 'lucide-react';

interface ProductsProps {
  onSelectProduct: (productId: string, amount: number) => void;
}

export default function FireStickProducts({ onSelectProduct }: ProductsProps) {
  const products = [
    {
      id: 'ai-launchpad-demo',
      name: 'AI LaunchPad Demo & Onboarding',
      price: 0.00,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80',
      badge: 'FREE TRIAL',
      popular: false,
      features: [
        'Instant Onboarding Process',
        'Complete Site Audit',
        'Design Preview & Mockups',
        'SEO Health Check',
        'Performance Analysis',
        'No Credit Card Required',
        'Full Suite Access',
        'Priority Support During Trial',
        'Export Reports',
        'Video Tutorials'
      ]
    },
    {
      id: 'ai-page-builder-1mo',
      name: 'AI Page Builder Pro',
      price: 15.00,
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop&q=80',
      badge: '1 MONTH',
      popular: false,
      features: [
        'Auto-Layout Page Builder',
        'Image Optimization Engine',
        'Built-in Speed Booster',
        'SEO Snippet Editor',
        'Mobile Responsive Templates',
        'A/B Testing Tools',
        'Analytics Integration',
        'Drag & Drop Interface',
        '24/7 Technical Support',
        'Regular Updates'
      ]
    },
    {
      id: 'ai-seo-strategy-3mo',
      name: 'AI SEO Strategy Suite',
      price: 30.00,
      image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c3b6?w=800&h=600&fit=crop&q=80',
      badge: '3 MONTHS',
      popular: true,
      features: [
        'Automated Site Audits',
        'Smart Keyword Research',
        'Content Topic Generator',
        'Traffic Analytics Dashboard',
        'Competitor Gap Analysis',
        'Backlink Monitoring',
        'Rank Tracking (Unlimited Keywords)',
        'Monthly Performance Reports',
        'Priority Email Support',
        'Best Value for Growth'
      ]
    },
    {
      id: 'ai-blog-automation-6mo',
      name: 'AI Blog Automation Engine',
      price: 50.00,
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop&q=80',
      badge: '6 MONTHS',
      popular: false,
      features: [
        'AI-Powered Content Generator',
        'Automatic Publishing Scheduler',
        'Keyword Ranking Reports',
        'Competitor Gap Analysis',
        'Rich Content Suggestions',
        'SEO Optimization Per Post',
        'Social Media Integration',
        'Engagement Analytics',
        'Duplicate Content Checker',
        'Dedicated Account Manager'
      ]
    },
    {
      id: 'ai-local-marketing-12mo',
      name: 'AI Local Marketing Power Pack',
      price: 75.00,
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&q=80',
      badge: '12 MONTHS',
      popular: false,
      features: [
        'Lead Magnet Builder',
        'Review & Reputation Monitoring',
        'Local Keyword Optimizer',
        'Google My Business Insights',
        'Local Citation Builder',
        'Reputation Alert System',
        'Competitor Local Analysis',
        'Monthly Strategy Sessions',
        'Premium Support',
        'Full Year Access'
      ]
    }
  ];

  return (
    <section id="products" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Dramatic Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-16 animate-fade-in">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop&q=80"
              alt="AI-Powered Web Tools"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          </div>

          <div className="relative z-10 px-8 md:px-16 py-16 md:py-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-blue-500/30 backdrop-blur-sm border border-blue-400/50 rounded-full px-6 py-2 mb-6">
                <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
                <span className="text-sm font-bold tracking-wide">AI-POWERED WEB SOLUTIONS</span>
              </div>

              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                Transform Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-400 animate-pulse">
                  Digital Presence
                </span>
                <br />
                with AI Tools
              </h2>

              <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                Powerful AI-driven tools for web design, SEO optimization, content creation, and local marketing. Grow your business online with intelligent automation.
              </p>

              <div className="flex flex-wrap gap-4 text-sm md:text-base">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>AI Page Builder</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>SEO Optimization</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Content Automation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="text-center mb-16 animate-fade-in">
          <h3 className="text-3xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">AI Tool Suite</span>
          </h3>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Every package includes powerful AI-driven features to boost your online presence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up ${
                product.popular ? 'ring-4 ring-orange-500 scale-105 shadow-2xl shadow-orange-500/50' : ''
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {product.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-bounce">
                    <Star className="w-4 h-4 fill-current" />
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="relative h-56 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                  {product.badge}
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{product.name}</h3>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-blue-400">
                      {product.price === 0 ? 'FREE' : `$${product.price.toFixed(2)}`}
                    </span>
                  </div>
                  <p className="text-blue-200 text-sm mt-2">
                    {product.price === 0 ? 'No credit card required' : `${product.badge} access included`}
                  </p>
                </div>

                <button
                  onClick={() => onSelectProduct(product.id, product.price)}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 mb-6 flex items-center justify-center gap-2 ${
                    product.popular
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/50'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  Order Now
                </button>

                <div className="space-y-3">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 group">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5 group-hover:scale-125 transition-transform" />
                      <span className="text-blue-100 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center animate-fade-in animation-delay-800">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-4xl mx-auto border border-white/20">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2">Instant Activation</h4>
                <p className="text-blue-200 text-sm">Start using AI tools immediately after purchase</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2">AI-Powered Quality</h4>
                <p className="text-blue-200 text-sm">Advanced algorithms for superior results</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg mb-2">Expert Support</h4>
                <p className="text-blue-200 text-sm">24/7 technical assistance for all subscribers</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-blue-200">
          ✓ Instant access | ✓ No setup fees | ✓ 30-day money-back guarantee
        </p>
      </div>
    </section>
  );
}
