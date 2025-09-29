import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Upload, 
  Video, 
  FileVideo, 
  X, 
  Tags, 
  Eye,
  Lock,
  Globe,
  Users
} from 'lucide-react';

interface VideoData {
  title: string;
  description: string;
  tags: string[];
  privacy: 'public' | 'network' | 'private';
  is_featured: boolean;
}

interface VideoUploaderProps {
  videoBlob?: Blob;
  onUploadComplete: (videoData: any) => void;
  onCancel: () => void;
  className?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  videoBlob,
  onUploadComplete,
  onCancel,
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoData, setVideoData] = useState<VideoData>({
    title: '',
    description: '',
    tags: [],
    privacy: 'public',
    is_featured: false
  });
  const [tagInput, setTagInput] = useState('');

  const handleTagAdd = useCallback((tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !videoData.tags.includes(trimmedTag) && videoData.tags.length < 10) {
      setVideoData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  }, [videoData.tags]);

  const handleTagRemove = useCallback((tagToRemove: string) => {
    setVideoData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleTagAdd(tagInput);
    }
  }, [tagInput, handleTagAdd]);

  const generateThumbnail = useCallback(async (videoFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = Math.min(video.duration * 0.1, 3); // 10% or 3 seconds
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          }, 'image/jpeg', 0.8);
        }
      };

      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(videoFile);
      video.load();
    });
  }, []);

  const uploadToSupabase = useCallback(async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('video-intros')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('video-intros')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }, []);

  const handleUpload = useCallback(async () => {
    if (!user || !videoBlob) {
      toast({
        title: "Error",
        description: "Please record a video and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }

    if (!videoData.title.trim() || !videoData.description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and description for your video",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert blob to file
      const videoFile = new File([videoBlob], 'video-intro.webm', { type: 'video/webm' });
      
      // Generate unique file paths
      const timestamp = Date.now();
      const videoPath = `${user.id}/${timestamp}-video.webm`;
      const thumbnailPath = `${user.id}/${timestamp}-thumbnail.jpg`;

      // Update progress
      setUploadProgress(20);

      // Generate thumbnail
      const thumbnailUrl = await generateThumbnail(videoFile);
      const thumbnailBlob = await fetch(thumbnailUrl).then(r => r.blob());
      const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });

      setUploadProgress(40);

      // Upload video
      const videoUrl = await uploadToSupabase(videoFile, videoPath);
      
      setUploadProgress(60);

      // Upload thumbnail
      const uploadedThumbnailUrl = await uploadToSupabase(thumbnailFile, thumbnailPath);

      setUploadProgress(80);

      // Create video element to get duration
      const videoDuration = await new Promise<number>((resolve) => {
        const video = document.createElement('video');
        video.onloadedmetadata = () => resolve(Math.floor(video.duration));
        video.src = URL.createObjectURL(videoFile);
      });

      // Save to database
      const { data, error } = await supabase
        .from('video_intros')
        .insert({
          user_id: user.id,
          title: videoData.title,
          description: videoData.description,
          video_url: videoUrl,
          thumbnail_url: uploadedThumbnailUrl,
          duration: videoDuration,
          tags: videoData.tags,
          privacy_level: videoData.privacy,
          is_featured: videoData.is_featured,
          is_active: true,
          views_count: 0,
          likes_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      setUploadProgress(100);

      toast({
        title: "Upload Successful",
        description: "Your video introduction has been uploaded successfully!",
      });

      onUploadComplete(data);

      // Cleanup
      URL.revokeObjectURL(thumbnailUrl);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [user, videoBlob, videoData, toast, generateThumbnail, uploadToSupabase, onUploadComplete]);

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: Globe, description: 'Visible to everyone' },
    { value: 'network', label: 'Network Only', icon: Users, description: 'Visible to your connections' },
    { value: 'private', label: 'Private', icon: Lock, description: 'Only visible to you' }
  ];

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Video Introduction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Preview */}
        {videoBlob && (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={URL.createObjectURL(videoBlob)}
              controls
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Upload Form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              placeholder="Give your video introduction a compelling title..."
              value={videoData.title}
              onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
              maxLength={100}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {videoData.title.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <Textarea
              placeholder="Describe yourself, your background, skills, and what you're looking for..."
              value={videoData.description}
              onChange={(e) => setVideoData(prev => ({ ...prev, description: e.target.value }))}
              maxLength={500}
              rows={4}
              className="w-full resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {videoData.description.length}/500 characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Skills & Tags</label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add skills, technologies, interests... (press Enter or comma)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleTagAdd(tagInput)}
                  disabled={!tagInput.trim() || videoData.tags.length >= 10}
                >
                  <Tags className="h-4 w-4" />
                </Button>
              </div>
              
              {videoData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {videoData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleTagRemove(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                {videoData.tags.length}/10 tags added
              </p>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium mb-2">Privacy</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {privacyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVideoData(prev => ({ ...prev, privacy: option.value as any }))}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    videoData.privacy === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <option.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading video...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !videoData.title.trim() || !videoData.description.trim()}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};