import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billing_cycle: string;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancelled_at?: string;
  subscription_plans: SubscriptionPlan;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch subscription plans
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      
      const formattedPlans = data?.map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) ? plan.features.map(f => String(f)) : []
      })) || [];
      
      setPlans(formattedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription plans",
        variant: "destructive",
      });
    }
  };

  // Fetch user's current subscription
  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('razorpay-payment', {
        body: { action: 'get_subscription_status' }
      });

      if (error) throw error;
      
      if (data.subscription) {
        setSubscription(data.subscription);
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to a plan
  const subscribeToPlan = async (planId: string) => {
    try {
      setLoading(true);
      
      // Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-payment', {
        body: { action: 'create_order', planId }
      });

      if (orderError) throw orderError;

      // For demo mode, simulate payment completion
      if (orderData.demo) {
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-payment', {
          body: { 
            action: 'verify_payment', 
            planId,
            orderId: orderData.id,
            paymentId: `pay_demo_${Date.now()}`,
            signature: 'demo_signature'
          }
        });

        if (verifyError) throw verifyError;

        toast({
          title: "Success!",
          description: verifyData.message,
        });

        // Refresh subscription
        await fetchSubscription();
        return true;
      }

      // Real Razorpay integration would handle payment here
      return false;
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!subscription) return false;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('razorpay-payment', {
        body: { 
          action: 'cancel_subscription', 
          subscriptionId: subscription.id 
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: data.message,
      });

      // Refresh subscription
      await fetchSubscription();
      return true;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has access to a feature
  const hasFeatureAccess = (featureName: string): boolean => {
    if (!subscription) return false;
    return subscription.subscription_plans.features.includes(featureName);
  };

  // Get subscription tier
  const getSubscriptionTier = (): string => {
    if (!subscription) return 'Free';
    return subscription.subscription_plans.name;
  };

  // Check if subscription is active
  const isActive = (): boolean => {
    if (!subscription) return false;
    return subscription.status === 'active' && 
           new Date(subscription.current_period_end) > new Date();
  };

  useEffect(() => {
    fetchPlans();
    fetchSubscription();
  }, []);

  return {
    subscription,
    plans,
    loading,
    subscribeToPlan,
    cancelSubscription,
    hasFeatureAccess,
    getSubscriptionTier,
    isActive,
    refetch: fetchSubscription
  };
};