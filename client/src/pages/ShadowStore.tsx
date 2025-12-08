import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { LayoutGrid, Code, ArrowRight, Check, Star, Users, Award, Globe, Mail, Phone, MapPin, ChevronRight, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

import heroBg from "@assets/stock_images/modern_abstract_digi_3506c264.jpg";

const SUPABASE_URL = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/shadow-store";

const productImages = {
  basic: `${SUPABASE_URL}/professional_web_des_bf1b8ff3.jpg`,
  pro: `${SUPABASE_URL}/professional_web_des_596ca65d.jpg`,
  enterprise: `${SUPABASE_URL}/professional_web_des_a7242567.jpg`,
  seo: `${SUPABASE_URL}/seo_digital_marketin_96956a51.jpg`,
  dev: `${SUPABASE_URL}/web_development_codi_7a6c5037.jpg`,
};

interface ShadowProduct {
  id: string;
  name: string;
  shadowName: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  category: 'design' | 'seo';
  period?: string;
  image?: string;
}

interface SEOPricingTier {
  duration: string;
  durationLabel: string;
  description: string;
  features: string[];
  popular?: boolean;
  prices: { tier: string; tierLabel: string; price: number; productId: string }[];
}

const seoPricingMatrix: SEOPricingTier[] = [
  {
    duration: "1mo",
    durationLabel: "Monthly",
    description: "Monthly SEO maintenance package with keyword tracking and optimization.",
    features: ["Keyword Tracking", "Monthly Report", "Basic Optimization", "Analytics Setup"],
    prices: [
      { tier: "starter", tierLabel: "Starter", price: 15, productId: "iptv-1mo-1d" },
      { tier: "duo", tierLabel: "Duo", price: 25, productId: "iptv-1mo-2d" },
      { tier: "team", tierLabel: "Team", price: 35, productId: "iptv-1mo-3d" },
      { tier: "business", tierLabel: "Business", price: 40, productId: "iptv-1mo-4d" },
      { tier: "enterprise", tierLabel: "Enterprise", price: 45, productId: "iptv-1mo-5d" },
    ],
  },
  {
    duration: "3mo",
    durationLabel: "Quarterly",
    description: "Quarterly SEO package with competitor analysis and content recommendations.",
    features: ["Extended Tracking", "Competitor Analysis", "Content Strategy", "Strategy Calls"],
    popular: true,
    prices: [
      { tier: "starter", tierLabel: "Starter", price: 25, productId: "iptv-3mo-1d" },
      { tier: "duo", tierLabel: "Duo", price: 40, productId: "iptv-3mo-2d" },
      { tier: "team", tierLabel: "Team", price: 55, productId: "iptv-3mo-3d" },
      { tier: "business", tierLabel: "Business", price: 65, productId: "iptv-3mo-4d" },
      { tier: "enterprise", tierLabel: "Enterprise", price: 75, productId: "iptv-3mo-5d" },
    ],
  },
  {
    duration: "6mo",
    durationLabel: "Semi-Annual",
    description: "6-month content marketing program with strategy and link building.",
    features: ["Content Marketing", "Link Building", "Technical Audit", "Bi-Monthly Calls"],
    prices: [
      { tier: "starter", tierLabel: "Starter", price: 40, productId: "iptv-6mo-1d" },
      { tier: "duo", tierLabel: "Duo", price: 65, productId: "iptv-6mo-2d" },
      { tier: "team", tierLabel: "Team", price: 85, productId: "iptv-6mo-3d" },
      { tier: "business", tierLabel: "Business", price: 100, productId: "iptv-6mo-4d" },
      { tier: "enterprise", tierLabel: "Enterprise", price: 125, productId: "iptv-6mo-5d" },
    ],
  },
  {
    duration: "1yr",
    durationLabel: "Annual",
    description: "Full-year digital marketing partnership with dedicated account manager.",
    features: ["Comprehensive Strategy", "Dedicated Manager", "Full Audit", "Priority Support"],
    prices: [
      { tier: "starter", tierLabel: "Starter", price: 65, productId: "iptv-1yr-1d" },
      { tier: "duo", tierLabel: "Duo", price: 100, productId: "iptv-1yr-2d" },
      { tier: "team", tierLabel: "Team", price: 140, productId: "iptv-1yr-3d" },
      { tier: "business", tierLabel: "Business", price: 190, productId: "iptv-1yr-4d" },
      { tier: "enterprise", tierLabel: "Enterprise", price: 220, productId: "iptv-1yr-5d" },
    ],
  },
];

const shadowProducts: ShadowProduct[] = [
  {
    id: "fs-hd",
    name: "Basic Web Design",
    shadowName: "Web Design Basic",
    price: 140,
    description: "Perfect for personal blogs, portfolios, and small business landing pages. Includes responsive design and basic SEO setup.",
    features: ["5 Custom Pages", "Mobile Responsive", "Contact Form Integration", "Basic SEO Setup", "1 Round of Revisions", "2 Week Delivery"],
    category: 'design',
    period: "/project",
    image: productImages.basic
  },
  {
    id: "fs-4k",
    name: "Professional Web Design",
    shadowName: "Web Design Pro",
    price: 150,
    description: "Ideal for growing businesses. Full-featured website with CMS integration, advanced SEO, and premium support.",
    features: ["10 Custom Pages", "CMS Integration", "Advanced SEO Package", "Social Media Integration", "Analytics Dashboard", "3 Rounds of Revisions", "Priority Support"],
    category: 'design',
    popular: true,
    period: "/project",
    image: productImages.pro
  },
  {
    id: "fs-max",
    name: "Enterprise Web Application",
    shadowName: "Web Design Enterprise",
    price: 160,
    description: "Full-scale custom web application for enterprises. Includes e-commerce capabilities, custom integrations, and dedicated support.",
    features: ["Unlimited Pages", "E-commerce Ready", "Custom API Integration", "Database Design", "Cloud Architecture", "Ongoing Support", "Source Code Ownership"],
    category: 'design',
    period: "/project",
    image: productImages.enterprise
  },
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    company: "Mitchell & Co. Law Firm",
    text: "WebFlow Design transformed our outdated website into a modern, professional platform. Our client inquiries increased by 40% within the first month!",
    rating: 5,
    image: "SM"
  },
  {
    name: "David Chen",
    company: "TechStart Solutions",
    text: "The team delivered exactly what we needed - a sleek, fast website that converts visitors into customers. Highly recommend their Professional package.",
    rating: 5,
    image: "DC"
  },
  {
    name: "Emily Rodriguez",
    company: "Bloom Wellness Spa",
    text: "From design to launch, the process was seamless. Our new site perfectly captures our brand and our online bookings have doubled.",
    rating: 5,
    image: "ER"
  }
];

