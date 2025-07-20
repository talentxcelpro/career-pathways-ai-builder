import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useContentHub, useCreateContent } from '@/hooks/useAdvancedAdmin';
import { Plus, Edit, Eye, Calendar, Send, Bot, TrendingUp, Share2, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const AdvancedContentHub = () => {
  const [selectedTab, setSelectedTab] = useState('content');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const { data: content, isLoading } = useContentHub();
  const createContent = useCreateContent();
  
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const contentData = {
        ...data,
        tags: data.tags?.split(',').map((t: string) => t.trim()),
        distribution_channels: data.distribution_channels?.split(',').map((c: string) => c.trim()),
        seo_metadata: {
          title: data.seo_title,
          description: data.seo_description,
          keywords: data.seo_keywords?.split(',').map((k: string) => k.trim()),
        },
        ai_prompts: data.ai_prompt ? { prompt: data.ai_prompt } : {},
      };

      await createContent.mutateAsync(contentData);
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create content');
    }
  };

  const generateWithAI = async (prompt: string, contentType: string) => {
    setAiGenerating(true);
    try {
      // Simulate AI generation - in real implementation, call your AI service
      setTimeout(() => {
        const generatedContent = `AI-generated ${contentType} content based on: ${prompt}
        
This is a sample of AI-generated content that would be created based on your prompt. In a real implementation, this would connect to your AI service to generate high-quality, relevant content.

Key points covered:
- Topic relevance and engagement
- SEO optimization
- Target audience alignment
- Call-to-action integration`;

        setValue('content', generatedContent);
        setValue('ai_prompt', prompt);
        setAiGenerating(false);
        toast.success('Content generated successfully!');
      }, 2000);
    } catch (error) {
      setAiGenerating(false);
      toast.error('Failed to generate content');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <UnifiedAdminLayout title="Advanced Content Hub" description="AI-powered content creation and management">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </UnifiedAdminLayout>
    );
  }

  return (
    <UnifiedAdminLayout title="Advanced Content Hub" description="AI-powered content creation and management">
      <div className="space-y-6">
        {/* Content Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{content?.length || 0}</div>
              <p className="text-sm text-green-600">+5 this week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {content?.filter(c => c.status === 'published').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Live content</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {content?.filter(c => c.status === 'scheduled').length || 0}
              </div>
              <p className="text-sm text-blue-600">Upcoming</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">AI Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {content?.filter(c => c.ai_generated).length || 0}
              </div>
              <p className="text-sm text-purple-600">By AI</p>
            </CardContent>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Bot className="h-4 w-4 mr-2" />
              AI Content Ideas
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Content Calendar
            </Button>
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Content
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Content</DialogTitle>
                <DialogDescription>
                  Create engaging content with AI assistance
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Content Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter content title..."
                      {...register('title', { required: true })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content_type">Content Type</Label>
                    <Select onValueChange={(value) => setValue('content_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt/Summary</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Brief summary of the content..."
                    rows={2}
                    {...register('excerpt')}
                  />
                </div>

                {/* AI Content Generation */}
                <div className="border rounded-lg p-4 bg-purple-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-5 w-5 text-purple-600" />
                    <Label className="text-purple-900 font-medium">AI Content Generation</Label>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Describe what content you want to generate..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const prompt = e.currentTarget.value;
                          if (prompt) {
                            generateWithAI(prompt, watch('content_type') || 'blog');
                          }
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={aiGenerating}
                        onClick={() => {
                          const input = document.querySelector('input[placeholder*="Describe"]') as HTMLInputElement;
                          if (input?.value) {
                            generateWithAI(input.value, watch('content_type') || 'blog');
                          }
                        }}
                      >
                        {aiGenerating ? 'Generating...' : 'Generate Content'}
                      </Button>
                      <Button type="button" size="sm" variant="ghost">
                        Generate Ideas
                      </Button>
                      <Button type="button" size="sm" variant="ghost">
                        Optimize SEO
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your content here or generate with AI..."
                    rows={10}
                    {...register('content', { required: true })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      placeholder="ai, jobs, career, technology"
                      {...register('tags')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="distribution_channels">Distribution Channels</Label>
                    <Input
                      id="distribution_channels"
                      placeholder="website, email, social"
                      {...register('distribution_channels')}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">SEO Settings</h4>
                  
                  <div>
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      placeholder="SEO optimized title..."
                      {...register('seo_title')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Input
                      id="seo_description"
                      placeholder="Meta description for search engines..."
                      {...register('seo_description')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo_keywords">SEO Keywords</Label>
                    <Input
                      id="seo_keywords"
                      placeholder="target keywords, comma separated"
                      {...register('seo_keywords')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select onValueChange={(value) => setValue('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="publish_date">Publish Date</Label>
                    <Input
                      id="publish_date"
                      type="datetime-local"
                      {...register('publish_date')}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="outline">
                    Save Draft
                  </Button>
                  <Button type="submit" disabled={createContent.isPending}>
                    {createContent.isPending ? 'Creating...' : 'Create Content'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">All Content</TabsTrigger>
            <TabsTrigger value="calendar">Content Calendar</TabsTrigger>
            <TabsTrigger value="analytics">Performance</TabsTrigger>
            <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Library</CardTitle>
                <CardDescription>
                  Manage your content across all channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content?.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{item.title}</h3>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <Badge variant="outline">{item.content_type}</Badge>
                            {item.ai_generated && (
                              <Badge variant="secondary">AI Generated</Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.excerpt}
                          </p>
                          
                          {item.tags && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {item.tags.map((tag: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Created</div>
                              <div className="font-medium">
                                {new Date(item.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Views</div>
                              <div className="font-medium">
                                {item.performance_metrics?.views || 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Engagement</div>
                              <div className="font-medium">
                                {item.performance_metrics?.engagement_rate || '0%'}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Distribution</div>
                              <div className="font-medium">
                                {item.distribution_channels?.length || 0} channels
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!content || content.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No content found. Create your first content to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>Plan and schedule your content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center font-medium p-2 bg-gray-50 rounded">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => (
                    <div key={i} className="aspect-square border rounded p-1 text-sm">
                      <div className="font-medium">{((i % 31) + 1)}</div>
                      {i % 7 === 1 && (
                        <div className="text-xs bg-blue-100 text-blue-800 rounded px-1 mt-1">
                          Blog Post
                        </div>
                      )}
                      {i % 7 === 3 && (
                        <div className="text-xs bg-green-100 text-green-800 rounded px-1 mt-1">
                          Newsletter
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24,567</div>
                  <p className="text-sm text-green-600">+12% vs last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Engagement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6.8%</div>
                  <p className="text-sm text-green-600">+2.1% vs last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Top Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">AI Resume Guide</div>
                  <p className="text-sm text-muted-foreground">3,456 views</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-sm text-muted-foreground">Content AI-generated</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Content Generator</CardTitle>
                  <CardDescription>Generate content with AI assistance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Blog Post
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Generate Email
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Generate Social Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>AI Content Optimizer</CardTitle>
                  <CardDescription>Enhance existing content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      SEO Optimization
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Bot className="h-4 w-4 mr-2" />
                      Readability Check
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Content Rewrite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedAdminLayout>
  );
};

export default AdvancedContentHub;