import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePageBuilderPages, useCreatePage } from '@/hooks/useAdvancedAdmin';
import { Plus, Eye, Edit, Trash2, Layout, Monitor, Smartphone, Tablet, Wand2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const SmartPageBuilder = () => {
  const [selectedTab, setSelectedTab] = useState('pages');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [selectedPage, setSelectedPage] = useState(null);
  const { data: pages, isLoading } = usePageBuilderPages();
  const createPage = useCreatePage();
  
  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const pageData = {
        ...data,
        content_blocks: [
          {
            type: 'hero',
            content: {
              title: 'Welcome to TalentXcel',
              subtitle: 'Build your career with AI-powered tools',
              cta: 'Get Started',
              background: 'gradient'
            }
          }
        ],
        seo_config: {
          title: data.seo_title,
          description: data.seo_description,
          keywords: data.seo_keywords?.split(',').map((k: string) => k.trim()),
        },
        design_config: {
          theme: 'default',
          layout: 'standard',
          colors: {
            primary: '#0066cc',
            secondary: '#6c757d'
          }
        }
      };

      await createPage.mutateAsync(pageData);
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create page');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableBlocks = [
    { type: 'hero', icon: '🎯', name: 'Hero Section' },
    { type: 'features', icon: '⭐', name: 'Features Grid' },
    { type: 'testimonials', icon: '💬', name: 'Testimonials' },
    { type: 'cta', icon: '🚀', name: 'Call to Action' },
    { type: 'form', icon: '📝', name: 'Contact Form' },
    { type: 'gallery', icon: '🖼️', name: 'Image Gallery' },
    { type: 'team', icon: '👥', name: 'Team Section' },
    { type: 'pricing', icon: '💰', name: 'Pricing Table' },
  ];

  if (isLoading) {
    return (
      <UnifiedAdminLayout title="Smart Page Builder" description="Create and customize landing pages">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </UnifiedAdminLayout>
    );
  }

  return (
    <UnifiedAdminLayout title="Smart Page Builder" description="Create and customize landing pages">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Layout className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button variant="outline" size="sm">
              <Wand2 className="h-4 w-4 mr-2" />
              AI Optimize
            </Button>
            <div className="flex border rounded-lg">
              <Button
                variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('tablet')}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Page</DialogTitle>
                <DialogDescription>
                  Start building your landing page with our drag-and-drop builder
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="page_name">Page Name</Label>
                    <Input
                      id="page_name"
                      placeholder="Landing Page"
                      {...register('page_name', { required: true })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="page_slug">URL Slug</Label>
                    <Input
                      id="page_slug"
                      placeholder="landing-page"
                      {...register('page_slug', { required: true })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="page_type">Page Type</Label>
                  <Select onValueChange={(value) => setValue('page_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select page type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landing">Landing Page</SelectItem>
                      <SelectItem value="content">Content Page</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">SEO Settings</h4>
                  
                  <div>
                    <Label htmlFor="seo_title">SEO Title</Label>
                    <Input
                      id="seo_title"
                      placeholder="Amazing Landing Page | TalentXcel"
                      {...register('seo_title')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo_description">SEO Description</Label>
                    <Input
                      id="seo_description"
                      placeholder="Discover amazing opportunities with our platform..."
                      {...register('seo_description')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="seo_keywords">SEO Keywords</Label>
                    <Input
                      id="seo_keywords"
                      placeholder="landing page, career, jobs"
                      {...register('seo_keywords')}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPage.isPending}>
                    {createPage.isPending ? 'Creating...' : 'Create Page'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="editor">Page Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Pages</CardTitle>
                <CardDescription>
                  Manage your landing pages and templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pages?.map((page) => (
                    <div key={page.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{page.page_name}</h3>
                            <Badge className={getStatusColor(page.status)}>
                              {page.status}
                            </Badge>
                            <Badge variant="outline">{page.page_type}</Badge>
                            {page.is_template && (
                              <Badge variant="secondary">Template</Badge>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-2">
                            /{page.page_slug}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Views</div>
                              <div className="font-medium">1,234</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Conversions</div>
                              <div className="font-medium">89</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Conv. Rate</div>
                              <div className="font-medium">7.2%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Last Updated</div>
                              <div className="font-medium">
                                {new Date(page.updated_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedPage(page);
                              setSelectedTab('editor');
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!pages || pages.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No pages found. Create your first page to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Blocks Panel */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm">Content Blocks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {availableBlocks.map((block) => (
                      <div
                        key={block.type}
                        className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                        draggable
                      >
                        <span>{block.icon}</span>
                        <span className="text-sm">{block.name}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button size="sm" className="w-full">
                      <Wand2 className="h-4 w-4 mr-2" />
                      AI Suggest
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Page Editor */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    Page Editor
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm">
                        Publish
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`border rounded-lg p-4 min-h-96 bg-white ${
                      previewMode === 'mobile' ? 'max-w-sm mx-auto' : 
                      previewMode === 'tablet' ? 'max-w-md mx-auto' : 
                      'w-full'
                    }`}
                  >
                    {/* Hero Section Example */}
                    <div className="text-center py-12 border-b border-dashed">
                      <h1 className="text-3xl font-bold mb-4">Welcome to TalentXcel</h1>
                      <p className="text-gray-600 mb-6">Build your career with AI-powered tools</p>
                      <Button>Get Started</Button>
                    </div>
                    
                    {/* Features Section Example */}
                    <div className="py-12 border-b border-dashed">
                      <h2 className="text-2xl font-bold text-center mb-8">Our Features</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4"></div>
                          <h3 className="font-medium">AI Resume Builder</h3>
                          <p className="text-sm text-gray-600">Create professional resumes</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4"></div>
                          <h3 className="font-medium">Job Matching</h3>
                          <p className="text-sm text-gray-600">Find perfect opportunities</p>
                        </div>
                        <div className="text-center">
                          <div className="w-12 h-12 bg-primary rounded-lg mx-auto mb-4"></div>
                          <h3 className="font-medium">Career Guidance</h3>
                          <p className="text-sm text-gray-600">Expert career advice</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center py-8 text-gray-400">
                      Drop blocks here to build your page
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Properties Panel */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm">Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs">Background Color</Label>
                      <Input type="color" defaultValue="#ffffff" />
                    </div>
                    <div>
                      <Label className="text-xs">Text Color</Label>
                      <Input type="color" defaultValue="#000000" />
                    </div>
                    <div>
                      <Label className="text-xs">Padding</Label>
                      <Input placeholder="16px" />
                    </div>
                    <div>
                      <Label className="text-xs">Margin</Label>
                      <Input placeholder="8px" />
                    </div>
                    <div>
                      <Label className="text-xs">Border Radius</Label>
                      <Input placeholder="8px" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Templates</CardTitle>
                <CardDescription>
                  Pre-built templates to get started quickly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded mb-4 flex items-center justify-center">
                      <span className="text-gray-500">Landing Page</span>
                    </div>
                    <h3 className="font-medium mb-2">Product Landing</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Perfect for showcasing features and converting visitors
                    </p>
                    <Button size="sm" className="w-full">Use Template</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded mb-4 flex items-center justify-center">
                      <span className="text-gray-500">Coming Soon</span>
                    </div>
                    <h3 className="font-medium mb-2">Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Build anticipation for upcoming launches
                    </p>
                    <Button size="sm" variant="outline" className="w-full">Use Template</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded mb-4 flex items-center justify-center">
                      <span className="text-gray-500">Contact Us</span>
                    </div>
                    <h3 className="font-medium mb-2">Contact Page</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Professional contact page with forms
                    </p>
                    <Button size="sm" variant="outline" className="w-full">Use Template</Button>
                  </div>
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
                  <div className="text-2xl font-bold">12,345</div>
                  <p className="text-sm text-green-600">+15% vs last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">876</div>
                  <p className="text-sm text-green-600">+8% vs last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7.1%</div>
                  <p className="text-sm text-red-600">-2% vs last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg. Time on Page</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2:34</div>
                  <p className="text-sm text-green-600">+12% vs last month</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Page Performance</CardTitle>
                <CardDescription>Detailed analytics for each page</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Page</th>
                        <th className="text-left p-2">Views</th>
                        <th className="text-left p-2">Conversions</th>
                        <th className="text-left p-2">Conv. Rate</th>
                        <th className="text-left p-2">Avg. Time</th>
                        <th className="text-left p-2">Bounce Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages?.slice(0, 5).map((page) => (
                        <tr key={page.id} className="border-b">
                          <td className="p-2 font-medium">{page.page_name}</td>
                          <td className="p-2">1,234</td>
                          <td className="p-2">89</td>
                          <td className="p-2">7.2%</td>
                          <td className="p-2">2:45</td>
                          <td className="p-2">32%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedAdminLayout>
  );
};

export default SmartPageBuilder;