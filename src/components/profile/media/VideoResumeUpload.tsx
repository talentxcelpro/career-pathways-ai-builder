import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Upload, Play, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface VideoResumeUploadProps {
  currentVideoUrl?: string;
  onUploadSuccess?: (url: string) => void;
}

export const VideoResumeUpload = ({ currentVideoUrl, onUploadSuccess }: VideoResumeUploadProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(currentVideoUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
      return 'Please select an MP4, WebM, or MOV video file.';
    }
    
    // Check file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return 'File size must be less than 50MB.';
    }
    
    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDurationFromVideo = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Invalid File",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    // Check video duration
    try {
      const duration = await getDurationFromVideo(file);
      if (duration < 30 || duration > 120) {
        toast({
          title: "Invalid Duration",
          description: "Video should be between 30 seconds and 2 minutes long.",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error('Error getting video duration:', error);
    }

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload your video resume.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/video_resumes/video_resume.${fileExt}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to user-uploads bucket
      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, file, {
          upsert: true
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(fileName);

      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ video_resume_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setVideoUrl(publicUrl);
      
      toast({
        title: "Video Resume Uploaded",
        description: "Your video resume has been uploaded successfully.",
      });

      onUploadSuccess?.(publicUrl);
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveVideo = async () => {
    if (!user) return;

    try {
      // Update profile to remove video URL
      const { error } = await supabase
        .from('profiles')
        .update({ video_resume_url: null })
        .eq('id', user.id);

      if (error) throw error;

      setVideoUrl(null);
      onUploadSuccess?.('');
      
      toast({
        title: "Video Removed",
        description: "Your video resume has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove video resume.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-48 h-32">
            {videoUrl ? (
              <div className="relative">
                <video 
                  src={videoUrl} 
                  className="w-48 h-32 rounded-lg object-cover border-2 border-border shadow-sm"
                  controls
                  preload="metadata"
                />
                <button
                  onClick={handleRemoveVideo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  disabled={uploading}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="w-48 h-32 bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border">
                <Video className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">No video uploaded</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium text-sm mb-1">Video Resume</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Upload a 30-120 second video introduction (MP4, WebM - Max 50MB)
            </p>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-3 w-3 mr-2" />
                {videoUrl ? 'Change Video' : 'Upload Video'}
              </>
            )}
          </Button>

          {videoUrl && (
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const video = document.querySelector('video') as HTMLVideoElement;
                  if (video) {
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }
                }}
              >
                <Play className="h-3 w-3 mr-1" />
                Preview
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};