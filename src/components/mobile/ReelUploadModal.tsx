import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { X, Upload, VideoIcon, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ReelUploadModalProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

export const ReelUploadModal: React.FC<ReelUploadModalProps> = ({
  onClose,
  onUploadComplete
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFile, uploading } = useFileUpload();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video must be less than 100MB",
        variant: "destructive",
      });
      return;
    }

    setVideoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
  };

  const handleSubmit = async () => {
    if (!videoFile || !user) {
      toast({
        title: "Missing information",
        description: "Please select a video and add a title",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please add a title for your reel",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload video to reels bucket with user folder structure
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const videoUrl = await uploadFile(videoFile, fileName, 'reels');

      // Save reel data to posts table
      const { error } = await supabase
        .from('posts')
        .insert({
          content: description,
          headline: title,
          media_urls: [videoUrl],
          author_id: user.id,
          user_id: user.id,
          post_type: 'video_reel',
          visibility: 'public',
          origin: 'mobile_reels'
        });

      if (error) throw error;

      toast({
        title: "Reel uploaded!",
        description: "Your video has been shared successfully",
      });

      onUploadComplete();
      onClose();
    } catch (error) {
      console.error('Reel upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload your reel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Upload Reel</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Video Upload Area */}
          <div className="mb-6">
            {!videoFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <VideoIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 mb-2">Tap to select video</p>
                <p className="text-sm text-gray-500">Max 100MB • MP4, MOV, WebM</p>
              </div>
            ) : (
              <div className="relative">
                <video
                  src={videoPreview}
                  className="w-full h-64 object-cover rounded-lg"
                  controls
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              placeholder="Add a catchy title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* Description Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              placeholder="Tell people about your video... #hashtags #career"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting || uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!videoFile || !title.trim() || isSubmitting || uploading}
              className="flex-1"
            >
              {isSubmitting || uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Share Reel'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};