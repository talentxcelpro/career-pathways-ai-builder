import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Save, 
  Loader2,
  Star,
  Calendar,
  Users,
  TrendingUp
} from "lucide-react";
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
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const categories = ["Career Advice", "Interview Tips", "Resume Help", "Skill Development", "Industry Insights", "Market Trends"];

export function CareerContentAdmin() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, published: 0, totalViews: 0 });
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    tags: "",
    summary: "",
    content: "",
    author_name: "TalentXcel Expert",
    read_time: "",
    is_featured: false,
    is_published: false
  });

  // AI Generation state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiCategory, setAiCategory] = useState("");
  const [aiTags, setAiTags] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('career_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setArticles(data || []);
      
      // Calculate stats
      const totalViews = (data || []).reduce((sum, article) => sum + (article.views || 0), 0);
      setStats({
        total: data?.length || 0,
        published: data?.filter(a => a.is_published).length || 0,
        totalViews
      });
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

  const generateWithAI = async () => {
    if (!aiPrompt.trim() || !aiCategory) {
      toast({
        title: "Missing Information",
        description: "Please provide a prompt and select a category.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      const response = await supabase.functions.invoke('ai-career-content', {
        body: { 
          action: 'generate',
          prompt: aiPrompt,
          category: aiCategory,
          tags: aiTags.split(',').map(tag => tag.trim()).filter(Boolean)
        }
      });

      if (response.error) throw response.error;

      const generatedData = response.data?.data;
      if (generatedData) {
        setFormData({
          title: generatedData.title || "",
          category: generatedData.category || aiCategory,
          tags: (generatedData.tags || []).join(', '),
          summary: generatedData.summary || "",
          content: generatedData.content || "",
          author_name: generatedData.author_name || "TalentXcel Expert",
          read_time: generatedData.read_time || "5 min read",
          is_featured: false,
          is_published: false
        });
        
        setIsGenerateDialogOpen(false);
        setIsEditDialogOpen(true);
        setSelectedArticle(null);
        
        toast({
          title: "AI Content Generated!",
          description: "Review and edit the generated content before publishing.",
        });
      }
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveArticle = async () => {
    try {
      const articleData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        slug: '' // Let the trigger generate the slug
      };

      let result;
      if (selectedArticle) {
        result = await supabase
          .from('career_articles')
          .update(articleData)
          .eq('id', selectedArticle.id);
      } else {
        result = await supabase
          .from('career_articles')
          .insert(articleData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Article ${selectedArticle ? 'updated' : 'created'} successfully!`,
      });

      setIsEditDialogOpen(false);
      fetchArticles();
      resetForm();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save article. Please try again.",
        variant: "destructive"
      });
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('career_articles')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${!currentStatus ? 'published' : 'unpublished'} successfully!`,
      });

      fetchArticles();
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update article status.",
        variant: "destructive"
      });
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('career_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article deleted successfully!",
      });

      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete article.",
        variant: "destructive"
      });
    }
  };

  const editArticle = (article: Article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      category: article.category,
      tags: (article.tags || []).join(', '),
      summary: article.summary || "",
      content: article.content || "",
      author_name: article.author_name || "TalentXcel Expert",
      read_time: article.read_time || "",
      is_featured: article.is_featured,
      is_published: article.is_published
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      tags: "",
      summary: "",
      content: "",
      author_name: "TalentXcel Expert",
      read_time: "",
      is_featured: false,
      is_published: false
    });
    setSelectedArticle(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Career Content Management</h1>
          <p className="text-muted-foreground">Manage and generate AI-powered career content</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate Article with AI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ai-prompt">Content Prompt</Label>
                  <Textarea
                    id="ai-prompt"
                    placeholder="Write a comprehensive guide on salary negotiation for software engineers..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="ai-category">Category</Label>
                  <Select value={aiCategory} onValueChange={setAiCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ai-tags">Tags (optional)</Label>
                  <Input
                    id="ai-tags"
                    placeholder="negotiation, salary, career"
                    value={aiTags}
                    onChange={(e) => setAiTags(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={generateWithAI} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Article
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedArticle ? 'Edit Article' : 'Create New Article'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Article title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({...formData, category: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={formData.author_name}
                      onChange={(e) => setFormData({...formData, author_name: e.target.value})}
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="read-time">Read Time</Label>
                    <Input
                      id="read-time"
                      value={formData.read_time}
                      onChange={(e) => setFormData({...formData, read_time: e.target.value})}
                      placeholder="5 min read"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="career, advice, tips"
                  />
                </div>

                <div>
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({...formData, summary: e.target.value})}
                    placeholder="Brief summary of the article"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content (Markdown)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Full article content in markdown format"
                    rows={12}
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({...formData, is_featured: checked})}
                    />
                    <Label htmlFor="featured">Featured Article</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData({...formData, is_published: checked})}
                    />
                    <Label htmlFor="published">Publish Immediately</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveArticle}>
                    <Save className="w-4 h-4 mr-2" />
                    {selectedArticle ? 'Update' : 'Create'} Article
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Eye className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{article.title}</h3>
                      {article.is_featured && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline">{article.category}</Badge>
                      <span>By {article.author_name}</span>
                      <span>{article.views} views</span>
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublished(article.id, article.is_published)}
                    >
                      {article.is_published ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editArticle(article)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteArticle(article.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}