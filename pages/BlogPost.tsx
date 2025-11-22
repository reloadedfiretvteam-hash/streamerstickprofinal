import { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

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

      <article className="container mx-auto px-4 py-12 max-w-4xl">
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
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t border-gray-800">
          <a
            href="/#shop"
            className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Shop Fire Sticks & IPTV
          </a>
        </div>
      </article>

      <Footer />
    </div>
  );
}
