import { useState, useCallback } from 'react';
import { optimizedStorage, validateFile } from '@/utils/optimizedStorage';
import { toast } from 'sonner';

interface UseStorageOptions {
  bucket: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
  autoOptimize?: boolean;
}

export const useOptimizedStorage = (options: UseStorageOptions) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    path?: string,
    customOptions?: any
  ) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file
      const validation = validateFile(file, {
        maxSize: options.maxFileSize,
        allowedTypes: options.allowedTypes
      });

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const filePath = path || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const result = await optimizedStorage.uploadFile(
        options.bucket,
        filePath,
        file,
        {
          cacheControl: '31536000',
          upsert: true,
          ...customOptions
        }
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      setProgress(100);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [options]);

  const uploadBatch = useCallback(async (
    files: Array<{ file: File; path?: string }>
  ) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const filesToUpload = files.map(({ file, path }) => ({
        file,
        path: path || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      }));

      const result = await optimizedStorage.batchUpload(
        options.bucket,
        filesToUpload,
        { cacheControl: '31536000', upsert: true },
        (progress) => {
          setProgress(progress);
          options.onProgress?.(progress);
        }
      );

      if (result.failed.length > 0) {
        const failedMessage = `${result.failed.length} files failed to upload`;
        toast.error(failedMessage);
      }

      if (result.successful.length > 0) {
        toast.success(`${result.successful.length} files uploaded successfully`);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [options]);

  const getPublicUrl = useCallback(async (path: string) => {
    try {
      return await optimizedStorage.getPublicUrl(options.bucket, path);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get URL';
      setError(errorMessage);
      return null;
    }
  }, [options.bucket]);

  const deleteFile = useCallback(async (path: string) => {
    try {
      const result = await optimizedStorage.deleteFile(options.bucket, path);
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast.success('File deleted successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [options.bucket]);

  const checkFileExists = useCallback(async (path: string) => {
    try {
      return await optimizedStorage.fileExists(options.bucket, path);
    } catch (err) {
      console.error('File existence check failed:', err);
      return false;
    }
  }, [options.bucket]);

  return {
    uploading,
    progress,
    error,
    uploadFile,
    uploadBatch,
    getPublicUrl,
    deleteFile,
    checkFileExists,
    clearError: () => setError(null)
  };
};