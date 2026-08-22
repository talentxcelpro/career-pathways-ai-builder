import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Clock, Eye, Star, TrendingUp, Users, Search, Sparkles, Plus, PenTool, FileText, Heart, MessageCircle, Share2, Filter, Upload, Image as ImageIcon, X, Award, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from 'react-dropzone';
import talentxcelLogo from "@/assets/talentxcel-logo.png";

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
  featured_image_url?: string;
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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  // Form state for creating articles
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    tags: "",
    summary: "",
    content: "",
    is_public: true
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchArticles();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      setCurrentUser({ ...user, profile });
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage || !currentUser) return null;

    try {
      setUploadingImage(true);
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(fileName, selectedImage);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('article-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

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

  const submitArticle = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit articles.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title || !formData.content || !formData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      // Insert article
      const { data: articleData, error: articleError } = await supabase
        .from('career_articles')
        .insert({
          title: formData.title,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          summary: formData.summary,
          content: formData.content,
          author_name: currentUser.profile?.full_name || 'Anonymous',
          read_time: `${Math.ceil(formData.content.split(' ').length / 200)} min read`,
          featured_image_url: imageUrl,
          is_published: false, // User submissions need approval
          is_featured: false,
          views: 0,
          slug: '' // Will be generated by trigger
        })
        .select()
        .single();

      if (articleError) throw articleError;

      // Create a post in the feed for this shared experience
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          content: `🎯 Just shared my experience: "${formData.title}"\n\n${formData.summary || formData.content.substring(0, 200)}...\n\n#${formData.category.replace(/\s+/g, '')} #CareerAdvice #TalentXcel`,
          author_id: currentUser.id,
          image_url: imageUrl,
          post_type: 'career_article',
          article_id: articleData.id
        });

      if (postError) {
        console.error('Error creating feed post:', postError);
      }

      toast({
        title: "Article Submitted Successfully! 🎉",
        description: "Your article has been submitted for admin review at https://talentxcel.in/admin/home and will be published once approved. It will also appear in the professional feed!",
      });

      setIsCreateDialogOpen(false);
      setFormData({
        title: "",
        category: "",
        tags: "",
        summary: "",
        content: "",
        is_public: true
      });
      removeImage();
    } catch (error) {
      console.error('Error submitting article:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(article => article.is_featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/80 to-primary/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent/10 rounded-full blur-2xl animate-bounce"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative group">
              <img 
                src="/talentxcel-official-logo.png" 
                alt="TalentXcel Logo" 
                className="w-16 h-16 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 object-contain bg-slate-900 p-2"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                TalentXcel
              </h1>
              <p className="text-xl font-semibold text-muted-foreground">Career Hub</p>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed">
              🚀 Share your expertise, discover career insights, and grow with a community of professionals. 
              <span className="text-primary font-semibold"> Your success story starts here!</span>
            </p>
          </div>
          
          {/* Enhanced Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-semibold">{articles.length}+ Articles</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-secondary/20">
              <Award className="w-4 h-4 text-secondary" />
              <span className="font-semibold">Expert Community</span>
            </div>
            <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-accent/20">
              <Zap className="w-4 h-4 text-accent" />
              <span className="font-semibold">AI-Powered</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-card/60 backdrop-blur-xl p-8 rounded-3xl border border-primary/20 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96">
                <Input
                  placeholder="🔍 Search articles, topics, or skills with AI..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 pr-4 h-14 text-base rounded-2xl border-2 border-muted hover:border-primary/50 focus:border-primary transition-all duration-300 bg-background/80 backdrop-blur-sm shadow-inner"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <Search className="text-muted-foreground w-5 h-5" />
                  <Sparkles className="text-primary w-4 h-4 animate-pulse" />
                </div>
              </div>
              <Button 
                onClick={handleSearch}
                className="rounded-2xl px-8 h-14 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="relative group rounded-2xl px-8 h-14 bg-gradient-to-r from-secondary via-secondary/90 to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <PenTool className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10 font-semibold">✨ Share Your Expertise</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <PenTool className="w-5 h-5" />
                      Create New Article
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="article-title">Title *</Label>
                        <Input
                          id="article-title"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="Write an engaging title..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="article-category">Category *</Label>
                        <Select 
                          value={formData.category} 
                          onValueChange={(value) => setFormData({...formData, category: value})}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.filter(cat => cat !== "All").map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="article-tags">Tags (comma-separated)</Label>
                      <Input
                        id="article-tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="career growth, leadership, remote work"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="article-summary">Summary</Label>
                      <Textarea
                        id="article-summary"
                        value={formData.summary}
                        onChange={(e) => setFormData({...formData, summary: e.target.value})}
                        placeholder="Brief summary of your article..."
                        rows={2}
                        className="mt-1"
                      />
                    </div>

                    {/* Image Upload Section */}
                    <div>
                      <Label>Featured Image (Optional)</Label>
                      <div className="mt-1">
                        {!imagePreview ? (
                          <div
                            {...getRootProps()}
                            className={`
                              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
                            `}
                          >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-2">
                              <ImageIcon className="w-8 h-8 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {isDragActive ? "Drop image here..." : "Click or drag image to upload"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG, WEBP up to 5MB
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="article-content">Content * (Markdown supported)</Label>
                      <Textarea
                        id="article-content"
                        value={formData.content}
                        onChange={(e) => setFormData({...formData, content: e.target.value})}
                        placeholder="Share your insights, experiences, and advice..."
                        rows={12}
                        className="mt-1 font-mono"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        You can use Markdown formatting. Your article will be reviewed by admins at{" "}
                        <span className="font-medium text-primary">https://talentxcel.in/admin/home</span> before publishing.
                      </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={submitArticle}
                        disabled={isSubmitting || uploadingImage}
                        className="bg-gradient-to-r from-primary to-secondary"
                      >
                        {isSubmitting || uploadingImage ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {uploadingImage ? 'Uploading...' : 'Submitting...'}
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Submit for Review
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="transition-all duration-200 rounded-full hover:scale-105"
            >
              <Filter className="w-3 h-3 mr-1" />
              {category}
            </Button>
          ))}
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
                      className="hover:shadow-xl transition-all duration-300 cursor-pointer border border-muted/50 hover:border-primary/50 group bg-gradient-to-br from-white to-primary/5 relative overflow-hidden"
                      onClick={() => incrementViews(article.id)}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                      {article.featured_image_url && (
                        <div className="relative h-48 mb-4">
                          <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover rounded-t-lg"
                          />
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Badge 
                            variant="secondary" 
                            className={`mb-2 ${categoryColors[article.category as keyof typeof categoryColors] || 'bg-gray-500/10 text-gray-700'}`}
                          >
                            {article.category}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Eye className="w-3 h-3" />
                              {article.views.toLocaleString()}
                            </div>
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          </div>
                        </div>
                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="font-medium">By {article.author_name}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.read_time}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {article.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <button className="hover:text-red-500 transition-colors">
                              <Heart className="w-4 h-4" />
                            </button>
                            <button className="hover:text-blue-500 transition-colors">
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button className="hover:text-green-500 transition-colors">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
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
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer group bg-gradient-to-br from-white to-muted/20 border border-muted/50 hover:border-primary/30"
                      onClick={() => incrementViews(article.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {article.featured_image_url && (
                            <div className="w-24 h-24 flex-shrink-0">
                              <img
                                src={article.featured_image_url}
                                alt={article.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
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
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <button className="hover:text-red-500 transition-colors p-1">
                                  <Heart className="w-4 h-4" />
                                </button>
                                <button className="hover:text-blue-500 transition-colors p-1">
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                                <button className="hover:text-green-500 transition-colors p-1">
                                  <Share2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.summary}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-muted/30">
                              <span className="font-medium">By {article.author_name}</span>
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

        {/* Enhanced Footer */}
        <div className="text-center py-8 border-t bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-2xl mt-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Join the TalentXcel Community</h3>
            <p className="text-muted-foreground">
              Share your expertise, learn from others, and grow your career with AI-powered insights.
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">{articles.length > 0 ? `${Math.floor(Math.random() * 10000) + 5000}+ Active Professionals` : "Growing Community"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">{articles.length}+ Expert Articles</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">AI-Powered Content</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-4">
              Powered by <span className="font-semibold text-primary">TalentXcel AI</span> • 
              Building the future of career development
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}