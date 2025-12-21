import { useState, useEffect } from 'react';
import { ArrowLeft, Home, ShoppingCart } from 'lucide-react';
import { supabase, getStorageUrl } from '../lib/supabase';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface SEOAd {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt: string | null;
  primary_keyword: string;
  featured_image: string | null;
  cta_text: string | null;
  cta_link: string | null;
  published: boolean;
}

export default function SEOAdPage() {
  const [ad, setAd] = useState<SEOAd | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAd();
  }, []);

  const loadAd = async () => {
    const slug = window.location.pathname.split('/ads/').pop();
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('seo_ads')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAd(data);
        setupSEO(data);
      }
    } catch (error) {
      console.error('Error loading SEO ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSEO = (adData: SEOAd) => {
    // Update page title
    document.title = adData.title + ' | StreamStickPro';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && adData.excerpt) {
      metaDescription.setAttribute('content', adData.excerpt);
    } else if (metaDescription) {
      metaDescription.setAttribute('content', `Learn about ${adData.primary_keyword} - ${adData.title}`);
    }
  };

  const handleCTAClick = () => {
    const ctaLink = ad?.cta_link || '/';
    window.location.href = ctaLink;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation cartItemCount={0} onCartClick={() => window.location.href = '/checkout'} />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SEO Ad Not Found</h1>
          <p className="text-gray-600 mb-8">The ad you're looking for doesn't exist or isn't published.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all"
          >
            Go to Home Page
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  const featuredImageUrl = ad.featured_image 
    ? (ad.featured_image.startsWith('http') ? ad.featured_image : getStorageUrl('images', ad.featured_image))
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation cartItemCount={0} onCartClick={() => window.location.href = '/checkout'} />

      {/* Hero Section with Featured Image */}
      {featuredImageUrl && (
        <div className="relative h-96 bg-gradient-to-r from-gray-900 to-black overflow-hidden">
          <img
            src={featuredImageUrl}
            alt={ad.title}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 py-8">
            <div className="max-w-4xl">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </a>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{ad.title}</h1>
              {ad.excerpt && (
                <p className="text-xl text-white/90">{ad.excerpt}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        {!featuredImageUrl && (
          <div className="mb-8">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </a>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{ad.title}</h1>
            {ad.excerpt && (
              <p className="text-xl text-gray-600 mb-8">{ad.excerpt}</p>
            )}
          </div>
        )}

        {/* Category Badge */}
        <div className="mb-8">
          <span className="inline-block px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold capitalize">
            {ad.category.replace(/-/g, ' ')}
          </span>
        </div>

        {/* Ad Content - Rendered as HTML */}
        <div
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: ad.content }}
        />

        {/* CTA Section - Links to Home Page */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 text-center text-white mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-white/90">
            Explore our products and find the perfect solution for your streaming needs.
          </p>
          <button
            onClick={handleCTAClick}
            className="px-8 py-4 bg-white text-orange-600 hover:bg-gray-100 rounded-xl font-bold text-lg transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-lg"
          >
            {ad.cta_text || 'Shop Now'}
            <ShoppingCart className="w-5 h-5" />
          </button>
          <div className="mt-6">
            <a
              href="/"
              className="text-white/80 hover:text-white underline inline-flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Home Page
            </a>
          </div>
        </div>

        {/* Related Links */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Explore More</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/shop"
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all"
            >
              <ShoppingCart className="w-6 h-6 text-orange-500 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Shop All Products</h4>
              <p className="text-sm text-gray-600">Browse our complete product catalog</p>
            </a>
            <a
              href="/"
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all"
            >
              <Home className="w-6 h-6 text-orange-500 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Home Page</h4>
              <p className="text-sm text-gray-600">Return to our homepage</p>
            </a>
            <a
              href="/#about"
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all"
            >
              <Home className="w-6 h-6 text-orange-500 mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Learn More</h4>
              <p className="text-sm text-gray-600">Discover our services</p>
            </a>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}

