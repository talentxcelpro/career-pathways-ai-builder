// src/components/products/payscale/PayScaleProModal.tsx
// Monetization & Subscription Upgrade Modal for TalentXcel PayScale
// Tiers: Free (₹0), Pro (₹199/mo), Premium (₹499/mo), Enterprise (₹4,999/mo)

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Unlock, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Award, 
  X,
  CreditCard,
  FileSpreadsheet,
  Building2,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface PayScaleProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessUnlock?: (tier: string) => void;
}

export const PayScaleProModal: React.FC<PayScaleProModalProps> = ({
  isOpen,
  onClose,
  onSuccessUnlock
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium' | 'enterprise'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const plans = {
    pro: {
      id: 'pro',
      name: 'PayScale Pro',
      badge: 'Individual Specialist',
      badgeColor: 'bg-blue-50 text-[#2563EB] border-blue-200',
      priceMonthly: 199,
      priceAnnual: 1499,
      description: 'Advanced in-hand salary calculations, unlimited tax scenarios, payslip generator and AI Offer Negotiation Coach.',
      features: [
        'Detailed CTC to Net In-Hand breakdown with customizable allowances',
        'Old vs New Regime Section 115BAC tax optimization reports',
        'Official Printable & PDF Monthly Payslip Generator with custom company logo',
        'AI Salary Negotiation Coach: 4 tailored counter-offer email scripts',
        'EPF, NPS & 50/30/20 Wealth Accumulation projections',
        'Exportable Executive CTC Structure and Tax Reports (PDF / Excel)'
      ]
    },
    premium: {
      id: 'premium',
      name: 'Career & Market Premium',
      badge: 'Most Popular • High Growth',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      priceMonthly: 499,
      priceAnnual: 3999,
      description: 'Comprehensive market compensation percentiles, career salary jump navigator and direct job matching.',
      features: [
        'Everything in PayScale Pro included',
        'P10, P25, P50, P75, P90 Salary Percentiles across 16 Industries',
        'City-wise compensation heatmaps (Bangalore, Pune, Hyderabad, Dubai/GCC)',
        'Career Salary Growth Navigator: Bridges skills to target compensation bands',
        'Direct Priority Job Application Dispatch on TalentXcel Jobs',
        'Dedicated 1-on-1 AI Compensation Advisor with unlimited prompts'
      ]
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise PayScale',
      badge: 'For Employers & HR Teams',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      priceMonthly: 4999,
      priceAnnual: 44999,
      description: 'Full compensation bands management (L1–L7), department budget modeling, and increment/appraisal cycle planner.',
      features: [
        'Multi-Grade Compensation Bands Matrix (Grades L1 to Executive)',
        'Department-wise payroll analytics (Engineering, Product, Sales, Ops)',
        'Annual Increment & Merit Appraisal Matrix Planner (Rating vs Compa-ratio)',
        'Internal Pay Equity & Gender/Tenure Parity Compliance Auditing',
        'Employee Flight Risk Radar based on live market salary differentials',
        'Recruiter Compensation Intelligence: Candidate offer competitiveness scoring',
        'Bulk Salary Increment Notification Letters with corporate branding'
      ]
    }
  };

  const activePlan = plans[selectedPlan];
  const price = billingCycle === 'monthly' ? activePlan.priceMonthly : activePlan.priceAnnual;

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      localStorage.setItem('talentxcel_payscale_pro_unlocked', 'true');
      localStorage.setItem('talentxcel_payscale_pro_tier', activePlan.name);
      toast.success(`🎉 ${activePlan.name} Activated! Welcome to TalentXcel Salary Intelligence.`);
      if (onSuccessUnlock) {
        onSuccessUnlock(selectedPlan);
      }
      onClose();
    }, 1100);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B0F19] via-[#0F172A] to-[#1E1B4B] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              PAYSCALE SUITE MONETIZATION
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Individual & Enterprise SaaS Plans
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Unlock Full Salary Intelligence & Compensation Planning
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Choose the right plan to master your take-home pay, benchmark compensation against verified industry percentiles, or streamline employer salary bands.
          </p>

          {/* Billing Switcher */}
          <div className="mt-4 inline-flex items-center p-1 bg-white/10 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                billingCycle === 'annual' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">SAVE 35%</span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {(Object.keys(plans) as Array<keyof typeof plans>).map((planKey) => {
              const plan = plans[planKey];
              const isSelected = selectedPlan === planKey;
              const planPrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(planKey)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50/40 shadow-md ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>

                    <h3 className="font-bold text-sm text-[#111827] mt-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black text-[#111827]">₹{planPrice.toLocaleString('en-IN')}</span>
                      <span className="text-[11px] text-slate-500 font-medium">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-blue-600">
                      {isSelected ? 'Selected Plan' : 'Click to Select'}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-[#2563EB] bg-[#2563EB]' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features Checklist for Selected Plan */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                Included with {activePlan.name}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                ₹{price.toLocaleString('en-IN')} {billingCycle === 'monthly' ? 'per Month' : 'per Year'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {activePlan.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-500">Plan Selected</div>
            <div className="text-lg font-black text-slate-900">
              ₹{price.toLocaleString('en-IN')}
              <span className="text-xs text-slate-500 font-normal ml-1">total for {activePlan.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="text-xs font-semibold px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Activating Subscription...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Activate {activePlan.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
