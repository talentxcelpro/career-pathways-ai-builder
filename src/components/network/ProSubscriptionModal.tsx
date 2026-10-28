// src/components/network/ProSubscriptionModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { loadRazorpayScript } from "@/services/payment/razorpayProvider";
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
  FileText,
  Loader2
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
  tier: 'Starter' | 'Pro' | 'Premium';
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
    id: 'career-starter',
    tier: 'Starter',
    name: 'Starter',
    price: 199,
    originalPrice: 299,
    description: 'Essential tools for active job search',
    features: [
      { name: '5 ATS resume scans / mo', included: true, icon: <FileText className="h-4 w-4" /> },
      { name: '2 AI resume tailorings / mo', included: true, icon: <Sparkles className="h-4 w-4" /> },
      { name: '20 interview questions & tips', included: true, icon: <MessageSquare className="h-4 w-4" /> },
      { name: 'Service page creation', included: true, icon: <TrendingUp className="h-4 w-4" /> },
      { name: 'Full interview simulator', included: false, icon: <Zap className="h-4 w-4" /> },
      { name: 'Priority recruiter matching', included: false, icon: <Users className="h-4 w-4" /> },
    ],
    buttonText: 'Choose Starter',
    buttonVariant: 'outline'
  },
  {
    id: 'career-pro',
    tier: 'Pro',
    name: 'Career Pro',
    price: 499,
    originalPrice: 799,
    description: 'Most popular for serious candidates',
    features: [
      { name: 'Unlimited ATS resume scans', included: true, icon: <FileText className="h-4 w-4" /> },
      { name: '15 AI resume tailorings / mo', included: true, icon: <Sparkles className="h-4 w-4" /> },
      { name: 'Full AI interview simulator', included: true, icon: <Zap className="h-4 w-4" /> },
      { name: 'Service page creation & boost', included: true, icon: <TrendingUp className="h-4 w-4" /> },
      { name: 'Direct employer messaging', included: true, icon: <MessageSquare className="h-4 w-4" /> },
      { name: 'Priority applicant badges', included: true, icon: <Star className="h-4 w-4" /> },
    ],
    popular: true,
    buttonText: 'Get Career Pro',
    buttonVariant: 'default'
  },
  {
    id: 'career-premium',
    tier: 'Premium',
    name: 'Executive Premium',
    price: 999,
    originalPrice: 1499,
    description: 'Unrestricted access for leadership roles',
    features: [
      { name: 'Everything in Career Pro', included: true, icon: <Check className="h-4 w-4" /> },
      { name: 'Unlimited AI resume tailorings', included: true, icon: <Sparkles className="h-4 w-4" /> },
      { name: 'Executive interview simulations', included: true, icon: <Crown className="h-4 w-4" /> },
      { name: 'Priority talent directory listing', included: true, icon: <ShoppingCart className="h-4 w-4" /> },
      { name: 'Dedicated career advisory support', included: true, icon: <Users className="h-4 w-4" /> },
      { name: 'Early access to newly released tools', included: true, icon: <Zap className="h-4 w-4" /> },
    ],
    buttonText: 'Go Premium',
    buttonVariant: 'outline'
  }
];

export const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubscribe = async (plan: Plan) => {
    setLoading(plan.id);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to subscribe to a Career plan.",
          variant: "destructive"
        });
        return;
      }

      // Load Razorpay checkout script
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error("Unable to load secure Razorpay checkout.");
      }

      // 1. Create order via server Edge Function
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'razorpay-create-order',
        {
          body: {
            amount: plan.price,
            currency: 'INR',
            tier: plan.tier,
            planId: plan.id,
            serviceId: 'career_accelerator',
            packageType: plan.name,
          }
        }
      );

      if (orderError || !orderData) {
        throw new Error(orderError?.message || "Failed to create payment order");
      }

      // Handle demo mode fallback
      if (orderData.demo) {
        const { data: verifyData } = await supabase.functions.invoke(
          'razorpay-verify-payment',
          {
            body: {
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `demo_${Date.now()}`,
              razorpay_signature: 'demo_signature',
              tier: plan.tier,
              planName: plan.name,
            }
          }
        );

        toast({
          title: "🎉 Plan Activated!",
          description: `Your ${plan.name} plan is now active.`,
        });
        onSuccess?.();
        onClose();
        return;
      }

      // 2. Open live Razorpay modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TalentXcel',
        description: `${plan.name} Subscription`,
        image: '/favicon.ico',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            setLoading(plan.id);

            // Server-side verification of payment signature
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'razorpay-verify-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  tier: plan.tier,
                  planName: plan.name,
                }
              }
            );

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyError?.message || "Payment signature verification failed.");
            }

            toast({
              title: "🎉 Welcome to TalentXcel!",
              description: `Your ${plan.name} plan is now active. Quotas have been applied.`,
              duration: 5000
            });

            onSuccess?.();
            onClose();
          } catch (error: any) {
            console.error('Subscription verification error:', error);
            toast({
              title: "Verification Error",
              description: error?.message || "Your payment was processed. Please refresh in a moment.",
              variant: "destructive"
            });
          } finally {
            setLoading(null);
          }
        },
        prefill: {
          email: user.email || ''
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: () => setLoading(null)
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function(resp: any) {
        toast({
          title: "Payment Failed",
          description: resp.error?.description || "Transaction failed",
          variant: "destructive"
        });
        setLoading(null);
      });
      razorpay.open();

    } catch (error: any) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive"
      });
      setLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <DialogTitle className="text-2xl font-bold">Upgrade Your Career Plan</DialogTitle>
          </div>
          <p className="text-muted-foreground">
            Get unlimited ATS scans, job-tailored resume rewrites, and AI interview coaching
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative flex flex-col justify-between ${
                plan.popular 
                  ? 'border-2 border-primary shadow-lg scale-105' 
                  : 'border border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                <div className="mt-4 flex items-baseline justify-center gap-2">
                  <span className="text-3xl font-bold">₹{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                  {plan.originalPrice && (
                    <span className="text-sm line-through text-muted-foreground">
                      ₹{plan.originalPrice}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center gap-2 text-sm ${
                        feature.included ? 'text-foreground' : 'text-muted-foreground/50'
                      }`}
                    >
                      <span className={feature.included ? 'text-primary' : 'text-muted-foreground/30'}>
                        {feature.included ? <Check className="h-4 w-4" /> : <div className="h-4 w-4" />}
                      </span>
                      <span>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <div className="p-6 pt-0">
                <Button
                  className="w-full"
                  variant={plan.buttonVariant}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading !== null}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Secure payments via Razorpay • GST included • Cancel anytime</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};