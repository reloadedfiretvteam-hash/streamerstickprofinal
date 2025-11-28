import { useState, useEffect } from 'react';
import { Calendar, Clock, Eye, ArrowRight } from 'lucide-react';
import { supabase, getStorageUrl } from '../lib/supabase';
import ValidatedImage from './ValidatedImage';

// Fallback image for blog posts
const FALLBACK_BLOG_IMAGE = 'https://images.pexels.com/photos/5474282/pexels-photo-5474282.jpeg?auto=compress&cs=tinysrgb&w=600';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  published_at: string;
  view_count: number;
  read_time_minutes: number;
  category_id: string;
}

interface Category {
  id: string;
  category_name: string;
}

export default function BlogDisplay() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadPosts = async () => {
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('real_blog_posts')
        .select('*')
        .eq('status', 'publish')
        .order('published_at', { ascending: false })
        .limit(6);

      if (fetchError) throw fetchError;

      // Map data to include calculated fields
      const mappedPosts = (data || []).map(post => {
        // Parse tags from keywords if tags field doesn't exist
        let tags: string[] = [];
        if (post.tags && Array.isArray(post.tags)) {
          tags = post.tags;
        } else if (post.keywords) {
          // If keywords is a string, split by comma
          tags = typeof post.keywords === 'string' 
            ? post.keywords.split(',').map(t => t.trim()).filter(Boolean)
            : post.keywords;
        }
        
        return {
          ...post,
          read_time_minutes: Math.ceil((post.word_count || 300) / 200),
          view_count: post.view_count || 0,
          category_id: post.category || 'General',
          tags: tags
        };
      });

      setPosts(mappedPosts);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Unable to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true);

      if (fetchError) throw fetchError;
      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const getCategoryName = (categoryId: string) => {
    // categoryId is actually the category name in our real_blog_posts table
    return categoryId || 'General';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show error state with retry button
  if (error && !loading) {
    return (
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Latest from Our Blog
            </h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={loadPosts}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Latest from Our Blog
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Expert guides, tips, and insights about IPTV streaming, Fire Stick setup, and cutting the cord
            </p>
          </div>

          {/* Skeleton loading grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="h-48 bg-gray-700 skeleton" />
                <div className="p-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-4 bg-gray-700 rounded skeleton" />
                    <div className="w-20 h-4 bg-gray-700 rounded skeleton" />
                  </div>
                  <div className="w-full h-6 bg-gray-700 rounded skeleton" />
                  <div className="w-3/4 h-6 bg-gray-700 rounded skeleton" />
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-gray-700 rounded skeleton" />
                    <div className="w-11/12 h-4 bg-gray-700 rounded skeleton" />
                  </div>
                  <div className="w-24 h-5 bg-gray-700 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Expert guides, tips, and insights about IPTV streaming, Fire Stick setup, and cutting the cord
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-xl"
            >
              <div className="relative h-48 overflow-hidden">
                <ValidatedImage
                  src={post.featured_image || getStorageUrl('images', 'iptv-subscription.jpg')}
                  fallbackSrc={FALLBACK_BLOG_IMAGE}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  minBytes={1000}
                />
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                      {getCategoryName(post.category_id)}
                    </span>
                    {post.tags && post.tags.length > 0 && (
                      post.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <a
                          key={idx}
                          href={`/blog/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`}
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/blog/tag/${encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))}`;
                          }}
                          className="px-3 py-1 bg-blue-500/80 hover:bg-blue-500 text-white text-xs font-semibold rounded-full transition-colors"
                        >
                          #{tag}
                        </a>
                      ))
                    )}
                  </div>
                </div>

              <div className="p-6">
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.read_time_minutes} min read</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-gray-400 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <a
                    href={`/blog/${post.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/blog/${post.slug}`;
                    }}
                    className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-semibold transition-colors"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{post.view_count || 0}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => {
              // Scroll to top and show all blog posts or navigate to blog page
              window.scrollTo({ top: 0, behavior: 'smooth' });
              // Could navigate to /blog if you create a dedicated blog listing page
            }}
            className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors transform hover:scale-105"
          >
            View All Blog Posts
          </button>
        </div>
      </div>
    </section>
  );
}
