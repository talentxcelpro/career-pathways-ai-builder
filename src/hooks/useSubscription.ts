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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        return;
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setSubscription(data[0] as UserSubscription);
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

  // Subscribe to a plan with Razorpay integration
  const subscribeToPlan = async (planId: string) => {
    try {
      setLoading(true);
      
      // Get plan details for payment
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-create-order', {
        body: { 
          amount: plan.price, 
          currency: plan.currency,
          planId: planId,
          packageType: 'subscription'
        }
      });

      if (orderError) throw orderError;

      // For demo mode, simulate payment completion
      if (orderData.demo) {
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-verify-payment', {
          body: { 
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_signature: 'demo_signature'
          }
        });

        if (verifyError) throw verifyError;

        toast({
          title: "Success!",
          description: `Successfully subscribed to ${plan.name}`,
        });

        await fetchSubscription();
        return true;
      }

      // Real Razorpay integration
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        return new Promise((resolve) => {
          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'TalentXcel Pro',
            description: `Subscription to ${plan.name}`,
            order_id: orderData.orderId,
            handler: async (response: any) => {
              try {
                const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay-verify-payment', {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                  }
                });

                if (verifyError) throw verifyError;

                toast({
                  title: "Success!",
                  description: `Successfully subscribed to ${plan.name}`,
                });

                await fetchSubscription();
                resolve(true);
              } catch (error) {
                console.error('Payment verification error:', error);
                toast({
                  title: "Error",
                  description: "Payment verification failed",
                  variant: "destructive",
                });
                resolve(false);
              }
            },
            modal: {
              ondismiss: () => {
                resolve(false);
              }
            },
            prefill: {
              name: '',
              email: '',
            },
            theme: {
              color: '#3B82F6'
            }
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        });
      } else {
        toast({
          title: "Error",
          description: "Payment system not loaded. Please refresh and try again.",
          variant: "destructive",
        });
        return false;
      }
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
      
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Subscription cancelled successfully",
      });

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