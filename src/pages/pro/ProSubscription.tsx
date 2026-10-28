// src/pages/pro/ProSubscription.tsx
// TalentXcel Career Accelerator Subscriptions — Live Razorpay Integration

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  FileCheck, 
  Bot, 
  Award,
  Loader2,
  Crown
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useTieredAccess } from '@/hooks/useTieredAccess';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { loadRazorpayScript } from '@/services/payment/razorpayProvider';

interface PlanDefinition {
  id: string;
  tier: 'Starter' | 'Pro' | 'Premium';
  name: string;
  price: number;
  badge?: string;
  popular?: boolean;
  tagline: string;
  features: string[];
  limits: {
    ats: string;
    tailoring: string;
    interview: string;
  };
}

const CAREER_PLANS: PlanDefinition[] = [
  {
    id: 'career-starter',
    tier: 'Starter',
    name: 'Career Starter',
    price: 199,
    tagline: 'Essential tools to optimize your resume and get noticed.',
    features: [
      '5 ATS resume scans per month',
      '2 AI job-tailored resume rewrites',
      '20 practice interview questions with answers',
      'Core keyword & format gap analysis',
      'Export to ATS-friendly PDF',
    ],
    limits: {
      ats: '5 / month',
      tailoring: '2 / month',
      interview: '20 questions',
    },
  },
  {
    id: 'career-pro',
    tier: 'Pro',
    name: 'Career Pro',
    price: 499,
    popular: true,
    badge: 'Most Popular',
    tagline: 'Full power accelerator for active job seekers looking to land offers fast.',
    features: [
      'Unlimited ATS resume checks',
      '15 AI job-tailored resume rewrites / month',
      'Full Interactive AI Interview Simulator',
      'In-depth competitive ATS benchmarking',
      'ATS score & missing keyword highlights',
      'Priority customer & career support',
    ],
    limits: {
      ats: 'Unlimited',
      tailoring: '15 / month',
      interview: 'Full Simulator',
    },
  },
  {
    id: 'career-premium',
    tier: 'Premium',
    name: 'Career Premium',
    price: 999,
    badge: 'Executive',
    tagline: 'Unrestricted access for senior professionals and executives.',
    features: [
      'Unlimited ATS resume checks',
      'Unlimited AI resume tailorings',
      'Advanced executive interview simulations',
      'Deep AI resume rewrites with metric quantification',
      'Dedicated career advisory priority queue',
      'Early access to newly released career AI models',
    ],
    limits: {
      ats: 'Unlimited',
      tailoring: 'Unlimited',
      interview: 'Advanced Simulations',
    },
  },
];

