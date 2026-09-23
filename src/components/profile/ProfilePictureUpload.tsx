
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
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
      <div className="relative group shrink-0">
        <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
          <UserAvatar 
            src={previewUrl}
            userName={userName}
            size="xl"
            alt={userName || 'Profile'} 
          />
          <div 
            className="absolute inset-0 bg-slate-950/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]" 
            onClick={triggerFileSelect}
            title="Click to change photo"
          >
            <Camera className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      <div className="flex-1 text-center sm:text-left space-y-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recommended size: 400×400px. JPG, PNG, or WebP up to 10MB.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <Button 
            onClick={triggerFileSelect} 
            size="sm"
            disabled={uploading || updateProfilePicture.isPending}
            className="h-8 px-3 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            {uploading || updateProfilePicture.isPending ? 'Uploading...' : 'Change Photo'}
          </Button>

          {previewUrl && (
            <Button
              onClick={() => {
                setPreviewUrl('');
                onImageChange('');
                updateProfilePicture.mutateAsync('');
              }}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 rounded-lg"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
