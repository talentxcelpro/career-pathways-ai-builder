import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { ContentGenerator } from '@/components/ai/ContentGenerator';
import { BulkContentGenerator } from '@/components/ai/BulkContentGenerator';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  FileText,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  category: string;
  template_type: string;
  is_approved: boolean;
  quality_score: number;
  usage_count: number;
  created_at: string;
  created_by: string;
  tags: string[];
  metadata: any;
}

export const ContentManagement = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchContentItems();
  }, []);

  const fetchContentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_content_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContentItems(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const updateContentStatus = async (id: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_content_library')
        .update({ is_approved: approved })
        .eq('id', id);

      if (error) throw error;

      setContentItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, is_approved: approved } : item
        )
      );

      toast.success(`Content ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error updating content status:', error);
      toast.error('Failed to update content status');
    }
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const { error } = await supabase
        .from('ai_content_library')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContentItems(prev => prev.filter(item => item.id !== id));
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'approved' && item.is_approved) ||
                         (statusFilter === 'pending' && !item.is_approved);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(contentItems.map(item => item.category))];

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Content Management
          </CardTitle>
          <CardDescription>
            Manage AI-generated content, approve publications, and track performance
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Content Library</TabsTrigger>
          <TabsTrigger value="generator">AI Generator</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search Content</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search titles and content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                      setStatusFilter('all');
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Content</span>
                </div>
                <p className="text-2xl font-bold">{contentItems.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Approved</span>
                </div>
                <p className="text-2xl font-bold">
                  {contentItems.filter(item => item.is_approved).length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <p className="text-2xl font-bold">
                  {contentItems.filter(item => !item.is_approved).length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Avg Quality</span>
                </div>
                <p className="text-2xl font-bold">
                  {contentItems.length > 0 
                    ? Math.round(contentItems.reduce((sum, item) => sum + item.quality_score, 0) / contentItems.length)
                    : 0
                  }%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content List */}
          <Card>
            <CardHeader>
              <CardTitle>Content Library ({filteredContent.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">Loading content...</div>
                ) : filteredContent.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No content found matching your filters
                  </div>
                ) : (
                  filteredContent.map((item) => (
                    <Card key={item.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{item.title}</h3>
                              <Badge variant={item.is_approved ? 'default' : 'secondary'}>
                                {item.is_approved ? 'Approved' : 'Pending'}
                              </Badge>
                              <Badge className={getQualityColor(item.quality_score)}>
                                Quality: {item.quality_score}%
                              </Badge>
                              <Badge variant="outline">
                                {item.category.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.content.substring(0, 150)}...
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                              <span>Usage: {item.usage_count} times</span>
                              <span>Words: {item.content.split(' ').length}</span>
                            </div>
                            
                            {item.tags && item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {!item.is_approved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateContentStatus(item.id, true)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                            )}
                            
                            {item.is_approved && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateContentStatus(item.id, false)}
                              >
                                <XCircle className="h-4 w-4 text-orange-500" />
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteContent(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generator">
          <ContentGenerator />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkContentGenerator />
        </TabsContent>
      </Tabs>

      {/* Content Preview Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedItem.title}</CardTitle>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={selectedItem.is_approved ? 'default' : 'secondary'}>
                    {selectedItem.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                  <Badge className={getQualityColor(selectedItem.quality_score)}>
                    Quality: {selectedItem.quality_score}%
                  </Badge>
                  <Badge variant="outline">
                    {selectedItem.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <Textarea
                  value={selectedItem.content}
                  readOnly
                  className="min-h-[400px]"
                />
                
                {selectedItem.metadata?.seoMetadata && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">SEO Metadata</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Title:</strong> {selectedItem.metadata.seoMetadata.title}</p>
                      <p><strong>Description:</strong> {selectedItem.metadata.seoMetadata.description}</p>
                      {selectedItem.metadata.seoMetadata.keywords && (
                        <p><strong>Keywords:</strong> {selectedItem.metadata.seoMetadata.keywords.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};