import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { LayoutGrid, Smartphone, Code, ArrowRight, Check, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import heroBg from "@assets/stock_images/modern_abstract_digi_3506c264.jpg";

export default function ShadowStore() {
  const [location, setLocation] = useLocation();

  // Force light/shadow theme for this page
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("shadow-theme");
    return () => {
       // Cleanup when leaving
       document.documentElement.classList.remove("shadow-theme");
       document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Corporate Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xl text-primary">
            <LayoutGrid className="w-6 h-6" />
            <span>WebFlow Design</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Services</a>
            <a href="#" className="hover:text-primary transition-colors">Portfolio</a>
            <a href="#" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#" className="hover:text-primary transition-colors">About</a>
          </div>

          <Button>Get a Quote</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-10">
            <img src={heroBg} className="w-full h-full object-cover" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Badge variant="outline" className="px-4 py-1 text-primary border-primary/20 bg-primary/5">
              Award Winning Agency 2025
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Digital Experiences <br/>
              <span className="text-primary">That Drive Growth</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We build high-performance websites, SEO strategies, and digital campaigns 
              that transform businesses. Professional web design starting at $140.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8">View Packages</Button>
              <Button size="lg" variant="outline" className="h-12 px-8">Our Portfolio</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <MonitorIcon />
                </div>
                <CardTitle>Web Design</CardTitle>
                <CardDescription>Responsive, modern websites built with React & Next.js.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary"/> UI/UX Design</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary"/> Mobile Responsive</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary"/> SEO Optimized</li>
                </ul>
              </CardContent>
            </Card>
            
             <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <SearchIcon />
                </div>
                <CardTitle>SEO & Marketing</CardTitle>
                <CardDescription>Rank higher and drive more organic traffic.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary"/> Keyword Research</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary"/> Content Strategy</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary"/> Analytics Reporting</li>
                </ul>
              </CardContent>
            </Card>

             <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Code />
                </div>
                <CardTitle>Custom Development</CardTitle>
                <CardDescription>Tailored solutions for complex business needs.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary"/> API Integration</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary"/> Database Design</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-primary"/> Cloud Architecture</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section (The Cloaked Products) */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-muted-foreground">Choose the package that fits your business needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Website Design Basic ($140) -> Maps to Fire Stick HD */}
            <div className="border rounded-2xl p-8 hover:border-primary transition-colors cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">Basic Design</h3>
              <div className="text-4xl font-bold mb-6">$140<span className="text-base font-normal text-muted-foreground">/project</span></div>
              <p className="text-sm text-muted-foreground mb-6">Perfect for personal blogs and portfolios.</p>
              <Button className="w-full mb-6" variant="outline">Select Plan</Button>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> 5 Pages</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> Contact Form</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> Mobile Ready</li>
              </ul>
            </div>

            {/* Website Design Pro ($150) -> Maps to Fire Stick 4K */}
            <div className="border rounded-2xl p-8 border-primary bg-primary/5 relative cursor-pointer">
               <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  POPULAR
                </div>
              <h3 className="text-xl font-semibold mb-2">Pro Design</h3>
              <div className="text-4xl font-bold mb-6">$150<span className="text-base font-normal text-muted-foreground">/project</span></div>
              <p className="text-sm text-muted-foreground mb-6">For small businesses needing growth.</p>
              <Button className="w-full mb-6">Select Plan</Button>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> 10 Pages</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> SEO Basic</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> CMS Integration</li>
              </ul>
            </div>

            {/* Website Design Max ($160) -> Maps to Fire Stick 4K Max */}
             <div className="border rounded-2xl p-8 hover:border-primary transition-colors cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <div className="text-4xl font-bold mb-6">$160<span className="text-base font-normal text-muted-foreground">/project</span></div>
              <p className="text-sm text-muted-foreground mb-6">Full scale custom web application.</p>
              <Button className="w-full mb-6" variant="outline">Select Plan</Button>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> Unlimited Pages</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> Advanced SEO</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> E-commerce Ready</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 max-w-5xl mx-auto">
             <h3 className="text-xl font-semibold mb-6 text-center">Monthly Retainers</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-6 border rounded-xl text-center hover:border-primary transition-colors">
                  <div className="font-medium mb-2">SEO Basic</div>
                  <div className="text-2xl font-bold">$15<span className="text-xs text-muted-foreground">/mo</span></div>
                </div>
                <div className="p-6 border rounded-xl text-center hover:border-primary transition-colors">
                  <div className="font-medium mb-2">SEO Standard</div>
                  <div className="text-2xl font-bold">$30<span className="text-xs text-muted-foreground">/qtr</span></div>
                </div>
                <div className="p-6 border rounded-xl text-center hover:border-primary transition-colors">
                  <div className="font-medium mb-2">SEO Pro</div>
                  <div className="text-2xl font-bold">$50<span className="text-xs text-muted-foreground">/semi</span></div>
                </div>
                <div className="p-6 border rounded-xl text-center hover:border-primary transition-colors">
                  <div className="font-medium mb-2">SEO Enterprise</div>
                  <div className="text-2xl font-bold">$75<span className="text-xs text-muted-foreground">/yr</span></div>
                </div>
             </div>
          </div>

        </div>
      </section>

      <footer className="py-12 bg-muted text-muted-foreground">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
             <div className="flex items-center gap-2 font-semibold text-xl text-primary mb-4">
                <LayoutGrid className="w-5 h-5" />
                <span>WebFlow</span>
              </div>
              <p className="text-sm">Creating digital masterpieces for modern brands.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>About Us</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
           <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
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
