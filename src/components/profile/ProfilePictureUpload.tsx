
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload } from "lucide-react";
import { useFileUpload } from '@/hooks/useFileUpload';

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
  const { uploadFile, uploading } = useFileUpload({
    bucket: 'avatars',
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Fix: Remove the incorrect bucket override parameter
      // The hook is already configured for 'avatars' bucket
      const url = await uploadFile(file, `${userId}/avatar.${file.name.split('.').pop()}`);
      if (url) {
        onImageChange(url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        <Avatar className="w-32 h-32">
          <AvatarImage src={currentImageUrl} alt={userName || 'Profile'} />
          <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={triggerFileSelect}>
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
        disabled={uploading}
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? 'Uploading...' : 'Change Photo'}
      </Button>
    </div>
  );
};
