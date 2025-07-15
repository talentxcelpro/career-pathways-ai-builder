import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Crown, Play, Link } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFeatureGating } from '@/hooks/useFeatureGating';

interface VideoBioUploadProps {
  currentVideoUrl?: string;
  onUploadSuccess?: (url: string) => void;
  profileId: string;
}

export const VideoBioUpload: React.FC<VideoBioUploadProps> = ({
  currentVideoUrl,
  onUploadSuccess,
  profileId
}) => {
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(currentVideoUrl || '');
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('upload');
  const { toast } = useToast();
  const { checkFeatureAccess } = useFeatureGating();

  const { uploadFile } = useFileUpload({
    bucket: 'avatars',
    maxSize: 50 * 1024 * 1024, // 50MB for video
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg']
  });

  const handleVideoUpload = async (file: File) => {
    if (!checkFeatureAccess('Video bio')) {
      return;
    }

    setUploading(true);
    try {
      const uploadedUrl = await uploadFile(file);
      
      const { error } = await supabase
        .from('profiles')
        .update({ video_bio_url: uploadedUrl })
        .eq('id', profileId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Video bio uploaded successfully!",
      });
      
      setVideoUrl(uploadedUrl);
      onUploadSuccess?.(uploadedUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload video bio",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUrlSave = async () => {
    if (!checkFeatureAccess('Video bio')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ video_bio_url: videoUrl })
        .eq('id', profileId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Video bio URL saved successfully!",
      });
      
      onUploadSuccess?.(videoUrl);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save video bio URL",
        variant: "destructive",
      });
    }
  };

  const handleRemoveVideo = async () => {
    if (!checkFeatureAccess('Video bio')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ video_bio_url: null })
        .eq('id', profileId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Video bio removed successfully!",
      });
      
      setVideoUrl('');
      onUploadSuccess?.('');
    } catch (error) {
      console.error('Remove error:', error);
      toast({
        title: "Error",
        description: "Failed to remove video bio",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          Video Bio
        </CardTitle>
        <CardDescription>
          Add a video introduction to your profile (Elite feature)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentVideoUrl ? (
          <div className="relative group">
            <video 
              src={currentVideoUrl} 
              controls
              className="w-full h-48 object-cover rounded-lg bg-black"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemoveVideo}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Play className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mt-2">
              No video bio uploaded
            </p>
          </div>
        )}
        
        <div className="flex gap-2 border-b">
          <Button
            variant={uploadMethod === 'upload' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setUploadMethod('upload')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button
            variant={uploadMethod === 'url' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setUploadMethod('url')}
          >
            <Link className="h-4 w-4 mr-2" />
            URL
          </Button>
        </div>

        {uploadMethod === 'upload' ? (
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/mp4,video/webm,video/ogg';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleVideoUpload(file);
                };
                input.click();
              }}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="video-url">Video URL</Label>
            <div className="flex gap-2">
              <Input
                id="video-url"
                type="url"
                placeholder="https://youtube.com/watch?v=... or direct video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <Button onClick={handleVideoUrlSave} disabled={!videoUrl}>
                Save
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>• Maximum file size: 50MB</p>
          <p>• Supported formats: MP4, WebM, OGG</p>
          <p>• Recommended duration: 30-60 seconds</p>
          <p>• Also supports YouTube, Vimeo, and direct video URLs</p>
        </div>
      </CardContent>
    </Card>
  );
};