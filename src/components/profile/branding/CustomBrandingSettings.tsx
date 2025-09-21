import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureGating } from '@/hooks/useFeatureGating';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomLogoUpload } from './CustomLogoUpload';
import { VideoBioUpload } from './VideoBioUpload';
import { VanityUrlSettings } from './VanityUrlSettings';
import { CustomThemeSettings } from './CustomThemeSettings';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
// TXC-based branding - no subscription modal needed
import { useState } from 'react';

export const CustomBrandingSettings: React.FC = () => {
  const { user } = useAuth();
  const { hasCustomBranding, tier } = useFeatureGating();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { data: profile, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true);
  };

  if (!hasCustomBranding) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Custom Branding
            <Badge variant="secondary" className="ml-2">
              <Lock className="h-3 w-3 mr-1" />
              Elite Feature
            </Badge>
          </CardTitle>
          <CardDescription>
            Personal branding features available with Elite subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <Crown className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Upgrade to Elite</h3>
            <p className="text-muted-foreground mb-4">
              Get access to custom branding features including:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-6">
              <li>• Custom logo upload</li>
              <li>• Video bio integration</li>
              <li>• Vanity URLs (talentxcel.in/username-pro)</li>
              <li>• Custom colour themes</li>
            </ul>
            <Button onClick={handleUpgradeClick}>
              Upgrade to Elite
            </Button>
          </div>
          
            {/* TXC-based upgrade - redirect to TXC pricing */}
            <Button onClick={() => window.location.href = '/txc/pricing'}>
              View TXC Pricing
            </Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            Custom Branding
          </h2>
          <p className="text-muted-foreground">
            Personalize your profile with custom branding features
          </p>
        </div>
        <Badge variant="outline" className="text-primary">
          Elite Member
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomLogoUpload
          currentLogoUrl={profile.custom_logo_url}
          profileId={profile.id}
          onUploadSuccess={() => refetch()}
        />
        
        <VideoBioUpload
          currentVideoUrl={profile.video_bio_url}
          profileId={profile.id}
          onUploadSuccess={() => refetch()}
        />
      </div>

      <VanityUrlSettings
        currentVanityUrl={profile.vanity_url}
        profileName={profile.full_name || 'User'}
        profileId={profile.id}
        onUpdateSuccess={() => refetch()}
      />

      <CustomThemeSettings
        currentTheme={profile.custom_theme}
        profileId={profile.id}
        onUpdateSuccess={() => refetch()}
      />
    </div>
  );
};