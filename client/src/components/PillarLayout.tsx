import { Link } from "wouter";
import { Flame, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCart } from "@/lib/store";

export interface BreadcrumbItemType {
  label: string;
  href: string;
}

interface PillarLayoutProps {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItemType[];
  children: React.ReactNode;
}

const SITE_URL = "https://streamstickpro.com";

export function PillarLayout({ title, description, breadcrumbs, children }: PillarLayoutProps) {
  const { items, openCart } = useCart();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-gray-900/95 backdrop-blur-xl" aria-label="Main navigation">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white hover:opacity-90">
              <Flame className="w-6 h-6 text-orange-500" />
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Stream Stick Pro</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/iptv-services"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">IPTV</span></Link>
              <Link href="/iptv-firestick"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Firestick</span></Link>
              <Link href="/firestick-devices"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Devices</span></Link>
              <Link href="/iptv-media-players"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Media Players</span></Link>
              <Link href="/tutorials"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Tutorials</span></Link>
              <Link href="/jailbroken-fire-sticks"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Jailbroken</span></Link>
              <Link href="/blog"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Blog</span></Link>
              <Link href="/shop"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Shop</span></Link>
            </div>
          </div>
          <Button onClick={openCart} className="bg-orange-500 hover:bg-orange-600 text-white">
            <ShoppingCart className="w-4 h-4 mr-2" /> Cart {items.length > 0 && `(${items.length})`}
          </Button>
        </div>
      </nav>

      <main id="main-content" className="container mx-auto px-4 py-6 max-w-4xl" role="main">
        <Breadcrumb className="mb-6 text-gray-400">
          <BreadcrumbList>
            {breadcrumbs.map((item, i) => (
              <BreadcrumbItem key={item.href}>
                {i < breadcrumbs.length - 1 ? (
                  <>
                    <BreadcrumbLink asChild>
                      <Link href={item.href} className="text-gray-400 hover:text-white">{item.label}</Link>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                ) : (
                  <BreadcrumbPage className="text-white">{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <article className="prose prose-invert prose-lg max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">{title}</h1>
          {description && <p className="text-xl text-gray-300 mb-8">{description}</p>}
          {children}
        </article>

        <section className="mt-12 p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to stream?</h2>
          <p className="text-gray-300 mb-4">Get a pre-configured Fire Stick or IPTV plan. 18,000+ channels, 100,000+ movies. Free trial available.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/"><Button className="bg-orange-500 hover:bg-orange-600">View Home & Shop</Button></Link>
            <Link href="/shop"><Button variant="outline" className="border-white/30 text-white hover:bg-white/10">Shop Plans</Button></Link>
            <Link href="/blog"><Button variant="outline" className="border-white/30 text-white hover:bg-white/10">Blog & Guides</Button></Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}
