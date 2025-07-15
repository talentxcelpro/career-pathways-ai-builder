import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Check, 
  Star,
  Zap,
  Sparkles,
  ArrowLeft,
  CreditCard
} from "lucide-react";

interface SubscriptionTier {
  id: string;
  name: string;
  price_monthly: number;
  features: string[];
  max_services: number;
  has_crm: boolean;
  has_analytics: boolean;
  has_ai_tools: boolean;
  has_payments: boolean;
  has_contracts: boolean;
  has_branding: boolean;
  marketplace_priority: number;
}

export const ProSubscription: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
      if (!user) {
        navigate('/auth');
        return;
      }

      // Load subscription tiers
      const { data: tiersData } = await supabase
        .from('pro_subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('marketplace_priority');

      if (tiersData) {
        setTiers(tiersData.map(tier => ({
          ...tier,
          features: Array.isArray(tier.features) ? tier.features : JSON.parse(String(tier.features) || '[]')
        })));
      }

      // Load current subscription
      const { data: profileData } = await supabase
        .from('pro_service_profiles')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setCurrentTier(profileData.subscription_tier);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierName: string) => {
    setSubscribing(tierName);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Here you would integrate with Razorpay for payment
      // For now, we'll just update the subscription tier
      const { data: profileData } = await supabase
        .from('pro_service_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        const { error } = await supabase
          .from('pro_service_profiles')
          .update({ subscription_tier: tierName })
          .eq('id', profileData.id);

        if (error) throw error;

        toast({
          title: "Success!",
          description: `Successfully subscribed to ${tierName}`,
        });
        
        setCurrentTier(tierName);
        navigate('/pro');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription",
        variant: "destructive"
      });
    } finally {
      setSubscribing(null);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Pro Starter':
        return <Star className="h-6 w-6" />;
      case 'Pro Business':
        return <Zap className="h-6 w-6" />;
      case 'Pro Elite':
        return <Crown className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'Pro Starter':
        return 'from-blue-500 to-cyan-500';
      case 'Pro Business':
        return 'from-purple-500 to-pink-500';
      case 'Pro Elite':
        return 'from-yellow-500 to-orange-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => navigate('/pro')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Choose the perfect plan for your professional needs
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {tiers.map((tier) => (
          <Card 
            key={tier.id} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
              currentTier === tier.name ? 'ring-2 ring-primary' : ''
            } ${tier.name === 'Pro Business' ? 'scale-105 border-primary' : ''}`}
          >
            {tier.name === 'Pro Business' && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 text-sm font-semibold">
                Most Popular
              </div>
            )}
            
            <CardHeader className={`text-center ${tier.name === 'Pro Business' ? 'pt-8' : ''}`}>
              <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${getTierColor(tier.name)} flex items-center justify-center text-white mb-4`}>
                {getTierIcon(tier.name)}
              </div>
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <div className="text-3xl font-bold">
                ₹{tier.price_monthly.toLocaleString()}
                <span className="text-base font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Max Services:</span>
                  <span className="font-semibold">{tier.max_services}</span>
                </div>
                
                {tier.has_crm && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-3 w-3" />
                    <span>CRM & Lead Management</span>
                  </div>
                )}
                
                {tier.has_analytics && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-3 w-3" />
                    <span>Advanced Analytics</span>
                  </div>
                )}
                
                {tier.has_ai_tools && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-3 w-3" />
                    <span>AI Business Tools</span>
                  </div>
                )}
                
                {tier.has_payments && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-3 w-3" />
                    <span>Payment Integration</span>
                  </div>
                )}
                
                {tier.has_contracts && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-3 w-3" />
                    <span>E-Contracts & NDAs</span>
                  </div>
                )}
                
                {tier.has_branding && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-3 w-3" />
                    <span>Custom Branding</span>
                  </div>
                )}
              </div>

              <div className="pt-6">
                {currentTier === tier.name ? (
                  <Badge variant="default" className="w-full justify-center py-2">
                    Current Plan
                  </Badge>
                ) : (
                  <Button 
                    className={`w-full bg-gradient-to-r ${getTierColor(tier.name)} hover:opacity-90`}
                    onClick={() => handleSubscribe(tier.name)}
                    disabled={subscribing === tier.name}
                  >
                    {subscribing === tier.name ? (
                      "Processing..."
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        {currentTier ? 'Switch Plan' : 'Get Started'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Features</th>
                  {tiers.map((tier) => (
                    <th key={tier.id} className="text-center py-3 px-4">{tier.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Service Listings</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-4">{tier.max_services}</td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Portfolio Upload</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-4">
                      <Check className="h-4 w-4 text-green-500 mx-auto" />
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">CRM & Lead Management</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-4">
                      {tier.has_crm ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Analytics Dashboard</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-4">
                      {tier.has_analytics ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">AI Business Tools</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-4">
                      {tier.has_ai_tools ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Payment Integration</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-4">
                      {tier.has_payments ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Custom Branding</td>
                  {tiers.map((tier) => (
                    <td key={tier.id} className="text-center py-3 px-4">
                      {tier.has_branding ? (
                        <Check className="h-4 w-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};