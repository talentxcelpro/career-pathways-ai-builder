
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadProfileAsset, deleteProfileAsset } from '@/utils/profileHelpers';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = async (
    file: File, 
    userId: string, 
    type: 'avatar' | 'resume' | 'portfolio'
  ): Promise<string | null> => {
    if (!file) return null;

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 50MB.",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    try {
      const url = await uploadProfileAsset(file, userId, type);
      toast({
        title: "Upload successful",
        description: `${type === 'avatar' ? 'Profile picture' : type} uploaded successfully.`,
      });
      return url;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteFile = async (url: string) => {
    try {
      await deleteProfileAsset(url);
      toast({
        title: "File deleted",
        description: "File has been removed successfully.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the file.",
        variant: "destructive",
      });
    }
  };

  return { uploadFile, deleteFile, isUploading };
};
