
import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { useFileUpload } from '@/hooks/useFileUpload';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/common/UserAvatar';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  userName?: string;
  userId: string;
  onImageChange: (url: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  userName,
  userId,
  onImageChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'avatars',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/*']
  });
  const { updateProfilePicture } = useProfileUpdate();

  useEffect(() => {
    setPreviewUrl(currentImageUrl || '');
  }, [currentImageUrl]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    try {
      // Upload file to storage
      const url = await uploadFile(file);
      if (url && (url.startsWith('http') || url.startsWith('/'))) {
        // Cache-bust the public URL cleanly so the fresh image displays immediately
        const sep = url.includes('?') ? '&' : '?';
        const finalUrl = `${url}${sep}t=${Date.now()}`;

        // 1. Immediately update preview
        setPreviewUrl(finalUrl);

        // 2. Immediately notify parent form with the valid permanent storage URL
        onImageChange(finalUrl);

        // 3. Persist to database in background
        try {
          await updateProfilePicture.mutateAsync(finalUrl);
        } catch (dbErr) {
          console.warn('Background profile picture DB sync notice:', dbErr);
        }

        toast.success('Profile picture uploaded successfully');
      } else {
        throw new Error('Could not obtain valid image URL from storage');
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      setPreviewUrl(currentImageUrl || '');
      toast.error(error?.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      URL.revokeObjectURL(localPreviewUrl);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getInitials = () => {
    if (!userName) return 'U';
    return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <UserAvatar 
          src={previewUrl}
          userName={userName}
          size="2xl"
          alt={userName || 'Profile'} 
        />
        
        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={triggerFileSelect}>
          <Camera className="h-8 w-8 text-white" />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button 
        onClick={triggerFileSelect} 
        variant="outline" 
        disabled={uploading || updateProfilePicture.isPending}
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading || updateProfilePicture.isPending ? 'Uploading...' : 'Change Photo'}
      </Button>
    </div>
  );
};
