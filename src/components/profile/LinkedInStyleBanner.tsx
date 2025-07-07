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
    <Card className="overflow-hidden border-0 shadow-xl bg-white">
      {/* Enhanced Banner Section */}
      <div className="relative">
        <div 
          className="h-28 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"
          style={{
            backgroundImage: profile?.banner_url ? `url(${profile.banner_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Subtle overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/20" />
          
          {isOwnProfile && (
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 h-7 px-2 text-xs border border-white/20"
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
                {uploading === 'banner' ? 'Uploading...' : 'Edit Cover'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Profile Section */}
      <CardContent className="p-3 -mt-6 relative">
        <div className="flex flex-col">
          {/* Profile Picture and Basic Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              {/* Enhanced Profile Picture */}
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-white shadow-2xl bg-white ring-4 ring-primary/20">
                  <AvatarImage src={profile?.profile_picture_url} className="object-cover" />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                    {generateInitials(profile)}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -bottom-0.5 -right-0.5 h-5 w-5 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md border-2 border-white"
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
                    <Camera className="h-2.5 w-2.5" />
                  </Button>
                )}
              </div>

              {/* Profile Info */}
              <div className="pt-2 flex-1">
                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                  {formatDisplayName(profile)}
                </h2>
                <p className="text-gray-600 text-xs mb-2 leading-tight">
                  {profile?.title || 'Director'}
                </p>
                
                {/* Compact Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="font-semibold text-blue-600">{stats.connections}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span className="font-semibold text-blue-600">{stats.profileViews}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {isOwnProfile && (
              <Link to="/profile/edit">
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};