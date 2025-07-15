import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Sparkles, 
  CreditCard,
  Users,
  BarChart3,
  MessageSquare,
  TrendingUp,
  ShoppingCart,
  FileText
} from "lucide-react";

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PlanFeature {
  name: string;
  included: boolean;
  icon: React.ReactNode;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: "default" | "outline" | "destructive";
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 399,
    originalPrice: 499,
    description: 'Perfect for freelancers getting started',
    features: [
      { name: 'Service page creation', included: true, icon: <FileText className="h-4 w-4" /> },
      { name: 'Basic profile boosting', included: true, icon: <TrendingUp className="h-4 w-4" /> },
      { name: 'Direct messaging', included: true, icon: <MessageSquare className="h-4 w-4" /> },
      { name: 'Basic analytics', included: true, icon: <BarChart3 className="h-4 w-4" /> },
      { name: 'CRM tools', included: false, icon: <Users className="h-4 w-4" /> },
      { name: 'Payment integration', included: false, icon: <CreditCard className="h-4 w-4" /> },
      { name: 'Advanced AI tools', included: false, icon: <Sparkles className="h-4 w-4" /> },
    ],
    buttonText: 'Start Free Trial',
    buttonVariant: 'outline'
  },
  {
    id: 'business',
    name: 'Business',
    price: 699,
    originalPrice: 899,
    description: 'Best for growing businesses',
    features: [
      { name: 'Service page creation', included: true, icon: <FileText className="h-4 w-4" /> },
      { name: 'Priority profile boosting', included: true, icon: <TrendingUp className="h-4 w-4" /> },
      { name: 'Unlimited messaging', included: true, icon: <MessageSquare className="h-4 w-4" /> },
      { name: 'Advanced analytics', included: true, icon: <BarChart3 className="h-4 w-4" /> },
      { name: 'Complete CRM suite', included: true, icon: <Users className="h-4 w-4" /> },
      { name: 'Payment integration', included: true, icon: <CreditCard className="h-4 w-4" /> },
      { name: 'AI business tools', included: true, icon: <Sparkles className="h-4 w-4" /> },
    ],
    popular: true,
    buttonText: 'Get Business Pro',
    buttonVariant: 'default'
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 1999,
    originalPrice: 2499,
    description: 'For enterprises and agencies',
    features: [
      { name: 'Everything in Business', included: true, icon: <Star className="h-4 w-4" /> },
      { name: 'Priority marketplace listing', included: true, icon: <ShoppingCart className="h-4 w-4" /> },
      { name: 'Advanced AI toolkit', included: true, icon: <Sparkles className="h-4 w-4" /> },
      { name: 'White-label solutions', included: true, icon: <Crown className="h-4 w-4" /> },
      { name: 'Dedicated support', included: true, icon: <Users className="h-4 w-4" /> },
      { name: 'Custom integrations', included: true, icon: <Zap className="h-4 w-4" /> },
      { name: 'Multi-team management', included: true, icon: <Users className="h-4 w-4" /> },
    ],
    buttonText: 'Go Elite',
    buttonVariant: 'default'
  }
];

const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to subscribe to Pro",
          variant: "destructive"
        });
        return;
      }

      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      // Initialize Razorpay payment
      const options = {
        key: 'rzp_test_9WseLWOQEBzhaM', // Replace with your Razorpay key
        amount: plan.price * 100, // Amount in paisa
        currency: 'INR',
        name: 'TalentXcel Pro',
        description: `${plan.name} Plan Subscription`,
        image: '/favicon.ico',
        handler: async (response: any) => {
          try {
            // Call the activate function
            const { data, error } = await supabase.rpc('activate_pro_subscription', {
              p_user_id: user.id,
              p_plan_name: plan.name,
              p_price_amount: plan.price,
              p_razorpay_payment_id: response.razorpay_payment_id,
              p_duration_months: 1
            });

            if (error) throw error;

            toast({
              title: "🎉 Welcome to TalentXcel Pro!",
              description: `Your ${plan.name} plan is now active. Start building your service page!`,
              duration: 5000
            });

            onSuccess?.();
            onClose();
          } catch (error) {
            console.error('Subscription activation error:', error);
            toast({
              title: "Payment processed, activation pending",
              description: "Your payment was successful. Pro features will be activated shortly.",
              variant: "destructive"
            });
          }
        },
        prefill: {
          name: user.email,
          email: user.email
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold">Upgrade to TalentXcel Pro</span>
            </div>
            <p className="text-sm text-gray-600 font-normal">
              Unlock powerful features to promote your services and grow your business
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-2 border-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-3xl font-bold">₹{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      ₹{plan.originalPrice}
                    </span>
                  )}
                  <span className="text-sm text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 ${feature.included ? 'text-green-600' : 'text-gray-400'}`}>
                        {feature.included ? <Check className="h-4 w-4" /> : feature.icon}
                      </div>
                      <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.buttonVariant}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Why Choose Pro?</h3>
          </div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Get discovered by more clients with boosted profiles</li>
            <li>• Showcase your services with professional pages</li>
            <li>• Access advanced CRM tools to manage clients</li>
            <li>• Use AI-powered business tools for growth</li>
            <li>• Get priority support and exclusive features</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProSubscriptionModal;