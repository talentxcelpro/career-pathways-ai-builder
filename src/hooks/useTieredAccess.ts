import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from './useTokenBalance';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getTXCPrice, formatTXC } from '@/types/txc-pricing';

export type AccessTier = 'free' | 'basic' | 'pro' | 'enterprise';

export const useTieredAccess = () => {
  const { user } = useAuth();
  const { availableBalance } = useTokenBalance();
  const { toast } = useToast();
  const [currentTier, setCurrentTier] = useState<AccessTier>('free');
  const [userFeatures, setUserFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setCurrentTier('free');
      setUserFeatures([]);
      return;
    }

    fetchUserFeatures();
  }, [user]);

  const fetchUserFeatures = async () => {
    if (!user) return;

    try {
      const { data: features, error } = await supabase
        .from('user_features')
        .select('feature_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()');

      if (error) {
        console.error('Error fetching user features:', error);
        return;
      }

      const activeFeatures = features?.map(f => f.feature_id) || [];
      setUserFeatures(activeFeatures);

      // Determine tier based on active features
      if (activeFeatures.some(f => f.includes('enterprise'))) {
        setCurrentTier('enterprise');
      } else if (activeFeatures.some(f => f.includes('pro'))) {
        setCurrentTier('pro');
      } else if (activeFeatures.some(f => f.includes('basic'))) {
        setCurrentTier('basic');
      } else {
        setCurrentTier('free');
      }
    } catch (error) {
      console.error('Error in fetchUserFeatures:', error);
    }
  };

  const hasFeatureAccess = (feature: string, requiresAuth: boolean = true): boolean => {
    // Free features that don't require payment
    const freeFeatures = [
      'basic_profile',
      'job_search',
      'basic_applications',
      'community_access'
    ];

    if (freeFeatures.includes(feature)) {
      return requiresAuth ? !!user : true;
    }

    // Check if user has purchased this specific feature
    if (userFeatures.includes(feature)) {
      return true;
    }

    // Check tier-based access
    switch (currentTier) {
      case 'enterprise':
        return true; // Enterprise has access to everything
      case 'pro':
        return !feature.includes('enterprise');
      case 'basic':
        return !feature.includes('pro') && !feature.includes('enterprise');
      default:
        return false;
    }
  };

  const canAffordFeature = (featureId: string): boolean => {
    const cost = getTXCPrice(featureId);
    return availableBalance >= cost;
  };

  const showUpgradePrompt = (feature: string, requiredTier?: AccessTier) => {
    const cost = getTXCPrice(feature);
    
    if (cost > 0) {
      toast({
        title: "TXC Purchase Required",
        description: `This feature requires ${formatTXC(cost)}. ${canAffordFeature(feature) ? 'Click to purchase.' : `You need ${formatTXC(cost - availableBalance)} more TXC.`}`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Upgrade Required",
        description: `This feature requires ${requiredTier || 'a higher'} tier. Purchase TXC to unlock premium features.`,
        variant: "destructive",
      });
    }
  };

  const getUpgradeMessage = (feature: string): string => {
    const cost = getTXCPrice(feature);
    
    if (cost > 0) {
      if (canAffordFeature(feature)) {
        return `Purchase this feature for ${formatTXC(cost)} to unlock it.`;
      } else {
        const needed = cost - availableBalance;
        return `You need ${formatTXC(needed)} more TXC to purchase this feature.`;
      }
    }

    return 'Upgrade your account with TXC to access premium features.';
  };

  return {
    currentTier,
    userFeatures,
    hasFeatureAccess,
    canAffordFeature,
    showUpgradePrompt,
    getUpgradeMessage,
    isAuthenticated: !!user,
    availableBalance,
    refreshFeatures: fetchUserFeatures
  };
};