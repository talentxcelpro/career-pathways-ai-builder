
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PreferencesSetup } from '@/components/onboarding/PreferencesSetup';
import { UserRole, getUserRoleFromString, getRedirectPathForRole } from '@/utils/roleRouting';
import { useAuth } from '@/contexts/AuthContext';

const OnboardingPreferences = () => {
  const navigate = useNavigate();
  const { completeOnboarding, profile } = useAuth();
  const selectedRole = getUserRoleFromString(
    sessionStorage.getItem('selectedRole') || profile?.user_role || 'candidate'
  );

  const handleComplete = async (preferences: any) => {
    try {
      // Get stored profile data
      const profileDataStr = sessionStorage.getItem('profileData');
      const profileData = profileDataStr ? JSON.parse(profileDataStr) : {};

      // Complete onboarding
      const { error } = await completeOnboarding(
        profileData.fullName,
        selectedRole,
        preferences
      );

      if (error) {
        console.error('Onboarding completion error:', error);
        return;
      }

      // Clear session storage
      sessionStorage.removeItem('selectedRole');
      sessionStorage.removeItem('profileData');

      // Navigate to role-specific dashboard
      navigate(getRedirectPathForRole(selectedRole, false));
    } catch (error) {
      console.error('Onboarding error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PreferencesSetup
        userRole={selectedRole}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default OnboardingPreferences;
