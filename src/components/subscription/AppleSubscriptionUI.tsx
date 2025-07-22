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

      // Load subscription plans
      const { data: tiersData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price');

      if (tiersData) {
        const formattedTiers = tiersData.map(tier => ({
          id: tier.id,
          name: tier.name,
          price_monthly: tier.price,
          features: Array.isArray(tier.features) ? tier.features.map(f => String(f)) : [],
          max_services: 100,
          has_crm: tier.name !== 'Basic',
          has_analytics: tier.name !== 'Basic',
          has_ai_tools: true,
          has_payments: tier.name !== 'Basic',
          has_contracts: tier.name === 'Pro Elite',
          has_branding: tier.name === 'Pro Elite',
          marketplace_priority: tier.name === 'Pro Business' ? 1 : tier.name === 'Pro Elite' ? 2 : 3
        }));
        setTiers(formattedTiers);
      }

      // Load current subscription
      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans(name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (subscriptionData && subscriptionData.length > 0) {
        setCurrentTier(subscriptionData[0].subscription_plans.name);
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

      // Find the plan by name
      const { data: planData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', tierName)
        .eq('is_active', true)
        .single();

      if (!planData) {
        throw new Error('Plan not found');
      }

      // Create Razorpay order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-create-order', {
        body: { 
          amount: planData.price, 
          currency: planData.currency,
          planId: planData.id,
          packageType: 'subscription'
        }
      });

      if (orderError) throw orderError;

      // Handle demo mode
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
          title: "Welcome to TalentXcel Pro",
          description: `You're now subscribed to ${tierName}`,
        });
        
        setCurrentTier(tierName);
        return;
      }

      // Real Razorpay integration
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'TalentXcel Pro',
          description: `Subscription to ${tierName}`,
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
                title: "Welcome to TalentXcel Pro",
                description: `You're now subscribed to ${tierName}`,
              });
              
              setCurrentTier(tierName);
            } catch (error) {
              console.error('Payment verification error:', error);
              toast({
                title: "Error",
                description: "Payment verification failed",
                variant: "destructive",
              });
            }
          },
          modal: {
            ondismiss: () => {
              setSubscribing(null);
            }
          },
          prefill: {
            name: user.user_metadata?.full_name || '',
            email: user.email || '',
          },
          theme: {
            color: '#3B82F6'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Load Razorpay script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          // Retry after script loads
          handleSubscribe(tierName);
        };
        document.body.appendChild(script);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Error",
        description: "Failed to process subscription",
        variant: "destructive"
      });
      setSubscribing(null);
    }
  };

  const getTierGradient = (tierName: string) => {
    switch (tierName) {
      case 'Smart Service Page':
        return 'from-blue-500 to-cyan-500';
      case 'CRM':
        return 'from-purple-500 to-pink-500';
      case 'Premium':
        return 'from-orange-500 to-yellow-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'Smart Service Page':
        return <Star className="h-5 w-5" />;
      case 'CRM':
        return <Zap className="h-5 w-5" />;
      case 'Premium':
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
              tier.name === 'CRM' ? 'md:scale-110 md:z-10' : ''
            }`}
          >
            <Card className={`
              relative overflow-hidden bg-white/80 backdrop-blur-xl border-0 shadow-2xl
              transition-all duration-500 hover:shadow-3xl hover:-translate-y-2
              ${currentTier === tier.name ? 'ring-2 ring-blue-500' : ''}
              ${tier.name === 'Pro Business' ? 'border-2 border-purple-200' : ''}
            `}>
              {tier.name === 'CRM' && (
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
                  
                  {/* Early Bird Discount Badge */}
                  <div className="flex justify-center mb-2">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      🔥 Early Bird - 40% OFF
                    </div>
                  </div>
                  
                  <div className="flex items-baseline justify-center mb-1">
                    {/* Original Price with Strikethrough */}
                    <span className="text-lg text-gray-400 line-through mr-2">₹{Math.floor(tier.price_monthly / 0.6).toLocaleString()}</span>
                    {/* Discounted Price */}
                    <span className="text-4xl font-bold text-gray-900">₹{tier.price_monthly.toLocaleString()}</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  
                  <div className="flex items-center justify-center mb-1">
                    <span className="text-sm font-semibold text-green-600">Save ₹{Math.floor(tier.price_monthly / 0.6) - tier.price_monthly}/month</span>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    {tier.name === 'Smart Service Page' && 'Perfect for getting started with portfolio showcase'}
                    {tier.name === 'CRM' && 'Best for growing professionals with client management'}
                    {tier.name === 'Premium' && 'Ultimate professional toolkit with all features'}
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