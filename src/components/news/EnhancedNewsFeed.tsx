import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNewsArticles } from "@/hooks/useNewsArticles";
import { EnhancedNewsCard } from "./EnhancedNewsCard";
import { NewsHeroSection } from "./NewsHeroSection";
import { TrendingCarousel } from "./TrendingCarousel";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Star,
  Bookmark,
  Sparkles,
  Zap,
  Globe,
  Users,
  Eye,
  Flame
} from 'lucide-react';

interface EnhancedNewsFeedProps {
  variant?: 'full' | 'compact';
  maxItems?: number;
  showHero?: boolean;
}

export const EnhancedNewsFeed: React.FC<EnhancedNewsFeedProps> = ({
  variant = 'full',
  maxItems = 20,
  showHero = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending' | 'engagement'>('latest');
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  
  const { data: articles = [], isLoading, error, refetch } = useNewsArticles(maxItems);

  const categories = [
    { id: 'all', label: 'All News', icon: Globe, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { id: 'technology', label: 'Technology', icon: Zap, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { id: 'business', label: 'Business', icon: TrendingUp, color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { id: 'career', label: 'Career', icon: Star, color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { id: 'industry', label: 'Industry', icon: Users, color: 'bg-gradient-to-r from-red-500 to-red-600' },
  ];

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article =>
        article.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort articles
    switch (sortBy) {
      case 'trending':
        return filtered.sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0));
      case 'engagement':
        return filtered.sort((a, b) => (b.sentiment_score || 0) - (a.sentiment_score || 0));
      default:
        return filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }
  }, [articles, searchQuery, selectedCategory, sortBy]);

  const trendingArticles = useMemo(() => 
    articles.filter(article => article.is_trending).slice(0, 5),
    [articles]
  );

  const featuredArticle = useMemo(() => 
    articles.find(article => article.engagement_score > 8) || articles[0],
    [articles]
  );

  const handleSaveArticle = (articleId: string) => {
    setSavedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="text-center py-8">
          <div className="text-destructive mb-4">Failed to load news articles</div>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Latest News</h3>
          <Badge variant="secondary" className="animate-pulse">
            <Flame className="w-3 h-3 mr-1" />
            {articles.length} articles
          </Badge>
        </div>
        <div className="space-y-3">
          {filteredArticles.slice(0, 5).map((article) => (
            <EnhancedNewsCard
              key={article.id}
              article={article}
              variant="compact"
              isSaved={savedArticles.has(article.id)}
              onSave={() => handleSaveArticle(article.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      {showHero && featuredArticle && (
        <NewsHeroSection 
          article={featuredArticle}
          isSaved={savedArticles.has(featuredArticle.id)}
          onSave={() => handleSaveArticle(featuredArticle.id)}
        />
      )}

      {/* Trending Carousel */}
      {trendingArticles.length > 0 && (
        <TrendingCarousel 
          articles={trendingArticles}
          savedArticles={savedArticles}
          onSave={handleSaveArticle}
        />
      )}

      {/* Search and Filters */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-card via-card to-muted/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Career News & Insights
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                <Eye className="w-3 h-3 mr-1" />
                {filteredArticles.length} articles
              </Badge>
              <Button
                onClick={() => refetch()}
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10"
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, topics, or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    ${selectedCategory === category.id 
                      ? `${category.color} text-white border-0 shadow-lg` 
                      : 'hover:bg-primary/10'
                    }
                    transition-all duration-200
                  `}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Sort Options */}
          <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="latest" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Latest
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="engagement" className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                Top Rated
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Articles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <EnhancedNewsCard
            key={article.id}
            article={article}
            variant="full"
            isSaved={savedArticles.has(article.id)}
            onSave={() => handleSaveArticle(article.id)}
          />
        ))}
      </div>

      {/* Load More */}
      {filteredArticles.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground">
              No articles found matching your criteria
            </div>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};