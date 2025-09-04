import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { 
  PenTool, Calendar, Image, Video, FileText, 
  Sparkles, Clock, Send, Save, Eye, BarChart3,
  TrendingUp, Users, Heart, MessageCircle, Share2,
  Palette, Type, Layout, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  template_data: {
    sections: Array<{
      type: 'text' | 'image' | 'video' | 'poll' | 'quote';
      content?: string;
      placeholder?: string;
    }>;
  };
  usage_count: number;
}

interface ScheduledPost {
  id: string;
  content: string;
  scheduled_for: string;
  status: 'scheduled' | 'published' | 'failed';
  post_type: string;
  engagement_prediction: number;
}

export const ContentCreationStudio: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('composer');
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  
  const [postForm, setPostForm] = useState({
    content: '',
    headline: '',
    post_type: 'text' as 'text' | 'image' | 'video' | 'article' | 'poll',
    visibility: 'public' as 'public' | 'connections' | 'private',
    tags: [] as string[],
    scheduled_for: ''
  });

  // Fetch content templates
  const { data: templates = [] } = useQuery({
    queryKey: ['content-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      return data as ContentTemplate[];
    }
  });

  // Fetch scheduled posts
  const { data: scheduledPosts = [] } = useQuery({
    queryKey: ['scheduled-posts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('author_id', user.id)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data as ScheduledPost[];
    },
    enabled: !!user?.id
  });

  // Fetch content analytics
  const { data: analytics } = useQuery({
    queryKey: ['content-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: posts } = await supabase
        .from('posts')
        .select('likes_count, comments_count, shares_count, views_count, created_at')
        .eq('author_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!posts) return null;

      const totalEngagement = posts.reduce((sum, post) => 
        sum + (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0), 0);
      const totalViews = posts.reduce((sum, post) => sum + (post.views_count || 0), 0);
      const avgEngagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

      return {
        totalPosts: posts.length,
        totalEngagement,
        totalViews,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        bestPerformingDay: 'Tuesday', // Mock data
        optimalPostTime: '10:00 AM' // Mock data
      };
    },
    enabled: !!user?.id
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: typeof postForm & { author_id: string }) => {
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      setPostForm({
        content: '',
        headline: '',
        post_type: 'text',
        visibility: 'public',
        tags: [],
        scheduled_for: ''
      });
      toast.success('Post created successfully!');
    },
    onError: () => {
      toast.error('Failed to create post');
    }
  });

  // Schedule post mutation
  const schedulePostMutation = useMutation({
    mutationFn: async (postData: typeof postForm & { author_id: string }) => {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          ...postData,
          status: 'scheduled' as const
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
      toast.success('Post scheduled successfully!');
    },
    onError: () => {
      toast.error('Failed to schedule post');
    }
  });

  const handleCreatePost = () => {
    if (!user?.id || !postForm.content.trim()) return;

    if (postForm.scheduled_for) {
      schedulePostMutation.mutate({
        ...postForm,
        author_id: user.id
      });
    } else {
      createPostMutation.mutate({
        ...postForm,
        author_id: user.id
      });
    }
  };

  const applyTemplate = (template: ContentTemplate) => {
    const content = template.template_data.sections
      .map(section => section.placeholder || section.content || '')
      .join('\n\n');
    
    setPostForm(prev => ({
      ...prev,
      content,
      headline: template.title
    }));
    setSelectedTemplate(template);
  };

  const getEngagementPrediction = (content: string): number => {
    // Simple engagement prediction based on content characteristics
    let score = 50;
    
    if (content.includes('?')) score += 10; // Questions increase engagement
    if (content.includes('#')) score += 5; // Hashtags help
    if (content.length > 100 && content.length < 300) score += 10; // Optimal length
    if (content.includes('💡') || content.includes('🚀')) score += 5; // Emojis
    
    return Math.min(Math.max(score, 0), 100);
  };

  const engagementPrediction = getEngagementPrediction(postForm.content);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Content Creation Studio</h1>
        <p className="text-muted-foreground text-lg">
          Create, schedule, and optimize your professional content with AI-powered insights
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="composer">
            <PenTool className="h-4 w-4 mr-2" />
            Composer
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Layout className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="scheduler">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduler
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="composer" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Composer */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Create Professional Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Headline (Optional)</label>
                    <Input
                      placeholder="Add an engaging headline..."
                      value={postForm.headline}
                      onChange={(e) => setPostForm(prev => ({ ...prev, headline: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Content</label>
                    <Textarea
                      placeholder="What's on your mind? Share your professional insights..."
                      value={postForm.content}
                      onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                      className="min-h-[200px]"
                    />
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{postForm.content.length} characters</span>
                      <div className="flex items-center gap-2">
                        <span>Engagement Prediction:</span>
                        <Badge 
                          variant={engagementPrediction > 75 ? 'default' : engagementPrediction > 50 ? 'secondary' : 'outline'}
                        >
                          {engagementPrediction}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Post Type</label>
                      <Select value={postForm.post_type} onValueChange={(value: any) => setPostForm(prev => ({ ...prev, post_type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">
                            <div className="flex items-center gap-2">
                              <Type className="h-4 w-4" />
                              Text Post
                            </div>
                          </SelectItem>
                          <SelectItem value="image">
                            <div className="flex items-center gap-2">
                              <Image className="h-4 w-4" />
                              Image Post
                            </div>
                          </SelectItem>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Video Post
                            </div>
                          </SelectItem>
                          <SelectItem value="article">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Article
                            </div>
                          </SelectItem>
                          <SelectItem value="poll">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Poll
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Visibility</label>
                      <Select value={postForm.visibility} onValueChange={(value: any) => setPostForm(prev => ({ ...prev, visibility: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="connections">Connections Only</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Schedule for Later (Optional)</label>
                    <Input
                      type="datetime-local"
                      value={postForm.scheduled_for}
                      onChange={(e) => setPostForm(prev => ({ ...prev, scheduled_for: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreatePost}
                      disabled={!postForm.content.trim() || createPostMutation.isPending || schedulePostMutation.isPending}
                      className="flex-1"
                    >
                      {postForm.scheduled_for ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Schedule Post
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Publish Now
                        </>
                      )}
                    </Button>
                    <Button variant="outline">
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Optimization Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    AI Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Readability</span>
                      <Badge variant="outline">Good</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Engagement Potential</span>
                      <Badge variant={engagementPrediction > 70 ? 'default' : 'secondary'}>
                        {engagementPrediction > 70 ? 'High' : engagementPrediction > 40 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>SEO Score</span>
                      <Badge variant="secondary">85/100</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Suggestions:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Add relevant hashtags for better reach</li>
                      <li>• Include a question to boost engagement</li>
                      <li>• Consider adding an image or video</li>
                      <li>• Optimal posting time: 10:00 AM</li>
                    </ul>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enhance with AI
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Media Library</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Image className="h-4 w-4 mr-1" />
                      Image
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4 mr-1" />
                      Video
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <Badge variant="secondary">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Used {template.usage_count} times
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => applyTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No scheduled posts. Create your first scheduled post!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>📅 {new Date(post.scheduled_for).toLocaleString()}</span>
                          <Badge variant={post.status === 'scheduled' ? 'default' : post.status === 'published' ? 'secondary' : 'destructive'}>
                            {post.status}
                          </Badge>
                          <span>🔮 {post.engagement_prediction}% predicted engagement</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{analytics?.totalPosts || 0}</p>
                <p className="text-sm text-muted-foreground">Posts (30 days)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 mx-auto text-red-500 mb-2" />
                <p className="text-2xl font-bold">{analytics?.totalEngagement || 0}</p>
                <p className="text-sm text-muted-foreground">Total Engagement</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Eye className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{analytics?.totalViews || 0}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">{analytics?.avgEngagementRate || 0}%</p>
                <p className="text-sm text-muted-foreground">Avg. Engagement Rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Content Performance Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Best Performing Content Types</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Video Posts</span>
                      <span className="font-medium">8.4% avg. engagement</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Image Posts</span>
                      <span className="font-medium">6.2% avg. engagement</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Text Posts</span>
                      <span className="font-medium">4.1% avg. engagement</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Optimal Posting Times</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Best Day</span>
                      <span className="font-medium">{analytics?.bestPerformingDay || 'Tuesday'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Best Time</span>
                      <span className="font-medium">{analytics?.optimalPostTime || '10:00 AM'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Peak Engagement</span>
                      <span className="font-medium">10-11 AM & 3-4 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};