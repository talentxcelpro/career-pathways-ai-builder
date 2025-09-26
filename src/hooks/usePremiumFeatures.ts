import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PremiumFeature {
  id: string;
  feature_key: string;
  feature_name: string;
  description: string;
  txc_cost: number;
  is_subscription: boolean;
  subscription_duration: string;
  is_active: boolean;
}

export interface UserPremiumFeature {
  id: string;
  feature_key: string;
  purchased_at: string;
  expires_at: string | null;
  is_active: boolean;
}

export const usePremiumFeatures = () => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<PremiumFeature[]>([]);
  const [userFeatures, setUserFeatures] = useState<UserPremiumFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPremiumFeatures();
      fetchUserFeatures();
    }
  }, [user]);

  const fetchPremiumFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_features')
        .select('*')
        .eq('is_active', true)
        .order('txc_cost');

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching premium features:', error);
      toast.error('Failed to load premium features');
    }
  };

  const fetchUserFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('user_premium_features')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setUserFeatures(data || []);
    } catch (error) {
      console.error('Error fetching user features:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (featureKey: string): boolean => {
    return userFeatures.some(
      (feature) =>
        feature.feature_key === featureKey &&
        feature.is_active &&
        (!feature.expires_at || new Date(feature.expires_at) > new Date())
    );
  };

  const getFeatureExpiry = (featureKey: string): Date | null => {
    const feature = userFeatures.find((f) => f.feature_key === featureKey);
    return feature?.expires_at ? new Date(feature.expires_at) : null;
  };

  const trackFeatureUsage = async (featureKey: string, metadata?: Record<string, any>) => {
    try {
      await supabase
        .from('feature_usage_analytics')
        .upsert(
          {
            user_id: user?.id,
            feature_key: featureKey,
            usage_count: 1,
            last_used: new Date().toISOString(),
            metadata: metadata || {},
          },
          {
            onConflict: 'user_id,feature_key',
            ignoreDuplicates: false,
          }
        );
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  };

  return {
    features,
    userFeatures,
    loading,
    hasFeature,
    getFeatureExpiry,
    trackFeatureUsage,
    refreshUserFeatures: fetchUserFeatures,
  };
};