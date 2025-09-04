import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from './useSubscription';
import { AccessTier, TierLimits, TIER_LIMITS, PUBLIC_FEATURES } from '@/types/access';
import { useToast } from '@/hooks/use-toast';

export const useTieredAccess = () => {
  const { user } = useAuth();
  const { subscription, isActive } = useSubscription();
  const { toast } = useToast();
  const [currentTier, setCurrentTier] = useState<AccessTier>('free');

  useEffect(() => {
    if (!user) {
      setCurrentTier('free');
      return;
    }

    if (isActive() && subscription) {
      const planName = subscription.subscription_plans.name.toLowerCase();
      if (planName.includes('enterprise')) {
        setCurrentTier('enterprise');
      } else if (planName.includes('pro')) {
        setCurrentTier('pro');
      } else {
        setCurrentTier('free');
      }
    } else {
      setCurrentTier('free');
    }
  }, [user, subscription, isActive]);

  const getTierLimits = (): TierLimits => {
    return TIER_LIMITS[currentTier];
  };

  const hasFeatureAccess = (feature: string, requiresAuth: boolean = true): boolean => {
    // Check if feature is publicly accessible
    const publicFeature = PUBLIC_FEATURES.find(f => f.feature === feature);
    if (publicFeature && publicFeature.isPublic) {
      return true;
    }

    // For authenticated features, check if user is logged in
    if (requiresAuth && !user) {
      return false;
    }

    // Check tier-based access
    const limits = getTierLimits();
    
    switch (feature) {
      case 'advanced_analytics':
        return limits.advancedAnalytics;
      case 'custom_branding':
        return limits.customBranding;
      case 'api_access':
        return limits.apiAccess;
      case 'priority_support':
        return limits.supportLevel === 'priority';
      default:
        return true;
    }
  };

  const checkUsageLimit = (type: keyof TierLimits, currentUsage: number): boolean => {
    const limits = getTierLimits();
    const limit = limits[type] as number;
    
    if (limit === -1) return true; // Unlimited
    return currentUsage < limit;
  };

  const showUpgradePrompt = (feature: string, requiredTier: AccessTier) => {
    toast({
      title: "Upgrade Required",
      description: `${feature} requires ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} tier. Upgrade to unlock this feature.`,
      variant: "destructive",
    });
  };

  const getUpgradeMessage = (feature: string): string => {
    if (currentTier === 'free') {
      return `Upgrade to Pro to unlock ${feature} and many more features.`;
    } else if (currentTier === 'pro') {
      return `Upgrade to Enterprise for unlimited ${feature} and premium support.`;
    }
    return '';
  };

  return {
    currentTier,
    tierLimits: getTierLimits(),
    hasFeatureAccess,
    checkUsageLimit,
    showUpgradePrompt,
    getUpgradeMessage,
    isAuthenticated: !!user,
  };
};