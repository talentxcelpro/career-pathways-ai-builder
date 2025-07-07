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
  Star,
  Globe,
  Mail,
  Phone,
  Award,
  Building
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFileUpload } from '@/hooks/useFileUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BeautifulProfileSectionProps {
  profile: any;
  isOwnProfile?: boolean;
  stats?: {
    connections: number;
    profileViews: number;
    postsCount: number;
  };
}

export const BeautifulProfileSection: React.FC<BeautifulProfileSectionProps> = ({
  profile,
  isOwnProfile = false,
  stats = { connections: 0, profileViews: 0, postsCount: 0 }
}) => {
  const [uploading, setUploading] = useState<'banner' | 'avatar' | null>(null);
  
  const { uploadFile } = useFileUpload({
    bucket: 'avatars',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
      'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'
    ]
  });

  const handleImageUpload = async (type: 'banner' | 'avatar', file: File) => {
    if (!profile?.id) {
      toast.error('Profile not found');
      return;
    }

    setUploading(type);
    try {
      const customPath = type === 'banner' 
        ? `${profile.id}/banner-${Date.now()}.${file.name.split('.').pop()}`
        : `${profile.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`;
        
      const uploadedUrl = await uploadFile(file, customPath);
      
      const updateField = type === 'banner' ? 'banner_url' : 'profile_picture_url';
      const { error } = await supabase
        .from('profiles')
        .update({ [updateField]: uploadedUrl })
        .eq('id', profile.id);

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      
      toast.success(`${type === 'banner' ? 'Banner' : 'Profile picture'} updated successfully!`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Failed to update ${type === 'banner' ? 'banner' : 'profile picture'}: ${error.message}`);
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50">
        {/* Enhanced Banner Section */}
        <div className="relative h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
          {profile?.banner_url && (
            <img
              src={profile.banner_url}
              alt="Profile Banner"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          
          {isOwnProfile && (
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept='.jpeg,.jpg,.png,.gif,.webp,.svg,.bmp,.tiff';
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

        <CardContent className="p-8 -mt-16 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Side - Profile Picture and Basic Info */}
            <div className="flex flex-col items-center lg:items-start lg:w-80">
              {/* Enhanced Profile Picture */}
              <div className="relative mb-6">
                <Avatar className="w-32 h-32 border-4 border-white shadow-2xl ring-4 ring-blue-100">
                  <AvatarImage src={profile?.profile_picture_url} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                    {generateInitials(profile)}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-10 w-10 p-0 bg-white border-2 border-blue-200 shadow-lg hover:bg-blue-50 rounded-full"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept='.jpeg,.jpg,.png,.gif,.webp,.svg,.bmp,.tiff';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) handleImageUpload('avatar', file);
                      };
                      input.click();
                    }}
                    disabled={uploading === 'avatar'}
                  >
                    <Camera className="h-4 w-4 text-blue-600" />
                  </Button>
                )}
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 w-full mb-6">
                <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">{stats.connections}</div>
                  <div className="text-xs text-blue-600 font-medium">Connections</div>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{stats.profileViews}</div>
                  <div className="text-xs text-purple-600 font-medium">Profile Views</div>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <div className="text-2xl font-bold text-green-700">{stats.postsCount}</div>
                  <div className="text-xs text-green-600 font-medium">Posts</div>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 w-full">
                {isOwnProfile ? (
                  <>
                    <Link to="/profile/edit" className="w-full">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link to="/profile" className="w-full">
                      <Button variant="outline" className="w-full border-2 border-gray-300 hover:bg-gray-50">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full Profile
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg">
                      <Users className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                    <Link to={`/network/people/${profile?.id}`} className="w-full">
                      <Button variant="outline" className="w-full border-2 border-gray-300 hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Side - Detailed Information */}
            <div className="flex-1 space-y-6">
              {/* Name and Title Section */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl font-bold text-gray-900">
                        {formatDisplayName(profile)}
                      </h1>
                      {profile?.is_verified && (
                        <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    {profile?.title && (
                      <div className="flex items-center text-xl text-gray-700 font-medium">
                        <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                        {profile.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="flex flex-wrap gap-4 text-gray-600">
                  {profile?.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-red-500" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile?.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile?.website && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-green-500" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile?.created_at && (
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Joined {formatJoinDate(profile.created_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio/Summary */}
              {profile?.bio && (
                <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {profile.bio}
                  </p>
                </Card>
              )}

              {/* Skills/Interests */}
              {profile?.career_interests && profile.career_interests.length > 0 && (
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-purple-600" />
                    Career Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.career_interests.slice(0, 8).map((interest: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors">
                        {interest}
                      </Badge>
                    ))}
                    {profile.career_interests.length > 8 && (
                      <Badge variant="outline" className="border-purple-300 text-purple-700">
                        +{profile.career_interests.length - 8} more
                      </Badge>
                    )}
                  </div>
                </Card>
              )}

              {/* Achievement Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                {profile?.profile_completed && (
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1 px-3 py-1">
                    <Star className="h-3 w-3" />
                    Complete Profile
                  </Badge>
                )}
                {profile?.is_employer && (
                  <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1 px-3 py-1">
                    <Building className="h-3 w-3" />
                    Employer
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};