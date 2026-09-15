import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string;
  onUploadSuccess?: (url: string) => void;
}

export const ProfilePhotoUpload = ({ currentPhotoUrl, onUploadSuccess }: ProfilePhotoUploadProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      return 'Please select a JPG or PNG image file.';
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB.';
    }
    
    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Invalid File",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload your profile photo.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `${user.id}/profile_${Date.now()}.${fileExt}`;

      // Upload to public avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user profile (use primary column consumed across the app)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_picture_url: publicUrl,
          profile_photo_url: publicUrl,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Profile Photo Updated",
        description: "Your profile photo has been updated successfully.",
      });

      onUploadSuccess?.(publicUrl);
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload profile photo. Please try again.",
        variant: "destructive",
      });
      setPreviewUrl(currentPhotoUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture_url: null, profile_photo_url: null })
        .eq('id', user.id);

      if (error) throw error;

      setPreviewUrl(null);
      onUploadSuccess?.('');

      toast({
        title: "Photo Removed",
        description: "Your profile photo has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to remove profile photo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-32 h-32">
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  disabled={uploading}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                <Camera className="h-8 w-8" />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium text-sm mb-1">Profile Photo</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Upload a professional headshot (JPG, PNG - Max 5MB)
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-3 w-3 mr-2" />
                {previewUrl ? 'Change Photo' : 'Upload Photo'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};