import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useTokenBalance } from './useTokenBalance';

export const useFeatureGating = () => {
  const { availableBalance } = useTokenBalance();
  const { toast } = useToast();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const checkFeatureAccess = (featureName: string, showUpgradePrompt = true): boolean => {
    // All features are available through TXC tokens
    if (showUpgradePrompt) {
      toast({
        title: "TXC Feature",
        description: "This feature uses TXC tokens. Check TXC pricing for costs.",
        variant: "default",
      });
    }
    return true;
  };

  const getServiceLimit = (): number => {
    // No limits with TXC system - users pay per usage
    return -1; // Unlimited
  };

  const canAddService = (currentCount: number): boolean => {
    // Always true with TXC system
    return true;
  };

  const getSupportLevel = (): 'email' | 'priority' | '24/7' => {
    // Support based on TXC token purchases
    return availableBalance > 50000 ? '24/7' : availableBalance > 25000 ? 'priority' : 'email';
  };

  const hasAnalyticsAccess = (): boolean => {
    // Analytics available through TXC purchase
    return true;
  };

  const getAnalyticsLevel = (): 'basic' | 'advanced' | 'full' => {
    // All levels available through TXC
    return availableBalance > 50000 ? 'full' : availableBalance > 25000 ? 'advanced' : 'basic';
  };

  const hasCustomBranding = (): boolean => {
    // Available through TXC purchase
    return true;
  };

  const hasVanityURL = (): boolean => {
    // Available through TXC purchase
    return true;
  };

  const hasVideoBio = (): boolean => {
    // Available through TXC purchase
    return true;
  };

  const hasLeadGeneration = (): boolean => {
    // Available through TXC purchase
    return true;
  };

  const getLeadGenerationLevel = (): 'basic' | 'advanced' => {
    return availableBalance > 25000 ? 'advanced' : 'basic';
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
    tier: 'TXC Token System',
    isActive: true // Always active with TXC system
  };
};