import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  MapPin, 
  Briefcase, 
  Users, 
  Eye, 
  Edit,
  ExternalLink,
  Calendar,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileBannerProps {
  profile: any;
  isOwnProfile?: boolean;
  isCompact?: boolean;
  stats?: {
    connections: number;
    profileViews: number;
    postsCount: number;
  };
}

export const ProfileBanner: React.FC<ProfileBannerProps> = ({
  profile,
  isOwnProfile = false,
  isCompact = false,
  stats = { connections: 0, profileViews: 0, postsCount: 0 }
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
      
      const updateField = type === 'banner' ? 'cover_image_url' : 'profile_picture_url';
      const { error } = await supabase
        .from('profiles')
        .update({ 
          [updateField]: uploadedUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile?.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
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
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  if (isCompact) {
    return (
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Compact Avatar */}
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
                <AvatarImage src={profile?.profile_picture_url} />
                <AvatarFallback className="text-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {generateInitials(profile)}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -bottom-1 -right-1 h-6 w-6 p-0 bg-white border shadow-sm hover:bg-gray-50"
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

            {/* Compact Profile Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {formatDisplayName(profile)}
              </h3>
              {profile?.title && (
                <p className="text-xs text-gray-600 truncate">{profile.title}</p>
              )}
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>{stats.connections} connections</span>
                <span>{stats.profileViews} views</span>
              </div>
            </div>

            {/* Compact Actions */}
            {isOwnProfile && (
              <Link to="/profile/edit">
                <Button size="sm" variant="outline" className="text-xs h-7">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-xl">
      {/* Banner Image */}
      <div className="relative">
        <div 
          className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800"
          style={{
            backgroundImage: profile?.cover_image_url ? `url(${profile.cover_image_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {isOwnProfile && (
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70"
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
                {uploading === 'banner' ? 'Uploading...' : 'Change Banner'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Picture and Basic Info */}
          <div className="flex flex-col items-center md:items-start">
            <div className="relative -mt-16 mb-4">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                <AvatarImage src={profile?.profile_picture_url} />
                <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  {generateInitials(profile)}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-0 right-0 bg-white border shadow-md hover:bg-gray-50"
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

            {/* Stats */}
            <div className="flex gap-6 text-center md:text-left">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.connections}</div>
                <div className="text-sm text-gray-600">Connections</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.profileViews}</div>
                <div className="text-sm text-gray-600">Profile Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.postsCount}</div>
                <div className="text-sm text-gray-600">Posts</div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {formatDisplayName(profile)}
                </h1>
                
                {profile?.title && (
                  <div className="flex items-center text-lg text-gray-700 mb-2">
                    <Briefcase className="h-5 w-5 mr-2" />
                    {profile.title}
                  </div>
                )}
                
                {profile?.location && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {profile.location}
                  </div>
                )}

                {profile?.created_at && (
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {formatJoinDate(profile.created_at)}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <>
                    <Link to="/profile/edit">
                      <Button className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link to="/profile">
                      <Button variant="outline" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Full Profile
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Connect
                    </Button>
                    <Link to={`/network/people/${profile.id}`}>
                      <Button variant="outline" className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Profile
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Bio/Summary */}
            {profile?.bio && (
              <p className="text-gray-700 mb-4 leading-relaxed">
                {profile.bio}
              </p>
            )}

            {/* Skills/Interests */}
            {profile?.career_interests && profile.career_interests.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.career_interests.slice(0, 5).map((interest: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {profile.career_interests.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.career_interests.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Achievement Badge */}
            {profile?.profile_completed && (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Complete Profile
                </Badge>
                {profile?.is_verified && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Verified
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};