import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Check, 
  Star,
  Zap,
  ArrowRight,
  Shield,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

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

interface AppleSubscriptionUIProps {
  compact?: boolean;
}

export const AppleSubscriptionUI: React.FC<AppleSubscriptionUIProps> = ({ compact = false }) => {
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
      if (!user) return;

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
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierName: string) => {
    setSubscribing(tierName);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
          title: "Welcome to TalentXcel Pro",
          description: `You're now subscribed to ${tierName}`,
        });
        
        setCurrentTier(tierName);
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

  const getTierGradient = (tierName: string) => {
    switch (tierName) {
      case 'Pro Starter':
        return 'from-blue-500 to-cyan-500';
      case 'Pro Business':
        return 'from-purple-500 to-pink-500';
      case 'Pro Elite':
        return 'from-orange-500 to-yellow-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Pro Starter':
        return <Star className="h-5 w-5" />;
      case 'Pro Business':
        return <Zap className="h-5 w-5" />;
      case 'Pro Elite':
        return <Crown className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 rounded-full mb-4">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">TalentXcel Pro</span>
        </div>
        
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
          {compact ? 'Unlock Pro Features' : 'Supercharge Your Success'}
        </h2>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {compact 
            ? 'Get access to premium tools and features that accelerate your career'
            : 'Choose the perfect plan to unlock powerful tools, analytics, and premium features designed for career excellence'
          }
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tiers.map((tier) => (
          <motion.div
            key={tier.id}
            variants={itemVariants}
            className={`relative group ${
              tier.name === 'Pro Business' ? 'md:scale-110 md:z-10' : ''
            }`}
          >
            <Card className={`
              relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-2xl
              transition-all duration-500 hover:shadow-3xl hover:-translate-y-2
              ${currentTier === tier.name ? 'ring-2 ring-blue-500' : ''}
              ${tier.name === 'Pro Business' ? 'border-2 border-purple-200' : ''}
            `}>
              {tier.name === 'Pro Business' && (
                <div className="absolute -top-px left-0 right-0">
                  <div className="h-px bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </div>
                  </div>
                </div>
              )}

              <CardContent className="p-8">
                {/* Tier Header */}
                <div className="text-center mb-8">
                  <div className={`
                    inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                    bg-gradient-to-r ${getTierGradient(tier.name)} mb-4
                    shadow-lg
                  `}>
                    <div className="text-white">
                      {getTierIcon(tier.name)}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  
                  <div className="flex items-baseline justify-center mb-1">
                    <span className="text-4xl font-bold text-gray-900">₹{tier.price_monthly.toLocaleString()}</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    {tier.name === 'Pro Starter' && 'Perfect for getting started'}
                    {tier.name === 'Pro Business' && 'Best for growing professionals'}
                    {tier.name === 'Pro Elite' && 'Ultimate professional toolkit'}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {tier.features.slice(0, compact ? 4 : 6).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  {!compact && (
                    <>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700">Up to {tier.max_services} services</span>
                      </div>
                      
                      {tier.has_ai_tools && (
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                            <Sparkles className="h-3 w-3 text-purple-600" />
                          </div>
                          <span className="text-sm text-gray-700">AI-powered tools</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <div className="space-y-3">
                  {currentTier === tier.name ? (
                    <Badge variant="secondary" className="w-full justify-center py-3 text-sm font-semibold">
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </Badge>
                  ) : (
                    <Button 
                      className={`
                        w-full py-3 font-semibold transition-all duration-300
                        bg-gradient-to-r ${getTierGradient(tier.name)} 
                        hover:shadow-lg hover:scale-105 active:scale-95
                        border-0 text-white
                      `}
                      onClick={() => handleSubscribe(tier.name)}
                      disabled={subscribing === tier.name}
                    >
                      {subscribing === tier.name ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Activating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{currentTier ? 'Switch Plan' : 'Get Started'}</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  )}
                  
                  {compact && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => window.open('/pro/subscription', '_blank')}
                    >
                      <span>Learn more</span>
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Trust Indicators */}
      <motion.div 
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>Cancel Anytime</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};