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
import { BookOpen, Clock, Eye, Star, TrendingUp, Users, Search, Sparkles, Plus, PenTool, FileText, Heart, MessageCircle, Share2, Filter, Upload, Image as ImageIcon, X, Award, Zap, Edit, Trash2, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FOUNDATION_NEWS_ARTICLES } from '@/data/newsArticles';
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
  status?: string;
  author_id?: string;
}

const categories = ["All", "My Articles & Drafts", "Career Advice", "Interview Tips", "Resume Help", "Skill Development", "Industry Insights", "Market Trends"];

const categoryColors = {
  "My Articles & Drafts": "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  "Career Advice": "bg-blue-500/10 text-blue-700 border-blue-200",
  "Interview Tips": "bg-green-500/10 text-green-700 border-green-200", 
  "Resume Help": "bg-purple-500/10 text-purple-700 border-purple-200",
  "Skill Development": "bg-orange-500/10 text-orange-700 border-orange-200",
  "Industry Insights": "bg-red-500/10 text-red-700 border-red-200",
  "Market Trends": "bg-teal-500/10 text-teal-700 border-teal-200"
};

export function CareerContentHub() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
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

  const getFallbackArticles = (): Article[] => {
    return (FOUNDATION_NEWS_ARTICLES || []).slice(0, 8).map((a: any) => ({
      id: a.id,
      title: a.title,
      slug: a.slug || a.id,
      category: a.category || "Career Advice",
      tags: Array.isArray(a.keyTakeaways) ? a.keyTakeaways.slice(0, 3) : ["Career", "AI", "Leadership"],
      summary: a.summary || "",
      content: a.sections?.map((s: any) => `## ${s.heading}\n\n${s.body}`).join('\n\n') || a.summary || "",
      author_name: a.author?.name || "TalentXcel Research",
      read_time: `${a.readingTimeMinutes || 5} min read`,
      views: 1250,
      is_featured: !!a.isFeatured,
      featured_image_url: a.imageUrl || undefined,
      created_at: a.publishedAt || new Date().toISOString()
    }));
  };

  const mapPostToArticle = (post: any, profilesMap: Map<string, any>): Article => {
    const author = profilesMap.get(post.author_id);
    const words = (post.content || '').trim().split(/\s+/).filter(Boolean).length;
    const readTimeMinutes = post.reading_time || Math.max(1, Math.ceil(words / 200));

    return {
      id: post.id,
      title: post.headline || 'Untitled Article',
      slug: post.id,
      category: post.article_category || 'Career Advice',
      tags: Array.isArray(post.tags) ? post.tags : [],
      summary: post.tagline || (post.content ? post.content.substring(0, 160).replace(/[#*`\n]/g, ' ').trim() + '...' : ''),
      content: post.content || '',
      author_name: author?.full_name || 'TalentXcel Member',
      read_time: `${readTimeMinutes} min read`,
      views: post.views_count || 0,
      is_featured: !!post.is_featured,
      featured_image_url: post.featured_image_url || undefined,
      created_at: post.created_at || new Date().toISOString(),
      status: post.status || 'published',
      author_id: post.author_id || post.user_id
    };
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const user = authUser || currentUser || (await supabase.auth.getUser()).data.user;

      let query = supabase
        .from('posts')
        .select('*')
        .in('post_type', ['article', 'career_article'])
        .order('created_at', { ascending: false });

      if (user?.id) {
        query = query.or(`status.eq.published,author_id.eq.${user.id},user_id.eq.${user.id}`);
      } else {
        query = query.eq('status', 'published');
      }

      const { data: postsData, error } = await query;
      if (error) throw error;

      if (!postsData || postsData.length === 0) {
        setArticles(getFallbackArticles());
        return;
      }

      const authorIds = [...new Set(postsData.map(p => p.author_id || p.user_id).filter(Boolean))];
      let profilesMap = new Map();
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url')
          .in('id', authorIds);
        if (profiles) {
          profilesMap = new Map(profiles.map(p => [p.id, p]));
        }
      }

      const dbArticles = postsData.map(p => mapPostToArticle(p, profilesMap));
      if (dbArticles.length < 4) {
        const existingIds = new Set(dbArticles.map(a => a.id));
        const fallbacks = getFallbackArticles().filter(a => !existingIds.has(a.id));
        setArticles([...dbArticles, ...fallbacks]);
      } else {
        setArticles(dbArticles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles(getFallbackArticles());
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchArticles();
    getCurrentUser();

    // Live sync for articles feed
    const channel = supabase
      .channel('career-articles-live-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchArticles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser?.id]);

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
    maxSize: 5 * 1024 * 1024
  });

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return imagePreview;

    try {
      setUploadingImage(true);
      const user = authUser || currentUser || (await supabase.auth.getUser()).data.user;
      const userId = user?.id || 'public';
      const fileExt = selectedImage.name.split('.').pop() || 'png';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, selectedImage, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.warn('Image upload to storage error, using image preview:', uploadError);
        return imagePreview;
      }

      const { data } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName);

      return data?.publicUrl || imagePreview;
    } catch (error) {
      console.warn('Image upload exception, using image preview:', error);
      return imagePreview;
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchArticles();
      return;
    }

    try {
      setLoading(true);
      const query = searchQuery.trim();
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .eq('post_type', 'article')
        .eq('status', 'published')
        .or(`headline.ilike.%${query}%,tagline.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!postsData || postsData.length === 0) {
        const matched = getFallbackArticles().filter(a =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.summary.toLowerCase().includes(query.toLowerCase())
        );
        setArticles(matched);
        return;
      }

      const authorIds = [...new Set(postsData.map(p => p.author_id).filter(Boolean))];
      let profilesMap = new Map();
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, profile_picture_url')
          .in('id', authorIds);
        if (profiles) {
          profilesMap = new Map(profiles.map(p => [p.id, p]));
        }
      }

      setArticles(postsData.map(p => mapPostToArticle(p, profilesMap)));
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

  const handleArticleClick = (articleId: string) => {
    incrementViews(articleId);
    navigate(`/network/articles/${articleId}`);
  };

  const incrementViews = async (articleId: string) => {
    try {
      const art = articles.find(a => a.id === articleId);
      if (art) {
        await supabase
          .from('posts')
          .update({ views_count: (art.views || 0) + 1 } as any)
          .eq('id', articleId);
      }
    } catch (error) {
      // safe fallback
    }
  };

  const openNewArticleDialog = () => {
    setEditingArticleId(null);
    setFormData({
      title: "",
      category: "",
      tags: "",
      summary: "",
      content: "",
      is_public: true
    });
    setImagePreview(null);
    setSelectedImage(null);
    setIsCreateDialogOpen(true);
  };

  const handleEditDraft = (article: Article, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormData({
      title: article.title === 'Untitled Article' ? '' : article.title,
      category: article.category || "Career Advice",
      tags: (article.tags || []).join(', '),
      summary: article.summary || '',
      content: article.content || '',
      is_public: article.status === 'published'
    });
    setImagePreview(article.featured_image_url || null);
    setSelectedImage(null);
    setEditingArticleId(article.id);
    setIsCreateDialogOpen(true);
  };

  const handleQuickPublish = async (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: 'published', is_public: true } as any)
        .eq('id', articleId);
      if (error) throw error;
      toast({
        title: "Article Published! 🎉",
        description: "Your article is now live and visible to the entire community.",
      });
      await fetchArticles();
    } catch (err: any) {
      toast({
        title: "Publish Error",
        description: err.message || "Failed to publish article",
        variant: "destructive"
      });
    }
  };

  const handleDeleteDraft = async (articleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this article/draft?")) return;
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', articleId);
      if (error) throw error;
      toast({
        title: "Deleted",
        description: "Your article/draft has been removed.",
      });
      await fetchArticles();
    } catch (err: any) {
      toast({
        title: "Delete Error",
        description: err.message || "Failed to delete article",
        variant: "destructive"
      });
    }
  };

  const submitArticle = async (isDraft: boolean = false) => {
    let userToUse = authUser || currentUser;
    if (!userToUse) {
      const { data: { user } } = await supabase.auth.getUser();
      userToUse = user;
    }

    if (!userToUse) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to publish or save articles.",
        variant: "destructive"
      });
      return;
    }

    if (!isDraft && (!formData.content || !formData.content.trim())) {
      toast({
        title: "Content Required",
        description: "Please enter article content before publishing.",
        variant: "destructive"
      });
      return;
    }

    // Auto-extract title if user scrolled past title or left it empty
    let finalTitle = formData.title?.trim();
    if (!finalTitle) {
      const lines = (formData.content || '')
        .split('\n')
        .map(l => l.replace(/^#+\s*/, '').replace(/^---/, '').trim())
        .filter(l => l.length > 2);
      finalTitle = lines[0] || (isDraft ? "Untitled Draft" : "Career Insights & Perspectives");
    }

    const finalCategory = formData.category || "Career Advice";
    const statusToSave = isDraft ? 'draft' : 'published';
    const isPublic = !isDraft;

    try {
      setIsSubmitting(true);

      // Upload image if selected or use preview
      let imageUrl = imagePreview || null;
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const words = (formData.content || '').trim().split(/\s+/).filter(Boolean).length;
      const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : [finalCategory.replace(/\s+/g, '')];

      const cleanSummary = formData.summary?.trim() ||
        (formData.content || '')
          .replace(/^[#\-*\s]+/gm, '')
          .replace(/\n+/g, ' ')
          .trim()
          .substring(0, 160) + '...';

      let postError = null;

      if (editingArticleId) {
        const { error } = await supabase
          .from('posts')
          .update({
            headline: finalTitle,
            tagline: cleanSummary,
            content: (formData.content || '').trim(),
            post_type: 'article',
            article_category: finalCategory,
            tags: tagsArray,
            featured_image_url: imageUrl,
            reading_time: readingTimeMinutes,
            status: statusToSave,
            is_public: isPublic,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', editingArticleId);
        postError = error;
      } else {
        const { error } = await supabase
          .from('posts')
          .insert({
            headline: finalTitle,
            tagline: cleanSummary,
            content: (formData.content || '').trim(),
            post_type: 'article',
            article_category: finalCategory,
            tags: tagsArray,
            featured_image_url: imageUrl,
            reading_time: readingTimeMinutes,
            status: statusToSave,
            author_id: userToUse.id,
            user_id: userToUse.id,
            is_public: isPublic,
            is_featured: false,
            views_count: 0,
            likes_count: 0,
            comments_count: 0,
            shares_count: 0
          } as any);
        postError = error;
      }

      if (postError) {
        console.error('Post save error:', postError);
        throw postError;
      }

      toast({
        title: isDraft ? "Draft Saved 💾" : "Article Published! 🎉",
        description: isDraft
          ? "Your article has been saved to your drafts."
          : "Your article is now live and visible to the entire TalentXcel community.",
      });

      setIsCreateDialogOpen(false);
      setEditingArticleId(null);
      setFormData({
        title: "",
        category: "",
        tags: "",
        summary: "",
        content: "",
        is_public: true
      });
      removeImage();

      // Refresh articles list immediately
      await fetchArticles();
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentUserId = authUser?.id || currentUser?.id;
  const myArticles = articles.filter(a => currentUserId && a.author_id === currentUserId);

  const filteredArticles = articles.filter(article => {
    if (selectedCategory === "My Articles & Drafts") {
      return currentUserId && article.author_id === currentUserId;
    }
    // If it's a draft, only show it to its author
    if (article.status === 'draft') {
      return currentUserId && article.author_id === currentUserId;
    }
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesCategory;
  });

  const featuredArticles = filteredArticles.filter(article => article.is_featured && article.status === 'published');

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
              <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) setEditingArticleId(null);
              }}>
                <Button 
                  onClick={openNewArticleDialog}
                  className="relative group rounded-2xl px-8 h-14 bg-gradient-to-r from-secondary via-secondary/90 to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <PenTool className="w-5 h-5 mr-2 relative z-10" />
                  <span className="relative z-10 font-semibold">✨ Share Your Expertise</span>
                </Button>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <PenTool className="w-5 h-5" />
                      {editingArticleId ? "Edit Article / Saved Draft" : "Create New Article"}
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
                        You can use Markdown formatting. Your article will be published immediately and visible to the whole community.
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
                        type="button"
                        variant="outline"
                        onClick={() => submitArticle(true)}
                        disabled={isSubmitting || uploadingImage}
                        className="border-slate-300 hover:bg-slate-100"
                      >
                        {editingArticleId ? "Update Draft" : "Save Draft"}
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => submitArticle(false)}
                        disabled={isSubmitting || uploadingImage}
                        className="bg-gradient-to-r from-primary to-secondary text-white font-semibold"
                      >
                        {isSubmitting || uploadingImage ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {uploadingImage ? 'Uploading...' : 'Saving...'}
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            {editingArticleId ? "Update & Publish" : "Publish Article"}
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
            {/* Your Articles & Saved Drafts Section */}
            {myArticles.length > 0 && (selectedCategory === "All" || selectedCategory === "My Articles & Drafts") && (
              <div className="space-y-3 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-muted/40 dark:to-muted/20 border-2 border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                      <PenTool className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                        Your Articles &amp; Saved Drafts
                        <Badge className="bg-blue-600 text-white font-bold text-[11px] px-2 py-0.5">
                          {myArticles.length}
                        </Badge>
                      </h3>
                      <p className="text-xs text-muted-foreground">Articles and drafts created by you</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={openNewArticleDialog}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 h-8"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Write New</span>
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-1">
                  {myArticles.map((article) => (
                    <Card
                      key={article.id}
                      className="hover:shadow-md transition-all border border-slate-200 dark:border-border/60 hover:border-blue-400 bg-white dark:bg-card flex flex-col justify-between"
                    >
                      <CardContent className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Badge
                            variant="secondary"
                            className={article.status === 'draft' ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]' : 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[10px]'}
                          >
                            {article.status === 'draft' ? '📝 Saved Draft' : '✅ Published'}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">{article.read_time}</span>
                        </div>
                        <h4 
                          onClick={() => handleArticleClick(article.id)}
                          className="font-bold text-sm text-foreground line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          {article.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="text-[11px] text-muted-foreground">
                          Created {new Date(article.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>

                      <div className="px-3.5 py-2 bg-slate-50/60 dark:bg-muted/20 border-t border-slate-100 dark:border-border/40 flex items-center justify-between gap-1 rounded-b-xl">
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100/60 font-semibold gap-1"
                            onClick={(e) => handleEditDraft(article, e)}
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          {article.status === 'draft' && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 font-semibold gap-1"
                              onClick={(e) => handleQuickPublish(article.id, e)}
                            >
                              <Send className="w-3 h-3" />
                              Publish
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => handleDeleteDraft(article.id, e)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleArticleClick(article.id)}
                          className="font-semibold text-xs text-blue-600 hover:underline"
                        >
                          View &rarr;
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State for My Articles & Drafts */}
            {selectedCategory === "My Articles & Drafts" && myArticles.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-card rounded-2xl border border-slate-200 dark:border-border/60 shadow-xs space-y-4 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto">
                  <PenTool className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-foreground">No Articles or Drafts Yet</h4>
                  <p className="text-xs text-muted-foreground">
                    You haven't written or saved any articles yet. Write your thoughts and share them with the TalentXcel community.
                  </p>
                </div>
                <Button
                  onClick={openNewArticleDialog}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Write Your First Article
                </Button>
              </div>
            )}

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
                      onClick={() => handleArticleClick(article.id)}
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
                      onClick={() => handleArticleClick(article.id)}
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