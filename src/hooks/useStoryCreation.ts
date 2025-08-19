import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface StoryData {
  id: string;
  type: 'photo' | 'video' | 'text';
  content?: string;
  mediaUrl?: string;
  background?: string;
  font?: string;
  fontSize?: string;
  userId: string;
  createdAt: string;
}

export const useStoryCreation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const checkCameraPermissions = async () => {
    try {
      const permissions = await Camera.checkPermissions();
      if (permissions.camera !== 'granted') {
        const requestResult = await Camera.requestPermissions();
        return requestResult.camera === 'granted';
      }
      return true;
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return false;
    }
  };

  const takePhoto = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        toast({
          title: "Camera permission required",
          description: "Please enable camera access to take photos.",
          variant: "destructive",
        });
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        return image.dataUrl;
      }
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "Camera error",
        description: "Failed to take photo. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async (): Promise<string | null> => {
    setIsLoading(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        return image.dataUrl;
      }
      return null;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      toast({
        title: "Gallery error",
        description: "Failed to select image from gallery.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadStoryMedia = async (dataUrl: string): Promise<string | null> => {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create file name
      const fileName = `story_${user?.id}_${Date.now()}.jpg`;
      const filePath = `stories/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('user-content')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  };

  const saveStory = async (storyData: Omit<StoryData, 'id' | 'userId' | 'createdAt'>): Promise<boolean> => {
    try {
      if (!user?.id) {
        toast({
          title: "Authentication required",
          description: "Please log in to create stories.",
          variant: "destructive",
        });
        return false;
      }

      const story = {
        user_id: user.id,
        type: storyData.type,
        content: storyData.content,
        media_url: storyData.mediaUrl,
        background: storyData.background,
        font: storyData.font,
        font_size: storyData.fontSize,
      };

      const { error } = await supabase
        .from('stories')
        .insert([story]);
      
      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error saving story:', error);
      toast({
        title: "Failed to save story",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const createPhotoStory = async (): Promise<boolean> => {
    const photoUrl = await takePhoto();
    if (!photoUrl) return false;

    const uploadedUrl = await uploadStoryMedia(photoUrl);
    if (!uploadedUrl) {
      toast({
        title: "Upload failed",
        description: "Failed to upload your photo. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    const success = await saveStory({
      type: 'photo',
      mediaUrl: uploadedUrl,
    });

    if (success) {
      toast({
        title: "Photo story created!",
        description: "Your photo story has been shared successfully.",
      });
    }

    return success;
  };

  const createGalleryStory = async (): Promise<boolean> => {
    const photoUrl = await selectFromGallery();
    if (!photoUrl) return false;

    const uploadedUrl = await uploadStoryMedia(photoUrl);
    if (!uploadedUrl) {
      toast({
        title: "Upload failed",
        description: "Failed to upload your photo. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    const success = await saveStory({
      type: 'photo',
      mediaUrl: uploadedUrl,
    });

    if (success) {
      toast({
        title: "Photo story created!",
        description: "Your photo story has been shared successfully.",
      });
    }

    return success;
  };

  const createTextStory = async (textData: {
    content: string;
    background: string;
    font: string;
    fontSize: string;
  }): Promise<boolean> => {
    const success = await saveStory({
      type: 'text',
      content: textData.content,
      background: textData.background,
      font: textData.font,
      fontSize: textData.fontSize,
    });

    if (success) {
      toast({
        title: "Text story created!",
        description: "Your text story has been shared successfully.",
      });
    }

    return success;
  };

  return {
    isLoading,
    takePhoto,
    selectFromGallery,
    createPhotoStory,
    createGalleryStory,
    createTextStory,
    saveStory,
  };
};