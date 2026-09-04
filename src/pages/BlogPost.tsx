// src/pages/BlogPost.tsx
// Individual Blog Article Page (/blog/:slug)
// Supports live Supabase fetching with seamless local catalog fallback (BLOG_POSTS).
// Renders rich hero banner, structured markdown, key takeaways, author bio,
// related articles, and Schema.org BlogPosting structured data.

import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Tag, 
  Share2, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BLOG_POSTS, BlogPostItem } from '@/data/blogPostsData';

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  // 1. Try fetching from Supabase
  const { data: supabaseBlog, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error || !data) return null;
        return data;
      } catch {
        return null;
      }
    },
    enabled: !!slug,
    retry: false,
  });

  // 2. Find matching post from local catalog fallback
  const localBlog = useMemo(() => {
    if (!slug) return null;
    return BLOG_POSTS.find(p => p.slug === slug) || null;
  }, [slug]);

  // Combine: Supabase data takes precedence if found; otherwise use rich local catalog item
  const post = useMemo(() => {
    if (supabaseBlog) {
      return {
        title: supabaseBlog.title,
        excerpt: supabaseBlog.excerpt || '',
        content: supabaseBlog.content || '',
        author: {
          name: supabaseBlog.author || 'TalentXcel Editorial',
          role: 'Career Research Team',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        },
        date: supabaseBlog.published_at || new Date().toISOString(),
        readTime: `${supabaseBlog.read_time_minutes || 5} min read`,
        category: supabaseBlog.category || 'Career Intelligence',
        tags: (supabaseBlog.tags as string[]) || ['Career', 'Hiring'],
        imageUrl: supabaseBlog.featured_image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&auto=format&fit=crop&q=80',
      };
    }
    if (localBlog) {
      return {
        title: localBlog.title,
        excerpt: localBlog.excerpt,
        content: localBlog.content,
        author: localBlog.author,
        date: localBlog.date,
        readTime: localBlog.readTime,
        category: localBlog.category,
        tags: localBlog.tags,
        imageUrl: localBlog.imageUrl,
      };
    }
    return null;
  }, [supabaseBlog, localBlog]);

  // Related articles (other articles in same category or popular)
  const relatedArticles = useMemo(() => {
    if (!post || !slug) return [];
    return BLOG_POSTS
      .filter(p => p.slug !== slug)
      .sort((a, b) => (a.category === post.category ? -1 : 1))
      .slice(0, 3);
  }, [post, slug]);

  if (isLoading && !localBlog) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse space-y-8">
            <div className="h-6 bg-slate-800 rounded w-1/4"></div>
            <div className="h-12 bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            <div className="h-96 bg-slate-800 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-24 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6 text-slate-400">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Article Not Found</h1>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            The career guide you are looking for may have been moved or updated. Explore our full library of 26 intelligence reports.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl">
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog Directory
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Schema.org BlogPosting JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.imageUrl,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TalentXcel',
      url: 'https://talentxcel.in',
      logo: 'https://talentxcel.in/assets/logo.png',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://talentxcel.in/blog/${slug}`,
    },
    keywords: post.tags.join(', '),
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Helmet>
        <title>{post.title} | TalentXcel Blog</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={`https://talentxcel.in/blog/${slug}`} />
        <meta property="og:title" content={`${post.title} | TalentXcel`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={post.imageUrl} />
        <meta property="og:url" content={`https://talentxcel.in/blog/${slug}`} />
        <meta name="article:author" content={post.author.name} />
        <meta name="article:published_time" content={post.date} />
        <meta name="article:section" content={post.category} />
        {post.tags.map((tag) => (
          <meta key={tag} name="article:tag" content={tag} />
        ))}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      {/* Top Header / Breadcrumb */}
      <div className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
            Back to All 26 Articles
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-8 px-3 text-xs border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Article Meta Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-0.5">
              {post.category}
            </Badge>
            <span className="text-slate-500 text-xs">·</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight sm:leading-snug mb-4">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed mb-6">
            {post.excerpt}
          </p>

          {/* Author Card */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <img 
                src={post.author.avatar} 
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30" 
              />
              <div>
                <div className="font-bold text-white text-sm">{post.author.name}</div>
                <div className="text-xs text-slate-400">{post.author.role}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Published on {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* Hero Featured Image */}
        <div className="mb-12 rounded-2xl overflow-hidden border border-slate-800 aspect-[16/9] bg-slate-900 shadow-2xl">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body Content */}
        <article className="prose prose-invert prose-blue max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg prose-li:text-slate-300 prose-strong:text-white prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-400" /> Topic Tags:
              </span>
              {post.tags.map((t) => (
                <Link
                  key={t}
                  to={`/blog?tag=${encodeURIComponent(t)}`}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white text-xs transition-colors"
                >
                  #{t}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Platform CTA Banner */}
        <div className="mt-14 p-8 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Accelerate Your Career
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              Ready to put these career insights into practice?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Create an ATS-optimized resume, discover verified jobs matching your exact skills, and explore career roadmaps on TalentXcel.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs px-5 py-2.5">
              <Link to="/resume">Build Free Resume</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold rounded-xl text-xs px-5 py-2.5">
              <Link to="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        </div>

        {/* Related Articles Grid */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-12 border-t border-slate-800">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
              Related Intelligence Reports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="group block rounded-xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-slate-700 transition-all p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3 bg-slate-950">
                      <img 
                        src={rel.imageUrl} 
                        alt={rel.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <Badge className="bg-slate-800 text-blue-400 border border-blue-500/20 text-[10px] mb-2 font-medium">
                      {rel.category}
                    </Badge>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{rel.readTime}</span>
                    <span className="text-blue-400 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 TalentXcel Services Private Limited. All rights reserved.</p>
        <p className="mt-1">
          <Link to="/blog" className="text-blue-400 hover:underline">All Publications</Link> · 
          <Link to="/about/talentxcel" className="text-blue-400 hover:underline ml-2">About Platform</Link> · 
          <Link to="/jobs" className="text-blue-400 hover:underline ml-2">Jobs Matrix</Link>
        </p>
      </footer>
    </div>
  );
};

export default BlogPost;