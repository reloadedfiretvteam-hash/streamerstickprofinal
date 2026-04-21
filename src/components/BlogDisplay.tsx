import { useState, useEffect } from 'react';
import { Calendar, Clock, Eye, ArrowRight } from 'lucide-react';
import { getStorageUrl } from '../lib/supabase';

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
  tags?: string[];
}

interface Category {
  id: string;
  category_name: string;
}

export default function BlogDisplay() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [_categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
    loadCategories();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts?limit=6');
      if (!response.ok) throw new Error('Failed to load posts');
      const result = await response.json() as { data?: Array<Record<string, unknown>> };
      const data = result.data || [];

      const mappedPosts = data.map(post => {
        let tags: string[] = [];
        if (Array.isArray(post.tags)) {
          tags = post.tags as string[];
        } else if (typeof post.keywords === 'string') {
          tags = (post.keywords as string).split(/[,\s]+/).map((t: string) => t.trim()).filter(Boolean).slice(0, 5);
        }

        const wordCount = ((post.content as string) || '').split(/\s+/).length;
        return {
          id: post.id as string,
          title: post.title as string,
          slug: post.slug as string,
          excerpt: (post.excerpt as string) || '',
          content: (post.content as string) || '',
          featured_image: (post.image as string) || '',
          meta_title: (post.title as string),
          meta_description: (post.metaDescription as string) || (post.excerpt as string) || '',
          published_at: (post.publishedAt as string) || '',
          read_time_minutes: Math.max(1, Math.ceil(wordCount / 200)),
          view_count: 0,
          category_id: (post.category as string) || 'General',
          tags,
        } as BlogPost;
      });

      setPosts(mappedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    // Categories are derived from posts - no separate API call needed
    setCategories([]);
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
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.featured_image || getStorageUrl('images', 'iptv-subscription.jpg')}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Fallback to IPTV subscription image if featured image fails
                    target.src = getStorageUrl('images', 'iptv-subscription.jpg');
                  }}
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
