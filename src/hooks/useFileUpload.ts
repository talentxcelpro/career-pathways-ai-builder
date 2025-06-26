
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseFileUploadOptions {
  bucket: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export function useFileUpload({ bucket, maxSize = 5 * 1024 * 1024, allowedTypes }: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File, path?: string): Promise<string> => {
    if (!file) throw new Error('No file provided');

    // Validate file size
    if (maxSize && file.size > maxSize) {
      throw new Error(`File size must be less than ${maxSize / 1024 / 1024}MB`);
    }

    // Validate file type
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = path || `${user.id}/${Date.now()}.${fileExt}`;

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
        .from(bucket)
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
    progress
  };
}
