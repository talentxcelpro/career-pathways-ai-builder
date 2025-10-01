import React, { useEffect } from 'react';
import { useViralMechanics } from '@/hooks/useViralMechanics';
import { useStreaks } from '@/hooks/useStreaks';

export const PhaseInitializer: React.FC = () => {
  const { trackConversion } = useViralMechanics();
  const { updateStreak } = useStreaks();

  useEffect(() => {
    // Check for referral code in URL and track conversion
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      trackConversion(refCode);
    }
    
    // Update daily streak on app load
    updateStreak();
  }, [trackConversion, updateStreak]);

  return null; // This component doesn't render anything
};
