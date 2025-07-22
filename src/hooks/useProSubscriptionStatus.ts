
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ProSubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionPlan: string | null;
  expiresAt: string | null;
  loading: boolean;
}

export const useProSubscriptionStatus = () => {
  const [status, setStatus] = useState<ProSubscriptionStatus>({
    hasActiveSubscription: false,
    subscriptionPlan: null,
    expiresAt: null,
    loading: true,
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setStatus({
        hasActiveSubscription: false,
        subscriptionPlan: null,
        expiresAt: null,
        loading: false,
      });
      return;
    }

    const checkProSubscriptionStatus = async () => {
      try {
        // Check pro_subscriptions table
        const { data: proSub, error: proError } = await supabase
          .from('pro_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('expires_at', new Date().toISOString())
          .order('expires_at', { ascending: false })
          .limit(1)
          .single();

        if (proError && proError.code !== 'PGRST116') {
          console.error('Error checking pro subscription:', proError);
        }

        // Also check user_subscriptions table as fallback
        const { data: userSub, error: userError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            subscription_plans (
              name,
              features
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('current_period_end', new Date().toISOString())
          .order('current_period_end', { ascending: false })
          .limit(1)
          .single();

        if (userError && userError.code !== 'PGRST116') {
          console.error('Error checking user subscription:', userError);
        }

        // Determine if user has active subscription from either table
        const hasActivePro = !!proSub;
        const hasActiveUser = !!userSub;
        const hasAnyActive = hasActivePro || hasActiveUser;

        setStatus({
          hasActiveSubscription: hasAnyActive,
          subscriptionPlan: hasActivePro ? proSub.plan_name : (hasActiveUser ? userSub.subscription_plans?.name : null),
          expiresAt: hasActivePro ? proSub.expires_at : (hasActiveUser ? userSub.current_period_end : null),
          loading: false,
        });
      } catch (error) {
        console.error('Error checking subscription status:', error);
        setStatus({
          hasActiveSubscription: false,
          subscriptionPlan: null,
          expiresAt: null,
          loading: false,
        });
      }
    };

    checkProSubscriptionStatus();

    // Set up real-time subscription to listen for changes
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pro_subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          checkProSubscriptionStatus();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          checkProSubscriptionStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return status;
};
