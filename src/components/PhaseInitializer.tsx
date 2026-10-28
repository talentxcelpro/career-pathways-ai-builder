import React, { useEffect } from 'react';
import { useViralMechanics } from '@/hooks/useViralMechanics';
import { useStreaks } from '@/hooks/useStreaks';
import { useAuth } from '@/contexts/AuthContext';

export const PhaseInitializer: React.FC = () => {
  const { user } = useAuth();
  const { trackConversion } = useViralMechanics();
  const { updateStreak } = useStreaks();

  useEffect(() => {
    // Check for referral code in URL and track conversion
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      trackConversion(refCode);
    }
    
    // Update daily streak on app load only for authenticated users
    if (user) {
      updateStreak();
    }
  }, [user, trackConversion, updateStreak]);

  return null; // This component doesn't render anything
};
