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
import { getPillarNode, getRelatedPillarNodes, normalizeSeoPath } from "@/lib/seo-pillar-graph";

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
  const canonicalPath = normalizeSeoPath(breadcrumbs[breadcrumbs.length - 1]?.href || "/");
  const currentNode = getPillarNode(canonicalPath);
  const relatedNodes = getRelatedPillarNodes(canonicalPath, 6);
  const relatedSchema = currentNode && relatedNodes.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${currentNode.title} related guides`,
        itemListElement: relatedNodes.map((node, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: node.title,
          url: `${SITE_URL}${node.path}`,
        })),
      }
    : null;

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
              <Link href="/iptv"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Reloaded Fire TV</span></Link>
              <Link href="/iptv-firestick"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Firestick</span></Link>
              <Link href="/devices"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Devices</span></Link>
              <Link href="/iptv-media-players"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Media Players</span></Link>
              <Link href="/setup"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Tutorials</span></Link>
              <Link href="/jailbroken-fire-sticks"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Jailbroken</span></Link>
              <Link href="/locations"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Locations</span></Link>
              <Link href="/blog"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Blog</span></Link>
              <Link href="/shop"><span className="px-2 py-1 text-sm text-gray-300 hover:text-white">Shop</span></Link>
              <Link href="/drive-of-the-south"><span className="px-2 py-1 text-sm text-amber-200/90 hover:text-amber-100">Drive South</span></Link>
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

        {currentNode && (
          <section className="mt-10 p-6 rounded-xl border border-sky-400/30 bg-gradient-to-br from-sky-500/10 to-blue-600/10" data-testid="section-seo-internal-graph">
            <h2 className="text-2xl font-bold text-white mb-2">Topical map for this guide</h2>
            <p className="text-gray-300 mb-3">
              Primary target: <strong className="text-white">{currentNode.primaryKeyword}</strong> ({currentNode.intent} intent)
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {currentNode.supportKeywords.slice(0, 6).map((keyword) => (
                <span key={keyword} className="text-xs md:text-sm px-2.5 py-1 rounded-full border border-white/20 bg-white/5 text-gray-200">
                  {keyword}
                </span>
              ))}
            </div>
            {relatedNodes.length > 0 && (
              <div>
                <p className="text-sm text-gray-300 mb-3">Related internal guides:</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {relatedNodes.map((node) => (
                    <Link
                      key={node.path}
                      href={node.path}
                      className="block rounded-lg border border-white/15 bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors"
                    >
                      <span className="block text-white font-medium text-sm">{node.title}</span>
                      <span className="block text-gray-400 text-xs mt-0.5">{node.primaryKeyword}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {relatedSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(relatedSchema) }} />
        )}

        <section className="mt-12 p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/30">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to stream?</h2>
          <p className="text-gray-300 mb-4">Explore Fire Stick device options or Reloaded Fire TV plans. 18,000+ channels, 100,000+ movies, and setup support. Free trial available.</p>
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
