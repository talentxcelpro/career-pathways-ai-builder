import React, { memo, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Video, 
  MapPin, 
  Hash, 
  Smile, 
  Send,
  X,
  Camera
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuickCreatePostProps {
  onPostCreated?: () => void;
  className?: string;
}

export const QuickCreatePost = memo<QuickCreatePostProps>(({ onPostCreated, className }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (!isExpanded && e.target.value.length > 0) {
      setIsExpanded(true);
    }
  }, [isExpanded]);

  const handleMediaSelect = useCallback((file: File) => {
    setSelectedMedia(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  }, []);

  const handleImageUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleVideoUpload = useCallback(() => {
    videoInputRef.current?.click();
  }, []);

  const removeMedia = useCallback(() => {
    setSelectedMedia(null);
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
    }
  }, [mediaPreview]);

  const extractHashtags = useCallback((text: string) => {
    const hashtagRegex = /#[\w]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  }, []);

  const handlePost = useCallback(async () => {
    if (!content.trim() && !selectedMedia) {
      toast.error('Please add some content or media');
      return;
    }

    setIsPosting(true);
    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload media if selected
      if (selectedMedia) {
        const fileExt = selectedMedia.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, selectedMedia);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
        mediaType = selectedMedia.type.startsWith('video/') ? 'video' : 'image';
      }

      // Extract hashtags from content
      const extractedTags = extractHashtags(content);

      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          content,
          media_urls: mediaUrl ? [mediaUrl] : null,
          author_id: user?.id,
          tags: extractedTags.length > 0 ? extractedTags : null,
          location: location || null,
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
        });

      if (postError) throw postError;

      // Reset form
      setContent('');
      setSelectedMedia(null);
      setMediaPreview(null);
      setTags([]);
      setLocation('');
      setIsExpanded(false);

      toast.success('Post created successfully!');
      onPostCreated?.();

    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  }, [content, selectedMedia, location, extractHashtags, user?.id, onPostCreated]);

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share your professional insights..."
              value={content}
              onChange={handleContentChange}
              className="min-h-[60px] resize-none border-none shadow-none focus-visible:ring-0 px-0"
              rows={isExpanded ? 4 : 2}
            />

            {/* Media Preview */}
            {mediaPreview && (
              <div className="relative">
                {selectedMedia?.type.startsWith('video/') ? (
                  <video
                    src={mediaPreview}
                    className="w-full max-h-60 object-cover rounded-lg"
                    controls
                  />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    className="w-full max-h-60 object-cover rounded-lg"
                  />
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={removeMedia}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Location Input */}
            {isExpanded && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Add location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 text-sm bg-transparent border-none outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleImageUpload}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Image className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVideoUpload}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Video className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Camera className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handlePost}
                disabled={(!content.trim() && !selectedMedia) || isPosting}
                size="sm"
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {isPosting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleMediaSelect(file);
          }}
        />
        
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleMediaSelect(file);
          }}
        />
      </CardContent>
    </Card>
  );
});

QuickCreatePost.displayName = 'QuickCreatePost';