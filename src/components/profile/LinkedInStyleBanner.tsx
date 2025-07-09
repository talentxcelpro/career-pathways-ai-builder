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
      <Card className="overflow-hidden border-0 shadow-elegant bg-background transition-all duration-300 hover:shadow-glow">
        {/* Enhanced Banner Section - Taller to prevent overlap */}
        <div className="relative">
          <div 
            className="h-40 bg-gradient-primary relative overflow-hidden"
            style={{
              backgroundImage: profile?.banner_url ? `url(${profile.banner_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center top'
            }}
          >
            {/* Professional overlay with blur effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-background/20 to-background/30 backdrop-blur-[0.5px]" />
            
            {isOwnProfile && (
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-background/10 backdrop-blur-md text-foreground hover:bg-background/20 h-9 px-4 text-sm border border-border/30 rounded-full transition-smooth hover:scale-105 shadow-lg"
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
                  {uploading === 'banner' ? 'Uploading...' : 'Edit Cover'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Profile Section - Reduced overlap */}
        <CardContent className="p-6 -mt-12 relative">
          <div className="flex flex-col">
            {/* Profile Picture and Enhanced Info */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                {/* Enhanced Profile Picture with Glow Effect */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-primary rounded-full opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Avatar className="relative w-28 h-28 border-4 border-background shadow-2xl bg-background ring-2 ring-primary/30 transition-all duration-300 group-hover:ring-primary/50 group-hover:scale-105">
                    <AvatarImage 
                      src={profile?.profile_picture_url} 
                      className="object-cover object-center"
                      style={{ objectPosition: 'center center' }}
                    />
                    <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground font-bold">
                      {generateInitials(profile)}
                    </AvatarFallback>
                  </Avatar>
                  {isOwnProfile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 p-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg border-3 border-background transition-smooth hover:scale-110"
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
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Enhanced Profile Info with Better Spacing */}
                <div className="pt-4 flex-1 min-w-0">
                  {/* Name and Title - Fixed text overflow */}
                  <div className="mb-3">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight tracking-tight truncate">
                      {formatTitleCase(formatDisplayName(profile).split(' ')[0])} | {profile?.title || 'Director, Product Strategy'}
                    </h2>
                  </div>
                  
                  {/* Enhanced Headline */}
                  <div className="mb-4">
                    <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed line-clamp-2">
                      {profile?.headline || 'Director | Career Strategy Innovator'} | {profile?.bio || 'Empowering Global Talent with AI-Driven Solutions'}
                    </p>
                  </div>
                  
                  {/* Enhanced Stats with Animations and Better Icons */}
                  <div className="flex items-center gap-8 text-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-3 group cursor-pointer transition-smooth hover:scale-105">
                          <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300 group-hover:shadow-glow">
                            <Users2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-lg leading-none animate-fade-in counter-animation">
                              {stats.connections.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">connections</span>
                          </div>
                          {stats.connections > 50 && (
                            <div className="ml-2 px-2 py-1 bg-accent rounded-full">
                              <span className="text-xs font-semibold text-accent-foreground">Growing</span>
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">Your professional network connections</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>  
                        <div className="flex items-center gap-3 group cursor-pointer transition-smooth hover:scale-105">
                          <div className="p-2 bg-secondary/50 rounded-full group-hover:bg-secondary transition-colors duration-300 group-hover:shadow-glow">
                            <Eye className="h-5 w-5 text-secondary-foreground" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-lg leading-none animate-fade-in counter-animation">
                              {stats.profileViews.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground font-medium">profile views</span>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-10 px-6 text-sm font-medium border-border hover:border-primary hover:bg-primary/5 transition-smooth hover:scale-105 rounded-full shadow-sm hover:shadow-md"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit your profile information</p>
                    </TooltipContent>
                  </Tooltip>
                </Link>
              )}
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 h-10 text-sm hover:bg-primary/5 hover:text-primary transition-smooth rounded-lg"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Share Profile
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share your profile with others</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};