export const ProSubscription: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentTier, quota, refreshFeatures } = useTieredAccess();
  const { toast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: PlanDefinition) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please log in to choose a Career plan.",
      });
      navigate(`/auth/login?redirect=/pro/subscription`);
      return;
    }

    setProcessingPlan(plan.id);

    try {
      // 1. Load Razorpay SDK
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady) {
        throw new Error("Unable to load secure Razorpay payment checkout. Please check your internet connection.");
      }

      // 2. Create Order via Edge Function
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
          },
        }
      );

      if (orderError || !orderData) {
        throw new Error(orderError?.message || "Failed to create payment order. Please try again.");
      }

      // 3. Demo Mode Handler (if Razorpay live credentials not configured yet)
      if (orderData.demo) {
        toast({
          title: "Demo Mode Enabled",
          description: "Processing order in sandbox demo mode...",
        });
        
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
          'razorpay-verify-payment',
          {
            body: {
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: `demo_pay_${Date.now()}`,
              razorpay_signature: 'demo_signature',
              tier: plan.tier,
              planName: plan.name,
            },
          }
        );

        if (verifyError || !verifyData?.success) {
          throw new Error(verifyError?.message || "Verification failed");
        }

        await refreshFeatures();
        toast({
          title: "🎉 Plan Activated!",
          description: `You are now on the ${plan.name} plan.`,
        });
        navigate('/resume/ats-check');
        return;
      }

      // 4. Live Razorpay Modal Flow
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TalentXcel',
        description: `${plan.name} Subscription`,
        image: '/favicon.ico',
        order_id: orderData.orderId,
        prefill: {
          email: user.email || '',
        },
        theme: {
          color: '#2563eb',
        },
        handler: async (response: any) => {
          try {
            setProcessingPlan(plan.id);
            toast({
              title: "Verifying payment...",
              description: "Confirming cryptographic signature with server.",
            });

            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'razorpay-verify-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  tier: plan.tier,
                  planName: plan.name,
                },
              }
            );

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyError?.message || "Payment signature verification failed.");
            }

            await refreshFeatures();

            toast({
              title: "🎉 Welcome to Career Accelerator!",
              description: `Your ${plan.name} subscription is active. Quotas have been applied to your account.`,
              duration: 6000,
            });

            navigate('/resume/ats-check');
          } catch (verifyErr: any) {
            console.error("Verification error:", verifyErr);
            toast({
              title: "Payment Verification Error",
              description: verifyErr?.message || "Please contact support if amount was deducted.",
              variant: "destructive",
            });
          } finally {
            setProcessingPlan(null);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPlan(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        toast({
          title: "Payment Failed",
          description: resp.error?.description || "Transaction was not completed.",
          variant: "destructive",
        });
        setProcessingPlan(null);
      });

      rzp.open();

    } catch (err: any) {
      console.error("Subscription initiation error:", err);
      toast({
        title: "Checkout Error",
        description: err?.message || "Could not launch checkout. Please try again.",
        variant: "destructive",
      });
      setProcessingPlan(null);
    }
  };

  const isCurrentPlan = (tier: string) => {
    const normalized = tier.toLowerCase();
    if (normalized === 'starter' && currentTier === 'basic') return true;
    if (normalized === 'pro' && currentTier === 'pro') return true;
    if (normalized === 'premium' && currentTier === 'enterprise') return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <Helmet>
        <title>Career Accelerator Plans | TalentXcel</title>
        <meta 
          name="description" 
          content="Accelerate your job search with AI-powered ATS resume optimization, tailored rewrites, and interview preparation." 
        />
        <link rel="canonical" href="https://talentxcel.in/pro/subscription" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="hover:bg-white text-gray-600 hover:text-gray-900 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-slate-500 font-medium">
              Encrypted Razorpay Checkout • Cancel Anytime
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="bg-blue-600/10 text-blue-700 hover:bg-blue-600/15 mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            Career Accelerator
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Invest in Your Next Career Move
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Get more interviews with ATS-optimized resumes, AI tailored applications, and mock interview coaching.
          </p>

          {/* Current Status banner if subscribed */}
          {currentTier !== 'free' && (
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-800">
              <Crown className="w-4 h-4 text-emerald-600" />
              <span>Current Active Plan: <strong className="capitalize">{currentTier === 'basic' ? 'Starter' : currentTier}</strong></span>
              {quota && (
                <span className="text-xs text-emerald-700">
                  (ATS Checks Used: {quota.ats_check.used}{quota.ats_check.limit > 0 ? `/${quota.ats_check.limit}` : ' (Unlimited)'})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch mb-16">
          {CAREER_PLANS.map((plan) => {
            const isCurrent = isCurrentPlan(plan.tier);
            const isProcessing = processingPlan === plan.id;

            return (
              <Card 
                key={plan.id}
                className={`relative flex flex-col justify-between transition-all duration-200 ${
                  plan.popular 
                    ? 'border-2 border-blue-600 shadow-xl bg-white scale-105 z-10' 
                    : 'border border-slate-200 shadow-sm bg-white/80 hover:shadow-md'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      plan.popular 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-slate-900 text-white'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-500 min-h-[40px] mt-1">
                      {plan.tagline}
                    </CardDescription>

                    <div className="pt-4 pb-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-slate-900">₹{plan.price}</span>
                        <span className="text-slate-500 text-sm font-medium">/ month</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Billed monthly • GST included</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Key limits pills */}
                    <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 text-xs text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-500">ATS Scans:</span>
                        <span className="font-semibold text-slate-900">{plan.limits.ats}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Resume Tailoring:</span>
                        <span className="font-semibold text-slate-900">{plan.limits.tailoring}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Interview Prep:</span>
                        <span className="font-semibold text-slate-900">{plan.limits.interview}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Included Features:
                      </p>
                      <ul className="space-y-2.5">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start text-sm text-slate-700 gap-2">
                            <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </div>

                <CardFooter className="pt-6">
                  <Button 
                    className={`w-full py-6 font-semibold text-base transition-all ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                    disabled={isCurrent || isProcessing}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Setting up order...
                      </span>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Trust & Guarantee Section */}
        <div className="border-t border-slate-200/80 pt-12 pb-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-xl bg-white/60 border border-slate-100">
              <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-900 mb-1">Instant Activation</h4>
              <p className="text-xs text-slate-500">
                Your ATS and Resume quotas unlock immediately upon verified payment.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/60 border border-slate-100">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-900 mb-1">Bank-Grade Security</h4>
              <p className="text-xs text-slate-500">
                256-bit SSL encrypted checkout powered by Razorpay. Card details are never stored.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/60 border border-slate-100">
              <Bot className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-slate-900 mb-1">Advanced AI Models</h4>
              <p className="text-xs text-slate-500">
                Powered by state-of-the-art Google Gemini models tailored for recruitment.
              </p>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-center pt-4 text-xs text-slate-500">
          <p>
            Need help choosing? <Link to="/contact" className="underline hover:text-slate-800">Contact our career team</Link> or view our{' '}
            <Link to="/pro/subscription-policy" className="underline hover:text-slate-800">Subscription & Refund Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};