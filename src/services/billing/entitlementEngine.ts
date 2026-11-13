// src/services/billing/entitlementEngine.ts
// TalentXcel Central Entitlement, Quota & Subscription Engine
// Reusable across all nine products and future industry verticals

import { supabase } from '@/integrations/supabase/client';
import { 
  PlanTier, 
  CENTRAL_PLAN_CATALOGUE, 
  getPlanById, 
  FeatureEntitlement 
} from './planCatalogue';

export interface UserSubscriptionState {
  isSubscribed: boolean;
  planId: PlanTier;
  planName: string;
  status: 'active' | 'past_due' | 'cancelled' | 'expired' | 'none';
  subscriptionStart?: string;
  subscriptionEnd?: string;
  nextBillingDate?: string;
  cancelAtPeriodEnd: boolean;
  gracePeriodEnd?: string;
  amountPaise: number;
}

export interface FeatureCheckResult {
  allowed: boolean;
  featureId: string;
  tier: PlanTier;
  limit: number; // -1 for unlimited
  used: number;
  remaining: number;
  isWarning: boolean; // e.g. >= 80% quota used
  requiresUpgrade: boolean;
  aiCreditCost: number;
  canUseAiCredits: boolean;
}

export class EntitlementEngine {
  /**
   * Authoritatively fetches user subscription state from public.subscribers
   */
  static async getUserSubscription(userId: string): Promise<UserSubscriptionState> {
    if (!userId) {
      return this.getDefaultFreeState();
    }

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', userId)
        .order('subscription_end', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return this.getDefaultFreeState();
      }

      const rawTier = (data.plan_tier || data.subscription_tier || 'free').toLowerCase() as PlanTier;
      const validTier: PlanTier = ['starter', 'pro', 'max', 'business', 'enterprise'].includes(rawTier)
        ? rawTier
        : 'free';

      const isUnexpired = data.subscription_end ? new Date(data.subscription_end) > new Date() : false;
      const inGrace = data.grace_period_end ? new Date(data.grace_period_end) > new Date() : false;
      const isSubscribed = data.subscribed && (isUnexpired || inGrace);

      return {
        isSubscribed,
        planId: isSubscribed ? validTier : 'free',
        planName: isSubscribed ? CENTRAL_PLAN_CATALOGUE[validTier].name : 'Free',
        status: (data.status as any) || (isSubscribed ? 'active' : 'none'),
        subscriptionStart: data.subscription_start || undefined,
        subscriptionEnd: data.subscription_end || undefined,
        nextBillingDate: data.next_billing_date || undefined,
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
        gracePeriodEnd: data.grace_period_end || undefined,
        amountPaise: data.amount || 0,
      };
    } catch (e) {
      console.warn('[EntitlementEngine] Error checking subscription:', e);
      return this.getDefaultFreeState();
    }
  }

  /**
   * Fetches user's current AI Credit Wallet balance
   */
  static async getCreditBalance(userId: string): Promise<number> {
    if (!userId) return 0;
    try {
      const { data } = await supabase
        .from('user_credit_wallets')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      return data?.balance ?? 5; // Free starting grant
    } catch {
      return 5;
    }
  }

  /**
   * Evaluates feature permission against plan entitlements & current month usage
   */
  static evaluateEntitlement(
    planId: PlanTier,
    featureId: string,
    currentUsage = 0,
    creditBalance = 0
  ): FeatureCheckResult {
    const plan = getPlanById(planId);
    const entitlement: FeatureEntitlement | undefined = plan.entitlements[featureId];

    if (!entitlement || entitlement.accessLevel === 'none' || entitlement.monthlyQuota === 0) {
      const aiCost = entitlement?.aiCreditCost ?? 0;
      const canUseCredits = aiCost > 0 && creditBalance >= aiCost;

      return {
        allowed: canUseCredits,
        featureId,
        tier: planId,
        limit: 0,
        used: currentUsage,
        remaining: 0,
        isWarning: false,
        requiresUpgrade: !canUseCredits,
        aiCreditCost: aiCost,
        canUseAiCredits: canUseCredits,
      };
    }

    // Unlimited quota
    if (entitlement.monthlyQuota === -1) {
      return {
        allowed: true,
        featureId,
        tier: planId,
        limit: -1,
        used: currentUsage,
        remaining: -1,
        isWarning: false,
        requiresUpgrade: false,
        aiCreditCost: 0,
        canUseAiCredits: false,
      };
    }

    const remaining = Math.max(0, entitlement.monthlyQuota - currentUsage);
    const usagePercent = (currentUsage / entitlement.monthlyQuota) * 100;
    const isWarning = usagePercent >= entitlement.warningThresholdPercent && remaining > 0;
    const quotaExhausted = remaining === 0;
    const aiCost = entitlement.aiCreditCost ?? 0;
    const canUseCredits = quotaExhausted && aiCost > 0 && creditBalance >= aiCost;

    return {
      allowed: !quotaExhausted || canUseCredits,
      featureId,
      tier: planId,
      limit: entitlement.monthlyQuota,
      used: currentUsage,
      remaining,
      isWarning,
      requiresUpgrade: quotaExhausted && !canUseCredits,
      aiCreditCost: aiCost,
      canUseAiCredits: canUseCredits,
    };
  }

  private static getDefaultFreeState(): UserSubscriptionState {
    return {
      isSubscribed: false,
      planId: 'free',
      planName: 'Free',
      status: 'none',
      cancelAtPeriodEnd: false,
      amountPaise: 0,
    };
  }
}
