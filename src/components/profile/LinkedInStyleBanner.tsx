import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Camera, Edit, Users2, Eye, Link2 } from 'lucide-react';
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

  const formatTitleCase = (name: string) => {
    return name.toUpperCase();
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
    <TooltipProvider>
      <Card className="overflow-hidden border-0 shadow-xl bg-white transition-all duration-300 hover:shadow-2xl">
        {/* Enhanced Banner Section with Modern Gradient */}
        <div className="relative">
          <div 
            className="h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700"
            style={{
              backgroundImage: profile?.banner_url ? `url(${profile.banner_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Modern overlay for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/30" />
            
            {isOwnProfile && (
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 h-8 px-3 text-xs border border-white/30 rounded-full transition-all duration-200 hover:scale-105"
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
                  <Camera className="h-3 w-3 mr-1.5" />
                  {uploading === 'banner' ? 'Uploading...' : 'Edit Cover'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Profile Section */}
        <CardContent className="p-4 -mt-8 relative">
          <div className="flex flex-col">
            {/* Profile Picture and Enhanced Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {/* Enhanced Profile Picture with Animation */}
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-2xl bg-white ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40">
                    <AvatarImage src={profile?.profile_picture_url} className="object-cover" />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                      {generateInitials(profile)}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -bottom-1 -right-1 h-6 w-6 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg border-2 border-white transition-all duration-200 hover:scale-110"
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

                {/* Enhanced Profile Info with New Format */}
                <div className="pt-3 flex-1 font-inter">
                  {/* Name in Title Case with Pipe Separator */}
                  <div className="mb-2">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight tracking-tight">
                      {formatTitleCase(formatDisplayName(profile).split(' ')[0])} | {profile?.title || 'Director'}
                    </h2>
                  </div>
                  
                  {/* Headline | Extended Headline */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 font-medium leading-tight">
                      {profile?.headline || 'Innovative Professional'} | {profile?.bio || 'Building the future one project at a time'}
                    </p>
                  </div>
                  
                  {/* Enhanced Stats with Modern Icons and Tooltips */}
                  <div className="flex items-center gap-6 text-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 group cursor-pointer transition-all duration-200 hover:scale-105">
                          <div className="p-1.5 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors duration-200">
                            <Users2 className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-base leading-none animate-fade-in">
                              {stats.connections.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">connections</span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">Your professional network connections</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>  
                        <div className="flex items-center gap-2 group cursor-pointer transition-all duration-200 hover:scale-105">
                          <div className="p-1.5 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors duration-200">
                            <Eye className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 text-base leading-none animate-fade-in">
                              {stats.profileViews.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">profile views</span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">People who viewed your profile this week</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Enhanced Edit Button */}
              {isOwnProfile && (
                <Link to="/profile/edit">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-4 text-sm font-medium border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 hover:scale-105 rounded-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>

            {/* Optional: Quick Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200">
                <Link2 className="h-3 w-3 mr-1" />
                Share Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};