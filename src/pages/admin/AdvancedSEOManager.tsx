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
import { useSEOMetadata, useCreateSEOMetadata } from '@/hooks/useAdvancedAdmin';
import { Plus, Eye, Edit, Trash2, Search, Globe, Code, Target } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const AdvancedSEOManager = () => {
  const [selectedTab, setSelectedTab] = useState('metadata');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: seoData, isLoading } = useSEOMetadata();
  const createSEOMetadata = useCreateSEOMetadata();
  
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const onSubmit = async (data: any) => {
    try {
      await createSEOMetadata.mutateAsync({
        ...data,
        keywords: data.keywords?.split(',').map((k: string) => k.trim()),
        schema_markup: data.schema_markup ? JSON.parse(data.schema_markup) : {},
        custom_meta: data.custom_meta ? JSON.parse(data.custom_meta) : {},
      });
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create SEO metadata');
    }
  };

  const generateSERPPreview = (title: string, description: string, url: string) => (
    <div className="border rounded-lg p-4 bg-gray-50 max-w-lg">
      <div className="text-xs text-green-600 mb-1">{url || 'https://talentxcel.in/page'}</div>
      <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
        {title || 'Page Title'}
      </div>
      <div className="text-gray-600 text-sm mt-1">
        {description || 'Meta description will appear here...'}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <UnifiedAdminLayout title="Advanced SEO Manager" description="Comprehensive SEO management tools">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </UnifiedAdminLayout>
    );
  }

  return (
    <UnifiedAdminLayout title="Advanced SEO Manager" description="Comprehensive SEO management tools">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              SEO Audit
            </Button>
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              Sitemap Manager
            </Button>
            <Button variant="outline" size="sm">
              <Code className="h-4 w-4 mr-2" />
              Robots.txt
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add SEO Metadata
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create SEO Metadata</DialogTitle>
                <DialogDescription>
                  Add comprehensive SEO metadata for pages, posts, or entities
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entity_type">Entity Type</Label>
                    <Select onValueChange={(value) => setValue('entity_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page">Page</SelectItem>
                        <SelectItem value="job">Job</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="blog">Blog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="page_path">Page Path</Label>
                    <Input
                      id="page_path"
                      placeholder="/example-page"
                      {...register('page_path')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    placeholder="Compelling page title..."
                    {...register('title', { required: true })}
                  />
                </div>

                <div>
                  <Label htmlFor="meta_description">Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    placeholder="Engaging meta description under 160 characters..."
                    rows={3}
                    {...register('meta_description')}
                  />
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords (comma separated)</Label>
                  <Input
                    id="keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    {...register('keywords')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="og_title">Open Graph Title</Label>
                    <Input
                      id="og_title"
                      placeholder="Social media title..."
                      {...register('og_title')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="og_image">Open Graph Image</Label>
                    <Input
                      id="og_image"
                      placeholder="https://example.com/image.jpg"
                      {...register('og_image')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="og_description">Open Graph Description</Label>
                  <Textarea
                    id="og_description"
                    placeholder="Social media description..."
                    rows={2}
                    {...register('og_description')}
                  />
                </div>

                <div>
                  <Label htmlFor="canonical_url">Canonical URL</Label>
                  <Input
                    id="canonical_url"
                    placeholder="https://talentxcel.in/canonical-page"
                    {...register('canonical_url')}
                  />
                </div>

                <div>
                  <Label>SERP Preview</Label>
                  {generateSERPPreview(
                    watch('title'),
                    watch('meta_description'),
                    watch('canonical_url')
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSEOMetadata.isPending}>
                    {createSEOMetadata.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="analysis">SEO Analysis</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="structure">Site Structure</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="metadata" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SEO Metadata Management</CardTitle>
                <CardDescription>
                  Manage meta titles, descriptions, and structured data for all pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seoData?.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{item.page_type}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {item.page_identifier}
                            </span>
                          </div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          {item.keywords && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.keywords.map((keyword: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">SEO Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">85/100</div>
                  <p className="text-sm text-muted-foreground">Good optimization</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pages Indexed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,247</div>
                  <p className="text-sm text-muted-foreground">Out of 1,502 pages</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Avg. Load Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4s</div>
                  <p className="text-sm text-muted-foreground">Good performance</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>SEO Issues</CardTitle>
                <CardDescription>Critical issues that need attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Missing meta descriptions</div>
                      <div className="text-sm text-muted-foreground">23 pages</div>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Duplicate title tags</div>
                      <div className="text-sm text-muted-foreground">15 pages</div>
                    </div>
                    <Badge variant="outline">Warning</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Broken internal links</div>
                      <div className="text-sm text-muted-foreground">8 links</div>
                    </div>
                    <Badge variant="secondary">Info</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Performance</CardTitle>
                <CardDescription>Track keyword rankings and opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Input placeholder="Search keywords..." className="max-w-sm" />
                    <Button variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Find Opportunities
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Keyword</th>
                          <th className="text-left p-2">Position</th>
                          <th className="text-left p-2">Volume</th>
                          <th className="text-left p-2">Difficulty</th>
                          <th className="text-left p-2">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2 font-medium">resume builder</td>
                          <td className="p-2">
                            <Badge variant="outline">3</Badge>
                          </td>
                          <td className="p-2">12,100</td>
                          <td className="p-2">
                            <Badge variant="secondary">Medium</Badge>
                          </td>
                          <td className="p-2 text-green-600">↗ +2</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">job search</td>
                          <td className="p-2">
                            <Badge variant="outline">7</Badge>
                          </td>
                          <td className="p-2">45,500</td>
                          <td className="p-2">
                            <Badge variant="destructive">High</Badge>
                          </td>
                          <td className="p-2 text-red-600">↘ -1</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2 font-medium">career guidance</td>
                          <td className="p-2">
                            <Badge variant="outline">12</Badge>
                          </td>
                          <td className="p-2">8,900</td>
                          <td className="p-2">
                            <Badge variant="outline">Low</Badge>
                          </td>
                          <td className="p-2 text-gray-600">- 0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Structure</CardTitle>
                <CardDescription>Manage sitemaps, redirects, and URL structure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Sitemap Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>sitemap.xml</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>jobs-sitemap.xml</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>companies-sitemap.xml</span>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Recent Redirects</h4>
                    <div className="space-y-2">
                      <div className="p-2 border rounded text-sm">
                        <div>/old-resume → /resume-builder</div>
                        <div className="text-muted-foreground">301 redirect</div>
                      </div>
                      <div className="p-2 border rounded text-sm">
                        <div>/jobs-old → /jobs</div>
                        <div className="text-muted-foreground">301 redirect</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Core Web Vitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Good</div>
                  <p className="text-sm text-muted-foreground">LCP: 2.1s</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Mobile Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78</div>
                  <p className="text-sm text-muted-foreground">Needs improvement</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Desktop Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94</div>
                  <p className="text-sm text-muted-foreground">Good</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">SEO Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-sm text-muted-foreground">Good</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedAdminLayout>
  );
};

export default AdvancedSEOManager;