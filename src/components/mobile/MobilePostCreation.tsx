import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useUrlDetection } from '@/hooks/useUrlDetection';
import LinkPreview from '@/components/shared/LinkPreview';
import { Camera, Video, MapPin, Image as ImageIcon, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '@/components/common/UserAvatar';
import { getUserAvatarProps } from '@/utils/avatarUtils';

interface MobilePostCreationProps {
  onClose?: () => void;
  onPostCreated?: () => void;
}

export const MobilePostCreation: React.FC<MobilePostCreationProps> = ({
  onClose,
  onPostCreated
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFile, uploading } = useFileUpload();
  
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // URL detection for link previews
  const { detectedUrls } = useUrlDetection(content);

  const handleMediaUpload = async (files: FileList | null, type: 'image' | 'video') => {
    if (!files || !user) return;

    const file = files[0];
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const folderPath = type === 'video' ? 'reels' : 'posts';
      const uploadedUrl = await uploadFile(file, undefined, folderPath);
      setMediaFiles([...mediaFiles, uploadedUrl]);
      
      toast({
        title: "Media uploaded",
        description: `Your ${type} has been uploaded successfully!`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload media. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeMedia = (urlToRemove: string) => {
    setMediaFiles(mediaFiles.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Content required",
        description: "Please add some content or media to your post.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content,
          media_urls: mediaFiles,
          author_id: user.id,
          user_id: user.id,
          post_type: mediaFiles.some(url => /\.(mp4|mov|webm)$/i.test(url)) ? 'video' : 'general',
          visibility: 'public',
          origin: 'mobile'
        });

      if (error) throw error;

      toast({
        title: "Post created",
        description: "Your post has been shared successfully!",
      });

      // Reset form
      setContent('');
      setLocation('');
      setMediaFiles([]);
      onPostCreated?.();
      onClose?.();
    } catch (error) {
      console.error('Post creation error:', error);
      toast({
        title: "Post failed",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl rounded-t-3xl">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserAvatar 
              {...getUserAvatarProps(user)}
              size="md"
            />
            <div>
              <p className="font-semibold text-gray-900">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-600">Share your thoughts...</p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Content Input */}
        <Textarea
          placeholder="What's happening in your career?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none border-0 focus-visible:ring-0 text-lg placeholder:text-gray-500"
        />

        {/* Media Preview */}
        {mediaFiles.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {mediaFiles.map((url, index) => (
              <div key={index} className="relative group">
                {/\.(mp4|mov|webm)$/i.test(url) ? (
                  <video
                    src={url}
                    className="w-full h-32 object-cover rounded-lg"
                    controls={false}
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeMedia(url)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Link Previews */}
        {detectedUrls.length > 0 && (
          <div className="space-y-2">
            {detectedUrls.slice(0, 2).map((urlData, index) => (
              <LinkPreview 
                key={`${urlData.url}-${index}`}
                url={urlData.url}
                className="border rounded-lg"
                compact={true}
              />
            ))}
          </div>
        )}

        {/* Location Input */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Add location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border-0 focus-visible:ring-0 bg-gray-50 rounded-xl"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('mobile-image-upload')?.click()}
              disabled={uploading}
              className="rounded-xl"
            >
              <ImageIcon className="h-4 w-4 mr-1" />
              Photo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => document.getElementById('mobile-video-upload')?.click()}
              disabled={uploading}
              className="rounded-xl"
            >
              <Video className="h-4 w-4 mr-1" />
              Video
            </Button>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || uploading || (!content.trim() && mediaFiles.length === 0)}
            className="rounded-xl px-6"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </Button>
        </div>

        {/* Hidden File Inputs */}
        <input
          id="mobile-image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleMediaUpload(e.target.files, 'image')}
        />
        <input
          id="mobile-video-upload"
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleMediaUpload(e.target.files, 'video')}
        />
      </div>
    </Card>
  );
};