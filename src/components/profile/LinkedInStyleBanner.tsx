import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Edit, MapPin, Building2, Eye, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import { useProfileUpdate } from '@/hooks/useProfileUpdate';

interface LinkedInStyleBannerProps {
  profile: any;
  isOwnProfile?: boolean;
  stats?: {
    connections: number;
    profileViews: number;
  };
}

export const LinkedInStyleBanner: React.FC<LinkedInStyleBannerProps> = ({
  profile,
  isOwnProfile = false,
  stats = { connections: 0, profileViews: 0 }
}) => {
  const [uploading, setUploading] = useState<'banner' | 'avatar' | null>(null);
  
  const { uploadFile } = useFileUpload({
    bucket: 'avatars',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/*']
  });

  const { updateProfile, updateProfilePicture } = useProfileUpdate();

  const handleImageUpload = async (type: 'banner' | 'avatar', file: File) => {
    setUploading(type);
    try {
      const uploadedUrl = await uploadFile(file);

      if (type === 'avatar') {
        await updateProfilePicture.mutateAsync(uploadedUrl);
      } else {
        await updateProfile.mutateAsync({ cover_image_url: uploadedUrl } as any);
      }

      toast.success(`${type} updated successfully!`);
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to update ${type}`);
    } finally {
      setUploading(null);
    }
  };

  const formatDisplayName = (profile: any) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    return 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      <Card className="overflow-hidden border border-gray-200 shadow-sm bg-white rounded-lg">
        {/* Banner Image - Fixed aspect ratio */}
        <div className="relative w-full bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden" style={{ aspectRatio: '3 / 1', minHeight: '80px' }}>
          {profile?.cover_image_url ? (
            <img 
              src={profile.cover_image_url} 
              alt="Profile banner"
              className="w-full h-full object-cover object-center"
              style={{ minHeight: '64px' }}
            />
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&h=200"
              alt="Default banner"
              className="w-full h-full object-cover object-center"
              style={{ minHeight: '64px' }}
            />
          )}
          {isOwnProfile && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 h-5 w-5 p-0 bg-black/20 hover:bg-black/30 rounded-full"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleImageUpload('banner', file);
                };
                input.click();
              }}
              disabled={uploading === 'banner'}
            >
              <Camera className="h-2.5 w-2.5 text-white" />
            </Button>
          )}
        </div>

        {/* Profile Content - Reduced padding */}
        <CardContent className="p-3 text-center">
          {/* Profile Picture - Smaller size */}
          <div className="relative mb-3 flex justify-center">
            <Avatar className="w-16 h-16 border-2 border-white shadow-md">
              <AvatarImage src={profile?.profile_picture_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-sm">
                {generateInitials(profile)}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -bottom-1 -right-6 h-5 w-5 p-0 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleImageUpload('avatar', file);
                  };
                  input.click();
                }}
                disabled={uploading === 'avatar'}
              >
                <Camera className="h-2.5 w-2.5 text-gray-600" />
              </Button>
            )}
          </div>

          {/* Name - Smaller text */}
          <div className="mb-2">
            <h2 className="text-base font-semibold text-gray-900 truncate">
              {formatDisplayName(profile)}
            </h2>
          </div>

          {/* Professional headline - Smaller text */}
          {profile?.headline || profile?.title ? (
            <p className="text-xs text-gray-700 mb-2 leading-relaxed truncate">
              {profile.headline || profile.title}
            </p>
          ) : null}

          {/* Company - Smaller size */}
          {profile?.current_company && (
            <div className="flex items-center justify-center gap-1 mb-2">
              <Building2 className="h-2.5 w-2.5 text-gray-500" />
              <p className="text-xs font-medium text-gray-800 truncate">
                {profile.current_company}
              </p>
            </div>
          )}

          {/* Location - Smaller text */}
          {profile?.location && (
            <p className="text-xs text-gray-500 truncate mb-2">
              {profile.location}
            </p>
          )}

          {/* Action buttons - Smaller spacing */}
          <div className="mt-3 space-y-2">
            {isOwnProfile && (
              <Link to="/profile/edit">
                <Button variant="outline" size="sm" className="w-full text-xs h-7">
                  <Edit className="h-2.5 w-2.5 mr-1" />
                  Edit profile
                </Button>
              </Link>
            )}
            
            {/* Upgrade Now button */}
            <Link to="/pro/subscription">
              <Button size="sm" className="w-full text-xs h-7 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};