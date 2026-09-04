import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  PenTool, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Users,
  Filter,
  Plus,
  Newspaper
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArticleCard } from '@/components/posts/ArticleCard';
import { ArticleCreateForm } from '@/components/posts/ArticleCreateForm';
import { useArticleSubscriptions } from '@/hooks/useArticleSubscriptions';

const Articles = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { subscriptions, isSubscribedTo } = useArticleSubscriptions(user?.id);

  const categories = [
    { value: 'all', label: 'All Articles', icon: BookOpen },
    { value: 'news', label: 'News', icon: Newspaper },
    { value: 'opinion', label: 'Opinion', icon: Users },
    { value: 'tutorial', label: 'Tutorial', icon: BookOpen },
    { value: 'industry_update', label: 'Industry Update', icon: TrendingUp },
    { value: 'career_advice', label: 'Career Advice', icon: Users },
    { value: 'technology', label: 'Technology', icon: BookOpen },
    { value: 'business', label: 'Business', icon: TrendingUp },
    { value: 'other', label: 'Other', icon: BookOpen }
  ];

  // Fetch articles based on filters
  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles', activeTab, selectedCategory, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select('*')
        .in('post_type', ['article', 'career_article'])
        .order('created_at', { ascending: false });

      // Filter by following if needed
      if (activeTab === 'following' && subscriptions?.length) {
        const followedAuthorIds = subscriptions.map(sub => sub.author_id);
        query = query.in('author_id', followedAuthorIds).eq('status', 'published');
      } else if (activeTab === 'my-articles' && user) {
        // Show both published and saved drafts for the current user
        query = query.or(`author_id.eq.${user.id},user_id.eq.${user.id}`);
      } else {
        if (user) {
          query = query.or(`status.eq.published,author_id.eq.${user.id},user_id.eq.${user.id}`);
        } else {
          query = query.eq('status', 'published');
        }
      }

      // Filter by category
      if (selectedCategory !== 'all') {
        query = query.eq('article_category', selectedCategory);
      }

      // Search filter
      if (searchQuery.trim()) {
        query = query.or(`headline.ilike.%${searchQuery}%,tagline.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data: postsData, error } = await query.limit(20);
      if (error) throw error;

      if (!postsData || postsData.length === 0) return [];

      // Get unique author IDs
      const authorIds = [...new Set(postsData.map(post => post.author_id))];

      // Get profiles for all authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          profile_picture_url,
          title,
          current_company
        `)
        .in('id', authorIds);

      if (profilesError) console.error('Profile fetch error:', profilesError);

      // Create a map of profiles by ID
      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

      // Combine posts with their profiles
      return postsData.map(post => ({
        ...post,
        profiles: profilesMap.get(post.author_id) || null
      }));
    }
  });

  // Get trending articles
  const { data: trendingArticles } = useQuery({
    queryKey: ['trendingArticles'],
    queryFn: async () => {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .eq('post_type', 'article')
        .eq('status', 'published')
        .order('likes_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      if (!postsData || postsData.length === 0) return [];

      // Get unique author IDs
      const authorIds = [...new Set(postsData.map(post => post.author_id))];

      // Get profiles for all authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          profile_picture_url,
          title
        `)
        .in('id', authorIds);

      if (profilesError) console.error('Profile fetch error:', profilesError);

      // Create a map of profiles by ID
      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

      // Combine posts with their profiles
      return postsData.map(post => ({
        ...post,
        profiles: profilesMap.get(post.author_id) || null
      }));
    }
  });

  const handleArticleCreate = () => {
    setShowCreateForm(false);
    // Refresh articles
    // queryClient.invalidateQueries({ queryKey: ['articles'] });
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 p-4">
        <div className="max-w-6xl mx-auto">
          <ArticleCreateForm
            onArticleCreate={handleArticleCreate}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Articles & News</h1>
              <p className="text-gray-600 mt-2">
                Discover insights, stories, and knowledge from the community
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <PenTool className="h-4 w-4" />
              Write Article
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles by title, content, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="whitespace-nowrap"
                >
                  <category.icon className="h-4 w-4 mr-1" />
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Articles</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="my-articles">My Articles</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6 mt-6">
                {isLoading ? (
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="h-48 bg-gray-200" />
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-200 rounded mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                          <div className="h-16 bg-gray-200 rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : articles?.length ? (
                  <div className="space-y-6">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                      <p className="text-gray-600 mb-4">
                        {searchQuery || selectedCategory !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Be the first to share your knowledge with the community!'}
                      </p>
                      <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Write First Article
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="following" className="space-y-6 mt-6">
                {isLoading ? (
                  <div>Loading...</div>
                ) : articles?.length ? (
                  <div className="space-y-6">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No articles from followed authors</h3>
                      <p className="text-gray-600 mb-4">
                        Follow authors to see their latest articles here
                      </p>
                      <Button onClick={() => setActiveTab('all')}>
                        Explore All Articles
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-6 mt-6">
                {trendingArticles?.length ? (
                  <div className="space-y-6">
                    {trendingArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No trending articles yet</h3>
                      <p className="text-gray-600">Check back later for popular content</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="my-articles" className="space-y-6 mt-6">
                {isLoading ? (
                  <div>Loading...</div>
                ) : articles?.length ? (
                  <div className="space-y-6">
                    {articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <PenTool className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">You haven't written any articles yet</h3>
                      <p className="text-gray-600 mb-4">
                        Share your expertise and insights with the community
                      </p>
                      <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                        <PenTool className="h-4 w-4" />
                        Write Your First Article
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Article Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Articles Read</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Authors Following</span>
                  <Badge variant="secondary">{subscriptions?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Articles Written</span>
                  <Badge variant="secondary">3</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {['AI & Machine Learning', 'Remote Work', 'Career Growth', 'Technology Trends', 'Industry News'].map((topic) => (
                    <div key={topic} className="flex items-center justify-between">
                      <span className="text-sm">{topic}</span>
                      <Badge variant="outline" className="text-xs">Hot</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Articles Sidebar */}
            {trendingArticles?.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Articles;