const portfolioItems = [
  { name: "E-Commerce Platform", category: "Web Design", description: "Full-featured online store with payment integration" },
  { name: "SaaS Dashboard", category: "Web Application", description: "Analytics dashboard for a tech startup" },
  { name: "Restaurant Website", category: "Web Design", description: "Modern restaurant site with online ordering" },
  { name: "Real Estate Portal", category: "Web Application", description: "Property listing platform with search" },
];

interface SelectedSEOProduct {
  productId: string;
  name: string;
  price: number;
  duration: string;
  tier: string;
}

export default function ShadowStore() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<ShadowProduct | null>(null);
  const [selectedSEOProduct, setSelectedSEOProduct] = useState<SelectedSEOProduct | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTiers, setSelectedTiers] = useState<Record<string, string>>({
    "1mo": "starter",
    "3mo": "starter",
    "6mo": "starter",
    "1yr": "starter",
  });

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("shadow-theme");
    document.title = "Digital Solutions Agency | Web Design & SEO Services";
    return () => {
       document.documentElement.classList.remove("shadow-theme");
       document.documentElement.classList.add("dark");
       document.title = "StreamStickPro - Jailbroken Fire Sticks & IPTV";
    }
  }, []);

  const handleSelectPlan = (product: ShadowProduct) => {
    setSelectedProduct(product);
    setShowCheckout(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckout = async () => {
    const productId = selectedProduct?.id || selectedSEOProduct?.productId;
    if (!productId || !email || !name) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and email to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId, quantity: 1 }],
          customerEmail: email,
          customerName: name
        })
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      toast({
        title: "Checkout Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSEOPlan = (plan: SEOPricingTier) => {
    const tier = selectedTiers[plan.duration];
    const priceInfo = plan.prices.find(p => p.tier === tier) || plan.prices[0];
    setSelectedSEOProduct({
      productId: priceInfo.productId,
      name: `SEO ${priceInfo.tierLabel} ${plan.durationLabel}`,
      price: priceInfo.price,
      duration: plan.duration,
      tier: priceInfo.tier,
    });
    setSelectedProduct(null);
    setShowCheckout(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const designProducts = shadowProducts.filter(p => p.category === 'design');

  if (showCheckout && (selectedProduct || selectedSEOProduct)) {
    const productName = selectedProduct?.name || selectedSEOProduct?.name || "";
    const productSubtitle = selectedProduct?.shadowName || `${selectedSEOProduct?.tier} tier - ${selectedSEOProduct?.duration}`;
    const productPrice = selectedProduct?.price || selectedSEOProduct?.price || 0;

    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-xl text-primary cursor-pointer" onClick={() => { setShowCheckout(false); setSelectedProduct(null); setSelectedSEOProduct(null); }}>
              <LayoutGrid className="w-6 h-6" />
              <span>WebFlow Design</span>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Complete Your Order</h1>
              <p className="text-muted-foreground">You're one step away from your new {selectedSEOProduct ? 'SEO package' : 'website'}</p>
            </div>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b">
                  <div>
                    <h3 className="font-semibold">{productName}</h3>
                    <p className="text-sm text-muted-foreground">{productSubtitle}</p>
                  </div>
                  <div className="text-2xl font-bold">${productPrice}</div>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input 
                      placeholder="John Smith"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-testid="input-checkout-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input 
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-checkout-email"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button 
                    className="w-full h-12 text-lg"
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    data-testid="button-checkout-submit"
                  >
                    {isProcessing ? "Processing..." : `Pay $${productPrice}`}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => { setShowCheckout(false); setSelectedProduct(null); setSelectedSEOProduct(null); }}
                  >
                    ← Back to Packages
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-4 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Instant Confirmation</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xl text-primary">
            <LayoutGrid className="w-6 h-6" />
            <span>WebFlow Design</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#services" className="hover:text-primary transition-colors">Services</a>
            <a href="#portfolio" className="hover:text-primary transition-colors">Portfolio</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </div>

          <Button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
            Get Started
          </Button>
        </div>
      </nav>

      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-10">
          <img src={heroBg} className="w-full h-full object-cover" alt="Digital background" loading="eager" width={1920} height={600} fetchPriority="high" />
        </div>
        
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5">
              Award-Winning Web Design Agency 2025
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Digital Experiences <br/>
              <span className="text-primary">That Drive Growth</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We build high-performance websites, SEO strategies, and digital campaigns 
              that transform businesses. Over 500+ successful projects delivered worldwide.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                View Packages <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}>
                Our Portfolio
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 pt-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm">500+ Clients</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="text-sm">Award Winning</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm">Worldwide Service</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="services" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From stunning websites to comprehensive SEO strategies, we provide everything your business needs to succeed online.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <MonitorIcon />
                </div>
                <CardTitle>Web Design</CardTitle>
                <CardDescription>Responsive, modern websites built with the latest technologies.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> Custom UI/UX Design</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> Mobile-First Responsive</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> SEO Optimized Structure</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> Fast Loading Performance</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <SearchIcon />
                </div>
                <CardTitle>SEO & Marketing</CardTitle>
                <CardDescription>Rank higher and drive more organic traffic to your site.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> Keyword Research & Strategy</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> On-Page Optimization</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> Content Strategy</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> Monthly Analytics Reports</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Code />
                </div>
                <CardTitle>Custom Development</CardTitle>
                <CardDescription>Tailored solutions for complex business requirements.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> Custom Web Applications</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> API & Integration Development</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> Database Architecture</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary flex-shrink-0"/> Cloud Infrastructure</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="portfolio" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Portfolio</h2>
            <p className="text-muted-foreground">A selection of our recent work across various industries.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portfolioItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-muted rounded-xl p-6 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg mb-4 flex items-center justify-center">
                  <Globe className="w-12 h-12 text-primary/50" />
                </div>
                <Badge variant="secondary" className="mb-2">{item.category}</Badge>
                <h3 className="font-semibold mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-muted-foreground">Choose the package that fits your business needs. No hidden fees.</p>
          </div>

          <h3 className="text-xl font-semibold mb-6 text-center">Web Design Packages</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {designProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className={`border rounded-2xl p-8 bg-background hover:border-primary transition-all cursor-pointer relative ${
                  product.popular ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => handleSelectPlan(product)}
                data-testid={`card-product-${product.id}`}
              >
                {product.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">
                    MOST POPULAR
                  </div>
                )}
                {product.image && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-4 -mx-2">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  ${product.price}
                  <span className="text-base font-normal text-muted-foreground">{product.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{product.description}</p>
                <Button 
                  className={`w-full mb-6 ${product.popular ? '' : 'variant-outline'}`}
                  variant={product.popular ? 'default' : 'outline'}
                  data-testid={`button-select-${product.id}`}
                >
                  Select Plan <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          
          <h3 className="text-xl font-semibold mb-6 text-center">SEO & Marketing Packages</h3>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose your package duration and tier. Higher tiers include more keywords, pages, and dedicated support.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {seoPricingMatrix.map((plan) => {
              const currentTier = selectedTiers[plan.duration];
              const currentPrice = plan.prices.find(p => p.tier === currentTier)?.price || plan.prices[0].price;
              
              return (
                <motion.div
                  key={plan.duration}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className={`border rounded-2xl p-6 bg-background relative ${
                    plan.popular ? 'border-primary ring-2 ring-primary/20' : ''
                  }`}
                  data-testid={`card-seo-${plan.duration}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">
                      POPULAR
                    </div>
                  )}
                  <h4 className="text-lg font-semibold mb-1">{plan.durationLabel}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold mb-2">
                      ${currentPrice}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.duration === "1mo" ? "mo" : plan.duration}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground block mb-2">Select Tier</label>
                    <div className="grid grid-cols-5 gap-1">
                      {plan.prices.map((priceInfo) => (
                        <button
                          key={priceInfo.tier}
                          onClick={() => setSelectedTiers(prev => ({ ...prev, [plan.duration]: priceInfo.tier }))}
                          className={`py-2 px-1 text-xs rounded-md transition-all ${
                            currentTier === priceInfo.tier
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                          title={`${priceInfo.tierLabel} - $${priceInfo.price}`}
                          data-testid={`button-tier-${plan.duration}-${priceInfo.tier}`}
                        >
                          {priceInfo.tierLabel.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-center text-muted-foreground mt-2">
                      {plan.prices.find(p => p.tier === currentTier)?.tierLabel} tier
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mb-4"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSelectSEOPlan(plan)}
                    data-testid={`button-select-seo-${plan.duration}`}
                  >
                    Select Plan <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground">Don't just take our word for it - hear from our satisfied clients.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {testimonial.image}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to Transform Your Online Presence?</h2>
              <p className="text-primary-foreground/80">Get started today and see results within weeks.</p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" variant="secondary" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                View Pricing
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
              <p className="text-muted-foreground">Have a project in mind? We'd love to hear from you.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-muted-foreground text-sm">hello@webflowdesign.com</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-muted-foreground text-sm">+1 (555) 123-4567</p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-semibold mb-2">Visit Us</h3>
                <p className="text-muted-foreground text-sm">123 Design Street, NY 10001</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-muted text-muted-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-semibold text-xl text-primary mb-4">
                <LayoutGrid className="w-5 h-5" />
                <span>WebFlow Design</span>
              </div>
              <p className="text-sm">Creating digital masterpieces for modern brands since 2018.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Services</h4>
              <ul className="space-y-2 text-sm">
                <li>Web Design</li>
                <li>SEO Services</li>
                <li>Custom Development</li>
                <li>E-commerce Solutions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>About Us</li>
                <li>Our Team</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Cookie Policy</li>
                <li>Refund Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm">
            <p>© 2025 WebFlow Design Agency. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MonitorIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function SearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
