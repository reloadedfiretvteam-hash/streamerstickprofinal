import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Monitor, ShoppingCart, Tv, Zap, MessageCircle, CheckCircle, Star, Shield } from "lucide-react";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SportsCarousel } from "@/components/SportsCarousel";
import { ExitPopup } from "@/components/ExitPopup";

import firestickImg from "@assets/stock_images/amazon_fire_tv_stick_cc445778.jpg";
import iptvImg from "@assets/stock_images/smart_tv_interface_w_e1379ac8.jpg";

const products = [
  {
    id: "fs-hd",
    name: "Fire Stick HD",
    price: 140,
    description: "Perfect for standard HD TVs. Jailbroken + 1 Year IPTV included.",
    features: ["1080p Streaming", "Jailbroken", "1 Year Service", "Plug & Play"],
    image: firestickImg,
    category: "firestick",
    badge: "Best Value"
  },
  {
    id: "fs-4k",
    name: "Fire Stick 4K",
    price: 150,
    description: "Crystal clear 4K Ultra HD streaming. Jailbroken + 1 Year IPTV.",
    features: ["4K Ultra HD", "Dolby Vision", "Faster Processor", "1 Year Service"],
    image: firestickImg,
    category: "firestick",
    badge: "Popular"
  },
  {
    id: "fs-max",
    name: "Fire Stick 4K Max",
    price: 160,
    description: "Our most powerful stick. Wi-Fi 6 support. Jailbroken + 1 Year IPTV.",
    features: ["Wi-Fi 6", "Fastest Streaming", "4K Ultra HD", "1 Year Service"],
    image: firestickImg,
    category: "firestick",
    badge: "Ultimate"
  },
  {
    id: "iptv-1",
    name: "IPTV Monthly",
    price: 15,
    description: "1 Month of premium channels. No contract.",
    features: ["4000+ Channels", "Sports Packages", "VOD Library", "HD Quality"],
    image: iptvImg,
    category: "iptv",
    badge: "Flexible"
  },
  {
    id: "iptv-3",
    name: "IPTV Quarterly",
    price: 25,
    description: "3 Months of service. Save money.",
    features: ["Save $20", "All Channels", "PPV Events", "Multi-device"],
    image: iptvImg,
    category: "iptv",
    badge: "Saver"
  },
  {
    id: "iptv-12",
    name: "IPTV Annual",
    price: 75,
    description: "1 Full Year of service. Best deal.",
    features: ["Best Value", "Priority Support", "4K Content", "Anti-Freeze Tech"],
    image: iptvImg,
    category: "iptv",
    badge: "Best Deal"
  }
];

export default function MainStore() {
  const [location, setLocation] = useLocation();
  const { addItem, items, toggleCart, isOpen } = useCart();

  // Force dark mode for this page
  useEffect(() => {
    document.documentElement.classList.remove("shadow-theme");
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <Zap className="w-6 h-6 text-primary" />
            <span>STREAMER<span className="text-primary">PRO</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:flex">How It Works</Button>
            <Button variant="ghost" className="hidden md:flex">Channels</Button>
            <Button variant="ghost" className="hidden md:flex">Support</Button>
            <Button 
              onClick={() => setLocation("/checkout")} 
              className="relative bg-primary hover:bg-primary/90 text-white"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {items.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-white text-black hover:bg-gray-200">
                  {items.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background z-0 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none mb-4">
                NEW: 2025 Models Available
              </Badge>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Unlock Your TV's <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                  Full Potential
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
                Get access to thousands of channels, movies, and sports events. 
                Plug & Play ready devices with 1 Year of premium service included.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" className="text-lg px-8 bg-primary hover:bg-primary/90">
                  Shop Devices
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 border-white/20 hover:bg-white/10">
                  Get Free Trial
                </Button>
              </div>
              
              <div className="flex items-center gap-6 justify-center md:justify-start pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> 4K Support
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> No Contracts
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> 24/7 Support
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10"
              >
                <img 
                  src={iptvImg} 
                  alt="Interface" 
                  className="rounded-xl shadow-2xl border border-white/10 w-full max-w-lg mx-auto transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500"
                />
              </motion.div>
              {/* Decor elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/30 blur-[100px] rounded-full -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Whether you need a new device or just the service, we have you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {products.filter(p => p.category === 'firestick').map((product) => (
              <Card key={product.id} className="bg-card border-white/10 overflow-hidden relative group hover:border-primary/50 transition-colors">
                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                  {product.badge}
                </div>
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription className="text-base">{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-6">${product.price}</div>
                  <ul className="space-y-2 mb-6">
                    {product.features?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary" /> {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => addItem(product as any)} className="w-full bg-primary hover:bg-primary/90">
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Sports Carousel Inserted Here */}
          <SportsCarousel />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
             {products.filter(p => p.category === 'iptv').map((product) => (
              <Card key={product.id} className="bg-card border-white/10 relative group hover:border-primary/50 transition-colors">
                 <div className="absolute top-0 right-0 bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                  {product.badge}
                </div>
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="text-3xl font-bold mb-6">${product.price}</div>
                   <ul className="space-y-2">
                    {product.features?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="w-4 h-4 text-primary" /> {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                 <CardFooter>
                  <Button onClick={() => addItem(product as any)} variant="secondary" className="w-full hover:bg-white/20">
                    Subscribe Now
                  </Button>
                </CardFooter>
              </Card>
             ))}
          </div>

        </div>
      </section>

      {/* FAQ / Support */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-white/10">
              <AccordionTrigger>Is this legal?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We provide hardware modification services and access to public streams. It is the user's responsibility to ensure compliance with local laws.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/10">
              <AccordionTrigger>How do I renew?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Simply come back to the site and purchase a renewal package. Your credentials will be updated instantly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/10">
              <AccordionTrigger>Do you offer support?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, we offer 24/7 support via email and live chat for all active subscribers.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Floating Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="rounded-full w-14 h-14 shadow-lg bg-green-500 hover:bg-green-600 animate-pulse">
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-black">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2025 StreamerPro. All rights reserved.</p>
        </div>
      </footer>

      {/* Exit Intent Popup */}
      <ExitPopup />
    </div>
  );
}
