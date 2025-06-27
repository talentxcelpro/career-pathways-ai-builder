
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseFileUploadOptions {
  bucket: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export function useFileUpload(options?: UseFileUploadOptions) {
  const defaultOptions: UseFileUploadOptions = {
    bucket: 'avatars',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  };
  
  const config = { ...defaultOptions, ...options };
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, pathOrUserId?: string, bucketOverride?: string): Promise<string> => {
    if (!file) throw new Error('No file provided');

    const bucket = bucketOverride || config.bucket;

    // Validate file size
    if (config.maxSize && file.size > config.maxSize) {
      throw new Error(`File size must be less than ${config.maxSize / 1024 / 1024}MB`);
    }

    // Validate file type
    if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed types: ${config.allowedTypes.join(', ')}`);
    }

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      let fileName: string;
      
      // Handle different path patterns for different buckets
      if (bucket === 'avatars') {
        fileName = pathOrUserId ? `${pathOrUserId}/avatar.${fileExt}` : `${user.id}/avatar.${fileExt}`;
      } else if (bucket === 'resumes') {
        fileName = pathOrUserId ? `${pathOrUserId}` : `${user.id}/${Date.now()}.${fileExt}`;
      } else if (bucket === 'portfolio') {
        fileName = pathOrUserId ? `${pathOrUserId}` : `${user.id}/${Date.now()}.${fileExt}`;
      } else if (bucket === 'documents') {
        fileName = pathOrUserId ? `${pathOrUserId}` : `${user.id}/${Date.now()}.${fileExt}`;
      } else if (bucket === 'preferences') {
        fileName = pathOrUserId ? `${pathOrUserId}` : `${user.id}/${Date.now()}.${fileExt}`;
      } else {
        fileName = pathOrUserId || `${user.id}/${Date.now()}.${fileExt}`;
      }

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setProgress(100);
      toast.success('File uploaded successfully');
      return publicUrl;
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (path: string): Promise<void> => {
    try {
      const { error } = await supabase.storage
        .from(config.bucket)
        .remove([path]);

      if (error) throw error;
      toast.success('File deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
      throw error;
    }
  };

  return {
    uploadFile,
    deleteFile,
    uploading,
    isUploading: uploading, // Add alias for backward compatibility
    progress
  };
}
