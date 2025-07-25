
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MEDIA_PATHS, getMediaUrl, generateFilePath, uploadFileWithMetadata } from '@/utils/mediaHelpers';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      let fileName: string;
      
      // Generate proper file paths for each bucket type with user folder structure
      if (customPath) {
        // If custom path is provided, ensure it starts with user ID
        fileName = customPath.startsWith(user.id) ? customPath : `${user.id}/${customPath}`;
      } else {
        // Generate default paths based on bucket type
        switch (bucket) {
          case 'avatars':
            fileName = `${user.id}/avatar.${fileExt}`;
            break;
          case 'resumes':
            fileName = `${user.id}/resume-${Date.now()}.${fileExt}`;
            break;
          case 'cover-letters':
            fileName = `${user.id}/cover-letter-${Date.now()}.${fileExt}`;
            break;
          case 'documents':
            fileName = `${user.id}/document-${Date.now()}.${fileExt}`;
            break;
          case 'media':
            fileName = `${user.id}/media-${Date.now()}.${fileExt}`;
            break;
          case 'portfolio':
            fileName = `${user.id}/portfolio-${Date.now()}.${fileExt}`;
            break;
          case 'preferences':
            fileName = `${user.id}/preferences-${Date.now()}.${fileExt}`;
            break;
          case 'post-media':
            fileName = `${user.id}/post-${Date.now()}.${fileExt}`;
            break;
          default:
            fileName = `${user.id}/${Date.now()}.${fileExt}`;
        }
      }

      console.log(`Uploading file to bucket: ${bucket}, path: ${fileName}`);

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Return clean media URL instead of direct Supabase URL
      const cleanBucketKey = Object.entries(MEDIA_PATHS).find(([, value]) => {
        const bucketMapping: Record<string, string> = {
          'avatars': MEDIA_PATHS.USER_MEDIA,
          'post-media': MEDIA_PATHS.POST_MEDIA,
          'documents': MEDIA_PATHS.DOCUMENTS,
          'resumes': MEDIA_PATHS.RESUMES,
          'media': MEDIA_PATHS.POST_MEDIA,
          'portfolio': MEDIA_PATHS.PORTFOLIO,
          'cover-letters': MEDIA_PATHS.COVER_LETTERS,
          'preferences': MEDIA_PATHS.PREFERENCES
        };
        return bucketMapping[bucket] === value;
      })?.[1] || bucket;

      const mediaUrl = getMediaUrl(cleanBucketKey, fileName);
      
      setProgress(100);
      toast.success('File uploaded successfully');
      return mediaUrl;
    } catch (error: any) {
      console.error('Upload failed:', error);
      const errorMessage = error.message || 'Upload failed';
      toast.error(errorMessage);
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

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;
      toast.success('File deleted successfully');
    } catch (error: any) {
      console.error('Delete failed:', error);
      const errorMessage = error.message || 'Delete failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Enhanced upload with metadata support
  const uploadWithMetadata = async (
    file: File, 
    bucketKey: string, 
    metadata?: {
      userId?: string;
      module?: string;
      category?: string;
      description?: string;
      tags?: string[];
    }
  ): Promise<string> => {
    setUploading(true);
    setProgress(0);
    
    try {
      const result = await uploadFileWithMetadata(file, bucketKey, metadata);
      setProgress(100);
      toast.success('File uploaded successfully');
      return result;
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || 'Upload failed');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploadWithMetadata,
    deleteFile,
    uploading,
    isUploading: uploading, // Add alias for backward compatibility
    progress
  };
}
