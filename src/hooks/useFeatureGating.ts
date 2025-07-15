import { useSubscription } from './useSubscription';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useFeatureGating = () => {
  const { hasFeatureAccess, getSubscriptionTier, isActive } = useSubscription();
  const { toast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const checkFeatureAccess = (featureName: string, showUpgradePrompt = true): boolean => {
    if (!isActive()) {
      if (showUpgradePrompt) {
        toast({
          title: "Pro Feature",
          description: "This feature requires a Pro subscription. Upgrade to continue.",
          variant: "destructive",
        });
        setShowUpgradeModal(true);
      }
      return false;
    }

    const access = hasFeatureAccess(featureName);
    if (!access && showUpgradePrompt) {
      toast({
        title: "Feature Not Available",
        description: "This feature is not available in your current plan. Please upgrade.",
        variant: "destructive",
      });
      setShowUpgradeModal(true);
    }

    return access;
  };

  const getServiceLimit = (): number => {
    const tier = getSubscriptionTier();
    if (tier === 'Pro Starter') return 5;
    if (tier === 'Pro Business' || tier === 'Pro Elite') return -1; // Unlimited
    return 0; // Free tier
  };

  const canAddService = (currentCount: number): boolean => {
    const limit = getServiceLimit();
    if (limit === -1) return true; // Unlimited
    return currentCount < limit;
  };

  const getSupportLevel = (): 'email' | 'priority' | '24/7' => {
    const tier = getSubscriptionTier();
    if (tier === 'Pro Elite') return '24/7';
    if (tier === 'Pro Business') return 'priority';
    return 'email';
  };

  const hasAnalyticsAccess = (): boolean => {
    return hasFeatureAccess('Basic analytics') || 
           hasFeatureAccess('Advanced analytics') || 
           hasFeatureAccess('Full analytics suite');
  };

  const getAnalyticsLevel = (): 'basic' | 'advanced' | 'full' => {
    if (hasFeatureAccess('Full analytics suite')) return 'full';
    if (hasFeatureAccess('Advanced analytics')) return 'advanced';
    return 'basic';
  };

  const hasCustomBranding = (): boolean => {
    return hasFeatureAccess('Custom branding');
  };

  const hasVanityURL = (): boolean => {
    return hasFeatureAccess('Vanity URLs');
  };

  const hasVideoBio = (): boolean => {
    return hasFeatureAccess('Video bio');
  };

  const hasLeadGeneration = (): boolean => {
    return hasFeatureAccess('Lead generation tools') || 
           hasFeatureAccess('Advanced lead generation');
  };

  const getLeadGenerationLevel = (): 'basic' | 'advanced' => {
    if (hasFeatureAccess('Advanced lead generation')) return 'advanced';
    return 'basic';
  };

  return {
    checkFeatureAccess,
    getServiceLimit,
    canAddService,
    getSupportLevel,
    hasAnalyticsAccess,
    getAnalyticsLevel,
    hasCustomBranding,
    hasVanityURL,
    hasVideoBio,
    hasLeadGeneration,
    getLeadGenerationLevel,
    showUpgradeModal,
    setShowUpgradeModal,
    tier: getSubscriptionTier(),
    isActive: isActive()
  };
};