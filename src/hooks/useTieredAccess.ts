import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from './useTokenBalance';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getTXCPrice, formatTXC } from '@/types/txc-pricing';

export type AccessTier = 'free' | 'basic' | 'pro' | 'enterprise';

// Canonical tier returned by the DB → AccessTier used in the UI
const DB_TIER_TO_ACCESS_TIER: Record<string, AccessTier> = {
  premium: 'enterprise',
  pro:     'pro',
  starter: 'basic',
  free:    'free',
};

export interface QuotaSnapshot {
  ats_check:        { used: number; limit: number };
  resume_tailoring: { used: number; limit: number };
  interview_prep:   { used: number; limit: number };
}

export const useTieredAccess = () => {
  const { user } = useAuth();
  const { availableBalance } = useTokenBalance();
  const { toast } = useToast();
  const [currentTier, setCurrentTier] = useState<AccessTier>('free');
  const [userFeatures, setUserFeatures] = useState<string[]>([]);
  const [quota, setQuota] = useState<QuotaSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setCurrentTier('free');
      setUserFeatures([]);
      setQuota(null);
      return;
    }
    fetchUserFeatures();
  }, [user]);

  const fetchUserFeatures = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // ── Subscription tier ──────────────────────────────────────────────────
      // check_user_subscription is defined in migration 20250722153623 and reads
      // from public.subscribers — the authoritative entitlement source.
      // The dropped user_features table is NOT used here.
      const { data: subscriptionRows, error: subError } = await supabase
        .rpc('check_user_subscription', { user_uuid: user.id });

      const subscription = Array.isArray(subscriptionRows) ? subscriptionRows[0] : subscriptionRows;

      if (subError) {
        console.error('[useTieredAccess] check_user_subscription error:', subError);
      }

      let resolvedTier: AccessTier = 'free';
      if (subscription?.is_subscribed && subscription?.status === 'active') {
        const rawTier = (subscription.subscription_tier ?? 'free').toLowerCase();
        resolvedTier = DB_TIER_TO_ACCESS_TIER[rawTier] ?? 'free';
      }
      setCurrentTier(resolvedTier);

      // Map tier → synthetic feature list for backward compatibility with
      // any existing callers of userFeatures.
      const featureList: string[] = ['basic_profile', 'job_search', 'basic_applications', 'community_access'];
      if (resolvedTier === 'basic' || resolvedTier === 'pro' || resolvedTier === 'enterprise') {
        featureList.push('basic_ats', 'resume_builder');
      }
      if (resolvedTier === 'pro' || resolvedTier === 'enterprise') {
        featureList.push('pro_ats', 'resume_tailoring', 'interview_prep');
      }
      if (resolvedTier === 'enterprise') {
        featureList.push('enterprise_coaching', 'priority_support');
      }
      setUserFeatures(featureList);

      // ── Quota snapshot ─────────────────────────────────────────────────────
      const { data: entitlement, error: entErr } = await supabase
        .rpc('get_user_entitlement', { p_user_id: user.id })
        .maybeSingle();

      if (!entErr && entitlement?.usage) {
        setQuota(entitlement.usage as QuotaSnapshot);
      }
    } catch (error) {
      console.error('[useTieredAccess] Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const hasFeatureAccess = (feature: string, requiresAuth = true): boolean => {
    const freeFeatures = [
      'basic_profile',
      'job_search',
      'basic_applications',
      'community_access',
    ];

    if (freeFeatures.includes(feature)) {
      return requiresAuth ? !!user : true;
    }

    if (userFeatures.includes(feature)) return true;

    switch (currentTier) {
      case 'enterprise': return true;
      case 'pro':        return !feature.includes('enterprise');
      case 'basic':      return !feature.includes('pro') && !feature.includes('enterprise');
      default:           return false;
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
        title: 'TXC Purchase Required',
        description: `This feature requires ${formatTXC(cost)}. ${
          canAffordFeature(feature)
            ? 'Click to purchase.'
            : `You need ${formatTXC(cost - availableBalance)} more TXC.`
        }`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Upgrade Required',
        description: `This feature requires a ${requiredTier ?? 'higher'} plan. Visit Career Plans to upgrade.`,
        variant: 'destructive',
      });
    }
  };

  const getUpgradeMessage = (feature: string): string => {
    const cost = getTXCPrice(feature);

    if (cost > 0) {
      return canAffordFeature(feature)
        ? `Purchase this feature for ${formatTXC(cost)} to unlock it.`
        : `You need ${formatTXC(cost - availableBalance)} more TXC to purchase this feature.`;
    }

    return 'Upgrade to a Career Pro or Premium plan to access this feature.';
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
    refreshFeatures: fetchUserFeatures,
    isLoading,
    quota,
  };
};