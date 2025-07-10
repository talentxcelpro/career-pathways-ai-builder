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
    <div className="w-full max-w-5xl mx-auto">
      <Card className="overflow-hidden border-0 shadow-lg bg-white rounded-xl">
        {/* Enhanced LinkedIn-Style Banner */}
        <div className="relative">
          <div 
            className="h-48 sm:h-56 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative"
            style={{
              backgroundImage: profile?.banner_url ? `url(${profile.banner_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Banner overlay for better text readability */}
            <div className="absolute inset-0 bg-black/10" />
            
            {isOwnProfile && (
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200 shadow-sm font-medium"
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
                  <Camera className="h-4 w-4 mr-2" />
                  {uploading === 'banner' ? 'Uploading...' : 'Edit cover photo'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Profile Section */}
        <CardContent className="px-6 py-6 -mt-20 relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left side - Profile Picture and Main Info */}
            <div className="flex flex-col sm:flex-row items-start gap-6 flex-1">
              {/* Enhanced Profile Picture */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-32 h-32 sm:w-36 sm:h-36 border-4 border-white shadow-xl ring-1 ring-gray-200">
                  <AvatarImage src={profile?.profile_picture_url} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold">
                    {generateInitials(profile)}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-10 w-10 p-0 bg-white hover:bg-gray-50 border-4 border-white rounded-full shadow-lg ring-1 ring-gray-200"
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
                    <Camera className="h-4 w-4 text-gray-600" />
                  </Button>
                )}
              </div>

              {/* Enhanced Profile Information */}
              <div className="flex-1 pt-4 sm:pt-8 min-w-0">
                {/* Name with better typography */}
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2 tracking-tight">
                  {formatDisplayName(profile)}
                </h1>
                
                {/* Professional Headline - More prominent */}
                {profile?.headline ? (
                  <p className="text-xl text-gray-700 font-medium leading-relaxed mb-3 max-w-2xl">
                    {profile.headline}
                  </p>
                ) : profile?.title ? (
                  <p className="text-xl text-gray-700 font-medium leading-relaxed mb-3">
                    {profile.title}
                  </p>
                ) : (
                  <p className="text-xl text-gray-400 font-medium mb-3">Add a professional headline</p>
                )}
                
                {/* Location and Company with better icons */}
                <div className="flex flex-wrap items-center gap-4 text-base text-gray-600 mb-4">
                  {profile?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile?.current_company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span>{profile.current_company}</span>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Connection Stats */}
                <div className="flex flex-wrap items-center gap-6 text-base">
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">
                    <Users className="h-4 w-4" />
                    <span>{stats.connections.toLocaleString()} connections</span>
                  </button>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span>{stats.profileViews.toLocaleString()} profile views</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Enhanced Action Buttons */}
            {isOwnProfile && (
              <div className="flex flex-col gap-3 pt-4 lg:pt-8 flex-shrink-0">
                <Link to="/profile/edit">
                  <Button 
                    variant="outline" 
                    className="w-full lg:w-auto h-10 px-6 font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 transition-all duration-200"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit profile
                  </Button>
                </Link>
                
                <Button 
                  variant="default" 
                  className="w-full lg:w-auto h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-all duration-200"
                >
                  View public profile
                </Button>
              </div>
            )}
          </div>
          
          {/* Additional Professional Details */}
          {(profile?.bio || profile?.skills) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              {profile?.bio && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700 leading-relaxed max-w-3xl">
                    {profile.bio}
                  </p>
                </div>
              )}
              
              {profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.slice(0, 6).map((skill: string, index: number) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {profile.skills.length > 6 && (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                        +{profile.skills.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};