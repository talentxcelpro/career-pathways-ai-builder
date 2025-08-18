import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { X, Upload, ImageIcon, VideoIcon, Camera, FileImage } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StoryUploadModalProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

export const StoryUploadModal: React.FC<StoryUploadModalProps> = ({
  onClose,
  onUploadComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFile, uploading } = useFileUpload();
  
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image or video file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB limit for stories)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File must be less than 50MB",
        variant: "destructive",
      });
      return;
    }

    setMediaFile(file);
    setMediaType(file.type.startsWith('image/') ? 'image' : 'video');
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const handleSubmit = async () => {
    if (!mediaFile || !user) {
      toast({
        title: "Missing media",
        description: "Please select an image or video for your story",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload media to stories bucket with user folder structure
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const mediaUrl = await uploadFile(mediaFile, fileName, 'stories');

      // Calculate story expiry (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Save story data to posts table
      const { error } = await supabase
        .from('posts')
        .insert({
          content: caption,
          media_urls: [mediaUrl],
          author_id: user.id,
          user_id: user.id,
          post_type: mediaType === 'video' ? 'video_story' : 'image_story',
          visibility: 'public',
          origin: 'mobile_story',
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Story uploaded!",
        description: "Your story has been shared successfully",
      });

      onUploadComplete();
      onClose();
    } catch (error) {
      console.error('Story upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload your story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-end justify-center p-0">
      <Card className="w-full max-w-sm rounded-t-3xl rounded-b-none bg-card max-h-[85vh] overflow-y-auto">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">Add to Your Story</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full text-muted-foreground hover:text-foreground h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Media Upload Area */}
          <div className="mb-4">
            {!mediaFile ? (
              <div className="space-y-3">
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors bg-muted/20"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex justify-center space-x-3 mb-3">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <VideoIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-foreground mb-1 font-medium text-sm">Choose photo or video</p>
                  <p className="text-xs text-muted-foreground">Max 50MB • JPG, PNG, MP4, MOV</p>
                </div>
                
                {/* Quick action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 p-3 h-auto text-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileImage className="h-4 w-4" />
                    <span>Gallery</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 p-3 h-auto text-sm"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                  >
                    <Camera className="h-4 w-4" />
                    <span>Camera</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                {mediaType === 'image' ? (
                  <img
                    src={mediaPreview}
                    alt="Story preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    className="w-full h-48 object-cover rounded-xl"
                    controls
                  />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full h-8 w-8"
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview('');
                    setMediaType(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Caption Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-foreground">Caption</label>
            <Textarea
              placeholder="Write a caption... #hashtags"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              maxLength={300}
              className="resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">{caption.length}/300</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 text-sm"
              disabled={isSubmitting || uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!mediaFile || isSubmitting || uploading}
              className="flex-1 text-sm"
            >
              {isSubmitting || uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-1 animate-spin" />
                  Sharing...
                </>
              ) : (
                'Share Story'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};