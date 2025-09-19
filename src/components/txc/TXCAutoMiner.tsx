import { useEffect } from 'react';
import { useTXCIntegration } from '@/hooks/useTXCIntegration';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Invisible component that automatically triggers TXC mining for various user activities
 * Add this component to your app's main layout to enable automatic mining
 */
export const TXCAutoMiner = () => {
  const { user } = useAuth();
  const { 
    triggerSocialActivityBonus 
  } = useTXCIntegration();

  // Auto-award joining bonus for new users (one-time)
  useEffect(() => {
    if (user) {
      // Check if user is new (created in last 24 hours)
      const userCreated = new Date(user.created_at);
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - userCreated.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation <= 24) {
        // Joining bonus is handled by the award-joining-bonus edge function
        console.log('New user detected - joining bonus handled automatically');
      }
    }
  }, [user]);

  // Trigger weekly social activity bonus
  useEffect(() => {
    if (user) {
      const checkWeeklyBonus = () => {
        const lastSunday = new Date();
        lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay());
        lastSunday.setHours(0, 0, 0, 0);
        
        // Try to award weekly bonus (will be silently ignored if already claimed)
        triggerSocialActivityBonus?.();
      };

      // Check immediately and then set up weekly check
      checkWeeklyBonus();
      const weeklyInterval = setInterval(checkWeeklyBonus, 24 * 60 * 60 * 1000); // Daily check

      return () => clearInterval(weeklyInterval);
    }
  }, [user, triggerSocialActivityBonus]);

  // This component renders nothing - it just handles automatic mining
  return null;
};