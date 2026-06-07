
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { optimizedStorage } from '@/utils/optimizedStorage';

const UPLOAD_TIMEOUT_MS = 30000;

const withTimeout = async <T,>(promise: PromiseLike<T>, message: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), UPLOAD_TIMEOUT_MS);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

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

  const uploadFile = async (file: File, customPath?: string, bucketOverride?: string): Promise<string> => {
    if (!file) throw new Error('No file provided');

    const bucket = bucketOverride || config.bucket;

    // Validate file size
    if (config.maxSize && file.size > config.maxSize) {
      throw new Error(`File size must be less than ${config.maxSize / 1024 / 1024}MB`);
    }

    // Validate file type
    if (config.allowedTypes && config.allowedTypes.length > 0) {
      const isAllowed = config.allowedTypes.some(allowedType => {
        if (allowedType.includes('*')) {
          // Handle wildcard types like 'image/*'
          const baseType = allowedType.split('/')[0];
          return file.type.startsWith(baseType + '/');
        }
        return file.type === allowedType;
      });
      
      if (!isAllowed) {
        throw new Error(`File type not allowed. Allowed types: ${config.allowedTypes.join(', ')}`);
      }
    }

    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await withTimeout(
        supabase.auth.getUser(),
        'Authentication check timed out. Please refresh and try again.'
      );
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      let fileName: string;
      
      // Generate proper file paths for each bucket type with user folder structure
      if (customPath) {
        // If custom path is provided, ensure it starts with user ID
        fileName = customPath.startsWith(user.id) ? customPath : `${user.id}/${customPath}`;
      } else {
        // Generate TalentXcel naming convention for all file types
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const timestamp = Date.now();
        
        switch (bucket) {
          case 'avatars':
            fileName = `${user.id}/talentxcel_avatar_${user.id}_${timestamp}.${fileExt}`;
            break;
          case 'resumes':
            fileName = `${user.id}/talentxcel_resume_${user.id}_${timestamp}_${sanitizedFileName}`;
            break;
          case 'cover-letters':
            fileName = `${user.id}/talentxcel_coverletter_${user.id}_${timestamp}_${sanitizedFileName}`;
            break;
          case 'documents':
            fileName = `${user.id}/talentxcel_document_${user.id}_${timestamp}_${sanitizedFileName}`;
            break;
          case 'media':
            fileName = `${user.id}/talentxcel_media_${user.id}_${timestamp}_${sanitizedFileName}`;
            break;
          case 'portfolio':
            fileName = `${user.id}/talentxcel_portfolio_${user.id}_${timestamp}_${sanitizedFileName}`;
            break;
          case 'preferences':
            fileName = `${user.id}/talentxcel_preferences_${user.id}_${timestamp}_${sanitizedFileName}`;
            break;
          case 'post-media':
            fileName = `${user.id}/talentxcel_postmedia_${user.id}_${timestamp}_${sanitizedFileName}`;
            break;
          default:
            fileName = `${user.id}/talentxcel_file_${user.id}_${timestamp}_${sanitizedFileName}`;
        }
      }

      console.log(`[upload] bucket=${bucket} path=${fileName} size=${file.size} type=${file.type}`);

      // Direct supabase storage call — bypass cache layer that was suppressing errors / serving stale results
      // Short cache for user-mutable images so updates propagate quickly even
      // without query-string cache-busting. Other buckets keep a longer cache.
      const mutableImageBuckets = new Set(['avatars', 'banners', 'profile-pictures']);
      const cacheControl = mutableImageBuckets.has(bucket) ? '60' : '3600';

      const { data, error: uploadError } = await withTimeout(
        supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl,
            upsert: true,
            contentType: file.type,
          }),
        'Upload timed out. Please check your connection and try again.'
      );

      if (uploadError) {
        console.error('[upload] storage error:', JSON.stringify(uploadError), uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      let publicUrl = urlData.publicUrl;

      // Per-upload cache-busting for mutable image buckets so profile images
      // never show a stale version after re-upload. We use a short hash of the
      // path + upload timestamp so the URL is deterministic per upload (not
      // changing on every render) but unique per new upload.
      if (mutableImageBuckets.has(bucket)) {
        const stamp = Date.now().toString(36);
        const hash = (data.path.length * 2654435761 >>> 0).toString(36).slice(0, 4);
        const v = `${stamp}${hash}`;
        publicUrl = `${publicUrl}${publicUrl.includes('?') ? '&' : '?'}v=${v}`;
      }

      setProgress(100);
      toast.success('File uploaded successfully');
      return publicUrl;
    } catch (error: any) {
      console.error('[upload] failed:', JSON.stringify(error), error);
      const errorMessage = error?.message || error?.error || 'Upload failed';
      toast.error(`Upload failed: ${errorMessage}`);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (path: string, bucketOverride?: string): Promise<void> => {
    const bucket = bucketOverride || config.bucket;
    
    try {
      // Extract file path from URL if a full URL is provided
      let filePath = path;
      if (path.includes('/storage/v1/object/public/')) {
        const urlParts = path.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const pathParts = urlParts[1].split('/');
          pathParts.shift(); // Remove bucket name
          filePath = pathParts.join('/');
        }
      }

      console.log(`Deleting file from bucket: ${bucket}, path: ${filePath}`);

      const result = await optimizedStorage.deleteFile(bucket, filePath);
      
      if (result.error) throw result.error;
      toast.success('File deleted successfully');
    } catch (error: any) {
      console.error('Delete failed:', error);
      const errorMessage = error.message || 'Delete failed';
      toast.error(errorMessage);
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
