import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Edit, Users, Eye } from 'lucide-react';
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
    return 'Hussain';
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
    <Card className="overflow-hidden border-0 shadow-lg mb-4">
      {/* Banner Section */}
      <div className="relative">
        <div 
          className="h-32 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800"
          style={{
            backgroundImage: profile?.banner_url ? `url(${profile.banner_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {isOwnProfile && (
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/30 text-white hover:bg-black/50 h-8 px-2 text-xs"
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
                <Camera className="h-3 w-3 mr-1" />
                {uploading === 'banner' ? 'Uploading...' : 'Edit'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Section */}
      <CardContent className="p-4 -mt-8 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg bg-white">
                <AvatarImage src={profile?.profile_picture_url} />
                <AvatarFallback className="text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                  {generateInitials(profile)}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -bottom-1 -right-1 h-6 w-6 p-0 bg-white border-2 border-white shadow-sm hover:bg-gray-50 rounded-full"
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
                  <Camera className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Profile Info */}
            <div className="pt-4">
              <h2 className="text-xl font-bold text-gray-900">
                {formatDisplayName(profile)}
              </h2>
              <p className="text-gray-600 text-sm mb-2">
                {profile?.title || 'Director'}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-medium text-blue-600">{stats.connections}</span>
                  <span>connections</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium text-blue-600">{stats.profileViews}</span>
                  <span>views</span>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          {isOwnProfile && (
            <Link to="/profile/edit">
              <Button variant="outline" size="sm" className="mt-4">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};