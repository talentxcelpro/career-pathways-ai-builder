import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Newspaper, Eye, Calendar, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const NewsManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Fetch news articles from Supabase
  const { data: articles, isLoading } = useQuery({
    queryKey: ['news-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Create article mutation
  const createArticle = useMutation({
    mutationFn: async (articleData: any) => {
      const { data, error } = await supabase
        .from('news_articles')
        .insert(articleData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success('Article created successfully');
      setNewArticle({ title: '', content: '', excerpt: '', category: '' });
    },
    onError: (error) => {
      toast.error('Failed to create article');
      console.error(error);
    }
  });

  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: ''
  });

  const articleStats = {
    totalArticles: articles?.length || 0,
    publishedArticles: articles?.filter(a => a.status === 'published').length || 0,
    draftArticles: articles?.filter(a => a.status === 'draft').length || 0,
    totalViews: articles?.reduce((sum, a) => sum + (a.views_count || 0), 0) || 0
  };

  const handleCreateArticle = async () => {
    if (!newArticle.title || !newArticle.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    createArticle.mutate({
      ...newArticle,
      status: 'draft',
      created_by: user?.id,
      slug: newArticle.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">News Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage news articles and press releases
          </p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => setActiveTab('create')}>
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-500">
                <Newspaper className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Total Articles</h3>
                <p className="text-2xl font-bold text-primary">{articleStats.totalArticles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-green-500">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Published</h3>
                <p className="text-2xl font-bold text-primary">{articleStats.publishedArticles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-orange-500">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Drafts</h3>
                <p className="text-2xl font-bold text-primary">{articleStats.draftArticles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-purple-500">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Total Views</h3>
                <p className="text-2xl font-bold text-primary">{articleStats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Articles Overview</TabsTrigger>
          <TabsTrigger value="create">Create Article</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Articles</CardTitle>
              <CardDescription>Manage your news articles and press releases</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading articles...</div>
              ) : articles?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No articles found. Create your first article to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {articles?.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{article.title}</h3>
                          <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                              {article.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {article.views_count || 0} views
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Article</CardTitle>
              <CardDescription>Write and publish a new news article</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="article-title">Article Title *</Label>
                <Input
                  id="article-title"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter article title"
                />
              </div>

              <div>
                <Label htmlFor="article-excerpt">Excerpt</Label>
                <Textarea
                  id="article-excerpt"
                  value={newArticle.excerpt}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief summary of the article"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="article-category">Category</Label>
                <Input
                  id="article-category"
                  value={newArticle.category}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Technology, Business, Career"
                />
              </div>

              <div>
                <Label htmlFor="article-content">Content *</Label>
                <Textarea
                  id="article-content"
                  value={newArticle.content}
                  onChange={(e) => setNewArticle(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your article content here..."
                  rows={10}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateArticle} disabled={createArticle.isPending}>
                  {createArticle.isPending ? 'Creating...' : 'Create Draft'}
                </Button>
                <Button variant="outline">
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>News Analytics</CardTitle>
              <CardDescription>Track article performance and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Detailed analytics will be available once articles are published and receiving traffic.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsManagement;