import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MapPin, Mail, User, ExternalLink } from 'lucide-react';
import { useOAuthProfileSync } from '@/hooks/useOAuthProfileSync';

interface ProfileData {
  full_name?: string;
  email?: string;
  profile_picture_url?: string;
  location?: string;
  oauth_provider?: string;
  oauth_metadata?: any;
  profile_data_source?: any;
}

export const ProfileEnhancement: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [showEnhancement, setShowEnhancement] = useState(false);
  const syncStatus = useOAuthProfileSync();

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, profile_picture_url, location, oauth_provider, oauth_metadata, profile_data_source')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        // Show enhancement screen if this is OAuth login with data
        if (data.oauth_provider !== 'email' && data.oauth_metadata && Object.keys(data.oauth_metadata).length > 0) {
          setShowEnhancement(true);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleContinue = () => {
    setShowEnhancement(false);
  };

  const handleEditProfile = () => {
    setShowEnhancement(false);
    // Navigate to profile edit page
    window.location.href = '/profile/edit';
  };

  if (!showEnhancement || !profile) return null;

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google': return 'Google';
      case 'linkedin_oidc': return 'LinkedIn';
      default: return provider;
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-xl">Welcome to TalentXcel!</CardTitle>
          <p className="text-sm text-muted-foreground">
            We've automatically set up your profile using your {getProviderName(profile.oauth_provider || '')} account
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Profile Preview */}
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.profile_picture_url} />
              <AvatarFallback>{getInitials(profile.full_name || '')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{profile.full_name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {profile.email}
              </p>
              {profile.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>

          {/* Auto-filled Data */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Auto-filled from {getProviderName(profile.oauth_provider || '')}:</h4>
            <div className="flex flex-wrap gap-2">
              {profile.full_name && (
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Name
                </Badge>
              )}
              {profile.email && (
                <Badge variant="secondary" className="text-xs">
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </Badge>
              )}
              {profile.profile_picture_url && (
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Profile Photo
                </Badge>
              )}
              {profile.location && (
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  Location
                </Badge>
              )}
            </div>
          </div>

          {/* Processing Status */}
          {syncStatus.isProcessing && (
            <div className="text-sm text-muted-foreground">
              🔄 Processing your profile photo...
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <Button 
              onClick={handleEditProfile}
              variant="outline" 
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Enhance My Profile
            </Button>
            <Button 
              onClick={handleContinue}
              className="w-full"
            >
              Continue to Dashboard
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You can always edit your profile later from the settings page
          </p>
        </CardContent>
      </Card>
    </div>
  );
};