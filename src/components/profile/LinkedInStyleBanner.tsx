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
    <Card className="overflow-hidden border shadow-sm bg-white">
      {/* LinkedIn-Style Banner Section */}
      <div className="relative">
        <div 
          className="h-[54px] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800"
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
                className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 h-6 px-2 text-xs border border-white/20"
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

      {/* LinkedIn-Style Profile Section */}
      <CardContent className="p-4 -mt-12 relative">
        <div className="flex items-start justify-between">
          {/* Left side - Profile Picture and Info */}
          <div className="flex items-start gap-4">
            {/* Profile Picture - LinkedIn Style */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile?.profile_picture_url} className="object-cover" />
                <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                  {generateInitials(profile)}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -bottom-1 -right-1 h-6 w-6 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg border-2 border-white"
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

            {/* Profile Information - LinkedIn Layout */}
            <div className="pt-8 flex-1">
              {/* Name - LinkedIn Style */}
              <h1 className="text-2xl font-semibold text-gray-900 leading-tight mb-1">
                {formatDisplayName(profile)}
              </h1>
              
              {/* Professional Headline - Most Prominent like LinkedIn */}
              {profile?.headline ? (
                <p className="text-gray-600 text-base leading-relaxed mb-1 max-w-md">
                  {profile.headline}
                </p>
              ) : profile?.title ? (
                <p className="text-gray-600 text-base leading-relaxed mb-1">
                  {profile.title}
                </p>
              ) : (
                <p className="text-gray-500 text-base mb-1">Add a professional headline</p>
              )}
              
              {/* Location and Company - LinkedIn Style */}
              <div className="text-sm text-gray-500 mb-2 space-y-0.5">
                {profile?.location && (
                  <p className="flex items-center gap-1">
                    <span>📍</span> {profile.location}
                  </p>
                )}
                {profile?.current_company && (
                  <p>{profile.current_company}</p>
                )}
              </div>
              
              {/* Connection Stats - LinkedIn Style */}
              <div className="flex items-center gap-3 text-sm">
                <button className="text-blue-600 hover:underline font-medium">
                  {stats.connections} connections
                </button>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  {stats.profileViews} profile views
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Edit Button */}
          {isOwnProfile && (
            <div className="pt-8">
              <Link to="/profile/edit">
                <Button variant="outline" size="sm" className="h-8 px-3 text-sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit profile
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};