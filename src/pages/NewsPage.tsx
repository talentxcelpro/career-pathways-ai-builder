import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { 
  Newspaper, 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Tag, 
  ChevronRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { newsService } from '@/services/newsService';
import { NewsCategory, NewsArticle } from '@/types/news';

const CATEGORIES: NewsCategory[] = [
  'All',
  'Company News',
  'Career Intelligence',
  'Education Intelligence',
  'TalentXcel Network',
  'Press & Media'
];

const NewsPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch article list for news hub
  const { data: articles = [], isLoading: isListLoading } = useQuery({
    queryKey: ['news-articles', selectedCategory, searchQuery],
    queryFn: () => newsService.getArticles(selectedCategory, searchQuery),
    enabled: !slug,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch single article
  const { data: article, isLoading: isArticleLoading } = useQuery({
    queryKey: ['news-single-article', slug],
    queryFn: () => (slug ? newsService.getArticleBySlug(slug) : null),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch related articles
  const { data: relatedArticles = [] } = useQuery({
    queryKey: ['news-related-articles', slug, article?.category],
    queryFn: () => (article ? newsService.getRelatedArticles(article.slug, article.category, 3) : []),
    enabled: !!article,
  });

  // Share Article Functionality
  const handleShare = (platform?: 'twitter' | 'linkedin') => {
    const url = typeof window !== 'undefined' ? window.location.href : `https://talentxcel.in/news/${slug}`;
    const text = article ? `${article.title} — via TalentXcel` : 'TalentXcel News & Insights';

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        toast.success('Article link copied to clipboard!');
      }
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SINGLE ARTICLE DETAIL VIEW
  // ─────────────────────────────────────────────────────────────
  if (slug) {
    if (isArticleLoading) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground text-sm font-medium">Loading insight...</p>
          </div>
        </div>
      );
    }

    if (!article) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
          <Newspaper className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Article Not Found</h1>
          <p className="text-muted-foreground text-sm">
            The article you are looking for does not exist or may have been moved.
          </p>
          <Button onClick={() => navigate('/news')} className="rounded-xl font-bold">
            ← Return to News Hub
          </Button>
        </div>
      );
    }

    const canonicalUrl = `https://talentxcel.in/news/${article.slug}`;
    const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const newsArticleSchema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": article.summary,
      "image": [
        `https://talentxcel.in${article.imageUrl}`
      ],
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt || article.publishedAt,
      "author": {
        "@type": "Person",
        "name": article.author.name,
        "jobTitle": article.author.role
      },
      "publisher": {
        "@type": "Organization",
        "name": "TalentXcel",
        "legalName": "TalentXcel Services Pvt Ltd",
        "url": "https://talentxcel.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://talentxcel.in/talentxcel-official-logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      }
    };

    return (
      <div className="min-h-screen bg-background pb-20">
        <Helmet>
          <title>{`${article.title} | TalentXcel News & Insights`}</title>
          <meta name="description" content={article.summary} />
          <link rel="canonical" href={canonicalUrl} />
          
          <meta property="og:type" content="article" />
          <meta property="og:title" content={article.title} />
          <meta property="og:description" content={article.summary} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={`https://talentxcel.in${article.imageUrl}`} />
          <meta property="og:site_name" content="TalentXcel" />
          <meta property="article:published_time" content={article.publishedAt} />
          <meta property="article:section" content={article.category} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={article.title} />
          <meta name="twitter:description" content={article.summary} />
          <meta name="twitter:image" content={`https://talentxcel.in${article.imageUrl}`} />

          <script type="application/ld+json">
            {JSON.stringify(newsArticleSchema)}
          </script>
        </Helmet>

        {/* Top Breadcrumb Bar */}
        <div className="border-b bg-card/50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/news" className="hover:text-foreground transition-colors">News & Insights</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold truncate">{article.category}</span>
          </div>
        </div>

        <article className="max-w-3xl mx-auto px-4 pt-10">
          {/* Back Button */}
          <Link 
            to="/news" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-6 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to All Insights
          </Link>

          {/* Category & Meta Header */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="secondary" className="font-semibold bg-primary/10 text-primary hover:bg-primary/20 text-xs px-2.5 py-0.5">
              {article.category}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.readTime}</span>
            </div>
          </div>

          {/* Article Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
            {article.title}
          </h1>

          {/* Lead Summary */}
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary/60 pl-4 italic">
            {article.summary}
          </p>

          {/* Author Card */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/60 mb-8 shadow-sm">
            <div className="flex items-center gap-3">
              <img 
                src={article.author.avatar || '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png'} 
                alt={article.author.name}
                className="w-11 h-11 rounded-full object-cover border border-primary/20"
              />
              <div>
                <h2 className="text-sm font-bold text-foreground leading-none">{article.author.name}</h2>
                <span className="text-xs text-muted-foreground font-medium">{article.author.role}</span>
              </div>
            </div>

            {/* Social Share actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleShare('linkedin')} 
                className="h-8 px-2.5 text-xs rounded-lg gap-1.5"
                title="Share on LinkedIn"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleShare()} 
                className="h-8 px-2.5 text-xs rounded-lg"
                title="Copy Link"
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Key Takeaways Box */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <Card className="mb-10 bg-primary/5 border-primary/20 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3 uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" />
                  Key Takeaways & Executive Summary
                </div>
                <ul className="space-y-2.5">
                  {article.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-normal">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Article Main Image */}
          {article.imageUrl && (
            <div className="mb-10 rounded-2xl overflow-hidden border shadow-sm">
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-auto max-h-[420px] object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* Article Body Content */}
          <div 
            className="prose prose-slate max-w-none dark:prose-invert text-base leading-relaxed space-y-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:text-foreground [&>h2]:mt-8 [&>h2]:mb-4 [&>p]:text-foreground/90 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mb-2"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-8 mt-10 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" /> Topics:
              </span>
              {article.tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs font-medium bg-muted/30">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <div className="mt-16 pt-10 border-t border-border/60">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Related Insights & Updates</h3>
                <Link to="/news" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.map((rel) => (
                  <Link 
                    key={rel.id} 
                    to={`/news/${rel.slug}`} 
                    className="group flex flex-col justify-between p-4 rounded-xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <div>
                      <Badge variant="secondary" className="text-[10px] font-semibold mb-2 bg-primary/10 text-primary">
                        {rel.category}
                      </Badge>
                      <h4 className="text-xs font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {rel.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {rel.readTime}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // NEWS HUB & AUTHORITY ARCHITECTURE VIEW (/news)
  // ─────────────────────────────────────────────────────────────
  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];
  const gridArticles = articles.filter(a => a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>News & Career Intelligence | TalentXcel</title>
        <meta 
          name="description" 
          content="Official company announcements, hiring market data, higher education trends, and platform milestones from TalentXcel Services Pvt Ltd." 
        />
        <link rel="canonical" href="https://talentxcel.in/news" />
        <meta property="og:title" content="News & Career Intelligence | TalentXcel" />
        <meta property="og:description" content="Official company announcements, hiring market data, and higher education trends." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://talentxcel.in/news" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="News & Career Intelligence | TalentXcel" />
        <meta name="twitter:description" content="Official company announcements, hiring data, and education trends." />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "TalentXcel News & Career Intelligence",
            "description": "Official company announcements, hiring market data, and higher education trends from TalentXcel Services Pvt Ltd.",
            "url": "https://talentxcel.in/news",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": articles.map((art, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "url": `https://talentxcel.in/news/${art.slug}`,
                "name": art.title
              }))
            }
          })}
        </script>
      </Helmet>

      {/* Header Banner */}
      <section className="border-b bg-gradient-to-b from-card to-background py-12 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Newspaper className="h-3.5 w-3.5" />
            Authority & Intelligence Layer
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            News & Career Intelligence
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm sm:text-base leading-relaxed">
            First-party company announcements, empirical hiring demand trends, higher education insights, and platform milestones.
          </p>

          {/* Search & Category Filter Controls */}
          <div className="max-w-md mx-auto pt-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search news, skills, hiring trends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-card border-border/80 text-sm shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="border-b bg-card/40 sticky top-16 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        {isListLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            <div className="md:col-span-3 h-72 bg-muted rounded-2xl" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-64 bg-muted rounded-xl" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-xl font-bold text-foreground">No articles match your search</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Try selecting another category tab or clearing the search query.
            </p>
            <Button 
              variant="outline" 
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              className="rounded-xl font-bold text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Featured Article Hero Spotlight */}
            {featuredArticle && !searchQuery && (
              <section>
                <Link 
                  to={`/news/${featuredArticle.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 rounded-2xl bg-card border border-border/80 hover:border-primary/40 hover:shadow-lg transition-all"
                >
                  <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground text-xs font-bold px-3 py-0.5">
                          Featured Story
                        </Badge>
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {featuredArticle.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {featuredArticle.readTime}
                        </span>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {featuredArticle.title}
                      </h2>

                      <p className="text-sm sm:text-base text-muted-foreground line-clamp-3 leading-relaxed">
                        {featuredArticle.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={featuredArticle.author.avatar || '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png'} 
                          alt={featuredArticle.author.name}
                          className="w-8 h-8 rounded-full border border-primary/20"
                        />
                        <div className="text-xs">
                          <p className="font-bold text-foreground leading-none">{featuredArticle.author.name}</p>
                          <p className="text-muted-foreground text-[10px] mt-0.5">{new Date(featuredArticle.publishedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read Story <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 rounded-xl overflow-hidden border bg-muted flex items-center">
                    <img 
                      src={featuredArticle.imageUrl} 
                      alt={featuredArticle.title}
                      className="w-full h-full min-h-[220px] max-h-[300px] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
              </section>
            )}

            {/* Articles Grid */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-foreground">
                  {selectedCategory === 'All' ? 'Latest Intelligence & Updates' : `${selectedCategory} Articles`}
                </h2>
                <span className="text-xs text-muted-foreground font-semibold">
                  {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchQuery ? articles : gridArticles).map((art) => (
                  <Link 
                    key={art.id}
                    to={`/news/${art.slug}`}
                    className="group flex flex-col justify-between rounded-2xl bg-card border border-border/80 hover:border-primary/40 hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-muted">
                      <img 
                        src={art.imageUrl} 
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <Badge className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold">
                        {art.category}
                      </Badge>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                          <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{art.readTime}</span>
                        </div>
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                          {art.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                        <span>Read full article</span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Cross-Hub Authority Ecosystem Navigator */}
        <section className="rounded-2xl p-8 bg-gradient-to-br from-card via-muted/30 to-card border border-border/80 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              Explore the TalentXcel Platform Ecosystem
            </h3>
            <p className="text-xs text-muted-foreground">
              Discover verified opportunities, build ATS-ready resumes, and verify skills across India.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Search Jobs', icon: Building2, href: '/jobs' },
              { label: 'Resume Builder', icon: Newspaper, href: '/resume' },
              { label: '10,250+ Colleges', icon: GraduationCap, href: '/colleges' },
              { label: 'Free Learning', icon: BookOpen, href: '/learning' },
              { label: 'Career Passport', icon: ShieldCheck, href: '/passport' },
              { label: 'Network & Feed', icon: Globe, href: '/network' },
            ].map((hub) => {
              const Icon = hub.icon;
              return (
                <Link
                  key={hub.href}
                  to={hub.href}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-card border border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all text-center group"
                >
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary mb-1.5 transition-colors" />
                  <span className="text-xs font-bold text-foreground group-hover:text-primary">{hub.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default NewsPage;
