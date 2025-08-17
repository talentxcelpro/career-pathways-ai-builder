import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Text, Award, Briefcase, BarChart3, Image, Link as LinkIcon } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useProfilePosts } from '@/hooks/useProfilePosts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const PostCreation = () => {
  const [activeType, setActiveType] = useState('text');
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'post-media',
    allowedTypes: ['image/*', 'video/*'],
    maxSize: 50 * 1024 * 1024 // 50MB
  });
  
  const { createPost } = useProfilePosts('global');

  const postTypes = [
    { id: 'text', label: 'Text', icon: Text, description: 'Share thoughts and insights' },
    { id: 'achievement', label: 'Achievement', icon: Award, description: 'Celebrate your wins' },
    { id: 'job_update', label: 'Job Update', icon: Briefcase, description: 'Career milestones' },
    { id: 'poll', label: 'Poll', icon: BarChart3, description: 'Get community input' },
  ];

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      setSelectedMedia(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Media upload failed:', error);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please add some content to your post');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await createPost.mutateAsync({
        content: content.trim(),
        media_urls: selectedMedia,
        post_type: activeType,
        visibility: 'public',
        tags: [],
      });

      // Reset form
      setContent('');
      setLinkUrl('');
      setSelectedMedia([]);
      setActiveType('text');
      
      toast.success('Post shared successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to share post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeMedia = (urlToRemove: string) => {
    setSelectedMedia(prev => prev.filter(url => url !== urlToRemove));
  };

  return (
    <Card className="bg-background border border-border/50 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <h3 className="text-sm font-medium text-foreground">Share an update</h3>

          {/* Post Type Selection */}
          <div className="flex gap-2 flex-wrap">
            {postTypes.map((type) => (
              <Badge
                key={type.id}
                variant={activeType === type.id ? "default" : "outline"}
                className={`cursor-pointer text-xs py-2 px-3 hover:bg-primary/10 transition-colors ${
                  activeType === type.id ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setActiveType(type.id)}
              >
                <type.icon className="w-3 h-3 mr-1" />
                {type.label}
              </Badge>
            ))}
          </div>

          {/* Content Input */}
          <div className="space-y-3">
            <Textarea
              placeholder="What's on your mind? Share career insights, achievements, or ask questions..."
              className="min-h-[80px] resize-none text-sm border-border/50"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Link Input for certain post types */}
            {(activeType === 'achievement' || activeType === 'job_update') && (
              <div className="flex gap-2">
                <LinkIcon className="w-4 h-4 text-muted-foreground mt-3" />
                <input
                  type="url"
                  placeholder="Add a link (optional)"
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border/50 rounded-md"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
            )}

            {/* Media Preview */}
            {selectedMedia.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {selectedMedia.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-20 object-cover rounded-md"
                    />
                    <button
                      onClick={() => removeMedia(url)}
                      className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Image className="w-4 h-4" />
                  Photo
                </div>
              </label>
              
              <div className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground">
                <LinkIcon className="w-4 h-4" />
                Link
              </div>
            </div>

            <Button 
              size="sm" 
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting || uploading}
              className="px-6"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};