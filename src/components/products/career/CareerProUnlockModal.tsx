// src/components/products/career/CareerProUnlockModal.tsx
// Advance Pro Version Monetization Modal for Career Pathfinder (One-Time ₹399 to ₹999 Access)
// Multi-Dimensional dynamic role adaptation (Job, Industry, Experience Level, Location)

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
  FileText,
  Star,
  Users,
  MapPin,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface CareerProUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: string;
  currentRole?: string;
  targetCtc?: string | number;
  experienceLevel?: string;
  location?: string;
  onSuccessUnlock?: (tier: string) => void;
}

export const CareerProUnlockModal: React.FC<CareerProUnlockModalProps> = ({
  isOpen,
  onClose,
  targetRole = 'Senior Specialist / Leader',
  currentRole = 'Current Professional',
  targetCtc,
  experienceLevel,
  location,
  onSuccessUnlock
}) => {
  const [selectedTier, setSelectedTier] = useState<'starter' | 'accelerator' | 'master'>('accelerator');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const formattedTargetCtc = typeof targetCtc === 'number' 
    ? `₹${targetCtc}L` 
    : (targetCtc || 'Market Leading');

  const tiers = {
    starter: {
      id: 'starter',
      name: 'Starter Blueprint Pass',
      price: 399,
      badge: 'Single Transition',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      description: `Complete execution workspace & recruiter kit for ${targetRole} (${formattedTargetCtc})`,
      features: [
        `Interactive 16-Week Live Milestone Tracker for ${targetRole}`,
        `Production Templates Kit (PRDs, financial models, architecture & GTM playbooks)`,
        `25+ Real Interview Questions & STAR High-Scoring Model Answers for ${targetRole}`,
        `ATS Resume Keyword Matrix & 15 Quantified Achievement Bullets`,
        `Direct Recruiter Priority Placement Badge on JobMatch OS`,
        `Exportable High-Resolution PDF Blueprint & Execution Checklist`
      ]
    },
    accelerator: {
      id: 'accelerator',
      name: 'Pro Career Accelerator',
      price: 699,
      badge: 'Most Popular • 40% Off',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      description: `5 Complete Career Transition Workspaces + AI Interview Coach for ${targetRole}`,
      features: [
        `Full access to 5 Complete Career Blueprints across any of the 16 Global Industries`,
        `Role-Specific Working Deliverables (Excel Financial Models, Headcount Budgets & Strategy Decks)`,
        `50+ Real Executive & Behavioral Questions with Proven STAR Frameworks`,
        `AI Skill-Gap Diagnostic Test on SkillPods with verified score certificate`,
        `Unlimited AI Mock Interview Coach Practice Sessions with real-time audio/text feedback`,
        `Direct Priority Recruiter Routing to 1,200+ hiring partner employers on JobMatch OS`,
        `Lifetime updates as ${location || 'national'} hiring benchmarks evolve`
      ]
    },
    master: {
      id: 'master',
      name: 'Lifetime All-Industry Suite',
      price: 999,
      badge: 'Best Value • Full Platform',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      description: 'Unlimited access to all 152+ transitions across 16 global industries',
      features: [
        'Unlimited Lifetime Access to all 152+ Career Blueprints & Executive Workspaces',
        'Full executive kits for HR Managers (₹10L+), VP Sales (₹28L+), CFOs, Plant Heads & Tech Leads',
        'Unlimited Custom AI Career Roadmap Generations for any role, salary, and location',
        'Full Suite of 150+ Downloadable Production Templates, Repos, Financial Models & Pitch Decks',
        'Unlimited AI Interview Prep Coach with Voice & High-Stakes Scenario Simulations',
        'Priority Talent Placement & Direct Intro to 1,200+ hiring partners on JobMatch OS',
        `1-on-1 AI Executive Career Mentor tailored to your target compensation of ${formattedTargetCtc}`
      ]
    }
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    const tier = tiers[selectedTier];
    
    setTimeout(() => {
      setIsProcessing(false);
      localStorage.setItem('talentxcel_career_pro_unlocked', 'true');
      localStorage.setItem('talentxcel_career_pro_tier', tier.name);
      localStorage.setItem('talentxcel_career_pro_price', tier.price.toString());
      
      toast.success(`🎉 Career Pathfinder Pro Unlocked (${tier.name})! Welcome to the Advance Suite.`);
      if (onSuccessUnlock) {
        onSuccessUnlock(selectedTier);
      }
      onClose();
    }, 1100);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]"
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
              ADVANCE PRO VERSION
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              One-Time Fee • No Recurring Charges
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Unlock Career Pathfinder Pro
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Get instant lifetime access to step-by-step milestone execution blueprints, role-specific STAR interview kits, and verified recruiter dispatch.
          </p>

          {/* Active Context Chip */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 backdrop-blur-xs">
            <div className="flex items-center gap-1 text-slate-300">
              <Briefcase className="w-3 h-3 text-blue-400" />
              <span>Target Role: <strong className="text-white">{targetRole}</strong></span>
            </div>
            <span className="text-slate-500">•</span>
            <div className="flex items-center gap-1 text-slate-300">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Target CTC: <strong className="text-emerald-300">{formattedTargetCtc}</strong></span>
            </div>
            {location && (
              <>
                <span className="text-slate-500">•</span>
                <div className="flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>Location: <strong className="text-amber-300">{location}</strong></span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Plan Tiers Switcher */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 select-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.keys(tiers) as Array<keyof typeof tiers>).map((tierKey) => {
              const tier = tiers[tierKey];
              const isSelected = selectedTier === tierKey;
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tierKey)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50/40 shadow-md ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                        {tier.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#111827] mt-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-2xl font-black text-[#111827]">₹{tier.price}</span>
                      <span className="text-[11px] text-slate-500 font-medium">one-time</span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                      {tier.description}
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

          {/* Features Checklist for Selected Tier */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                Included with {tiers[selectedTier].name}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                ₹{tiers[selectedTier].price} Lifetime Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {tiers[selectedTier].features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              256-bit Secure Encrypted Checkout
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              Instant Blueprint Activation
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3 text-blue-500" />
              Exportable PDF Roadmaps & Excel Models
            </span>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-500">Pay Once, Own Forever</div>
            <div className="text-lg font-black text-slate-900">
              ₹{tiers[selectedTier].price}
              <span className="text-xs text-slate-500 font-normal ml-1">total for {tiers[selectedTier].name}</span>
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
                  <span>Activating Pro Access...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Pay ₹{tiers[selectedTier].price} & Unlock Now</span>
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
