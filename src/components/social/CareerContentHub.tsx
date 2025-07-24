import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Eye, Star, TrendingUp, Users, Search, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  summary: string;
  content: string;
  author_name: string;
  read_time: string;
  views: number;
  is_featured: boolean;
  created_at: string;
}

const categories = ["All", "Career Advice", "Interview Tips", "Resume Help", "Skill Development", "Industry Insights", "Market Trends"];

const categoryColors = {
  "Career Advice": "bg-blue-500/10 text-blue-700 border-blue-200",
  "Interview Tips": "bg-green-500/10 text-green-700 border-green-200", 
  "Resume Help": "bg-purple-500/10 text-purple-700 border-purple-200",
  "Skill Development": "bg-orange-500/10 text-orange-700 border-orange-200",
  "Industry Insights": "bg-red-500/10 text-red-700 border-red-200",
  "Market Trends": "bg-teal-500/10 text-teal-700 border-teal-200"
};

export function CareerContentHub() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('career_articles')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to load articles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchArticles();
      return;
    }

    try {
      setLoading(true);
      const response = await supabase.functions.invoke('ai-career-content', {
        body: { 
          action: 'search',
          searchQuery: searchQuery.trim()
        }
      });

      if (response.error) throw response.error;
      setArticles(response.data?.data || []);
    } catch (error) {
      console.error('Error searching articles:', error);
      toast({
        title: "Search Error",
        description: "Failed to search articles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (articleId: string) => {
    try {
      await supabase.functions.invoke('ai-career-content', {
        body: { 
          action: 'increment_views',
          articleId
        }
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(article => article.is_featured);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TalentXcel Career Hub
          </h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Expert advice, real insights, and AI-powered content to grow your career.
        </p>
      </div>

      {/* AI-Powered Search */}
      <div className="space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <Input
            placeholder="Search articles, topics, or skills with AI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-20 h-12 text-base rounded-full border-2 border-muted focus:border-primary transition-all duration-200"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Button 
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full px-6"
            size="sm"
          >
            Search
          </Button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="transition-all duration-200 rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading articles...</p>
        </div>
      ) : (
        <>
          {/* Featured Articles */}
          {selectedCategory === "All" && featuredArticles.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Featured Articles
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {featuredArticles.map((article) => (
                  <Card 
                    key={article.id} 
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary group"
                    onClick={() => incrementViews(article.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge 
                          variant="secondary" 
                          className={`mb-2 ${categoryColors[article.category as keyof typeof categoryColors] || 'bg-gray-500/10 text-gray-700'}`}
                        >
                          {article.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {article.views.toLocaleString()}
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>By {article.author_name}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.read_time}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Articles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {selectedCategory === "All" ? "Latest Articles" : `${selectedCategory} Articles`}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                {filteredArticles.length} articles
              </div>
            </div>
            
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search terms" : "No articles available for this category"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredArticles.map((article) => (
                  <Card 
                    key={article.id} 
                    className="hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => incrementViews(article.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${categoryColors[article.category as keyof typeof categoryColors] || 'bg-gray-500/10 text-gray-700'}`}
                            >
                              {article.category}
                            </Badge>
                            {article.is_featured && (
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <h4 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {article.summary}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>By {article.author_name}</span>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {article.read_time}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {article.views.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="text-center py-6 border-t">
        <p className="text-sm text-muted-foreground">
          Content curated and powered by <strong className="text-primary">TalentXcel AI</strong>
        </p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {articles.length > 0 ? `${Math.floor(Math.random() * 10000) + 5000}+ readers` : "Growing community"}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {articles.length}+ articles
          </div>
        </div>
      </div>
    </div>
  );
}