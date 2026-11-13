// src/hooks/useCentralEntitlements.ts
// TalentXcel Central Entitlement & Billing Hook
// Powering subscription checks, quotas, and AI credits across all 9 products

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  EntitlementEngine, 
  UserSubscriptionState, 
  FeatureCheckResult 
} from '@/services/billing/entitlementEngine';
import { 
  PlanTier, 
  CENTRAL_PLAN_CATALOGUE, 
  PRODUCT_ENTITLEMENT_CATALOGUE 
} from '@/services/billing/planCatalogue';

export interface UseCentralEntitlementsResult {
  subscription: UserSubscriptionState;
  planId: PlanTier;
  planName: string;
  isSubscribed: boolean;
  creditBalance: number;
  loading: boolean;
  error: string | null;
  usages: Record<string, number>;
  checkEntitlement: (featureId: string) => FeatureCheckResult;
  isUpgradeModalOpen: boolean;
  isCreditModalOpen: boolean;
  targetFeatureId: string | null;
  openUpgradeModal: (featureId?: string) => void;
  closeUpgradeModal: () => void;
  openCreditModal: () => void;
  closeCreditModal: () => void;
  refreshEntitlements: () => Promise<void>;
}

export function useCentralEntitlements(): UseCentralEntitlementsResult {
  const { user } = useAuth();
  
  const [subscription, setSubscription] = useState<UserSubscriptionState>({
    isSubscribed: false,
    planId: 'free',
    planName: 'Free',
    status: 'none',
    cancelAtPeriodEnd: false,
    amountPaise: 0,
  });
  
  const [creditBalance, setCreditBalance] = useState<number>(5);
  const [usages, setUsages] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal display states
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState<boolean>(false);
  const [targetFeatureId, setTargetFeatureId] = useState<string | null>(null);

  const fetchEntitlements = useCallback(async () => {
    if (!user?.id) {
      setSubscription({
        isSubscribed: false,
        planId: 'free',
        planName: 'Free',
        status: 'none',
        cancelAtPeriodEnd: false,
        amountPaise: 0,
      });
      setCreditBalance(5);
      setUsages({});
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Authoritative Subscription State
      const subState = await EntitlementEngine.getUserSubscription(user.id);
      setSubscription(subState);

      // 2. Fetch AI Credit Balance
      const credits = await EntitlementEngine.getCreditBalance(user.id);
      setCreditBalance(credits);

      // 3. Fetch Current Month Usages from user_usage_tracking
      const periodStart = new Date();
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);

      const { data: usageData, error: usageErr } = await supabase
        .from('user_usage_tracking')
        .select('usage_type, count')
        .eq('user_id', user.id)
        .gte('period_start', periodStart.toISOString());

      if (!usageErr && usageData) {
        const usageMap: Record<string, number> = {};
        for (const row of usageData) {
          usageMap[row.usage_type] = (usageMap[row.usage_type] || 0) + (row.count || 0);
        }
        setUsages(usageMap);
      }
    } catch (e: any) {
      console.warn('[useCentralEntitlements] Error loading entitlements:', e);
      setError(e.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchEntitlements();
  }, [fetchEntitlements]);

  const checkEntitlement = useCallback(
    (featureId: string): FeatureCheckResult => {
      const currentUsage = usages[featureId] || 0;
      return EntitlementEngine.evaluateEntitlement(
        subscription.planId,
        featureId,
        currentUsage,
        creditBalance
      );
    },
    [subscription.planId, usages, creditBalance]
  );

  const openUpgradeModal = useCallback((featureId?: string) => {
    setTargetFeatureId(featureId || null);
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setTargetFeatureId(null);
  }, []);

  const openCreditModal = useCallback(() => {
    setIsCreditModalOpen(true);
  }, []);

  const closeCreditModal = useCallback(() => {
    setIsCreditModalOpen(false);
  }, []);

  return {
    subscription,
    planId: subscription.planId,
    planName: subscription.planName,
    isSubscribed: subscription.isSubscribed,
    creditBalance,
    loading,
    error,
    usages,
    checkEntitlement,
    isUpgradeModalOpen,
    isCreditModalOpen,
    targetFeatureId,
    openUpgradeModal,
    closeUpgradeModal,
    openCreditModal,
    closeCreditModal,
    refreshEntitlements: fetchEntitlements,
  };
}
