import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type SubscriptionType = 'topic' | 'hashtag' | 'category' | 'user' | 'company';

export function useContentSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('content_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = async (type: SubscriptionType, value: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to subscribe to content",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('content_subscriptions')
        .insert({
          user_id: user.id,
          subscription_type: type,
          subscription_value: value,
          is_active: true,
        });

      if (error) throw error;

      await loadSubscriptions();
      
      toast({
        title: "Subscribed",
        description: `You're now subscribed to ${type}: ${value}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error subscribing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe",
        variant: "destructive",
      });
      return false;
    }
  };

  const unsubscribe = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('content_subscriptions')
        .update({ is_active: false })
        .eq('id', subscriptionId);

      if (error) throw error;

      await loadSubscriptions();
      
      toast({
        title: "Unsubscribed",
        description: "Subscription removed successfully",
      });

      return true;
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to unsubscribe",
        variant: "destructive",
      });
      return false;
    }
  };

  const isSubscribed = (type: SubscriptionType, value: string) => {
    return subscriptions.some(
      sub => sub.subscription_type === type && 
             sub.subscription_value === value && 
             sub.is_active
    );
  };

  return {
    subscriptions,
    isLoading,
    subscribe,
    unsubscribe,
    isSubscribed,
    refresh: loadSubscriptions,
  };
}