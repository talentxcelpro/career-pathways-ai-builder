import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTXCPurchase } from '@/hooks/useTXCPurchase';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Crown, 
  Check, 
  Star,
  Zap,
  Shield,
  Coins,
  Sparkles
} from "lucide-react";

interface SubscriptionTier {
  id: string;
  name: string;
  price_monthly: number;
  features: string[];
}

interface MobileSubscriptionUIProps {
  onSuccess?: () => void;
}

export const MobileSubscriptionUI: React.FC<MobileSubscriptionUIProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const { availableBalance } = useTokenBalance();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { canAfford, purchaseWithTXC } = useTXCPurchase();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load subscription plans with mobile-optimized data
      const { data: tiersData } = await supabase
        .from('subscription_plans')
        .select('id, name, price, features')
        .eq('is_active', true)
        .order('price');

      if (tiersData) {
        const PRICE_TXC: Record<string, number> = {
          'Pro Starter': 25000,
          'Pro Business': 35000,
          'Pro Elite': 50000,
        };
        
        const formattedTiers = tiersData.map(tier => ({
          id: tier.id,
          name: tier.name,
          price_monthly: PRICE_TXC[tier.name] ?? tier.price,
          features: Array.isArray(tier.features) 
            ? tier.features.slice(0, 3).map((f: any) => String(f)) // Limit features for mobile
            : []
        }));
        setTiers(formattedTiers);
      }

      // Load current subscription
      const { data: subscriptionData } = await supabase
        .from('subscribers')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      if (subscriptionData && subscriptionData.length > 0) {
        setCurrentTier(subscriptionData[0].subscription_tier);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierName: string) => {
    setSubscribing(tierName);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please log in to continue",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      const selectedTier = tiers.find(t => t.name === tierName);
      if (!selectedTier) {
        throw new Error('Plan not found');
      }

      if (!canAfford(selectedTier.price_monthly)) {
        toast({
          title: "Insufficient Balance",
          description: `You need ${selectedTier.price_monthly.toLocaleString()} TXC but only have ${availableBalance.toLocaleString()} TXC`,
          variant: "destructive",
        });
        return;
      }

      const success = await purchaseWithTXC({
        featureId: 'pro_subscription',
        cost: selectedTier.price_monthly,
        description: `${tierName} subscription`,
        metadata: { 
          packageType: tierName,
          planId: selectedTier.id,
          isSubscription: true,
          isMobile: true
        }
      });

      if (success) {
        toast({
          title: "🎉 Success!",
          description: `${tierName} activated!`,
        });
        
        setCurrentTier(tierName);
        onSuccess?.();
      }

    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Purchase Failed", 
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubscribing(null);
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Pro Starter': return 'border-blue-200 bg-blue-50/50';
      case 'Pro Business': return 'border-purple-200 bg-purple-50/50';
      case 'Pro Elite': return 'border-orange-200 bg-orange-50/50';
      default: return 'border-gray-200 bg-gray-50/50';
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Pro Starter': return <Star className="h-4 w-4 text-blue-600" />;
      case 'Pro Business': return <Zap className="h-4 w-4 text-purple-600" />;
      case 'Pro Elite': return <Crown className="h-4 w-4 text-orange-600" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Mobile Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full mb-3">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">TalentXcel Pro</span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Unlock Pro Features
        </h2>
        
        <p className="text-sm text-gray-600 mb-4">
          Choose the perfect plan for your career
        </p>
        
        {/* Balance Display */}
        <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg inline-block">
          <div className="flex items-center space-x-2">
            <Coins className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              {availableBalance.toLocaleString()} TXC
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Pricing Cards */}
      <div className="space-y-3">
        {tiers.map((tier) => (
          <Card key={tier.id} className={`${getTierColor(tier.name)} border transition-all duration-200`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getTierIcon(tier.name)}
                  <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                  {tier.name === 'Pro Business' && (
                    <Badge variant="secondary" className="text-xs">Popular</Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    {tier.price_monthly.toLocaleString()} TXC
                  </div>
                  <div className="text-xs text-gray-500">/month</div>
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-1 mb-4">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-gray-700">{feature}</span>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-3 w-3 text-purple-600 flex-shrink-0" />
                  <span className="text-xs text-gray-700">AI-powered tools</span>
                </div>
              </div>

              {/* CTA Button */}
              {currentTier === tier.name ? (
                <Badge variant="secondary" className="w-full justify-center py-2">
                  <Check className="h-3 w-3 mr-1" />
                  Current Plan
                </Badge>
              ) : (
                <Button 
                  className={`w-full py-2 text-sm transition-all duration-200 ${
                    canAfford(tier.price_monthly) 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => canAfford(tier.price_monthly) ? handleSubscribe(tier.name) : null}
                  disabled={subscribing === tier.name || !canAfford(tier.price_monthly)}
                >
                  {subscribing === tier.name ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : canAfford(tier.price_monthly) ? (
                    'Subscribe Now'
                  ) : (
                    'Insufficient TXC'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-gray-500 mt-4">
        🔥 Early Bird Pricing - Limited Time
      </div>
    </div>
  );
};