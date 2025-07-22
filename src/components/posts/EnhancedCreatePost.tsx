
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Camera, MapPin, Hash, Type, FileText, X, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EnhancedCreatePostProps {
  onPostCreated: () => void;
  defaultPostType?: 'text' | 'article';
}

export const EnhancedCreatePost: React.FC<EnhancedCreatePostProps> = ({
  onPostCreated,
  defaultPostType = 'text'
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'article'>(defaultPostType);
  const [headline, setHeadline] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        // Validate file size - 10MB for images, 50MB for videos
        const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          const maxSizeMB = file.type.startsWith('video/') ? 50 : 10;
          toast.error(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB.`);
          continue;
        }

        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          toast.error(`File ${file.name} is not supported. Please upload images or videos only.`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setMediaFiles(prev => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Media upload error:', error);
      toast.error('Failed to upload media files');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeMedia = (indexToRemove: number) => {
    setMediaFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (tagInput.trim()) {
        addTag();
      }
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please add some content to your post');
      return;
    }

    if (postType === 'article' && !headline.trim()) {
      toast.error('Please add a headline for your article');
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        content: content.trim(),
        post_type: postType,
        author_id: user?.id,
        media_urls: mediaFiles.length > 0 ? mediaFiles : null,
        tags: tags.length > 0 ? tags : null,
        location: location.trim() || null,
        headline: postType === 'article' ? headline.trim() : null,
        status: 'published'
      };

      const { error } = await supabase
        .from('posts')
        .insert([postData]);

      if (error) {
        console.error('Error creating post:', error);
        toast.error('Failed to create post: ' + error.message);
        return;
      }

      // Reset form
      setContent('');
      setHeadline('');
      setTags([]);
      setTagInput('');
      setMediaFiles([]);
      setLocation('');
      setPostType('text');

      toast.success(postType === 'article' ? 'Article published successfully!' : 'Post created successfully!');
      onPostCreated();
    } catch (error) {
      console.error('Post creation error:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const isFormValid = content.trim() && (postType === 'text' || (postType === 'article' && headline.trim()));

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Post Type Toggle */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant={postType === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPostType('text')}
            className="flex items-center space-x-2"
          >
            <Type className="h-4 w-4" />
            <span>Post</span>
          </Button>
          <Button
            variant={postType === 'article' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPostType('article')}
            className="flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Article</span>
          </Button>
        </div>

        <div className="flex space-x-3">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{generateInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            {/* Article Headline */}
            {postType === 'article' && (
              <Input
                placeholder="Article headline..."
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="text-lg font-semibold"
              />
            )}

            {/* Content Input */}
            <Textarea
              placeholder={postType === 'article' ? "Write your article content..." : "What's on your mind?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-none shadow-none focus-visible:ring-0 text-lg placeholder:text-gray-500"
            />

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="grid gap-4" style={{
                gridTemplateColumns: mediaFiles.length === 1 ? '1fr' : 
                                   mediaFiles.length === 2 ? '1fr 1fr' :
                                   'repeat(auto-fit, minmax(200px, 1fr))'
              }}>
                {mediaFiles.map((url, index) => {
                  const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg');
                  return (
                    <div key={index} className="relative group">
                      <AspectRatio ratio={isVideo ? 16/9 : 4/3} className="bg-muted rounded-lg overflow-hidden">
                        {isVideo ? (
                          <video 
                            src={url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img 
                            src={url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </AspectRatio>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMedia(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>#{tag}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Location */}
            {location && (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{location}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => setLocation('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                {/* Media Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center space-x-2"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <span>Media</span>
                </Button>

                {/* Location */}
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Add location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-32 h-8 text-sm"
                  />
                </div>

                {/* Tags */}
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Add tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-32 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  postType === 'article' ? 'Publish Article' : 'Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
