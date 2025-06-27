
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileSetup } from '@/components/onboarding/ProfileSetup';
import { UserRole, getUserRoleFromString } from '@/utils/roleRouting';
import { useAuth } from '@/contexts/AuthContext';

const OnboardingProfile = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const selectedRole = getUserRoleFromString(
    sessionStorage.getItem('selectedRole') || profile?.user_role || 'candidate'
  );

  const handleComplete = (profileData: any) => {
    // Store profile data for final step
    sessionStorage.setItem('profileData', JSON.stringify(profileData));
    navigate('/onboarding/preferences');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ProfileSetup
        userRole={selectedRole}
        onComplete={handleComplete}
        initialData={{
          fullName: profile?.full_name || '',
          location: '',
          about: ''
        }}
      />
    </div>
  );
};

export default OnboardingProfile;
