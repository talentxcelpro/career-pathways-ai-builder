import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

      // Load current subscription from subscribers table
      const { data: subscriptionData } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (subscriptionData && subscriptionData.length > 0) {
        setCurrentTier(subscriptionData[0].subscription_tier);
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
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to subscribe.",
          variant: "destructive",
        });
        setSubscribing(null);
        navigate('/auth');
        return;
      }

      console.log('Starting subscription process for:', tierName, 'User:', user.id);
      
      // Create subscription record with proper data
      const subscriptionData = {
        user_id: user.id,
        email: user.email || '',
        subscribed: true,
        subscription_plan: tierName,
        subscription_tier: tierName,
        status: 'active',
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_payment_date: new Date().toISOString(),
        amount: tiers.find(t => t.name === tierName)?.price_monthly || 999,
        currency: 'INR',
        updated_at: new Date().toISOString(),
      };

      console.log('Creating subscription with data:', subscriptionData);

      const { data, error } = await supabase
        .from('subscribers')
        .upsert(subscriptionData, { 
          onConflict: 'user_id'
        })
        .select();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to create subscription: ${error.message}`);
      }

      console.log('Subscription created successfully:', data);

      toast({
        title: "🎉 Subscription Activated!",
        description: `Welcome to ${tierName}! Your pro features are now active.`,
      });
      
      setCurrentTier(tierName);
      await loadSubscriptionData(); // Refresh the data
      
      // Navigate to pro dashboard
      setTimeout(() => {
        navigate('/pro');
      }, 1000);
          
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription Failed", 
        description: error instanceof Error ? error.message : "There was an error processing your subscription. Please try again.",
        variant: "destructive",
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
      {/* Enhanced Header with reduced top spacing */}
      <motion.div 
        className="text-center mb-8 relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl opacity-60 blur-3xl transform -skew-y-1"></div>
        
        <div className="relative z-10 pt-6 pb-8">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 px-6 py-3 rounded-full mb-6 shadow-sm">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600">TalentXcel Pro</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4 leading-tight">
            {compact ? 'Unlock Pro Features' : 'Supercharge Your Success'}
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {compact 
              ? 'Get access to premium tools and features that accelerate your career'
              : '🚀 Choose the perfect plan to unlock powerful tools, analytics, and premium features designed for career excellence'
            }
          </p>
          
          {/* Add some visual elements */}
          <div className="flex justify-center items-center space-x-6 mt-6 opacity-70">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-500">Live Analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-500">AI-Powered Tools</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500">24/7 Support</span>
            </div>
          </div>
        </div>
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
              tier.name === 'Pro Business' ? 'md:scale-110 md:z-10 md:shadow-2xl' : ''
            }`}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className={`
              relative overflow-hidden bg-white/90 backdrop-blur-xl border-0 shadow-xl
              transition-all duration-500 hover:shadow-2xl
              ${currentTier === tier.name ? 'ring-2 ring-blue-500 shadow-blue-200' : ''}
              ${tier.name === 'Pro Business' ? 'border-2 border-purple-200 shadow-purple-100' : ''}
            `}>
              {tier.name === 'Pro Business' && (
                <div className="absolute -top-px left-0 right-0">
                  <div className="h-px bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                      ⭐ Most Popular
                    </div>
                  </div>
                </div>
              )}

              <CardContent className="p-8">
                {/* Tier Header */}
                <div className="text-center mb-8">
                  <div className={`
                    inline-flex items-center justify-center w-20 h-20 rounded-3xl 
                    bg-gradient-to-r ${getTierGradient(tier.name)} mb-6
                    shadow-xl transform hover:scale-110 transition-transform duration-300
                  `}>
                    <div className="text-white text-xl">
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
                    {tier.name === 'Pro Starter' && 'Perfect for getting started with professional tools'}
                    {tier.name === 'Pro Business' && 'Best for growing professionals with advanced needs'}
                    {tier.name === 'Pro Elite' && 'Ultimate professional toolkit with all premium features'}
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