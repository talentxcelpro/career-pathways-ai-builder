
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Image, Video, MapPin, Hash, X, Upload, Smile } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface EnhancedCreatePostProps {
  onPostCreated?: () => void;
  defaultPostType?: 'post' | 'article';
}

export const EnhancedCreatePost: React.FC<EnhancedCreatePostProps> = ({ 
  onPostCreated,
  defaultPostType = 'post'
}) => {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'post' | 'article'>(defaultPostType);
  const [headline, setHeadline] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File, type: 'image' | 'video') => {
    const maxImageSize = 10 * 1024 * 1024; // 10MB for images
    const maxVideoSize = 50 * 1024 * 1024; // 50MB for videos
    
    if (type === 'image') {
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      if (file.size > maxImageSize) {
        throw new Error('Image size must be less than 10MB');
      }
    } else if (type === 'video') {
      if (!file.type.startsWith('video/')) {
        throw new Error('Please select a valid video file');
      }
      if (file.size > maxVideoSize) {
        throw new Error('Video size must be less than 50MB');
      }
    }
  };

  const handleFileUpload = async (files: FileList | null, type: 'image' | 'video') => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        validateFile(file, type);

        const fileName = `${user?.id}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const { data } = supabase.storage
          .from('post-media')
          .getPublicUrl(fileName);

        uploadedUrls.push(data.publicUrl);
      }

      setMediaFiles(prev => [...prev, ...uploadedUrls]);
      
      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} file(s) uploaded successfully`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (urlToRemove: string) => {
    setMediaFiles(prev => prev.filter(url => url !== urlToRemove));
  };

  const getMediaType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image';
    if (['mp4', 'webm', 'ogg', 'mov'].includes(extension || '')) return 'video';
    return 'file';
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast.success('Location detected successfully');
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to get your location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error('Please add some content or media to your post');
      return;
    }

    if (postType === 'article' && !headline.trim()) {
      toast.error('Please add a headline for your article');
      return;
    }

    setIsPosting(true);

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          post_type: postType,
          headline: postType === 'article' ? headline.trim() : null,
          author_id: user?.id,
          tags: tags.length > 0 ? tags : null,
          media_urls: mediaFiles.length > 0 ? mediaFiles : null,
          location: location || null,
          status: 'published'
        });

      if (error) throw error;

      // Reset form
      setContent('');
      setHeadline('');
      setTags([]);
      setCurrentTag('');
      setMediaFiles([]);
      setLocation('');
      setShowLocationInput(false);
      
      toast.success(`${postType === 'article' ? 'Article' : 'Post'} created successfully!`);
      onPostCreated?.();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(`Failed to create ${postType}`);
    } finally {
      setIsPosting(false);
    }
  };

  const generateInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(' ');
      if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
      }
      return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Post Type Toggle */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant={postType === 'post' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPostType('post')}
          >
            Post
          </Button>
          <Button
            variant={postType === 'article' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPostType('article')}
          >
            Article
          </Button>
        </div>

        <div className="flex space-x-3">
          <Avatar>
            <AvatarImage src={profile?.profile_picture_url} />
            <AvatarFallback>{generateInitials()}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            {/* Article Headline */}
            {postType === 'article' && (
              <input
                type="text"
                placeholder="Article headline..."
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full text-xl font-bold border-none outline-none bg-transparent placeholder:text-muted-foreground"
              />
            )}

            <Textarea
              placeholder={postType === 'article' ? "Write your article..." : "What's on your mind?"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-none resize-none focus:ring-0 text-lg p-0"
              rows={postType === 'article' ? 8 : 3}
            />

            {/* Tags */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Add tags..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={addTag}
                  className="flex-1 border-none outline-none bg-transparent placeholder:text-muted-foreground"
                />
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>#{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Media Preview */}
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {mediaFiles.map((url, index) => (
                  <div key={index} className="relative group">
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                      {getMediaType(url) === 'image' ? (
                        <img 
                          src={url} 
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video 
                          src={url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </AspectRatio>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={() => removeMedia(url)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Location Display */}
            {showLocationInput && (
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter location or use GPS"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={getCurrentLocation}
                >
                  GPS
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowLocationInput(false);
                    setLocation('');
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileUpload(e.target.files, 'image')}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={(e) => handleFileUpload(e.target.files, 'video')}
                  accept="video/*"
                  className="hidden"
                />
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Image className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Photo'}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-green-600 hover:bg-green-50"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </Button>
              </div>

              <Button 
                onClick={handlePost}
                disabled={isPosting || isUploading || (!content.trim() && mediaFiles.length === 0)}
                className="bg-primary hover:bg-primary/90"
              >
                {isPosting ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    {postType === 'article' ? 'Publishing...' : 'Posting...'}
                  </>
                ) : (
                  `${postType === 'article' ? 'Publish Article' : 'Post'}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
