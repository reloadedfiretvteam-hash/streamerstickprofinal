import { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Breadcrumbs from '../components/Breadcrumbs';
import { autoLinkBlogContent } from '../utils/autoLinkBlogContent';

interface BlogPostData {
  title: string;
  content: string;
  featured_image: string;
  published_at: string;
  read_time_minutes: number;
  view_count: number;
}

export default function BlogPost() {
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = window.location.pathname.split('/').pop();
    loadPost(slug || '');
  }, []);

  const loadPost = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('real_blog_posts')
        .select('title, content, featured_image, published_at, word_count, view_count')
        .eq('slug', slug)
        .eq('status', 'publish')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const postData = {
          ...data,
          read_time_minutes: Math.ceil((data.word_count || 300) / 200)
        };
        setPost(postData);

        // Increment view count
        await supabase
          .from('real_blog_posts')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('slug', slug);
      }
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation cartItemCount={0} onCartClick={() => {}} />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <a href="/" className="text-orange-500 hover:text-orange-400">
            Return to Home
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation cartItemCount={0} onCartClick={() => {}} />

      <article className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-9">
            <Breadcrumbs items={[
              { label: 'Blog', href: '/#blog' },
              { label: post.title }
            ]} />

            <a
              href="/"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>

        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-96 object-cover rounded-2xl mb-8"
            loading="eager"
          />
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-6 text-gray-400 mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>{formatDate(post.published_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{post.read_time_minutes} min read</span>
          </div>
        </div>

        <div
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: autoLinkBlogContent(post.content) }}
        />

        <div className="mt-12 pt-8 border-t border-gray-800 space-y-4">
          {/* Primary CTA */}
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl p-8 border border-orange-500/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-300 mb-6">
              Shop our Fire Sticks and IPTV subscriptions on the main store page
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/" className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors">
                Visit Homepage & Shop
              </a>
              <a href="/#products" className="inline-block px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors border border-gray-700">
                Browse All Products
              </a>
            </div>
          </div>

          {/* Secondary link back */}
          <div className="text-center">
            <a href="/" className="text-orange-500 hover:text-orange-400 inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Main Website
            </a>
          </div>
        </div>
          </div>

          {/* Sidebar - Featured Products */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Featured Products</h3>
                
                <a href="/" className="block mb-4 hover:opacity-80 transition">
                  <img src="/firestick-4k.jpg" alt="Fire Stick 4K" className="rounded-lg mb-2" />
                  <p className="text-orange-500 font-semibold">Fire Stick 4K Max</p>
                  <p className="text-gray-400 text-sm">Shop Now →</p>
                </a>

                <a href="/" className="block mb-4 hover:opacity-80 transition">
                  <p className="text-orange-500 font-semibold">IPTV Subscriptions</p>
                  <p className="text-gray-400 text-sm">View Plans →</p>
                </a>

                <a href="/" className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold text-center block">
                  Visit Our Store
                </a>
              </div>
            </div>
          </aside>
        </div>
      </article>

      <Footer />
    </div>
  );
}
