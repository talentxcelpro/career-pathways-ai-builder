import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Upload, 
  X, 
  Save, 
  Send, 
  Loader2,
  Eye,
  FileText,
  Clock,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ArticleCreateFormProps {
  onArticleCreate?: (article: any) => void;
  onCancel?: () => void;
}

export const ArticleCreateForm: React.FC<ArticleCreateFormProps> = ({ 
  onArticleCreate, 
  onCancel 
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [headline, setHeadline] = useState('');
  const [tagline, setTagline] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>('');
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const categories = [
    { value: 'news', label: 'News' },
    { value: 'opinion', label: 'Opinion' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'industry_update', label: 'Industry Update' },
    { value: 'career_advice', label: 'Career Advice' },
    { value: 'technology', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'other', label: 'Other' }
  ];

  // Calculate word count and reading time
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const count = words.length;
    setWordCount(count);
    setReadingTime(Math.max(1, Math.ceil(count / 200))); // 200 words per minute
  }, [content]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      const fileName = `${user?.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('post-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('post-media')
        .getPublicUrl(fileName);

      setFeaturedImage(data.publicUrl);
      toast.success('Featured image uploaded successfully');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (submitStatus: 'draft' | 'published') => {
    // Validation
    if (!headline.trim()) {
      toast.error('Please enter a headline');
      return;
    }

    if (!tagline.trim()) {
      toast.error('Please enter a tagline');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter article content');
      return;
    }

    if (content.length < 100) {
      toast.error('Article content must be at least 100 words');
      return;
    }

    if (content.length > 3000 * 5) { // Approximate character count for 3000 words
      toast.error('Article content cannot exceed 3000 words');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    if (!featuredImage && submitStatus === 'published') {
      toast.error('Please add a featured image before publishing');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: articleData, error } = await supabase
        .from('posts')
        .insert({
          headline,
          tagline,
          content,
          post_type: 'article',
          article_category: category,
          featured_image_url: featuredImage,
          status: submitStatus,
          author_id: user?.id,
          user_id: user?.id,
          is_public: submitStatus === 'published'
        })
        .select()
        .single();

      if (error) throw error;

      onArticleCreate?.(articleData);
      
      // Reset form
      setHeadline('');
      setTagline('');
      setContent('');
      setCategory('');
      setFeaturedImage('');
      setStatus('draft');
      
      toast.success(
        submitStatus === 'published' 
          ? 'Article published successfully!' 
          : 'Article saved as draft!'
      );
    } catch (error) {
      console.error('Article creation error:', error);
      toast.error('Failed to save article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Create Article</CardTitle>
              <p className="text-sm text-muted-foreground">
                Share your knowledge with the community
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Featured Image */}
        <div className="space-y-2">
          <Label htmlFor="featured-image">Featured Image *</Label>
          {featuredImage ? (
            <div className="relative">
              <img
                src={featuredImage}
                alt="Featured"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setFeaturedImage('')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingImage ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload featured image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <Label htmlFor="headline">Headline *</Label>
          <Input
            id="headline"
            placeholder="Enter a compelling headline..."
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="text-lg font-semibold"
          />
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline *</Label>
          <Input
            id="tagline"
            placeholder="Brief description or subtitle..."
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select article category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="content">Content *</Label>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>
              {wordCount > 3000 && (
                <Badge variant="destructive" className="text-xs">
                  Too long
                </Badge>
              )}
            </div>
          </div>
          <Textarea
            id="content"
            placeholder="Write your article content here... Share your insights, experiences, and knowledge with the community."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[400px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Maximum 3000 words. Use clear paragraphs and engaging content.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Preview how your article will appear
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting || !headline || !tagline || !content}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button
              onClick={() => handleSubmit('published')}
              disabled={
                isSubmitting || 
                !headline || 
                !tagline || 
                !content || 
                !category || 
                !featuredImage ||
                wordCount > 3000
              }
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish Article
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};