import { useState, useEffect } from 'react';
import { Calendar, Clock, ArrowLeft, BookOpen, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface BlogPostData {
  id: string;
  title: string;
  slug: string;
  content: string;
  seo_title: string;
  seo_description: string;
  featured_image: string;
  created_at: string;
  view_count: number;
  category?: string;
}

interface RelatedPost {
  title: string;
  slug: string;
  seo_description: string;
}

export default function EnhancedBlogPost() {
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [tocItems, setTocItems] = useState<{id: string; text: string}[]>([]);

  useEffect(() => {
    const path = window.location.pathname;
    
    // Check if it's a tag page
    if (path.startsWith('/blog/tag/')) {
      const tagSlug = path.split('/blog/tag/').pop() || '';
      loadPostByTag(tagSlug);
    } else {
      const slug = path.split('/').pop();
      loadPost(slug || '');
    }
  }, []);

  const loadPostByTag = async (tagSlug: string) => {
    // Convert tag slug back to tag name
    const tagName = tagSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    try {
      const { data, error } = await supabase
        .from('real_blog_posts')
        .select('*')
        .eq('status', 'publish')
        .contains('tags', [tagName])
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setPost(data);
        loadRelatedPosts(data.id, data.category);
        incrementViewCount(data.slug);
        setupSEO(data);
        extractTableOfContents(data.content);
      }
    } catch (error) {
      console.error('Error loading post by tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPost = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('real_blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'publish')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPost(data);
        loadRelatedPosts(data.id, data.category);
        incrementViewCount(slug);
        setupSEO(data);
        extractTableOfContents(data.content);
      }
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedPosts = async (currentId: string, category?: string) => {
    try {
      const { data, error } = await supabase
        .from('real_blog_posts')
        .select('title, slug, meta_description, excerpt')
        .neq('id', currentId)
        .eq('status', 'publish')
        .limit(3);

      if (!error && data) {
        setRelatedPosts(data.map(p => ({
          title: p.title,
          slug: p.slug,
          seo_description: p.meta_description || p.excerpt || ''
        })));
      }
    } catch (error) {
      console.error('Error loading related posts:', error);
    }
  };

  const incrementViewCount = async (slug: string) => {
    try {
      // Update view count directly
      const { data } = await supabase
        .from('real_blog_posts')
        .select('view_count')
        .eq('slug', slug)
        .single();
      
      if (data) {
        await supabase
          .from('real_blog_posts')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('slug', slug);
      }
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  };

  const setupSEO = (postData: BlogPostData) => {
    document.title = postData.seo_title || postData.title;

    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    setMetaTag('description', postData.seo_description);
    setMetaTag('og:title', postData.seo_title, true);
    setMetaTag('og:description', postData.seo_description, true);
    setMetaTag('og:type', 'article', true);
    setMetaTag('og:url', window.location.href, true);
    if (postData.featured_image) {
      setMetaTag('og:image', postData.featured_image, true);
    }
    setMetaTag('article:published_time', postData.created_at, true);
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', postData.seo_title);
    setMetaTag('twitter:description', postData.seo_description);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = window.location.href;

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: postData.title,
      description: postData.seo_description,
      image: postData.featured_image || '',
      datePublished: postData.created_at,
      dateModified: postData.created_at,
      author: {
        '@type': 'Organization',
        name: 'Stream Stick Pro'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Stream Stick Pro',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': window.location.href
      }
    };

    let scriptTag = document.querySelector('script[data-article-schema]') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.setAttribute('data-article-schema', 'true');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(articleSchema);

    const faqSchema = generateFAQSchema(postData.title);
    if (faqSchema) {
      let faqScript = document.querySelector('script[data-faq-schema]') as HTMLScriptElement;
      if (!faqScript) {
        faqScript = document.createElement('script');
        faqScript.type = 'application/ld+json';
        faqScript.setAttribute('data-faq-schema', 'true');
        document.head.appendChild(faqScript);
      }
      faqScript.textContent = JSON.stringify(faqSchema);
    }
  };

  const generateFAQSchema = (title: string) => {
    const faqs: {[key: string]: any} = {
      'Fire Stick': {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I set up my Fire Stick?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Plug the Fire Stick into your TV HDMI port, connect to power, turn on your TV, connect to WiFi, and follow the on-screen setup instructions. Setup takes about 5 minutes.'
            }
          },
          {
            '@type': 'Question',
            name: 'What internet speed do I need for Fire Stick?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'For HD streaming you need at least 10 Mbps. For 4K streaming on Fire Stick 4K or 4K Max, we recommend at least 25 Mbps for the best experience.'
            }
          },
          {
            '@type': 'Question',
            name: 'Does Fire Stick come with IPTV pre-installed?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! All our Fire Stick devices come with IPTV pre-installed and include a 1-year subscription with 18,000+ channels. Just plug in and start streaming.'
            }
          }
        ]
      },
      'IPTV': {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What channels are included with IPTV?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Our IPTV service includes 18,000+ live channels covering sports, movies, news, entertainment, kids programming, and international channels. All major networks and premium channels included.'
            }
          },
          {
            '@type': 'Question',
            name: 'Can I watch IPTV on multiple devices?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! You can use IPTV on Fire Stick, Smart TVs, phones, tablets, computers, and more. Most plans support multiple simultaneous connections.'
            }
          },
          {
            '@type': 'Question',
            name: 'Does IPTV include sports and PPV events?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes! All IPTV subscriptions include live sports channels and PPV events at no extra cost. Watch NFL, NBA, UFC, boxing, and more live in HD/4K.'
            }
          }
        ]
      }
    };

    if (title.toLowerCase().includes('fire stick')) {
      return faqs['Fire Stick'];
    } else if (title.toLowerCase().includes('iptv')) {
      return faqs['IPTV'];
    }
    return null;
  };

  const extractTableOfContents = (content: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const headings = tempDiv.querySelectorAll('h2, h3');

    const items = Array.from(headings).map((heading, index) => ({
      id: `section-${index}`,
      text: heading.textContent || ''
    }));

    setTocItems(items);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReadTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  const sharePost = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.seo_description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation cartItemCount={0} onCartClick={() => {}} />
        <div className="container mx-auto px-4 py-12 max-w-4xl animate-pulse">
          {/* Featured Image Skeleton */}
          <div className="w-full h-96 bg-gray-800 rounded-2xl mb-8"></div>
          
          {/* Title Skeleton */}
          <div className="h-12 bg-gray-800 rounded w-3/4 mb-6"></div>
          
          {/* Meta info skeleton */}
          <div className="flex gap-6 mb-8 pb-6 border-b border-gray-800">
            <div className="h-5 bg-gray-800 rounded w-32"></div>
            <div className="h-5 bg-gray-800 rounded w-24"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-4 bg-gray-800 rounded"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            <div className="h-4 bg-gray-800 rounded w-4/5"></div>
            <div className="h-4 bg-gray-800 rounded"></div>
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          </div>
        </div>
        <Footer />
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

  const readTime = calculateReadTime(post.content);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation cartItemCount={0} onCartClick={() => {}} />

      <article className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-white">Table of Contents</h3>
                </div>
                {tocItems.length > 0 && (
                  <nav className="space-y-2">
                    {tocItems.map((item, index) => (
                      <a
                        key={index}
                        href={`#${item.id}`}
                        className="block text-sm text-gray-400 hover:text-orange-500 transition-colors py-1"
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                )}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9">
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
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // Fallback to a generic blog image on error
                  target.src = 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800';
                }}
              />
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {post.title}
            </h1>

            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800">
              <div className="flex items-center gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{readTime} min read</span>
                </div>
              </div>
              <button
                onClick={sharePost}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            <div
              className="prose prose-invert prose-lg max-w-none
                prose-headings:text-white prose-headings:font-bold
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-300 prose-p:leading-relaxed
                prose-a:text-orange-500 prose-a:no-underline hover:prose-a:text-orange-400
                prose-strong:text-white prose-strong:font-semibold
                prose-ul:text-gray-300 prose-ol:text-gray-300
                prose-li:mb-2
                prose-blockquote:border-l-4 prose-blockquote:border-orange-500
                prose-blockquote:bg-gray-800 prose-blockquote:py-4 prose-blockquote:px-6
                prose-blockquote:rounded-r-lg prose-blockquote:text-gray-300
                prose-code:text-orange-400 prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded
                prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-16 pt-8 border-t border-gray-800">
              <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl p-8 border border-orange-500/20">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Ready to Start Streaming?
                </h3>
                <p className="text-gray-300 mb-6">
                  Get 18,000+ live channels, 60,000+ movies, and all sports with our premium IPTV service.
                  36-hour free trial. Free setup support.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="/iptv-services"
                    className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    View Pricing Plans
                  </a>
                  <a
                    href="/fire-sticks"
                    className="inline-block px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors border border-gray-700"
                  >
                    Shop Fire Sticks
                  </a>
                </div>
              </div>
            </div>

            {relatedPosts.length > 0 && (
              <div className="mt-16">
                <h3 className="text-2xl font-bold text-white mb-6">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost, index) => (
                    <a
                      key={index}
                      href={`/blog/${relatedPost.slug}`}
                      className="block bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500 transition-all group"
                    >
                      <h4 className="text-lg font-semibold text-white mb-3 group-hover:text-orange-500 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-gray-400 text-sm line-clamp-3">
                        {relatedPost.seo_description}
                      </p>
                      <span className="inline-flex items-center gap-2 text-orange-500 mt-4 text-sm font-medium">
                        Read More
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
