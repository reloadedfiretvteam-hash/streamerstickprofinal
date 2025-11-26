import { Link2, ShoppingCart, BookOpen, HelpCircle, Tv, FileText, MessageCircle } from 'lucide-react';

interface InternalLink {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  category: string;
}

const internalLinks: InternalLink[] = [
  {
    title: 'Shop All Products',
    description: 'Browse our complete collection of Fire Sticks and IPTV subscriptions',
    href: '/shop',
    icon: ShoppingCart,
    category: 'Products'
  },
  {
    title: 'Setup Guides & Tutorials',
    description: 'Step-by-step guides for Fire Stick setup and IPTV configuration',
    href: '#guides',
    icon: BookOpen,
    category: 'Guides'
  },
  {
    title: 'Frequently Asked Questions',
    description: 'Find answers to common questions about IPTV and streaming',
    href: '#faq',
    icon: HelpCircle,
    category: 'Support'
  },
  {
    title: 'IPTV Subscriptions',
    description: 'Premium IPTV plans with 18,000+ live channels',
    href: '#shop',
    icon: Tv,
    category: 'Products'
  },
  {
    title: 'Blog & Resources',
    description: 'Latest news, tips, and streaming guides',
    href: '#blog',
    icon: FileText,
    category: 'Resources'
  },
  {
    title: 'Customer Reviews',
    description: 'Read testimonials from our satisfied customers',
    href: '#customer-reviews',
    icon: MessageCircle,
    category: 'Trust'
  }
];

/**
 * Internal Linking Component
 * Displays strategic internal links to boost SEO and user navigation
 */
export default function InternalLinking() {
  return (
    <section className="py-12 bg-gray-100" aria-label="Quick Navigation">
      <div className="container mx-auto px-4">
        {/* SEO-friendly header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Link2 className="w-6 h-6 text-orange-500" />
            Explore More
          </h2>
          <p className="text-gray-600">
            Discover everything about jailbroken Fire Sticks and IPTV subscriptions
          </p>
        </div>

        {/* Internal Links Grid */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Site sections">
          {internalLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-orange-300 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 group-hover:from-orange-200 group-hover:to-red-200 flex items-center justify-center flex-shrink-0 transition-colors">
                <link.icon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">
                  {link.category}
                </span>
                <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors mt-1">
                  {link.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {link.description}
                </p>
              </div>
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}