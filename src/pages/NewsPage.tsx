import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { 
  Newspaper, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Search, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Tag, 
  ChevronRight,
  Globe,
  BookOpen,
  TrendingUp,
  X,
  Layers,
  RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { newsService } from '@/services/newsService';
import { NewsCategory, NewsArchetype } from '@/types/news';
import { ARCHETYPE_CONFIG } from '@/services/news/newsFreshnessEngine';
import { NewsArticleBanner } from '@/components/news/NewsArticleBanner';

const CATEGORIES: NewsCategory[] = [
  'All',
  'Company News',
  'Career Intelligence',
  'Education Intelligence',
  'TalentXcel Network',
  'Press & Media'
];

const ARCHETYPES: (NewsArchetype | 'All')[] = [
  'All',
  'Sector Report',
  'Career Guide',
  'Industry Insider',
  'Professional Journal',
  'Trade Publication'
];

const NewsPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('All');
  const [selectedArchetype, setSelectedArchetype] = useState<NewsArchetype | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch article list for news hub
  const { data: articles = [], isLoading: isListLoading } = useQuery({
    queryKey: ['news-articles', selectedCategory, searchQuery, selectedArchetype],
    queryFn: () => newsService.getArticles(selectedCategory, searchQuery, selectedArchetype),
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
    const url = typeof window !== 'undefined' ? window.location.href : `https://talentxcel.in/news/${slug || ''}`;
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
    const formattedDate = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';

    const newsArticleSchema = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": article.title,
      "description": article.summary,
      "image": [
        `https://talentxcel.in${article.imageUrl || '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'}`
      ],
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt || article.publishedAt,
      "author": {
        "@type": "Person",
        "name": article.author?.name || 'TalentXcel Editorial Desk',
        "jobTitle": article.author?.role || 'Platform Intelligence'
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
            {article.archetype && ARCHETYPE_CONFIG[article.archetype] && (
              <Badge 
                variant="outline" 
                className={`font-bold text-xs px-2.5 py-0.5 border ${ARCHETYPE_CONFIG[article.archetype].badgeStyle}`}
              >
                {article.archetype}
              </Badge>
            )}
            <Badge variant="secondary" className="font-semibold bg-primary/10 text-primary hover:bg-primary/20 text-xs px-2.5 py-0.5">
              {article.category}
            </Badge>
            {article.editionVersion && (
              <Badge variant="outline" className="font-semibold bg-muted/40 text-foreground text-[11px] px-2 py-0.5 border-dashed">
                {article.editionVersion}
              </Badge>
            )}
            {formattedDate && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formattedDate}</span>
              </div>
            )}
            {article.readTime && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{article.readTime}</span>
              </div>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" /> 15-Day Cadence
            </span>
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
                src={article.author?.avatar || '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png'} 
                alt={article.author?.name || 'Author'}
                className="w-11 h-11 rounded-full object-cover border border-primary/20"
              />
              <div>
                <h2 className="text-sm font-bold text-foreground leading-none">{article.author?.name || 'TalentXcel Editorial Desk'}</h2>
                <span className="text-xs text-muted-foreground font-medium">{article.author?.role || 'Platform Intelligence'}</span>
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

          {/* Live Telemetry Data Snapshot */}
          {article.metricsSnapshot && (
            <div className="mb-8 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-3 mb-3 border-b border-border/60">
                <span className="font-bold uppercase tracking-wider text-[10px] text-primary flex items-center gap-1.5">
                  <RefreshCw className="h-3 w-3" /> Live Platform Telemetry & Verification Snapshot
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">15-Day Rolling Cadence</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-muted/40">
                  <div className="text-base sm:text-lg font-black text-foreground">10,250+</div>
                  <div className="text-[11px] text-muted-foreground">Accredited Colleges</div>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40">
                  <div className="text-base sm:text-lg font-black text-foreground">14,200+</div>
                  <div className="text-[11px] text-muted-foreground">Verified Jobs</div>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40">
                  <div className="text-base sm:text-lg font-black text-emerald-600">98.4%</div>
                  <div className="text-[11px] text-muted-foreground">ATS Compliance</div>
                </div>
                <div className="p-2.5 rounded-xl bg-muted/40">
                  <div className="text-base sm:text-lg font-black text-primary">37 GCC</div>
                  <div className="text-[11px] text-muted-foreground">Active Hiring Signals</div>
                </div>
              </div>
            </div>
          )}

          {/* Article Main Visual Banner */}
          <NewsArticleBanner 
            slug={article.slug} 
            category={article.category} 
            title={article.title} 
            imageUrl={article.imageUrl}
            size="detail" 
            className="mb-10 shadow-lg border border-border/80" 
          />

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
  const featuredArticle = (articles && articles.length > 0) 
    ? (articles.find(a => a.isFeatured) || articles[0]) 
    : undefined;

  // The 3 sidebar brief articles next to featured hero
  const topStories = (articles && articles.length > 0 && featuredArticle)
    ? articles.filter(a => a.id !== featuredArticle.id).slice(0, 3)
    : [];

  // Remaining articles in the bottom grid
  const remainingArticles = (articles && articles.length > 0 && featuredArticle)
    ? (searchQuery 
        ? articles 
        : articles.filter(a => a.id !== featuredArticle.id && !topStories.some(ts => ts.id === a.id)))
    : (articles || []);

  return (
    <div className="min-h-screen bg-background pb-20 w-full">
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

      {/* Hero Header Section */}
      <section className="border-b bg-gradient-to-b from-card via-card/80 to-background py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1360px] mx-auto text-center space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-extrabold uppercase tracking-wider">
            <Newspaper className="h-3.5 w-3.5" />
            Authority & Intelligence Layer
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            NEWS & CAREER INTELLIGENCE
          </h1>
          
          <p className="max-w-2xl mx-auto text-muted-foreground text-xs sm:text-sm leading-relaxed">
            First-party company announcements, empirical hiring demand trends, higher education insights, and platform milestones.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto pt-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search"
              placeholder="Search news, skills, hiring trends, scholarships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 rounded-xl bg-card border-border/80 text-xs shadow-xs focus-visible:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Unified Editorial Filter Bar */}
      <section className="border-b bg-card/90 sticky top-16 z-20 backdrop-blur-md py-2 shadow-xs">
        <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Archetype Primary Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {ARCHETYPES.map((arch) => {
              const isSelected = selectedArchetype === arch;
              const config = arch !== 'All' ? ARCHETYPE_CONFIG[arch] : null;
              return (
                <button
                  key={arch}
                  onClick={() => setSelectedArchetype(arch)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? (config 
                          ? `${config.badgeStyle} bg-card shadow-xs ring-1 ring-primary/40` 
                          : 'bg-primary text-primary-foreground border-primary shadow-xs')
                      : 'bg-card text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {arch === 'All' ? 'All Publications (20)' : arch}
                </button>
              );
            })}
          </div>

          {/* Secondary Category Filters & Cadence Badge */}
          <div className="flex items-center justify-between md:justify-end gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="h-3 w-3" /> 15-Day Cadence
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {isListLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
            <div className="lg:col-span-8 h-96 bg-muted rounded-3xl" />
            <div className="lg:col-span-4 h-96 bg-muted rounded-3xl" />
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold text-foreground">No articles match your search</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Try selecting another category or archetype tab or clearing the search query.
            </p>
            <Button 
              variant="outline" 
              onClick={() => { setSelectedCategory('All'); setSelectedArchetype('All'); setSearchQuery(''); }}
              className="rounded-xl font-bold text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            {/* Top Featured Section (Left: Hero Feature | Right: Top Briefs) */}
            {featuredArticle && !searchQuery && selectedArchetype === 'All' && selectedCategory === 'All' && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
                {/* Main Featured Article (Left 7 columns) */}
                <Link 
                  to={`/news/${featuredArticle.slug}`}
                  className="group lg:col-span-7 flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-card border border-border/80 hover:border-primary/40 hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="space-y-3.5">
                    <NewsArticleBanner 
                      slug={featuredArticle.slug} 
                      category={featuredArticle.category} 
                      title={featuredArticle.title} 
                      imageUrl={featuredArticle.imageUrl}
                      size="hero" 
                      className="shadow-md" 
                    />

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium pt-1">
                      {featuredArticle.archetype && ARCHETYPE_CONFIG[featuredArticle.archetype] && (
                        <Badge 
                          variant="outline" 
                          className={`font-bold text-[11px] px-2.5 py-0.5 border ${ARCHETYPE_CONFIG[featuredArticle.archetype].badgeStyle}`}
                        >
                          {featuredArticle.archetype}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="font-semibold bg-primary/10 text-primary text-[10px] px-2 py-0.5">
                        {featuredArticle.category}
                      </Badge>
                      {featuredArticle.editionVersion && (
                        <Badge variant="outline" className="text-[10px] bg-muted/40 border-dashed font-medium text-foreground">
                          {featuredArticle.editionVersion}
                        </Badge>
                      )}
                      <span>•</span>
                      <span>{featuredArticle.publishedAt ? new Date(featuredArticle.publishedAt).toLocaleDateString() : ''}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featuredArticle.readTime}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {featuredArticle.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-border/60">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={featuredArticle.author?.avatar || '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png'} 
                        alt={featuredArticle.author?.name || 'Author'}
                        className="w-8 h-8 rounded-full border border-primary/20 object-cover"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-foreground leading-none">{featuredArticle.author?.name || 'TalentXcel'}</p>
                        <p className="text-muted-foreground text-[10px] mt-0.5">{featuredArticle.author?.role || 'Platform Intelligence'}</p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Full Publication <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>

                {/* Top Stories Briefs (Right 5 columns) */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Top Intelligence Briefs
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2.5 flex-1 justify-between">
                    {topStories.map((story) => (
                      <Link 
                        key={story.id}
                        to={`/news/${story.slug}`}
                        className="group p-3 sm:p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/40 hover:shadow-md transition-all flex items-center gap-3.5"
                      >
                        {/* Real AI Human Photo Thumbnail */}
                        <div className="w-24 h-20 sm:w-28 sm:h-22 shrink-0 rounded-xl overflow-hidden bg-muted relative">
                          <img 
                            src={story.imageUrl || '/images/news/sector-report-executives.jpg'} 
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            {story.archetype && ARCHETYPE_CONFIG[story.archetype] ? (
                              <Badge variant="outline" className={`text-[9px] font-bold px-1.5 py-0 border ${ARCHETYPE_CONFIG[story.archetype].badgeStyle}`}>
                                {story.archetype}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0 bg-primary/10 text-primary">
                                {story.category}
                              </Badge>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium"><Clock className="h-3 w-3" /> {story.readTime}</span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {story.title}
                          </h4>

                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {story.summary}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Latest Intelligence Grid Section */}
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {selectedArchetype !== 'All' 
                      ? `${selectedArchetype} Publications` 
                      : (selectedCategory === 'All' ? 'Latest Intelligence & Analysis' : `${selectedCategory}`)}
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    {selectedArchetype !== 'All' 
                      ? ARCHETYPE_CONFIG[selectedArchetype]?.description 
                      : 'Empirical data, verified institutional updates, and strategic platform capabilities.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
                    {articles.length} {articles.length === 1 ? 'Publication' : 'Publications'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {(searchQuery || selectedArchetype !== 'All' ? articles : remainingArticles).map((art) => (
                  <Link 
                    key={art.id}
                    to={`/news/${art.slug}`}
                    className="group flex flex-col justify-between rounded-3xl bg-card border border-border/80 hover:border-primary/40 hover:shadow-xl transition-all overflow-hidden"
                  >
                    <NewsArticleBanner 
                      slug={art.slug} 
                      category={art.category} 
                      title={art.title} 
                      imageUrl={art.imageUrl}
                      size="card" 
                    />

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                          {art.archetype && ARCHETYPE_CONFIG[art.archetype] && (
                            <Badge 
                              variant="outline" 
                              className={`font-bold text-[10px] px-2 py-0.5 border ${ARCHETYPE_CONFIG[art.archetype].badgeStyle}`}
                            >
                              {art.archetype}
                            </Badge>
                          )}
                          {art.editionVersion && (
                            <span className="text-[10px] text-muted-foreground border border-border/60 rounded px-1.5 py-0.5 bg-muted/30 font-medium">
                              {art.editionVersion.split(' - ')[0]}
                            </span>
                          )}
                          <span className="text-muted-foreground">•</span>
                          <span>{art.readTime}</span>
                        </div>
                        
                        <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h3>
                        
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {art.summary}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs sm:text-sm font-bold text-primary">
                        <span>Read full publication</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Cross-Hub Authority Ecosystem Navigator */}
        <section className="rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-card via-muted/20 to-card border border-border/80 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl font-extrabold text-foreground">
              Explore the TalentXcel Platform Ecosystem
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Discover verified opportunities, build ATS-ready executive resumes, explore 10,250+ Indian colleges, and master high-demand skills.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Jobs Discovery', sub: 'Verified Openings', icon: Building2, href: '/jobs' },
              { label: 'Resume Builder', sub: '98% ATS Pass', icon: Newspaper, href: '/resume' },
              { label: '10,250+ Colleges', sub: 'NIRF & Programs', icon: GraduationCap, href: '/colleges' },
              { label: 'Free Learning', sub: '2,650+ Courses', icon: BookOpen, href: '/learning' },
              { label: 'Career Passport', sub: 'Digital Identity', icon: ShieldCheck, href: '/passport' },
              { label: 'Network & Feed', sub: 'Connect & CHATR', icon: Globe, href: '/network' },
            ].map((hub) => {
              const Icon = hub.icon;
              return (
                <Link
                  key={hub.href}
                  to={hub.href}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:bg-primary/[0.03] hover:text-primary transition-all text-center group shadow-sm"
                >
                  <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                  <span className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary block">{hub.label}</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">{hub.sub}</span>
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
