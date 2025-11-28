import { useState, useEffect } from 'react';
import { Calendar, Clock, Eye, ArrowRight, Tag, Search, X } from 'lucide-react';
import { supabase, getStorageUrl } from '../lib/supabase';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

// Constants for read time calculation
const DEFAULT_WORD_COUNT = 300;
const WORDS_PER_MINUTE = 200;

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
  word_count: number;
  category: string;
  tags: string[];
  keywords: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const postsPerPage = 12;

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    // Check URL for tag filter
    const urlParams = new URLSearchParams(window.location.search);
    const tagParam = urlParams.get('tag');
    if (tagParam) {
      // Decode the URL parameter to handle special characters
      setSelectedTag(decodeURIComponent(tagParam));
    }
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedTag, searchQuery]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('real_blog_posts')
        .select('*')
        .eq('status', 'publish')
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Map data to include calculated fields and extract tags
      const mappedPosts = (data || []).map(post => {
        let tags: string[] = [];
        if (post.tags && Array.isArray(post.tags)) {
          tags = post.tags;
        } else if (post.keywords) {
          tags = typeof post.keywords === 'string' 
            ? post.keywords.split(',').map((t: string) => t.trim()).filter(Boolean)
            : post.keywords;
        }
        
        return {
          ...post,
          tags: tags
        };
      });

      setPosts(mappedPosts);

      // Extract unique tags from all posts
      const tagsSet = new Set<string>();
      mappedPosts.forEach(post => {
        post.tags.forEach((tag: string) => tagsSet.add(tag));
      });
      setAllTags(Array.from(tagsSet).sort());

    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let result = [...posts];

    // Filter by tag
    if (selectedTag) {
      result = result.filter(post => 
        post.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.category?.toLowerCase().includes(query)
      );
    }

    setFilteredPosts(result);
    setPage(1); // Reset to first page when filters change
  };

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
      window.history.pushState({}, '', '/blog');
    } else {
      setSelectedTag(tag);
      window.history.pushState({}, '', `/blog?tag=${encodeURIComponent(tag)}`);
    }
  };

  const clearFilters = () => {
    setSelectedTag(null);
    setSearchQuery('');
    window.history.pushState({}, '', '/blog');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (wordCount: number) => {
    return Math.ceil((wordCount || DEFAULT_WORD_COUNT) / WORDS_PER_MINUTE);
  };

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation cartItemCount={0} onCartClick={() => {}} />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center text-white text-xl">Loading blog posts...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation cartItemCount={0} onCartClick={() => {}} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Stream Stick Pro <span className="text-orange-400">Blog</span>
            </h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto mb-8">
              Expert guides, tips, and insights about IPTV streaming, Fire Stick setup, and cutting the cord
            </p>
            <p className="text-gray-400">
              {posts.length} articles available
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-gray-800 border-b border-gray-700 py-6">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          {/* Tags Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-gray-400 mr-2 flex items-center gap-1">
              <Tag className="w-4 h-4" /> Filter by tag:
            </span>
            {allTags.slice(0, 15).map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Active Filters */}
          {(selectedTag || searchQuery) && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <span className="text-gray-400">
                Showing {filteredPosts.length} of {posts.length} articles
              </span>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-orange-400 hover:text-orange-300"
              >
                <X className="w-4 h-4" /> Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {paginatedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No articles found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-xl group"
                >
                  <a href={`/blog/${post.slug}`} className="block">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.featured_image || getStorageUrl('images', 'iptv-subscription.jpg')}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getStorageUrl('images', 'iptv-subscription.jpg');
                        }}
                      />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                          {post.category || 'General'}
                        </span>
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
                          <span>{calculateReadTime(post.word_count)} min</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-orange-400 transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-gray-400 mb-4 line-clamp-3">
                        {post.excerpt || post.meta_description}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 text-orange-500 font-semibold group-hover:text-orange-400 transition-colors">
                          Read More
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Eye className="w-4 h-4" />
                          <span>{post.view_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                    page === pageNum
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-y border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Streaming?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Get 18,000+ live channels, 60,000+ movies, and all sports with our premium IPTV service.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/shop"
              className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
            >
              Shop Now
            </a>
            <a
              href="/iptv-services"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors border border-gray-700"
            >
              View IPTV Plans
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
