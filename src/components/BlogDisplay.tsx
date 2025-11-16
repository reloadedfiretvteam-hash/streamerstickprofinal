import { useState, useEffect } from 'react';
import { Calendar, Clock, Eye, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

export default function BlogDisplay() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('real_blog_posts')
        .select('*')
        .eq('status', 'publish')
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Map data to include calculated fields
      const mappedPosts = (data || []).map(post => ({
        ...post,
        read_time_minutes: Math.ceil((post.word_count || 300) / 200),
        view_count: post.view_count || 0,
        category_id: post.category || 'General'
      }));

      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">Loading blog posts...</div>
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
              {post.featured_image && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                      {getCategoryName(post.category_id)}
                    </span>
                  </div>
                </div>
              )}

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
                    className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-400 font-semibold"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{post.view_count}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/blog"
            className="inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            View All Blog Posts
          </a>
        </div>
      </div>
    </section>
  );
}
