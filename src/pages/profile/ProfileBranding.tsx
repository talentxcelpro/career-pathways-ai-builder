import React from 'react';
import ProfileLayout from '@/components/profile/ProfileLayout';
import { CustomBrandingSettings } from '@/components/profile/branding/CustomBrandingSettings';

const ProfileBranding = () => {
  return (
    <ProfileLayout title="Custom Branding">
      <div className="space-y-6">
        <CustomBrandingSettings />
      </div>
    </ProfileLayout>
  );
};

export default ProfileBranding;