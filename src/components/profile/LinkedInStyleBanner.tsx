import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Edit, MapPin, Building2, Eye, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  const handleImageUpload = async (type: 'banner' | 'avatar', file: File) => {
    setUploading(type);
    try {
      const uploadedUrl = await uploadFile(file);
      
      const updateField = type === 'banner' ? 'banner_url' : 'profile_picture_url';
      const { error } = await supabase
        .from('profiles')
        .update({ [updateField]: uploadedUrl })
        .eq('id', profile?.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      toast.success(`${type} updated successfully!`);
      setTimeout(() => window.location.reload(), 1000);
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
    <div className="w-full max-w-sm mx-auto">
      <Card className="overflow-hidden border border-gray-200 shadow-sm bg-white rounded-lg">
        {/* Banner Image */}
        <div className="relative h-16 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden">
          {profile?.banner_url ? (
            <img 
              src={profile.banner_url} 
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&h=200"
              alt="Default banner"
              className="w-full h-full object-cover"
            />
          )}
          {isOwnProfile && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 bg-black/20 hover:bg-black/30 rounded-full"
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
              <Camera className="h-3 w-3 text-white" />
            </Button>
          )}
        </div>

        {/* Profile Content */}
        <CardContent className="p-4 text-center">
          {/* Profile Picture */}
          <div className="relative mb-4 flex justify-center">
            <Avatar className="w-16 h-16 border-2 border-white shadow-md">
              <AvatarImage src={profile?.profile_picture_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-lg">
                {generateInitials(profile)}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute -bottom-1 -right-8 h-6 w-6 p-0 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm"
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
                <Camera className="h-3 w-3 text-gray-600" />
              </Button>
            )}
          </div>

          {/* Name */}
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {formatDisplayName(profile)}
            </h2>
          </div>

          {/* Professional headline */}
          {profile?.headline || profile?.title ? (
            <p className="text-sm text-gray-700 mb-2 leading-relaxed">
              {profile.headline || profile.title}
            </p>
          ) : null}

          {/* Company */}
          {profile?.current_company && (
            <div className="flex items-center justify-center gap-1 mb-2">
              <Building2 className="h-3 w-3 text-gray-500" />
              <p className="text-sm font-medium text-gray-800">
                {profile.current_company}
              </p>
            </div>
          )}

          {/* Location */}
          {profile?.location && (
            <p className="text-xs text-gray-500">
              {profile.location}
            </p>
          )}

          {/* Edit button for own profile */}
          {isOwnProfile && (
            <div className="mt-4">
              <Link to="/profile/edit">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit profile
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};