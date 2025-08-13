import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VideoUploadOptions {
  title: string;
  description?: string;
  category: 'reel' | 'podcast' | 'course' | 'employer' | 'college';
  tags?: string[];
  location?: string;
  visibility?: 'public' | 'users_only' | 'private';
  privacyStatus?: 'public' | 'unlisted' | 'private';
}

export const useVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [ytDraftId, setYtDraftId] = useState<string | null>(null);

  const createUploadSession = async (file: File, options: VideoUploadOptions) => {
    setUploading(true);
    setProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Validate file
      if (!file.type.startsWith('video/')) {
        throw new Error('Please select a video file');
      }

      // Check duration for reels
      if (options.category === 'reel') {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        const duration = await new Promise<number>((resolve, reject) => {
          video.onloadedmetadata = () => resolve(video.duration);
          video.onerror = () => reject(new Error('Could not load video'));
          video.src = URL.createObjectURL(file);
        });

        if (duration > 60) {
          throw new Error('Reels must be 60 seconds or shorter');
        }
      }

      // Create upload session
      const { data, error } = await supabase.functions.invoke('yt-create-upload-session', {
        body: {
          title: options.title,
          description: options.description,
          privacyStatus: options.privacyStatus || 'unlisted',
          fileSize: file.size,
          contentType: file.type,
          category: options.category,
          tags: options.tags,
          location: options.location,
          durationSec: options.category === 'reel' ? 60 : undefined
        },
      });

      if (error) throw error;

      setUploadUrl(data.uploadUrl);
      setYtDraftId(data.ytDraftId);
      
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create upload session');
      setUploading(false);
      throw error;
    }
  };

  const uploadFile = async (file: File) => {
    if (!uploadUrl) {
      throw new Error('Upload session not created');
    }

    try {
      // Upload file to YouTube
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Extract video ID from response
      const location = uploadResponse.headers.get('location');
      const ytVideoId = location?.split('upload_id=')[1] || 
                       new URL(location || '').searchParams.get('id');

      if (!ytVideoId) {
        throw new Error('Could not get video ID from upload');
      }

      setProgress(100);
      return ytVideoId;
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      throw error;
    }
  };

  const completeUpload = async (ytVideoId: string, options: VideoUploadOptions) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('yt-upload-complete', {
        body: {
          ytDraftId,
          ytVideoId,
          title: options.title,
          description: options.description,
          tags: options.tags,
          category: options.category,
          visibility: options.visibility || 'public',
        },
      });

      if (error) throw error;

      toast.success('Video uploaded successfully!');
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete upload');
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
      setUploadUrl(null);
      setYtDraftId(null);
    }
  };

  const uploadVideo = async (file: File, options: VideoUploadOptions) => {
    const session = await createUploadSession(file, options);
    const ytVideoId = await uploadFile(file);
    return await completeUpload(ytVideoId, options);
  };

  return {
    uploading,
    progress,
    uploadVideo,
    createUploadSession,
    uploadFile,
    completeUpload,
  };
};