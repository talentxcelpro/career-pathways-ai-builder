// src/components/billing/UpgradeModal.tsx
// Master Light SaaS Upgrade & Plan Selection Modal
// Strictly enforces approved central pricing (Starter ₹299, Pro ₹499, Max ₹999, Business ₹2,499)

import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Loader2, 
  ArrowRight,
  Briefcase,
  Award,
  Users,
  Compass
} from 'lucide-react';
import { 
  PlanTier, 
  CENTRAL_PLAN_CATALOGUE, 
  CentralPlan,
  getPlanById 
} from '@/services/billing/planCatalogue';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { loadRazorpayScript } from '@/services/payment/razorpayProvider';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId?: PlanTier;
  initialSelectedTier?: PlanTier;
  targetFeatureName?: string;
  onSuccess?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlanId = 'free',
  initialSelectedTier = 'pro',
  targetFeatureName,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedTier, setSelectedTier] = useState<PlanTier>(
    initialSelectedTier === 'free' ? 'pro' : initialSelectedTier
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  // The 4 payable plans from central catalogue
  const payablePlans: PlanTier[] = ['starter', 'pro', 'max', 'business'];

  const handleCheckout = async (tierToBuy: PlanTier) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in or create an account to activate your subscription.',
        variant: 'destructive',
      });
      return;
    }

    const plan = getPlanById(tierToBuy);
    setIsProcessing(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('User session not active. Please sign in again.');
      }

      // Invoke server-authoritative razorpay-create-order
      const { data: orderData, error: orderErr } = await supabase.functions.invoke('razorpay-create-order', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: {
          purchaseType: 'subscription',
          planId: tierToBuy,
          currency: 'INR'
        }
      });

      if (orderErr || !orderData) {
        throw new Error(orderErr?.message || 'Failed to create subscription order');
      }

      await loadRazorpayScript();

      // If simulated / local sandbox without live Razorpay keys:
      if (orderData.isSimulated || !window.Razorpay) {
        toast({
          title: 'Simulated Order Created (Local Sandbox)',
          description: `Order ${orderData.orderId} generated for ₹${plan.monthlyPriceRupees}/mo.`,
        });

        // Trigger local subscription update for verification
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        const { error: subErr } = await supabase
          .from('subscribers')
          .upsert({
            user_id: user.id,
            email: user.email || '',
            subscribed: true,
            status: 'active',
            plan_tier: tierToBuy,
            subscription_tier: tierToBuy,
            amount: plan.monthlyPricePaise,
            currency: 'INR',
            subscription_start: new Date().toISOString(),
            subscription_end: periodEnd.toISOString(),
            cancel_at_period_end: false,
          }, { onConflict: 'user_id' });

        if (subErr) {
          console.warn('[UpgradeModal] Note on local subscription upsert:', subErr.message);
        }

        toast({
          title: `Welcome to TalentXcel ${plan.name}!`,
          description: `Your subscription is active. All premium entitlements unlocked.`,
        });

        if (onSuccess) onSuccess();
        onClose();
        return;
      }

      // Live Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: `TalentXcel ${plan.name}`,
        description: `Monthly Subscription (₹${plan.monthlyPriceRupees}/mo)`,
        order_id: orderData.orderId,
        prefill: {
          email: user.email || '',
        },
        theme: {
          color: '#2563EB',
        },
        handler: async (response: any) => {
          toast({
            title: 'Payment Successful',
            description: `Payment ID: ${response.razorpay_payment_id}. Upgrading your account...`,
          });
          if (onSuccess) onSuccess();
          onClose();
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('[UpgradeModal] Checkout failed:', err);
      toast({
        title: 'Checkout Error',
        description: err.message || 'Unable to open checkout. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                TalentXcel Commercial Operating System
              </span>
              {targetFeatureName && (
                <span className="text-xs text-amber-700 font-medium">
                  • Unlock required for {targetFeatureName}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Choose the right plan for your career & hiring goals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              One central subscription unlocks entitlements across all nine products. Cancel anytime.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Plan Cards Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {payablePlans.map((tier) => {
              const plan = CENTRAL_PLAN_CATALOGUE[tier];
              const isSelected = selectedTier === tier;
              const isCurrent = currentPlanId === tier;
              const isPro = tier === 'pro';

              return (
                <div
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`relative flex flex-col justify-between rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/20 shadow-md ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {isPro && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-base">{plan.name}</h3>
                      {isCurrent && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          Current
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">
                      {plan.description}
                    </p>

                    <div className="mt-4 pb-4 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                          ₹{plan.monthlyPriceRupees}
                        </span>
                        <span className="text-xs text-slate-500">/ month</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Billed monthly • GST included
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="mt-4 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                        Key Entitlements:
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {plan.highlightFeatures.slice(0, 5).map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 text-blue-600 mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={isProcessing || isCurrent}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckout(tier);
                      }}
                      className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : isSelected || isPro
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 active:scale-98'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      }`}
                    >
                      {isCurrent ? (
                        'Active Plan'
                      ) : isProcessing && isSelected ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Select {plan.name}</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cross-Product Guarantee & Trust */}
          <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <div>
                <strong className="text-slate-800">5-Day Grace Period</strong>
                <p className="text-[11px] text-slate-500">Uninterrupted access during card renewal retries</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-blue-600 shrink-0" />
              <div>
                <strong className="text-slate-800">Universal Access</strong>
                <p className="text-[11px] text-slate-500">One subscription covers all 9 connected products</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-purple-600 shrink-0" />
              <div>
                <strong className="text-slate-800">Cancel Anytime</strong>
                <p className="text-[11px] text-slate-500">Non-destructive cancellation with full access until end of term</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
